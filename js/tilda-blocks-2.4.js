 
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
if (! window.yashare2scriptLoaded){
    var scriptService = document.createElement('script');
    scriptService .src = "https://yastatic.net/share2/share.js";
    scriptService .type = "text/javascript";
    scriptService .charset = "UTF-8";
    document.documentElement.appendChild(scriptService);

    window.yashare2scriptLoaded = true;
}
 
function t142_checkSize(recid){
  var el=$("#rec"+recid).find(".t142__submit");
  if(el.length){
    var btnheight = el.height() + 5;
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

function t396_init(data,recid){var res=t396_detectResolution();t396_initTNobj();t396_switchResolution(res);t396_updateTNobj();t396_artboard_build(data,recid);$( window ).resize(function () {tn_console('>>>> t396: Window on Resize event >>>>');t396_waitForFinalEvent(function(){var ww=$(window).width();var res=t396_detectResolution();var ab=$('#rec'+recid).find('.t396__artboard');t396_switchResolution(res);t396_updateTNobj();t396_ab__renderView(ab);t396_allelems__renderView(ab);}, 500, 'resizeruniqueid'+recid);});$( window ).load(function() {var ab=$('#rec'+recid).find('.t396__artboard');t396_allelems__renderView(ab);});}function t396_detectResolution(){var ww=$(window).width();var res;res=1200;if(ww<1200){res=960;}if(ww<960){res=640;}if(ww<640){res=480;}if(ww<480){res=320;}return(res);}function t396_initTNobj(){tn_console('func: initTNobj');window.tn={};window.tn.canvas_min_sizes = ["320","480","640","960","1200"];window.tn.canvas_max_sizes = ["480","640","960","1200",""];window.tn.ab_fields = ["height","width","bgcolor","bgimg","bgattachment","bgposition","filteropacity","filtercolor","filteropacity2","filtercolor2","height_vh","valign"];}function t396_updateTNobj(){tn_console('func: updateTNobj');window.tn.window_width = parseInt($(window).width());window.tn.window_height = parseInt($(window).height());if(window.tn.curResolution==1200){window.tn.canvas_min_width = 1200;window.tn.canvas_max_width = window.tn.window_width;}if(window.tn.curResolution==960){window.tn.canvas_min_width = 960;window.tn.canvas_max_width = 1200;}if(window.tn.curResolution==640){window.tn.canvas_min_width = 640;window.tn.canvas_max_width = 960;}if(window.tn.curResolution==480){window.tn.canvas_min_width = 480;window.tn.canvas_max_width = 640;}if(window.tn.curResolution==320){window.tn.canvas_min_width = 320;window.tn.canvas_max_width = 480;}window.tn.grid_width = window.tn.canvas_min_width;window.tn.grid_offset_left = parseFloat( (window.tn.window_width-window.tn.grid_width)/2 );}var t396_waitForFinalEvent = (function () {var timers = {};return function (callback, ms, uniqueId) {if (!uniqueId) {uniqueId = "Don't call this twice without a uniqueId";}if (timers[uniqueId]) {clearTimeout (timers[uniqueId]);}timers[uniqueId] = setTimeout(callback, ms);};})();function t396_switchResolution(res,resmax){tn_console('func: switchResolution');if(typeof resmax=='undefined'){if(res==1200)resmax='';if(res==960)resmax=1200;if(res==640)resmax=960;if(res==480)resmax=640;if(res==320)resmax=480;}window.tn.curResolution=res;window.tn.curResolution_max=resmax;}function t396_artboard_build(data,recid){tn_console('func: t396_artboard_build. Recid:'+recid);tn_console(data);/* set style to artboard */var ab=$('#rec'+recid).find('.t396__artboard');var ab_fields=window.tn.ab_fields;ab_fields.forEach(function(field, i, arr) {var value=data['ab_'+field];/* default values of undefined fields */if( typeof value=='undefined' ){value='';if(field=='filteropacity')value='0.5';if(field=='filteropacity2')value='0.5';if(field=='bgattachment')value='scroll';if(field=='bgposition')value='center center';if(field=='valign')value='center';}t396_ab__setFieldValue(ab,field,value,'1200');/* set other resolutions */var r;r=data['ab_'+field+'-res-960'];if(typeof r!=='undefined')t396_ab__setFieldValue(ab,field,r,'960');r=data['ab_'+field+'-res-640'];if(typeof r!=='undefined')t396_ab__setFieldValue(ab,field,r,'640');r=data['ab_'+field+'-res-480'];if(typeof r!=='undefined')t396_ab__setFieldValue(ab,field,r,'480');r=data['ab_'+field+'-res-320'];if(typeof r!=='undefined')t396_ab__setFieldValue(ab,field,r,'320');});t396_ab__renderView(ab);/* create elements */for(var key in data){var item=data[key];if(item.elem_type=='text'){t396_addText(ab,item);}if(item.elem_type=='image'){t396_addImage(ab,item);}if(item.elem_type=='shape'){t396_addShape(ab,item);}if(item.elem_type=='button'){t396_addButton(ab,item);}}}function t396_ab__renderView(ab){var fields = window.tn.ab_fields;fields.forEach(function(field, i, arr) {t396_ab__renderViewOneField(ab,field);});var ab_min_height=t396_ab__getFieldValue(ab,'height');var ab_max_height=t396_ab__getHeight(ab);var offset_top=0;if(ab_min_height==ab_max_height){offset_top=0;}else{var ab_valign=t396_ab__getFieldValue(ab,'valign');if(ab_valign=='top'){offset_top=0;}else if(ab_valign=='center'){offset_top=parseFloat( (ab_max_height-ab_min_height)/2 ).toFixed(1);}else if(ab_valign=='bottom'){offset_top=parseFloat( (ab_max_height-ab_min_height) ).toFixed(1);}else if(ab_valign=='stretch'){offset_top=0;ab_min_height=ab_max_height;}else{offset_top=0;}}ab.attr('data-artboard-proxy-min-offset-top',offset_top);ab.attr('data-artboard-proxy-min-height',ab_min_height);ab.attr('data-artboard-proxy-max-height',ab_max_height);}function t396_addText(ab,data){tn_console('func: addText');if( typeof data.rotate=='undefined' ) data.rotate='0';if( typeof data.opacity=='undefined' ) data.opacity='1';if( typeof data.container=='undefined' ) data.container='grid';if( typeof data.axisy=='undefined' ) data.axisy='top';if( typeof data.axisx=='undefined' ) data.axisx='left';if( typeof data.link=='undefined' ) data.link='';if( typeof data.linktarget=='undefined' ) data.linktarget='';if( typeof data.borderwidth=='undefined' ) data.borderwidth='';if( typeof data.borderstyle=='undefined' ) data.borderstyle='';if( typeof data.bordercolor=='undefined' ) data.bordercolor='';if( typeof data.borderradius=='undefined' ) data.borderradius='';if( typeof data.animtriggerhook=='undefined' ) data.animtriggerhook='';if( typeof data.animduration=='undefined' ) data.animduration='';if( typeof data.animoffset=='undefined' ) data.animoffset='';if( typeof data.leftunits=='undefined' ) data.leftunits='';if( typeof data.topunits=='undefined' ) data.topunits='';if( typeof data.widthunits=='undefined' ) data.widthunits='';if( typeof data.tag=='undefined' ) data.tag='div';if( typeof data.align=='undefined' ) data.align='left';if( typeof data.letterspacing=='undefined' ) data.letterspacing='0';if( typeof data.text=='undefined' ) data.text='';var elem_id=data.elem_id;var elem_type=data.elem_type;/* add wrapper */ab.append("<div class='t396__elem tn-elem' data-elem-id='"+elem_id+"' data-elem-type='"+elem_type+"'></div>");var el=ab.find("[data-elem-id="+elem_id+"]");if(data.link!=''){el.html("<a class='tn-atom'></a>");}else if(data.tag=='h1'){el.html("<h1 class='tn-atom'></h1>");}else if(data.tag=='h2'){el.html("<h2 class='tn-atom'></h2>");}else if(data.tag=='h3'){el.html("<h3 class='tn-atom'></h3>");}else{el.html("<div class='tn-atom' field='tn_text_"+data.elem_id+"'></div>");}/* ekranirovanie */if(data.link!=''){var link=data.link; link.t396_replaceAll('"', '&quot;' ); data.link=link;}else{var link='';}el.find(".tn-atom").html(data['text']);/* add data atributes */var fields_str='top,left,align,fontsize,width,color,fontfamily,lineheight,fontweight,letterspacing,opacity,rotate,zindex,container,axisx,axisy,tag,link,linktarget,animtriggerhook,animduration,animoffset,animparallax,widthunits,leftunits,topunits';var fields=fields_str.split(',');el.attr('data-fields',fields_str);/* set field values */fields.forEach(function(field, i, arr) {var value=data[field];t396_elem__setFieldValue(el,field,value,'','','1200');/* set other resolutions */var r;r=data[field+'-res-960'];if(typeof r!=='undefined')t396_elem__setFieldValue(el,field,r,'','','960');r=data[field+'-res-640'];if(typeof r!=='undefined')t396_elem__setFieldValue(el,field,r,'','','640');r=data[field+'-res-480'];if(typeof r!=='undefined')t396_elem__setFieldValue(el,field,r,'','','480');r=data[field+'-res-320'];if(typeof r!=='undefined')t396_elem__setFieldValue(el,field,r,'','','320');});/* render elem view */t396_elem__renderView(el);}function t396_addImage(ab,data){tn_console('func: addImage');if( typeof data.rotate=='undefined' ) data.rotate='0';if( typeof data.opacity=='undefined' ) data.opacity='1';if( typeof data.container=='undefined' ) data.container='grid';if( typeof data.axisy=='undefined' ) data.axisy='top';if( typeof data.axisx=='undefined' ) data.axisx='left';if( typeof data.link=='undefined' ) data.link='';if( typeof data.linktarget=='undefined' ) data.linktarget='';if( typeof data.borderwidth=='undefined' ) data.borderwidth='';if( typeof data.borderstyle=='undefined' ) data.borderstyle='';if( typeof data.bordercolor=='undefined' ) data.bordercolor='';if( typeof data.borderradius=='undefined' ) data.borderradius='';if( typeof data.animtriggerhook=='undefined' ) data.animtriggerhook='';if( typeof data.animduration=='undefined' ) data.animduration='';if( typeof data.animoffset=='undefined' ) data.animoffset='';if( typeof data.lock=='undefined' ) data.lock='';if( typeof data.leftunits=='undefined' ) data.leftunits='';if( typeof data.topunits=='undefined' ) data.topunits='';if( typeof data.widthunits=='undefined' ) data.widthunits='';if( typeof data.alt=='undefined' ) data.alt='';if( typeof data.filewidth=='undefined' ) data.filewidth='';if( typeof data.fileheight=='undefined' ) data.fileheight='';if( typeof data.zoomable=='undefined' ) data.zoomable='';var elem_id=data.elem_id;var elem_type=data.elem_type;/* add wrapper */ab.append("<div class='t396__elem tn-elem' data-elem-id='"+elem_id+"' data-elem-type='"+elem_type+"'></div>");var el=ab.find("[data-elem-id="+elem_id+"]");/* ekranirovanie */if(data.alt!=''){var alt=data.alt; alt.t396_replaceAll('"', '&quot;' ); data.alt=alt;}else{var alt='';}if(data.link!=''){var link=data.link; link.t396_replaceAll('"', '&quot;' ); data.link=link;}else{var link='';}/* add element html and fish content */if(data.link!=''){el.html("<a class='tn-atom'></a>");}else{el.html("<div class='tn-atom'></div>");}el.find(".tn-atom").html("<img src='' class='tn-atom__img' imgfield='tn_img_"+elem_id+"'>");/* add data atributes */var fields_str='img,width,filewidth,fileheight,top,left,opacity,rotate,zindex,container,axisx,axisy,link,linktarget,borderwidth,borderradius,bordercolor,borderstyle,shadowcolor,shadowopacity,shadowblur,shadowspread,shadowx,shadowy,alt,animtriggerhook,animduration,animoffset,animparallax,widthunits,leftunits,topunits,zoomable';var fields=fields_str.split(',');el.attr('data-fields',fields_str);/* set field values */fields.forEach(function(field, i, arr) {var value=data[field];t396_elem__setFieldValue(el,field,value,'','','1200');/* set other resolutions */var r;r=data[field+'-res-960'];if(typeof r!=='undefined')t396_elem__setFieldValue(el,field,r,'','','960');r=data[field+'-res-640'];if(typeof r!=='undefined')t396_elem__setFieldValue(el,field,r,'','','640');r=data[field+'-res-480'];if(typeof r!=='undefined')t396_elem__setFieldValue(el,field,r,'','','480');r=data[field+'-res-320'];if(typeof r!=='undefined')t396_elem__setFieldValue(el,field,r,'','','320');});/* render elem view */t396_elem__renderView(el);el.find('img').one("load", function() {t396_elem__renderViewOneField(el,'top');}).each(function() {if(this.complete) $(this).load();}); el.find('img').on('tuwidget_done', function(e, file) { t396_elem__renderViewOneField(el,'top');});}function t396_addShape(ab,data){tn_console('func: addShape');if( typeof data.rotate=='undefined' ) data.rotate='0';if( typeof data.opacity=='undefined' ) data.opacity='1';if( typeof data.container=='undefined' ) data.container='grid';if( typeof data.axisy=='undefined' ) data.axisy='top';if( typeof data.axisx=='undefined' ) data.axisx='left';if( typeof data.link=='undefined' ) data.link='';if( typeof data.linktarget=='undefined' ) data.linktarget='';if( typeof data.borderwidth=='undefined' ) data.borderwidth='';if( typeof data.borderstyle=='undefined' ) data.borderstyle='';if( typeof data.bordercolor=='undefined' ) data.bordercolor='';if( typeof data.borderradius=='undefined' ) data.borderradius='';if( typeof data.animtriggerhook=='undefined' ) data.animtriggerhook='';if( typeof data.animduration=='undefined' ) data.animduration='';if( typeof data.animoffset=='undefined' ) data.animoffset='';if( typeof data.lock=='undefined' ) data.lock='';if( typeof data.leftunits=='undefined' ) data.leftunits='';if( typeof data.topunits=='undefined' ) data.topunits='';if( typeof data.bgimg=='undefined' ) data.bgimg='';if( typeof data.bgattachment=='undefined' )data.bgattachment='static';if( typeof data.bgposition=='undefined' )data.bgposition='center center';if( typeof data.heightunits=='undefined' ) data.heightunits='';if( typeof data.widthunits=='undefined' ) data.widthunits='';if( typeof data.bgcolor=='undefined' ) data.bgcolor='';if( typeof data.zoomable=='undefined' ) data.zoomable='';var elem_id=data.elem_id;var elem_type=data.elem_type;/* add wrapper */ab.append("<div class='t396__elem tn-elem' data-elem-id='"+elem_id+"' data-elem-type='"+elem_type+"'></div>");var el=ab.find("[data-elem-id="+elem_id+"]");/* add element html and fish content */if(data.link!=''){el.html("<a class='tn-atom'></a>");}else{el.html("<div class='tn-atom'></div>");}/* ekranirovanie */if(data.link!=''){var link=data.link; link.t396_replaceAll('"', '&quot;' ); data.link=link;}else{var link='';}/* add data atributes */var fields_str='width,height,bgcolor,bgimg,bgattachment,bgposition,top,left,opacity,';fields_str+='rotate,zindex,container,axisx,axisy,link,linktarget,borderwidth,borderradius,bordercolor,borderstyle,shadowcolor,shadowopacity,shadowblur,shadowspread,shadowx,shadowy,animtriggerhook,animduration,animoffset,animparallax,widthunits,heightunits,leftunits,topunits,zoomable';var fields=fields_str.split(',');el.attr('data-fields',fields_str);/* set field values */fields.forEach(function(field, i, arr) {var value=data[field];t396_elem__setFieldValue(el,field,value,'','','1200');/* set other resolutions */var r;r=data[field+'-res-960'];if(typeof r!=='undefined')t396_elem__setFieldValue(el,field,r,'','','960');r=data[field+'-res-640'];if(typeof r!=='undefined')t396_elem__setFieldValue(el,field,r,'','','640');r=data[field+'-res-480'];if(typeof r!=='undefined')t396_elem__setFieldValue(el,field,r,'','','480');r=data[field+'-res-320'];if(typeof r!=='undefined')t396_elem__setFieldValue(el,field,r,'','','320');});/* render elem view */t396_elem__renderView(el);}function t396_addButton(ab,data){tn_console('func: addButton');if( typeof data.rotate=='undefined' ) data.rotate='0';if( typeof data.opacity=='undefined' ) data.opacity='1';if( typeof data.container=='undefined' ) data.container='grid';if( typeof data.axisy=='undefined' ) data.axisy='top';if( typeof data.axisx=='undefined' ) data.axisx='left';if( typeof data.link=='undefined' ) data.link='';if( typeof data.linktarget=='undefined' ) data.linktarget='';if( typeof data.borderwidth=='undefined' ) data.borderwidth='';if( typeof data.borderstyle=='undefined' ) data.borderstyle='';if( typeof data.bordercolor=='undefined' ) data.bordercolor='';if( typeof data.borderradius=='undefined' ) data.borderradius='';if( typeof data.animtriggerhook=='undefined' ) data.animtriggerhook='';if( typeof data.animduration=='undefined' ) data.animduration='';if( typeof data.animoffset=='undefined' ) data.animoffset='';if( typeof data.lock=='undefined' ) data.lock='';if( typeof data.leftunits=='undefined' ) data.leftunits='';if( typeof data.topunits=='undefined' ) data.topunits='';if( typeof data.topunits=='undefined' ) data.topunits='';if( typeof data.letterspacing=='undefined' ) data.letterspacing='0';if( typeof data.align=='undefined' ) data.align='left';if( typeof data.colorhover=='undefined' ) data.colorhover='';if( typeof data.bordercolorhover=='undefined' ) data.bordercolorhover='';if( typeof data.bgcolorhover=='undefined' ) data.bgcolorhover='';if( typeof data.speedhover=='undefined' ) data.speedhover='';if( typeof data.color=='undefined' ) data.color='';if( typeof data.bgcolor=='undefined' ) data.bgcolor='';if( typeof data.caption=='undefined' ) data.caption='';var elem_id=data.elem_id;var elem_type=data.elem_type;/* add wrapper */ab.append("<div class='t396__elem tn-elem' id='"+elem_id+"' data-elem-id='"+elem_id+"' data-elem-type='"+elem_type+"'></div>");var el=ab.find("[data-elem-id="+elem_id+"]");/* add element html and fish content */if(data.link!=''){el.html("<a class='tn-atom'></a>");}else{el.html("<div class='tn-atom'></div>");}/* ekranirovanie */if(data.link!=''){var link=data.link; link.t396_replaceAll('"', '&quot;' ); data.link=link;}else{var link='';}if(data.caption!=''){var caption=data.caption; caption.t396_replaceAll('"', '&quot;' ); data.caption=caption;}else{var caption='';}el.find(".tn-atom").html("" + data.caption + "");/* add data atributes */var fields_str='top,left,align,fontsize,width,height,color,fontfamily,lineheight,fontweight,letterspacing,bgcolor,opacity,rotate,zindex,container,axisx,axisy,caption,link,linktarget,borderwidth,borderradius,bordercolor,borderstyle,shadowcolor,shadowopacity,shadowblur,shadowspread,shadowx,shadowy,animtriggerhook,animduration,animoffset,animparallax,bgcolorhover,bordercolorhover,colorhover,speedhover,leftunits,topunits';var fields=fields_str.split(',');el.attr('data-fields',fields_str);/* set field values */fields.forEach(function(field, i, arr) {var value=data[field];t396_elem__setFieldValue(el,field,value);/* set other resolutions */var r;r=data[field+'-res-960'];if(typeof r!=='undefined')t396_elem__setFieldValue(el,field,r,'','','960');r=data[field+'-res-640'];if(typeof r!=='undefined')t396_elem__setFieldValue(el,field,r,'','','640');r=data[field+'-res-480'];if(typeof r!=='undefined')t396_elem__setFieldValue(el,field,r,'','','480');r=data[field+'-res-320'];if(typeof r!=='undefined')t396_elem__setFieldValue(el,field,r,'','','320');});/* render elem view */t396_elem__renderView(el);return(el);}function t396_elem__setFieldValue(el,prop,val,flag_render,flag_updateui,res){if(res=='')res=window.tn.curResolution;if(res<1200 && prop!='zindex'){el.attr('data-field-'+prop+'-res-'+res+'-value',val);}else{el.attr('data-field-'+prop+'-value',val);}if(flag_render=='render')elem__renderViewOneField(el,prop);if(flag_updateui=='updateui')panelSettings__updateUi(el,prop,val);}function t396_elem__getFieldValue(el,prop){var res=window.tn.curResolution;var r;if(res<1200){if(res==960){r=el.attr('data-field-'+prop+'-res-960-value');if(typeof r=='undefined'){r=el.attr('data-field-'+prop+'-value');}}if(res==640){r=el.attr('data-field-'+prop+'-res-640-value');if(typeof r=='undefined'){r=el.attr('data-field-'+prop+'-res-960-value');if(typeof r=='undefined'){r=el.attr('data-field-'+prop+'-value');}}}if(res==480){r=el.attr('data-field-'+prop+'-res-480-value');if(typeof r=='undefined'){r=el.attr('data-field-'+prop+'-res-640-value');if(typeof r=='undefined'){r=el.attr('data-field-'+prop+'-res-960-value');if(typeof r=='undefined'){r=el.attr('data-field-'+prop+'-value');}}}}if(res==320){r=el.attr('data-field-'+prop+'-res-320-value');if(typeof r=='undefined'){r=el.attr('data-field-'+prop+'-res-480-value');if(typeof r=='undefined'){r=el.attr('data-field-'+prop+'-res-640-value');if(typeof r=='undefined'){r=el.attr('data-field-'+prop+'-res-960-value');if(typeof r=='undefined'){r=el.attr('data-field-'+prop+'-value');}}}}}}else{r=el.attr('data-field-'+prop+'-value');}return(r);}function t396_elem__renderView(el){tn_console('func: elem__renderView');var fields=el.attr('data-fields');if(! fields) {return false;}fields = fields.split(',');/* set to element value of every fieldvia css */fields.forEach(function(field, i, arr) {t396_elem__renderViewOneField(el,field);});}function t396_elem__renderViewOneField(el,field){var value=t396_elem__getFieldValue(el,field);if(field=='left'){value = t396_elem__convertPosition__Local__toAbsolute(el,field,value);el.css('left',parseFloat(value).toFixed(1)+'px');}if(field=='top'){value = t396_elem__convertPosition__Local__toAbsolute(el,field,value);el.css('top',parseFloat(value).toFixed(1)+'px');}if(field=='width'){value = t396_elem__getWidth(el,value);el.css('width',parseFloat(value).toFixed(1)+'px');}if(field=='height'){value=t396_elem__getHeight(el,value);el.css('height', parseFloat(value).toFixed(1)+'px');}if(field=='color'){el.css('color',value);el.find('.tn-atom').css('color',value);}if(field=='align')el.css('text-align',value);if(field=='fontfamily')el.find('.tn-atom').css('font-family',value);if(field=='fontsize')el.find('.tn-atom').css('font-size',parseInt(value)+'px');if(field=='lineheight')el.find('.tn-atom').css('line-height',parseFloat(value));if(field=='fontweight')el.find('.tn-atom').css('font-weight',parseInt(value));if(field=='letterspacing')el.find('.tn-atom').css('letter-spacing',parseFloat(value)+'px');if(field=='zindex')el.css('z-index',parseInt(value));if(field=='bgcolor')el.find('.tn-atom').css('background-color',value);if(field=='bgattachment'){var res=window.tn.curResolution;if(res<=960)value='scroll';el.find('.tn-atom').css('background-attachment',value);}if(field=='bgposition')el.find('.tn-atom').css('background-position',value);if(field=='borderwidth')el.find('.tn-atom').css('border-width',parseInt(value)+'px');if(field=='borderradius'){el.find('.tn-atom__img').css('border-radius',parseInt(value)+'px');el.find('.tn-atom').css('border-radius',parseInt(value)+'px');}if(field=='bordercolor'){if(value=='')value='transparent';el.find('.tn-atom').css('border-color',value);}if(field=='borderstyle'){if(value=='')value='solid';el.find('.tn-atom').css('border-style',value);}if(field=='container'){t396_elem__renderViewOneField(el,'left');t396_elem__renderViewOneField(el,'top');}if(field=='opacity'){el.find('.tn-atom').css('opacity',parseFloat(value).toFixed(2));}if(field=='rotate'){var e=el.find('.tn-atom');e.css({ 'WebkitTransform': 'rotate(' + parseInt(value) + 'deg)'});e.css({ '-moz-transform': 'rotate(' + parseInt(value) + 'deg)'});}if(field=='img'){if(window.lazy=='y'){el.find('.tn-atom__img').addClass('t-img');el.find('.tn-atom__img').attr('data-original',value);var imgempty=tn_tu_empty(value);var imgcur=el.find('.tn-atom__img').attr('src');if(imgcur==''){el.find('.tn-atom__img').attr('src',imgempty);}}else{el.find('.tn-atom__img').attr('src',value);}}if(field=='bgimg'){if(typeof value=='undefined')value='';if(window.lazy=='y'){el.find('.tn-atom').addClass('t-bgimg');el.find('.tn-atom').attr('data-original',value); }else{el.find('.tn-atom').css('background-image','url(' + value + ')');}el.find('.tn-atom').css('background-size','cover');el.find('.tn-atom').css('background-repeat','no-repeat');}if(field=='alt'){el.find('.tn-atom__img').attr('alt',value);}if(field=='zoomable'){if(value=='y'){el.find('.tn-atom').attr('data-zoomable',"yes");if(el.attr('data-elem-type')=='shape'){var imgsrc=t396_elem__getFieldValue(el,'bgimg');}else{var imgsrc=t396_elem__getFieldValue(el,'img');}if(imgsrc!=''){el.find('.tn-atom').attr('data-img-zoom-url',imgsrc);}}}if(field=='link'){el.find('.tn-atom').attr('href',value);}if(field=='linktarget'){el.find('.tn-atom').attr('target',value);}if(field=='shadowcolor' || field=='shadowopacity' || field=='shadowx' || field=='shadowy' || field=='shadowblur' || field=='shadowspread'){var s_c=t396_elem__getFieldValue(el,'shadowcolor');var s_o=parseFloat(t396_elem__getFieldValue(el,'shadowopacity'));var s_x=parseInt(t396_elem__getFieldValue(el,'shadowx'));var s_y=parseInt(t396_elem__getFieldValue(el,'shadowy'));var s_b=parseInt(t396_elem__getFieldValue(el,'shadowblur'));var s_s=parseInt(t396_elem__getFieldValue(el,'shadowspread'));if(isNaN(s_o))s_o=1;if(isNaN(s_x))s_x=0;if(isNaN(s_y))s_y=0;if(isNaN(s_b))s_b=0;if(isNaN(s_s))s_s=0;if(s_o!=1 && typeof s_c!='undefined' && s_c!=''){var s_rgb=t396_hex2rgb(s_c);s_c="rgba("+s_rgb[0]+","+s_rgb[1]+","+s_rgb[2]+","+s_o+")";}if(typeof s_c=='undefined' || s_c==''){el.find('.tn-atom').css('box-shadow', 'none');}else{el.find('.tn-atom').css('box-shadow', ''+s_x+'px '+s_y+'px '+s_b+'px '+s_s+'px '+s_c+'');}}if(field=='caption'){el.find('.tn-atom').html(value);}if(field=='bgcolorhover'){el.hover(function() {if(value=='')value=t396_elem__getFieldValue(el,'bgcolor');if(value=='' || typeof value=='undefined')value='transparent';el.find('.tn-atom').css('background-color',value);}, function() {var bgpre=t396_elem__getFieldValue(el,'bgcolor');el.find('.tn-atom').css('background-color',bgpre);});}if(field=='bordercolorhover'){el.hover(function() {if(value=='')value=t396_elem__getFieldValue(el,'bordercolor');if(value=='' || typeof value=='undefined')value='transparent';el.find('.tn-atom').css('border-color',value);}, function() {var colorpre=t396_elem__getFieldValue(el,'bordercolor');if(colorpre=='')colorpre='transparent';el.find('.tn-atom').css('border-color',colorpre);});}if(field=='colorhover'){el.hover(function() {if(value=='')value=t396_elem__getFieldValue(el,'color');if(value=='' || typeof value=='undefined')value='transparent';el.find('.tn-atom').css('color',value);}, function() {var colorpre=t396_elem__getFieldValue(el,'color');if(colorpre=='')colorpre='transparent';el.find('.tn-atom').css('color',colorpre);});}if(field=='speedhover'){if(value>-1){el.find('.tn-atom').css({transition : 'background-color '+parseFloat(value)+'s ease-in-out, color '+parseFloat(value)+'s ease-in-out, border-color '+parseFloat(value)+'s ease-in-out'});}}if(field=='width' || field=='height' || field=='fontsize' || field=='fontfamily' || field=='letterspacing' || field=='fontweight' || field=='img'){t396_elem__renderViewOneField(el,'left');t396_elem__renderViewOneField(el,'top');}}function t396_elem__convertPosition__Local__toAbsolute(el,field,value){value = parseInt(value);if(field=='left'){var el_container,offset_left,el_container_width,el_width;var container=t396_elem__getFieldValue(el,'container');if(container=='grid'){el_container = 'grid';offset_left = window.tn.grid_offset_left;el_container_width = window.tn.grid_width;}else{el_container = 'window';offset_left = 0;el_container_width = window.tn.window_width;}/* fluid or not*/var el_leftunits=t396_elem__getFieldValue(el,'leftunits');if(el_leftunits=='%'){value = tn_roundFloat( el_container_width * value/100 );}value = offset_left + value;var el_axisx=t396_elem__getFieldValue(el,'axisx');if(el_axisx=='center'){el_width = t396_elem__getWidth(el);value = el_container_width/2 - el_width/2 + value;}if(el_axisx=='right'){el_width = t396_elem__getWidth(el);value = el_container_width - el_width + value;}}if(field=='top'){var ab=el.parent();var el_container,offset_top,el_container_height,el_height;var container=t396_elem__getFieldValue(el,'container');if(container=='grid'){el_container = 'grid';offset_top = parseFloat( ab.attr('data-artboard-proxy-min-offset-top') );el_container_height = parseFloat( ab.attr('data-artboard-proxy-min-height') );}else{el_container = 'window';offset_top = 0;el_container_height = parseFloat( ab.attr('data-artboard-proxy-max-height') );}/* fluid or not*/var el_topunits=t396_elem__getFieldValue(el,'topunits');if(el_topunits=='%'){value = ( el_container_height * (value/100) );}value = offset_top + value;var el_axisy=t396_elem__getFieldValue(el,'axisy');if(el_axisy=='center'){/* var el_height=parseFloat(el.innerHeight()); */el_height=t396_elem__getHeight(el);value = el_container_height/2 - el_height/2 + value;}if(el_axisy=='bottom'){/* var el_height=parseFloat(el.innerHeight()); */el_height=t396_elem__getHeight(el);value = el_container_height - el_height + value;} }return(value);}function t396_ab__setFieldValue(ab,prop,val,res){/* tn_console('func: ab__setFieldValue '+prop+'='+val);*/if(res=='')res=window.tn.curResolution;if(res<1200){ab.attr('data-artboard-'+prop+'-res-'+res,val);}else{ab.attr('data-artboard-'+prop,val);}}function t396_ab__getFieldValue(ab,prop){var res=window.tn.curResolution;var r;if(res<1200){if(res==960){r=ab.attr('data-artboard-'+prop+'-res-960');if(typeof r=='undefined'){r=ab.attr('data-artboard-'+prop+'');}}if(res==640){r=ab.attr('data-artboard-'+prop+'-res-640');if(typeof r=='undefined'){r=ab.attr('data-artboard-'+prop+'-res-960');if(typeof r=='undefined'){r=ab.attr('data-artboard-'+prop+'');}}}if(res==480){r=ab.attr('data-artboard-'+prop+'-res-480');if(typeof r=='undefined'){r=ab.attr('data-artboard-'+prop+'-res-640');if(typeof r=='undefined'){r=ab.attr('data-artboard-'+prop+'-res-960');if(typeof r=='undefined'){r=ab.attr('data-artboard-'+prop+'');}}}}if(res==320){r=ab.attr('data-artboard-'+prop+'-res-320');if(typeof r=='undefined'){r=ab.attr('data-artboard-'+prop+'-res-480');if(typeof r=='undefined'){r=ab.attr('data-artboard-'+prop+'-res-640');if(typeof r=='undefined'){r=ab.attr('data-artboard-'+prop+'-res-960');if(typeof r=='undefined'){r=ab.attr('data-artboard-'+prop+'');}}}}}}else{r=ab.attr('data-artboard-'+prop);}return(r);}function t396_ab__renderViewOneField(ab,field){var value=t396_ab__getFieldValue(ab,field);if(field=='height'){value=parseFloat(value).toFixed(1);ab.css('height',value+'px');ab.find('.t396__filter').css('height',value+'px');ab.find('.t396__carrier').css('height',value+'px');}if(field=='bgcolor')ab.css('background-color',value);if(field=='bgimg'){var carrier=ab.find('.t396__carrier');if(window.lazy=='y'){carrier.addClass('t-bgimg');carrier.attr('data-original',value); }else{carrier.css('background-image','url(' + value + ')');}carrier.css('background-size','cover');carrier.css('background-repeat','no-repeat');}if(field=='bgattachment'){var carrier=ab.find('.t396__carrier');var res=window.tn.curResolution;if(res<=960)value='scroll';carrier.css('background-attachment',value);}if(field=='bgposition'){var carrier=ab.find('.t396__carrier');carrier.css('background-position',value);}if(field=='filtercolor'){var filter=ab.find(".t396__filter");if(value!='' && typeof value!='undefined'){var rgb=t396_hex2rgb(value);filter.attr('data-filtercolor-rgb',rgb[0]+','+rgb[1]+','+rgb[2]);}else{filter.attr('data-filtercolor-rgb','');}t396_ab__filterUpdate(ab);}if(field=='filtercolor2'){var filter=ab.find(".t396__filter");if(value!='' && typeof value!='undefined'){var rgb=t396_hex2rgb(value);filter.attr('data-filtercolor2-rgb',rgb[0]+','+rgb[1]+','+rgb[2]);}else{filter.attr('data-filtercolor2-rgb','');}t396_ab__filterUpdate(ab);}if(field=='filteropacity'){var filter=ab.find(".t396__filter");if(value!='' && typeof value!='undefined'){filter.attr('data-filteropacity',value);}else{filter.attr('data-filteropacity','1');}t396_ab__filterUpdate(ab);}if(field=='filteropacity2'){var filter=ab.find(".t396__filter");if(value!='' && typeof value!='undefined'){filter.attr('data-filteropacity2',value);}else{filter.attr('data-filteropacity2','1');}t396_ab__filterUpdate(ab);}if(field=='height_vh'){if(value!=''){value=parseFloat( t396_ab__getHeight(ab) ).toFixed(1);ab.css('height',value+'px');ab.find('.t396__filter').css('height',value+'px');ab.find('.t396__carrier').css('height',value+'px');}}}function t396_allelems__renderView(ab){tn_console('func: allelems__renderView: abid:'+ab.attr('data-artboard-recid'));ab.find(".tn-elem").each(function() {t396_elem__renderView($(this));});}function t396_ab__filterUpdate(ab){var filter=ab.find('.t396__filter');var c1=filter.attr('data-filtercolor-rgb');var c2=filter.attr('data-filtercolor2-rgb');var o1=filter.attr('data-filteropacity');var o2=filter.attr('data-filteropacity2');if((typeof c2=='undefined' || c2=='') && (typeof c1!='undefined' && c1!='')){filter.css("background-color", "rgba("+c1+","+o1+")");}else if((typeof c1=='undefined' || c1=='') && (typeof c2!='undefined' && c2!='')){filter.css("background-color", "rgba("+c2+","+o2+")");}else if(typeof c1!='undefined' && typeof c2!='undefined' && c1!='' && c2!=''){filter.css({background: "-webkit-gradient(linear, left top, left bottom, from(rgba("+c1+","+o1+")), to(rgba("+c2+","+o2+")) )" });}else{filter.css("background-color", 'transparent');}}function t396_ab__getHeight(ab, ab_height){if(typeof ab_height=='undefined')ab_height=t396_ab__getFieldValue(ab,'height');ab_height=parseFloat(ab_height);/* get Artboard height (fluid or px) */var ab_height_vh=t396_ab__getFieldValue(ab,'height_vh');if(ab_height_vh!=''){ab_height_vh=parseFloat(ab_height_vh);if(isNaN(ab_height_vh)===false){var ab_height_vh_px=parseFloat( window.tn.window_height * parseFloat(ab_height_vh/100) );if( ab_height < ab_height_vh_px ){ab_height=ab_height_vh_px;}}} return(ab_height);} function t396_hex2rgb(hexStr){/*note: hexStr should be #rrggbb */var hex = parseInt(hexStr.substring(1), 16);var r = (hex & 0xff0000) >> 16;var g = (hex & 0x00ff00) >> 8;var b = hex & 0x0000ff;return [r, g, b];}String.prototype.t396_replaceAll = function(search, replacement) {var target = this;return target.replace(new RegExp(search, 'g'), replacement);};function t396_elem__getWidth(el,value){if(typeof value=='undefined')value=parseFloat( t396_elem__getFieldValue(el,'width') );var el_widthunits=t396_elem__getFieldValue(el,'widthunits');if(el_widthunits=='%'){var el_container=t396_elem__getFieldValue(el,'container');if(el_container=='window'){value=parseFloat( window.tn.window_width * parseFloat( parseInt(value)/100 ) );}else{value=parseFloat( window.tn.grid_width * parseFloat( parseInt(value)/100 ) );}}return(value);}function t396_elem__getHeight(el,value){if(typeof value=='undefined')value=t396_elem__getFieldValue(el,'height');value=parseFloat(value);if(el.attr('data-elem-type')=='shape'){var el_heightunits=t396_elem__getFieldValue(el,'heightunits');if(el_heightunits=='%'){var ab=el.parent();var ab_min_height=parseFloat( ab.attr('data-artboard-proxy-min-height') );var ab_max_height=parseFloat( ab.attr('data-artboard-proxy-max-height') );var el_container=t396_elem__getFieldValue(el,'container');if(el_container=='window'){value=parseFloat( ab_max_height * parseFloat( value/100 ) );}else{value=parseFloat( ab_min_height * parseFloat( value/100 ) );}}}else if(el.attr('data-elem-type')=='button'){value = value;}else{value =parseFloat(el.innerHeight());}return(value);}function tn_tu_empty(imageurl) {var ar=imageurl.split('/'), filename;filename = ar[ar.length-1];ar[ar.length-1] = '-';ar[ar.length] = 'empty';ar[ar.length++] = filename;return ar.join('/');}function tn_roundFloat(n){n = Math.round(n * 100) / 100;return(n);}function tn_console(str){if(window.tn_comments==1)console.log(str);} 
 
function t454_setLogoPadding(recid){
	if($(window).width()>980){
        var t454__menu = $('#rec'+recid+' .t454');
        var t454__logo=t454__menu.find('.t454__logowrapper');
        var t454__leftpart=t454__menu.find('.t454__leftwrapper');
        var t454__rightpart=t454__menu.find('.t454__rightwrapper');
        t454__leftpart.css("padding-right",t454__logo.width()/2+50);
        t454__rightpart.css("padding-left",t454__logo.width()/2+50);
	}
}

function t454_highlight(){
  var url=window.location.href;
  var pathname=window.location.pathname;
  if(url.substr(url.length - 1) == "/"){ url = url.slice(0,-1); }
  if(pathname.substr(pathname.length - 1) == "/"){ pathname = pathname.slice(0,-1); }
  if(pathname.charAt(0) == "/"){ pathname = pathname.slice(1); }
  if(pathname == ""){ pathname = "/"; }
  $(".t454__list_item a[href='"+url+"']").addClass("t-active");
  $(".t454__list_item a[href='"+url+"/']").addClass("t-active");
  $(".t454__list_item a[href='"+pathname+"']").addClass("t-active");
  $(".t454__list_item a[href='/"+pathname+"']").addClass("t-active");
  $(".t454__list_item a[href='"+pathname+"/']").addClass("t-active");
  $(".t454__list_item a[href='/"+pathname+"/']").addClass("t-active");
}

function t454_setPath(){
}

function t454_setBg(recid){
  var window_width=$(window).width();
  if(window_width>980){
    $(".t454").each(function() {
      var el=$(this);
      if(el.attr('data-bgcolor-setbyscript')=="yes"){
        var bgcolor=el.attr("data-bgcolor-rgba");
        el.css("background-color",bgcolor);
      }
      });
      }else{
        $(".t454").each(function() {
          var el=$(this);
          var bgcolor=el.attr("data-bgcolor-hex");
          el.css("background-color",bgcolor);
          el.attr("data-bgcolor-setbyscript","yes");
      });
  }
}

function t454_appearMenu(recid) {
      var window_width=$(window).width();
      if(window_width>980){
           $(".t454").each(function() {
                  var el=$(this);
                  var appearoffset=el.attr("data-appearoffset");
                  if(appearoffset!=""){
                          if(appearoffset.indexOf('vh') > -1){
                              appearoffset = Math.floor((window.innerHeight * (parseInt(appearoffset) / 100)));
                          }

                          appearoffset=parseInt(appearoffset, 10);

                          if ($(window).scrollTop() >= appearoffset) {
                            if(el.css('visibility') == 'hidden'){
                                el.finish();
                                el.css("top","-50px");
                                el.css("visibility","visible");
                                el.animate({"opacity": "1","top": "0px"}, 200,function() {
                                });
                            }
                          }else{
                            el.stop();
                            el.css("visibility","hidden");
                          }
                  }
           });
      }

}

function t454_changebgopacitymenu(recid) {
  var window_width=$(window).width();
  if(window_width>980){
    $(".t454").each(function() {
      var el=$(this);
      var bgcolor=el.attr("data-bgcolor-rgba");
      var bgcolor_afterscroll=el.attr("data-bgcolor-rgba-afterscroll");
      var bgopacityone=el.attr("data-bgopacity");
      var bgopacitytwo=el.attr("data-bgopacity-two");
      var menushadow=el.attr("data-menushadow");
      if(menushadow=='100'){
        var menushadowvalue=menushadow;
      }else{
        var menushadowvalue='0.'+menushadow;
      }
      if ($(window).scrollTop() > 20) {
        el.css("background-color",bgcolor_afterscroll);
        if(bgopacitytwo=='0' || menushadow==' '){
          el.css("box-shadow","none");
        }else{
          el.css("box-shadow","0px 1px 3px rgba(0,0,0,"+ menushadowvalue +")");
        }
      }else{
        el.css("background-color",bgcolor);
        if(bgopacityone=='0.0' || menushadow==' '){
          el.css("box-shadow","none");
        }else{
          el.css("box-shadow","0px 1px 3px rgba(0,0,0,"+ menushadowvalue +")");
        }
      }
    });
  }
}

function t454_createMobileMenu(recid) {
  var window_width=$(window).width();
  var el=$("#rec"+recid);
  var menu = el.find(".t454");
  var burger = el.find(".t454__mobile");
  if(980>window_width){
    burger.click(function(e){
      menu.fadeToggle(300);
      $(this).toggleClass("t454_opened");
    });
  }
}