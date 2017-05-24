/*!
 * Copyright 2017 Everex https://everex.io
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

EthplorerNote = {
    service: "/service/service.php",
    next: 0,
    init: function(container){
        EthplorerNote.container = container;
        if((document.location.host !== 'ethplorer.io') && (document.location.host.indexOf('ethplorer') < 0)){
            EthplorerNote.service = '//ethplorer.io' + EthplorerNote.service;
        }
        var inner = $('<DIV>');
        inner.addClass('ethplorer-note');
        EthplorerNote.container.append(inner);
        EthplorerNote.inner = inner;        
        EthplorerNote.loadNext();
    },
    loadNext: function(){
        $.getJSON(EthplorerNote.service, {notes: 1, note: EthplorerNote.next}, function(data, status, xhr){
            if('undefined' !== typeof(data.link)){
                EthplorerNote.inner.fadeOut(300, function(_data){
                    return function(){
                        var link = "/go.php?link=" + _data.link;
                        EthplorerNote.inner.html(_data.html.replace('%link%', link));
                        if('undefined' !== typeof(_data.next)){
                            EthplorerNote.next = _data.next;
                        }
                        if(_data.image){
                            var img = $('<IMG>');
                            img.attr('src', _data.image);
                            EthplorerNote.inner.prepend(img);
                        }
                        EthplorerNote.inner.fadeIn(500);
                    }
                }(data));
                if(data.hasNext){
                    setTimeout(EthplorerNote.loadNext, 15000);
                }
                EthplorerNote.container.show();
            }
        });
    }
};