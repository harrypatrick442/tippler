var ValidityIndicator = window['ValidityIndicator']=(function(){
	var _ValidityIndicator;
	_ValidityIndicator	= function ValidityIndicator(me, model, a, b, c){
		var propertyNameValue, element, classNameInvalid;
		if(a===undefined||a===null)throw new Error('Arguments not valid');
		if(typeof(a)=='string'){
			propertyNameValue = a;
			element = b;
			classNameInvalid = c;
		}
		else{
			propertyNameValue = a[S.GET_PROPERTY_NAME_VALUE]();
			element = a[S.GET_ELEMENT]();
			classNameInvalid = b;
		}
		if(!classNameInvalid)
		{
			var validatedElementTagName = element.tagName;
			switch(validatedElementTagName){
				case 'select':
				case 'input':
				default:
					return new Border(me, model, a, b);
					
			}
		}
		var propertyNameValid = propertyNameValue+'Valid';
		
		if(!model[PropertyHelper[S.GET_GETTER_NAME](propertyNameValid)])throw new Error('Model of type '+model.constructor.name+' does not contain a validator for property '+propertyNameValue);
		var propertyBinding = PropertyBinding[S.STANDARD](me, model, propertyNameValid, changed);
		changed(propertyBinding[S.GET]());
		function changed(value){
			if(value)element.classList.remove(classNameInvalid);
			else element.classList.add(classNameInvalid);
		}
	};
	_ValidityIndicator[S.BORDER]=Border;
	_ValidityIndicator[S.BACKGROUND]=Background;
	return _ValidityIndicator;
	function Border(me, model, a, b){
		return arguments.length>3
		?new _ValidityIndicator(me, model, a, b, 'invalid-border')
		:new _ValidityIndicator(me, model, a, 'invalid-border');
	}
	function Background(me, model, a, b){
		return arguments.length>3
		?new _ValidityIndicator(me, model, a, b, 'invalid-background')
		:new _ValidityIndicator(me, model, a, 'invalid-background');
	}
	/*function Indicator(){
		var element = E.DIV();
		element.classList.add('validity-indicator');
		element.innerHTML = invalidText;
		this['setVisible']=function(value){
			if(value)
				element.classList.add('visible');
			else
				element.classList.remove('visible');
		};	
	}*/
})();