var Tickbox = window['Tickbox']=(function(){
	var TICKED='ticked';
	var _Tickbox = function(params){
		EventEnabledBuilder(this);
		var self = this;
        var className = params[S.CLASS_NAME];
        var classNames = params[S.CLASS_NAMES];
		var model = params[S.MODEL];
		var propertyName = params[S.PROPERTY_NAME];
		var changed = params[S.CHANGED];
		var text = params[S.TEXT];
		var imageSemantic=params[S.IMAGE_SEMANTIC];
		var readOnly = params[S.READ_ONLY];
		var propertyNameReadOnly = params[S.PROPERTY_NAME_READ_ONLY];
		var imageSemanticTicked, imageSemanticHover, imageSemanticTickedHover;
		if(imageSemantic){
			imageSemanticTicked=params[S.IMAGE_SEMANTIC_TICKED];
			imageSemanticHover = params[S.IMAGE_SEMANTIC_HOVER];
			imageSemanticTickedHover = params[S.IMAGE_SEMANTIC_TICKED_HOVER];
			
		}
		var element = E.DIV();
		element.classList.add('tickbox');
        if (className)
            element.classList.add(className);
        if (classNames) each(classNames, function (className) {
            element.classList.add(className);
        });
		var p={};
		p[S.CLASS_NAMES]=['box'];
		p[S.SEMANTIC]=imageSemantic;
		if(imageSemantic)
			p[S.HOVER_OVERRIDDEN]=true;
		var box = new ImageControl(p);
		var boxElement = box[S.GET_ELEMENT]();
		if(text){
			var textElement = E.DIV();
			textElement.classList.add('text');
			element.appendChild(textElement);
			textElement.innerHTML=text;
		}
		element.appendChild(boxElement);
		var ticked, hovering=false;
		var propertyBinding;
		//console.log('propertyName was');
		//console.log(propertyName);
		if(propertyName)
			propertyBinding = PropertyBinding[S.STANDARD](this, model, propertyName, tickedChanged);
		var propertyBindingReadOnly;
		if(readOnly){
			readOnlyChanged(true);
		}else
		if(propertyNameReadOnly)
			propertyBindingReadOnly = PropertyBinding[S.STANDARD](this, model, propertyNameReadOnly, readOnlyChanged);
		this[S.GET_ELEMENT] = function(){return element;};
		this[S.GET_BOX_ELEMENT]=function(){
			return boxElement;
		};
		this[S.GET_TICKED]=function(){return ticked;};
		this[S.DISPOSE]=function(){
			self[S.MY_BINDINGS]&&self[S.MY_BINDINGS][S.DISPOSE]();
		};
		this[S.SET_READ_ONLY]=function(value){
			if(propertyBindingReadOnly)
				propertyBindingReadOnly[S.SET](value);
			else
				readOnlyChanged(value);
		};
		this[S.SET]=function(value){
			if(propertyBinding)propertyBinding[S.SET](value);
			else{
				ticked = value;
				updateUI();
			}
		};
		element.addEventListener('click', toggle);
		if(imageSemantic){
			element.addEventListener('mouseenter', mouseEnter);
			element.addEventListener('mouseleave', mouseLeave);
		}
		function mouseEnter(e){
			if(readOnly)return;
			hovering=true;
			updateImage();
		}
		function mouseLeave(e){
			if(readOnly)return;
			hovering = false;
			updateImage();
		}
		function toggle(){
			if(readOnly)return;
			if(propertyBinding)	propertyBinding.set(!propertyBinding['get']());
			else tickedChanged(!ticked);
		}
		function tickedChanged(value){
			ticked=value;
			updateUI();
			dispatchChanged(value);
			if(!changed)return;
			var p={};
			p[S.TICKBOX]=self;
			p[S.TICKED]=ticked;
			changed(p);			
		}
		function updateUI(){
			if(ticked){
				if(!boxElement.classList.contains(TICKED))
					boxElement.classList.add(TICKED);
			}else{
				if(boxElement.classList.contains(TICKED))
					boxElement.classList.remove(TICKED);
			}
			updateImage();
		}
		function getImageSemantic(){
			if(ticked){	
				if(hovering)
				{
					if(imageSemanticTickedHover)return imageSemanticTickedHover;
					return imageSemanticHover;
				}
				if(imageSemanticTicked)return imageSemanticTicked;
			}
			else if(hovering&&imageSemanticHover){
				return imageSemanticHover;
			}
			return imageSemantic;
		}
		function updateImage(){
			box[S.SET_SEMANTIC](getImageSemantic());
		}
		function dispatchChanged(value){
			//console.log(value);
			//console.log({[S.TYPE]:S.CHANGED, [S.TICKED]:value});
			self.dispatchEvent({[S.TYPE]:S.CHANGED, [S.TICKED]:value}); 
		}
		function readOnlyChanged(value){
			readOnly = value;
			if(value)
			{
				element.classList.add('readonly');
				element.classList.remove('not-readonly');
				return;
			}
			element.classList.remove('readonly');
			element.classList.add('not-readonly');
		}
	};
	return _Tickbox;
})();