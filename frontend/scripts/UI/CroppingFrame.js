var CroppingFrame = new (function () {
	var _CroppingFrame=function(params){
		EventEnabledBuilder(this);
		var self = this;
		var propertyNameAspectRatio = params[S.PROPERTY_NAME_ASPECT_RATIO];
		var propertyNameVisible = params[S.PROPERTY_NAME_VISIBLE];
		var propertyNameImageUrl = params[S.PROPERTY_NAME_IMAGE_URL];
		var model = params[S.MODEL];
		var element = E.DIV();
		element.classList.add('cropping-frame');
		var imageWidthRaw;
		var imageHeightRaw;
		var imageAspectRatio;
		var img;
		var imgWrapper = E.DIV();
		imgWrapper.classList.add('img-wrapper');
		var propertyBindingAspectRatio = PropertyBinding[S.STANDARD](this, model, propertyNameAspectRatio, aspectRatioChanged, true);
		var p = {};
		p[S.GET_IMAGE_WIDTH]=getImageWidth;
		p[S.GET_IMAGE_HEIGHT]=getImageHeight;
		p[S.ASPECT_RATIO]=propertyBindingAspectRatio[S.GET]();
		var cropper = new (window.isMobile?CropperMobile:CropperDesktop)(p);
		imgWrapper.appendChild(cropper[S.GET_ELEMENT]());
		element.appendChild(imgWrapper);
		var propertyBindingVisible = PropertyBinding[S.STANDARD](this, model, propertyNameVisible, visibleChanged);
		var propertyBindingImageUrl = PropertyBinding[S.STANDARD](this, model, propertyNameImageUrl, imageUrlChanged, true);
		aspectRatioChanged(propertyBindingAspectRatio[S.GET]());
		this[S.GET_ELEMENT] = function(){return element;};
		this[S.DISPOSE]=function(){
			self[S.MY_BINDINGS]&&self[S.MY_BINDINGS][S.DISPOSE]();
		};
		this[S.GET_CROPPED_IMAGE] = function(params){
			var quality= params[S.QUALITY];
			var format = params[S.FORMAT];
			var position = cropper[S.GET_POSITION]();
			var left = position[S.LEFT];
			var top = position[S.TOP];
			var dimensions = cropper[S.GET_DIMENSIONS]();
			var aspectRatio= params[S.ASPECT_RATIO];
			var desiredWidth = params[S.DESIRED_WIDTH];
			var width = dimensions[S.WIDTH];
			var height = dimensions[S.HEIGHT];
			var format =	format?format:"image/jpeg";
			var quality = quality?quality:1;
			var dataUrl = ImageProcessing[S.CROP]({
				[S.IMG]:img, [S.IMAGE_WIDTH_RAW]:imageWidthRaw, [S.IMAGE_HEIGHT_RAW]:imageHeightRaw, [S.CROPPER_WIDTH]:width, [S.CROPPER_HEIGHT]:height, 
			[S.CROPPER_LEFT]:left, [S.CROPPER_TOP]:top, [S.FORMAT]:format, [S.QUALITY]:quality, [S.DESIRED_WIDTH]:desiredWidth, [S.ASPECT_RATIO]:aspectRatio});
			return dataUrl;
		};
		function getImageWidth(){
			return imgWrapper.getBoundingClientRect().width;
		}
		function getImageHeight(){
			return imgWrapper.getBoundingClientRect().height;
		}
		function load(url){
			clear();
			if(!url)return;
			img = E.IMG();
			img.onload = function() {
				imageWidthRaw = this.width;
				imageHeightRaw = this.height;
				imageAspectRatio = imageWidthRaw/imageHeightRaw;
				propertyBindingVisible[S.SET](true);
				sizeImage();
				imgWrapper.appendChild(img);
				cropper[S.POSITION_DEFAULT](img.clientWidth, img.clientHeight);
			};
			img.onerror=error;
			img.src = url;
		}
		function clear(){
			if(img)
			{
				imgWrapper.removeChild(img);
			}
			img=undefined;
		}
		function error(e){
			dispatchError(e);
		}
		function dispatchError(error){
			var p ={};
			p[S.TYPE]= S.ERROR;
			p[S.ERROR]=error;
			self.dispatchEvent(p);
		}
		function sizeImage(){
			var croppingFrameAspectRatio = getCroppingFrameAspectRatio();
			if(croppingFrameAspectRatio>imageAspectRatio) sizeImageConstrainedByHeight();
			else sizeImageConstrainedByWidth(croppingFrameAspectRatio);
		}
		function sizeImageConstrainedByHeight(){
			var height = getCroppingFrameHeight();
			var width = imageAspectRatio * height;
			setImageWidthHeight(width, height);	
		}
		function sizeImageConstrainedByWidth(){
			var width = getCroppingFrameWidth();
			var height = width / imageAspectRatio;
			setImageWidthHeight(width, height);	
		}
		function setImageWidthHeight(width, height){
			imgWrapper.style.width = String(width)+'px';
			imgWrapper.style.height = String(height)+'px';
			var croppingFrameWidth = getCroppingFrameWidth();
			var croppingFrameHeight = getCroppingFrameHeight();
			var verticalMargin = (croppingFrameHeight-height)/2;
			var horizontalMargin = (croppingFrameWidth-width)/2;
			imgWrapper.style.marginTop=String(verticalMargin)+'px';
			imgWrapper.style.marginLeft=String(horizontalMargin)+'px';
		}
		function getCroppingFrameAspectRatio(){return element.clientWidth/element.clientHeight;}
		function getCroppingFrameHeight(){return element.clientHeight;}
		function getCroppingFrameWidth(){return element.clientWidth;}
		function aspectRatioChanged(value){
			cropper[S.SET_ASPECT_RATIO](value);
		}
		function visibleChanged(value){
			if(value)element.classList.add('visible');
			else element.classList.remove('visible');
		}
		function imageUrlChanged(value){
			load(value);
		}
	};
	return _CroppingFrame;
})();