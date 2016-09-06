/*!
 * Copyright 2016 Everex https://everex.io
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

Ethplorer = {
    init: function(){
        BigNumber.config({ ERRORS: false });
        $.jsonRPC.setup({
            endPoint: Ethplorer.Config.ethService,
            namespace: ''
        });
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
            case 'search':
                Ethplorer.search(pathData.arg);
                break;
            /*
            case 'token':
                showTokenDetails(pathData.arg);
                break;
            */
            default:
                Ethplorer.error('Invalid action');
        }
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
        $.getJSON(Ethplorer.Config.phpService, {data: txHash}, function(_txHash){
            return function(data){
                Ethplorer.showTxDetails(_txHash, data);
            }
        }(txHash));
        
    },

    knownContracts: [],
    dataFields: {},
    showTxDetails: function(txHash, txData){
        $('#ethplorer-path').html('<b>Transaction hash</b> ' + txHash);

        $('.list-field').empty();
        $('#transaction-tx-hash').html(Ethplorer.Utils.getEtherscanLink(txHash));
        $('.token-related')[txData.token ? 'show' : 'hide']();
        $('#tx-status, #operation-status').removeClass('green red');

        var oTx = txData.tx;
        if(false === oTx){
            Ethplorer.error('Transaction not found');
            return;
        }

        Ethplorer.knownContracts = txData.contracts ? txData.contracts : [];

        if(oTx.blockNumber){
            $('#txEthStatus')[oTx.success ? 'removeClass' : 'addClass']('text-danger');
            $('#txEthStatus')[oTx.success ? 'addClass' : 'removeClass']('text-success');
            $('#txEthStatus').html(oTx.success ? 'Success' : 'Failed' + (oTx.failedReason ? (': ' + Ethplorer.getTxErrorReason(oTx.failedReason)) : ''));
            $('#tx-status').addClass(oTx.success ? 'green' : 'red');
        }else{
            $('#txEthStatus').removeClass('text-danger text-success');
            $('#txEthStatus').html('Pending');
        }

        $('#tx-parsed').hide();
        if(oTx.input.length){
            oTx.input = oTx.input.toUpperCase().replace(/^0x/i, '');
            Ethplorer.dataFields['transaction-tx-input'] = {
                hex: oTx.input,
                ascii: Ethplorer.Utils.hex2ascii(oTx.input)
            };
            var obj = Ethplorer.Utils.parseJData(oTx.input);
            if(false !== obj){
                $('#transaction-tx-parsed').text(JSON.stringify(obj, null, 4));
                $('#tx-parsed').show();
                if(obj.description){
                    var msg = obj.description;
                    if(obj.link){
                        msg = msg + ' ' + obj.link;
                    }
                    $('#transaction-tx-message').text(msg);
                    var msgHTML = $('#transaction-tx-message').html();
                    msgHTML = msgHTML.replace(/http[s]?\:\/\/[^\s]*/g, '<a href="$&" target="_blank">$&</a>');
                    msgHTML = msgHTML.replace(/\n/g, '<br />');
                    $('#transaction-tx-message').html(msgHTML);
                }
            }
        }

        Ethplorer.fillValues('transaction', txData, ['tx', 'tx.from', 'tx.to', 'tx.creates', 'tx.value', 'tx.timestamp', 'tx.gasLimit', 'tx.gasUsed', 'tx.gasPrice', 'tx.fee', 'tx.nonce', 'tx.blockNumber', 'tx.confirmations', 'tx.input']);

        if(txData.token){
            var oToken = Ethplorer.prepareToken(txData.token);
            $('.token-name:eq(0)').html(Ethplorer.Utils.getEthplorerLink(txData.tx.to, ('N/A' !== oToken.name) ? oToken.name : '[ERC20]', false));
            $('.token-name:eq(1)').html(Ethplorer.Utils.getEthplorerLink(txData.tx.to, oToken.name , false));
            txData.token = oToken;

            Ethplorer.fillValues('transaction', txData, ['token', 'token.timestamp', 'token.contract', 'token.symbol', 'token.decimals', 'token.owner', 'token.totalSupply']);
            
            if($('#transaction-tx-message').html()){
                $('#transfer-tx-message').html($('#transaction-tx-message').html());
                $('#transaction-tx-message').html('')
            }
            
            if(txData.operation){
                var oOperation = txData.operation;
                $('.token-operation-type').text(oOperation['type']);
                if('undefined' !== typeof(oOperation.value)){
                    oOperation.value = Ethplorer.Utils.toBig(oOperation.value).div(Math.pow(10, oToken.decimals));
                    oOperation.value = Ethplorer.Utils.formatNum(oOperation.value, true, oToken.decimals, true) + ' ' + oToken.symbol;
                }
                Ethplorer.fillValues('transfer', txData, ['operation', 'operation.from', 'operation.to', 'operation.value']);
                if(oTx.blockNumber){
                    $('#txTokenStatus')[oOperation.success ? 'removeClass' : 'addClass']('text-danger');
                    $('#txTokenStatus')[oOperation.success ? 'addClass' : 'removeClass']('text-success');                           
                    $('#txTokenStatus').html(oOperation.success ? 'Success' : 'Failed' + (oOperation.failedReason ? (': ' + Ethplorer.getTxErrorReason(oOperation.failedReason)) : ''));
                    $('#operation-status').addClass(oOperation.success ? 'green' : 'red');
                }
            }else{
                $('.token-operation-type').text('Operation');
                if(oTx.blockNumber){
                    $('#txTokenStatus')[oTx.success ? 'removeClass' : 'addClass']('text-danger');
                    $('#txTokenStatus')[oTx.success ? 'addClass' : 'removeClass']('text-success');           
                    $('#txTokenStatus').html(oTx.success ? 'Success' : 'Failed' + (oTx.failedReason ? (': ' + Ethplorer.getTxErrorReason(oTx.failedReason)) : ''));
                    $('#operation-status').addClass(oTx.success ? 'green' : 'red');
                }
            }
            if(!oTx.blockNumber){
                $('#txTokenStatus').removeClass('text-danger text-success');
                $('#txTokenStatus').html('Pending');
            }        
            Ethplorer.fillValues('transfer', txData, ['tx', 'tx.timestamp']);
        }

        Ethplorer.Utils.hideEmptyFields();
        Ethplorer.hideLoader();
        $('#disqus_thread').show();
        $('#txDetails').show();
        $("table").find("tr:visible:odd").addClass("odd");
        $("table").find("tr:visible:even").addClass("even");
        $("table").find("tr:visible:last").addClass("last");
    },

    getAddressDetails: function(address){
        // Check Address format first
        address = address.toLowerCase();
        if(!Ethplorer.Utils.isAddress(address)){
            Ethplorer.error('Invalid address format');
            return;
        }    
        $.getJSON(Ethplorer.Config.phpService, {data: address}, function(_address){
            return function(data){
                Ethplorer.showAddressDetails(_address, data);
            }
        }(address));
    },

    showAddressDetails: function(address, data){
        $('.address-type').text(data.isContract ? 'Contract' : 'Address');
        $('#address-issuances').hide();
        var tp = data.isContract ? 'Contract address ' : 'Address ';
        $('#ethplorer-path').html('<b>' + tp + '</b> ' + address);
        data.address = address;
        data.balance = parseFloat(data.balance) * 1e+18;
        Ethplorer.fillValues('address', data, ['address', 'balance']);
        $('#address-token-balances, #address-token-details').hide();
        if(data.isContract && data.token){
            $('#address-token-details').show();
            var oToken = Ethplorer.prepareToken(data.token);
            if(data.contract && data.contract.code){
                var json = Ethplorer.Utils.parseJData(data.contract.code);
                if(json && json.description){
                    oToken.description = json.description;
                }
            }
            if(oToken.description){
                oToken.description = oToken.description.replace(/http[s]?\:\/\/[^\s]*/g, '<a href="$&" target="_blank">$&</a>');
                oToken.description = oToken.description.replace(/\n/g, '<br />');                    
            }
            $('.address-token-name').text(oToken.name);
            if(data.issuances && data.issuances.length){
                $('#address-issuances').show();
                for(var i=0; i<data.issuances.length; i++){
                    var tx = data.issuances[i];
                    var qty = Ethplorer.Utils.toBig(tx.value);
                    if(parseInt(qty.toString())){
                        var qty = Ethplorer.Utils.toBig(tx.value).div(Math.pow(10, oToken.decimals));
                        var row = $('<tr>');
                        var tdDate = $('<td>');
                        var tdHash = $('<td>').addClass('list-field table-hash-field');
                        var tdOpType = $('<td>').addClass('text-center table-type-field');
                        var tdQty = $('<td>').addClass('text-right');
                        tdDate.html(Ethplorer.Utils.getEthplorerLink(tx.transactionHash, Ethplorer.Utils.ts2date(tx.timestamp, false), false));
                        tdHash.html(Ethplorer.Utils.getEthplorerLink(tx.transactionHash));
                        tdOpType.html(tx.type === 'issuance' ? 'Issuance' : 'Burn');
                        tdQty.html((tx.type === 'issuance' ? '+' : '-') + Ethplorer.Utils.formatNum(qty, true, oToken.decimals ? oToken.decimals : 18, 2) + ((oToken.symbol) ? '&nbsp;' + oToken.symbol : ''));
                        row.append(tdDate, tdHash, tdOpType, tdQty);
                        $('#address-issuances .table').append(row);
                    }
                }
            }
            var fields = ['token', 'token.name', 'token.description', 'token.owner', 'token.totalSupply', 'token.decimals', 'token.symbol', 'token.txsCount'];
            Ethplorer.fillValues('address', data, fields);
        }else if(data.balances && data.balances.length){
            $('#address-token-balances').show();
            for(var k=0; k<data.balances.length; k++){
                var balance = data.balances[k];
                var oToken = Ethplorer.prepareToken(data.tokens[balance.contract]);
                var row = $('<TR>');
                row.append('<TD>' + Ethplorer.Utils.getEthplorerLink(balance.contract, oToken.name, false) + '</TD>');
                var qty = Ethplorer.Utils.toBig(balance.balance).div(Math.pow(10, oToken.decimals));
                var value = Ethplorer.Utils.formatNum(qty, true, oToken.decimals) + ' ' + oToken.symbol;
                row.append('<TD>' + value + '</TD>');
                row.find('td:eq(1)').addClass('text-right');
                $('#address-token-balances table').append(row);
            }
        }

        if(data.transfers && data.transfers.length){
            var tableId = data.token ? 'address-token-transfers' : 'address-transfers';
            $('#' + tableId).show();
            for(var i=0; i<data.transfers.length; i++){
                var tx = data.transfers[i];
                var qty = Ethplorer.Utils.toBig(tx.value);
                if(parseInt(qty.toString())){
                    var txToken = Ethplorer.prepareToken(data.token ? oToken : data.tokens[tx.contract]);
                    qty = qty.div(Math.pow(10, txToken.decimals));
                    var row = $('<tr>');
                    var tdDate = $('<td>').addClass('hide-small');
                    var tdData = $('<td>');
                    var divData = $('<div>').addClass('hash-from-to');
                    var tdQty = $('<td>').addClass('hide-small text-right');
                    var date = Ethplorer.Utils.ts2date(tx.timestamp, false);
                    var value = Ethplorer.Utils.formatNum(qty, true, txToken.decimals ? txToken.decimals : 18, 2) + ' ' + txToken.symbol;
                    var token = Ethplorer.Utils.getEthplorerLink(tx.contract, txToken.name, false);
                    tdDate.html(Ethplorer.Utils.getEthplorerLink(tx.transactionHash, date, false));
                    divData.html(
                        '<span class="show_small">Date:&nbsp;' + date + '<br></span>' +
                        (!data.token ? ('<span class="address-token-inline">Token:&nbsp;' + token + '<br></span>') : '') +
                        '<span class="show_small">Value:&nbsp;' + value + '<br></span>' +                        
                        'Tx:&nbsp;' + Ethplorer.Utils.getEthplorerLink(tx.transactionHash) + '<br>' +
                        'From:&nbsp;' + Ethplorer.Utils.getEthplorerLink(tx.from) + '<br>' +
                        'To:&nbsp;' + Ethplorer.Utils.getEthplorerLink(tx.to)
                    );
                    tdQty.html(value);
                    tdData.append(divData);
                    row.append(tdDate, tdData);
                    if(!data.token){
                        var tdToken = $('<td>');
                        tdToken.addClass('address-token');
                        tdToken.html(token);
                        row.append(tdToken);
                    }                    
                    row.append(tdQty);
                    $('#' + tableId + ' .table').append(row);
                }
            }
        }

        Ethplorer.Utils.hideEmptyFields();
        Ethplorer.hideLoader();
        $('#disqus_thread').show();
        $('#addressDetails').show();
        $("table").find("tr:visible:odd").addClass("odd");
        $("table").find("tr:visible:even").addClass("even");
        $("table").find("tr:visible:last").addClass("last");
    },

    prepareToken: function(oToken){
        var predefined = {
            '0xbb9bc244d798123fde783fcc1c72d3bb8c189413': {name: 'The DAO', decimals: 16, symbol: 'DAO Tokens'},
            '0xe0b7927c4af23765cb51314a0e0521a9645f0e2a': {name: 'DGD', decimals: 9, symbol: 'DGD'},
            '0x74c1e4b8cae59269ec1d85d3d4f324396048f4ac': {name: 'BeerCoin', decimals: 0, symbol: ''}
        }
        if(!oToken){
            oToken = {name: '', decimals: 0, symbol: '', totalSupply: 0};
        }
        if(oToken.prepared){
            return oToken;
        }
        if(oToken.address && ('undefined' !== typeof(predefined[oToken.address]))){
            oToken.name = predefined[oToken.address].name;
            oToken.decimals = predefined[oToken.address].decimals;
            oToken.symbol = predefined[oToken.address].symbol;
        }
        oToken.totalSupply = Ethplorer.Utils.toBig(oToken.totalSupply);
        if(oToken.decimals){
            oToken.decimals = parseInt(Ethplorer.Utils.toBig(oToken.decimals).toString());
            // To handle ether-like tokens with 18 decimals
            if(parseInt(oToken.totalSupply.toString()) >= 1e+18){
                if(!oToken.decimals){
                    oToken.decimals = 18;
                }
            }
            if(oToken.decimals > 20){ // Too many decimals, must be invalid value, use 0 instead
                oToken.decimals = 0;
            }
            oToken.totalSupply = oToken.totalSupply.div(Math.pow(10, oToken.decimals));
        }
        oToken.totalSupply = Ethplorer.Utils.formatNum(oToken.totalSupply, true, oToken.decimals, true);
        if(oToken.symbol){
            oToken.totalSupply = oToken.totalSupply + ' ' + oToken.symbol;
        }
        if(!oToken.name){
            oToken.name = 'N/A';
        }
        if(!oToken.owner || (oToken.owner && ('0x' === oToken.owner))){
            oToken.owner = '';
        }
        oToken.prepared  = true;
        return oToken;
    },

    convert: function(id, switcher){
        switcher = $(switcher);
        var pre = $('#' + id);
        var mode = pre.attr('data-mode');
        if('ascii' === mode){
            pre.text(Ethplorer.dataFields[id].hex);
            pre.attr('data-mode', 'hex');
            switcher.text('ASCII');
        }else{
            pre.text(Ethplorer.dataFields[id].ascii);
            pre.attr('data-mode', 'ascii');
            switcher.text('HEX');
        }
    },

    search: function(value){
        value = value.replace(/^\s+/, '').replace(/\s+$/, '');
        if(Ethplorer.Utils.isAddress(value)){
            document.location.href = '/address/' + value;
            return;
        }
        if(Ethplorer.Utils.isTx(value)){
            document.location.href = '/tx/' + value;
            return;
        }
        $('#search').val('');
        Ethplorer.error('Nothing found');
    },

    showTokenDetails: function(address){
        Ethplorer.hideLoader();
        $('#tokenDetails').show();
    },

    fillValues: function(prefix, data, keys){
        for(var key in data){
            if(keys.indexOf(key) >= 0){
                if('object' == typeof(data[key])){
                    for(var sub in data[key]){
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
        var type = $('#' + id).attr('data-type') || 'none';
        var options = $('#' + id).attr('data-options') ? $('#' + id).attr('data-options').split('|') : [];
        switch(type){
            case 'int':
            case 'float':
                value = Ethplorer.Utils.formatNum(value, 'float' === type);
                break;
            case 'ether':
                value = Ethplorer.Utils.formatNum(Ethplorer.Utils.toBig(value).div(1e+18), true, 18, true) + ' ETHER';
                break;
            case 'ethplorer':
                value = Ethplorer.Utils.getEthplorerLink(value, value, (options.indexOf('no-contract') < 0) ? Ethplorer.knownContracts.indexOf(value) >= 0 : false);
                break;                
            case 'etherscan':
                value = Ethplorer.Utils.getEtherscanLink(value, value, (options.indexOf('no-contract') < 0) ? Ethplorer.knownContracts.indexOf(value) >= 0 : false);
                break;
            case 'localdate':
                value = Ethplorer.Utils.ts2date(value, true);
                break;
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
        setTimeout(function(){ $('#disqus_thread iframe').css('height', ''); }, 100);
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
            if(('object' === typeof(num)) && ('undefined' !== typeof(num.c))){
                num = parseFloat(Ethplorer.Utils.toBig(num).toString());
            }
            cutZeroes = !!cutZeroes;
            withDecimals = !!withDecimals;
            decimals = decimals || 2;
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
        isAddress: function(address){
            return /^0x[0-9a-f]{40}$/.test(address.toString().toLowerCase());
        },
        isTx: function(hash){
            return /^0x[0-9a-f]{64}$/.test(hash.toString().toLowerCase());
        },
        getEtherscanLink: function(data, text, isContract){
            text = text || data;
            var urlEtherscan = Ethplorer.Utils.getEtherscanAddress();
            if(!/^0x/.test(data)){
                return text;
            }
            var isTx = Ethplorer.Utils.isTx(data);
            var res = '<a target="_blank" class="external-link" href="' + urlEtherscan;
            res += (isTx ? 'tx' : 'address');
            res += ('/' + data + '"><i class="fa fa-external-link"></i>&nbsp;' + text + '</a>');
            if(isContract){
                res = 'Contract ' + res;
            }        
            return res;
        },

        getEthplorerLink: function(data, text, isContract){
            text = text || data;
            if(!/^0x/.test(data)){
                return text;
            }
            var isTx = Ethplorer.Utils.isTx(data);
            var res = '<a href="/';
            res += (isTx ? 'tx' : 'address');
            res += ('/' + data + '"  class="local-link">' + text + '</a>');
            if(isContract){
                res = 'Contract ' + res;
            }        
            return res;
        },

        // Date with fixed GMT to local date
        ts2date: function(ts, withGMT){
            withGMT = 'undefined' !== typeof(withGMT) ? withGMT : true;
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

        hideEmptyFields: function(){
            $('.list-field').parents('TR').show();
            $('.list-field:empty').parents('TR').hide();
        },

        ascii2hex: function(text){
            var res = [];
            for (var i=0; i<text.length; i++){
		var hex = Number(text.charCodeAt(i)).toString(16);
		res.push(hex);
            }
            return res.join('');
        },

        hex2ascii: function(data){
            return data.match(/.{1,2}/g).map(function(v){
                return String.fromCharCode(parseInt(v, 16));
            }).join('');
        },

        parseJData: function(hex){
            var str = Ethplorer.Utils.hex2ascii(hex);
            var res = false;
            var i1 = str.indexOf('{');
            var i2 = str.indexOf('}');
            if(i1 >= 0 && i2 >= 0 && i1 < i2){
                var jstr = str.substr(i1, i2 - i1 + 1);
                try {
                    res = JSON.parse(jstr);
                }catch(e){}
            }
            return res;
        },

        toBig: function(obj){
            var res = new BigNumber(0);
            if(obj && 'undefined' !== typeof(obj.c)){
                res.c = obj.c;
                res.e = obj.e;
                res.s = obj.s;
            }else{
                res = new BigNumber(obj);
            }
            return res;
        },
    }
};

$(document).ready(function(){
    Ethplorer.init();
});
