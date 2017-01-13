ethplorerWidget = {
    // Ethplorer API URL
    api: 'https://api.ethplorer.io',

    // Ethplorer URL
    url: 'https://ethplorer.io',

    // Widget types
    Type: {},

    // Widget initialization
    init: function(selector, type, options, templates){
        options = options || {};
        templates = templates || {};
        type = type || 'tokenHistory';
        if('undefined' === typeof(jQuery)){
            console.error('Cannot initialize Ethplorer widget: jQuery not loaded.');
            return;
        }
        var el = $(selector);
        if(!el.length){
            console.error('Cannot initialize Ethplorer widget: element ' + selector + ' not found.');
            return;
        }
        $('body').append('<link rel="stylesheet" href="' + ethplorerWidget.api + '/widget.css" type="text/css" />')
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
    // Tilda css hack
    fixTilda: function(){
        var height = parseInt($('.t-cover__wrapper').height());
        $('.t-cover, .t-cover__carrier, .t-cover__wrapper, .t-cover__filter').height(height + 'px');
    },
    parseTemplate: function(template, data){
        var res = template;
        for(var key in data){
            res = res.replace('%' + key + '%', data[key]);
        }
        return res;
    },
    Utils: {
        link: function(data, text, title, hash){
            title = title || text;
            hash = hash || false;
            if((false !== hash) && hash){
                hash = '#' + hash;
            }else{
                hash = '';
            }
            var linkType = (data && (42 === data.toString().length)) ? 'address' : 'tx';
            return '<a class="tx-link" href="' + ethplorerWidget.url + '/' + linkType + '/' + data + hash + '" title="' + title + '" target="_blank">' + text + '</a>';
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
        big:    '<tr>' + 
                    '<td class="tx-field tx-date">%time%</td>' + 
                    '<td class="tx-field tx-transfer"><span class="tx-send">from </span>%from%<span class="tx-send">to</span>%to%</td>' + 
                    '<td class="tx-field tx-amount">%amount%</td>' +
                    '<td class="tx-field tx-token">%token%</td>' +
                '</tr>',
        // Small table row
        small:  '<tr>' +
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
        element.addClass('widget-txs');
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
            var txTable = '<table class="txs big">';
            var txSmall = '<table class="txs small">';
            for(var i=0; i<data.operations.length; i++){
                var rowData = this.prepareData(data.operations[i]);
                txTable += ethplorerWidget.parseTemplate(this.templates.big, rowData);
                txSmall += ethplorerWidget.parseTemplate(this.templates.small, rowData);
            }
            txSmall += '</table>';
            txTable += '</table>';
            this.el.append(txTable);
            this.el.append(txSmall);
            if(document.location.host !== 'ethplorer.io'){
                this.el.append('<div style="text-align:center;font-size:11px;padding-top:12px;"><a class="tx-link" href="https://ethplorer.io/widgets" target="_blank">Ethplorer.io</a></a>')
            }
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
            var txTable = this.el.find(".txs.big");
            var txSmall = this.el.find(".txs.small");
            for(var i=0; i<data.operations.length; i++){
                var rowData = this.prepareData(data.operations[i]);
                var bigRows = $(ethplorerWidget.parseTemplate(this.templates.big, rowData));
                var smallRows = $(ethplorerWidget.parseTemplate(this.templates.small, rowData));
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