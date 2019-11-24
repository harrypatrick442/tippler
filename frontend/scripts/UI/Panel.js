var Panel = window['Panel'] = function(params){
	var self = this;
	var className = params[S.CLASS_NAME];
	var classNames = params[S.CLASS_NAMES];
	var element = E.DIV();
	element.classList.add('panel');
	
	if (className)
		element.classList.add(className);
	if (classNames)
		each(classNames, function (className) {
			element.classList.add(className);
		});
	this['getElement']=function(){
		return element;
	};
};