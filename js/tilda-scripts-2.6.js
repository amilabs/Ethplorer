(function( $ ){
    $isMobile=false;
    /* isWidthLimited = $(window).width() <= 1024; */
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        $isMobile=true;
    }
    window.isMobile=$isMobile;

    if($isMobile == true){
        var correctHeight = function(){
        	/* covers */
            var coverCarries = document.body.querySelectorAll('.t-cover__carrier'),
                viewPortHeight = $(window).height(),
                factor = 0;
            for(var i= 0, l = coverCarries.length, cc , ccStyle, newHeight, parent, opacityLayer, textBox; i < l; i++){
                cc = coverCarries[i];
                ccStyle = cc.style;
                if(ccStyle.height.indexOf('vh') > -1){
                    factor = parseInt(ccStyle.height) / 100;
                    newHeight = viewPortHeight + 'px';
                    parent = $(cc).parent('.t-cover');
                    if(parent && (parent = parent[0])){
                        opacityLayer = parent.querySelector('.t-cover__filter');
                        textBox = parent.querySelector('.t-cover__wrapper');
                        if (opacityLayer) {
                            opacityLayer.style.height = newHeight;
                        }
                        if(textBox) {
                            textBox.style.height = newHeight;
                        }
                        ccStyle.height = parent.style.height = newHeight;	                    
                    }
                }
            }
            /* others */
            var elCarries = document.body.querySelectorAll('[data-height-correct-vh]'),
                viewPortHeight = $(window).height(),
                factor = 0;
            for(var i= 0, l = elCarries.length, cc , ccStyle, newHeight, parent, opacityLayer, textBox; i < l; i++){
                cc = elCarries[i];
                ccStyle = cc.style;                
                if(ccStyle.height.indexOf('vh') > -1){
                    factor = parseInt(ccStyle.height) / 100;
                    newHeight = viewPortHeight + 'px';
                    parent = $(cc).parent('.t-cover');
                    ccStyle.height = newHeight;
                }                 
            }
        };
        $(document).ready(function(){
        	correctHeight();
        });
        $(window).load(function(){
        	correctHeight();
        });
    }
    
    if($isMobile == true){
    	if($(window).width() < 480){    
	    	$(document).ready(function(){
		    	$("div[data-customstyle=yes]").each(function(index) {
					if($(this).css('font-size').replace('px','')>26){
						$(this).css('font-size','');
						$(this).css('line-height','');		
					}
				});
		    	$("[field]").find("span").each(function(index) {
					if($(this).css('font-size').replace('px','')>26){
						$(this).css('font-size','');
					}
				});
			});	
			$(window).load(function(){
				var window_width=$(window).width();
				$(".r").each(function(){
					var el=$(this);
					$(this).find("div").not("[data-auto-correct-mobile-width=false], .tn-elem, .tn-atom").each(function(){
						var r_div_width=parseInt($(this).outerWidth(true));
						if((r_div_width)>window_width){
							console.log('Block not optimized for mobile width. Block width:'+r_div_width+' Block id:'+el.attr('id'));
							console.log($(this));
							el.css("overflow","auto");
							if((r_div_width-3)>window_width){
								el.css("word-break","break-all");		
							}
						}
					});
				});
			});								
		}else if($(window).width() < 900){
			$(document).ready(function(){
		    	$("div[data-customstyle=yes]").each(function(index) {
					if($(this).css('font-size').replace('px','')>30){
						$(this).css('font-size','');
						$(this).css('line-height','');		
					}
				});
		    	$("[field]").find("span").each(function(index) {
					if($(this).css('font-size').replace('px','')>30){
						$(this).css('font-size','');
					}
				});							
			});	
		}
    }    
    
})( jQuery );


(function($){
    /**
     * @constructor
     */
    function VideoLoadProcessor(){
        this.setScrollListener();
    }

    VideoLoadProcessor.prototype.videoTags = [];
    VideoLoadProcessor.prototype.defaultConfig = {
        isNeedStop : false
    };
    VideoLoadProcessor.prototype.videoConfigs = [];
    /**
     * @param {HTMLVideoElement} video
     * @param {{} | Undefined} config
     */
    VideoLoadProcessor.prototype.registerNewVideo = function(video, config){
        if(!(video instanceof HTMLVideoElement)){
            throw new Error("Wrong tag passed into registerNewVideo");
        }
        if(this.videoTags.indexOf(video) == -1){
            this.videoTags.push(video);
            this.videoConfigs.push(typeof config == "undefined" ? this.defaultConfig : config);
            this.scrollCb();
            return true;
        }
        return false;
    }
    /**
     * @param {HTMLVideoElement} video
     */
    VideoLoadProcessor.prototype.unergisterVideo = function(video){
        if(!(video instanceof HTMLVideoElement)){
            throw new Error("Wrong tag passed into unregisterNewVideo");
        }
        var index;
        if((index = this.videoTags.indexOf(video)) > -1){
            if(typeof video.remove == "function"){
                video.remove();
            }else{
                if(video.parentNode){
                    video.parentNode.removeChild(video);
                }
            }
            this.pauseVideo(video, this.videoConfigs[index]);
            this.videoTags.splice(index, 1);
            this.videoConfigs.splice(index, 1);
            return true;
        }
        return false;
    }

    VideoLoadProcessor.prototype.pauseVideo = function(video, config){
        if(!config){
            throw new Error("Wrong config type!");
        }
        video.pause();
        if(config.isNeedStop){
            video.load();
        }
    }

    VideoLoadProcessor.prototype.setScrollListener = function(){
        $(window).scroll(jQuery.proxy(this.scrollCb, this));
    }

    VideoLoadProcessor.prototype.scrollCb = function(){
        var windowHeight = $(window).height(),
            _shift = 0,
            _v = null;
	        for(var i= 0, l = this.videoTags.length; i < l; i++){
	            _v = this.videoTags[i], _vrect = this.getVideoBoundingRect(_v, false);
	            /* set fade volume */
	            if(Math.abs(_vrect.top) < windowHeight && Math.abs(_vrect.top) > windowHeight/2){
	                var vol = 1 - (Math.abs(_vrect.top)-windowHeight/2)/(windowHeight/2) - 0.2;
	                if(vol>0 && vol<=1 && _v.volume!=0) { _v.volume=vol; }
	            }
	            /* then pause              */
	            if(Math.abs(_vrect.top) > windowHeight || _vrect.height == 0 /*display : none*/){
	                this.pauseVideo(_v, this.videoConfigs[i]);
	                continue;
	            }
	            if(_v.paused){
	                _v.play();
	            }
	        }
    };

    VideoLoadProcessor.prototype.getVideoObject = function(video){
        for(var i= 0, l = this.videoTags.length; i > l; i++){
            var vo = this.videoTags[i];
            if(vo.v === video) {
                return vo;
            }
        }
        return null;
    }

    VideoLoadProcessor.prototype.getVideoBoundingRect = function(video, isNeedParent){
        if(typeof isNeedParent == "undefined"){
            isNeedParent = true;
        }
        var parent = null;
        if(isNeedParent){
            parent = $(video).parents('.r')[0];
            if(!parent){
                parent = video;
            }
        }else{
            parent = video;
        }
        return parent.getBoundingClientRect();
    }
    window.videoLoadProcessor = new VideoLoadProcessor();
    
})( jQuery );


