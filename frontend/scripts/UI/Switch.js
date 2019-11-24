var Switch = window['Switch']=function(params){
	var tickbox = new Tickbox(params);
	var propertyNameTextLeft = params[S.PROPERTY_NAME_TEXT_LEFT];
	var propertyNameTextRight = params[S.PROPERTY_NAME_TEXT_RIGHT];
	var propertyNameReadOnly=params[S.PROPERTY_NAME_READ_ONLY];
	var textLeft = params[S.TEXT_LEFT];
	var textRight = params[S.TEXT_RIGHT];
	var model = params[S.MODEL];
	var element = E.DIV();
	var tickboxElement = tickbox[S.GET_ELEMENT]();
	tickbox[S.ADD_EVENT_LISTENER](S.CHANGED, tickboxChanged);
	var elementTextLeft, elementTextRight;
	if(propertyNameTextLeft||textLeft){
		elementTextLeft = E.DIV();
		elementTextLeft.classList.add('text-left');
		element.appendChild(elementTextLeft);
		if(propertyNameTextLeft)
			PropertyBinding[S.STANDARD](this, model, propertyNameTextLeft, textLeftChanged);
		else
			textLeftChanged(textLeft);
	}
	element.appendChild(tickboxElement);
	if(propertyNameTextRight||textRight)
	{
		elementTextRight = E.DIV();
		elementTextRight.classList.add('text-right');
		element.appendChild(elementTextRight);
		if(propertyNameTextRight)
			PropertyBinding[S.STANDARD](this, model, propertyNameTextRight, textRightChanged);
		else
			textRightChanged(textRight);
	}
	element.classList.add('switch');
	this[S.GET_ELEMENT]=function(){return element;};
	setActive(tickbox[S.GET_TICKED]());
	PropertyBinding[S.STANDARD](this, model, propertyNameReadOnly, readOnlyChanged);
	function textLeftChanged(value){
		elementTextLeft.innerHTML = value;
	}
	function textRightChanged(value){
		elementTextRight.innerHTML = value;
	}
	function tickboxChanged(e){
		var ticked = e[S.TICKED];
		setActive(ticked);
	}
	function setActive(ticked){
		if(ticked){
			elementTextLeft&&elementTextLeft.classList.remove('active');
			elementTextRight&&elementTextRight.classList.add('active');
		}
		else
		{
			elementTextLeft&&elementTextLeft.classList.add('active');
			elementTextRight&&elementTextRight.classList.remove('active');
		}
	}
	function readOnlyChanged(value){
		if(value)
			element.classList.add('readonly');
		else
			element.classList.remove('readonly');
	}
};