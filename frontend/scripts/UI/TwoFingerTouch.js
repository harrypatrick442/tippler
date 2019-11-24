var TwoFingerTouch=(function(){
	var _TwoFingerTouch=function(params){
		var self = this;
		var element = params[S.ELEMENT];
		var finger2Active=false;
		var finger1Active = false;
		var touch1,touch2;
		var documentElement = document.documentElement;
		this[S.ON_START]=doNothing;
		this[S.ON_START_FINGER_1] = doNothing;
		this[S.ON_START_FINGER_2]=doNothing;
		this[S.ON_MOVE_FINGER_1] = doNothing;
		this[S.ON_MOVE_FINGER_2] = doNothing;
		this[S.ON_END_FINGER_1] = doNothing;
		this[S.ON_END_FINGER_2] = doNothing;
		this[S.ON_END] = doNothing;
		//onStartFinger1-2
		//onMoveFinger1-2
		//onEndFinger1-2
		//onStart when both fingers are down
		//onEnd when both fingers are up.
		element.addEventListener('touchstart', start);
		function start(e){
			
			var changedTouches = e.changedTouches;
			for(var i=0; i<changedTouches.length; i++){
				var changedTouch = changedTouches[i];
				if(changedTouch['identifier'] ==0){
					finger1Active=true;
					setTimeout(function(){
						documentElement.addEventListener('touchstart', startAnywhere);
					}, 0);
					documentElement.addEventListener('touchmove', move);
					documentElement.addEventListener('touchend', end);
					touch1 = changedTouch;
					self[S.ON_START_FINGER_1](changedTouch,  e);
				}else
				startFinger2(changedTouch, e);
			}
		}
		function startAnywhere(e){
			var changedTouch = e.changedTouches[0];
			startFinger2(changedTouch, e);
		}
		function startFinger2(changedTouch, e){
			if(changedTouch['identifier']==1){
				finger2Active=true;
				touch2 = changedTouch;
				self[S.ON_START_FINGER_2](changedTouch, e);
				if(finger1Active&&finger2Active)
				{
					var p={};
					p[S.TOUCH_1]=touch1;
					p[S.TOUCH_2]=touch2;
					p[S.E]=e;
					self[S.ON_START](p);
				}
			}
		}
		function startSecondFinger(){
			
		}
		function move(e){
			var changedTouches = e.changedTouches;
			for(var i=0; i<changedTouches.length; i++){
				var changedTouch = changedTouches[i];
				if(changedTouch.identifier ==0){
					self[S.ON_MOVE_FINGER_1](changedTouch,  e);
				}
				if(changedTouch.identifier==1){
					self[S.ON_MOVE_FINGER_2](changedTouch, e);
				}
			}
			e.preventDefault&&e.preventDefault();
		};
		function end(e){
			var changedTouches = e.changedTouches;
			for(var i=0; i<changedTouches.length; i++){
				var changedTouch = changedTouches[i];
				if(changedTouch['identifier'] ==0){
					finger1Active=false;
					documentElement.removeEventListener('touchstart', startAnywhere);
					self[S.ON_END_FINGER_1](changedTouch,  e);
				}
				if(changedTouch.identifier==1){
					finger2Active=false;
					self[S.ON_END_FINGER_2](changedTouch, e);
				}
			}
			var active = finger1Active||finger2Active;
			if(active)return true;
			documentElement.removeEventListener('touchmove', move);
			documentElement.removeEventListener('touchend', end);
			self[S.ON_END](e);
		};
		function doNothing(){}
	};
	return _TwoFingerTouch;
})();