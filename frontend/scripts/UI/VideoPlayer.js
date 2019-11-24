var VideoPlayer = window['VideoPlayer']=function(params){
	var element = E.VIDEO();
	element.classList.add('video-player');
	element.loop = true;
	var src, visible;
	var model = params[S.MODEL];
	var propertyNameSrc = params[S.PROPERTY_NAME_SRC];
	var propertyNameVisible = params[S.PROPERTY_NAME_VISIBLE];
	var propertyBindingSrc = PropertyBinding[S.STANDARD](this, model, propertyNameSrc, srcChanged);
	var propertyBindingVisible = PropertyBinding[S.STANDARD](this, model, propertyNameVisible, visibleChanged);
	this[S.GET_ELEMENT]=function(){
		return element;
	};
	function srcChanged(value){
		src = value;
		element.src=value;
		updatePlaying();
	}
	function visibleChanged(value){
		visible = value;
		if(value)element.classList.add('visible');
		else element.classList.remove('visible');
		updatePlaying();
	}
	function updatePlaying(){
		if(!src||!visible)
		{element.pause();return;}
		element.play();
	}
};