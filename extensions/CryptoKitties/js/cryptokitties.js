Ethplorer.Extensions.CryptoKitties = {
    contract: '0x06012c8cf97bead5deae237070f9587f8e7a266d',
    data: {},
    current: 0,
    show: false,
    init: function(){
        Ethplorer.Events.addHandler("ethp_showTxDetails_finish", Ethplorer.Extensions.CryptoKitties.onTxDetails);
        Ethplorer.Events.addHandler("ethp_showAddressDetails_finish", Ethplorer.Extensions.CryptoKitties.onAddressDetails);
    },
    onAddressDetails: function(addrData){
        if(!addrData.cryptokitties) return;
        var limit = 2;
        var address = addrData.address.toLowerCase();
        $('#address-token-balances').after('<div id="ck-loading" class="text-center">Loading CryptoKitties...</div>');
        $('.filter-box').before('<div class="col-xs-12" id="ck-full" style="display:none;"><div class="block"><div class="block-header"><h3>CryptoKitties</h3><div class="ck-full-close">&times;</div></div><table class="table"><tbody><tr class="even last"><td></td></tr></tbody></table></div></div>')
        $.getJSON('/extensions/CryptoKitties/service.php', {action:"getAddress", address:address}, function(data){
            $('#ck-loading').hide();
            $('#ck-address-block tr.last td').empty();
            if(data && data.total){
                Ethplorer.Extensions.CryptoKitties.data = data;
                $('#address-token-balances').after('<div class="block" id="ck-address-block"><div class="block-header"><h3>CryptoKitties</h3></div><table class="table"><tbody><tr class="even last"><td></td></tr></tbody></table></div>');
                for(var i=0; i< data.kitties.length; i++){
                    if(i<limit){
                        $('#ck-address-block tr.last td').append("<div id='ck-" + i + "' class='ck-kitty'></div>");
                        Ethplorer.Extensions.CryptoKitties.showKittyData('ck-' + i, data.kitties[i], false);
                    }
                    $('#ck-full td').append("<div id='ck-" + i + "-f' class='ck-kitty'></div>");
                    Ethplorer.Extensions.CryptoKitties.showKittyData('ck-' + i + '-f', data.kitties[i], false);
                }
                if(data.total > limit){
                    $('#ck-address-block tr.last td').append('<div class="text-center"><a class="ck-link">Show more Kitties</a></div>');
                    $('.ck-link').click(function(){
                        $('#ck-address-block').hide();
                        $('#ck-full').show();
                    });
                    $('.ck-full-close').click(function(){
                        $('#ck-address-block').show();
                        $('#ck-full').hide();
                    });
                    if(data.total > 20){
                           $('#ck-full table').after("<div class='text-center' style='color:white;margin-top:-16px;'><small>Last 20 of " + data.total + " kitties shown</small></div>");
                    }
// <div style="text-align:center;font-size:16px;padding-top:10px;padding-bottom:4px;"><a class="widget-code-link">Show more Kitties</a></div>
                }
            }
        });
    },
    onTxDetails: function(txData){
        var oTx = txData.tx;
        if(oTx.to && (Ethplorer.Extensions.CryptoKitties.contract === oTx.to) && oTx.method){
            var p = oTx.method.replace('(', ' ').replace(',', ' ').replace(')', '').split(' ');
            var cmd = p[0];
            $('.token-operation-type').text(cmd);
            var m1 = ['giveBirth', 'createSaleAuction']
            if(m1.indexOf(p[0]) >= 0){
                var data = oTx.input.slice(8).substr(0,64).replace(/^0+/, '');
                var id = parseInt(data, 16);
                if(id){
                    $('#token-information-block').addClass('text-center');
                    $('#token-information-block').html('<div class="ck-kitty" id="ck-1"></div>');
                    Ethplorer.Extensions.CryptoKitties.showKitty('ck-1', id);
                }
            }
            var m2 = ['bidOnSiringAuction', 'breedWithAuto']
            if(m2.indexOf(p[0]) >= 0){
                var data1 = oTx.input.slice(8).substr(0,64).replace(/^0+/, '');
                var data2 = oTx.input.slice(8).substr(64,64).replace(/^0+/, '');
                var id1 = parseInt(data1, 16);
                var id2 = parseInt(data2, 16);
                if(id1 && id2){
                    $('#token-information-block').addClass('text-center');
                    $('#token-information-block').empty();
                    $('#token-information-block').append('<div class="ck-kitty" id="ck-1"></div><br class="ck-show-small" />');
                    $('#token-information-block').append('<div id="ck-symbol"></div><br class="ck-show-small" />');
                    $('#token-information-block').append('<div class="ck-kitty" id="ck-2"></div><br class="ck-show-small" />');
                    Ethplorer.Extensions.CryptoKitties.showKitty('ck-1', id1);
                    Ethplorer.Extensions.CryptoKitties.showKitty('ck-2', id2);
                    var symbol = '?';
                    if('breedWithAuto' == p[0]){
                        $("#ck-symbol").css('color', 'red');
                        symbol = '❤';
                    }
                    $("#ck-symbol").html(symbol);
                }
            }
            if(Ethplorer.Extensions.CryptoKitties.show){
                $('#token-information-block, #token-operation-block').addClass('ck-has-kitties');
            }
        }
    },
    showKitty: function(containerId, id){
        Ethplorer.Extensions.CryptoKitties.show = true;
        $('#' + containerId).html("Loading...");
        $.getJSON('/extensions/CryptoKitties/service.php', {action:"getKitty", id:id}, function(data){
            Ethplorer.Extensions.CryptoKitties.showKittyData(containerId, data, true);
        });
    },
    showKittyData: function(containerId, data, tooltip){
        var bgColors = {
            coral:           "#c5eefa",
            babyblue:        "#dcebfc",
            topaz:           "#d1eeeb",
            mintgreen:       "#cdf5d4",
            limegreen:       "#d9f5cb",
            babypuke:        "#eff1e0",
            chestnut:        "#efe1da",
            strawberry:      "#fcdede",
            pumpkin:         "#fae1ca",
            gold:            "#faf4cf",
            sizzurp:         "#dfdffa",
            bubblegum:      "#fadff4",
            violet:         "#ede2f5",
            thundergrey:    "#eee9e8"
        };
        if(data["color"] && bgColors[data["color"]]){
            $('#' + containerId).css("background-color", bgColors[data["color"]]);
        }
        var img = $('<img src="' + data["image_url"] + '" height="200">');
        if(tooltip){
            img.attr("data-tip", data["bio"] ? data["bio"] : "");
            img.addClass('tip');
        }
        $('#' + containerId).html(img);
        $('#' + containerId).append("<span style='color:white;'>Kitty " +  data["id"] + " - Gen " + data["generation"] + "</span>");
        if(tooltip){
            $('.tip').tipr();
        }
    }
};
