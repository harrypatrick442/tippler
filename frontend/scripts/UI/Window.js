var Window = window['Window']=(function(){
	return function(params){
		EventEnabledBuilder(this);
		var self = this;
		var className=params[S.CLASS_NAME];
		var classNames = params[S.CLASS_NAMES];
		var model = params[S.MODEL];
		var propertyNameVisible = params[S.PROPERTY_NAME_VISIBLE];
		var element = E.DIV();
		element.classList.add('window');
		var inner = E.DIV();
		inner.classList.add('inner');
		element.appendChild(inner);
		if(className)
			element.classList.add(className);
		if(classNames)each(classNames, function(className){
			element.classList.add(className);
		});
		var propertyBindingVisible = PropertyBinding[S.STANDARD](this, model, propertyNameVisible, visibleChanged);
		this[S.GET_ELEMENT] = function(){return element;};
		this[S.GET_INNER_ELEMENT] = function(){return inner;};
		this[S.DISPOSE]=function(){
			propertyBindingVisible[S.UNBIND]();
		};
		visibleChanged(propertyBindingVisible[S.GET]());
		function visibleChanged(value){
			if(value)
				element.classList.add('visible');
			else
				element.classList.remove('visible');
			dispatchVisibleChanged(value);
		}
		function dispatchVisibleChanged(value){
			var p = {};
			p[S.TYPE]= S.VISIBLE_CHANGED;
			p[S.VISIBLE]=value;
			self.dispatchEvent(p);
		}
	};
})();