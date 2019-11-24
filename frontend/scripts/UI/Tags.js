var Tags = window['Tags'] = (function(){
	var allowedCharacters=[];
	createAllowedCharacters();
	var _TagEditor = function(params){
		var self = this;
		var model = params[S.MODEL];
		var className = params[S.CLASS_NAME];
		var classNames = params[S.CLASS_NAMES];
		var propertyName = params[S.PROPERTY_NAME];
		var characterLimit = params[S.CHARACTER_LIMIT];
		var placeholder = params[S.PLACEHOLDER];
		var itemTextName = params[S.ITEM_TEXT_NAME];
		var itemValueName = params[S.ITEM_VALUE_NAME];
		if(!itemTextName) itemTextName = S.TEXT;
		if(!itemValueName)itemValueName = S.VALUE;
		var propertyNameReadOnly = params[S.PROPERTY_NAME_READ_ONLY];
		var propertyNameAllowSpace = params[S.PROPERTY_NAME_ALLOW_SPACE];
		var propertyNameVisible = params[S.PROPERTY_NAME_VISIBLE];
		var readOnly = params[S.READ_ONLY];
		var element = E.DIV();
		element.classList.add('tags-editor');
		var controlsCollection= new ControlsCollection();
		var addWrapper = E.DIV();
		addWrapper.classList.add('add-wrapper');
		var textAdd, buttonAdd;
		var allowSpace=false;
		function getButtonAdd(){
			if(!buttonAdd){
				buttonAdd = new Button({[S.CLASS_NAME]:'button-add',[S.TEXT]:'Add',[S.CLICK]:addNew});
				controlsCollection[S.ADD](buttonAdd);
			}
			return buttonAdd;
		}
		function getTextAdd(){
			if(!textAdd){
				textAdd = E.TEXT();
				textAdd.classList.add('text-add');
				textAdd.maxLength=characterLimit;
				if(placeholder)
				textAdd.placeholder=placeholder;
				controlsCollection[S.ADD](textAdd);
				textAdd.addEventListener('keydown', function (e) {
					e=e||window.event;
					var which = e.which;
					if (which === 13||which==188||(!allowSpace&&which==32)) {
						addNew();
						e.preventDefault();
					}
				});
			}
			return textAdd;
		}
		var menu = E.DIV();
		menu.classList.add('menu');
		menu.appendChild(addWrapper);
		element.appendChild(menu);
		if (className)
			element.classList.add(className);
		if (classNames)
			each(classNames, function (className) {
				element.classList.add(className);
			});
		var propertyBindingReadOnly;
		if(propertyNameReadOnly){
			propertyBindingReadOnly = PropertyBinding[S.STANDARD](this, model, propertyNameReadOnly, readOnlyChanged, true);
		}
		if(propertyBindingReadOnly&&propertyBindingReadOnly[S.GET]())readOnly=true;
		if(!readOnly){
			addWrapper.appendChild(getTextAdd());
			addWrapper.appendChild(getButtonAdd()[S.GET_ELEMENT]());
		}
		if(propertyNameVisible){
			PropertyBinding[S.STANDARD](this, model, propertyNameVisible, visibleChanged);
		}
		if(propertyNameAllowSpace)
			PropertyBinding[S.STANDARD](this, model, propertyNameAllowSpace, allowSpaceChanged);
		
		var orderedItems = new OrderedItems({
			[S.ELEMENT]:element,
			[S.MODEL]:model,
			[S.PROPERTY_NAME_ITEMS]:propertyName,
			[S.CREATE_VIEW]:createTagView,
			[S.ITEMS_ARE_PRIMITIVES]:false});
		controlsCollection[S.ADD](orderedItems);
		var propertyBindingReadOnly;
		this[S.GET_ELEMENT]=function(){
			return element;
		};
		this[S.DISPOSE]=function(){
			controlsCollection[S.DISPOSE];
			self[S.MY_BINDINGS]&&self[S.MY_BINDINGS][S.DISPOSE]();
		};
		var propertyBinding = PropertyBinding[S.STANDARD](this, model, propertyName, valueChanged);
		function allowSpaceChanged(value){
			allowSpace = value;
		}
		function readOnlyChanged(value){
			if(value==readOnly)return;
			if(!value){
				addWrapper.appendChild(getTextAdd());
				addWrapper.appendChild(getButtonAdd()[S.GET_ELEMENT]());
			}
			else{
				addWrapper.removeChild(getTextAdd());
				addWrapper.removeChild(getButtonAdd()[S.GET_ELEMENT]());
			}
			readOnly = value;
			if(!orderedItems)return;
			orderedItems[S.GET_VIEWS]()[S.EACH](function(tagView){
				tagView[S.SET_READ_ONLY](value);
			});
		}
		function visibleChanged(value){
			if(value)element.classList.add('visible');
			else element.classList.remove('visible');
		}
		function addNew(){
			var str =filterCharacters(textAdd.value);
			textAdd.value='';
			while(str[str.length-1]==' ')
				str=str.substr(0, str.length-1);
			while(str[0]==' ')
				str=str.substr(1, str.length-1);
			str=str.toLowerCase();
			if(str.length<=0)return;
			addNew(str);
			var items = getItems();
			var match = items.where(x=>x[itemTextName]==str).firstOrDefault();
			if(match)return;
			items.push({
				[itemTextName]:str
			});
			setItems(items);
		}
		function valueChanged(value){
			
		}
		function remove(tag){
			var items = getItems();
			setItems(items[S.WHERE](function(item){return item!==tag})[S.ORDER_BY](function(item){ return item[S.TEXT];})[S.TO_LIST]());
		}
		function getItems(){
			return propertyBinding[S.GET]();
		}
		function setItems(value){
			propertyBinding[S.SET](value.sort());
		}
		function filterCharacters(str){
			var res='';
			each(str, function(c){
				if(allowedCharacters.indexOf(c)>=0)
					res+=c;
			});
			return res;
		}
		function createTagView(tag){
			var tagView = new TagView(tag, remove, readOnly);
			return tagView;
		}
		function TagView(tag, remove, readOnly){
			var self = this;
			var element = E.DIV();
			element.classList.add('tag');
			var buttonRemove;
			function getButtonRemove(){
				if(!buttonRemove)
					buttonRemove = new Button({[S.CLICK]:dispatchRemove,[S.CLASS_NAME]:'remove',[S.IMAGE_SEMANTIC]:S.TAGS_EDITOR_TAG_REMOVE_ICON,
				[S.IMAGE_SEMANTIC_HOVER]:S.TAGS_EDITOR_TAG_REMOVE_ICON_HOVER});
				return buttonRemove;
			}
			element.appendChild(document.createTextNode(tag[itemTextName]));
			if(!readOnly)
				element.appendChild(getButtonRemove()[S.GET_ELEMENT]());
			this[S.GET_ELEMENT]=function(){
				return element;
			};
			this[S.DISPOSE]=function(){
				buttonRemove&&buttonRemove[S.DISPOSE]();
			};
			this[S.SET_READ_ONLY]=function(value){
				if(value==readOnly)return;
				readOnly = value;
				var buttonRemove = getButtonRemove();
				if(value)element.removeChild(buttonRemove[S.GET_ELEMENT]());
				else element.appendChild(buttonRemove[S.GET_ELEMENT]());
			};
			function dispatchRemove(){
				remove(tag);
			}
		}

	};
	return _TagEditor;	
	function createAllowedCharacters(){
		var ranges=[[48, 57],[65,90],[95,122],[32,32]];
		allowedCharacters=[];
		each(ranges, function(range){
			var from = range[0];
			var to = range[1];
			for(var i=from; i<=to; i++){
				allowedCharacters.push(String.fromCharCode(i));
			}
		});
	}
})();