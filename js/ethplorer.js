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
                $('#loader').show();
                getTxDetails(pathData.arg);
                break;
            case 'address':
                showAddressDetails(pathData.arg);
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
        $('#loader').hide();
        $('.content-page').hide();
        $('#error-reason').text(message);
        $('#error').show();
    },
    getTxErrorReason: function(reason){
        var aReasons = {
            out_of_gas: 'Out of gas'
        };
        return ('undefined' !== typeof(aReasons[reason])) ? aReasons[reason] : reason;
    }
};

$(document).ready(function(){
    Ethplorer.init();
});

function processTxDetailsForm(){
    getTxDetails($('#hash').val(), $('#abi').val());
}

function getTxDetails(txHash, abi){
    // Check TX hash format first
    txHash = txHash.toLowerCase();
    if(!/^0x[0-9a-f]{64}$/i.test(txHash)){
        Ethplorer.error('Invalid transaction hash');
        return;
    }    
    
    $.jsonRPC.request('getTransactionDetails', {
        params : [txHash, abi],
        success : function(data){
            console.log(JSON.stringify(data));
            showTxDetails(txHash, data.result);
        },
        error : function(data){
            console.log('There was an error ' + JSON.stringify(data));
            if(data && data.error){
                var errorMessage = '';
                switch(data.error.code){
                    case -32603:
                        errorMessage = 'Transaction data was not found';
                        break;
                }
                Ethplorer.error(errorMessage);
            }
        }
    });
}

function getAddressDetails(address){
    // Check Address format first
    address = address.toLowerCase();
    if(!/^0x[0-9a-f]{40}$/i.test(address)){
        Ethplorer.error('Invalid address format');
        return;
    }    
    
    $.jsonRPC.request('getAddressDetails', {
        params : [address],
        success : function(data){
            console.log(JSON.stringify(data));
            showAddressDetails(address, data.result);
        },
        error : function(data){
            console.log('There was an error ' + JSON.stringify(data));
            if(data && data.error){
                var errorMessage = '';
                switch(data.error.code){
                    case -32603:
                        errorMessage = 'Address data was not found';
                        break;
                }
                Ethplorer.error(errorMessage);
            }
        }
    });
}

function showTxDetails(txHash, txData){
    console.log(txData);
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

    $('#loader').hide();
    $('#txDetails').show();

    $('.token-related .block').height(Math.max($('.token-related:eq(0) .block').height(), $('.token-related:eq(1) .block').height()));
}

function showAddressDetails(address, data){
    $('#loader').hide();
    $('#addressDetails').show();
    $('#addressDetails .block:eq(0),#addressDetails .block:eq(1)').height(Math.max($('#addressDetails .block:eq(0)').height(), $('#addressDetails .block:eq(1)').height()));
}

function showTokenDetails(address){
    $('#loader').hide();
    $('#tokenDetails').show();
//  $('#tokenDetails .block:eq(0),#tokenDetails .block:eq(1)').height(Math.max($('#tokenDetails .block:eq(0)').height(), $('#tokenDetails .block:eq(1)').height()));
}