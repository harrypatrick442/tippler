var Field = window['Field']=(function(){
	return function(params){
		EventEnabledBuilder(this);
		var className=params[S.CLASS_NAME];
		var classNames = params[S.CLASS_NAMES];
		var type = params[S.TYPE];
		var readOnly = params[S.READ_ONLY];
		var propertyNameReadOnly = params[S.PROPERTY_NAME_READ_ONLY];
		var valuePropertyName = params[S.VALUE_PROPERTY_NAME];
		var propertyNameVisible = params[S.PROPERTY_NAME_VISIBLE];
		var key = params[S.KEY];
		var validator = params[S.VALIDATOR];
		var nameInline = params[S.NAME_INLINE];
		if(nameInline==undefined)nameInline=true;
		var model = params[S.MODEL];
		if(!key){
			var keyPropertyName = params[S.PROPERTY_NAME_KEY];
			if(keyPropertyName){
				key = model[keyPropertyName];
			}
		}
		var element = E.DIV();
		var p ={};
		p[S.TEXT]=key;
		p[S.CLASS_NAME]='field-key';
		if(propertyNameVisible){
			p[S.PROPERTY_NAME_VISIBLE]=propertyNameVisible;
			p[S.MODEL]=model;
		}
		var label = new Label(p);
		var labelElement = label['getElement']();
		var value;
		switch(type){
			case S.TEXT:
			var isMultiLine=params[S.IS_MULTI_LINE];
			var p = {};
			p[S.PROPERTY_NAME]=valuePropertyName;
			p[S.PROPERTY_NAME_READ_ONLY]=propertyNameReadOnly;
			if(!valuePropertyName)throw new Error(S.VALUE_PROPERTY_NAME+' was not provided');
			p[S.IS_TEXT_AREA]=isMultiLine;
			p[S.IS_PASSWORD]=params[S.IS_PASSWORD];
			p[S.PLACEHOLDER]=params[S.PLACEHOLDER];
			p[S.MODEL]=model;
			value = new TextBox(p);
			break;
			case S.TEXT_BLOCK:
			var p = {};
			p[S.PROPERTY_NAME]=valuePropertyName;
			p[S.PROPERTY_NAME_READ_ONLY]=propertyNameReadOnly;
			if(!valuePropertyName)throw new Error(S.VALUE_PROPERTY_NAME+' was not provided');
			p[S.MODEL]=model;
			value = new TextBlock(p);
			break;
			case S.SELECT:
			p={};
			p[S.MODEL]=params[S.MODEL];
			p[S.ITEM_TEXT_NAME]=params[S.ITEM_TEXT_NAME];
			p[S.ITEM_VALUE_NAME]=params[S.ITEM_VALUE_NAME];
			p[S.PROPERTY_NAME_SELECTED_ITEM]=params[S.PROPERTY_NAME_SELECTED_ITEM];
			p[S.PROPERTY_NAME_SELECTED_VALUE]=params[S.PROPERTY_NAME_SELECTED_VALUE];
			p[S.PROPERTY_NAME_ITEMS]=params[S.PROPERTY_NAME_ITEMS];
			p[S.PROPERTY_NAME_ITEM_VALUE]=params[S.PROPERTY_NAME_ITEM_VALUE];
			p[S.PROPERTY_NAME_ITEM_TEXT]=params[S.PROPERTY_NAME_ITEM_TEXT];
			p[S.VALUE_CONVERTER]=params[S.VALUE_CONVERTER];
			p[S.READ_ONLY]=readOnly;
			p[S.PROPERTY_NAME_READ_ONLY]=propertyNameReadOnly;
			value = new Select(p);
			break;
			case S.MULTI_SELECT_DROP_DOWN:
			p={};
			p[S.MODEL]=params[S.MODEL];
			p[S.ITEM_TEXT_NAME]=params[S.ITEM_TEXT_NAME];
			p[S.ITEM_VALUE_NAME]=params[S.ITEM_VALUE_NAME];
			p[S.PROPERTY_NAME_SELECTED_ITEMS]=params[S.PROPERTY_NAME_SELECTED_ITEMS];
			p[S.PROPERTY_NAME_SELECTED_VALUES]=params[S.PROPERTY_NAME_SELECTED_VALUES];
			p[S.PROPERTY_NAME_ITEMS]=params[S.PROPERTY_NAME_ITEMS];
			p[S.IMAGE_SEMANTIC]=params[S.IMAGE_SEMANTIC];
			p[S.IMAGE_SEMANTIC_HOVER]=params[S.IMAGE_SEMANTIC_HOVER];
			p[S.VALUE_CONVERTER]=params[S.VALUE_CONVERTER];
			p[S.SISPLAY_SELECTED_TEXT]=params[S.DISPLAY_SELECTED_TEXT];
			//p[S.READ_ONLY]=readOnly;
			value = new MultiSelectDropDown(p);
			break;
			case S.TICKBOX:
			p={};
			p[S.PROPERTY_NAME]=valuePropertyName;
			p[S.MODEL]=model;
			p[S.IMAGE_SEMANTIC]=params[S.IMAGE_SEMANTIC];
			p[S.IMAGE_SEMANTIC_TICKED]=params[S.IMAGE_SEMANTIC_TICKED];
			p[S.IMAGE_SEMANTIC_HOVER] = params[S.IMAGE_SEMANTIC_HOVER];
			p[S.IMAGE_SEMANTIC_TICKED_HOVER] = params[S.IMAGE_SEMANTIC_TICKED_HOVER]
			value = new Tickbox(p);
			break;
			case S.SWITCH:
			p={};
			p[S.PROPERTY_NAME]=valuePropertyName;
			p[S.MODEL]=model;
			p[S.PROPERTY_NAME_TEXT_LEFT]= params[S.PROPERTY_NAME_TEXT_LEFT];
			p[S.PROPERTY_NAME_TEXT_RIGHT] = params[S.PROPERTY_NAME_TEXT_RIGHT];
			p[S.TEXT_LEFT]=params[S.TEXT_LEFT];
			p[S.TEXT_RIGHT] = params[S.TEXT_RIGHT];
			p[S.PROPERTY_NAME_READ_ONLY]=propertyNameReadOnly;
			value = new Switch(p);
			break;
			case S.DATE:
			p={};
			p[S.PROPERTY_NAME_DATE]=valuePropertyName;
			p[S.POPUP]=true;
			p[S.MODEL]=model;
			value = new DatePicker(p);
			break;
			case S.TAGS:
			p={};
			p[S.PROPERTY_NAME]=valuePropertyName;
			p[S.PROPERTY_NAME_VISIBLE]=propertyNameVisible;
			p[S.MODEL]=model;
			p[S.CHARACTER_LIMIT]=params[S.CHARACTER_LIMIT];
			p[S.PLACEHOLDER]=params[S.PLACEHOLDER];
			p[S.PROPERTY_NAME_READ_ONLY]=propertyNameReadOnly;
			p[S.PROPERTY_NAME_ALLOW_SPACE]=params[S.PROPERTY_NAME_ALLOW_SPACE];
			value = new Tags(p);
			break;
			case S.CHECKBOX_ARRAY:
			p={};
			p[S.PROPERTY_NAME_COLUMNS]=params[S.PROPERTY_NAME_COLUMNS];
			p[S.DEFAULT]=params[S.DEFAULT];
			p[S.CHECKBOX_IMAGE_SEMANTIC]=params[S.CHECKBOX_IMAGE_SEMANTIC];
			p[S.CHECKBOX_IMAGE_SEMANTIC_HOVER]=params[S.CHECKBOX_IMAGE_SEMANTIC_HOVER];
			p[S.CHECKBOX_IMAGE_SEMANTIC_TICKED]=params[S.CHECKBOX_IMAGE_SEMANTIC_TICKED];
			p[S.CHECKBOX_IMAGE_SEMANTIC_TICKED_HOVER]=params[S.CHECKBOX_IMAGE_SEMANTIC_TICKED_HOVER];
			p[S.PROPERTY_NAME_ITEMS]=valuePropertyName;
			p[S.PROPERTY_NAME_READ_ONLY]=propertyNameReadOnly;
			p[S.MODEL]=model;
			value = new CheckboxArray(p);
			break;
			case S.NUMBER_RANGE:
			p={};
			p[S.PROPERTY_NAME_ITEMS]=valuePropertyName;
			p[S.MODEL]=model;
			p[S.TEXT]='';
			p[S.CLASS_NAMES]=classNames;
			p[S.CLASS_NAME]=className;
			p[S.PROPERTY_NAME_FROM]=valuePropertyName;
			var value2PropertyName= params[S.VALUE_2_PROPERTY_NAME];
			p[S.PROPERTY_NAME_TO]=value2PropertyName;
			p[S.FROM_TEXT]=params[S.FROM_TEXT];
			p[S.TO_TEXT]=params[S.TO_TEXT];
			value = new NumberRange(p);
			var components = value[S.GET_COMPONENTS]();
			if(validator){
				new ValidityIndicator(this, model, valuePropertyName, components[S.FROM_TEXT_BOX][S.GET_ELEMENT]());
				new ValidityIndicator(this, model, value2PropertyName, components[S.TO_TEXT_BOX][S.GET_ELEMENT]());
			}
			break;
		}
		var valueElement = value[S.GET_ELEMENT]();
		valueElement.classList.add('field-value');
		if(className)
			element.classList.add(className);
		if(classNames)each(classNames, function(className){
			element.classList.add(className);
		});
		element.classList.add('field');
		if(nameInline)
			element.classList.add('name-inline');
		element.appendChild(labelElement);
		var span = E.SPAN();
		span.classList.add('field-value-span');
		element.appendChild(span);
		span.appendChild(valueElement);
		this[S.IS_FIELD]=true;
		this[S.GET_ELEMENT] = function(){return element;};
		this[S.GET_VALUE_ELEMENT]= value[S.GET_ELEMENT];
		this[S.FOCUS] = function(){
			value.focus();
		};
		this[S.DISPOSE]=function(){
			value[S.DISPOSE]();
			self[S.MY_BINDINGS]&&self[S.MY_BINDINGS][S.DISPOSE]();
		};
	};
})();