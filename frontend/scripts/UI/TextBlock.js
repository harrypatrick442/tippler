var TextBlock = window['TextBlock']=function(params){
	var self = this;
	var className = params[S.CLASS_NAME];
	var classNames = params[S.CLASS_NAMES];
	var propertyName=params[S.PROPERTY_NAME];
	var methodNameClick = params[S.METHOD_NAME_CLICK];
	var model = params[S.MODEL];
	var text = params[S.TEXT];
	if(!model&&!text) throw new Error('No model provided');
	var element = E.DIV();
	element.classList.add('text-block');
	if (className)
		element.classList.add(className);
	if (classNames) each(classNames, function (className) {
		element.classList.add(className);
	});
	if(methodNameClick){
		element.addEventListener('click', function(){model[methodNameClick]();});
	}
	var propertyBinding;
	if(propertyName){
		propertyBinding = PropertyBinding[S.STANDARD](this, model, propertyName, valueChanged);
	}
	else{valueChanged(params[S.TEXT]);}
	this[S.GET_ELEMENT]=function(){return element;};
	this[S.DISPOSE]=function(){
		self[S.MY_BINDINGS]&&self[S.MY_BINDINGS][S.DISPOSE]();
	};
	function valueChanged(value){
		element.innerHTML=value!=undefined&&value!=null?String(value):'';
	}
};