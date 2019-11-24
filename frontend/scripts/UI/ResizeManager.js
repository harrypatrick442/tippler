var ResizeManager= global['ResizeManager'] = new (function(){
		EventEnabledBuilder(this);
		var self = this;
		this[S.ADD]=function(params){
			return new Watcher(params);
		};
		function Watcher(params){
			EventEnabledBuilder(this);
			var self = this;
			var element = params[S.ELEMENT];
			var onResized=params[S.ON_RESIZED];
			var onFirstResize = params[S.ON_FIRST_RESIZE];
			var staggered=params[S.STAGGERED];
			var p ={};
			p[S.CALLBACK]=_resized;
			p[S.DELAY]=500;
			p[S.MAX_TOTAL_DELAY]=800;
			var temporalCallback = staggered?new TemporalCallback(p):undefined;
			p={};
			p[S.N_TICKS]=1;
			p[S.DELAY]=900;
			p[S.CALLBACK]=finishedResizing;
			var timerFinishedResizing = new Timer(p);
			var startedResizing = false;
			var loggedSize;
			this[S.MANUAL]=function(){
				resized();
			};
			var resizeObserver;
			var hasResizeObserver=window['ResizeObserver']?true:false;
			var resizedCallback=staggered?scheduleResize:resized;
			if(hasResizeObserver)
			{
				resizeObserver = new (window['ResizeObserver'])(resizedCallbackNotInitial);
				resizeObserver['observe'](element);
			}
			else
				WindowResizeManager.addEventListener(S.RESIZED, resizedCallback);
			this[S.DISPOSE]=function(){
				if(!hasResizeObserver)
					WindowResizeManager.removeEventListener(S.RESIZED, resizedCallback);
				else
					resizeObserver['disconnect']();
			};
			var resizedCallbackForNotInitial;
			setTimeout(function(){resizedCallbackForNotInitial=resizedCallback;},0);
			function resizedCallbackNotInitial(){
				resizedCallbackForNotInitial&&resizedCallbackForNotInitial();
			}
			function logSize(){loggedSize= element['getBoundingClientRect']();}
			function scheduleResize(){
				temporalCallback['trigger']();
				doStartIfRequired();
			}
			function finishedResizing(){
				startedResizing=false;
			}
			function resized(params){
				doStartIfRequired();
				_resized();
			}
			function doStartIfRequired(){
				if(!startedResizing){
					onFirstResize&&onFirstResize();
					timerFinishedResizing['start']();
					startedResizing = true;
				}else{
					timerFinishedResizing['reset'](true);
				}
			}
			function _resized(params){
				if(!loggedSize){logSize(); return;}
				var previousLoggedSize= loggedSize;
				logSize();
				if(previousLoggedSize['height']==loggedSize['height']&&previousLoggedSize['width']==loggedSize['width'])return;
				dispatchResized();
			}
			function dispatchResized(){
				self['dispatchEvent']({'type':'resized'});
				onResized&&onResized();
			}
		}
})();
