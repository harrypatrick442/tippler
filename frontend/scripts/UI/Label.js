var Label = window['Label']=function(params){
	var self = this;
	var text = params[S.TEXT];
	var classNames = params[S.CLASS_NAMES];
	var className = params[S.CLASS_NAME];
	var propertyNameVisible = params[S.PROPERTY_NAME_VISIBLE];
	var model = params[S.MODEL];
	var element = E.DIV();
	if (className)
		element.classList.add(className);
	if (classNames) each(classNames, function (className) {
		element.classList.add(className);
	});
	element.classList.add('label');
	element.innerHTML=text;
	if(propertyNameVisible)
		PropertyBinding[S.STANDARD](this, model, propertyNameVisible, visibleChanged);
	else visibleChanged(true);
	this[S.GET_ELEMENT]=function(){return element;};
	function visibleChanged(value){
		if(value)
			element.classList.add('visible');
		else
			element.classList.remove('visible');
	}
};