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
    data: {},
    pageSize: 10,
    service: "/service/service.php",
    filter: '',
    searchCache: {},
    saveData: function(){},
    init: function(){
        Ethplorer.isProd = ('ethplorer.io' === document.location.host);
        BigNumber.config({ ERRORS: false });
        Ethplorer.Nav.init();
        if(localStorage && ('undefined' !== typeof(localStorage['pageSize']))){
            Ethplorer.pageSize = localStorage['pageSize'];
            if(Ethplorer.pageSize > 10){
                Ethplorer.Nav.set('pageSize', Ethplorer.pageSize);
            }
        }
        if(Ethplorer.Nav.get('pageSize')){
            Ethplorer.pageSize = Ethplorer.Nav.get('pageSize');
        }
        if(Ethplorer.Nav.get('filter')){
            var filter = Ethplorer.Nav.get('filter');
            if(filter){
                filter = filter.toLowerCase();
                if(Ethplorer.checkFilter(filter)){
                    Ethplorer.filter = filter;
                    Ethplorer.Nav.set('filter', Ethplorer.filter);
                    $('.filter-clear').show();
                    $('#filter_list').val(Ethplorer.filter);
                    $('#filter_list').addClass('filled');
                }else{
                    Ethplorer.Nav.del('filter');                    
                }
            }
        }
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
            $("#tx-details-block").find("tr:visible:odd").addClass("odd");
            $("#tx-details-block").find("tr:visible:even").addClass("even");
            $("#tx-details-block").find("tr:visible:last").addClass("last");
        });
        $(document).on('click', '.tx-details-close', function(){
            localStorage['tx-details-block'] = 'closed';
            $('.tx-details-link').removeClass('closed');
            $('#tx-details-block').hide();
        });
        $(document).on('click', '[data-toggle="tab"]', function(){
            Ethplorer.Nav.set('tab', $(this).parent().attr('id'));
        });
        $('#download').click(function(){
            Ethplorer.downloadData($(this).attr('data-address'));
        });
        if(Ethplorer.Nav.get('tab')){
            $('#' + Ethplorer.Nav.get('tab') +' a').click();
        }
        $('.filter-clear').click(function(){
            $('#filter_list').val('');
            $('.filter-form').trigger('submit');
        });
        $('.filter-form').submit(function(e){
            e.preventDefault();
            var filter = $('#filter_list').val().toLowerCase();
            if(Ethplorer.filter != filter){
                if(filter){
                    if(Ethplorer.checkFilter(filter)){
                        $('.filter-clear').show();
                        Ethplorer.Nav.set('filter', filter);
                        $('#filter_list').addClass('filled');
                    }else{
                        if(!$('#filter-error').length){
                            var errDiv = $('<div id="filter-error">');
                            errDiv.addClass("col-xs-12 text-right");
                            errDiv.text('Invalid filter value');
                            $('.filter-box').after(errDiv);
                            $('#filter-error').show(500, function(){
                                setTimeout(function(){
                                    $('#filter-error').hide(500, function(){
                                        $('#filter-error').remove();
                                    });
                                }, 3000);
                            });
                        }
                        return;
                    }
                }else{
                    $('.filter-clear').hide();
                    $('#filter_list').removeClass('filled');
                    Ethplorer.Nav.del('filter');
                }
                Ethplorer.filter = filter;
                Ethplorer.showTableLoader();
                $('#filter_list').attr('disabled', true)
                
                // Reload active tab, set other tabs as need to reload
                Ethplorer.reloadTab(false, true);
            }
        });
        $('.nav-tabs li a').click(function(){
            var tabName = $(this).parent().attr('id').replace('tab-', '');
            if(('undefined' !== typeof(Ethplorer.reloadTabs)) && (Ethplorer.reloadTabs.indexOf(tabName) >= 0)){
                Ethplorer.reloadTab(tabName, false);
            }
            setTimeout(function(){
                $("table").find("tr:visible:last").addClass("last");
            }, 300);
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
        EthplorerSearch.init($('#search-form'), $('#search'), Ethplorer.search);

        // implement save to file function
        var URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
        if(Blob && URL){
            Ethplorer.saveData = function(data, name, mimetype){
                var blob, url;
                if(!mimetype) mimetype = 'application/octet-stream';
                if('download' in document.createElement('a')){
                    blob = new Blob([data], {type: mimetype});
                    url = URL.createObjectURL(blob);
                    var link = document.createElement('a');
                    link.setAttribute('href', url);
                    link.setAttribute('download', name || 'ethplorer.data');
                    var event = document.createEvent('MouseEvents');
                    event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
                    link.dispatchEvent(event);
                }
                setTimeout(function(){ URL.revokeObjectURL(url); }, 250);
            };
        }else if(!/\bMSIE\b/.test(navigator.userAgent)){
            Ethplorer.saveData = function(data, name, mimetype){
                if(!mimetype) mimetype = 'application/octet-stream';
                window.open("data:" + mimetype + "," + encodeURIComponent(data), '_blank', '');
            };
        }
    },
    getActiveTab: function(){
        var tab = ($('.nav-tabs:visible li.active').length) ? $('.nav-tabs:visible li.active').attr('id').replace('tab-', '') : false;
        if(!tab){
            if($('#address-transfers:visible').length){
                tab = 'transfers';
            }
            if($('#address-chainy-tx:visible').length){
                tab = 'chainy';
            }
        }
        return tab;
    },
    reloadTab: function(name, reloadOthers){
        var tabs = ['transfers', 'issuances', 'chainy', 'holders'];
        if(!name){ // Get active tab if name not set
            name = Ethplorer.getActiveTab();
        }
        if(tabs.indexOf(name) < 0){
            return;
        }
        var methodName = 'draw' + name[0].toUpperCase() + name.substr(1);
        if('undefined' !== typeof(Ethplorer[methodName])){
            Ethplorer.showTableLoader();
            Ethplorer.loadAddressData(Ethplorer.currentAddress, {refresh: name}, Ethplorer[methodName]);
        }
        if(reloadOthers){
            Ethplorer.reloadTabs = tabs;
        }
        if(('undefined' !== typeof(Ethplorer.reloadTabs)) && (Ethplorer.reloadTabs.indexOf(name) >= 0)){
            delete Ethplorer.reloadTabs[Ethplorer.reloadTabs.indexOf(name)];
        }
    },
    checkFilter: function(filter){
        return (!filter || /^[0-9a-fx]+$/.test(filter));
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
        $('#ethplorer-path').hide();
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

        if(oToken.estimatedDecimals){
            $('#transaction-token-decimals').append(' <small>(estimated)</small>');
        }

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

        if('undefined' !== typeof(oOperation.formatted)){
            oOperation.value = Ethplorer.Utils.toBig(oOperation.value).div(Math.pow(10, oToken.decimals));
            oOperation.value = Ethplorer.Utils.formatNum(oOperation.value, true, oToken.decimals, true);
            oOperation.value = oToken.symbol ? (oOperation.value + ' ' + oToken.symbol) : oOperation.value;
            oOperation.formatted = true;
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
        if(txData.tx.gasPrice){
            txData.tx.gasPrice = parseFloat(Ethplorer.Utils.toBig(txData.tx.gasPrice).toString());
            txData.tx.gasPrice = txData.tx.gasPrice / Math.pow(10, 18);
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
                $('.token-related:eq(1) .block-header').find('img').remove();
                $('.token-related:eq(1) .block-header').prepend(
                    img.replace('##IMG##', '<img src="' + oToken.image + '" style="max-width:32px;max-height:32px;margin:8px;margin-left:20px;" align="left">')
                );
            }            
            
            txData.token = oToken;

            Ethplorer.fillValues('transaction', txData, ['token', 'token.timestamp', 'token.contract', 'token.symbol', 'token.decimals', 'token.owner', 'token.totalSupply']);

            if(oToken.estimatedDecimals){
                $('#transaction-token-decimals').append(' <small>(estimated)</small>');
            }

            if($('#transaction-tx-message').html()){
                $('#transfer-tx-message').html($('#transaction-tx-message').html());
                $('#transaction-tx-message').html('')
            }

            if(txData.operations && txData.operations.length){
                txData.operation = txData.operations[txData.operations.length - 1];
                var multiop = txData.operations.length > 1;
                for(var i=0; i<txData.operations.length; i++){
                    var idx = i;
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
                                    Ethplorer.Nav.set('opIdx', ('undefined' !== typeof(this.operation.priority)) ? this.operation.priority : this.operation.index)
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
        }else{
            $('#tx-details-block').show();
            $('.tx-details-close').hide();
        }

        document.title = 'Ethplorer';
        document.title += (': ' + (titleAdd ? (titleAdd + ' -') : ''));
        document.title += (' hash ' + txHash);

        var idx = Ethplorer.Nav.get('opIdx');
        if(false !== idx){
            idx = parseInt(idx);
            var el = $('[data-op-idx=' + idx + ']');
            if(el.length && ('undefined' !== typeof(el[0].operation))){
                $('.multiop .blue').addClass('selectable');
                $('.multiop .blue').removeClass('blue');
                el.addClass('blue');
                el.removeClass('selectable');
                Ethplorer.showOpDetails(txData.tx, el[0].operation);
            }
        }else if(multiop){
            Ethplorer.showOpDetails(oTx, txData.operations[0]);
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
        Ethplorer.loadAddressData(address, Ethplorer.showAddressDetails);
    },

    loadAddressData: function(address, data, callback){
        if('function' === typeof(data)){
            callback = data;
            var data = {};
        }
        data.data = address;
        var page = Ethplorer.Nav.getString();
        if(page){
            data.page = page;
        }
        $.getJSON(Ethplorer.service, data, function(_address){
            return function(data){
                callback(_address, data);
            }
        }(address));
    },

    showAddressDetails: function(address, data){
        Ethplorer.currentAddress = address;
        Ethplorer.data = data;
        var titleAdd = '';
        // Temporary hack
        $('.address-type').text(data.isContract ? 'Contract' : 'Address');
        $('#ethplorer-path').show();
        data.address = address;
        Ethplorer.fillValues('address', data, ['address', 'balance', 'balanceIn', 'balanceOut']);
        $('#address-token-balances, #address-token-details').hide();
        if(data.isContract && data.contract.isChainy){
            titleAdd = 'Chainy Information';
            Ethplorer.drawChainy(address, data);
            $('#address-chainy-info').show();
        }
        if(data.isContract){
            Ethplorer.fillValues('address', data, ['contract', 'contract.creator']);
        }
        if(data.isContract && data.token){
            $('#address-token-details').show();
            var oToken = Ethplorer.prepareToken(data.token);
            titleAdd = 'Token ' + oToken.name + (oToken.symbol ? (' [' + oToken.symbol + ']') : '' ) + ' Information';
            // Read description from tx
            if(data.contract && data.contract.code){
                var json = Ethplorer.Utils.parseJData(data.contract.code);
                if(json && json.description){
                    oToken.description = json.description;
                }
            }
            // Read from config
            if(Ethplorer.Config.tokens && ('undefined' !== typeof(Ethplorer.Config.tokens[oToken.address]))){
                if('undefined' !== typeof(Ethplorer.Config.tokens[oToken.address].description)){
                    oToken.description = Ethplorer.Config.tokens[oToken.address].description;
                }
            }
            if(oToken.description){
                oToken.description = $('<span>').text(oToken.description).html();
                oToken.description = oToken.description.replace(/http[s]?\:\/\/[^\s]*/g, '<a href="$&" target="_blank">$&</a>');
                oToken.description = oToken.description.replace(/\n/g, '<br />');
            }
            if(oToken.image){
                $('#address-token-details .block-header').find('img').remove();                
                $('#address-token-details .block-header').prepend('<img src="' + oToken.image + '" class="token-logo" align="left">');
            }
            $('.address-token-name').text(oToken.name);
            if(Ethplorer.Config.updateLink){
                $('.address-token-name:eq(0)').append('<a href="' + Ethplorer.Config.updateLink + '" target="_blank" class="token-update">Update</a>')
            }

            Ethplorer.drawHolders(address, data);
            Ethplorer.drawIssuances(address, data);

            if(data.pager && data.pager.transfers){
                data.token.transfersCount = data.pager.transfers.total;
            }
            if(data.pager && data.pager.issuances){
                data.token.issuancesCount = '';
                if(data.pager.issuances.total){
                    data.token.issuancesCount = data.pager.issuances.total;
                }
            }
            if(data.pager && data.pager.holders){
                data.token.holdersCount = data.pager.holders.total;
            }

            var fields = [
                'token', 'token.name', 'token.description', 'token.owner', 'token.totalSupply', 'token.totalIn', 'token.totalOut', 'token.decimals', 'token.symbol',
                'token.txsCount', 'token.transfersCount', 'token.issuancesCount', 'token.holdersCount'
            ];
            
            $('#tab-issuances').show();
            $('#tab-holders').show();
            
            Ethplorer.fillValues('address', data, fields);
            if(oToken.estimatedDecimals){
                $('#address-token-decimals').append(' <small>(estimated)</small>');
            }
        }else if(data.balances && data.balances.length){
            $('#address-token-balances table').empty();
            for(var k=0; k<data.balances.length; k++){
                var balance = data.balances[k];
                var oToken = Ethplorer.prepareToken(data.tokens[balance.contract]);
                var row = $('<TR>');
                row.append('<TD>' + Ethplorer.Utils.getEthplorerLink(balance.contract, oToken.name, false) + '</TD>');
                var qty = Ethplorer.Utils.toBig(balance.balance).div(Math.pow(10, oToken.decimals));
                var value = Ethplorer.Utils.formatNum(qty, true, oToken.decimals, true) + ' ' + oToken.symbol;
                if(balance.totalIn || balance.totalOut){
                    value += '<br />';
                    var totalIn = Ethplorer.Utils.toBig(balance.totalIn).div(Math.pow(10, oToken.decimals));
                    var totalOut = Ethplorer.Utils.toBig(balance.totalOut).div(Math.pow(10, oToken.decimals));
                    value += ('<div class="total-in-out-small">Total In: ' + Ethplorer.Utils.formatNum(totalIn, true, oToken.decimals, true) + '<br />');
                    value += ('Total Out: ' + Ethplorer.Utils.formatNum(totalOut, true, oToken.decimals, true) + '</div>');
                }
                row.append('<TD>' + value + '</TD>');
                row.find('td:eq(1)').addClass('text-right');
                $('#address-token-balances table').append(row);
            }
            $('#address-token-balances').show();
        }

        if(!data.isContract || !data.token){
            $('.nav-tabs').hide();
            $('.filter-box').addClass('out-of-tabs');
        }else{
            $('.filter-box').addClass('in-tabs');
        }

        if(!data.contract || !data.contract.isChainy){
            Ethplorer.drawTransfers(address, data);
        }

        document.title = 'Ethplorer';
        document.title += (': ' + (titleAdd ? (titleAdd + ' -') : ''));
        document.title += ((data.isContract ? ' Ethereum contract ' : ' Ethereum address ') + Ethplorer.currentAddress);

        $('.local-time-offset').text(Ethplorer.Utils.getTZOffset());
        Ethplorer.Utils.hideEmptyFields();
        Ethplorer.hideLoader();
        $('#disqus_thread').show();
        $('#addressDetails').show();

        $("table").find("tr:visible:odd").addClass("odd");
        $("table").find("tr:visible:even").addClass("even");
        $("table").find("tr:visible:last").addClass("last");

        if(true || !Ethplorer.isProd){
            if(data.isContract || data.token){
                $('#token-history-grouped-widget').show();
                var widgetTitle = (oToken && oToken.name) ? (oToken.name + ' token pulse') : '';
                ethplorerWidget.init(
                    '#token-history-grouped-widget',
                    'tokenHistoryGrouped',
                    {
                        theme: 'dark',
                        getCode: true,
                        address: address,
                        options: {title: widgetTitle, vAxis: {title: 'Token operations'}, hAxis: {title: '30 days token operations chart'}}
                    }
                );
                ethplorerWidget.loadScript("https://www.gstatic.com/charts/loader.js", ethplorerWidget.loadGoogleCharts);
            }
        }
    },

    drawTransfers: function(address, transfersData){
        $('#filter_list').attr('disabled', false);
        for(var key in transfersData){
            Ethplorer.data[key] = transfersData[key];
        }
        var data = Ethplorer.data;
        var tableId = data.token ? 'address-token-transfers' : 'address-transfers';
        $('#' + tableId).find('.table').empty();
        if(!data.transfers || !data.transfers.length){
            $('#' + tableId).find('.total-records').empty();
            $('#' + tableId).find('.table').append('<tr class="notFoundRow"><td>No transfers found</td></tr>');
        }else{
            for(var i=0; i<data.transfers.length; i++){
                var tx = data.transfers[i];
                var qty = Ethplorer.Utils.toBig(tx.value);
                if(parseInt(qty.toString())){
                    var txToken = Ethplorer.prepareToken(data.token ? data.token : data.tokens[tx.contract]);
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
                        value = (tx.type && ('burn' === tx.type)) ? '-' + value + '<br>&#128293;&nbsp;Burn' : value + '<br>&#9874;&nbsp;Issuance';
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
            // Pager
            if(data.pager && data.pager.transfers){
                var pagination = $('<tr class="paginationFooter"><td colspan="10"></td></tr>');
                Ethplorer.drawPager(pagination.find('td'), data.pager.transfers);
                $('#' + tableId + ' .table').append(pagination);
            }
        }
        Ethplorer.hideTableLoader();
        if((!data.pager || !data.pager.transfers) && (!data.token)){
            $('#' + tableId).hide();
            $('.filter-box').hide();
        }

        $(".table").find("tr:visible:odd").addClass("odd");
        $(".table").find("tr:visible:even").addClass("even");
        $(".table").find("tr:visible:last").addClass("last");

        $('#' + tableId).show();
    },

    drawIssuances: function(address, issuancesData){
        $('#filter_list').attr('disabled', false);
        $('#address-issuances .table').empty();
        for(var key in issuancesData){
            Ethplorer.data[key] = issuancesData[key];
        }
        var data = Ethplorer.data;
        if(!data.issuances || !data.issuances.length){
            if(!data.token) return;
            $('#address-issuances').find('.total-records').empty();
            $('#address-issuances').find('.table').append('<tr class="notFoundRow"><td>No issuances found</td></tr>');
        }else{
            var oToken = Ethplorer.prepareToken(data.token);
            for(var i=0; i<data.issuances.length; i++){
                var tx = data.issuances[i];
                // Temporary workaround
                if(tx.type == 'mint'){
                    tx.type = 'issuance';
                }
                var type = (tx.type && ('burn' === tx.type)) ? '&#128293;&nbsp;Burn' : '&#9874;&nbsp;Issuance';
                var qty = Ethplorer.Utils.toBig(tx.value);
                if(!isNaN(parseInt(qty.toString()))){
                    var opClass = (tx.type.toString().toLowerCase() !== 'burn') ? 'incoming' : 'outgoing';
                    var qty = Ethplorer.Utils.toBig(tx.value).div(Math.pow(10, oToken.decimals));
                    var row = $('<tr>');
                    var tdDate = $('<td>');
                    var tdHash = $('<td>').addClass('list-field table-hash-field');
                    var tdOpType = $('<td>').addClass('text-center table-type-field ' + opClass);
                    var tdQty = $('<td>').addClass('text-right ' + opClass);
                    tdDate.html(Ethplorer.Utils.getEthplorerLink(tx.transactionHash, Ethplorer.Utils.ts2date(tx.timestamp, false), false));
                    tdDate.find('a').attr('title', Ethplorer.Utils.ts2date(tx.timestamp, true));
                    tdHash.html(Ethplorer.Utils.getEthplorerLink(tx.transactionHash));
                    tdOpType.html(type);
                    tdQty.html((tx.type !== 'burn' ? '+' : '-') + Ethplorer.Utils.formatNum(qty, true, oToken.decimals ? oToken.decimals : 18, 2) + ((oToken.symbol) ? '&nbsp;' + oToken.symbol : ''));
                    row.append(tdDate, tdHash, tdOpType, tdQty);
                    $('#address-issuances .table').append(row);
                }
            }
        }
        // Pager
        if(data.pager && data.pager.issuances && data.pager.issuances.total){
            var pagination = $('<tr class="paginationFooter"><td colspan="10"></td></tr>');
            Ethplorer.drawPager(pagination.find('td'), data.pager.issuances);
            $('#address-issuances .table').append(pagination);
        }
        Ethplorer.hideTableLoader();
        $('#address-issuances').show();
    },

    drawHolders: function(address, holdersData){
        $('#filter_list').attr('disabled', false);
        $('#address-token-holders .table').empty();
        for(var key in holdersData){
            Ethplorer.data[key] = holdersData[key];
        }
        var data = Ethplorer.data;
        if(data.token && data.holders && data.holders.length){
            var oToken = Ethplorer.prepareToken(data.token);
            var table = $('#address-token-holders').find('table');
            var totalVolume = 0;
            var totalShare = 0;
            for(var i=0; i<data.holders.length; i++){
                var holder = data.holders[i];
                totalVolume += holder['balance'];
                totalShare += holder['share'];
                var row = $('<tr>');
                var balance = holder['balance'];
                if(oToken.decimals){
                    balance = balance / Math.pow(10, oToken.decimals);
                }
                balance = Ethplorer.Utils.formatNum(balance, true, oToken.decimals, true);
                if(oToken.symbol){
                    balance = balance + ' ' + oToken.symbol;
                }else if(oToken.name){
                }
                var address = Ethplorer.Utils.getEthplorerLink(holder['address'], holder['address'], false);
                var shareDiv = '<div><div class="holder-gauge" style="width:' + holder['share'] + '%;"></div><div class="holder-gauge-value">&nbsp;' + holder['share'] + '%</div></div>'
                var page = (data.pager && data.pager.holders) ? data.pager.holders.page : 1;
                var add = (page - 1) * Ethplorer.pageSize;
                row.append('<td>' + (add + i + 1) + '</td><td class="hide-small">' + address + '</td><td class="hide-small"></td><td class="hide-small">' + balance + '</td><td class="hide-small">' + shareDiv + '</td>');
                row.append('<td class="show_small"><div class="holder_small">' + address + '<br />' + balance + '<br />' + shareDiv + '</div></td>');
                table.append(row);
            }
            if(totalShare > 100){
                totalShare = 100;
            }
            totalShare = Ethplorer.Utils.formatNum(totalShare, true, 2, true);
            if(oToken.decimals){
                totalVolume = totalVolume / Math.pow(10, oToken.decimals);
            }
            totalVolume = Ethplorer.Utils.formatNum(totalVolume, true, oToken.decimals, true);
            var totals = 'Summary of page is '+ totalVolume + " " + oToken.symbol;
            if(data.pager && data.pager.holders){
                if(data.pager.holders.records > Ethplorer.pageSize){
                    var tname = (oToken.name != 'N/A') ? oToken.name : '';
                    totals += (', which is ' + totalShare + "% of " + oToken.name + ' total supply');
                }
            }
            $("#address-token-holders-totals").html(totals);
        }else{
            $('#address-token-holders').find('.total-records').empty();
            $('#address-token-holders').find('.table').append('<tr class="notFoundRow"><td>No holders found</td></tr>');
        }
        // Pager
        if(data.pager && data.pager.holders && data.pager.holders.total){
            var pagination = $('<tr class="paginationFooter"><td colspan="10"></td></tr>');
            Ethplorer.drawPager(pagination.find('td'), data.pager.holders);
            $('#address-token-holders .table').append(pagination);
        }
        Ethplorer.hideTableLoader();
        $('#address-token-holders').show();
    },

    drawChainy: function(address, chainyData){
        $('#filter_list').attr('disabled', false);
        $('#address-chainy-tx .table').empty();
        for(var key in chainyData){
            Ethplorer.data[key] = chainyData[key];
        }
        var data = Ethplorer.data;

        var fields = ['contract', 'contract.txsCount'];
        Ethplorer.fillValues('address', data, fields);
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
                if(type){
                    tdOpType.html(type);
                    if('Text' === type){
                        tdOpType.append('<span class="chainy-text"></span>');
                        tdOpType.find('.chainy-text').text(obj.description.substr(0, 32));
                        tdOpType.find('.chainy-text').attr('title', obj.description);
                    }
                }else{
                    tdOpType.html('<span class="text-danger">Failed</span>');
                }
                tdLink.html(link);
                row.append(tdDate, tdHash, tdOpType, tdLink);
                $('#address-chainy-tx .table').append(row);
            }
        }else{
            $('#address-chainy-tx').find('.total-records').empty();
            $('#address-chainy-tx').find('.table').append('<tr class="notFoundRow"><td>No transactions found</td></tr>');
        }
        // Pager
        if(data.pager && data.pager.chainy){
            var pagination = $('<tr class="paginationFooter"><td colspan="10"></td></tr>');
            Ethplorer.drawPager(pagination.find('td'), data.pager.chainy);
            $('#address-chainy-tx .table').append(pagination);
        }
        Ethplorer.hideTableLoader();
        $('#address-chainy-tx').show();
    },
    drawPager: function(container, pageData){    
        var currentPage     = pageData.page,
            recordsCount    = pageData.records,
            totalCount      = pageData.total;

        container.parents('.block').find('.total-records').empty();

        var pageSizeSelect = $('<SELECT class="pageSize">');
        var sizes = [10, 25, 50, 100];
        for(var i=0; i<4; i++){
            var option = $('<OPTION>');
            option.text(sizes[i]);
            option.attr('value', sizes[i]);
            if(Ethplorer.pageSize == sizes[i]){
                option.attr('selected', 'selected');
            }
            pageSizeSelect.append(option);
        }
        pageSizeSelect.change(function(_container, _pd){
            return function(){
                var ps = $(this).val();
                if(ps !== Ethplorer.pageSize){
                    Ethplorer.pageSize = ps;
                    if(Ethplorer.pageSize > 10){
                        Ethplorer.Nav.set('pageSize', ps);
                        if(localStorage){
                            localStorage.setItem('pageSize', ps);
                        }
                    }else{
                        Ethplorer.Nav.del('pageSize');
                        if(localStorage){
                            localStorage.setItem('pageSize', 10);
                        }
                    }
                    Ethplorer.reloadTab(false, true);
                }
            }
        }(container, pageData));

        var pager = $('<UL>');
        pager.addClass('pagination pagination-sm');
        setTimeout(function(_container, _count, _total){
            return function(){
                var str = _count + ' total';
                if(_count < _total){
                    str = '<span class="filtered-totals">Filtered ' + _count + ' records of ' + _total + ' total</span>';
                }
                _container.parents('.block').find('.total-records').html(str);
                var filter = Ethplorer.Nav.get('filter');
                if(filter){
                    _container.parents('.table').find('a.local-link').each(function(){
                        var text = $(this).text();
                        if(0 === text.indexOf('0x')){
                            $(this).html(text.replace(new RegExp(filter, 'g'), '<span class="filer-mark">' + filter + '</span>'))
                        }
                    });
                }
            }
        }(container, recordsCount, totalCount), 100);
        
        container.empty();

        if(recordsCount){
            var pages = Math.ceil(recordsCount / Ethplorer.pageSize);
            var lastPage = true;
            for(var i=1; i<=pages; i++){
                var page = $('<LI>');
                page.addClass('page-item');
                if((i <= 1) || ((i <= 5) &&(currentPage <= 4)) || ((i >= (pages - 4)) &&(currentPage >= (pages - 3))) || (i >= (pages)) || ((i >= (currentPage - 1)) && (i <= (currentPage + 1)))){
                    var link = $('<a>');
                    link.html(i);
                    if(i === currentPage){
                        page.addClass('active');
                    }else{
                        link.attr('href', '#');
                        link.click(function(_container, _page, _pageData){
                            return function(e){
                                var tab = Ethplorer.getActiveTab();
                                Ethplorer.Nav.set(tab, _page);
                                if(_page <= 1){
                                    Ethplorer.Nav.del(tab);
                                }
                                Ethplorer.reloadTab(tab);
                                e.preventDefault();
                            };
                        }(container, i, pageData));
                    }
                    page.html(link);
                    lastPage = true;
                }else if(lastPage){
                    lastPage = false;
                    var splitter = $('<a>');
                    splitter.html('...');
                    page.append(splitter);
                    page.addClass('disabled');
                }
                pager.append(page);
            }
            container.append(pageSizeSelect);
            container.append(pager);
        }
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
            var k = Math.pow(10, oToken.decimals);
            oToken.totalSupply = oToken.totalSupply.div(k);
            oToken.totalIn = oToken.totalIn / k;
            oToken.totalOut = oToken.totalOut / k;
        }
        oToken.totalSupply = Ethplorer.Utils.formatNum(oToken.totalSupply, true, oToken.decimals, true);
        oToken.totalIn = Ethplorer.Utils.formatNum(oToken.totalIn, true, oToken.decimals, true);
        oToken.totalOut = Ethplorer.Utils.formatNum(oToken.totalOut, true, oToken.decimals, true);

        if(oToken.symbol){
            oToken.totalSupply = oToken.totalSupply + ' ' + oToken.symbol;
            oToken.totalIn = oToken.totalIn + ' ' + oToken.symbol;
            oToken.totalOut = oToken.totalOut + ' ' + oToken.symbol;
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

    search: function(value, fromInput){
        value = value.replace(/^\s+/, '').replace(/\s+$/, '');
        if(value.length){
            if(Ethplorer.Utils.isAddress(value)){
                document.location.href = '/address/' + value;
                return;
            }else if(Ethplorer.Utils.isTx(value)){
                document.location.href = '/tx/' + value;
                return;
            }else if((value.length < 20) && fromInput){
                $.getJSON(Ethplorer.service, {search: value}, function(data){
                    var empty = !(data && data.results && data.total);
                    if(!empty){
                        document.location.href = '/address/' + data.results[0][2];
                        return;
                    }
                });
                return;
            }
        }
        if(value.length && fromInput){
            $('#search').val('');
            Ethplorer.error('Nothing found');
        }
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
                value = Ethplorer.Utils.formatNum(value, true, 18, true) + ' ETHER';
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
    showTableLoader: function(){
        $('.filter-box').addClass('processing');
        $('.paginationFooter, .notFoundRow').parents('.table').addClass('unclickable');
        setTimeout(function(){
            $('.total-records:visible').html('<i class="table-loading fa fa-spinner fa-spin fa-2x"></i>');
        }, 500);
        $('.nav-tabs').addClass('unclickable');
    },
    hideTableLoader: function(){
        $('.filter-box').removeClass('processing');
        $('.table, .nav-tabs').removeClass('unclickable');
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
    downloadData: function(address){
        console.log('Download data for ' + address);
        address = address.replace(/^\s+/, '').replace(/\s+$/, '');
        if(address.length && Ethplorer.Utils.isAddress(address)){
            var data = {data: address, csv: true};
            $.get(Ethplorer.service, data, function(data, textStatus, jqXHR){
                console.log(data);
                Ethplorer.saveData(data, 'ethplorer.csv', 'text/csv');
            });
        }
    },
    Nav: {
        data: {},
        init: function(){
            var hash = document.location.hash.replace(/^\#/, '');
            if(hash){
                aParts = hash.split('&');
                for(var i=0; i<aParts.length; i++){
                    var part = aParts[i];
                    if(part.indexOf('=') > 0){
                        var aData = part.split('=');
                        Ethplorer.Nav.data[aData[0]] = aData[1];
                    }
                }
            }
        },
        del: function(name){
            delete Ethplorer.Nav.data[name];
            Ethplorer.Nav.updateHash();
        },
        get: function(name){
            return ('undefined' !== typeof(Ethplorer.Nav.data[name])) ? Ethplorer.Nav.data[name] : false;
        },
        set: function(name, value){
            Ethplorer.Nav.data[name] = value;
            Ethplorer.Nav.updateHash();
        },
        getString: function(){
            var hash = '';
            for(var key in Ethplorer.Nav.data){
                if(hash){
                    hash += '&';
                }
                hash += (key + '=' + Ethplorer.Nav.data[key]);
            }
            return hash;
        },
        updateHash: function(){
            var hash = Ethplorer.Nav.getString();
            if(hash != document.location.hash){
                if(!hash){
                    hash = 'ready'
                }
                document.location.hash = hash;
            }
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
            if(!num){
                num = 0;
            }
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
                res = data.match(/.{2}/g).map(function(v){
                    return String.fromCharCode(parseInt(v, 16));
                }).join('');
            } catch(e) {}
            return res;
        },

        hex2utf: function(data){
            var res = '';
            try {
                var uri = data.toLowerCase().replace(/[0-9a-f]{2}/g, '%$&');
                res = decodeURIComponent(uri);
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
                if(res){
                    var rrr = Ethplorer.Utils.ascii2hex(jstr);
                    rrr = Ethplorer.Utils.hex2utf(rrr);
                    res = JSON.parse(rrr);
                }
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
