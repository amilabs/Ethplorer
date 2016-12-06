ethplorerWidget = {
    url: 'https://ethplorer.io',

    last: false,

    templates: {
        // Big table row
        big:    '<tr>' + 
                    '<td class="tx-field tx-date">%date%</td>' + 
                    '<td class="tx-field"><span class="tx-send">transfer from </span>%from%<span class="tx-send">to</span>%to%</td>' + 
                    '<td class="tx-field tx-amount">%amount%</td>' +
                    '<td class="tx-field tx-token">%token%</td>' +
                '</tr>',
        // Small table row
        small:  '<tr>' +
                    '<td class="tx-field tx-date">%date%</td>' +
                    '<td class="tx-field"><span class="tx-send">from </span>%from%</td>' +
                '</tr><tr>' +
                    '<td class="tx-field">&nbsp;</td><td class="tx-field"><span class="tx-send">to</span>%to%</td>' +
                '</tr><tr>' +
                    '<td colspan="2" class="tx-field tx-amount">%amount% <span class="tx-token">%token%</span></td>' +
                '</tr>'
    },

    init: function(selector, type, options){
        ethplorerWidget.options = options || {};
        ethplorerWidget.type = type || 'last';
        ethplorerWidget.el = $(selector);

        $('body').append('<link rel="stylesheet" href="' + ethplorerWidget.url + '/api/widget.css" type="text/css" />')

        $(selector).addClass('widget-txs');
        $(selector).html('Loading...');
        ethplorerWidget.load();

        $(window).resize(ethplorerWidget.resize);

        setInterval(ethplorerWidget.loadMore, 15000);
    },

    load: function(){
        $.getJSON(ethplorerWidget.url + '/api/', {cmd: ethplorerWidget.type, limit: ethplorerWidget.options.limit}, function(data){
            if(data && !data.error){
                if(ethplorerWidget.last === data[0].timestamp){
                    // Skip redraw if nothing changed
                    return;
                }
                ethplorerWidget.last = data[0].timestamp;
                var txTable = '<table class="txs big">';
                var txSmall = '<table class="txs small">';
                for(var i=0; i<data.length; i++){
                    var tr = data[i];
                    if(!tr.token){
                        tr.token = {symbol: "", decimals: 0};
                    }
                    var k = Math.pow(10, tr.token.decimals);
                    var amount = ethplorerWidget.Utils.formatNum(tr.value / k, true, parseInt(tr.token.decimals), true);

                    var rowData = {
                        date: ethplorerWidget.Utils.link(tr.transactionHash, ethplorerWidget.Utils.ts2date(tr.timestamp, false)),
                        from:  ethplorerWidget.Utils.link(tr.from, tr.from),
                        to: ethplorerWidget.Utils.link(tr.to, tr.to),
                        amount: ethplorerWidget.Utils.link(tr.token.address, amount),
                        token: ethplorerWidget.Utils.link(tr.token.address, tr.token.symbol)
                    };

                    txTable += ethplorerWidget.tableRow(ethplorerWidget.templates.big, rowData);
                    txSmall += ethplorerWidget.tableRow(ethplorerWidget.templates.small, rowData);
                }
                txSmall += '</table>';
                txTable += '</table>';
                ethplorerWidget.el.empty();
                ethplorerWidget.el.append(txTable);
                ethplorerWidget.el.append(txSmall);
                setTimeout(ethplorerWidget.resize, 300);
            }
        });        
    },
    loadMore: function(){
        if(!ethplorerWidget.last){
            ethplorerWidget.load();
            return;
        }
        $('tr').removeClass('hidden new');
        $.getJSON(ethplorerWidget.url + '/api/', {cmd: ethplorerWidget.type, limit: ethplorerWidget.options.limit, timestamp: ethplorerWidget.last}, function(data){
            if(data && !data.error && data.length){
                ethplorerWidget.last = data[0].timestamp;
                var txTable = $(".txs.big");
                var txSmall = $(".txs.small");
                for(var i=0; i<data.length; i++){
                    var tr = data[i];
                    if(!tr.token){
                        tr.token = {symbol: "", decimals: 0};
                    }
                    var k = Math.pow(10, tr.token.decimals);
                    var amount = ethplorerWidget.Utils.formatNum(tr.value / k, true, parseInt(tr.token.decimals), true);

                    var rowData = {
                        date: ethplorerWidget.Utils.link(tr.transactionHash, ethplorerWidget.Utils.ts2date(tr.timestamp, false)),
                        from:  ethplorerWidget.Utils.link(tr.from, tr.from),
                        to: ethplorerWidget.Utils.link(tr.to, tr.to),
                        amount: ethplorerWidget.Utils.link(tr.token.address, amount),
                        token: ethplorerWidget.Utils.link(tr.token.address, tr.token.symbol)
                    };

                    var bigRows = $(ethplorerWidget.tableRow(ethplorerWidget.templates.big, rowData));
                    var smallRows = $(ethplorerWidget.tableRow(ethplorerWidget.templates.small, rowData));
                    bigRows.addClass('hidden');
                    smallRows.addClass('hidden');
                    txTable.prepend(bigRows);
                    txSmall.prepend(smallRows);
                    setTimeout(function(){ $('.hidden').addClass('new'); }, 200);

                    var rowsToKill = 10 * bigRows.length;
                    if(rowsToKill){
                        txTable.find('tr').each(function(i){
                            if(i >= rowsToKill){
                                $(this).remove();
                            }
                        });
                    }
                    var rowsToKill = 10 * smallRows.length;
                    if(rowsToKill){
                        txSmall.find('tr').each(function(i){
                            if(i >= rowsToKill){
                                $(this).remove();
                            }
                        });
                    }
                }
            }
        });        
    },

    resize: function(){
        var height = parseInt($('.t-cover__wrapper').height());
        $('.t-cover, .t-cover__carrier, .t-cover__wrapper, .t-cover__filter').height(height + 'px');
    },

    tableRow: function(template, data){
        var res = template;
        for(var key in data){
            res = res.replace('%' + key + '%', data[key]);
        }
        return res;
    },

    Utils: {
        link: function(data, text){
            var linkType = (data && (42 === data.toString().length)) ? 'address' : 'tx';
            return '<a class="tx-link" href="' + ethplorerWidget.url + '/' + linkType + '/' + data + '" target="_blank">' + text + '</a>';
        },

        // Date with fixed GMT to local date
        ts2date: function(ts, withGMT){
            withGMT = 'undefined' !== typeof(withGMT) ? withGMT : true;
            ts *= 1000;
            function padZero(s){
                return (s < 10) ? '0' + s : s.toString();
            }        
            var res = '';
            var dt = new Date(ts);
            /*res += (dt.getFullYear() + '-' + padZero((dt.getMonth() + 1)) + '-' + padZero(dt.getDate()));
            res += ' '*/;
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
            var res = parts[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
            return res;
        },
    }
};
