$(document).ready(function(){
    var txHash = false;
    var resRegExp = new RegExp('[\?&]hash=([^&#]*)').exec(window.location.href);
    if(resRegExp && resRegExp.length > 0){
        txHash = resRegExp[1];
    }
    if(!urlEthplorer){
        console.log('Ethplorer service URL not found.');
        return;
    }
    $.jsonRPC.setup({
        endPoint: urlEthplorer,
        namespace: ''
    });
    if(txHash){
        getTxDetails(txHash);
    }
});

function processTxDetailsForm(){
    getTxDetails($('#hash').val(), $('#abi').val());
}

function getTxDetails(txHash, abi){
    $.jsonRPC.request('getTransactionDetails', {
        params : [txHash, abi],
        success : function(data){
            console.log(JSON.stringify(data));
            showTxDetails(txHash, data.result);
        },
        error : function(data){
            console.log('There was an error ' + JSON.stringify(data));
        }
    });
}

function showTxDetails(txHash, txData){
    console.log(txData);
    var blockchain = '<b>' + (testnet ? 'Testnet' : 'Mainnet') + '</b>';
    $('#tdBlockchain').empty().html(blockchain);
    $('#tdTx').empty().html('<a target="_blank" href="' + urlEtherscan + 'tx/' + txHash + '">' + txHash + '</a>');
    $('#tdToken').empty().html(txData.token);
    $('#tdContract').empty().html('<a target="_blank" href="' + urlEtherscan + 'address/' + txData.contract + '">' + txData.contract + '</a>');
    var ast = '<a target="_blank" href="' + urlEtherscan + 'address/';
    $('#tdFrom').empty().html(ast + txData.from + '">' + txData.from + '</a>');
    $('#tdTo').empty().html(ast + txData.to + '">' + txData.to + '</a>');
    if(!isNaN(txData.value) && !isNaN(txData.decimals)){
        var k = Math.pow(10, txData.decimals);
        $('#tdValue').empty().html(formatNum(parseInt(txData.value) / k, true, txData.decimals));
    }else{
        $('#tdValue').empty();
    }
    $('#tdSymbol').empty().html(txData.symbol);
    $('#tdSuccess').empty().html(txData.success.toString() + (txData.failedReason ? (' / ' + txData.failedReason) : ''));
}

// Adds an ability to round with decimals
Math._round = Math.round;
Math.round = function(val, decimals){
    decimals = decimals ? parseInt(decimals) : 0;
    var k = decimals ? Math.pow(10, decimals) : 1;

    return Math._round(val * k) / k;
};

// Adds an ability to floor with decimals
Math._floor = Math.floor;
Math.floor = function(val, decimals){
    decimals = decimals ? parseInt(decimals) : 0;
    var k = decimals ? Math.pow(10, decimals) : 1;
    return Math._floor(val * k) / k;
};
formatNum = function(num, withDecimals /* = false */, decimals /* = 2 */, cutZeroes /* = false */){
    if('undefined' === typeof(cutZeroes)){
        cutZeroes = false;
    }
    if('undefined' === typeof(withDecimals)){
        withDecimals = false;
    }
    if('undefined' === typeof(decimals)){
        decimals = 2;
    }
    if(withDecimals){
        num = Math.round(num, decimals);
    }
    var parts = num.toString().split('.');
    var res = parts[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    var zeroCount = cutZeroes ? 2 : decimals;
    if(withDecimals && decimals){
        if('undefined' !== typeof(parts[1])){
            res += '.';
            var tail = parts[1].substring(0, decimals);
            if(tail.length < zeroCount){
                tail = tail.pad(zeroCount, '0');
            }
            res += tail;
        }else{
            res += '.'.pad(parseInt(zeroCount) + 1, '0');
        }
    }
    return res;
}
// String padding
// 'aaa'.pad(6, '!', 'STR_PAD_RIGHT') = "aaa!!!"
String.prototype.pad = function(pad_length, pad_string, pad_type){
    var input = this;
    var half = '';
    var pad_to_go;
    var str_pad_repeater = function(s, len){
        var collect = '';
        while (collect.length < len) {
            collect += s;
        }
        return collect.substr(0, len);
    };
    pad_string = pad_string !== undefined ? pad_string : ' ';
    if (pad_type !== 'STR_PAD_LEFT' && pad_type !== 'STR_PAD_RIGHT' && pad_type !== 'STR_PAD_BOTH') {
        pad_type = 'STR_PAD_RIGHT';
    }
    if ((pad_to_go = pad_length - input.length) > 0) {
        if (pad_type === 'STR_PAD_LEFT') {
            input = str_pad_repeater(pad_string, pad_to_go) + input;
        } else if (pad_type === 'STR_PAD_RIGHT') {
            input = input + str_pad_repeater(pad_string, pad_to_go);
        } else if (pad_type === 'STR_PAD_BOTH') {
            half = str_pad_repeater(pad_string, Math.ceil(pad_to_go / 2));
            input = half + input + half;
            input = input.substr(0, pad_length);
        }
    }
    return input;
}