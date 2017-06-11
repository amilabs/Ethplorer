ethplorerWidget = {
    // Ethplorer API URL
    api: 'https://api.ethplorer.io',

    // Ethplorer URL
    url: 'https://ethplorer.io',

    // Widget types
    Type: {},

    // Add Google loader for chart widgets
    addGoogleLoader: false,

    chartWidgets: [],

    cssVersion: 8,

    // Widget initialization
    init: function(selector, type, options, templates){
        ethplorerWidget.fixPath();
        options = options || {};
        templates = templates || {};
        type = type || 'tokenHistory';
        var widgetOptions = $.extend(true, {}, options);
        if(widgetOptions.onLoad) delete widgetOptions.onLoad;
        options.widgetOptions = widgetOptions;
        options.widgetType = type;
        if('undefined' === typeof(jQuery)){
            console.error('Cannot initialize Ethplorer widget: jQuery not found.');
            console.log('Add next string in the <head> section of the page:');
            console.log('<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.2/jquery.min.js"></script>');
            return;
        }
        if(type == 'tokenHistoryGrouped'){
            ethplorerWidget.addGoogleLoader = true;
        }
        var el = $(selector);
        if(!el.length){
            console.error('Cannot initialize Ethplorer widget: element ' + selector + ' not found.');
            return;
        }
        if('undefined' === ethplorerWidget.eventsAdded){
            $(window).resize(ethplorerWidget.fixTilda);
            ethplorerWidget.eventsAdded = true;
        }
        if('undefined' !== typeof(ethplorerWidget.Type[type])){
            return new ethplorerWidget.Type[type](el, options, templates);
        }else{
            console.error('Cannot initialize Ethplorer widget: invalid widget type "' + type + '".');
        }
    },
    loadScript: function(url, callback){
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        script.onreadystatechange = callback;
        script.onload = callback;
        head.appendChild(script);
    },
    addStyles: function(){
        ethplorerWidget.fixPath();
        var linkElem = document.createElement('link');
        linkElem.setAttribute("rel", 'stylesheet');
        linkElem.setAttribute("type", 'text/css');
        linkElem.setAttribute("href", ethplorerWidget.api + '/widget.css?v=' + ethplorerWidget.cssVersion);
        document.getElementsByTagName("head")[0].appendChild(linkElem);
    },
    loadGoogleCharts: function(){
        if(google && google.charts){
            google.charts.load('current', {packages: ['corechart']});

            if(ethplorerWidget.chartWidgets && ethplorerWidget.chartWidgets.length)
                for(var i=0; i<ethplorerWidget.chartWidgets.length; i++)
                        ethplorerWidget.chartWidgets[i].load();
        }
    },
    appendEthplorerLink: function(obj){
        var host = ethplorerWidget.url.split('//')[1];
        var divLink = '<div style="text-align:center;font-size:11px;padding-top:10px;padding-bottom:4px;">';
        if((document.location.host !== host) && (document.location.host.indexOf("amilabs.cc") < 0)){
            obj.el.append(divLink + '<a class="tx-link" href="https://ethplorer.io/widgets" target="_blank">Ethplorer.io</a></a></div>');
        }else if('undefined' !== typeof(obj.options.getCode) && obj.options.getCode){
            var divLink = '<div style="text-align:center;font-size:16px;padding-top:10px;padding-bottom:4px;">';
            var popupId = obj.el.attr('id') + '-code';
            obj.el.append(divLink + '<a class="widget-code-link" href="javascript:void(0)" onclick="ethplorerWidget.getWidgetCode(this);">Get widget code</a></div>');
            obj.el.find('.widget-code-link').data("widget", obj);
            $("body").append('<div id="' + popupId + '" title="Widget code"></div>');
            $("#" + popupId).dialog({
                'autoOpen': false,
                'resizable': false,
                'width': $(window).width() / 2,
                'height': 'auto',
                'open': function(){
                    $(this).parents(".ui-dialog:first").find(".ui-dialog-content").click(function(){
                        ethplorerWidget.Utils.selectText(popupId);
                    });
                }
            }).css("font-size", "12px");
        }
    },
    getWidgetCode: function(obj){
        var widget = $(obj).data().widget,
            cr = "\n",
            id = widget.el.attr('id'),
            popupId = id + '-code',
            widgetOptions = $.extend(true, {}, widget.options.widgetOptions || {});

        if('undefined' !== typeof(widgetOptions.getCode)) delete widgetOptions.getCode;

        var widgetCode = '1. Add jQuery in the HEAD section of your page (if not present):' + cr;
        widgetCode += '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.2/jquery.min.js"></script>' + cr + cr;
        widgetCode += '2. Put code displayed below somewhere in BODY section.' + cr + cr;
        widgetCode += '<div id="' + id + '"></div>' + cr;
        widgetCode += '<script type="text/javascript">' + cr;
        widgetCode += 'if(typeof(eWgs) === \'undefined\'){ document.write(\'<scr\' + \'ipt src="/api/widget.js?\' + new Date().getTime().toString().substr(0,7) + \'" async></scr\' + \'ipt>\'); var eWgs = []; }' + cr;
        widgetCode += 'eWgs.push(function(){ethplorerWidget.init(\'#' + id + '\', \'' + widget.options.widgetType + '\'';
        if(!$.isEmptyObject(widgetOptions)){
            widgetCode += ', ' + JSON.stringify(widgetOptions);
        }
        widgetCode += ');});' + cr + '</script>';

        $("#" + popupId).text(widgetCode);
        var popupContent = $("#" + popupId).html();
        $("#" + popupId).html(popupContent.replace(/(\n)/gm, "<br/>"));
        $("#" + popupId).dialog('open');
        console.log(widgetCode);
    },
    parseTemplate: function(template, data){
        var res = template;
        for(var key in data){
            var reg = new RegExp('%' + key + '%', 'g')
            res = res.replace(reg, data[key]);
        }
        return res;
    },
    // Tilda css hack
    fixTilda: function(){
        var height = parseInt($('.t-cover__wrapper').height());
        $('.t-cover, .t-cover__carrier, .t-cover__wrapper, .t-cover__filter').height(height + 'px');
    },
    // Use local path for develop instances
    fixPath: function(){
        if((document.location.host !== 'ethplorer.io') && (document.location.host.indexOf('ethplorer') >= 0)){
            ethplorerWidget.api = '//' + document.location.host + '/api';
            ethplorerWidget.url = '//' + document.location.host
        }
    },
    Utils: {
        link: function(data, text, title, hash, addClass){
            title = title || text;
            hash = hash || false;
            if((false !== hash) && hash){
                hash = '#' + hash;
            }else{
                hash = '';
            }
            var linkType = (data && (42 === data.toString().length)) ? 'address' : 'tx';
            if(!addClass){
                addClass = "";
            }
            return '<a class="tx-link ' + addClass + '" href="' + ethplorerWidget.url + '/' + linkType + '/' + data + hash + '" title="' + title + '" target="_blank">' + text + '</a>';
        },

        // Timestamp to local date
        ts2date: function(ts, withTime, withGMT){
            withGMT = 'undefined' !== typeof(withGMT) ? withGMT : true;
            ts *= 1000;
            function padZero(s){
                return (s < 10) ? '0' + s : s.toString();
            }        
            var res = '';
            var dt = new Date(ts);
            res += (dt.getFullYear() + '-' + padZero((dt.getMonth() + 1)) + '-' + padZero(dt.getDate()));
            if(withTime){
                res += ' ';
                res += ethplorerWidget.Utils.ts2time(ts, withGMT);
            }
            return res;
        },
        //Timestamp to local time
        ts2time: function(ts, withGMT){
            withGMT = 'undefined' !== typeof(withGMT) ? withGMT : true;
            ts *= 1000;
            function padZero(s){
                return (s < 10) ? '0' + s : s.toString();
            }        
            var res = '';
            var dt = new Date(ts);
            res += (padZero(dt.getHours()) + ':' + padZero(dt.getMinutes()) + ':' + padZero(dt.getSeconds()));
            if(withGMT){
                res += (' (' + Ethplorer.Utils.getTZOffset() + ')');
            }
            return res;
        },
        // Return local offset
        getTZOffset: function(){
            var offset = -Math.round(new Date().getTimezoneOffset() / 60);
            return 'GMT' + (offset > 0 ? '+' : '-') + offset;
        },
        /**
         * Number formatter (separates thousands with comma, adds zeroes to decimal part).
         *
         * @param {int} num
         * @param {bool} withDecimals
         * @param {int} decimals
         * @param {bool} cutZeroes
         * @returns {string}
         */
        formatNum: function(num, withDecimals /* = false */, decimals /* = 2 */, cutZeroes /* = false */){
            function math(command, val, decimals){
                var k = Math.pow(10, decimals ? parseInt(decimals) : 0);
                return Math[command](val * k) / k;
            }
            function padZero(s, len){
                while(s.length < len) s += '0';
                return s;
            }
            if(('object' === typeof(num)) && ('undefined' !== typeof(num.c))){
                num = parseFloat(Ethplorer.Utils.toBig(num).toString());
            }
            cutZeroes = !!cutZeroes;
            withDecimals = !!withDecimals;
            decimals = decimals || 2;
            
            if((num.toString().indexOf("e+") > 0)){
                return num.toString();
            }
            
            if((num.toString().indexOf("e-") > 0) && withDecimals){
                var parts = num.toString().split("e-");
                var res = parts[0].replace('.', '');
                for(var i=1; i<parseInt(parts[1]); i++){
                    res = '0' + res;
                }
                return '0.' + res;
            }

            if(withDecimals){
                num = math('round', num, decimals);
            }
            var parts = num.toString().split('.');
            var res = parts[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
            var zeroCount = cutZeroes ? 2 : decimals;
            if(withDecimals && decimals){
                if(parts.length > 1){
                    res += '.';
                    var tail = parts[1].substring(0, decimals);
                    if(tail.length < zeroCount){
                        tail = padZero(tail, zeroCount);
                    }
                    res += tail;
                }else{
                    res += padZero('.', parseInt(zeroCount) + 1);
                }
            }
            res = res.replace(/\.$/, '');
            return res;
        },
        selectText: function(containerid){
            if(document.selection){
                var range = document.body.createTextRange();
                range.moveToElementText(document.getElementById(containerid));
                range.select();
            }else if(window.getSelection){
                var range = document.createRange();
                range.selectNode(document.getElementById(containerid));
                window.getSelection().addRange(range);
            }
        }
    }
};

/**
 * Last Token transactions Widget.
 *
 * @param {type} element
 * @param {type} options
 * @param {type} templates
 * @returns {undefined}
 */
ethplorerWidget.Type['tokenHistory'] = function(element, options, templates){
    this.el = element;
    this.options = options;
    this.api = ethplorerWidget.api + '/getTokenHistory';
    if(options && options.address){
        this.api += ('/' + options.address.toString().toLowerCase());
    }
    this.ts = false;
    this.interval = false;

    this.templates = {
        header: '<div class="txs-header">Recent token transactions</div>',
        loader: '<div class="txs-loading">Loading...</div>',
        debug: '<div class="txs-debug"><div class="txs-stop"></div></div>',
        // Big table row
        bigScreenTable: '<tr>' + 
                    '<td class="tx-field tx-date">%time%</td>' + 
                    '<td class="tx-field tx-transfer"><span class="tx-send">from </span>%from%<span class="tx-send">to</span>%to%</td>' + 
                    '<td class="tx-field tx-amount">%amount%</td>' +
                    '<td class="tx-field tx-token">%token%</td>' +
                '</tr>',
        // Small table row
        smallScreenTable: '<tr>' +
                    '<td class="tx-field tx-date">%time%</td>' +
                    '<td class="tx-field tx-transfer"><span class="tx-send">from </span>%from%</td>' +
                '</tr><tr>' +
                    '<td class="tx-field">&nbsp;</td>' +
                    '<td class="tx-field tx-transfer"><span class="tx-send">to</span>%to%</td>' +
                '</tr><tr>' +
                    '<td colspan="2" class="tx-field tx-amount">%amount% <span class="tx-token">%token%</span></td>' +
                '</tr>'
    };

    // Override default templates with custom
    if('object' === typeof(templates)){
        for(var key in templates){
            this.templates[key] = templates[key];
        }
    }
   
    this.refresh = function(obj){
        return function(){
            $.getJSON(obj.api, obj.getRequestParams(obj.ts ? {timestamp: obj.ts} : false), obj.refreshWidget);
        }
    }(this);

    this.load = function(){
        this.el.html(this.templates.header + this.templates.loader);
        $.getJSON(this.api, this.getRequestParams(), this.refreshWidget);
    };

    this.init = function(){
        this.el.addClass('ethplorer-widget');
        this.el.addClass('widget-tokenHistory');
        this.el.addClass('theme-' + (this.options.theme ? this.options.theme : 'ethplorer'));
        this.interval = setInterval(this.refresh, 15000);
        this.load();
    };

    this.getRequestParams = function(additionalParams){
        var requestOptions = ['limit', 'address', 'timestamp'];
        var params = {
            apiKey: 'ethplorer.widget',
            type: 'transfer',
        };
        for(var key in this.options){
            if(requestOptions.indexOf(key) >= 0){
                params[key] = this.options[key];
            }
        }
        if('object' === typeof(additionalParams)){
            for(var key in additionalParams){
                if(requestOptions.indexOf(key) >= 0){
                    params[key] = additionalParams[key];
                }
            }
        }
        return params;
    };

    this.setPlayPause = function(obj){
        return function(){
            if(obj.interval){
                clearInterval(obj.interval);
                obj.interval = false;
                obj.el.find('.txs-stop').html('&#9658;');
                obj.el.find('.txs-stop').attr('title', 'Start refresh');
                obj.el.find('.txs-stop').css('color', '#00ff00');
            }else{
                obj.interval = setInterval(obj.refresh, 15000);
                obj.el.find('.txs-stop').html('&#10074;&#10074;');
                obj.el.find('.txs-stop').attr('title', 'Pause refresh');
                obj.el.find('.txs-stop').css('color', 'yellow');
            };
        };
    }(this);

    this.refreshWidget = function(obj){
        return function(data){
            if(!obj.ts){
                return obj.cbFirstLoad(data);
            }
            obj.el.find('tr').removeClass('hidden new');
            return obj.cbRefresh(data);
        };
    }(this);

    this.cbFirstLoad = function(data){
        if(data && !data.error && data.operations && data.operations.length){
            this.el.find('.txs-loading').remove();
            if(this.ts === data.operations[0].timestamp){
                // Skip redraw if nothing changed
                return;
            }
            this.ts = data.operations[0].timestamp;
            var txTable = '<table class="txs big-screen-table">';
            var txSmall = '<table class="txs small-screen-table">';
            for(var i=0; i<data.operations.length; i++){
                var rowData = this.prepareData(data.operations[i]);
                txTable += ethplorerWidget.parseTemplate(this.templates.bigScreenTable, rowData);
                txSmall += ethplorerWidget.parseTemplate(this.templates.smallScreenTable, rowData);
            }
            txSmall += '</table>';
            txTable += '</table>';
            this.el.append(txTable);
            this.el.append(txSmall);

            ethplorerWidget.appendEthplorerLink(this);
            
            // Debug mode
            if(this.options.debug){
                this.el.find(".txs-header").append(this.templates.debug);
                this.el.find('.txs-stop').click(this.setPlayPause);
                this.el.find('.txs-stop').html('&#10074;&#10074;');
                this.el.find('.txs-stop').attr('title', 'Pause refresh');
                this.el.find('.txs-stop').css('color', 'yellow');
            }
            if('function' === typeof(this.options.onLoad)){
                this.options.onLoad();
            }
            setTimeout(ethplorerWidget.fixTilda, 300);
        }
    };

    this.cbRefresh = function(data){
        if(data && !data.error && data.operations && data.operations.length){
            this.ts = data.operations[0].timestamp;
            var txTable = this.el.find(".txs.big-screen-table");
            var txSmall = this.el.find(".txs.small-screen-table");
            for(var i=0; i<data.operations.length; i++){
                var rowData = this.prepareData(data.operations[i]);
                var bigRows = $(ethplorerWidget.parseTemplate(this.templates.bigScreenTable, rowData));
                var smallRows = $(ethplorerWidget.parseTemplate(this.templates.smallScreenTable, rowData));
                bigRows.addClass('hidden');
                smallRows.addClass('hidden');
                txTable.prepend(bigRows);
                txSmall.prepend(smallRows);
                setTimeout(
                    function(el){
                        return function(){
                            el.find('.hidden').addClass('new');
                        }
                    }(this.el),
                    200
                );

                var limit = this.options.limit ? this.options.limit : 10;
                var rowsToKill = limit * bigRows.length;
                if(rowsToKill){
                    txTable.find('tr').each(function(i){
                        if(i >= rowsToKill){
                            $(this).remove();
                        }
                    });
                }
                var rowsToKill = limit * smallRows.length;
                if(rowsToKill){
                    txSmall.find('tr').each(function(i){
                        if(i >= rowsToKill){
                            $(this).remove();
                        }
                    });
                }
            }
        }
    };

    this.prepareData = function(tr){
        if(!tr.tokenInfo){
            tr.tokenInfo = {symbol: "", decimals: 0};
        }
        if(!tr.tokenInfo.symbol && tr.tokenInfo.name){
            tr.tokenInfo.symbol = tr.tokenInfo.name;
        }
        var k = Math.pow(10, tr.tokenInfo.decimals);
        var amount = ethplorerWidget.Utils.formatNum(tr.value / k, true, parseInt(tr.tokenInfo.decimals), true);

        var hash = tr.priority ? tr.priority : false;

        return {
            date: ethplorerWidget.Utils.link(tr.transactionHash, ethplorerWidget.Utils.ts2date(tr.timestamp, false, false), tr.transactionHash, hash),
            time: ethplorerWidget.Utils.link(tr.transactionHash, ethplorerWidget.Utils.ts2time(tr.timestamp, false), tr.transactionHash, hash),
            datetime: ethplorerWidget.Utils.link(tr.transactionHash, ethplorerWidget.Utils.ts2date(tr.timestamp, true, false), tr.transactionHash, hash),
            from:  ethplorerWidget.Utils.link(tr.from, tr.from),
            to: ethplorerWidget.Utils.link(tr.to, tr.to),
            amount: ethplorerWidget.Utils.link(tr.tokenInfo.address, amount, amount + ' ' + tr.tokenInfo.symbol),
            token: ethplorerWidget.Utils.link(tr.tokenInfo.address, tr.tokenInfo.symbol, tr.tokenInfo.symbol + ' ' + tr.tokenInfo.address)
        };
    };

    this.init();
}

/**
 * Top Tokens list Widget.
 *
 * @param {type} element
 * @param {type} options
 * @param {type} templates
 * @returns {undefined}
 */
ethplorerWidget.Type['topTokens'] = function(element, options, templates){
    this.el = element;

    this.options = {
        limit: 10,
        period: 30
    };

    if(options){
        for(var key in options){
            this.options[key] = options[key];
        }
    }

    this.api = ethplorerWidget.api + '/getTopTokens';

    this.templates = {
        header: '<div class="txs-header">Top %limit% tokens for %period% days</div>',
        loader: '<div class="txs-loading">Loading...</div>',
        // Big table row
        row:    '<tr>' + 
                    '<td class="tx-field">%position%</td>' + 
                    '<td class="tx-field">%name%</td>' +
                    '<td class="tx-field" title="%opCount% operations">%opCount%</td>' +
                '</tr>',
    };

    // Override default templates with custom
    if('object' === typeof(templates)){
        for(var key in templates){
            this.templates[key] = templates[key];
        }
    }

    this.load = function(){
        this.el.html(ethplorerWidget.parseTemplate(this.templates.header, this.options) + this.templates.loader);
        $.getJSON(this.api, this.getRequestParams(), this.refreshWidget);
    };

    this.init = function(){
        this.el.addClass('ethplorer-widget');
        this.el.addClass('widget-topTokens');
        this.el.addClass('theme-' + (this.options.theme ? this.options.theme : 'ethplorer'));
        this.load();
    };

    this.getRequestParams = function(additionalParams){
        var requestOptions = ['limit', 'period'];
        var params = {
            apiKey: 'freekey',
        };
        for(var key in this.options){
            if(requestOptions.indexOf(key) >= 0){
                params[key] = this.options[key];
            }
        }
        if('object' === typeof(additionalParams)){
            for(var key in additionalParams){
                if(requestOptions.indexOf(key) >= 0){
                    params[key] = additionalParams[key];
                }
            }
        }
        return params;
    };

    this.refreshWidget = function(obj){
        return function(data){
            if(data && !data.error && data.tokens && data.tokens.length){
                obj.el.find('.txs-loading').remove();
                var txTable = '<table class="txs">';
                for(var i=0; i<data.tokens.length; i++){
                    var rowData = obj.prepareData(data.tokens[i]);
                    rowData['position'] = i+1;
                    txTable += ethplorerWidget.parseTemplate(obj.templates.row, rowData);
                }
                txTable += '</table>';
                obj.el.append(txTable);

                ethplorerWidget.appendEthplorerLink(obj);

                if('function' === typeof(obj.options.onLoad)){
                    obj.options.onLoad();
                }
                setTimeout(ethplorerWidget.fixTilda, 300);
            }
        };
    }(this);

    this.prepareData = function(data){
        var name = data.name ? data.name : data.address;
        return {
            address: ethplorerWidget.Utils.link(data.address, data.address, data.address),
            name: ethplorerWidget.Utils.link(data.address, name, name, false, data.name ? "" : "tx-unknown"),
            opCount: data.opCount
        };
    };

    this.init();
}

/**
 * Token history grouped Widget.
 *
 * @param {type} element
 * @param {type} options
 * @param {type} templates
 * @returns {undefined}
 */
ethplorerWidget.Type['tokenHistoryGrouped'] = function(element, options, templates){
    this.el = element;
    this.widgetData = null;
    this.resizeTimer = null;

    this.options = {
        period: 30,
        type: 'area',
        theme: 'light',
        options: {}
    };

    if(options){
        for(var key in options){
            this.options[key] = options[key];
        }
    }

    this.api = ethplorerWidget.api + '/getTokenHistoryGrouped';
    if(options && options.address){
        this.api += ('/' + options.address.toString().toLowerCase());
    }

    this.templates = {
        loader: '<div class="txs-loading">Loading...</div>',
    };

    this.load = function(){
        $.getJSON(this.api, this.getRequestParams(), this.refreshWidget);
    };

    this.drawChart = function(aTxData){
        var aData = [];
        aData.push(['Day', 'Token operations']);

        var stDate = new Date(),
            fnDate = new Date();
        stDate.setDate(stDate.getDate() - 1);
        fnDate.setDate(stDate.getDate() - this.options.period);

        var aCountData = {};
        for(var i = 0; i < aTxData.length; i++){
            var aDayData = aTxData[i];
            aCountData[aDayData._id.year + '-' + aDayData._id.month + '-' + aDayData._id.day] = aDayData.cnt;
        }

        var curDate = true;
        while(stDate > fnDate){
            var key = stDate.getFullYear() + '-' + (stDate.getMonth() + 1) + '-' + stDate.getDate();
            var cnt = ('undefined' !== typeof(aCountData[key])) ? aCountData[key] : 0;
            if(curDate && cnt == 0){
                curDate = false;
                continue;
            }
            aData.push([new Date(stDate.getFullYear(), stDate.getMonth(), stDate.getDate()), cnt]);
            var newDate = stDate.setDate(stDate.getDate() - 1);
            stDate = new Date(newDate);
        }

        var data = google.visualization.arrayToDataTable(aData);
        var def = {
            title: '',
            legend: { position: 'none' },
            tooltip: {
                format: 'MMM d',
            },
            hAxis : {
                title: '',
                titleTextStyle: {
                    italic: false
                },
                textPosition: 'out',
                slantedText: false,
                maxAlternation: 1,
                maxTextLines: 1,
                format: 'MMM d',
                gridlines: {
                    count: 10,
                    color: "none"
                }
            },
            vAxis: {
                title: '',
                titleTextStyle: {
                    italic: false
                },
                minValue: 0,
                viewWindow: {
                    min: 0
                },
                gridlines: {
                    color: "none"
                },
                maxValue: 3,
                format: '#,###',
            },
            pointSize: 5,
        };
        if(this.options['theme'] == 'dark'){
            def.colors = ['#47C2FF'];
            def.titleTextStyle = {color: '#DEDEDE'};
            def.backgroundColor = {fill: 'transparent'};

            def.hAxis.textStyle = {color: '#DEDEDE'};
            def.hAxis.titleTextStyle.color = '#DEDEDE';
            def.hAxis.baselineColor = '#DEDEDE';

            def.vAxis.textStyle = {color: '#DEDEDE'};
            def.vAxis.titleTextStyle.color = '#DEDEDE';
            def.vAxis.baselineColor = 'none';
        }
        var options = $.extend(true, def, this.options['options']);

        var tooltipFormatter = new google.visualization.DateFormat({ 
            pattern: "MMM dd, yyyy '+UTC'"
        });
        tooltipFormatter.format(data, 0);

        if(this.options['type'] == 'area') var chart = new google.visualization.AreaChart(this.el[0]);
        else if(this.options['type'] == 'line') var chart = new google.visualization.LineChart(this.el[0]);
        else var chart = new google.visualization.ColumnChart(this.el[0]);
        chart.draw(data, options);
    };

    this.init = function(){
        this.el.addClass('ethplorer-widget');
        this.el.addClass('widget-tokenHistoryGrouped');
        this.el.addClass('theme-' + (this.options.theme ? this.options.theme : 'ethplorer'));
        this.el.html(this.templates.loader);
        //this.load();
    };

    this.getRequestParams = function(additionalParams){
        var requestOptions = ['period', 'address', 'type', 'theme'];
        var params = {
            apiKey: 'freekey',
        };
        for(var key in this.options){
            if(requestOptions.indexOf(key) >= 0){
                params[key] = this.options[key];
            }
        }
        if('object' === typeof(additionalParams)){
            for(var key in additionalParams){
                if(requestOptions.indexOf(key) >= 0){
                    params[key] = additionalParams[key];
                }
            }
        }
        return params;
    };

    this.refreshWidget = function(obj){
        return function(data){
            console.log(data);
            if(data && !data.error && data.countTxs /*&& data.countTxs.length*/){
                obj.widgetData = data.countTxs;
                google.charts.setOnLoadCallback(
                    function(){
                        obj.el.find('.txs-loading').remove();
                        obj.drawChart(data.countTxs);
                        ethplorerWidget.appendEthplorerLink(obj);
                        if('function' === typeof(obj.options.onLoad)){
                            obj.options.onLoad();
                        }
                        setTimeout(ethplorerWidget.fixTilda, 300);
                    }
                );
            }else{
                obj.el.find('.txs-loading').remove();
            }
        };
    }(this);

    $(window).resize(this, function(){
        var obj = arguments[0].data;
        if(obj.resizeTimer) clearTimeout(obj.resizeTimer);
        obj.resizeTimer = setTimeout(function(){
            if(obj.widgetData){
                obj.el.empty();
                obj.drawChart(obj.widgetData);
                ethplorerWidget.appendEthplorerLink(obj);
            }
        }, 500);
    });

    this.init();
    ethplorerWidget.chartWidgets.push(this);
};

/**
 * Document on ready widgets initialization.
 * Initializes all widgets added using eWgs array.
 */
(function(){
    function ethpWiInit(){
        var eWgs = window.eWgs || [];
        if(eWgs && eWgs.length)
            for(var i=0; i<eWgs.length; i++)
                if('function' === typeof(eWgs[i]))
                    eWgs[i]();

        if(ethplorerWidget.addGoogleLoader){
            ethplorerWidget.addGoogleLoader = false;
            ethplorerWidget.loadScript("https://www.gstatic.com/charts/loader.js", ethplorerWidget.loadGoogleCharts);
        }
    }
    // add widget css
    ethplorerWidget.addStyles();
    // autoload
    if(document.readyState === "interactive" || document.readyState === "complete"){
        ethpWiInit();
    }else{
        if(document.addEventListener){
            document.addEventListener("DOMContentLoaded", ethpWiInit);
        }else if(document.attachEvent){
            document.attachEvent("onreadystatechange", function(){
                if(document.readyState === "interactive" || document.readyState === "complete"){
                    ethpWiInit()
                }
            });
        }
    }
}());