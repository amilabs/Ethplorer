Ethplorer.Extensions.CryptoKitties = {
    contract: '0x06012c8cf97bead5deae237070f9587f8e7a266d',
    init: function(){
        Ethplorer.Events.addHandler("ethp_showTxDetails_finish", Ethplorer.Extensions.CryptoKitties.onTxDetails);
    },
    onTxDetails: function(txData){
        var ckStyle = "display:inline-block;vartical-align:top;height:200px;width:200px;border:1px solid white;border-radius:6px;color:white;text-align:center;";
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
                    $('#token-information-block').html('<div id="ck-1" style="' + ckStyle + '"></div>');
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
                    $('#token-information-block').append('<div id="ck-1" style="' + ckStyle + '"></div>');
                    $('#token-information-block').append('<div style="display:inline-block;vertical-align:top;width:70px;height:200px;line-height:200px;color:white;font-size:64px;" id="ck-symbol"></div>');
                    $('#token-information-block').append('<div id="ck-2" style="' + ckStyle + '"></div>');
                    Ethplorer.Extensions.CryptoKitties.showKitty('ck-1', id1);
                    Ethplorer.Extensions.CryptoKitties.showKitty('ck-2', id2);
                    $("#ck-symbol").html(('bidOnSiringAuction' == p[0]) ? '?' : '❤');
                }
            }
            $('[data-toggle="tooltip"]').tooltip(); 
        }
    },
    showKitty: function(containerId, id){
        $('#' + containerId).html("Loading...");
        $.getJSON('/extensions/CryptoKitties/service.php', {action:"getKitty", id:id}, function(data){
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
            var img = $('<img data-toggle="tooltip" src="' + data["image_url"] + '" height="200">');
            img.attr("title", data["bio"] ? data["bio"] : "");
            $('#' + containerId).html(img);
            $('#' + containerId).append("<span style='color:white;'>Kitty " +  data["id"] + " - Gen " + data["generation"] + "</span>");
            // $('#' + containerId).append("<span style='color:white;'>[#" +  data["id"] + "] " + (data["name"] ? data["name"] : "") + "(gen " + data["generation"] + ")</span>");
        });
    }
};