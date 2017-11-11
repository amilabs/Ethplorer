(function($){
    $(document).ready(function() {
        
        window.validateForm = function($jform) {
            var arError = [];
            $jform.find('.js-tilda-rule').each(function(){
                var req = $(this).data('tilda-req') || 0;
                var rule = $(this).data('tilda-rule') || 'none', regExp;
                var error = {};
                var val = $(this).val();
                var valnospace='';
                error.obj = $(this);
                error.type = [];
                
                if (val && val.length > 0) {
                    valnospace = val.replace(/\s/g,'');
                    val = val.trim();
                }
                
                if (req==1 && val.length == 0 && valnospace.length == 0) {
                    error.type.push('req');
                } else {
                    switch(rule){
                        case 'email':
                            regExp = /^[a-zA-Z0-9_\.\-]{1,64}@[a-zA-Z0-9\.\-]{1,253}\.[a-zA-Z]{2,10}$/;
                            if( val.length > 0 && !val.match( regExp ) ) {
                                error.type.push('email');
                            }
                            break;
        
                        case 'phone':
                            regExp = /^[0-9\(\)\-\+]+$/gi;
                            if( valnospace.length > 0 && !valnospace.match( regExp ) ) {
                                error.type.push('phone');
                            }
                            break;
        
                        /*
                        case 'name':
                            var regExp = /^([A-Za-zА-Яа-яЁё\s]{1,}((\-)?[A-Za-zА-Яа-яЁё\.\s](\')?){0,})*$/i;
        
                            if( val.length > 0 && !val.match( regExp ) ) {
                                error.type.push('name');
                            }
                            break;
                        case 'string':
                            var regExp = /^[A-Za-zА-Яа-яЁё0-9,\.:;\"\'\`\-\_\+\?\!\%\$\@\*\&\^\s]$/i;
        
                            if( val.length > 0 && !val.match( regExp ) ) {
                                error.type.push('string');
                            }
                            break;
                            */
                        default:
                            break;
                    }
                }
                if (error.type && error.type.length > 0) {
                    arError[arError.length] = error;
                }
            });
    
            return arError;
        }
    
        var $jallforms = $('.r').find('.js-form-proccess[data-formactiontype]');
        if ($jallforms.length > 0) {
            $jallforms.each(function() {
                if($(this).data('formactiontype') == 2) {
                    $(this).append('<div style="position: absolute; left: -5000px;"><input type="text" name="form-spec-comments" value="Its good" class="js-form-spec-comments"  tabindex="-1" /></div>');
                }
            });
        }
        
        $('.r').on('submit','.js-form-proccess', function(event) {
    
            $(this).find('.js-errorbox-all').hide();
            $(this).find('.js-rule-error').hide();
            $(this).find('.js-error-rule-all').html('');
            $(this).find('.js-successbox').hide();
            $(this).find('.js-error-control-box').removeClass('js-error-control-box');
            /*$(this).find('.js-form-spec-tilda-input').remove();*/
            $(this).removeClass('js-send-form-error');
            $(this).removeClass('js-send-form-success');
            
            var arError = validateForm($(this));
            var $blockinput='';
            if (arError && arError.length > 0) {
                var clsInputBoxSelector = $(this).data('inputbox');
                if ( !clsInputBoxSelector ) {
                    clsInputBoxSelector = '.blockinput';
                }
                /*/$(this).find('.blockinput__errorbox').show().css({'display':'block'});*/
                for(var i=0; i<arError.length;i++) {
                    if (!arError[i] || !arError[i].obj) { continue; }
                    
                    arError[i].obj.closest(clsInputBoxSelector).addClass('js-error-control-box')
                    
                    for(j=0;j<arError[i].type.length;j++) {
                        error = arError[i].type[j];
                        var $errItem = $(this).find('.js-rule-error-'+error);
                        if ($errItem.length > 0){
                            $errItem.css('display','block').show();
                        }
                    }
                }
                if(arError.length > 0) {
                    $(this).find('.js-errorbox-all').css('display','block').show();
                }
                return false;
            } else {
                var $activeForm = $(this);
                var formtype = $(this).data('formactiontype');
                if (formtype==2 && $(this).find('.js-formaction-services').length > 0) {
                    var $elemCookie = $activeForm.find('input[name=tildaspec-cookie]');
                    if (!$elemCookie || $elemCookie.length == 0){
                        $activeForm.append('<input type="hidden" name="tildaspec-cookie" value="">');
                        $elemCookie = $activeForm.find('input[name=tildaspec-cookie]');
                    }
                    if ($elemCookie.length > 0) {
                        $elemCookie.val(document.cookie);
                    }
                    
                    $elemCookie = $activeForm.find('input[name=tildaspec-referer]');
                    if (!$elemCookie || $elemCookie.length == 0){
                        $activeForm.append('<input type="hidden" name="tildaspec-referer" value="">');
                        $elemCookie = $activeForm.find('input[name=tildaspec-referer]');
                    }
                    if ($elemCookie.length > 0) {
                        $elemCookie.val(window.location.href);
                    }
    
                    var $btn = $(this).find('[type=submit]');
                    $btn.attr('disabled','disabled');
                    $(this).data('submitbtn', $btn);
                    $(this).data('opacity', $btn.css('opacity'));
                    $(this).find('.js-form-spec-comments').val('');
                    $btn.css('opacity','0.5');
                    
                    $.ajax({
                        type: "POST",
                        url: "https://forms.tildacdn.com/procces/" /*$(this).attr('action')*/,
                        data: $(this).serialize(),
                        dataType : "json",
                        success: function(json){
                            var $btn =$activeForm.data('submitbtn');
                            var css = $activeForm.data('opacity');
                            var successurl = $activeForm.data('success-url');
                            var successcallback = $activeForm.data('success-callback');
                            
                            if(css) {
                                $btn.css('opacity', css);
                            } else {
                                $btn.css('opacity', '1');
                            }
                            $btn.removeAttr('disabled');
                            
                            if(json && json.error) {
                                successurl = '';
                                successcallback = '';
    
                                var $errBox = $activeForm.find('.js-errorbox-all');
                                if(!$errBox || $errBox.length == 0) {
                                    $activeForm.prepend('<div class="js-errorbox-all"></div>');
                                    $errBox = $activeForm.find('.js-errorbox-all');
                                }
    
                                var $allError = $errBox.find('.js-rule-error-all');
                                if (!$allError || $allError.length == 0) {
                                    $errBox.append('<p class="js-rule-error-all">'+json.error+'</p>');
                                    $allError = $errBox.find('.js-rule-error-all');
                                }
                                $allError.html(json.error).show();
                                $errBox.show();
    
                                $activeForm.addClass('js-send-form-error');
                                
                            } else {
                                $activeForm.find('.js-successbox').show();
                                
                                $activeForm.addClass('js-send-form-success');
    
                                var virtPage = '/tilda/'+$activeForm.attr('id')+'/submitted/';
                                var virtTtitle = 'Send data from form '+$activeForm.attr('id');
                                if(typeof ga != 'undefined' && ga) {
                                    if (window.mainTracker == 'tilda') {
                                        ga('tilda.send', {'hitType':'pageview', 'page':virtPage,'title':virtTtitle});
                                    } else {
                                        ga('send', {'hitType':'pageview', 'page':virtPage,'title':virtTtitle});
                                    }
                                }
                                
                                if (window.mainMetrika > '' && window[window.mainMetrika]) {
                                    window[window.mainMetrika].hit(virtPage, {title: virtTtitle,referer: window.location.href});
                                }
        
                                if (window.dataLayer) {
                                    window.dataLayer.push({'event': 'submit_'+$activeForm.attr('id')}); 
                                }
        
                                var formres = {};
                                if (json && json.results && json.results[0]) {
                                    var str = json.results[0];
                                    str = str.split(':');
                                    formres.tranid = ''+str[0]+':'+str[1];
                                    formres.orderid = (str[2] ? str[2] : '0');
                                } else {
                                    formres.tranid = '0';
                                    formres.orderid = '0';
                                }
                                $activeForm.data('tildaformresult', formres);
                                
                                if (successcallback && successcallback.length > 0) {
                                    eval(successcallback+'($activeForm)');
                                } else {
                                    if(successurl && successurl.length > 0) {
                                        window.location.href= successurl;
                                    }
                                }
    
                                $activeForm.find('input[type=text]:visible').val('');
                                $activeForm.find('textarea:visible').html('');
                                $activeForm.find('textarea:visible').val('');
                                $activeForm.data('tildaformresult', {tranid: "0", orderid: "0"});
                            }
                        },
                        error: function(error) {
                            var $btn =$activeForm.data('submitbtn');
                            var css = $activeForm.data('opacity');
                            if(css) {
                                $btn.css('opacity', css);
                            } else {
                                $btn.css('opacity', '1');
                            }
                            $btn.removeAttr('disabled');
    
                            var $errBox = $activeForm.find('.js-errorbox-all');
                            if(!$errBox || $errBox.length == 0) {
                                $activeForm.prepend('<div class="js-errorbox-all"></div>');
                                $errBox = $activeForm.find('.js-errorbox-all');
                            }
    
                            var $allError = $errBox.find('.js-rule-error-all');
                            if (!$allError || $allError.length == 0) {
                                $errBox.append('<p class="js-rule-error-all">Unknown error. Later, plaese try again.</p>');
                                $allError = $errBox.find('.js-rule-error-all');
                            }
                            $allError.show();
                            $errBox.show();
    
                            $activeForm.addClass('js-send-form-error');
                        },
                        timeout: 1000*15
                    });
                
                    event.preventDefault();
                    return false;
                } else {
                    if ($(this).data('is-formajax')=='y') {
                        var $btn = $(this).find('[type=submit]');
                        $btn.attr('disabled','disabled');
                        $(this).data('submitbtn', $btn);
                        $(this).data('opacity', $btn.css('opacity'));
                        $btn.css('opacity','0.5');
                        
                        $.ajax({
                            type: "POST",
                            url: $(this).attr('action'),
                            data: $(this).serialize(),
                            dataType : "html",
                            success: function(html){
                                var $btn =$activeForm.data('submitbtn');
                                var css = $activeForm.data('opacity');
                                var successurl = $activeForm.data('success-url');
    
                                if(css) {
                                    $btn.css('opacity', css);
                                } else {
                                    $btn.css('opacity', '1');
                                }
                                $btn.removeAttr('disabled');
    
                                if(html && html.length > 0){
                                    $activeForm.find('.js-successbox').html(html);
                                }
                                $activeForm.find('.js-successbox').show();
                                $activeForm.find('input[type=text]:visible').val('');
                                $activeForm.find('textarea:visible').html('');
                                $activeForm.find('textarea:visible').val('');
                                $activeForm.addClass('js-send-form-success');
    
                                var virtPage = '/tilda/'+$activeForm.attr('id')+'/submitted/';
                                var virtTtitle = 'Send data from form '+$activeForm.attr('id');
                                if(typeof ga != 'undefined') {
                                    if (window.mainTracker == 'tilda') {
                                        ga('tilda.send', {'hitType':'pageview', 'page':virtPage,'title':virtTtitle});
                                    } else {
                                        ga('send', {'hitType':'pageview', 'page':virtPage,'title':virtTtitle});
                                    }
                                }
                                
                                if (window.mainMetrika > '' && window[window.mainMetrika]) {
                                    window[window.mainMetrika].hit(virtPage, {title: virtTtitle,referer: window.location.href});
                                }
    
                                if(successurl && successurl.length > 0) {
                                    window.location.href= successurl;
                                }
    
                            },
                            error: function(error) {
                                var $btn =$activeForm.data('submitbtn');
                                var css = $activeForm.data('opacity');
                                if(css) {
                                    $btn.css('opacity', css);
                                } else {
                                    $btn.css('opacity', '1');
                                }
                                $btn.removeAttr('disabled');
        
                                var $errBox = $activeForm.find('.js-errorbox-all');
                                if(!$errBox || $errBox.length == 0) {
                                    $activeForm.prepend('<div class="js-errorbox-all"></div>');
                                    $errBox = $activeForm.find('.js-errorbox-all');
                                }
    
                                var $allError = $errBox.find('.js-rule-error-all');
                                if (!$allError || $allError.length == 0) {
                                    $errBox.append('<p class="js-rule-error-all">Unknown error. Later, plaese try again.</p>');
                                    $allError = $errBox.find('.js-rule-error-all');
                                }
                                $allError.show();
                                $errBox.show();
                                $activeForm.addClass('js-send-form-error');
        
                            },
                            timeout: 1000*15
                        });
                    
                        event.preventDefault();        
                        return false;
                    } else {
                        return true;
                    }
                }
            }
    
    
        
        });
    });
    
})(jQuery);
