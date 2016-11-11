 
function t113_highlight(recid){
  var url=window.location.href;
  var pathname=window.location.pathname;
  if(url.substr(url.length - 1) == "/"){ url = url.slice(0,-1); }
  if(pathname.substr(pathname.length - 1) == "/"){ pathname = pathname.slice(0,-1); }
  if(pathname.charAt(0) == "/"){ pathname = pathname.slice(1); }
  if(pathname == ""){ pathname = "/"; }
  $(".t113__list_item a[href='"+url+"']").addClass("t-active");
  $(".t113__list_item a[href='"+url+"/']").addClass("t-active");
  $(".t113__list_item a[href='"+pathname+"']").addClass("t-active");
  $(".t113__list_item a[href='/"+pathname+"']").addClass("t-active");
  $(".t113__list_item a[href='"+pathname+"/']").addClass("t-active");
  $(".t113__list_item a[href='/"+pathname+"/']").addClass("t-active");
}

function t113_showMenu(recid,pageid){
  var $flagmenudo = "2ok";
  $(window).bind('scroll', function() {
    if ($(window).scrollTop() > 200) {
      if($flagmenudo != "1ok"){$flagmenudo="1";}
    }
    else {
      if($flagmenudo!="2ok"){$flagmenudo="2";}
    }

    if ($flagmenudo=="1") {
      $('.t113').addClass('t113__fixed');
      $('.t113').css('display','none');
      $('.t113').fadeIn( "slow" );

	  $('#rec'+recid).find('.t113__space').hide();
      $flagmenudo="1ok";
    }
    if ($flagmenudo=="2") {
      $('.t113').removeClass('t113__fixed');
	  $('#rec'+recid).find('.t113__space').show();
      $flagmenudo="2ok";
    }
  });

  var current_path = window.location.pathname.split('/').pop();
  if(current_path=="page"+pageid+".html"){
    $("#t113linktopage"+pageid).css("opacity",".7");
  }
}

function t113_setWidth(recid){
  var t113timer;
  var el=$('#rec'+recid);
  $(window).resize(function() {
    if(t113timer) {
        window.clearTimeout(t113timer);
    }
    t113timer = window.setTimeout(function() {
        if($(window).width()>640){
          var w1= el.find("div[data-hook-left]").width()+20+50;
          el.find(".t113__list").css("padding-right",w1+"px");
        }else{
          el.find(".t113__list").css("padding-right",10+"px");  
        }
    }, 100);
  });
  $(window).resize();
} 
function t117_appendMap(key) {
    if (typeof google === 'object' && typeof google.maps === 'object') {
        t117_handleApiReady();
    } else {
    	if(window.googleapiiscalled!==true){
	        var script = document.createElement("script");
	        script.type = "text/javascript";
	        script.src = "//maps.google.com/maps/api/js?key="+jQuery.trim(key)+"&callback=t117_handleApiReady";
	        document.body.appendChild(script);
	        window.googleapiiscalled=true;
	    }
    }
}

function t117_handleApiReady(){
    $('.t117_map').each(function(index,Element) {
		var el=$(Element);
		window.isDragMap = $isMobile ? false : true;
            
		if(el.attr('data-map-style')!=''){var mapstyle=eval(el.attr('data-map-style'));}else{var mapstyle='[]';}
	    var myLatlng = new google.maps.LatLng(parseFloat(el.attr('data-map-x')), parseFloat(el.attr('data-map-y')));
	    var myOptions = {
            zoom: parseInt(el.attr('data-map-zoom')),
			center:myLatlng,
			scrollwheel: false,
			draggable: window.isDragMap,          
			zoomControl: true,
            styles: mapstyle                                                     	
	    };
	    
	    var map = new google.maps.Map(Element, myOptions);
	
	    var marker = new google.maps.Marker({
	        position: myLatlng,
	        map: map,
	        title:el.attr('data-map-title')
	    });
	    
		// Resizing the map for responsive design
		google.maps.event.addDomListener(window, "resize", function() {
			var center = map.getCenter();
			google.maps.event.trigger(map, "resize");
			map.setCenter(center); 
		});
      
        // DBL Click - activate on mobile      
        if ($isMobile) {
          google.maps.event.addDomListener(window, "dblclick", function() {
            if (window.isDragMap) {
	            window.isDragMap = false;
            } else {
	            window.isDragMap = true;
            }
            map.setOptions({draggable: window.isDragMap});
          }); 
        }
      
    });	
} 
function t142_checkSize(recid){
  var el=$("#rec"+recid).find(".t142__submit");
  if(el.length){
    var btnheight = el.height();
    var textheight = el[0].scrollHeight;
    if (btnheight < textheight) {
      var btntext = el.text();
      el.addClass("t142__submit-overflowed");
      el.html("<span class=\"t142__text\">" + btntext + "</span>");
    }
  }
} 
function t190_scrollToTop(){
    $('html, body').animate({scrollTop: 0}, 700);								
}	  
 
function t204_clickBurger(recid){
  var el=$("#rec"+recid);

  el.find('#t204__burger').click(function(e){
      t204_showMenu(recid);
  }); 

  el.find('#t204__closelayer').click(function(e){
      t204_hideMenu(recid);
  }); 
}

function t204_showMenu(recid) {  
  var el=$("#rec"+recid); 
  el.find("#t204__menu").finish();              
  el.find('#t204__menu').css("visibility","visible");
  el.find('#t204__menu').css("opacity","0");
  el.find('#t204__menu').css("right","-300px");
  el.find('#t204__menu').animate({"opacity": "1","right": "0px"}, 300);
  el.find('#t204__closelayer').css("visibility","visible");   
}

function t204_hideMenu(recid) {
  var el=$("#rec"+recid);
  el.find("#t204__menu").finish();		          
  el.find('#t204__menu').css("visibility","hidden");
  el.find('#t204__closelayer').css("visibility","hidden");	
  el.find(".t204__item a").each(function() {
    $(this).on('click', function(e) {
      t204_hideMenu(recid);
    });
  });
} 
function t219_showcomments(recid){
  $("#rec"+recid+" .t-btn").css("display","none");
  $("#rec"+recid+" .t219__blocktitle").css("display","block");

  var disqus_shortname = $("#rec"+recid+" .t219__disqusthread").attr('data-disqus-shortname');
console.log(disqus_shortname);
  if(disqus_shortname!==""){
	  var disqus_identifier = disqus_shortname;    
  }else{
	  var disqus_identifier = "t_page_" + $("#rec"+recid+" .t219__disqusthread").attr("data-page-id");
  }

  var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
  dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
  (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
} 
function t389_scrollToTop(){
  $('html, body').animate({scrollTop: 0}, 700);								
}	 