(function($){
	
    function SequenceController(){
        this.setScrollCb();
        this.itemHeight = screen.availHeight;/* document.documentElement.clientHeight || window.innerHeight || screen.availHeight;*/
        var itemTransitionItemRelation = 0.25;
        this.itemTransitionTop = this.itemHeight * itemTransitionItemRelation;
        this.activeItemIndex = null;
        this.windowHeight = document.documentElement.clientHeight || window.innerHeight || screen.availHeight;
        this.topOffsetShift = -150;
        $(window).resize(jQuery.proxy(this.recalculateAllSequencesOffsets,this));
        this._resizeInterval = setInterval(jQuery.proxy(this.scrollCb,this),500);
    }

    SequenceController.prototype.defaultConfig = {
        orientation : "vertical",
        speedFactor : 1,
        automated : false
    };

    SequenceController.prototype.sequenceObjects = [];
    /**
     * @param {{}} sO
     */

    SequenceController.prototype.recalculateAllSequencesOffsets = function(){
        if(this._resizeTimeout) {
            clearTimeout(this._resizeTimeout);
        }

        if(this._resizeInterval){
            clearInterval(this._resizeInterval);
        }

        this._resizeTimeout = setTimeout(jQuery.proxy(function(){
            this.scrollCb();
            this._resizeInterval = setInterval(jQuery.proxy(this.scrollCb,this),500);
        },this),10);
    }

    SequenceController.prototype.registerNewBlock = function(node){
        if(!(node instanceof HTMLElement)){
            throw new Error("Wrong node type in registerNewBlock");
        }
        for(var i= 0, l = this.sequenceObjects.length; i < l; i++){
            if(this.sequenceObjects[i].sequenceBlock === node) {
                return false;
            }
        }
        var sequenceHolder = node.querySelector('[data-hook="sequence-holder"]'),
            sequenceHeight = 0,
            sequenceOffsetTop = this.getAbsoluteTopOffset(sequenceHolder),
            items = (function(){
                var _items = Array.prototype.slice.call(node.querySelectorAll('[data-hook="sequence-item"]'), 0), __items = [];
                _items.forEach(jQuery.proxy(function(el, i, array){
                    var elHeight = this.getItemHeight(el),
                        backgroundHolder = el.querySelector('[data-hook="item-background"]');
                    el.style.height = elHeight + 'px';
                    backgroundHolder.style.height = this.itemHeight + 'px';
                    if(i<array.length-1) {
                        sequenceHeight+=elHeight;
                    }
                    __items.push({
                        node : el,
                        height : elHeight,
                        topOffset : this.getAbsoluteTopOffset(el.querySelector('.txt-holder')) - (i == array.length - 1 ? 0 : this.topOffsetShift),
                        backgroundHolder : backgroundHolder
                    });
                }, this));
                return __items;
            }).call(this),
            h = this.itemHeight,
            sequenceObject = {
                sequenceBlock : node,
                sequenceHolder: sequenceHolder,
                sequenceHolderTopOffset : sequenceOffsetTop,
                sequenceHeight : sequenceHeight,
                items : items,
                started: false,
                prevBackgroundColor : ''
            };
        this.sequenceObjects.push(sequenceObject);

        this.scrollCb();
        return true;
    }

    SequenceController.prototype.getItemHeight = function (el){
        var txtBlock = el.querySelector("[data-hook='item-text']"),
            backgroundHolder = el.querySelector("[data-hook='item-background']");
        st = el.style;
        var computedTop = parseFloat(getComputedStyle(txtBlock).top);
        txtBlock.style.top = computedTop + 'px';
        var totalHeight = Math.max(txtBlock.clientHeight + computedTop, this.itemHeight);
        return totalHeight;
    }

    SequenceController.prototype.fixTextBlocksPosition = function(node){
        txtBlocks = Array.prototype.slice.call(node.querySelectorAll('[data-hook="item-text"]'), 0);
        txtBlocks.forEach(function(el, i , array){
            var backgroundSibling = el.parentNode.querySelector("[data-hook='item-background']");
            backgroundSibling.style.top = '-' + el.clientHeight + 'px';
        });
    }

    SequenceController.prototype.unergisterBlock = function(node){
        for(var i= 0, l = this.sequenceObjects.length, index = null; i < l; i++){
            if(this.sequenceObjects[i].sequenceBlock === node){
                index = i;
                break;
            }
        }
        if(index !== null){
            this.sequenceObjects.splice(index, 1);
            return true;
        }
        return false;
    }
    /**
     * @param {HTMLElement} el
     * @returns {Number|number}
     */
    SequenceController.prototype.getAbsoluteTopOffset = function(el){
        var topOffset = el.offsetTop;
        el = el.offsetParent;
        while(el != null){
            topOffset+= el.offsetTop;
            el = el.offsetParent;
        }
        return topOffset;
    }
    /**
     * @param {Boolean} direction
     * 1 - from top to bottom
     * 0 - from bottom to top
     */
    SequenceController.prototype.processSequence = function(sequenceObject){
        if(sequenceObject.started == false){
            sequenceObject.prevBackgroundColor = document.body.style.backgroundColor;
            document.body.style.backgroundColor = 'rgb(0, 0, 0)';
            sequenceObject.started = true;
        }
        var sequenceBlock = sequenceObject.sequenceBlock,
            sequenceHolder = sequenceObject.sequenceHolder,
            sequenceItems = sequenceObject.items,
            currentItemIndex = null,
            node, backgroundHolder, backgroundHolderStyle, textBlock, opacity;
        for(var i= 0, l = sequenceItems.length, nodeRect, txtBlockRect; i < l; i++){
             node = sequenceItems[i].node,
             txtBlockRect = node.querySelector('.txt-holder')
             nodeRect = node.getBoundingClientRect();
             if(nodeRect.top < this.itemTransitionTop && (nodeRect.bottom < nodeRect.height + this.itemTransitionTop) && nodeRect.bottom > this.itemTransitionTop){
                 currentItemIndex = i;
                 break;
             }
        }
        if(currentItemIndex == null){
            return;
        }
        opacity = nodeRect.top / this.itemTransitionTop;
        if(opacity > 1){
            opacity = 1;
        }else{
            if(opacity < 0){
                opacity = 0;
            }
        }
        for(var i= 0, l = sequenceItems.length; i < l; i++){
            node = sequenceItems[i].node,
            backgroundHolderStyle = sequenceItems[i].backgroundHolder.style;
            if(backgroundHolderStyle.position != "fixed"){
                backgroundHolderStyle.position = "fixed";
            }
            if(i == currentItemIndex){ /* transitted already */
                backgroundHolderStyle.opacity = 1 - opacity;
                node.querySelector('.txt-holder').style.opacity = 1 - opacity;
            } else {
                if(i == currentItemIndex - 1){
                    backgroundHolderStyle.opacity = opacity;
                    node.querySelector('.txt-holder').style.opacity = opacity;
                }else{
                    backgroundHolderStyle.opacity = 0;
                    node.querySelector('.txt-holder').style.opacity = 0;
                }
            }
        }
    }

    SequenceController.prototype.stopSequence = function(sequenceObject){
        if(sequenceObject.started == false){
            return;
        }
        sequenceObject.items.forEach(function(el, i, array){
            el.backgroundHolder.style.position = 'relative';
            el.backgroundHolder.style.display = 'block';
            el.backgroundHolder.style.opacity = 1;
        });
        document.body.style.backgroundColor = sequenceObject.prevBackgroundColor;
        sequenceObject.started = false;
    }

    SequenceController.prototype.scrollCb = function(){
        var scrollTop = $(window).scrollTop();
        for(var i= 0, l = this.sequenceObjects.length, sO, top; i < l; i++){
            sO = this.sequenceObjects[i];
            var boundingRect = sO.sequenceHolder.getBoundingClientRect();
            if(boundingRect.top < 0 && boundingRect.bottom > 0 && boundingRect.bottom > boundingRect.height - sO.sequenceHeight - 100){
                this.processSequence(sO);
            }else{
                this.stopSequence(sO);
            }
        }
    }

    SequenceController.prototype.setScrollCb = function(){
        this._scrollCb = jQuery.proxy(this.scrollCb, this);/*.bind(this);*/
		
        $(window).scroll(this._scrollCb);
    }

    window.sequenceController = new SequenceController();
    
    window.processVideo = function(v){
        mp4Src = $(v).attr('data-content-video-url-mp4');
        webmSrc = $(v).attr('data-content-video-url-webm');
        $(v).css("background-color", "transparent");
        $(v).css("background-image", "");
        var options = {
            mp4: mp4Src,
            webm: webmSrc,
            /*poster: "",*/
            preload: "none",
            autoplay : false,
            loop: true,
            scale:true,
            zIndex:0,
            width: "100%"
        };
        /* Initializing the videos*/
        vid = $(v).videoBG(options);
        videoLoadProcessor.registerNewVideo(vid, {
            isNeedStop : false
        });
    }


	window.cover_init = function(id){
	
        $(document).ready(function(){
            var cover_carrier = document.body.querySelector('#coverCarry' + id);
            var el = $(cover_carrier);

            var backgroundurl=el.attr('data-content-cover-bg');
            var height=el.attr('data-content-cover-height');
            var parallax=el.attr('data-content-cover-parallax');
            var videomp4=el.attr('data-content-video-url-mp4');
            var videowebm=el.attr('data-content-video-url-webm');
            var youtubeid=el.attr('data-content-video-url-youtube');
            var noloop=el.attr('data-content-video-noloop');
            var nomute=el.attr('data-content-video-nomute');
            var bgbase64=el.attr('data-content-bg-base64');
            var video_nocover=el.attr('data-content-video-nocover');
            
            if(!backgroundurl){ backgroundurl="" };
            if(!height) { height=""; }
            if(!parallax) { parallax=""; }
            if(!videomp4) { videomp4=""; }
            if(!videowebm) { videowebm=""; }
            if(!youtubeid) { youtubeid=""; }
            if(!noloop) { noloop=""; }
            if(!nomute) { nomute=""; }
            if(!youtubeid){ youtubeid=""; }
            if(!bgbase64){ bgbase64=""; }
            
            if(video_nocover && video_nocover=='yes') {
				videomp4="";
				videowebm="";
				youtubeid="";            
			}

            if($isMobile && (videowebm!="" || videomp4!="" || youtubeid!="")){
                el.css('background-image', "url('" + backgroundurl + "')");
            }
            
            /*fix content height*/
            var hcover=$("#rec" + id).find(".t-cover").height();
            var hcontent=$("#rec" + id).find("div[data-hook-content]").height();
            if(hcontent>300 && hcover<hcontent){
            	var hcontent=hcontent+100;            
            	$("#rec" + id).find(".t-cover").height(hcontent);
            	$("#rec" + id).find(".t-cover__filter").height(hcontent);
            	$("#rec" + id).find(".t-cover__carrier").height(hcontent);
            	$("#rec" + id).find(".t-cover__wrapper").height(hcontent);
            }   
            
            /* if set video*/
	        if (videomp4!=="" || videowebm!=="" || youtubeid!==""){
	            if($isMobile==false){
	                /* Initializing the videos */
	                if (youtubeid == "" && (videomp4 != "" || videowebm != ""))
	                {
		                el.css("background-color", "#000000");
		                el.css("background-image", "url('https://tilda.ws/img/spinner-white.gif')");
		                el.css("background-size", "auto");
	                	if(noloop!=""){var loop=false;}else{var loop=true;}
	                	if(nomute!=""){var volume=1;}else{var volume='';}
	                    
	                	var height_more_vh="";
	                	if(parallax=="fixed"){
			                if(height.indexOf('vh') > -1){
			                    if( parseInt(height) > 100 ){
			                    	el.css("height","100vh");
			                    	height_more_vh="yes";
			                    }
			                }	                		
			                if(height.indexOf('px') > -1){
			                    if( parseInt(height) > $(window).height() ){
			                    	el.css("height","100vh");
			                    	height_more_vh="yes";
			                    }
			                }	                					                
	                	}
	                		                    
						var cotimer;
						var flagprocessed="";
						var wnd=$(window);
						var prnt=el.parent();						
	                    
						wnd.scroll(function() {
						    if(cotimer) {
						        window.clearTimeout(cotimer);
						    }
						
						    cotimer = window.setTimeout(function() {
							      if(!(flagprocessed>0)){
							          var a,b,c,d,s;
							              
									  a = el.offset().top;
								      b = el.height();
								      		  
								      c = wnd.scrollTop();
								      d = wnd.height();
								      
								      if(((c+d) > a-500) && (c <= (a+b+500))){
					                    var vid = el.videoBG({
					                        mp4: videomp4,
					                        webm: videowebm,
					                        poster: '',
					                        preload: 'none',
					                        autoplay : false,
					                        loop: loop,
					                        volume:volume,
					                        scale:true,
					                        zIndex:0,
					                        width: "100%"
					                    });								      
								      	videoLoadProcessor.registerNewVideo(vid);
								      	flagprocessed=1;
								      }
							      }
						    }, 100);
						    
							if(parallax=="fixed" && height_more_vh=="yes"){
								  var aa,bb,cc,dd,ss;
								      
								  aa = prnt.offset().top;
								  bb = prnt.height();
								  		  
								  cc = wnd.scrollTop();
								  dd = wnd.height();
								  
								  if(cc>=aa+bb-dd){
								      el.css("position","absolute");
								      el.css("bottom","0px");
								      el.css("top","auto");
								      /*el.css("vertical-align","bottom");*/
								  } else {
                                    if(cc>=aa){
                                        el.css("position","fixed");
                                        el.css("top","0px");
                                    } else {
                                        if(cc<aa){
                                            el.css("position","relative");
                                            el.css("top","auto");									      
                                        }
                                    }
                                  }
							}
												    
						});        
						
						wnd.scroll(); 	            

	                /* Initializing youtube video*/
	                }else{
                        if (youtubeid != ""){	 
                            el.css("background-color", "#000000");
                            el.css("background-image", "");
                            var cotimer;
                            var flagprocessed=0;
                            var wnd=$(window);
                            
                            wnd.scroll(function() {
                                if(cotimer) {
                                    window.clearTimeout(cotimer);
                                }
                            
                                cotimer = window.setTimeout(function() {
                                      flagprocessed=el.find("iframe").length;
                                      if(!(flagprocessed>0)){
                                          var a,b,c,d,s;
                                              
                                          a = el.offset().top;
                                          b = el.height();
                                                  
                                          c = wnd.scrollTop();
                                          d = wnd.height();
                                          
                                          if(((c+d) > a-500) && (c <= (a+b+500))){
                                            processYoutubeVideo(cover_carrier, height);
                                            /*flagprocessed=1;*/
                                          }
                                      }
                                }, 100);
                            });        
                            
                            wnd.scroll();           
                            
                        }
                    }
	            }
	        }                    
	        
	        if (parallax=="dynamic"){
	            if($isMobile == false)el.parallax("50%",0.2,true);
	        }    
	        
	        if (bgbase64=="yes" && backgroundurl!="" && videomp4=="" && videowebm=="" && youtubeid==""){
	            var bg_already="";
				$('<img/>').attr('src', backgroundurl).load(function() {
				    $(this).remove();
					el.css('background-image', "url('"+backgroundurl+"')");	   			   
					el.css("opacity","1");
					var bg_already="yes";
				});
				if(bg_already!="yes"){
					el.css('background-image','');
		            el.css("opacity","0");
					el.css("transition","opacity 25ms");
				}
	        }
	        
            var coverarrow=$("#rec" + id).find(".t-cover__arrow-wrapper");
            if(coverarrow.length>0){
				coverarrow.click(function() {
			    	/*var nextrec = $("#rec" + id).next();*/
			    	/*if(nextrec.length>0)$('html, body').animate({scrollTop:nextrec.offset().top}, 500);*/
			    	var recheight = $("#rec" + id).height();
			    	if(recheight>0){ $('html, body').animate({scrollTop:$("#rec" + id).offset().top + recheight}, 500); }
			  	});
			} 	        
	        
        });
                
	}
	
    $(document).ready(function(){	
    	$(".t-cover__carrier").each(function() {
			var id=$(this).attr('data-content-cover-id');
			if(id>0) { cover_init(id); }
		});	
    });	

    function processSrc(src,nocover){
        if(src.indexOf('https://www.youtube.com/embed') == -1){
            src = "https://www.youtube.com/embed" + (src[0] == '/' ? src : '/' + src);
        }
        var extractVideoId = function(src){
          var parts = src.split('/'), neededPart = null;
          for(var i=0, l = parts.length; i < l; i++){
            if(parts[i] == "embed"){
              neededPart = parts[i+1];
            }
          }
          return neededPart;
        }
        var currentLocation = location.protocol+'//'+location.host;
        
        if(nocover!="yes"){   
	        src = (src[src.length-1] == '/' ? src : src) + '?autoplay=1&loop=1&enablejsapi=1&&playerapiid=featuredytplayer&controls=0&modestbranding=1&rel=0&showinfo=0&color=white&iv_load_policy=3&theme=light&wmode=transparent&origin='+currentLocation+'&playlist='+extractVideoId(src);
	    }else{
	        src = (src[src.length-1] == '/' ? src : src) + '?autoplay=0&loop=0&enablejsapi=1&&playerapiid=featuredytplayer&controls=1&modestbranding=1&rel=0&showinfo=0&color=black&iv_load_policy=3&theme=dark&wmode=transparent&origin='+currentLocation;		    
	    }
        return src;
    }

    function onYouTubePlayerReady_do(div,player,nomute){
        var timer;
        var wnd = $(window);
        var frame = $(div);
		var timer_count=0;
		
		wnd.scroll(function() {
		    if(timer) {
		        window.clearTimeout(timer);
		        if(timer_count>=15){
		        	timer_player_do(frame,wnd,player,nomute);
		        	timer_count=0;
		        }
		        timer_count++;
		    }
		
		    timer = window.setTimeout(function() {
			      timer_player_do(frame,wnd,player,nomute);
		    	  timer_count=0;    
		    }, 100);
		});        
		
		wnd.scroll();           
    }
    
    function timer_player_do(frame,wnd,player,nomute){
          var a,b,c,d,s;
              
		  a = frame.offset().top;
	      b = frame.height();
	      		  
	      c = wnd.scrollTop();
	      d = wnd.height();
	      
	      s = player.getPlayerState();
	      
	      if(((c+d) > a) && (c <= (a+b))){
			  if(s !== 1) { player.playVideo(); }
	          if(nomute=="yes"){
		          if(c>a+b-100){
	              	player.setVolume(30);
		          }else{
                    if(c>a+b-200){
                      player.setVolume(70);
                    }else{
                        if(c+d<a+200){
                          player.setVolume(30);
                        }else{
                          player.setVolume(100);
                        }
                    }
                  }
		      }else{
			      console.log("no");
		      }
	      }else{
            if((c+d) < a && (c+d) > (a-500)){
                if(s !== 2){
                   player.playVideo();		      	  
                   player.pauseVideo();
                }
            }else{
                if(c > (a+b) && c < (a+b+500)){
                    if(s !== 2){
                       player.pauseVideo();
                    }
                }else{
                    if(s !== 2){
                       player.pauseVideo();
                    }
                }
            }
          }
    }
    
    var def = $.Deferred();

    window.processYoutubeVideo = function(div, height){
        var defFunc = function(){
        
         console.log("youtube iframe processed");
         var src = $(div).attr('data-content-video-url-youtube');
         var nomute = $(div).attr('data-content-video-nomute');
         var noloop = $(div).attr('data-content-video-noloop');
         var nocover = $(div).attr('data-content-video-nocover');         
         
         var iframe = document.createElement('iframe');
         iframe.src = processSrc(src,nocover);
	     iframe.frameBorder = 0;         
         
         if(nocover!="yes"){         
	         if(!height){
	             height = "100vh";
	         }         
	         if(height.indexOf('vh') > -1){
				var wh = window.innerHeight;
				if(!wh) {
					wh = $(window).height();
				}
	             var div_height = Math.floor((wh * (parseInt(height) / 100)));
	         }else{
	             var div_height = parseInt(height);		         
	         }
	         var div_width = Math.floor (parseInt(window.innerWidth));
	         if(!div_width) {
				div_width = $(window).width();
			 }
	         var video_width = div_width;
	         var video_height = video_width * 0.5625;
	         
	                  
	         var vw2 = video_width;	                  
	         var vh2 = video_height + 110 + 110;
	         var delta_coef=1;	         
	         
	         if((video_height-220) < div_height){
		         if(video_height<div_height){
			     	var delta_coef = ( div_height / video_height ) + 0.02;	       
		         }else{
			     	var delta_coef = (video_height / div_height ) + 0.02;
		         }
	         }

	     	 var zoom_video_width = Math.floor( vw2 * delta_coef );
	     	 var zoom_video_height = Math.floor( vh2 * delta_coef );	         
	               	         
	         var heightDelta = zoom_video_height - div_height;
	         var widthDelta = zoom_video_width - div_width;
	        
			/*if (iframe.height) {*/
	         iframe.height = zoom_video_height + 'px';
	         iframe.width = zoom_video_width + 'px';
			/*} else {
	        // iframe.style.height = zoom_video_height + 'px';
	        // iframe.style.width = zoom_video_width + 'px';
			//}*/
			
	         if(heightDelta > 0){
	             iframe.style.marginTop = - Math.floor(heightDelta / 2 ) + 'px';
	         }
	         if(widthDelta > 0){
	             iframe.style.marginLeft = - Math.floor(widthDelta / 2) + 'px';
	         }
	     }else{
	     	 var video_height;
	         if(!height){
	         	 video_height = Math.floor ( $(div).width() * 0.5625 );
	         }       
	         if(height && height.indexOf('vh') > -1){ 
	             video_height = Math.floor((window.innerHeight * (parseInt(height) / 100)));
	         }else{
                if(height){
                    video_height = parseInt(height);
                }
             }
	         
		     iframe.width="100%";
		     iframe.height=video_height + 'px';	     
	     }
	              
         var playtimer;                       
         div.appendChild(iframe);
         if($isMobile == false){
		         var player = new YT.Player(iframe,{
		          events:{
		            'onReady': function(e){
		              onYouTubePlayerReady_do(div,e.target,nomute);
		              if(e.target.setVolume && nomute!="yes"){
		                e.target.setVolume(0);
		              }
		              e.target.setLoop(true);
		            },
		            'onStateChange': function(e){
		              if(e.target.setVolume && nomute!="yes"){
		                e.target.setVolume(0);
		              }          
		
		              if(e.data === -1){
		              	  var sp=window.fix_scrolltop_beforestop_youtube;
			              if(sp>=0){
				              $('html, body').scrollTop(sp);
				              delete window.fix_scrolltop_beforestop_youtube;
				          }
		              }
					  if(e.data === YT.PlayerState.PLAYING){
					    playtimer = window.setInterval(function() {
						    var a=e.target.getCurrentTime();
						    var b=e.target.getDuration();
						    if(a+1>b && b!==0){
							    e.target.seekTo(0);				    
						    	if(noloop==="yes"){
								    e.target.stopVideo();
								    e.target.clearVideo();							
								}
						    }			    	
					    }, 1000);			    
					  }else{
						window.clearTimeout(playtimer);  
					  }
		            }
		          }
		         });
		 }
        }
        def.then(defFunc);
    }
    
    /*$(document).ready(function(){*/
        var tag = document.createElement('script');
    
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    /*});*/
    
    window.onYouTubeIframeAPIReady = function(){
       def.resolve(); 
    }
    
})( jQuery );


