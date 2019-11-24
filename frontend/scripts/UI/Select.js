var Select = (function () {
    return function (params) {
        var self = this;
        EventEnabledBuilder(this);
        var className = params[S.CLASS_NAME];
        var classNames = params[S.CLASS_NAMES];
        var readOnly = params[S.READ_ONLY];
        var itemTextName = params[S.ITEM_TEXT_NAME];
        var itemValueName = params[S.ITEM_VALUE_NAME];
		var propertyNameItemText = params[S.PROPERTY_NAME_ITEM_TEXT];
		var propertyNameItemValue = params[S.PROPERTY_NAME_ITEM_VALUE];
        var propertyNameItems = params[S.PROPERTY_NAME_ITEMS];
        var propertyNameSelectedItem = params[S.PROPERTY_NAME_SELECTED_ITEM];
        var propertyNameSelectedValue = params[S.PROPERTY_NAME_SELECTED_VALUE];
		var readOnly = params[S.READ_ONLY];
		var propertyNameReadOnly = params[S.PROPERTY_NAME_READ_ONLY];
		
		var getterNameItemText;
		if(propertyNameItemText)
			getterNameItemText=PropertyHelper[S.GET_GETTER_NAME](propertyNameItemText);
		var getterNameItemValue;
		if(propertyNameItemValue)
			getterNameItemValue= PropertyHelper[S.GET_GETTER_NAME](propertyNameItemValue);
		var converterType=params[S.CONVERTER_TYPE];
		var valueConverter = params[S.VALUE_CONVERTER];
		var model = params[S.MODEL];
		var validate = params[S.VALIDATE];
		if(!model)throw new Error('No model provided. '+S.PROPERTY_NAME_ITEMS+' is '+propertyNameItems);
        var validityIndicator;
        var selectedItem;
        var selectedValue;
		var loopBreakDefault=new LoopBreak();
		var element = E.DIV();
        var select = E.SELECT();
		var readOnlyElement = E.DIV();
		readOnlyElement.classList.add('readonly');
        var mapValueToItems = {};
        if (readOnly)
            select.readOnly = true;
        if (className)
            element.classList.add(className);
        if (classNames) each(classNames, function (className) {
            element.classList.add(className);
        });
        element.classList.add('select');
        this[S.GET_ELEMENT] = function () { return element; };
		this[S.GET_VALIDITY_INDICATOR]=function(){return validityIndicator;};
        select.addEventListener('change', changed);
        this['addEventListener'] = addEventListener;
        this[S.FOCUS] = function () {
            select.focus();
        };
        this[S.DISPOSE] = function () {
			self[S.MY_BINDINGS]&&self[S.MY_BINDINGS][S.DISPOSE]();
        };
		if(validate){
			validityIndicator = new ValidityIndicator(this, model, propertyNameSelectedItem?propertyNameSelectedItem:propertyNameSelectedValue, element);
		}
		var propertyBindingReadOnly;
		if(propertyNameReadOnly){
			propertyBindingReadOnly = PropertyBinding[S.STANDARD](this, model, propertyNameReadOnly, readOnlyChanged, true);
			readOnly = propertyBindingReadOnly[S.GET]();
		}
		if(readOnly){
			element.appendChild(readOnlyElement);
		}
		else{
			element.appendChild(select);
		}
		setReadOnlyClasses(readOnly);
		var propertyBindingItems = PropertyBinding[S.STANDARD](this, model, propertyNameItems, itemsChanged, true);
        var propertyBindingSelectedItem;
        var propertyBindingSelectedValue;
		var items = propertyBindingItems.get();
		if(!items)throw new Error('Items is: '+items+' for '+S.PROPERTY_NAME_ITEMS+' '+propertyNameItems+(model?(' on model of type '+model.constructor.name):'')); 
        updateItems(items);
        if (propertyNameSelectedItem) {
            propertyBindingSelectedItem = PropertyBinding[S.STANDARD](this, params[S.MODEL], propertyNameSelectedItem, selectedItemChanged, true);
            setSelectedItem(propertyBindingSelectedItem[S.GET]());
        }
        else if (propertyNameSelectedValue) {
            propertyBindingSelectedValue = PropertyBinding[S.STANDARD](this, params[S.MODEL], propertyNameSelectedValue, selectedValueChanged, true);
            setSelectedValue(propertyBindingSelectedValue[S.GET]());
			if(!valueConverter){
				if(!converterType)converterType=typeof(selectedValue);
				valueConverter = getConvertToType(converterType);
			}
        }
        function itemsChanged(value) {
            updateItems(value);
        }
        function updateItems(items) {
            clearOptions();
            mapValueToItems = {};
            var containedSelected = false;
			if(!items){
				console.error(propertyBindingItems+' has no get method on object of type'+ model.constructor.name);
			}
            each(items, function (item) {
                var value = itemValueName ? item[itemValueName] : (getterNameItemValue? item[getterNameItemValue]():item);// todo can make this more efficient when get time.
                if ((propertyNameSelectedItem && item == selectedItem) || (propertyNameSelectedValue && value == selectedValue)) containedSelected = true;
                var text = itemTextName ? item[itemTextName] : (getterNameItemText? item[getterNameItemText](): item);
                var option = E.OPTION();
                option.text = text;
                option.value = value;
                select.appendChild(option);
                mapValueToItems[value] = item;
            });
            if (containedSelected) {
                if (propertyNameSelectedItem) setSelectedItem(selectedItem);
                else setSelectedValue(selectedValue);

            }
        }
        function selectedItemChanged(value) {
            selectedItem = value;
			setSelectedItem(value);
			
        }
        function selectedValueChanged(value) {
            setSelectedValue(value);
        }
        function clearOptions() {
            while (select.options.length > 0)
                select.removeChild(select.options[0]);
        }
        function setSelectedItem(item) {
			if(!item){setSelectedValue();return;}
            var value = itemValueName?item[itemValueName]:(getterNameItemValue?item[getterNameItemValue]():item);
            setSelectedValue(value);
        }
        function setSelectedValue(value) {
			value = String(value);
            for (var i = 0; i < select.options.length; i++) {
                var option = select.options[i];
                if (option.value == value) {
                    select.selectedIndex = i;
					readOnlyElement.innerHTML = option.text;
                    return;
                }
            }
			/*not matched any items*/
			if(select.options.length<1)return;
			select.selectedIndex=0;
			if(select.options[0])
				readOnlyElement.innerHTML=select.options[0].text;
			//defaulting has the potential to trigger a runaway condition if the default is not there. Hence the loop break to make sure that cant happen.
			if(loopBreakDefault[S.TRIGGER]())return;
			updateToModel(select.options[0]);
        }
        function changed() {
            var selectedOption = select.options[select.selectedIndex];
            if (!selectedOption) return;
			updateToModel(selectedOption);
        }
		function updateToModel(selectedOption){
            if (propertyNameSelectedItem) {
                selectedItem = mapValueToItems[selectedOption.value];
                propertyBindingSelectedItem[S.SET](selectedItem);
            }
            else {
                selectedValue = valueConverter?valueConverter(selectedOption.value):selectedOption.value;
                propertyBindingSelectedValue[S.SET](selectedValue);
            }
		}
        function addEventListener(name, callback) {
            switch (name) {
                case 'change':
                    select.addEventListener(name, callback);
                    break;
            }
        }
		function readOnlyChanged(value){
			if(readOnly==value)return;
			if(value){
				element.removeChild(select);
				element.appendChild(readOnlyElement);
				return;
			}
			element.appendChild(select);
			element.removeChild(readOnlyElement);
			setReadOnlyClasses(value);
		}
		function setReadOnlyClasses(readOnly){
			if(readOnly)
				element.classList.add('readonly');
			else
				element.classList.remove('readonly');
		}
    };
})();