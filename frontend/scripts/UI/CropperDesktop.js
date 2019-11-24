var CropperDesktop = (function(){
	var _Cropper=function(params){
		var self = this;
		var getImageWidth= params[S.GET_IMAGE_WIDTH];
		var getImageHeight = params[S.GET_IMAGE_HEIGHT];
		var aspectRatio = params[S.ASPECT_RATIO];
		var corners=[];
		var startDimenions,startPosition;
		var minWidth = 50;
		var minHeight = 50;
		var startDimensions;
		var element = E.DIV();
		element.classList.add('cropper');
		var middleCorners=[]
		each([true, false], function(topElseBottom){
			var className = 'corner-'+(topElseBottom?'top':'bottom');
			var p={};
			p[S.CLASS_NAME]=className;
			p[S.TOP_ELSE_BOTTOM]=topElseBottom;
			p[S.TOP_ELSE_RIGHT]=undefined;
			p[S.STARTING]=starting;
			p[S.GET_CONSTRAINTS]=getResizeConstraints;
			p[S.SET_POSITION]=createSetPosition(topElseBottom, undefined);
			p[S.GET_X]=zero;
			p[S.GET_Y]=topElseBottom?getTop:getBottom;
			var corner = new Corner(p);
			corners.push(corner);
			middleCorners.push(corner);
			element.appendChild(corner[S.GET_ELEMENT]());
			each([true, false], function(leftElseRight){
				className = 'corner-'+(topElseBottom?'top':'bottom')+'-'+(leftElseRight?'left':'right');
				var p={};
				p[S.CLASS_NAME]=className;
				p[S.TOP_ELSE_BOTTOM]=topElseBottom;
				p[S.LEFT_ELSE_RIGHT]=leftElseRight;
				p[S.STARTING]=starting;
				p[S.GET_CONSTRAINTS]=getResizeConstraints;
				p[S.SET_POSITION]=createSetPosition(topElseBottom, leftElseRight);
				p[S.GET_X]=leftElseRight?getLeft:getRight; 
				p[S.GET_Y]=topElseBottom?getTop:getBottom;
				corner = new Corner(p);
				corners.push(corner);
				element.appendChild(corner[S.GET_ELEMENT]());
			});
		});
		each([true, false], function(leftElseRight){
			var className = 'corner-'+(leftElseRight?'left':'right');
			var p={};
			p[S.CLASS_NAME]=className;
			p[S.TOP_ELSE_BOTTOM]=undefined;
			p[S.LEFT_ELSE_RIGHT]=leftElseRight;
			p[S.STARTING]=starting;
			p[S.GET_CONSTRAINTS]=getResizeConstraints;
			p[S.SET_POSITION]=createSetPosition(undefined,leftElseRight);
			p[S.GET_X]=leftElseRight?getLeft:getRight;
			p[S.GET_Y]=zero;
			var corner = new Corner(p);
			corners.push(corner);
			middleCorners.push(corner);
			element.appendChild(corner[S.GET_ELEMENT]());
		});
		this[S.SET_ASPECT_RATIO]=setAspectRatio;
		function setAspectRatio(value){
			if(value)
				element.classList.add('aspect-constrained');
			else
				element.classList.remove('aspect-constrained');
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
			setMiddleCornersVisible(aspectRatio?false:true);
		};
		this[S.GET_ELEMENT] = function(){return element;};
		this[S.GET_CONSTRAINTS]= getMoveConstraints;
		this[S.GET_POSITION] = function(e){
			var p ={};
			p[S.LEFT]=element.offsetLeft;
			p[S.TOP]=element.offsetTop;//{left:absolute.left+(getWidth()/2), top:absolute.top+(getHeight()/2)};
			return p;
		};
		this[S.GET_ABSOLUTE_POSITION]=function(e){
			var p={};
			p[S.LEFT]=e.pageX;
			p[S.TOP]=e.pageY;
			return p;
		};
		this[S.GET_DIMENSIONS] = function(){
			var p = {};
			p[S.WIDTH]=element.offsetWidth;
			p[S.HEIGHT]=element.offsetHeight;
			return p;
		};
		this[S.GET_X] = function(){
			return getLeft()+(getWidth()/2);
		};
		this[S.GET_Y] = function(){
			return getTop()+(getHeight()/2);
		};
		this[S.SET_POSITION] = function(p){
			element.style.left=String(p[S.X] - (getWidth()/2))+'px';
			element.style.top=String(p[S.Y] - (getHeight()/ 2))+'px';
		};
		var p={};
		p[S.HANDLE]=self;
		var dragManager = new DragManager(p);
		dragManager[S.ON_START] = function(){
			
		};
		dragManager[S.ON_MOVE]= function(){
			
		};
		function setMiddleCornersVisible(value){
			each(middleCorners, function(middleCorner){
				middleCorner[S.SET_VISIBLE](value);
			});
		}
		function getMoveConstraints(){
			var cropperWidth = getWidth();
			var cropperHeight = getHeight();
			var halfWidth = cropperWidth/2;
			var halfHeight = cropperHeight/2;
			var minX = halfWidth;
			var minY = halfHeight;
			
			var maxX = getImageWidth()- halfWidth;
			var maxY = getImageHeight() - halfHeight;
			var p = {};
			p[S.MIN_X]=minX;
			p[S.MIN_Y]=minY;
			p[S.MAX_X]=maxX;
			p[S.MAX_Y]=maxY;
			return p;
		}
		function zero(){
			return 0;
		}
		function starting(){
			var width = element.offsetWidth;
			var height = element.offsetHeight;
			var p={};
			p[S.WIDTH]=width;
			p[S.HEIGHT]=height;
			startDimensions = p;
			var left = element.offsetLeft;
			var top = element.offsetTop;
			var p={};
			p[S.LEFT]=left;
			p[S.TOP]=top;
			startPosition = p;
		}
		function createSetPosition(topElseBottom, leftElseRight){
			var vertical;
			if(topElseBottom!=undefined){
				vertical = (function(setVertical){ return function(p){setVertical(p[S.Y]);};})(
				topElseBottom?setTop:setBottom);
			}
			var horizontal;
			if(leftElseRight!=undefined){
				horizontal = (function(setHorizontal){ return function(p){setHorizontal(p[S.X]);};})(
				leftElseRight?setLeft:setRight);
			}
			var setPosition;
			if(vertical)
			{
				if(!horizontal)
					setPosition = vertical;
				else
					setPosition = (function(vertical, horizontal){ return function(p){ 
				vertical(p); horizontal(p);};})(vertical, horizontal);
			}
			else
				setPosition = horizontal;
			if(aspectRatio)
				return createAspectRatioFixer(setPosition, leftElseRight,topElseBottom);
			return setPosition;
		}
		function createAspectRatioFixer(setPosition, leftElseRight, topElseBottom){
			return (function(setPosition){
				if(leftElseRight&&!topElseBottom)
					return function(p){
						var averageDistanceFromStart = ((p[S.X]-startPosition[S.LEFT])+((startPosition[S.TOP]+startDimensions[S.HEIGHT]-p[S.Y])
						*aspectRatio))/2;
						var newWidth = startDimensions[S.WIDTH] - averageDistanceFromStart;
						var newHeight = newWidth / aspectRatio;
						var p={};
						p[S.X]=averageDistanceFromStart +startPosition[S.LEFT];
						p[S.Y]=(newHeight +startPosition[S.TOP]);
						setPosition(p);
					};
				if(!leftElseRight&&topElseBottom)
					return function(p){
						var averageDistanceFromStart = ((startPosition[S.LEFT]+startDimensions[S.WIDTH]-p[S.X])+((p[S.Y]-startPosition[S.TOP])*aspectRatio))/2;
						var newHeight = startDimensions[S.HEIGHT] - averageDistanceFromStart;
						var newWidth = newHeight * aspectRatio;
						var p={};
						p[S.X]=startPosition[S.LEFT] + newWidth;
						p[S.Y]=averageDistanceFromStart + startPosition[S.TOP];
						setPosition(p);
					};
				return function(p){
					var z = ((p[S.X] - startPosition[S.LEFT])+((p[S.Y]-startPosition[S.TOP])*aspectRatio))/2;
					var p={};
					p[S.X]=startPosition[S.LEFT] + z;
					p[S.Y]=(startPosition[S.TOP]+z)/aspectRatio;
					setPosition(p);
				};
			})(setPosition);
		}
		function getLeft(){
			return element.offsetLeft;
		}
		function getRight(){
			return getLeft()+getWidth();
		}
		function getTop(){
			return element.offsetTop;
		}
		function getBottom(){
			return getTop()+getHeight();
		}
		function getWidth(){
			return element.offsetWidth;
		}
		function getHeight(){
			return element.offsetHeight;
		}
		function setLeft(x){
			element.style.left=String(x)+'px';
			element.style.width = String(startDimensions[S.WIDTH] + startPosition[S.LEFT] - x)+'px';
		}
		function setRight(x){
			element.style.width = String(x - startPosition[S.LEFT])+'px';
		}
		function setTop(y){
			element.style.top=String(y)+'px';
			element.style.height = String(startDimensions[S.HEIGHT] +  startPosition[S.TOP] - y)+'px';
		}
		function setBottom(y){
			element.style.height = String(y - startPosition[S.TOP])+'px';
		}
		function getResizeConstraints(topElseBottom, leftElseRight){
			if(!aspectRatio){
				if(leftElseRight){
					if(topElseBottom)
					{
						var p ={};
						p[S.MIN_X]=0;
						p[S.MAX_X]=getRight();
						p[S.MIN_Y]=0; 
						p[S.MAX_Y]=getBottom();
						return p;
					}
					var p={};
					p[S.MIN_X]=0;
					p[S.MAX_X]=getRight();
					p[S.MIN_Y]=getTop();
					p[S.MAX_Y]=getImageHeight();
					return p;
				}
				if(topElseBottom)
				{
					var p={};
					p[S.MIN_X]=getLeft();
					p[S.MAX_X]=getImageWidth();
					p[S.MIN_Y]=0;
					p[S.MAX_Y]=getBottom();
					return p;
				}
				var p={};
				p[S.MIN_X]=getLeft();
				p[S.MAX_X]=getImageWidth();
				p[S.MIN_Y]=getTop();
				p[S.MAX_Y]=getImageHeight();
				return p;
			}
			var maxDistanceX,maxDistanceY,maxNegativeDistanceX,maxNegativeDistanceY,maxX,maxY,minX,minY;
			if(leftElseRight){
					maxNegativeDistanceX = getLeft();
					maxDistanceX = getRight()-(getLeft()+ minWidth);
				if(topElseBottom){
					maxDistanceY = getBottom()-(getTop()+minHeight);
					maxNegativeDistanceY = getTop();
					var maxDistanceYTimesAspectRatio=(maxDistanceY*aspectRatio);
					var maxNegativeDistanceYTimesAspectRatio= maxNegativeDistanceY*aspectRatio;
					if(maxDistanceX>maxDistanceYTimesAspectRatio)
						maxDistanceX = maxDistanceYTimesAspectRatio;
					else{
						maxDistanceY = maxDistanceX/aspectRatio;
					}
					if(maxNegativeDistanceX>maxNegativeDistanceYTimesAspectRatio)
						maxNegativeDistanceX = maxNegativeDistanceYTimesAspectRatio;
					else{
						maxNegativeDistanceY = maxNegativeDistanceX/aspectRatio;
					}
					maxY = maxDistanceY + getTop();
					minY = getTop() - maxNegativeDistanceY;
				}
				else
				{
					maxDistanceY = getImageHeight()-getBottom();
					maxNegativeDistanceY = getBottom() - (getTop() +minHeight);
					var maxDistanceYTimesAspectRatio=maxDistanceY*aspectRatio;
					var maxNegativeDistanceYTimesAspectRatio= maxNegativeDistanceY*aspectRatio;
					if(maxDistanceX>maxNegativeDistanceYTimesAspectRatio)
						maxDistanceX = maxNegativeDistanceYTimesAspectRatio;
					else{
						maxNegativeDistanceY = maxDistanceX/aspectRatio;
					}
					if(maxNegativeDistanceX>maxDistanceYTimesAspectRatio)
						maxNegativeDistanceX = maxDistanceYTimesAspectRatio;
					else{
						maxDistanceY = maxNegativeDistanceX/aspectRatio;
					}
					maxY = maxDistanceY + getBottom();
					minY = getBottom() - maxNegativeDistanceY;
					
				}
				maxX = maxDistanceX+ getLeft();
				minX = getLeft() - maxNegativeDistanceX;
			}
			else
			{
				maxDistanceX = getImageWidth()-getRight();
				maxNegativeDistanceX = getRight() - (getLeft() + minWidth);
				if(topElseBottom){
					maxDistanceY = getBottom()-(getTop()+minHeight);
					maxNegativeDistanceY = getTop();
					var maxDistanceYTimesAspectRatio=(maxDistanceY*aspectRatio);
					var maxNegativeDistanceYTimesAspectRatio= maxNegativeDistanceY*aspectRatio;
					if(maxDistanceX>maxNegativeDistanceYTimesAspectRatio)
						maxDistanceX = maxNegativeDistanceYTimesAspectRatio;
					else{
						maxNegativeDistanceY = maxDistanceX/aspectRatio;
					}
					if(maxNegativeDistanceX>maxDistanceYTimesAspectRatio)
						maxNegativeDistanceX = maxDistanceYTimesAspectRatio;
					else{
						maxDistanceY = maxNegativeDistanceX/aspectRatio;
					}
					maxY = maxDistanceY + getTop();
					minY = getTop() - maxNegativeDistanceY;
				}
				else
				{
					maxDistanceY = getImageHeight()- getBottom();
					maxNegativeDistanceY = getBottom() - (getTop()+minHeight);
					var maxDistanceYTimesAspectRatio=(maxDistanceY*aspectRatio);
					var maxNegativeDistanceYTimesAspectRatio= maxNegativeDistanceY*aspectRatio;
					if(maxDistanceX>maxDistanceYTimesAspectRatio)
						maxDistanceX = maxDistanceYTimesAspectRatio;
					else{
						maxDistanceY = maxDistanceX/aspectRatio;
					}
					if(maxNegativeDistanceX>maxNegativeDistanceYTimesAspectRatio)
						maxNegativeDistanceX = maxNegativeDistanceYTimesAspectRatio;
					else{
						maxNegativeDistanceY = maxNegativeDistanceX/aspectRatio;
					}
					maxY = maxDistanceY + getBottom();
					minY = getBottom() - maxNegativeDistanceY;
				}
				maxX = maxDistanceX+ getRight();
				minX = getRight() - maxNegativeDistanceX;
			}
			var p={};
			p[S.MIN_X]=minX;
			p[S.MIN_Y]=minY;
			p[S.MAX_X]=maxX;
			p[S.MAX_Y]=maxY;
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
			if(value)element.classList.add('visible');
			else element.classList.remove('visible');
		};
		this[S.GET_ABSOLUTE_POSITION]= function(){
			return getAbsolute(element);
		}
		var p = {};
		p[S.HANDLE]=self;
		p[S.STOP_PROPAGATION]=true;
		var dragManager = new DragManager(p);
		dragManager[S.ON_START] = starting;
	}
})();