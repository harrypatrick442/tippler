var EfficientMovingCycle = window['EfficientMovingCycle']= (function(){
	var currentMouseMove;
	var currentMouseUp;
	var currentTouchMove;
	var currentTouchEnd;
	var documentElement = document.documentElement;
	var _EfficientMovingCycle = function(params)
	{
		var self = this;
		var element = params[S.ELEMENT];
		var stopPropagation = params[S.STOP_PROPAGATION];
		this[S.ON_START] = doNothing;
		this[S.ON_MOVE] = doNothing;
		this[S.ON_END]= doNothing;
		if (!window[S.IS_MOBILE])
		{
			function mouseDown(e){
				if (!e)e = window.event;
				if(self[S.ON_START](e, false)==false)return;
				clearCurrentMouseMove();
				clearCurrentMouseUp()
				addMouseMoveEvent();
				addMouseUpEvent();
				stopPropagationIfRequired(e);
			}
			function mouseMove(e) {
				if (!e)e = window.event;
				self[S.ON_MOVE](e, false);
				stopPropagationIfRequired(e);
			}
			function mouseUp(e) {
				if (!e)e = window.event;
				self[S.ON_END](e, false);
				clearCurrentMouseUp();
				clearCurrentMouseMove();
				stopPropagationIfRequired(e);
			}
			function stopPropagationIfRequired(e){
				if(stopPropagation)
				{
					e.stopPropagation&&e.stopPropagation();
					e.preventDefault&&e.preventDefault();
				}	
			}
			function addMouseMoveEvent(){
				documentElement.addEventListener('mousemove', mouseMove);
				currentMouseMove = mouseMove;
			}
			function addMouseUpEvent(){
				documentElement.addEventListener('mouseup', mouseUp);
				currentMouseUp = mouseUp;
			}
			element.addEventListener('mousedown', mouseDown);
		}
		else
		{
			function touchStart(e) {
				if (!e)e = window.event;
				if(self[S.ON_START](e, true)==false)return;
				clearCurrentTouchMove();
				clearCurrentTouchEnd();
				addTouchMove();
				addTouchEnd();
			}
			function touchStartAnywhere(e){
				if (!e)e = window.event;
				self[S.ON_START_ANYWHERE](e, true);
			}
			function touchMove(e) {
				if (!e) e = window.event;
				self[S.ON_MOVE](e, true);
				e.preventDefault&&e.preventDefault();
			}
			function touchEnd(e) {
				if (!e)e = window.event;
				var keep = self[S.ON_END](e, true);
				if(keep)return;
				clearCurrentTouchEnd();
				clearCurrentTouchMove();
			}
			function addTouchMove(){
				documentElement.addEventListener('touchmove', touchMove);
				currentTouchMove = touchMove;
			}
			function addTouchEnd(){
				documentElement.addEventListener('touchend', touchEnd);
				currentTouchEnd = touchEnd;
			}
			element.addEventListener('touchstart', touchStart);
		}
    };
	return _EfficientMovingCycle;	
	function doNothing(){
		
	}
	function clearCurrentTouchEnd(){
		if(!currentTouchEnd)return;
		documentElement.removeEventListener('touchend', currentTouchEnd);
		currentTouchEnd=undefined;
	}
	function clearCurrentTouchMove(){
		if(!currentTouchMove)return;
		documentElement.removeEventListener('touchmove', currentTouchMove);
		currentTouchMove=undefined;
	}	
	function clearCurrentMouseUp(){
		if(!currentMouseUp)return;
		documentElement.removeEventListener('mouseup', currentMouseUp);
		currentMouseUp=undefined;
	}
	function clearCurrentMouseMove(){
		if(!currentMouseMove)return;
		documentElement.removeEventListener('mousemove', currentMouseMove);
		currentMouseMove=undefined;
	}
})();