(function($){
    /**
	  * Global object that implements the event model.
      * The essence of it is that he is one and is global, it all podpisyvayutsya
      * Amity and ask him the same way
      * (Instead of each object was emitterom = /)
      *constructor
      *version 0.0.1
     */
    function Observer(){
        this.callbacks = {};
    }

    Observer.prototype.defaultConfig = {
        single : false,
        context : null
    };

    Observer.prototype.addEventListener = function(name, callback, config){
        evtCallbacks = this._getEventCallbacks(name);
        if(!evtCallbacks){
            evtCallbacks = this.callbacks[name] = [];
        }

        evtCallbacks.push({
            callback : callback,
            config : (typeof config == "object" ? config : this.defaultConfig)
        });
    }

    Observer.prototype._getEventCallbacks = function(name){
        return this.callbacks[name];
    }

    Observer.prototype.removeEventListener = function(name, callback){
        var cbs = this._getEventCallbacks(name);
        if(!cbs){
            return false;
        }

        for(var i= 0, l = cbs.length, cbObj; i < l; i++){
            cbObj = cbs[i];
            if(callback === cbObj.callback){
                cbs.splice(i,1);
                return true;
            }
        }
        return false;
    }

    Observer.prototype.emitEvent = function(name, data){
        var cbs = [];
        extend(cbs,this._getEventCallbacks(name));
        for(var i= 0, l = cbs.length, cbObj, cb, config; i < l; i++){
            cbObj = cbs[i];
            cb = cbObj.callback;
            config = cbObj.config;
            if(config.context){
                cb.call(config.context, data);
            }else{
                cb(data);
            }

            if(config.single){
                this.removeEventListener(name, cb);
            }
        }
    }

    window.observer = new Observer();
    
})( jQuery );


