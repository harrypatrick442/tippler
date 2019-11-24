var ImageControl  = window['ImageControl']=(function(){
	var _mapNameToRect;
	var images=[];
	var imagesLoaded=false;
	beginLoadingImages();
	var waitingForSpriteSheetsToLoad=[];
	var _Image = function(params){
		EventEnabledBuilder(this);
		var self = this;
		var name = params[S.NAME];
		var semantic = params[S.SEMANTIC];
		var hoverOverridden=params[S.HOVER_OVERRIDDEN];
		var nameHover=params[S.NAME_HOVER];
		var semanticHover = params[S.SEMANTIC_HOVER];
		var className = params[S.CLASS_NAME];
		var classNames = params[S.CLASS_NAMES];
		var functionNameClick=params[S.FUNCTION_NAME_CLICK];
		var preventPropagation = params[S.PREVENT_PROPAGATION];
		var src = params[S.SRC];
		var propertyNameSrc = params[S.PROPERTY_NAME_SRC];
		var propertyNameVisible = params[S.PROPERTY_NAME_VISIBLE];
		var model = params[S.MODEL];
		var DIDNT_MAP=' did not map to anything. Check the SemanticsMap in the strings folder';
		if(semantic&&!name){
			name = SemanticsMap[semantic];
			console.log(semantic);
			console.log(SemanticsMap);
			if(!name)throwSemanticError(semantic);
			if(semanticHover){
				nameHover = SemanticsMap[semanticHover];
				if(!nameHover)throwSemanticError(semanticHover);
			}
		}
		var useCssName=name||semantic||src||propertyNameSrc?false:true;
		var element = E.DIV();
		if(functionNameClick){
			element.addEventListener('click', click);
		}
		var hovering=false;
		var _img;
		if(classNames)
			each(classNames, function(className){
				element.classList.add(className);
			});
		if(className)
			element.classList.add(className);
		element.classList.add('image');
		element.style.overflow='hidden';
		if(hoverOverridden)
			this[S.SET_HOVERING]=setHovering;
		else{
			element.addEventListener('mouseenter', mouseEnter);
			element.addEventListener('mouseleave', mouseLeave);
		}
		if(propertyNameVisible){
			PropertyBinding[S.STANDARD](this, model, propertyNameVisible, visibleChanged);
		}
		this[S.SET_NAME]=function(value){
			name=value;
			update();
		};
		this[S.SET_SEMANTIC]=function(value){
			name = SemanticsMap[value];	
			update();
		};
		this[S.UPDATE]=update;
		this[S.GET_ELEMENT]=function(){
			return element;
		};
		this[S.GET_IMG]=function(){
			return _img;
		}
		this[S.DISPOSE]=function(){
			
		};
		if(propertyNameSrc)
		{
			element.appendChild(getImg());
			PropertyBinding[S.STANDARD](this, model, propertyNameSrc, srcChanged);
		}
		else{
			if(src){
				element.appendChild(getImg());
				srcChanged(src);
			}else{
				if(useCssName)
					updateFromStylesheet();
				else
					onceGotName();
			}
		}
		function visibleChanged(value){
			if(value)element.classList.add('visible');
			else element.classList.remove('visible');
		}
		function srcChanged(value){
			getImg().src=value;
		}
		function throwSemanticError(semantic){
			throw new Error('Semantic '+semantic+DIDNT_MAP);
		}
		function getImg(){
			if(!_img)
			{
				_img = E.IMG();
				_img.style.border='0';
				_img.style.position='relative';
				element.appendChild(_img);
			}
			return _img;
		}
		function mouseEnter(){
			setHovering(true);
		}
		function mouseLeave(){
			setHovering(false);
		}
		function setHovering(value){
			hovering = value;
			update();
		}
		function click(e){
			if(preventPropagation){
				e = e || window.event;
				e.stopPropagation();
			}
			if(functionNameClick){
				model[functionNameClick]();
			}
			dispatchClick();
		}
		function dispatchClick(){
			var p = {};
			p[S.TYPE]= S.CLICK;
	        self[S.DISPATCH_EVENT](p);
		}
		function updateFromStylesheet(){
			setTimeout(function(){
				name = getSpritesheetImageNameFromElementCss(element);
				if(!name)throw new Error('No --spritesheet-image-name supplied in stylesheet');
				onceGotName();
			}, 0);
		}
		function onceGotName(){
			if(imagesLoaded){
				setImage();
			}
			else{
				if(waitingForSpriteSheetsToLoad.indexOf(self)>=0)return;
				self.create = setImage;
				waitingForSpriteSheetsToLoad.push(self);
			}
		}
		function update(){
			if(useCssName)
				updateFromStylesheet();
			else{
				if(propertyNameSrc||src)return;
				onceGotName();
			}
		}
		function setImage(){
			var n = hovering?nameHover:name;
			if(!n)throw new Error('Image name "'+n+'" is not contained in the spritesheet');
			var rect = getMapNameToRect()[n];
			var img = getImg();
			img.style.width = rect.width;
			img.style.height = rect.height;
			img.style.left = rect.left;
			img.style.top=rect.top;
			img.src = rect['image']['src'];	
		}
	};
	function getMapNameToRect(){
		if(!_mapNameToRect){
			_mapNameToRect={};
			var nImage=0;
			each(Spritesheets, function(spritesheet){
				for(var key in spritesheet){
					var rect = spritesheet[key];
					rect['image'] = images[nImage];
					_mapNameToRect[key]=calculatePercentagesRect(rect);
				}
				nImage++;
			});
		}
		return _mapNameToRect;
	}
	_Image[S.GET_SPRITESHEET_IMAGE_NAME_FROM_ELEMENT_CSS]=getSpritesheetImageNameFromElementCss;
	return _Image;
	function calculatePercentagesRect(rect){
		var width = rect['width'];
		var height=rect['height'];
		var x = rect['x'];
		var y = rect['y'];
		var spritesheetImage = rect['image'];
		var proportionWidth = width / spritesheetImage['width'];
		var proportionHeight = height/spritesheetImage['height'];
		var percentX = 100*x/spritesheetImage['width'];
		var percentY = 100*y/spritesheetImage['height'];
		return {
			width:String(100/proportionWidth)+'%',
			height:String(100/proportionHeight)+'%',
			left:String(-(percentX/proportionWidth))+'%',
			top:String(-(percentY/proportionHeight))+'%',
			image:rect['image']
		};
	}
	function beginLoadingImages(){
		var spritesheetUrls=window['spritesheetUrls'];
		ImagePreloader['preloadRange'](spritesheetUrls, function(){
			each(spritesheetUrls, function(spritesheetUrl){
				images.push(ImagePreloader['getImgFromUrl'](spritesheetUrl));
			});
			imagesLoaded=true;
			createWaitingImages();
		});
	}
	function createWaitingImages(){
		each(waitingForSpriteSheetsToLoad, function(waiting){
			waiting.create();
		});
	}
	function getSpritesheetImageNameFromElementCss(element){
		var imageName =  getComputedStyle(element).getPropertyValue('--spritesheet-image-name');
		return imageName;
	}
})();