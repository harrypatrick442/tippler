var Validators = window['Validators']=new (function(){
	var INPUT = 'input';
	var TEXTAREA='textarea';
	var SELECT='select';
	this[S.NOT_EMPTY]= function NotEmpty(){
		return new Validator(params, function(value){
				return !Validation[S.IS_NULL_OR_EMPTY](value);
			}
		);
	};
	this[S.NUMBER]=function _Number(params){
		return new Validator(params, Validation[S.IS_NUMBER]);
	};
	this[S.INT]=function Int(params){
		return new Validator(params, Validation[S.IS_INT]);
	};
	this[S.DATE]= function _Date(params){
		return new Validator(params, Validation[S.IS_DATE]);
	};
	this[S.BOOLEAN]=function Boolean(params){
		return new Validator(params, Validation[S.IS_BOOLEAN]);
	};
	function Validator(params, validate){
		var element = params[S.ELEMENT];
		if(!element) throw new Error('No element supplied');
		var invalidText=params[S.INVALID_TEXT];
		var invalidIndicator = invalidText?new InvalidIndicator():null;
		var message = params[S.MESSAGE];
		var getValue = getGetValue(element);
		this[S.VALIDATE]=function(){
			var value = getValue();
			if(validate(value)){
				invalidIndicator&&invalidIndicator['setVisible'](true);
				return false;
			}
			invalidIndicator&&invalidIndicator['setVisible'](false);
			return true;
		};
	};
	function getGetValue(element){
		switch(element.tagName.toLower()){
			case INPUT:
				return function(){return element.value;};
			break;
			case TEXTAREA:
				return function(){return element.value;};
			break;
			case SELECT:
				return function(){
					var selectedOption = element.options[element.selectedIndex];
					if(!selectOption)return;
					return selectedOption.value;
				};
			break;
		}
	}
	function InvalidIndicator(validatedElement, invalidText){
		var element = E.DIV();
		element.classList.add('invalid-indicator');
		element.innerHTML = invalidText;
		this['setVisible']=function(value){
			if(value)
				element.classList.add('visible');
			else
				element.classList.remove('visible');
		};
	}
})();