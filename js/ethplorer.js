Ethplorer = {
    init: function(){
        $.jsonRPC.setup({
            endPoint: Ethplorer.Config.ethService,
            namespace: ''
        });
        Ethplorer.scroller();
        Ethplorer.route();
        $('#network').text(Ethplorer.Config.testnet ? 'Test' : 'Modern');
        $('.navbar-nav li[data-page]').click(function(){
            if($(this).hasClass('active')) return;
            if(!$('#loader:visible').length){
                $('.content-page:visible').hide();
                $('#' + $(this).attr('data-page')).show();
                $('.navbar-nav li').removeClass('active');
                $(this).addClass('active');
            }
        });
    },
    route: function(){
        var pathData  = Ethplorer.Utils.parsePath();
        switch(pathData.cmd){
            case 'tx':
                Ethplorer.getTxDetails(pathData.arg);
                break;
            case 'address':
                Ethplorer.getAddressDetails(pathData.arg);
                break;
            case 'token':
                showTokenDetails(pathData.arg);
                break;
            default:
                Ethplorer.error('Oops, nothing to do');
        }
    },
    scroller: function(){
        var starttime = new Date().getTime();
        for (var i = 0; i < 34; i++) {
            $('#scroller').append($('<div class="letter">' + (Math.random() > 0.5 ? '1' : '0') + '</div>'));
        }
        function run() {
            if($('#scroller:visible').length){
                var elapsed = new Date().getTime() - starttime;
                var pos = elapsed * 0.05;
                $('div.letter').each(function(index, letter) {
                    var posx = -20 + (pos + 10 * index) % 340;
                    var posy = 20 + Math.sin((posx + pos * 2) / 20) * 10;
                    $(letter).css('left', posx + 'px').css('top', posy + 'px');
                });
            }
        }
        setInterval(run, 30);       
    },
    error: function(message){
        Ethplorer.hideLoader();
        $('.content-page').hide();
        $('#error-reason').text(message);
        $('#error').show();
    },
    getTxErrorReason: function(reason){
        var aReasons = {
            out_of_gas: 'Out of gas'
        };
        return ('undefined' !== typeof(aReasons[reason])) ? aReasons[reason] : reason;
    },
    getTxDetails: function (txHash, abi){
        Ethplorer.showLoader();

        // Check TX hash format first
        txHash = txHash.toLowerCase();
        if(!/^0x[0-9a-f]{64}$/i.test(txHash)){
            Ethplorer.error('Invalid transaction hash');
            return;
        }    
        Ethplorer.Utils.request('getTransactionDetails', [txHash, abi], 'showTxDetails');
    },

    showTxDetails: function(txHash, txData){
        $('.list-field').empty();
        $('#txEthData').parent().hide();
        $('#txHash').html(Ethplorer.Utils.getEtherscanLink(txHash));
        $('.token-related')[txData.token ? 'show' : 'hide']();

        var oTx = txData.tx;
        $('#txEthValue').html(oTx.value + ' ETHER');
        $('#txEthTo').html(Ethplorer.Utils.getEtherscanLink(oTx.to, oTx.to, txData.contracts.indexOf(oTx.to) >= 0));

        $('#txEthNonce').html(oTx.nonce);
        if(oTx.blockNumber){
            $('#txEthBlock').html(oTx.blockNumber + ' (' + oTx.confirmations + ')');
            $('#txEthStatus')[oTx.success ? 'removeClass' : 'addClass']('text-danger');
            $('#txEthStatus')[oTx.success ? 'addClass' : 'removeClass']('text-success');
            $('#txEthStatus').html(oTx.success ? 'Success' : 'Failed' + (oTx.failedReason ? (': ' + Ethplorer.getTxErrorReason(oTx.failedReason)) : ''));
        }else{
            $('#txEthStatus').removeClass('text-danger text-success');
            $('#txEthStatus').html('Pending');
        }

        $('#txEthGasLimit').html(oTx.gasLimit);
        $('#txEthGasUsed').html(oTx.gasUsed);
        $('#txEthGasPrice').html(Ethplorer.Utils.formatNum(oTx.gasPrice, true) + ' ETHER');
        $('#txEthFee').html(oTx.fee + ' ETHER');

        if(txData.token){
            var oToken = txData.token;
            $('.token-name').html(oToken.name);

            $('#tokenContract, #txEthTo').html(Ethplorer.Utils.getEtherscanLink(oToken.contract, oToken.contract, true));
            $('#tokenSymbol').html(oToken.symbol);
            $('#tokenDecimals').html(oToken.decimals);
            $('#tokenOwner').html(Ethplorer.Utils.getEtherscanLink(oToken.owner, oToken.owner));
            $('#tokenSupply').html(Ethplorer.Utils.formatNum(oToken.totalSupply, true, oToken.decimals, true));

            if(txData.send){
                var oSend = txData.send;
                if(!isNaN(oSend.value) && !isNaN(oToken.decimals)){
                    var k = Math.pow(10, oToken.decimals);
                    $('#txTokenValue').html(Ethplorer.Utils.formatNum(parseInt(oSend.value) / k, true, oToken.decimals) + ' ' + oToken.symbol);
                }
                $('#txTokenTo').html(Ethplorer.Utils.getEtherscanLink(oSend.to, oSend.to, txData.contracts.indexOf(oSend.to) >= 0));
                $('#txTokenStatus')[oTx.success ? 'removeClass' : 'addClass']('text-danger');
                $('#txTokenStatus')[oTx.success ? 'addClass' : 'removeClass']('text-success');           
                $('#txTokenStatus').html(oSend.success ? 'Success' : 'Failed' + (oSend.failedReason ? (': ' + Ethplorer.getTxErrorReason(oSend.failedReason)) : ''));
            }
        }
        $('#txTokenDate, #txEthDate').html(Ethplorer.Utils.ts2date(oTx.timestamp));
        $('#txTokenFrom, #txEthFrom').html(Ethplorer.Utils.getEtherscanLink(oTx.from, oTx.from, txData.contracts.indexOf(oTx.from) >= 0));

        var data = oTx.data ? oTx.data.replace('0x', '').toUpperCase() : false;
        if(data){
            $('#txEthData').html('<pre>' + data + '</pre>');
            $('#txEthData').parent().show();
        }

        Ethplorer.hideLoader();
        $('#txDetails').show();

        $('.token-related .block').height(Math.max($('.token-related:eq(0) .block').height(), $('.token-related:eq(1) .block').height()));
    },

    getAddressDetails: function(address){
        // Check Address format first
        address = address.toLowerCase();
        if(!/^0x[0-9a-f]{40}$/i.test(address)){
            Ethplorer.error('Invalid address format');
            return;
        }    
        Ethplorer.Utils.request('getAddressDetails', [address], 'showAddressDetails');
    },

    showAddressDetails: function(address, data){
        $('#address-type').text(data.isContract ? 'Contract' : 'Address');
        Ethplorer.fillValues('address', data, ['balance', 'txCount']);
        $('#address-token-balances, #address-token-details').hide();
        if(data.isContract){
            $('#address-token-details').show();
            Ethplorer.fillValues('address', data, ['token', 'token.name', 'token.owner', 'token.totalSupply', 'token.decimals', 'token.symbol']);
        }else if(data.tokenBalances){
            $('#address-token-balances').show();
            for(var token in data.tokenBalances){
                var balance = data.tokenBalances[token];
                var oToken = data.tokens[token];
                var row = $('<TR>');
                row.append('<TD>' + Ethplorer.Utils.getEthplorerLink(oToken.contract, token, false) + '</TD>');
                var value = balance / Math.pow(10, oToken.decimals);
                row.append('<TD>' + Ethplorer.Utils.formatNum(value, true, oToken.decimals, false) + ' ' + oToken.symbol + '</TD>');
                row.find('td:eq(1)').addClass('text-right');
                $('#address-token-balances table').append(row);
            }
        }
        
        Ethplorer.hideLoader();
        $('#addressDetails').show();
        $('#addressDetails .block:eq(0),#addressDetails .block:eq(1)').height(Math.max($('#addressDetails .block:eq(0)').height(), $('#addressDetails .block:eq(1)').height()));
    },

    showTokenDetails: function(address){
        Ethplorer.hideLoader();
        $('#tokenDetails').show();
    //  $('#tokenDetails .block:eq(0),#tokenDetails .block:eq(1)').height(Math.max($('#tokenDetails .block:eq(0)').height(), $('#tokenDetails .block:eq(1)').height()));
    },

    fillValues: function(prefix, data, keys){
        for(var key in data){
            if(keys.indexOf(key) >= 0){
                if('object' == typeof(data[key])){
                    for(var sub in data[key]){
                        console.log('Search ' + key + '.' + sub + ' into keys');
                        console.log(keys);
                        if(keys.indexOf(key + '.' + sub) >= 0){
                            Ethplorer.fillValue(prefix + '-' + key + '-' + sub , data[key][sub]);
                        }
                    }
                }else{
                    Ethplorer.fillValue(prefix + '-' + key, data[key]);
                }
            }
        }
    },

    fillValue: function(id, value){
        var type = $('#' + id).attr('data-type');
        if('int' === type){
            value = Ethplorer.Utils.formatNum(value, false);
        }
        if('ether' === type){
            value = Ethplorer.Utils.formatNum(value, true, 16, true) + ' ETHER';
        }
        if('etherscan' === type){
            value = Ethplorer.Utils.getEtherscanLink(value);
        }
        $('#' + id).html(value);
    },

    showLoader: function(){
        Ethplorer.loaderTimeout = setTimeout(function(){
            $('#loader').show();
        }, 1000);
    },
    
    hideLoader: function(){
        $('#loader').hide();
        if(Ethplorer.loaderTimeout){
            clearTimeout(Ethplorer.loaderTimeout);
        }
    },
    
    Utils: {
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

        getEthplorerLink: function(data, text, isContract){
            text = text || data;
            if(!data.match(/^0x/)){
                return text;
            }
            var isTx = data.match(/^0x[0-9a-f]{64}/);
            var res = '<a href="/';
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
        },

        request: function(method, params, successMethod){   
            $.jsonRPC.request(method, {
                params : params,
                success : function(_params, _successMethod){
                    return function(data){
                        console.log(JSON.stringify(data));
                        Ethplorer[_successMethod](_params[0], data.result);
                    };
                }(params, successMethod),
                error : function(data){
                    console.log('There was an error ' + JSON.stringify(data));
                    if(data && data.error){
                        var errorMessage = '';
                        switch(data.error.code){
                            case -32603:
                                errorMessage = 'Data not found';
                                break;
                        }
                        Ethplorer.error(errorMessage);
                    }
                }
            });
        },
    }
};

$(document).ready(function(){
    Ethplorer.init();
});

function processTxDetailsForm(){
    getTxDetails($('#hash').val(), $('#abi').val());
}