(function($){
	$(document).ready(function(){
	    if($isMobile == false && $('#allrecords').attr('data-blocks-animationoff')!=='yes'){
		    $(".r").each(function(i) {
	            if($(this).attr('style') && $(this).attr('style').indexOf('background-color') !== -1){
		            $(this).attr('data-animationappear','off');
	            }
	        });			    
	        /*add animation*/
	        var tiles = $(".r").not('[data-animationappear=off], [data-screen-min], [data-screen-max]'),
	            wnd = $(window);
	        tiles.each(function(i) {
	            a = $(this).offset().top;
	            b = wnd.scrollTop() + wnd.height() + 300 ;
	            if (a > 1000 && a > b ){ $(this).fadeTo(0,0); }
	        });         
	        function blocksfade(){
	            if(tiles.length){
	                for(var i = tiles.length - 1, tile, a, b; i >= 0; i--){
	                    tile = $(tiles[i]);
	                    a = tile.offset().top;
	                    b = wnd.scrollTop() + wnd.height() - 100;
	                    if(a < b){
	                        tile.fadeTo(500, 1, function() {});
	                        tiles.splice(i, 1);
	                    }
	                }
	            }else{
	                wnd.unbind('scroll', blocksfade);
	            }
	        }
	        wnd.scroll(blocksfade);
	        blocksfade();
	    }
		if($("body").height() < $(window).height()-100){ $(".t-tildalabel").css("display","none"); }
	});
})( jQuery );


