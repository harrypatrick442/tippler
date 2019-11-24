var MultiSelect = (function () {
    return function (params) {
		EventEnabledBuilder(this);
        var self = this;
        var className = params[S.CLASS_NAME];
        var classNames = params[S.CLASS_NAMES];
		/* simple items*/
        var itemTextName = params[S.ITEM_TEXT_NAME];
        var itemValueName = params[S.ITEM_VALUE_NAME];
		/*Items with getter setter*/
		var propertyNameItemText = params[S.PROPERTY_NAME_ITEM_TEXT];
		var propertyNameItemValue = params[S.PROPERTY_NAME_ITEM_VALUE];
		var propertyNameItemSelected = params[S.PROPERTY_NAME_ITEM_SELECTED];
		
        var propertyNameItems = params[S.PROPERTY_NAME_ITEMS];
        var propertyNameSelectedItems = params[S.PROPERTY_NAME_SELECTED_ITEMS];
        var propertyNameSelectedValues = params[S.PROPERTY_NAME_SELECTED_VALUES];
		var includeAll = params[S.INCLUDE_ALL];
		var converterType=params[S.CONVERTER_TYPE];
		var valueConverter = params[S.VALUE_CONVERTER];
		var model = params[S.MODEL];
		var validate = params[S.VALIDATE];
		var loopBreakSelected = new LoopBreak();
		var itemType = determineItemType();
		if(!model)throw new Error('No model provided. '+S.PROPERTY_NAME_ITEMS+' is '+propertyNameItems);
        var element = E.UL();
        if (className)
            element.classList.add(className);
        if (classNames) each(classNames, function (className) {
            element.classList.add(className);
        });
        element.classList.add('multi-select');
		var p = {};
		p[S.ELEMENT]=element;
		p[S.MODEL]=model;
		p[S.PROPERTY_NAME_ITEMS]=propertyNameItems;
		p[S.CREATE_VIEW]=createView;
		p[S.CONVERT_ITEM]=getConvertItem(itemType);
		if(itemType==ItemTypes.String)p[S.ITEMS_ARE_PRIMITIVES]=true;
		var orderedItems = new OrderedItems(p)
		orderedItems.addEventListener(S.CHANGED, orderedItemsChanged);
        var propertyBindingSelectedItems;
        var propertyBindingSelectedValues;
        if (propertyNameSelectedItems) {
            propertyBindingSelectedItems = PropertyBinding[S.STANDARD](this, params[S.MODEL], propertyNameSelectedItems, selectedItemsChanged);
        }
        else if (propertyNameSelectedValues) {
            propertyBindingSelectedValues = PropertyBinding[S.STANDARD](this, params[S.MODEL], propertyNameSelectedValues, selectedValuesChanged);
        };
        this[S.GET_ELEMENT] = function () { return element; };
		//this[S.GET_VALIDITY_INDICATOR]=function(){return validityIndicator;};
        this[S.FOCUS] = function () {
            element.focus();
        };
        this[S.DISPOSE] = function () {
			self[S.MY_BINDINGS]&&self[S.MY_BINDINGS][S.DISPOSE]();
        };
		function orderedItemsChanged(){
			if(propertyBindingSelectedItems)
				selectedItemsChanged(propertyBindingSelectedItems[S.GET]());
			else if(propertyBindingSelectedValues) selectedValuesChanged(propertyBindingSelectedValues[S.GET]());
		}
		function setEntriesVisible(value){
			if(value) element.classList.add('visible');
			else element.classList.remove('visible');
		}
		function createView(item){
			return new Entry(item, entrySelectedChanged);
		}
		function entrySelectedChanged(){
			var selectedWrappers = orderedItems[S.GET_ITEMS]()[S.WHERE](function(x){ return x[S.GET_SELECTED]();})[S.TO_LIST]();
			var selectedValues = selectedWrappers[S.SELECT](function(x){ return x[S.GET_VALUE]();})[S.TO_LIST]();
			var selectedItems = selectedWrappers[S.SELECT](function(x){ return x[S.GET_ITEM]();})[S.TO_LIST]();
			var selectedText = selectedWrappers[S.SELECT](function(x){ return x[S.GET_TEXT]();})[S.TO_LIST]();
			dispatchChanged(selectedValues, selectedItems, selectedText);
			if(propertyBindingSelectedItems)propertyBindingSelectedItems[S.SET](selectedItems);
			if(propertyBindingSelectedValues)propertyBindingSelectedValues[S.SET](selectedValues);
		}
		function getMapItemValueToItems(){
			var items = orderedItems[S.GET_ITEMS]();
			var map={};
			each(items, function(item){
				map[item[S.GET_VALUE]()]=item;
			});
			return map;
		}
		function selectedItemsChanged(value){
			if(loopBreakSelected[S.TRIGGER]())return;
			each(orderedItems[S.GET_ITEMS](), function(wrapper){
				var item = wrapper[S.GET_ITEM]();
				wrapper[S.SET_SELECTED](value.indexOf(item)>=0);
			});
		}
		function selectedValuesChanged(value){
			if(loopBreakSelected[S.TRIGGER]())return;
			var mapItemValueToItems = getMapItemValueToItems();
			each(value, function(itemValue){
				var item = mapItemValueToItems[itemValue];
				if(item==undefined||item==null) new Error('The item value "'+itemValue+'"  does not exist in the selected values provided');
				item[S.SET_SELECTED](true);
				delete mapItemValueToItems[itemValue];
			});
			for(var itemValue in mapItemValueToItems){
				var item = mapItemValueToItems[itemValue];
				item[S.SET_SELECTED](false);
			}
		}
		function dispatchChanged(selectedValues, selectedItems, selectedText){
			var p = {};
			p[S.TYPE]= S.CHANGED;
			p[S.SELECTED_VALUES]= selectedValues;
			p[S.SELECTED_ITEMS]=selectedItems;
			p[S.SELECTED_TEXT]=selectedText;
			self[S.DISPATCH_EVENT](p);
		}
		function determineItemType(){
			var itemType = ItemTypes.String;
			if(itemTextName){
				if(!itemValueName)throw new Error('ItemTextName supplied but no ItemValueName supplied');
				itemType = ItemTypes.Simple;
			}
			else{
				if(itemValueName)throw new Error('ItemValueName supplied but no ItemTextName');
			}
			
			if(propertyNameItemText){
				if(!propertyNameItemValue)throw new Error('PropertyNameItemText supplied but no PropertyNameItemValue');
				itemType = ItemTypes.Model;
			}
			else{
				if(propertyNameItemValue)throw new Error('PropertyNameItemValue supplied but no PropertyNameItemText');
			}
			
			if((itemTextName||itemValueName)&&(propertyNameItemText||propertyNameItemValue)){
				var str ='';
				var arrProperties=[];
				if(itemTextName)arrProperties.push(itemTextName);
				if(itemValueName)arrProperties.push(itemValueName);
				if(propertyNameItemText)arrProperties.push(propertyNameItemText);
				if(propertyNameItemValue)arrProperties.push(propertyNameItemValue);
				while(arrProperties.length>0){
					var arrProperty = arrProperties.splcie(0, 1)[0];
					str+=arrProperty;
					str+=(arrProperties.length>1?', ':(arrProperties.length>0?' and ':' were all supplied. Preventing the MultiSelect determining if items are Simple objects or Model'));
				}
			}
			return itemType;
		}	
		function getConvertItem(itemType){
			switch(itemType){
				case ItemTypes.String:
					return function(str){
						return new StringWrapper(str);
					};
				break;
				case ItemTypes.Simple:
					return function(simple){
						return new SimpleWrapper(simple, itemTextName, itemValueName);
					};
				break;
				default:return function(model){
					return new ModelWrapper(model, propertyNameItemText, propertyNameItemValue, propertyNameItemSelected);
				};
			}
		}
    };
	function AllEntry(multiSelect){
		var element = E.LI();
		element.classList.add('all');
		this[S.GET_ELEMENT]=function(){
			return element;
		};
	}
	function Entry(itemWrapper, callbackSelectChanged){
		var element = E.LI();
		element.classList.add('entry');
		element.innerHTML = itemWrapper[S.GET_TEXT]();
		element.addEventListener('mousedown', click);
		itemWrapper[S.ON_TEXT_CHANGED]=onTextChanged;
		itemWrapper[S.ON_VALUE_CHANGED]=onValueChanged;
		itemWrapper[S.ON_SELECTED_CHANGED]=onSelectedChanged;
		itemWrapper[S.BIND]&&itemWrapper[S.BIND]();
		var _value = itemWrapper[S.GET_VALUE]();
		var _selected;
		this[S.GET_VALUE]=function(){
			return _value;
		};
		this[S.GET_ELEMENT]=function(){
			return element;
		};
		this[S.DISPOSE]=function(){
			itemWrapper[S.DISPOSE]&&itemWrapper[S.DISPOSE]();
		};
		function onTextChanged(value){
			element.innerHTML = value;
		}
		function onValueChanged(value){
			_value = value;
		}
		function onSelectedChanged(value){
			setSelectedClass(value);
			var oldValue = _selected;
			_selected = value;
			/*if(_selected!=oldValue)
				callbackSelectChanged(value);*/
		}
		function setSelectedClass(value){
			if(value) element.classList.add('selected');
			else element.classList.remove('selected');
		}
		function click(e){
			var oldValue = _selected;
			_selected = !itemWrapper[S.GET_SELECTED]();
			setSelectedClass(_selected);
			itemWrapper[S.SET_SELECTED](_selected);
			if(oldValue!=_selected)
				callbackSelectChanged(_selected);
		}
	}
	function ModelWrapper(model, propertyNameItemText, propertyNameItemValue, propertyNameItemSelected){
		var self = this;
		var propertyBindingItemText = PropertyBinding[S.STANDARD](this, model, propertyNameItemText, itemTextChanged, true);
		var propertyBindingItemValue = PropertyBinding[S.STANDARD](this, model, propertyNameItemValue, itemValueChanged, true);
		var propertyBindingItemSelected;
		if(propertyNameItemSelected)
		propertyBindingItemSelected = PropertyBinding[S.STANDARD](this, model, propertyNameItemSelected, itemSelectedChanged, true);
		var text = propertyBindingItemText[S.GET]();
		var _value = propertyBindingItemValue[S.GET]();
		var selected = propertyBindingItemSelected?propertyBindingItemValue[S.GET]():false;
		this[S.GET_TEXT]=function(){return text;};
		this[S.GET_VALUE]=function(){return propertyBindingItemValue[S.GET]();};
		this[S.GET_SELECTED]=function(){return selected;};
		this[S.SET_SELECTED]=function(value){
			selected = value;
			self[S.ON_SELECTED_CHANGED](value);
			propertyBindingItemSelected&&propertyBindingItemSelected[S.SET](value);};
		this[S.GET_ITEM]=function(){return model;};
		this[S.BIND]=function(){
			itemTextChanged(propertyBindingItemText[S.GET]());
			itemValueChanged(propertyBindingItemValue[S.GET]());
			if(propertyBindingItemSelected)
				itemSelectedChanged(propertyBindingItemSelected[S.GET]());
		};
		function itemTextChanged(value){
			text=value;
			dispatchTextChanged(value);
		}
		function itemValueChanged(value){
			_value = value;
			dispatchValueChanged(value);
		}
		function itemSelectedChanged(value){
			selected = value;
			dispatchSelectedChanged(value);
		}
		function dispatchTextChanged(value){
			self[S.ON_TEXT_CHANGED](value);
		}
		function dispatchValueChanged(value){
			self[S.ON_VALUE_CHANGED](value);
		}
		function dispatchSelectedChanged(value){
			self[S.ON_SELECTED_CHANGED](value);
		}
	}
	function SimpleWrapper(simple, itemTextName, itemValueName){
		var self = this;
		this[S.GET_TEXT]=function(){return simple[itemTextName];};
		this[S.GET_VALUE]=function(){return simple[itemValueName];};
		var selected = false;
		this[S.SET_SELECTED]=function(value){
			selected = value;
			dispatchSelectedChanged(value);
		};
		this[S.GET_SELECTED]=function(){
			return selected;
		};
		this[S.GET_ITEM]=function(){return simple;};
		function dispatchSelectedChanged(value){
			self[S.ON_SELECTED_CHANGED](value);
		}
	}
	function StringWrapper(str){
		var self = this;
		var selected=false;
		this[S.GET_TEXT]=function(){return str;};
		this[S.GET_VALUE]=function(){return str;};
		this[S.GET_SELECTED]=function(){return selected;};
		this[S.SET_SELECTED]=function(value){selected = value;
		dispatchSelectedChanged(value);};
		this[S.GET_ITEM]=function(){return str;};
		function dispatchSelectedChanged(value){
			self[S.ON_SELECTED_CHANGED](value);
		}
	}
})();