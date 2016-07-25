/**
 * 
 * @type object
 */
Ethplorer.Utils = {
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
        cutZeroes = !!cutZeroes;
        withDecimals = !!withDecimals;
        decimals = decimals || 2;
        if((num.toString().indexOf("e-") > 0) && withDecimals){
            var parts = num.toString().split("e-");
            var res = parts[0];
            for(var i=0; i<(parseInt(parts[1]) - parts[0].length); i++){
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
    
    /**
     * Parses URL path
     * @returns {string}
     */
    parsePath: function(){
        var path = document.location.pathname.split('/');
        var res = {
            cmd: '',
            arg: ''
        };
        if(path.length > 1){
            res.cmd = path[1];
            if(path.length > 2){
                res.arg = path[2];
            }
        }
        return res;
    },
    /**
     * 
     * @returns {String}
     */
    getEtherscanAddress: function(){
        return 'https://' + (Ethplorer.Config.testnet ? 'testnet.' : '') + 'etherscan.io/';
    },
    
    getEtherscanLink: function(data, text, isContract){
        text = text || data;
        var urlEtherscan = Ethplorer.Utils.getEtherscanAddress();
        if(!data.match(/^0x/)){
            return text;
        }
        var isTx = data.match(/^0x[0-9a-f]{64}/);
        var res = '<a target="_blank" href="' + urlEtherscan;
        res += (isTx ? 'tx' : 'address');
        res += ('/' + data + '">' + text + '</a>');
        if(isContract){
            res = 'Contract ' + res;
        }        
        return res;
    },

    // Date with fixed GMT to local date
    ts2date: function(ts, withGMT){
        withGMT = withGMT || true;
        ts *= 1000;
        function padZero(s){
            return (s < 10) ? '0' + s : s.toString();
        }        
        var offset = -Math.round(new Date().getTimezoneOffset() / 60);
        var res = '';
        var dt = new Date(ts);
        res += (dt.getFullYear() + '-' + padZero((dt.getMonth() + 1)) + '-' + padZero(dt.getDate()));
        res += ' ';
        res += (padZero(dt.getHours()) + ':' + padZero(dt.getMinutes()) + ':' + padZero(dt.getSeconds()));
        if(withGMT){
            res += (' (GMT' + (offset > 0 ? '+' : '-') + offset + ')');
        }
        return res;
    }
};