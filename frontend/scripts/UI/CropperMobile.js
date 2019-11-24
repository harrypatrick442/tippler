var CropperMobile = (function(){
	var MIN_FINGER_SPACING_FOR_RESIZE_COMPONENT = 45;
	var MIN_WIDTH_HEIGHT=70;
	var _Cropper=function(params){
		var self = this;
		var aspectRatio = params[S.ASPECT_RATIO];
		var getImageWidth= params[S.GET_IMAGE_WIDTH];
		var getImageHeight = params[S.GET_IMAGE_HEIGHT];
		var minWidth = 50;
		var minHeight = 50;
		var element = E.DIV();
		element.classList.add('cropper');
		this[S.SET_ASPECT_RATIO]=function(value){
			aspectRatio = value;
		};
		this[S.POSITION_DEFAULT]= function(imageWidth, imageHeight){
			var width = imageWidth;
			var height = imageHeight;
			if(aspectRatio){
				if(imageHeight*aspectRatio>imageWidth){
					height = width/aspectRatio;
				}
				else{
					width = height * aspectRatio;
				}
			}
			element.style.left = '0px';
			element.style.top='0px';
			element.style.width=String(width)+'px';
			element.style.height=String(height)+'px';
		};
		this[S.ON_SHOW] = function(){
		};
		this[S.GET_ELEMENT] = function(){return element;};
		this[S.GET_POSITION] = function(e){
			var p ={};
			p[S.LEFT]=element.offsetLeft;
			p[S.TOP]=element.offsetTop
			return p;//{left:absolute.left+(getWidth()/2), top:absolute.top+(getHeight()/2)};
		};
		this[S.GET_ABSOLUTE_POSITION]=function(e){
			var p ={};
			p[S.LEFT]=e.pageX;
			p[S.TOP]=e.pageY;
			return p;
		};
		this[S.GET_DIMENSIONS] = function(){
			var p={};
			p[S.WIDTH]=element.clientWidth;
			p[S.HEIGHT]=element.clientHeight;
			return p;
		};
		var p={};
		p[S.ELEMENT]=element;
		var twoFingerTouch = new TwoFingerTouch(p);
		var startMiddleFingers;
		var startPosition;
		var startDimensions;
		var startDistanceFromMiddleToFinger1;
		var startDistanceFromMiddleToFinger2;
		var movedFinger1 = doNothing;
		var movedFinger2 = doNothing;
		var leftDistanceFromMiddle,topDistanceFromMiddle,rightDistanceFromMiddle,bottomDistanceFromMiddle,
		imageWidth,imageHeight,startPositionFingerWithOffset,moveBounds,touch1,touch2,
		maxTimesFingerDistance,startFingerDistance;
		twoFingerTouch[S.ON_START]= aspectRatio?onStartAspectRatioFixed:onStartAspectRatioNotFixed;
		
		twoFingerTouch[S.ON_START_FINGER_1]= function(touch){
			calculateMoveBounds();
			touch1 = touch;
			startPositionFingerWithOffset = getStartPositionWithOffsetForMove(touch);
			movedFinger1 = move;
		};
		twoFingerTouch[S.ON_END_FINGER_1]= function(touch){
			calculateMoveBounds();
			if(touch2){
				movedFinger2 = move;
				startPositionFingerWithOffset = getStartPositionWithOffsetForMove(touch2);
			}
			else
				movedFinger2 = doNothing;
			movedFinger1 = doNothing;
		};
		twoFingerTouch[S.ON_END_FINGER_2]= function(touch){
			calculateMoveBounds();
			startPositionFingerWithOffset = getStartPositionWithOffsetForMove(touch1);
			movedFinger1 = move;
			movedFinger2 = doNothing;
		};
		twoFingerTouch[S.ON_MOVE_FINGER_1] = aspectRatio?onMoveFinger1AspectRatioFixed:onMoveFinger1AspectRatioNotFixed;
		twoFingerTouch[S.ON_MOVE_FINGER_2]= aspectRatio?onMoveFinger2AspectRatioFixed:onMoveFinger2AspectRatioNotFixed;
		twoFingerTouch[S.ON_END] = function(touch){
			touch1 = undefined;
			touch2 = undefined;
			//calculateMoveBounds();
		};
		function onMoveFinger1AspectRatioNotFixed(touch){
			touch1 = touch;
			movedFinger1(touch, startDistanceFromMiddleToFinger1);
		};
		function onMoveFinger2AspectRatioNotFixed(touch){
			touch2 = touch;
			movedFinger2(touch, startDistanceFromMiddleToFinger2);
		};
		function onMoveFinger1AspectRatioFixed(touch){
			touch1 = touch;
			movedFinger1(touch);
		}
		function onMoveFinger2AspectRatioFixed(touch){
			touch2 = touch;
			movedFinger2(touch);
		}
		function onStart(e){
			imageWidth = getImageWidth();
			imageHeight = getImageHeight();
			startPosition = getCropperPosition();
			startDimensions = getCropperDimensions();
		}
		function onStartAspectRatioFixed(e){
			onStart(e);
			touch1 = e[S.TOUCH_1];
			touch2 = e[S.TOUCH_2];
			startFingerDistance= getFingerDistance(touch1, touch2);
			maxTimesFingerDistance= getMaxTimesFingerDistance();
			if(startFingerDistance<MIN_FINGER_SPACING_FOR_RESIZE_COMPONENT)
			{
				movedFinger1 = move;
				movedFinger2 = doNothing;
				calculateMoveBounds();
			}
			movedFinger1 = movedFixedAspectRatio;
			movedFinger2 = movedFixedAspectRatio;
		}
		function onStartAspectRatioNotFixed(e){
			onStart(e);
			touch1 = e[S.TOUCH_1];
			touch2 = e[S.TOUCH_2];
			var p ={};
			p[S.X]=(touch1.pageX+touch2.pageX)/2;
			p[S.Y]=(touch1.pageY+touch2.pageY)/2;
			startMiddleFingers = p;
			p={};
			p[S.X]=touch1.pageX - startMiddleFingers[S.X];
			p[S.Y]=touch1.pageY-startMiddleFingers[S.Y];
			startDistanceFromMiddleToFinger1= p;
			p={};
			p[S.X]=touch2.pageX - startMiddleFingers[S.X];
			p[S.Y]=touch2.pageY-startMiddleFingers[S.Y];
			startDistanceFromMiddleToFinger2=p;
			var finger1IsRightFinger=touch1.pageX>touch2.pageX;
			var finger1IsLowFinger = touch1.pageY>touch2.pageY; 
			var isRightFingerHigh = (finger1IsRightFinger^finger1IsLowFinger);
			var hasHorizontalResize = (finger1IsRightFinger?(touch1.pageX-touch2.pageX):
			(touch2.pageX-touch1.pageX))>MIN_FINGER_SPACING_FOR_RESIZE_COMPONENT;
			var hasVerticalResize = (finger1IsLowFinger?(touch1.pageY-touch2.pageY):
			(touch2.pageY- touch1.pageY))>MIN_FINGER_SPACING_FOR_RESIZE_COMPONENT;
			if(!hasHorizontalResize){
				if(!hasVerticalResize){
					movedFinger1 = move;
					movedFinger2 = doNothing;
					calculateMoveBounds();
					return;
				}
				if(finger1IsLowFinger){
					movedFinger1 = movedBottomFingerVerticalResize;
					movedFinger2 = movedTopFingerVerticalResize;
				}
				else{
					movedFinger1 = movedTopFingerVerticalResize;
					movedFinger2 = movedBottomFingerVerticalResize;
				}
				return;
			}
			if(!hasVerticalResize){
				if(finger1IsRightFinger){
					movedFinger1 = movedRightFingerHorizontalResize;
					movedFinger2 = movedLeftFingerHorizontalResize;
				}
				else{
					movedFinger1 = movedLeftFingerHorizontalResize;
					movedFinger2 = movedRightFingerHorizontalResize;
				}
				return;
			}
			if(isRightFingerHigh){
				if(finger1IsRightFinger){
					movedFinger1 = movedRightHighFinger;
					movedFinger2 = movedLeftLowFinger;
				}
				else{
					movedFinger1 = movedLeftLowFinger;
					movedFinger2 = movedRightHighFinger;
				}
				return;
			}
			
			var finger1IsLeftHigh = touch1.pageX>touch2.pageX;
			if(finger1IsRightFinger){
				movedFinger1 = movedRightLowFinger
				movedFinger2 = movedLeftHighFinger;
			}
			else{
				movedFinger1 = movedLeftHighFinger;
				movedFinger2 = movedRightLowFinger;
			}
		};
		function getFingerDistance(){
			return Math.sqrt(Math.pow(touch1.pageX-touch2.pageX, 2)+Math.pow(touch1.pageY-touch2.pageY, 2));
		}
		function getMaxTimesFingerDistance(){
			if(imageWidth>imageHeight*aspectRatio)
				return imageHeight*aspectRatio/startDimensions[S.WIDTH];
			return imageWidth/startDimensions[S.WIDTH];
		}
		function getStartPositionWithOffsetForMove(touch){
			var p ={};
			p[S.X]=element.offsetLeft - touch.pageX;
			p[S.Y]=element.offsetTop - touch.pageY;
			return p;
		}
		function calculateMoveBounds(){
			moveBounds = {};
			moveBounds[S.LEFT]=0;
			moveBounds[S.TOP]=0;
			moveBounds[S.RIGHT]=getImageWidth() - element.clientWidth;
			moveBounds[S.BOTTOM]=getImageHeight() - element.clientHeight;
		}
		function move(touch, startDistanceFromMiddleToFinger){
			var x = touch.pageX + startPositionFingerWithOffset[S.X];
			var y = touch.pageY + startPositionFingerWithOffset[S.Y];
			if(x>moveBounds[S.RIGHT])
				x=moveBounds[S.RIGHT];
			else
				if(x<moveBounds[S.LEFT])
					x = moveBounds[S.LEFT];
				
			if(y>moveBounds[S.BOTTOM])
				y=moveBounds[S.BOTTOM];
			else if (y<moveBounds[S.LEFT])
				y=moveBounds[S.LEFT];
			element.style.left=String(x)+'px';
			element.style.top=String(y)+'px';
		}
		function doNothing(){}
		function movedLeftHighFinger(touch, startDistanceFromMiddleToFinger){
			var proportionChange = getProportionChangeDistanceFromMiddle(touch, startDistanceFromMiddleToFinger, startMiddleFingers);
			leftDistanceFromMiddle = (proportionChange[S.X]*startDimensions[S.HALF_WIDTH]);
			if(leftDistanceFromMiddle <MIN_WIDTH_HEIGHT)leftDistanceFromMiddle= MIN_WIDTH_HEIGHT;
			topDistanceFromMiddle = (proportionChange[S.Y]*startDimensions[S.HALF_HEIGHT]);
			if(topDistanceFromMiddle <MIN_WIDTH_HEIGHT)topDistanceFromMiddle= MIN_WIDTH_HEIGHT;
			resize();
		}
		function movedLeftLowFinger(touch, startDistanceFromMiddleToFinger){
			var proportionChange = getProportionChangeDistanceFromMiddle(touch, startDistanceFromMiddleToFinger, startMiddleFingers);
			leftDistanceFromMiddle = (proportionChange[S.X]*startDimensions[S.HALF_WIDTH]);
			if(leftDistanceFromMiddle <MIN_WIDTH_HEIGHT)leftDistanceFromMiddle= MIN_WIDTH_HEIGHT;
			bottomDistanceFromMiddle = (proportionChange[S.Y]*startDimensions[S.HALF_HEIGHT]);
			if(bottomDistanceFromMiddle <MIN_WIDTH_HEIGHT)bottomDistanceFromMiddle= MIN_WIDTH_HEIGHT;
			resize();
		}
		function movedRightHighFinger(touch, startDistanceFromMiddleToFinger){
			var proportionChange = getProportionChangeDistanceFromMiddle(touch, startDistanceFromMiddleToFinger, startMiddleFingers);
			rightDistanceFromMiddle = (proportionChange[S.X]*startDimensions[S.HALF_WIDTH]);
			if(rightDistanceFromMiddle <MIN_WIDTH_HEIGHT)rightDistanceFromMiddle= MIN_WIDTH_HEIGHT;
			topDistanceFromMiddle = (proportionChange[S.Y]*startDimensions[S.HALF_HEIGHT]);
			if(topDistanceFromMiddle <MIN_WIDTH_HEIGHT)topDistanceFromMiddle= MIN_WIDTH_HEIGHT;
			resize();
		}
		function movedRightLowFinger(touch, startDistanceFromMiddleToFinger){
			var proportionChange = getProportionChangeDistanceFromMiddle(touch, startDistanceFromMiddleToFinger, startMiddleFingers);
			rightDistanceFromMiddle = (proportionChange[S.X]*startDimensions[S.HALF_WIDTH]);
			if(rightDistanceFromMiddle <MIN_WIDTH_HEIGHT)rightDistanceFromMiddle= MIN_WIDTH_HEIGHT;
			bottomDistanceFromMiddle= (proportionChange[S.Y]*startDimensions[S.HALF_HEIGHT]);
			if(bottomDistanceFromMiddle <MIN_WIDTH_HEIGHT)bottomDistanceFromMiddle= MIN_WIDTH_HEIGHT;
			resize();
		}
		function movedRightFingerHorizontalResize (touch, startDistanceFromMiddleToFinger){
			rightDistanceFromMiddle = (getProportionChangeDistanceFromMiddleHorizontal(touch, startDistanceFromMiddleToFinger, startMiddleFingers)
			*startDimensions[S.HALF_WIDTH]);
			if(rightDistanceFromMiddle <MIN_WIDTH_HEIGHT)rightDistanceFromMiddle= MIN_WIDTH_HEIGHT;
			resizeHorizontal();
		}
		function movedLeftFingerHorizontalResize(touch, startDistanceFromMiddleToFinger){
			leftDistanceFromMiddle = (getProportionChangeDistanceFromMiddleHorizontal(touch, startDistanceFromMiddleToFinger, startMiddleFingers)
			*startDimensions[S.HALF_WIDTH]);
			if(leftDistanceFromMiddle <MIN_WIDTH_HEIGHT)leftDistanceFromMiddle= MIN_WIDTH_HEIGHT;
			resizeHorizontal();
		}
		function movedTopFingerVerticalResize(touch, startDistanceFromMiddleToFinger){
			topDistanceFromMiddle = (getProportionChangeDistanceFromMiddleVertical(touch, startDistanceFromMiddleToFinger, startMiddleFingers)
			*startDimensions[S.HALF_HEIGHT]);
			if(topDistanceFromMiddle <MIN_WIDTH_HEIGHT)topDistanceFromMiddle= MIN_WIDTH_HEIGHT;
			resizeVertical();
		}
		function movedBottomFingerVerticalResize(touch, startDistanceFromMiddleToFinger){
			bottomDistanceFromMiddle = (getProportionChangeDistanceFromMiddleVertical(touch, startDistanceFromMiddleToFinger, startMiddleFingers)
			*startDimensions[S.HALF_HEIGHT]);
			if(bottomDistanceFromMiddle <MIN_WIDTH_HEIGHT)bottomDistanceFromMiddle= MIN_WIDTH_HEIGHT;
			resizeVertical();
		}
		function movedFixedAspectRatio(){
			var distance = getFingerDistance();
			var timesFingerDistance = distance/startFingerDistance;
			if(timesFingerDistance>maxTimesFingerDistance)
				timesFingerDistance=maxTimesFingerDistance;
			var newWidth = startDimensions[S.WIDTH]*timesFingerDistance;
			var newHeight = newWidth/aspectRatio;
			var dWidthOverTwo = (newWidth - startDimensions[S.WIDTH])/2;
			var dHeightOverTwo = dWidthOverTwo/aspectRatio;
			var left = startPosition[S.LEFT]-dWidthOverTwo;
			var top = startPosition[S.TOP] - dHeightOverTwo;
			if(left<0)
				left=0;
			else if(left+newWidth>imageWidth)
				left = imageWidth-newWidth;
			if(top<0)
				top=0;
			else if(top + newHeight>imageHeight)
				top = imageHeight - newHeight;
			element.style.width = String(newWidth)+'px';
			element.style.height=String(newHeight)+'px';
			element.style.left = String(left)+'px';
			element.style.top=String(top)+'px';
		}
		function resize(){
			resizeHorizontal();
			resizeVertical();
			
				
		}
		function resizeHorizontal(){
			var left = (startPosition[S.X] - leftDistanceFromMiddle);
			if(left<0)left=0;
			var right = rightDistanceFromMiddle + startPosition[S.X];
			if(right>imageWidth)right = imageWidth;
			element.style.left = String(left)+'px';
			element.style.width = String(right -left)+'px';
		}
		function resizeVertical(){
			var top = startPosition[S.Y] - topDistanceFromMiddle;
			if(top<0)top = 0;
			var bottom = bottomDistanceFromMiddle + startPosition[S.Y];
			if(bottom>imageHeight)bottom=imageHeight;
			element.style.top=String(top)+'px';
			element.style.height = String(bottom - top)+'px';
		}
		function getProportionChangeDistanceFromMiddle(touch, startDistanceFromMiddleToFinger, startMiddleFingers){
			var x = (touch.pageX - startMiddleFingers[S.X])/
			startDistanceFromMiddleToFinger[S.X];
			var y = (touch.pageY - startMiddleFingers[S.Y])/startDistanceFromMiddleToFinger[S.Y];
			var p={};
			p[S.X]=x;
			p[S.Y]=y;
			return p;
		}
		function getProportionChangeDistanceFromMiddleHorizontal(touch, startDistanceFromMiddleToFinger, startMiddleFinger){
			return (touch.pageX - startMiddleFingers[S.X])/
			startDistanceFromMiddleToFinger[S.X];
		}
		function getProportionChangeDistanceFromMiddleVertical(touch, startDistanceFromMiddleToFinger, startMiddleFinger){
			return (touch.pageY - startMiddleFingers[S.Y])/startDistanceFromMiddleToFinger[S.Y];
		}
		function getCropperDimensions(){
			return {width:element.clientWidth, halfWidth:element.clientWidth/2, height:element.clientHeight, halfHeight:element.clientHeight/2};
		}
		function getCropperPosition(){
			var p ={};
			p[S.LEFT]=element.offsetLeft;
			p[S.X]=element.offsetLeft+(element.clientWidth/2);
			p[S.TOP]=element.offsetTop;
			p[S.Y]=element.offsetTop+(element.clientHeight/2);
			return p;
		}
	};
	return _Cropper;
	function Corner(params){
		var self = this;
		var className = params[S.CLASS_NAME];
		var getConstraints = params[S.GET_CONSTRAINTS];
		var starting = params[S.STARTING];
		var setPosition = params[S.SET_POSITION];
		var topElseBottom = params[S.TOP_ELSE_BOTTOM];
		var leftElseRight = params[S.LEFT_ELSE_RIGHT];
		this[S.GET_X] = params[S.GET_X];
		this[S.GET_Y] = params[S.GET_Y];
		var element = E.DIV();
		element.classList.add('corner');
		if(className)
		element.classList.add(className);
		this[S.GET_ELEMENT] = function(){return element;};
		this[S.GET_CONSTRAINTS] = function(){
			var constraints = getConstraints(topElseBottom, leftElseRight);
			return constraints;
		};
		this[S.SET_POSITION] = setPosition;
		this[S.SET_VISIBLE] = function(value){
			if(value)
				element.classList.add('visible');
			else element.classList.remove('visible');
		};
		this[S.GET_ELEMENT] = function(){return element;};
		this[S.GET_POSITION]= function(){
			return getAbsolute(element);
		}
		var p={};
		p[S.HANDLE]=self;
		p[S.STOP_PROPAGATION]=true;
		var dragManager = new DragManager(p);
		dragManager[S.ON_START] = starting;
	}
})();