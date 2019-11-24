var MultiSelectDropDown = (function () {
    return function (params) {
        var self = this;
		var model = params[S.MODEL];
        var className = params[S.CLASS_NAME];
        var classNames = params[S.CLASS_NAMES];
		var text = params[S.TEXT];
		var propertyNameText = params[S.PROPERTY_NAME_TEXT];
		var imageSemantic = params[S.IMAGE_SEMANTIC];
		var imageSemanticHover = params[S.IMAGE_SEMANTIC_HOVER];
		var displaySelectedText = params[S.DISPLAY_SELECTED_TEXT];
		if(!classNames)classNames=['multi-select-drop-down'];
		else classNames.push('multi-select-drop-down');
		var multiSelect = new MultiSelect(params);
		multiSelect.addEventListener(S.CHANGED, changed);
		var p ={};
		p[S.CLASS_NAME]='multi-select-drop-down-popup';
		var popup = new Popup(p);
		var element = E.DIV();
		var popupElement = popup[S.GET_ELEMENT]();
		document.body.appendChild(popupElement);
		popupElement.appendChild(multiSelect[S.GET_ELEMENT]());
		var buttons = E.DIV();
		buttons.classList.add('buttons');
		p={};
		p[S.CLICK]=click;
		p[S.CLASS_NAME]='left';
		p[S.TEXT]=text;
		p[S.PROPERTY_NAME_TEXT]=propertyNameText;
		p[S.MODEL]=model;
		var buttonLeft = new Button(p);
		p={};
		p[S.CLICK]=click;
		p[S.CLASS_NAME]='right';
		p[S.IMAGE_SEMANTIC]=imageSemantic;
		p[S.IMAGE_SEMANTIC_HOVER]=imageSemanticHover;
		var buttonRight = new Button(p);
        if (className)
            element.classList.add(className);
        if (classNames) each(classNames, function (className) {
            element.classList.add(className);
        });
		var buttonLeftElement = buttonLeft[S.GET_ELEMENT]();
		element.appendChild(buttons);
		buttons.appendChild(buttonLeftElement);
		buttons.appendChild(buttonRight[S.GET_ELEMENT]());
		this[S.GET_ELEMENT]=function(){return element;};
		function click(){
			show();
		}
		function show(){
			popup[S.SHOW]();
			var position = getAbsolute(element);
			var p={};
			p[S.LEFT]=position[S.LEFT];
			p[S.TOP]=position[S.TOP]+element.offsetHeight;
			popup[S.SET_POSITION](p);
			constrainHeightWithinViewPort();
		}
		function constrainHeightWithinViewPort(){
			var popupElementAbsolutePosition = getAbsolute(popupElement);
			var viewportDimensions = getViewportDimensions();
			popupElement.style.height='auto';
			if(!isOverflowingViewportBottom(popupElement, viewportDimensions, popupElementAbsolutePosition)) return;
			var newHeight = viewportDimensions[1]-popupElementAbsolutePosition[S.TOP]-10;
			popupElement.style.height = String(newHeight)+'px';
		}
		function changed(e){
			var str='';
			var first = true;
			each(e[S.SELECTED_TEXT], function(text){
				if(first)first = false; else str+=', ';
				str+=text;
			});
			buttonLeftElement.innerHTML = str;
		}
	};
})();