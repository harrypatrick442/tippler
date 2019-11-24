var Fields = window['Fields']=(function(){
	var MIN_FIELD_WIDTH=300;
	var MIN_WIDTH_TWO_WIDE=2*MIN_FIELD_WIDTH;
	var MIN_WIDTH_THREE_WIDE=3*MIN_FIELD_WIDTH;
	var CLASS_NAME_ONE_WIDE='one-field-per-row';
	var CLASS_NAME_TWO_WIDE='two-fields-per-row';
	var CLASS_NAME_THREE_WIDE='three-fields-per-row';
	var WIDTH_TO_CLASS_NAMES_DEFAULT = {
		[MIN_FIELD_WIDTH]:CLASS_NAME_ONE_WIDE,
		[MIN_WIDTH_TWO_WIDE]:CLASS_NAME_TWO_WIDE,
		[MIN_WIDTH_THREE_WIDE]:CLASS_NAME_THREE_WIDE
	};
	return function(params){
		var entries = params[S.ENTRIES];
		var fields=[];
		var useDynamicLayout = params[S.USE_DYNAMIC_LAYOUT];
		var widthToClassNames = params[S.WIDTH_TO_CLASS_NAMES];
		if(!widthToClassNames)
			widthToClassNames=WIDTH_TO_CLASS_NAMES_DEFAULT;
		if(useDynamicLayout==undefined)useDynamicLayout=false;
		if(!entries)throw new Error('No entries were supplied');
		var element = params[S.ELEMENT];
		if(!element)
			element = E.DIV();
		var dynamicFieldsLayout;
		if(useDynamicLayout)
		{
			var p ={};
			p[S.ELEMENT]=element;
			p[S.WIDTH_TO_CLASS_NAMES]=widthToClassNames;
			dynamicFieldsLayout = new DynamicFieldsLayout(p);
			this[S.GET_DYNAMIC_FIELDS_LAYOUT]=function(){
				return dynamicFieldsLayout;
			};
		}
		var classNames = params[S.CLASS_NAMES];
		var className = params[S.CLASS_NAME];
		if(className)
			element.classList.add(className);
		if(classNames)each(classNames, function(className){
			element.classList.add(className);
		});
		element.classList.add('fields');
		each(entries, function(entry){
			var field = entry[S.IS_FIELD]?entry:new Field(entry);
			fields.push(field);
			element.appendChild(field[S.GET_ELEMENT]());
		});
		dynamicFieldsLayout&&setTimeout(dynamicFieldsLayout[S.UPDATE],0);
		//this[S.GET_ENTRIES]=function(){return entries;};
		this[S.GET_ELEMENT] = function(){return element;};
		this[S.DISPOSE]=function(){
			dynamicFieldsLayout&&dynamicFieldsLayout[S.DISPOSE]();
		};
	};
})();