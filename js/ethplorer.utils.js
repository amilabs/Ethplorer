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
    
    getEtherscanAddress: function(){
        return 'https://' + (Ethplorer.Config.testnet ? 'testnet.' : '') + 'etherscan.io/';
    }
};