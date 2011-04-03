/**
 * quintons@qsheppard.com
 */
(function($){ 
	
	$.overlaySettings = {
		wrapper: 'overlay-wrapper',
		width: null,
		height: null,
 		load: false,
 		contentType: 'inpage', /*inpage, iframe, ajax*/
 		url: null, /*URL - used for iframe or ajax*/
 		target: null,
 		closeButtonId: '.closeButton',
 		loadSpeed: 600,
 		timeoutSec: 8,
 		pos: ($.browser.msie && $.browser.version <= 6) ? 'absolute' : 'fixed',
 		mask: {
 			maskId: "mask",
			color: '#000',
			loadSpeed: 600,
			opacity: 0.7,
			closeOnClick: true
		},
 		progress: {
 			src: 'progress.gif'
 		}
	}
	
	//$().overlay({})
	
	var mask, progress, overlay;
	
	$.mask = {
		load: function(conf, callBack){
			// does the mask exist?
			mask = $('#' + conf.maskId);
			
			// create the mask if not found
			if(!mask.length){
				mask = $("<div />").attr("id", conf.maskId)
				$('body').append(mask);
			}
			
			// set its properties
			mask.css({
				position: $.overlaySettings.pos,
				left: '0',
				top: '0',
				backgroundColor: conf.color,
				height: $(window).height(),
				width: $(window).width(),
				display: 'none',
				opacity: conf.opacity,
				zIndex: '9997'
			})
			
			callBack = callBack || function(){}
			
			// animate mask
			mask.fadeIn(conf.loadSpeed, callBack);
			
			// resize mask on window resize
			$(window).bind('resize.mask', function(e){
				$('#' + conf.maskId).css({
					height: $(window).height(),
					width: $(window).width()
				})
			})

		},
		close: function(){
			mask.fadeOut($.overlaySettings.mask.loadSpeed);
		},
		getMask: function(){
			return mask;
		}
	}
	
	/* Description: 	Constructor Overlay
   /*						sets up overlay, applies
   * Arguments:
   * 	trigger - this.
   * 	conf - options.
   */
   function Overlay(trigger, conf){
   	// sets up overlay
   	
   	// private members
   	var self = this,
   		opened = false,
   		oid,
   		content,
   		uid = Math.random().toString().slice(10);
   	
   	// test if mastek showOverlay exists - set accordingly
   	if(conf.mastek){$.extend(conf, mastek.setConf(trigger, conf))}
   	
   	// private methods
		// get overlay class wrapper
   	oid = conf.wrapper || trigger.attr('data-overlay');
   	overlay = $(oid);
   	
   	// can't find the overlay!
   	if(!overlay) { throw('Cound not find overlay: ' + oid) }
   	
   	// trigger load
   	if(trigger && !conf.load){
   		trigger.click(function(e){
   			self.load(e);
   			return e.preventDefault();
   		})
   	}
   	
   	var loadContent = function(){
			// load content
			//iframe, ajax, div-content
			switch(conf.contentType){
				case 'iframe':
   				var content = $('<iframe />'); //.attr("src", conf.url);
   				content.css({ left: '-1000px', position: conf.pos, display: 'block' })
   				
   				overlay = content;
   				
   				if(conf.wrapper != null){
   					content.attr("class", conf.wrapper);
   				}
   				
   				// w/h from config or element?
					var w = (conf.width != null) ? conf.width : content.width();
   				var h = (conf.height != null) ? conf.height : content.height();  						
   				
   				/*$.ajax({
   					statusCode: {
   						200: function(){
   							alert('OK')
   						}
   					},
   					error: function(xhr, textStatus, errorThrown){
   						alert('error: ' + textStatus);
   					},
   					success: function(data, textStatus){
   						alert("success: " + textStatus);
   					},
   					complete: function(xhr, textStatus){
   						alert('complete: ' + textStatus)
   					},
   					isLocal: true,
   					timeout: (conf.timeoutSec+5)*1000,
   					async: false,
   					url: conf.url,
   					type: 'HEAD'
   				})*/
   				
   				content.attr("src", conf.url);
   				
   				// bind load event to iframe
   				content.bind('load', function(){
		   				
		   				// clear timeout
		   				//clearTimeout(t);
		   				
		   				progress.hide();
		   				
			   			content.css({
			   				width: w,
			   				height: h,
			   				display: 'none',
			   				top: '50%',
			   				marginLeft: '-' + w/2 + 'px',
			   				marginTop: '-' + h/2 + 'px',
			   				zIndex: '9999'
			   			})
			   			
			   			// fade in content
			   			progress.fadeOut('500', function(){
			   				content.css({left: '50%'}).fadeIn(conf.loadSpeed)
			   			})
			   			
			   			// tempary cache of iframe object context;
			   			var context = content.contents()
			   			
			   			// apply self.close on iframe context of closeButtonId
			   			// TODO: Test for iframe same as local domain, or localhost
			   			// 		throw error if !localhost && !sameDomain
			   			
			   			//var isDomainMatch = true;
			   			//if(conf.closeButtonId && isDomainMatch){
			   				context.find(conf.closeButtonId).one('click', function(e){
			   					self.close(e)
			   					return e.preventDefault()
			   				})
			   			//}
		   			//}
	   			})
					break;
				case 'inpage':
					//context = $(conf.url);
					
					// default overlay
		   		/*if(conf.closeButtonId){
		   			content.$(conf.closeButtonId).one('click', function(e){self.close(e)})
		   		}*/
					break;
				case 'ajax':
		   		/*if(conf.closeButtonId){
		   			content.$(conf.closeButtonId).one('click', function(e){self.close(e)})
		   		}*/
					break;
				default:
					break;
			}
			
			$('body').prepend(content);
   	}
   	
   	$.extend(self, {
   		// public methods
   		load: function(e){
   			// load overlay code...
   			if(self.isOpened()){return self;}
   			
   			//$.progress.load();
   			
   			progress = $('#overlayProgress');
   			
   			// does progress exist?
   			if(!progress.length){
	   			// create & show progress
	   			progress = $('<img src="'+conf.progress.src+'" id="overlayProgress" />');
	   			progress.css({
	   				top: '50%',
	   				display: 'none',
	   				left: '50%',
	   				zIndex: '9998',
	   				position: conf.pos
	   			})
	   			$('body').append(progress);
   			}
   			
   			// show mask
   			$.mask.load($.overlaySettings.mask, 
   				function(){
   						progress.fadeIn('slow', loadContent())
   				} 
   			)
   			
   			opened = true;
   		},
   		close: function(e){
   			// close overlay code...
   			//$.progress.close();
   			this.getOverlay().fadeOut(500, function(){$.mask.close()});
   			opened = false;
   		},
   		isOpened: function(){
   			return opened;
   		},
   		getOverlay: function(){
   			return overlay;
   		}
   	})
    	
    	if(conf.load){
    		self.load();
    	}
    	
   	return self;
   }
			
    $.fn.overlay = function(conf){
   	
   	// create new instance of overlay
   	var el = this.data('overlay'),
   		$this = $(this);
   		
    	if(el){ return el; }
    	
    	conf = $.extend(true, {}, $.overlaySettings, conf)
    	
    	el = new Overlay($this, conf);
  		$this.data('overlay', el)
  		
  		return this;
  		
  	}
  	
  	// mastek only code.
  	var mastek = {
  		setConf: function(trigger, conf){
  			var a;
  			function showOverlay(){ a = arguments;}
  			eval('('+trigger.attr('onclick')+')()');
  			
  			return {
		  		wrapper : (function(){
		  				return (a.length == 3) ? 
		  					(a[0] != null && a[0].length > 0) ? a[0] : conf.wrapper : conf.wrapper;
		  		})(),
		  		url : (function(){
		  				return (a.length == 3) ?
		  					(a[2] != null && a[2].length > 0) ? a[2] : conf.url : conf.url;
		  		})()
		  	}
  		}
  	}
  	
})(jQuery);