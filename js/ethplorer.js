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
    service: "/service/service.php",
    init: function(){
        BigNumber.config({ ERRORS: false });
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
        $(document).on('click', '.tx-details-link', function(){
            localStorage['tx-details-block'] = 'open';
            $('.tx-details-link').addClass('closed');
            $('#tx-details-block').show();
        });
        $(document).on('click', '.tx-details-close', function(){
            localStorage['tx-details-block'] = 'closed';
            $('.tx-details-link').removeClass('closed');
            $('#tx-details-block').hide();
        });
        if(localStorage && ('undefined' !== typeof(localStorage['tx-details-block']))){
            if('open' === localStorage['tx-details-block']){
                $('.tx-details-link').addClass('closed');
                $('#tx-details-block').show();
            }else{
                $('.tx-details-link').removeClass('closed');
                $('#tx-details-block').hide();
            }
        }   
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
        $.getJSON(Ethplorer.service, {data: txHash}, function(_txHash){
            return function(data){
                Ethplorer.showTxDetails(_txHash, data);
            }
        }(txHash));
    },

    knownContracts: [],
    dataFields: {},
    
    showOpDetails: function(oTx, op){
        var titleAdd = '';
        var oToken = Ethplorer.prepareToken(op.token);
        var tokenName = ('N/A' !== oToken.name) ? oToken.name : '[ERC20]';
        titleAdd += (tokenName + ' ');
        $('.token-name:eq(0)').html(Ethplorer.Utils.getEthplorerLink(oToken.address, tokenName, false));
        $('.token-name:eq(1)').html(Ethplorer.Utils.getEthplorerLink(oToken.address, oToken.name , false));
        var txData = {tx: oTx, operation: op, token: oToken};
        
        $('.token-related td.list-field').empty();
        Ethplorer.fillValues('transaction', txData, ['token', 'token.timestamp', 'token.contract', 'token.symbol', 'token.decimals', 'token.owner', 'token.totalSupply']);

        $('#transfer-tx-timestamp').html($('#transaction-tx-timestamp').html());

        if($('#transaction-tx-message').html()){
            $('#transfer-tx-message').html($('#transaction-tx-message').html());
            $('#transaction-tx-message').html('')
        }
        var oOperation = txData.operation;
        // Temporary workaround
        if(oOperation.type == 'Mint'){
            oOperation.type = 'Issuance';
        }

        if('undefined' !== typeof(oOperation.value)){
            oOperation.value = Ethplorer.Utils.toBig(oOperation.value).div(Math.pow(10, oToken.decimals));
            oOperation.value = Ethplorer.Utils.formatNum(oOperation.value, true, oToken.decimals, true);
            oOperation.value = oToken.symbol ? (oOperation.value + ' ' + oToken.symbol) : oOperation.value;
        }

        titleAdd += oOperation.type;
        $('.token-operation-type').text(oOperation['type']);
        Ethplorer.fillValues('transfer', txData, ['operation', 'operation.from', 'operation.to', 'operation.value']);
        if(oTx.blockNumber){
            $('#txTokenStatus')[oOperation.success ? 'removeClass' : 'addClass']('text-danger');
            $('#txTokenStatus')[oOperation.success ? 'addClass' : 'removeClass']('text-success');                           
            $('#txTokenStatus').html(oOperation.success ? 'Success' : 'Failed' + (oOperation.failedReason ? (': ' + Ethplorer.getTxErrorReason(oOperation.failedReason)) : ''));
            $('#operation-status').addClass(oOperation.success ? 'green' : 'red');
        }
        document.title = 'Ethplorer: ' + (titleAdd ? (titleAdd + ' -') : '');
        Ethplorer.Utils.hideEmptyFields();
    },
    
    
    showTxDetails: function(txHash, txData){
        // $('#ethplorer-path').html('<h1>Transaction hash: ' + txHash + '</h1>');
        $('#ethplorer-path').show();

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

        var titleAdd = '';

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
                var isChainy = false;
                if(('undefined' !== typeof(obj['id'])) && ('CHAINY' === obj['id'])){
                    // Chainy transaction
                    var chainyTypes = {
                        'R': 'Redirect',
                        'T': 'Text',
                        'H': 'Hash',
                        'L': 'File Hash',
                        'E': 'Encrypted'
                    };
                    titleAdd = 'Chainy ' + chainyTypes[obj['type']];
                    $('#chainy-op').text(chainyTypes[obj['type']]);
                    if('undefined' !== typeof(obj['url'])){
                        $('#chainy-url').html('<a href="' + obj['url'] + '" target="_blank" class="external-link"><i class="fa fa-external-link"></i>&nbsp;' + obj['url'] + '</a>');
                    }
                    var aFields = ['hash', 'filename', 'filesize', 'description'];
                    for(var f = 0; f < aFields.length; f++){
                        var fld = aFields[f];
                        if('undefined' !== typeof(obj[fld])){
                            $('#chainy-' + fld).text(obj[fld]);
                        }
                    }
                    var log = oTx.receipt && oTx.receipt.logs && oTx.receipt.logs.length ? oTx.receipt.logs[0] : false;
                    if(log && log.topics && log.topics.length && (0 === log.topics[0].indexOf("0xdad5c"))){
                        try {
                            var data = log.data.slice(192).replace(/0+$/, '');
                            var link = Ethplorer.Utils.hex2ascii(data);
                            $('#chainy-link').html('<a href="' + link + '" target="_blank" class="local-link"><i class="fa fa-external-link"></i>&nbsp;' + link + '</a>');
                        }catch(e){}
                    }
                    $('.chainy').show();
                    isChainy = true;
                }
                if(obj.description){
                    var msg = obj.description;
                    if(obj.link){
                        msg = msg + ' ' + obj.link;
                    }
                    var msgid = isChainy ? "#chainy-message" : '#transaction-tx-message';
                    msg = $('<span>').text(msg).html();
                    msg = msg.replace(/http[s]?\:\/\/[^\s]*/g, '<a href="$&" target="_blank">$&</a>');
                    msg = msg.replace(/\n/g, '<br />');
                    $(msgid).html(msg);
                }
            }
        }

        Ethplorer.fillValues('transaction', txData, ['tx', 'tx.from', 'tx.to', 'tx.creates', 'tx.value', 'tx.timestamp', 'tx.gasLimit', 'tx.gasUsed', 'tx.gasPrice', 'tx.fee', 'tx.nonce', 'tx.blockNumber', 'tx.confirmations', 'tx.input']);


        if(txData.token){
            var oToken = Ethplorer.prepareToken(txData.token);
            var tokenName = ('N/A' !== oToken.name) ? oToken.name : '[ERC20]';
            titleAdd += (tokenName + ' ');
            $('.token-name:eq(0)').html(Ethplorer.Utils.getEthplorerLink(oToken.address, tokenName, false));
            $('.token-name:eq(1)').html(Ethplorer.Utils.getEthplorerLink(oToken.address, oToken.name , false));
            
            if(oToken.image){
                var img = Ethplorer.Utils.getEthplorerLink(oToken.address, '##IMG##', false);
                $('.token-related:eq(1) .block-header').prepend(
                    img.replace('##IMG##', '<img src="' + oToken.image + '" style="max-width:32px;max-height:32px;margin:8px;margin-left:20px;" align="left">')
                );
            }            
            
            txData.token = oToken;

            Ethplorer.fillValues('transaction', txData, ['token', 'token.timestamp', 'token.contract', 'token.symbol', 'token.decimals', 'token.owner', 'token.totalSupply']);
            
            if($('#transaction-tx-message').html()){
                $('#transfer-tx-message').html($('#transaction-tx-message').html());
                $('#transaction-tx-message').html('')
            }

            if(txData.operations && txData.operations.length){
                txData.operation = txData.operations[txData.operations.length - 1];
                var multiop = txData.operations.length > 1;
                for(var i=0; i<txData.operations.length; i++){
                    var idx = i; // txData.operations.length - i - 1;
                    var op = txData.operations[idx];
                    var pos = ('undefined' !== typeof(op.priority)) ? op.priority : idx;
                    op.index = idx;
                    var opToken = Ethplorer.prepareToken(op.token);
                    if('undefined' !== typeof(op.value)){
                        op.value = Ethplorer.Utils.toBig(op.value).div(Math.pow(10, opToken.decimals));
                        op.value = Ethplorer.Utils.formatNum(op.value, true, opToken.decimals, true);
                        op.value = opToken.symbol ? (op.value + ' ' + opToken.symbol) : op.value;
                        op.symbol = opToken.symbol;
                    }
                    var opParties = '';
                    if(op.address){
                        op.to = op.address;
                        var address = op.address;
                        opParties = '<span class="cuttable-address">for ' + address + '</span>';
                    }else if(op.from && op.to){
                        var from = '<span class="cuttable-address">from ' + op.from + '</span>';
                        var to = '<span class="cuttable-address">to ' + op.to + '</span>';
                        opParties = from + '<br class="show_small"> ' + to;
                    }
                    if(multiop){
                        var row = $(
                            '<tr data-op-idx="' + pos + '">' + 
                            '<td><a class="dashed">Details</a></td>' +
                            '<td><span class="dash_on_hover">' + op.type.toString().toUpperCase() +
                            '<span class="show_small"> ' + op.value + ' ' + op.symbol + '</span>' +
                            '<br class="show_small"> ' + opParties + '</span></td>' + 
                            '<td class="text-right"><span class="dash_on_hover">' + op.value + '</span></td>' +
                            '<td><span class="dash_on_hover">' + op.symbol + '</span></td>' +
                            '<td></td>' +
                            '</tr>'
                        );
                        row[0].operation = op;
                        row.click(function(_tx){
                            return function(){
                                if($(this).hasClass('selectable')){
                                    $(this).removeClass('selectable');
                                    $('.multiop .blue').addClass('selectable');
                                    $('.multiop .blue').removeClass('blue');
                                    $(this).addClass('blue');
                                    $('.token-related').animate({opacity:0.1}, 250, function(){
                                        $('.token-related').animate({opacity:1}, 250);
                                    });
                                    setTimeout(function(__tx, _op){
                                        return function(){
                                            Ethplorer.showOpDetails(__tx, _op);
                                        };
                                    }(_tx, this.operation), 250);
                                    document.location.hash = ('undefined' !== typeof(this.operation.priority)) ? this.operation.priority : this.operation.index;
                                }
                            };
                        }(oTx));
                        $('.multiop table').append(row);
                    }
                }
                if(multiop){
                    $('.multiop table tr').addClass('selectable');
                    $('.multiop table tr:eq(0)').removeClass('selectable').addClass('blue');                    
                    $('.multiop .block-header h3').text(txData.operations.length + ' internal operations found');
                    $('.multiop').show();
                }

                var oOperation = txData.operation;
                // Temporary workaround
                if(oOperation.type == 'Mint'){
                    oOperation.type = 'Issuance';
                }
                titleAdd += oOperation.type;
                $('.token-operation-type').text(oOperation.type);
                Ethplorer.fillValues('transfer', txData, ['operation', 'operation.from', 'operation.to', 'operation.value']);
                if(oTx.blockNumber){
                    $('#txTokenStatus')[oOperation.success ? 'removeClass' : 'addClass']('text-danger');
                    $('#txTokenStatus')[oOperation.success ? 'addClass' : 'removeClass']('text-success');                           
                    $('#txTokenStatus').html(oOperation.success ? 'Success' : 'Failed' + (oOperation.failedReason ? (': ' + Ethplorer.getTxErrorReason(oOperation.failedReason)) : ''));
                    $('#operation-status').addClass(oOperation.success ? 'green' : 'red');
                }
            }else{
                titleAdd += 'Operation';
                $('.token-operation-type').text('Operation');
                if(oTx.receipt && oTx.receipt.logs && oTx.receipt.logs.length){
                    for(var i=0; i<oTx.receipt.logs.length; i++){
                        var log = oTx.receipt.logs[i];
                        // Error event
                        if(log.topics && log.topics.length && (0 === log.topics[0].indexOf('0x19f3a4'))){
                            oTx.success = false;
                            oTx.failedReason = Ethplorer.Utils.hex2ascii(log.data.substr(192))
                            break;
                        }
                    }
                }
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

        document.title = 'Ethplorer';
        document.title += (': ' + (titleAdd ? (titleAdd + ' -') : ''));
        document.title += (' hash ' + txHash);

        var hash = document.location.hash.replace(/^\#/, '');
        if(hash && hash.length){
            var idx = parseInt(hash);
            var el = $('[data-op-idx=' + idx + ']');
            if(el.length && ('undefined' !== typeof(el[0].operation))){
                $('.multiop .blue').addClass('selectable');
                $('.multiop .blue').removeClass('blue');
                el.addClass('blue');
                el.removeClass('selectable');
                Ethplorer.showOpDetails(txData.tx, el[0].operation);
            }
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
        $.getJSON(Ethplorer.service, {data: address}, function(_address){
            return function(data){
                Ethplorer.showAddressDetails(_address, data);
            }
        }(address));
    },

    showAddressDetails: function(address, data){
        var titleAdd = '';
        // Temporary hack
        $('.address-type').text(data.isContract ? 'Contract' : 'Address');
        $('#address-issuances').hide();
        var tp = data.isContract ? 'Contract address ' : 'Address ';
        // $('#ethplorer-path').html('<b>' + tp + '</b> ' + address);
        $('#ethplorer-path').show();
        data.address = address;
        data.balance = parseFloat(data.balance) * 1e+18;
        Ethplorer.fillValues('address', data, ['address', 'balance']);
        $('#address-token-balances, #address-token-details').hide();
        if(data.isContract && data.contract.isChainy){
            titleAdd = 'Chainy Information';
            var fields = ['contract', 'contract.txsCount'];
            Ethplorer.fillValues('address', data, fields);
            $('.address-type:eq(0)').text('Chainy');
            if(data.chainy && data.chainy.length){
                $('#address-chainy-tx').show();
                for(var i=0; i<data.chainy.length; i++){
                    var tx = data.chainy[i];
                    var type = '';
                    var link = '';
                    if(tx.link){
                        var obj = Ethplorer.Utils.parseJData(tx.input);
                        if(false !== obj){
                            var chainyTypes = {
                                'R': 'Redirect',
                                'T': 'Text',
                                'H': 'Hash',
                                'L': 'File Hash',
                                'E': 'Encrypted'
                            };
                            type = chainyTypes[obj.type];
                        }
                        link = Ethplorer.Utils.hex2ascii(tx.link);
                        link = '<a href="' + link + '" target="_blank" class="external-link"><i class="fa fa-external-link"></i>&nbsp;' + link + '</a>';
                    }
                    var row = $('<tr>');
                    var tdDate = $('<td>');
                    var tdHash = $('<td>').addClass('list-field table-hash-field');
                    var tdOpType = $('<td>').addClass('text-center table-type-field');                   
                    var tdLink = $('<td>');
                    tdDate.html(Ethplorer.Utils.getEthplorerLink(tx.hash, Ethplorer.Utils.ts2date(tx.timestamp, false), false));
                    tdDate.find('a').attr('title', Ethplorer.Utils.ts2date(tx.timestamp, true));
                    tdHash.html(Ethplorer.Utils.getEthplorerLink(tx.hash));
                    tdOpType.html(type);
                    if('Text' === type){
                        tdOpType.append('<span class="chainy-text"></span>');
                        tdOpType.find('.chainy-text').text(obj.description.substr(0, 32));
                        tdOpType.find('.chainy-text').attr('title', obj.description);
                    }
                    tdLink.html(link);
                    row.append(tdDate, tdHash, tdOpType, tdLink);
                    $('#address-chainy-tx .table').append(row);
                }
            }            
        }
        if(data.isContract){
            Ethplorer.fillValues('address', data, ['contract', 'contract.creator']);
        }
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
                oToken.description = $('<span>').text(oToken.description).html();
                oToken.description = oToken.description.replace(/http[s]?\:\/\/[^\s]*/g, '<a href="$&" target="_blank">$&</a>');
                oToken.description = oToken.description.replace(/\n/g, '<br />');
            }
            if(oToken.image){
                $('#address-token-details .block-header').prepend(
                    '<img src="' + oToken.image + '" style="max-width:32px;max-height:32px;margin:8px;margin-left:20px;" align="left">'
                );
            }

            titleAdd = 'Token ' + oToken.name + (oToken.symbol ? (' [' + oToken.symbol + ']') : '' ) + ' Information';
            $('.address-token-name').text(oToken.name);
            if(Ethplorer.Config.updateLink){
                $('.address-token-name:eq(0)').append('<a href="' + Ethplorer.Config.updateLink + '" target="_blank" class="token-update">Update</a>')
            }
            if(data.issuances && data.issuances.length){
                if(50 === data.issuances.length){
                    $('#address-issuances .block-header').html($('#address-issuances .block-header').html().replace('Issuances', 'Last 50 Issuances'))
                }
                $('#address-issuances').show();
                for(var i=0; i<data.issuances.length; i++){
                    var tx = data.issuances[i];
                    // Temporary workaround
                    if(tx.type == 'mint'){
                        tx.type = 'issuance';
                    }
                    var qty = Ethplorer.Utils.toBig(tx.value);
                    if(parseInt(qty.toString())){
                        var qty = Ethplorer.Utils.toBig(tx.value).div(Math.pow(10, oToken.decimals));
                        var row = $('<tr>');
                        var tdDate = $('<td>');
                        var tdHash = $('<td>').addClass('list-field table-hash-field');
                        var tdOpType = $('<td>').addClass('text-center table-type-field');
                        var tdQty = $('<td>').addClass('text-right ' + (tx.type !== 'burn') ? 'incoming' : 'outgoing');
                        tdDate.html(Ethplorer.Utils.getEthplorerLink(tx.transactionHash, Ethplorer.Utils.ts2date(tx.timestamp, false), false));
                        tdDate.find('a').attr('title', Ethplorer.Utils.ts2date(tx.timestamp, true));
                        tdHash.html(Ethplorer.Utils.getEthplorerLink(tx.transactionHash));
                        tdOpType.html(tx.type.toString().toUpperCase());
                        tdQty.html((tx.type !== 'burn' ? '+' : '-') + Ethplorer.Utils.formatNum(qty, true, oToken.decimals ? oToken.decimals : 18, 2) + ((oToken.symbol) ? '&nbsp;' + oToken.symbol : ''));
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
                if(balance.totalIn || balance.totalOut){
                    var oToken = Ethplorer.prepareToken(data.tokens[balance.contract]);
                    var row = $('<TR>');
                    row.append('<TD>' + Ethplorer.Utils.getEthplorerLink(balance.contract, oToken.name, false) + '</TD>');
                    var qty = Ethplorer.Utils.toBig(balance.balance).div(Math.pow(10, oToken.decimals));
                    var value = Ethplorer.Utils.formatNum(qty, true, oToken.decimals, true) + ' ' + oToken.symbol;
                    value += '<br />';
                    var totalIn = Ethplorer.Utils.toBig(balance.totalIn).div(Math.pow(10, oToken.decimals));
                    var totalOut = Ethplorer.Utils.toBig(balance.totalOut).div(Math.pow(10, oToken.decimals));
                    value += ('<div class="total-in-out-small">Total In: ' + Ethplorer.Utils.formatNum(totalIn, true, oToken.decimals, true) + '<br />');
                    value += ('Total Out: ' + Ethplorer.Utils.formatNum(totalOut, true, oToken.decimals, true) + '</div>');
                    row.append('<TD>' + value + '</TD>');
                    row.find('td:eq(1)').addClass('text-right');
                    $('#address-token-balances table').append(row);
                }                
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
                    var from = tx.from ? ((tx.from !== address) ? Ethplorer.Utils.getEthplorerLink(tx.from) : ('<span class="same-address">' + address + '</span>')) : false;
                    var to = tx.to ? ((tx.to !== address) ? Ethplorer.Utils.getEthplorerLink(tx.to) : ('<span class="same-address">' + address + '</span>')) : false;
                    var _address = (tx.address && (tx.address === address )) ? ('<span class="same-address">' + address + '</span>') : tx.address;
                    var rowClass = '';
                    if(from && (tx.from === address)){
                        value = '-' + value;
                        rowClass = 'outgoing';
                    }else if(to && (tx.to === address)){
                        rowClass = 'incoming';
                    }else if(tx.address === address){
                        if('burn' === tx.type){
                            rowClass = 'outgoing';
                        }else{
                            rowClass = 'incoming';
                        }
                    }
                    tdDate.html(Ethplorer.Utils.getEthplorerLink(tx.transactionHash, date, false));
                    if(!from && tx.address){
                        value = (tx.type && ('burn' === tx.type)) ? '-' + value + '<br>&#128293; Burn' : /*'+' + */value + '<br>&#9874; Issuance';
                    }
                    divData.html(
                        '<span class="show_small">Date:&nbsp;' + date + '<br></span>' +
                        (!data.token ? ('<span class="address-token-inline">Token:&nbsp;' + token + '<br></span>') : '') +
                        '<span class="show_small ' + rowClass + '">Value:&nbsp;' + value + '<br></span>' +                        
                        'Tx:&nbsp;' + Ethplorer.Utils.getEthplorerLink(tx.transactionHash) + '<br>' +
                        (from ? ('From:&nbsp;' + from + '<br>To:&nbsp;' + to) : ('Address:&nbsp;' + _address))
                    );
                    tdQty.addClass(rowClass);
                    tdQty.html(value);
                    tdData.append(divData);
                    row.append(tdDate, tdData);
                    if(!data.token){
                        var tdToken = $('<td>');
                        tdToken.addClass('address-token');
                        tdToken.html(token);
                        row.append(tdToken);
                    }
                    tdDate.find('a').attr('title', Ethplorer.Utils.ts2date(tx.timestamp, true));
                    row.append(tdQty);
                    $('#' + tableId + ' .table').append(row);
                }
            }
            if(50 === data.transfers.length){
                $('#' + tableId + ' .block-header').html($('#' + tableId + ' .block-header').html().replace('Transfers', 'Last 50 Transfers').replace('Operations', 'Last 50 Operations'))
                $('#address-transfers-more, #address-token-transfers-more').html(Ethplorer.Utils.getEtherscanLink(address, 'View full history', false));
            }
        }

        document.title = 'Ethplorer';
        document.title += (': ' + (titleAdd ? (titleAdd + ' -') : ''));
        document.title += ((data.isContract ? ' Ethereum contract ' : ' Ethereum address ') + address);

        $('.local-time-offset').text(Ethplorer.Utils.getTZOffset());
        Ethplorer.Utils.hideEmptyFields();
        Ethplorer.hideLoader();
        $('#disqus_thread').show();
        $('#addressDetails').show();
        $("table").find("tr:visible:odd").addClass("odd");
        $("table").find("tr:visible:even").addClass("even");
        $("table").find("tr:visible:last").addClass("last");
    },

    prepareToken: function(oToken){
        if(!oToken){
            oToken = {address: '', name: '', decimals: 0, symbol: '', totalSupply: 0};
        }
        if(oToken.prepared){
            return oToken;
        }
        if('undefined' === typeof(oToken.totalSupply)){
            oToken.totalSupply = 0;
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
        if(Ethplorer.Config.tokens && ('undefined' !== typeof(Ethplorer.Config.tokens[oToken.address]))){
            for(var property in Ethplorer.Config.tokens[oToken.address]){
                oToken[property] = Ethplorer.Config.tokens[oToken.address][property];
            }
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
            text = $('<span>').text(text).html();
            if(!/^0x/.test(data)){
                return text;
            }
            /*
            var urlEtherscan = Ethplorer.Utils.getEtherscanAddress();
            var isTx = Ethplorer.Utils.isTx(data);
            var res = '<a target="_blank" class="external-link" href="' + urlEtherscan;
            res += (isTx ? 'tx' : 'address');
            res += ('/' + data + '"><i class="fa fa-external-link"></i>&nbsp;' + text + '</a>');
            */
            var res = text;
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
            text = $('<span>').text(text).html();
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
            var res = '';
            var dt = new Date(ts);
            res += (dt.getFullYear() + '-' + padZero((dt.getMonth() + 1)) + '-' + padZero(dt.getDate()));
            res += ' ';
            res += (padZero(dt.getHours()) + ':' + padZero(dt.getMinutes()) + ':' + padZero(dt.getSeconds()));
            if(withGMT){
                res += (' (' + Ethplorer.Utils.getTZOffset() + ')');
            }
            return res;
        },

        getTZOffset: function(){
            var offset = -Math.round(new Date().getTimezoneOffset() / 60);
            return 'GMT' + (offset > 0 ? '+' : '-') + offset;
        },

        hideEmptyFields: function(){
            $('.list-field').parents('TR').show();
            $('.list-field:empty').parents('TR').hide();
            // Hide zero decimals
            var decimals = parseInt($('#address-token-decimals').text());
            if(!decimals){
                $('#address-token-decimals').parent().hide();
            }
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
            var res = '';
            try {
                res = data.match(/.{1,2}/g).map(function(v){
                    return String.fromCharCode(parseInt(v, 16));
                }).join('');
            } catch(e) {}
            return res;
        },

        parseJData: function(hex){
            var str = Ethplorer.Utils.hex2ascii(hex.slice(8)).replace('{{', '{').replace(/^[^{]+/, '');
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
