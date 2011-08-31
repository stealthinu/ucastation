// Copyright ©2009 Aaron Vanderzwan, by Aaron Vanderzwan
// Thanks to Skye Giordano for the suggestion of the resizeMsg option.
// 
// LICENSE
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
// 
// VERSION: 1.1.7




(function($) {
// The maxImages plugin resizes an image dynamically, according to the width of the browser.
jQuery.fn.maxImage = function(options) {
  
  var resizeMsgDefaults = {show: false, location: 'before', message: 'Original: ([w]w x [h]h)'};
  
  // var opts = $.extend({}, $.fn.maxImage.defaults, options);
  var opts = jQuery.extend({
    wait:                 true,
    imageArray:           [],
    maxFollows:           'both',  // Options: width, height, both
    verticalOffset:       0,
    horizontalOffset:     0,
    leftSpace:            0,
    topSpace:             0,
    rightSpace:           0,
    bottomSpace:          0,
		overflow: 						'hidden',
    position:             'absolute',
    isBackground:         false,
    zIndex:               -1,
    verticalAlign:        'center',
    horizontalAlign:      'center',
    maxAtOrigImageSize:   false,
    slideShow:            false,
    slideDelay:           5,
    slideShowTitle:       true,
    loaderClass:          'loader',
    resizeMsg:            resizeMsgDefaults,
	onImageShow:          function(){}	
  }, options);
  
  // var resizeDefaults = {show: false, location: 'before', message: '(resized)'};
  opts.resizeMsg = jQuery.extend(resizeMsgDefaults, options.resizeMsg)
  
  // Cache jQuery object
  var jQueryMatchedObj = this;
  
  function _initialize() {
    _start(this,jQueryMatchedObj);
    return false;
  }
  
  function _start(image,jQueryMatchedObj) {
    if( opts.slideShow ){
      _setup_slideshow(jQueryMatchedObj);
    } else if ( opts.isBackground ){
      Background._setup_background(image);
    } else {
	 		Others._setup_others(image,opts);
    }
  }
  
  Others = {
    _setup_others: function(image,opts){
      $this = $(image);
		$this.hide();
	  	
		Others._configure_css(image,opts);
		$(window).load(function(){
			_get_orig_data($this);
			_size_image($this);
	      	_center_image($this);
			$this.show();
			$('.'+opts.loaderClass).hide();
			opts.onImageShow.call(this);
			$(window).resize(function(){
				_size_image($this);
	        	_center_image($this);
			});
		});
    },
    _configure_css: function(image,opts){
      if(opts.position == 'absolute') {
				
        $(image).css({
          'overflow':   'hidden',
          'left':       opts.leftSpace,
          'top':        opts.topSpace,
          'position':   'absolute'
        });
        
        if(opts.verticalAlign == 'bottom'){
          $(image).css({'bottom':opts.bottomSpace,'top':'auto'});
        }
        if(opts.horizontalAlign == 'right'){
          $(image).css({'right':opts.rightSpace,'left':'auto'});
        }
      } else {
        $(image).css({
          'margin-top':     opts.topSpace,
          'margin-right':   opts.rightSpace,
          'margin-bottom':  opts.bottomSpace,
          'margin-left':    opts.leftSpace,
          'position':       opts.position
        });
      }
    }
  }
  
  Background = {
    _setup_background: function(image){
      $this = $(image);
      $this.hide();
      
      Background._configure_css(image);
      $(window).load(function(){
        _get_orig_data($this);
        _size_image($this);
        _center_image($this);
		$this.show();
		$('.'+opts.loaderClass).hide();
		opts.onImageShow.call(this);
        $(window).resize(function(){
          _size_image($this);
		  _center_image($this)
        });
      });
      
    },
    _configure_css: function(image){
      // If position is set to absolute (or if isBackground)
      $(image).css({
        'z-index':  opts.zIndex
      });
      if(opts.position == 'absolute') {
        $(image).css({
          'overflow':   'hidden',
          'left':       opts.leftSpace,
          'top':        opts.topSpace,
          'position':   'absolute'
        });
        
        $('html').css({'overflow-y':opts.overflow});
        
        if(opts.verticalAlign == 'bottom'){
          $(image).css({'bottom':opts.bottomSpace,'top':'auto'});
        }
        if(opts.horizontalAlign == 'right'){
          $(image).css({'right':opts.rightSpace});
        }
      } else {
        $(image).css({
          'margin-top':     opts.topSpace,
          'margin-right':   opts.rightSpace,
          'margin-bottom':  opts.bottomSpace,
          'margin-left':    opts.leftSpace,
          'position':       opts.position
        });
      }
    }
  }
  
  
  // SLIDESHOW FUNCTIONS
  function _setup_slideshow (jQueryMatchedObj){
    _build_slideshow_structure(jQueryMatchedObj);
    
    opts.imageArray.length = 0;

    if( jQueryMatchedObj.length == 1){
      opts.imageArray.push(new Array(objClicked.getAttribute('src'),objClicked.getAttribute('title')));
    } else {  
      for ( var i = 0; i < jQueryMatchedObj.length; i++ ) {
        opts.imageArray.push(new Array(jQueryMatchedObj[i].getAttribute('src'),jQueryMatchedObj[i].getAttribute('title')));
        $(jQueryMatchedObj[i]).attr('original',$(jQueryMatchedObj[i]).attr('src')).attr('src','');
      }
    }
		_configure_css();
    _loads_image(0);
  }
    
  function _build_slideshow_structure() {
    for ( var i = 0; i < jQueryMatchedObj.length; i++ ) {
      $(jQueryMatchedObj[i]).addClass('slides slide-'+i).after('<div class="slideTitle">'+$(jQueryMatchedObj[i]).attr('title')+'</div>');
    }
    $('.slideTitle').hide().css({
      'padding':'10px',
      'background':'#e0e0e0',
      'position':'absolute',
      'bottom':'0',
      'right':'5%',
      'opacity':'0.8'
    });
  }
  
  
  function _loads_image(nums){
    var currentImage = nums;
    
    var objImagePreloader = new Image();
    objImagePreloader.onload = function() {
      $('.slide-'+currentImage).attr('src',opts.imageArray[currentImage][0]);
      _get_orig_data($('.slide-'+currentImage));
      _size_image($('.slide-'+currentImage));
      _center_image($('.slide-'+currentImage));
			if(currentImage==0) opts.onImageShow.call(this);
      $(window).resize(function(){
        _size_image($('.slide-'+(currentImage)));
	      _center_image($('.slide-'+currentImage));
      });
      
      if(currentImage==0){
        _start_timer();
      }
      
      if(currentImage < opts.imageArray.length-1){
        _loads_image(currentImage+1);
      }
      
    }
    objImagePreloader.src = opts.imageArray[currentImage][0];
  }
  
  function _start_timer() {
    var currentSlide = 0;
    
    // Hide the loading graphic
    $('.'+opts.loaderClass).hide();
    
    // Fade in first image
    $('.slide-'+currentSlide).css({'z-index':opts.zIndex}).fadeIn();
    
    // If user wants to show titles, use this option
    if(opts.slideShowTitle){
      $('.slide-'+currentSlide).next('.slideTitle').css({'z-index':opts.zIndex+1}).fadeIn();
    }
    
    // Start timer for slideshow
    var slideInterval = setInterval(function(){
      if(currentSlide < opts.imageArray.length-1){
        currentSlide++;
        lastSlide = currentSlide-1;
      } else {
        currentSlide=0;
        lastSlide = opts.imageArray.length-1;
      }
			
      $('.slide-'+lastSlide).css({'z-index':opts.zIndex-1}).fadeOut('slow');
      $('.slide-'+currentSlide).css({'z-index':opts.zIndex}).fadeIn('slow');
      if(opts.slideShowTitle){
        next_title(currentSlide,lastSlide);
      }
    }, (to_i(opts.slideDelay)*1000));
  }
  
  function _configure_css(){
    for(i=0;i<opts.imageArray.length;i++){
      // Style the slide
      if(opts.position == 'absolute') {
        $('.slide-'+i).css({
          'position':   'absolute',
          'overflow':   'hidden'
        });
        
        $('html').css({'overflow-y':opts.overflow});
        
        if(opts.verticalAlign == 'bottom'){
          $('.slide-'+i).css({'bottom':opts.bottomSpace});
        }else{
          $('.slide-'+i).css({'top':opts.topSpace});
				}
				
        if(opts.horizontalAlign == 'right'){
          $('.slide-'+i).css({'right':opts.rightSpace});
        }else{
		      $('.slide-'+i).css({'left':opts.leftSpace});
				}
      } else {
        $('.slide-'+i).css({
          'margin-top':     opts.topSpace,
          'margin-right':   opts.rightSpace,
          'margin-bottom':  opts.bottomSpace,
          'margin-left':    opts.leftSpace,
          'position':       opts.position
        });
      }
      
      
      // Style the title
      $('.slide-'+i).next('.slideTitle').css({
        'position':'absolute',
        'bottom':0,
        'right':'5%'
      });
    }
  }
  
  
  function next_title(currentSlide,lastSlide){
    $('.slide-'+lastSlide).next('.slideTitle').fadeOut();
    $('.slide-'+currentSlide).next('.slideTitle').fadeIn();
  }
  
  
  // BROAD FUNCTIONS - FOR EACH SECTION
	function _center_image(image){
		$this = image;
		
    if(opts.horizontalAlign == 'center'){
	    var pageWidth = $(window).width() - opts.horizontalOffset;
			var newWidth = -1*($this.width() - pageWidth)/2;
      $(image).css({'left':newWidth});
    }
		
    if(opts.verticalAlign == 'center'){
	    var pageHeight = $(window).height() - opts.verticalOffset;
			var newHeight = -1*($this.height() - pageHeight)/2;
      $(image).css({'top':newHeight});
    }
	}

  function _get_orig_data(image){
    $this = image;
   	
    $this.attr('origWidth', $this.width());
    $this.attr('origHeight', $this.height());
    $this.attr('ratio', find_ratio($this.width(),$this.height()));
  }
  
  function _size_image(image){
    $this = image;
    
    var originalWidth = to_i($this.attr('origWidth'));
    var originalHeight = to_i($this.attr('origHeight'));
    var ratio = $this.attr('ratio');
	
  	if(originalWidth == 0 || originalHeight == 0){
  		setTimeout(function(){
				_get_orig_data(image);
				_size_image(image);
			}, 100);
  		return;
  	}
    
    var width_and_height = [];
    width_and_height = find_width_and_height(originalWidth,originalHeight,ratio);
    
    $this.width( width_and_height[0] );
    $this.height( width_and_height[1] );
    
    _show_resize_message(originalWidth,originalHeight,image);
  }
  
  function _show_resize_message(originalWidth,originalHeight,image){
	  if( (to_i($this.width()) != originalWidth || to_i($this.height()) != originalHeight) && opts.resizeMsg.show){
      $(".maximage_resized").remove();
      
      // Replace [w] and [h] with their respective width or height
      opts.resizeMsg.message = opts.resizeMsg.message.replace('[w]',originalWidth).replace('[h]',originalHeight);
      
  		var insertStr = '<div class="maximage_resized">' + opts.resizeMsg.message + '</div>';
  		if(opts.resizeMsg.location.toLowerCase() == "before"){
  			$this.before(insertStr);
  		} else {
  			$this.after(insertStr);
  		}
  	}
  }
  
  function find_width_and_height(originalWidth,originalHeight,ratio) {
    var pageWidth = $(window).width() - opts.horizontalOffset;
    var pageHeight = $(window).height() - opts.verticalOffset;
    
    if(!opts.isBackground){
      if(opts.maxFollows=='both'){
        max_follows_width(pageWidth,ratio);
        
        if( height > pageHeight ){
          max_follows_height(pageHeight,ratio);
        }
      } else if (opts.maxFollows == 'width'){
        max_follows_width(pageWidth,ratio);
      } else if (opts.maxFollows == 'height'){  
        max_follows_height(pageHeight,ratio);
      }
    }else{
      width = pageWidth + 40;
      height = width/ratio;
      
      if( height < pageHeight ){
        height = pageHeight - (opts.topSpace + opts.bottomSpace);
        width = height*ratio;
      }
    }
    
    // If maxAtRatio == true and your new width is larger than originalWidth, size to originalWidth
    if ( opts.maxAtOrigImageSize && width > originalWidth){
      arrayImageSize = new Array(originalWidth,originalHeight);
    }else{
      arrayImageSize = new Array(width,height);
    }
    return arrayImageSize;
  }
  
  function max_follows_height(pageHeight,ratio){
    height = pageHeight - (opts.topSpace + opts.bottomSpace);  // Page Height minus topSpace and bottomSpace
    width = height*ratio;
  }
  
  function max_follows_width(pageWidth,ratio){
    width = pageWidth - (opts.leftSpace + opts.rightSpace); // Page Width minus leftSpace and rightSpace
    height = width/ratio;
  }
  
  function find_ratio(width,height) {
    width = to_i(width);
    height = to_i(height);
    var ratio = width/height;
    ratio = ratio.toFixed(2);
    return ratio;
  }
  
  function to_i(i){
    last = parseInt(i);
    return last;
  }
  
  // private function for debugging
  function debug($obj) {
    if (window.console && window.console.log) {
      window.console.log($obj);
    }
  }
  
  return this.each(_initialize);
};


})(jQuery);
