var NumberRange = window['NumberRange']=function(params){
	var self = this;
	var text = params[S.TEXT];
	var classNames = params[S.CLASS_NAMES];
	var className = params[S.CLASS_NAME];
	
	var propertyNameFrom = params[S.PROPERTY_NAME_FROM];
	var propertyNameTo = params[S.PROPERTY_NAME_TO];
	var text = params[S.TEXT];
	var fromText = params[S.FROM_TEXT];
	var toText = params[S.TO_TEXT];
	var model = params[S.MODEL];
	var element = E.DIV();
	if (className)
		element.classList.add(className);
	if (classNames) each(classNames, function (className) {
		element.classList.add(className);
	});
	element.classList.add('number-range');
	var to = E.DIV();
	to.classList.add('to');

	var from = E.DIV();
	from.classList.add('from');
	var textBlock;
	var p={};
	if(text){
		p[S.TEXT]=text;
		p[S.CLASS_NAME]='title';
		textBlock = new TextBlock(p);
		p={};
			element.appendChild(textBlock[S.GET_ELEMENT]());
	}
	p[S.TEXT]=fromText;
	var textBlockFrom= new TextBlock(p);
	var p={};
	p[S.TEXT]=toText;
	var textBlockTo = new TextBlock(p);
	p = {};
	p[S.PROPERTY_NAME]=propertyNameFrom;
	p[S.MODEL]=model;
	var textBoxFrom = new TextBox(p);
	
	p = {};
	p[S.PROPERTY_NAME]=propertyNameTo;
	p[S.MODEL]=model;
	var textBoxTo = new TextBox(p);
	var controlsCollection = new ControlsCollection(textBlock, textBlockFrom, textBoxFrom, textBlockTo, textBoxTo);
	
	element.appendChild(from);
	element.appendChild(to);
	from.appendChild(textBlockFrom[S.GET_ELEMENT]());
	from.appendChild(textBoxFrom[S.GET_ELEMENT]());
	to.appendChild(textBlockTo[S.GET_ELEMENT]());
	to.appendChild(textBoxTo[S.GET_ELEMENT]());
	this[S.GET_ELEMENT]=function(){return element;};
	this[S.GET_COMPONENTS]=function(){
		var p={};
		p[S.FROM_TEXT_BOX]=textBoxFrom;
		p[S.TO_TEXT_BOX]=textBoxTo;
		return p;
	};
	this[S.GET_TO_TEXT_BOX]=function(){return element;};
	this[S.DISPOSE]=function(){
		controlsCollection[S.DISPOSE]();
	};
};