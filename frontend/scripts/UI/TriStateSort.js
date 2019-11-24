function TriStateSort(params) {
    var self = this;
    var classNames = params[S.CLASS_NAMES];
	var className = params[S.CLASS_NAME];
	var imageSemanticTrue = params[S.IMAGE_SEMANTIC_TRUE];
	var imageSemanticFalse = params[S.IMAGE_SEMANTIC_FALSE];
	var imageSemanticNone = params[S.IMAGE_SEMANTIC_NONE];
	var imageSemanticTrueHover = params[S.IMAGE_SEMANTIC_TRUE_HOVER];
	var imageSemanticFalseHover = params[S.IMAGE_SEMANTIC_FALSE_HOVER];
	var imageSemanticNoneHover = params[S.IMAGE_SEMANTIC_NONE_HOVER];
	var propertyName = params[S.PROPERTY_NAME];
	var model = params[S.MODEL];
	var text = params[S.TEXT];
	var propertyNameText = params[S.PROPERTY_NAME_TEXT];
	var state;
	var hovering = false;
	var element = E.DIV();
	element.classList.add('tri-state-sort');
	var controlsCollection = new ControlsCollection();
	if(text||propertyNameText){
		p={};
		p[S.TEXT]=text;
		p[S.PROPERTY_NAME]=propertyNameText;
		p[S.MODEL]=model;
		var textBlock = new TextBlock(p);
		element.appendChild(textBlock[S.GET_ELEMENT]());
		controlsCollection[S.ADD](textBlock);
	}
	var p={};
	p[S.MODEL]=model;
	p[S.SEMANTIC]=imageSemanticNone;
	p[S.HOVER_OVERRIDDEN]=true;
	var imageControl = new ImageControl(p);
	controlsCollection[S.ADD](imageControl);
	var imageElement = imageControl[S.GET_ELEMENT]();
	element.appendChild(imageElement);
	element.addEventListener('mouseenter', function(){setHover(true);});
	element.addEventListener('mouseleave', function(){setHover(false);});
	element.addEventListener('mousedown', click);
	function setHover(value){
		hovering = value;
		updateImage();
	}
	var propertyBinding = PropertyBinding[S.STANDARD](this, model, propertyName, changed);
	this[S.GET_ELEMENT]=function(){return element;};
	function changed(value){
		state = value;
		updateImage();
	}
	function updateImage(){
		if(state===true){
			imageControl[S.SET_SEMANTIC](hovering&&imageSemanticTrueHover?imageSemanticTrueHover:imageSemanticTrue);
			return;
		}
		if(state===false){
			imageControl[S.SET_SEMANTIC](hovering&&imageSemanticFalseHover?imageSemanticFalseHover:imageSemanticFalse);
			return;
		}
		imageControl[S.SET_SEMANTIC](hovering&&imageSemanticNoneHover?imageSemanticNoneHover:imageSemanticNone);
	}
	function click(){
		state = typeof(state)==='boolean'?!state:false;
		propertyBinding[S.SET](state);
	}
}