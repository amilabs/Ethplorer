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
                break;
            case 'token':
                break;
            default:
                // Home
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

function showTxDetails(txHash, txData){
    console.log(txData);
    var urlEtherscan = Ethplorer.Utils.getEtherscanAddress();
    $('#txList .list-field').empty();
    $('#tdData').parent().hide();
    $('#tdTx').html('<a target="_blank" href="' + urlEtherscan + 'tx/' + txHash + '">' + txHash + '</a>');
    $('.list-field-token').parent()[txData.token ? 'show' : 'hide']();
    if(txData.token){
        $('#tdToken').html(txData.token);
        $('#tdContract').html('<a target="_blank" href="' + urlEtherscan + 'address/' + txData.contract + '">' + txData.contract + '</a>');
        $('#tdSymbol').html(txData.symbol);
        if(!isNaN(txData.value) && !isNaN(txData.decimals)){
            var k = Math.pow(10, txData.decimals);
            $('#tdValue').html(Ethplorer.Utils.formatNum(parseInt(txData.value) / k, true, txData.decimals) + ' ' + txData.symbol);
        }
    }else{
        $('#tdValue').html(txData.value + ' Ether');
    }

    var data = txData.data ? txData.data.replace('0x', '').toUpperCase() : false;
    if(data){
        var split = data.match(/.{2}/g);
        var rdata = '';
        for(var i = 0; i<split.length; i++){
            rdata += split[i];
            rdata += ' ';
        }
        
        $('#tdData').html('<pre>' + rdata + '</pre>');
        $('#tdData').parent().show();
    }
    
    var ast = '<a target="_blank" href="' + urlEtherscan + 'address/';
    $('#tdFrom').html(ast + txData.from + '">' + txData.from + '</a>');
    $('#tdTo').html(ast + txData.to + '">' + txData.to + '</a>');    

    $('#tdSuccess').html(txData.success ? 'Success' : 'Failed' + (txData.failedReason ? (': ' + Ethplorer.getTxErrorReason(txData.failedReason)) : ''));
    if(!txData.success){
        $('#tdSuccess')[txData.success ? 'removeClass' : 'addClass']('text-danger');
    }

    $('#loader').hide();
    $('#txDetails').show();
}