(function($){
	function blocksdisplay(){
		var window_width = $(window).width();    
	    var recs = $('div.r[data-screen-max], div.r[data-screen-min]');
	    var max,min;
	    var disp;
	    recs.each(function(i) {
	        disp = $(this).css("display");                     
	        max = $(this).attr("data-screen-max");
	        if( max === undefined) { max=10000; }
	        max = parseInt(max);
	        
	        min = $(this).attr("data-screen-min");
	        if( min === undefined) { min=0; }
	        min = parseInt(min);
	        console.log(min+"-"+max);
	        if(min<=max){
	            if (window_width <= max && window_width > min) {
	            	if(disp!="block") { $(this).css("display","block"); }
	            }else{
	            	if(disp!="none"){ $(this).css("display","none"); }
	            }
	        }
	    });
	}
	
	$(document).ready(function(){
		blocksdisplay();
	});
	
	$(window).resize(function() {
		blocksdisplay();
	});    
	
})( jQuery );



/**
 * @VideoBG function preserve Copyright 2011 Syd Lawrence ( www.sydlawrence.com ). Version: 0.2
 * Licensed under MIT and GPLv2.
 */

(function( $ ){

	$.fn.videoBG = function( selector, options ) { 
		
		var options = {};
		if (typeof selector == "object") {
			options = $.extend({}, $.fn.videoBG.defaults, selector);
		} else {
            if (!selector) {
                options = $.fn.videoBG.defaults;
            } else {
                return $(selector).videoBG(options);		
            }
        }
		
		var container = $(this);
		
		/* check if elements available otherwise it will cause issues*/
		if (!container.length) {
			return;
		}
		
		/* container to be at least relative*/
		if (container.css('position') == 'static' || !container.css('position')) {
			container.css('position','relative');
		}
		
		/* we need a width*/
		if (options.width == 0) {
			options.width = container.width();
		}
		
		/* we need a height*/
		if (options.height == 0) {
			options.height = container.height();
		}
		
		/* get the wrapper*/
		var wrap = $.fn.videoBG.wrapper();
		wrap.height(options.height)
			.width(options.width);
		
		/* if is a text replacement*/
		if (options.textReplacement) {
		
			/* force sizes*/
			options.scale = true;
			
			/* set sizes and forcing text out*/
			container.width(options.width)
				.height(options.height)
				.css('text-indent','-9999px');
		} else {
		
			/* set the wrapper above the video*/
			wrap.css('z-index',options.zIndex+1);
		}
		
		/* move the contents into the wrapper
		// commented by n.o
		//wrap.html(container.clone(true));*/
		
		/* get the video*/
		var video = $.fn.videoBG.video(options);
		
		/* if we are forcing width / height */
		if (options.scale) {
			
			/* overlay wrapper*/
			wrap.height(options.height)
				.width(options.width);
			
			/* video*/
			video.height(options.height)
				.width(options.width);
		}
		
		/* add it all to the container*/
		container.html(wrap);
		container.append(video);
		
		return video.find("video")[0];
	}

	/* set to fullscreen*/
	$.fn.videoBG.setFullscreen = function($el) {
		var windowWidth = $(window).width(),
			windowHeight = $(window).height();

		$el.css('min-height',0).css('min-width',0);
		$el.parent().width(windowWidth).height(windowHeight);
		/* if by width */
		if (windowWidth / windowHeight > $el.aspectRatio) {
			$el.width(windowWidth).height('auto');
			/* shift the element up*/
			var height = $el.height();
			var shift = (height - windowHeight) / 2;
			if (shift < 0){ shift = 0; }
			$el.css("top",-shift);
		} else {
			$el.width('auto').height(windowHeight);
			/* shift the element left*/
			var width = $el.width();
			var shift = (width - windowWidth) / 2;
			if (shift < 0){ shift = 0;}
			$el.css("left",-shift);
			
			/* this is a hack mainly due to the iphone*/
			if (shift === 0) {
				var t = setTimeout(function() {
					$.fn.videoBG.setFullscreen($el);
				},500);
			}
		}

		$('body > .videoBG_wrapper').width(windowWidth).height(windowHeight);
			
	}

	/* get the formatted video element*/
	$.fn.videoBG.video = function(options) {
		
		/*commented by n.o*/
		/*$('html, body').scrollTop(-1);*/

		/* video container*/
		var $div = $('<div/>');
		$div.addClass('videoBG')
			.css('position',options.position)
			.css('z-index',options.zIndex)
			.css('top',0)
			.css('left',0)
			.css('height',options.height)
			.css('width',options.width)
			.css('opacity',options.opacity)
			.css('overflow','hidden');
		
		/* video element*/
		var $video = $('<video/>');
		$video.css('position','absolute')
			.css('z-index',options.zIndex)
			.attr('poster',options.poster)
			.css('top',0)
			.css('left',0)
			.css('min-width','100%')
			.css('min-height','100%');
		
		if (options.autoplay) {
			$video.attr('autoplay',options.autoplay);
		}
		
		if(options.volume>0){
			$video.prop("volume", options.volume);
		}else{
			$video.prop("volume", 0);
		}

		/* if fullscreen*/
		if (options.fullscreen) {
			$video.bind('canplay',function() {
				/* set the aspect ratio*/
				$video.aspectRatio = $video.width() / $video.height();
				$.fn.videoBG.setFullscreen($video);
			})

			/* listen out for screenresize*/
			var resizeTimeout;
			$(window).resize(function() {
				clearTimeout(resizeTimeout);
				resizeTimeout = setTimeout(function() {
					$.fn.videoBG.setFullscreen($video);
				},100);	
			});
			$.fn.videoBG.setFullscreen($video);
		}
			
		
		/* video standard element*/
		var v = $video[0];
		
		/* if meant to loop*/
		if (options.loop) {
			loops_left = options.loop;
		
			/* cant use the loop attribute as firefox doesnt support it*/
			$video.bind('ended', function(){
				
				/* if we have some loops to throw*/
				if (loops_left) {
					/* replay that bad boy*/
					v.play();
                }
				
				/* if not forever*/
				if (loops_left !== true) {
					/* one less loop*/
					loops_left--;
                }
  			});
		}
		
		/* when can play, play*/
		$video.bind('canplay', function(){
			
			if (options.autoplay) {
				/* replay that bad boy*/
				v.play();
            }

		});
		
		
		/* if supports video*/
		if ($.fn.videoBG.supportsVideo()) {

		  	/* supports webm*/
		  	if ($.fn.videoBG.supportType('webm') && options.webm != ""){
		  		
		  		/* play webm*/
		  		$video.attr('src',options.webm);
		  	}
		  	/* supports mp4*/
		  	else {
                if ($.fn.videoBG.supportType('mp4') && options.mp4 != "") {
                    
                    /* play mp4*/
                    $video.attr('src',options.mp4);
                    
                /*	$video.html('<source src="'.options.mp4.'" />');*/
                    
                }
                /* throw ogv at it then*/
                else {
                    
                    /* play ogv*/
                    $video.attr('src',options.ogv);
                }
            }
	  	
	  	}
	  	
	  	
		
		/* image for those that dont support the video	*/
		var $img = $('<img/>');
		$img.attr('src',options.poster)
			.css('position','absolute')
			.css('z-index',options.zIndex)
			.css('top',0)
			.css('left',0)
			.css('min-width','100%')
			.css('min-height','100%');
		
		/* add the image to the video*/
		/* if suuports video*/
		if ($.fn.videoBG.supportsVideo()) {
			/* add the video to the wrapper*/
			$div.html($video);
		}
		
		/* nope - whoa old skool*/
		else {
			
			/* add the image instead*/
			$div.html($img);
		}
		
		/* if text replacement*/
		if (options.textReplacement) {
	
			/* force the heights and widths*/
			$div.css('min-height',1).css('min-width',1);
			$video.css('min-height',1).css('min-width',1);
			$img.css('min-height',1).css('min-width',1);
			
			$div.height(options.height).width(options.width);
			$video.height(options.height).width(options.width);
			$img.height(options.height).width(options.width);	
		}
		
		if ($.fn.videoBG.supportsVideo()) {
/*			v.play();*/
		}
		return $div;
	}
	
	/* check if suuports video*/
	$.fn.videoBG.supportsVideo = function() {
		return (document.createElement('video').canPlayType);
	}
	
	/* check which type is supported*/
	$.fn.videoBG.supportType = function(str) {
		
		/* if not at all supported*/
		if (!$.fn.videoBG.supportsVideo()) {
			return false;
		}
		
		/* create video*/
		var v = document.createElement('video');
		
		/* check which?*/
		switch (str) {
			case 'webm' :
				return (v.canPlayType('video/webm; codecs="vp8, vorbis"'));
				break;
			case 'mp4' :
				return (v.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"'));
				break;
			case 'ogv' :
				return (v.canPlayType('video/ogg; codecs="theora, vorbis"'));
				break;			
		}
		/* nope*/
		return false;	
	}
	
	/* get the overlay wrapper*/
	$.fn.videoBG.wrapper = function() {
		var $wrap = $('<div/>');
		$wrap.addClass('videoBG_wrapper')
			.css('position','absolute')
			.css('top',0)
			.css('left',0);
		return $wrap;
	}
	
	/* these are the defaults*/
	$.fn.videoBG.defaults = {
			mp4:'',
			ogv:'',
			webm:'',
			poster:'',
			autoplay:true,
			loop:true,
			scale:false,
			position:"absolute",
			opacity:1,
			textReplacement:false,
			zIndex:0,
			width:0,
			height:0,
			fullscreen:false,
			imgFallback:true
		}

})( jQuery );



/**
 * Parallax function created by alex on 7/4/14.
 */

(function( $ ){
    var $window = $(window);
    var windowHeight = $window.height();

    $window.resize(function () {
        windowHeight = $window.height();
    });

    $.fn.parallax = function(xpos, speedFactor, outerHeight) {
        var $this = $(this);
        var getHeight;
        var firstTop;
        var paddingTop = 0;
        var isWebkitTransform = (typeof document.body.style['-webkit-transform'] == "undefined" ? false : true);
        if(isWebkitTransform){
            $this.css('position', 'relative');
        }

        /*get the starting position of each element to have parallax applied to it*/

        window.correctFirstTop4Parallax = function(){
            $this.each(function(){
                firstTop = $this.offset().top;
            });
        };

        window.correctFirstTop4Parallax();


        if (outerHeight) {
            getHeight = function(jqo) {
                return jqo.outerHeight(true);
            };
        } else {
            getHeight = function(jqo) {
                return jqo.height();
            };
        }

        /* setup defaults if arguments aren't specified*/
        if (arguments.length < 1 || xpos === null){ xpos = "50%"; }
        if (arguments.length < 2 || speedFactor === null){ speedFactor = 0.1; }
        if (arguments.length < 3 || outerHeight === null){ outerHeight = true; }
        /* function to be called whenever the window is scrolled or resized*/
        function update(){
            var pos = $window.scrollTop();

            $this.each(function(){
                var $element = $(this);
                var top = $element.offset().top;
                var height = getHeight($element);
                var rect = this.getBoundingClientRect();
/*                var backgroundVerticalShift = -Math.abs(Math.round((firstTop - pos) * speedFactor));*/
                /* Check if totally above or totally below viewport*/
                if (top + height < pos || top > pos + windowHeight) {
                    return;
                }
                var backgroundVerticalShift = -1 * Math.round(rect.top * speedFactor);
                if(isWebkitTransform){
                    this.style['-webkit-transform'] = "translateY(" + backgroundVerticalShift + "px)";
                }else{
                    this.style['top'] = backgroundVerticalShift + "px";
                }
            });
        }
        $(window).resize(window.correctFirstTop4Parallax);
        $window.bind('scroll', update).resize(update);
        if(document.readyState !== "complete"){
            window.addEventListener('load', function(){
                update();
            });
        }else{
            update();
        }
    };
})(jQuery);


(function( $ ){
 function t_initZoom(){
   if ( $('[data-zoomable="yes"]').length ) {    
     $('[data-zoomable="yes"]').addClass("t-zoomable");
     $("body").append('<div class="t-zoomer__wrapper">\
       <div class="t-zoomer__container">\
       </div>\
       <div class="t-zoomer__bg"></div>\
       <div class="t-zoomer__close">\
         <div class="t-zoomer__close-line t-zoomer__close-line-first"></div>\
         <div class="t-zoomer__close-line t-zoomer__close-line-second"></div>\
       </div>\
     </div>');
     t_showZoom();
     $(document).keydown(function(e) {
       if (e.keyCode == 27) {
         $('body').removeClass("t-zoomer__show");
         $('body').removeClass("t-zoomer__show_fixed");
       }
     });
     $('.t-zoomer__close, .t-zoomer__bg').click(function(e){  
       $('body').removeClass("t-zoomer__show");
       $('body').removeClass("t-zoomer__show_fixed");
     });
   }
 } 

 function t_showZoom(){
   $('.t-zoomable').click(function(e){
     $("body").addClass("t-zoomer__show");
     $(".t-zoomer__container").html('<div id="t-carousel__zoomed" class="t-carousel slide" data-ride="carousel" data-interval="false">\
       <div class="t-carousel__slides t-carousel__zoomer__slides">\
         <div class="t-carousel__inner t-carousel__zoomer__inner">\
         </div>\
         <a class="left t-carousel__control t-carousel__zoomer__control" href="#t-carousel__zoomed" data-slide="prev">\
           <div class="t-carousel__arrow__wrapper t-carousel__arrow__wrapper_left">\
             <div class="t-carousel__arrow t-carousel__arrow_left t-carousel__arrow_small"></div>\
           </div>\
         </a>\
         <a class="right t-carousel__control t-carousel__zoomer__control" href="#t-carousel__zoomed" data-slide="next">\
           <div class="t-carousel__arrow__wrapper t-carousel__arrow__wrapper_right">\
             <div class="t-carousel__arrow t-carousel__arrow_right t-carousel__arrow_small"></div>\
           </div>\
         </a>\
       </div>\
     </div>');

     var id = $(this).closest(".r").attr("id");
     var images = $("#"+id+"").find(".t-zoomable");
     images.each(function () {
       var images_urls = $(this).attr('data-img-zoom-url').split(',');
       if($(this).is("img")) {
         var imgdescr = $(this).attr('alt');
       } else {
            if ($(this).is("div")) {
                var imgdescr = $(this).attr('title');
            }
       }
       images_urls.forEach(function() {
         if (typeof imgdescr !== typeof undefined && imgdescr !== false) {
           $(".t-carousel__zoomer__inner").append("<div class=\"t-carousel__item t-carousel__zoomer__item item\"><div class=\"t-carousel__zoomer__wrapper\"><img class=\"t-carousel__zoomer__img\" src=\""+images_urls+"\"></div><div class=\"t-zoomer__comments\"><div class=\"t-zoomer__descr t-descr t-descr_xxs\">"+imgdescr+"</div></div></div>");            
         } else {
           $(".t-carousel__zoomer__inner").append("<div class=\"t-carousel__item t-carousel__zoomer__item item\"><div class=\"t-carousel__zoomer__wrapper\"><img class=\"t-carousel__zoomer__img\" src=\""+images_urls+"\"></div><div class=\"t-zoomer__comments\"></div></div>");
         }
       });
     });

     var image_descr = $(".t-carousel__zoomer__item");
     image_descr.each(function () {
       $(this).css("display", "block");
       var height = $(this).find(".t-zoomer__comments").height();
       $(this).css("display", "");
       var image_active = $(this).find(".t-carousel__zoomer__wrapper");
       image_active.css("bottom", height);
     });

	 var target_url = $(this).attr("data-img-zoom-url"),
	   target_img = $(".t-carousel__zoomer__img[src=\""+target_url+"\"]"),
	   target = target_img.closest(".t-carousel__zoomer__item");
	   target.addClass("active");
	
	 var slides_count = $(".t-carousel__zoomer__item").size();
	 if (slides_count > 1) {
		$('body').addClass("t-zoomer__show_fixed"); 
	 } else {
		$(".t-carousel__zoomer__control").css("display", "none");
	 }


     $('.t-carousel__zoomer__img').click(function(e){  
       $('body').removeClass("t-zoomer__show");
       $('body').removeClass("t-zoomer__show_fixed");
     });

     var lastScrollTop = 0;
     $(window).scroll(function(event){
       var st = $(this).scrollTop();
       if (st > lastScrollTop){     
         $('body').removeClass("t-zoomer__show");
       }
       lastScrollTop = st;
     });
   });
 } 

 $(document).ready(function(){
   t_initZoom();
   $('a[href]').each(function(){ 
      if($(this).attr('href').indexOf('http') == 0){
          $(this).addClass('external');
      }
   });
   eval($('.t-btn').attr('href'));
 });

})(jQuery);
