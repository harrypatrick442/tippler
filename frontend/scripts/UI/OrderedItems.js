var OrderedItems = new (function () {
    var _OrderedItems = function (params) {
		EventEnabledBuilder(this);
        var self = this;
        var element = params[S.ELEMENT];
		var model = params[S.MODEL];
		if(!model)throw new Error('No model provided');
		var propertyNameItems = params[S.PROPERTY_NAME_ITEMS];
		var createView = params[S.CREATE_VIEW];
		var convertItem = params[S.CONVERT_ITEM];
		if(!createView)throw new Error('createView not provided');
		var views=[];
		var mapItemIdToView={};
		var items;
		this[S.HAS_ITEMS]=function(){return views.length>0;};
		var propertyBindingItems;
		var itemsArePrimitives = params[S.ITEMS_ARE_PRIMITIVES];
		var getHash = itemsArePrimitives?function(item){return item;}:function(item){return HashBuilder(item);};
		if(convertItem)
			propertyBindingItems = (!itemsArePrimitives?PropertyBinding[S.ARRAY_CONVERSION]:PropertyBinding[S.ARRAY_CONVERSION_FROM_PRIMITIVES])(this, model, propertyNameItems, convertItem, undefined, itemsChanged)[S.GET_CARRIED_OVER]();
		else
			propertyBindingItems = PropertyBinding[S.STANDARD](this, model, propertyNameItems, itemsChanged);
		var hasItemsProperty=propertyBindingItems['get']()?true:false;
		if(!hasItemsProperty)return;//throw new Error('No '+propertyNameItems+' property on model of type '+model.constructor.name);
		this[S.GET_VIEW_FROM_ITEM_ID]=function(itemId){
			return mapItemIdToView[String(itemId)];
		};
		this[S.GET_VIEWS]=function(){	
			return views;
		};
		this[S.GET_ITEM_IDS]=function(){
			var list = [];
			for(var i in mapItemIdToView)
				list.push(i);
			return list;
		};
		this[S.GET_ITEMS]=function(){return items;};
		this[S.DISPOSE]=function(){
			self[S.MY_BINDINGS]&&self[S.MY_BINDINGS][S.DISPOSE]();
		};
		function itemsChanged(value){
			items = value;
			var itemsAndIndexToAdd = [];
			var itemIds =[];
			var lastElementPutInPlace;
			for(var i=0, item; item=items[i]; i++){
				var itemId = String(getHash(item));
				itemIds.push(itemId);
				var view = mapItemIdToView[itemId];
				if(!view)
					addItemAtIndex(item, i);
				else
					repositionItemIfNecessary(item, view, i);
			}
			var itemIdsToRemove = [];
			for(var i in mapItemIdToView){
				if(itemIds.indexOf(i)<0)
					itemIdsToRemove.push(i);
			}
			removeItemsById(itemIdsToRemove);
			dispatchChagned();
		}
		function addItemAtIndex(item, index){
			var view = createView(item);
			var viewElement = view[S.GET_ELEMENT]();
			var hash = getHash(item);
			mapItemIdToView[hash]=view;
			var nextView = views[index];
			if(!nextView){
				views.push(view);
				element.appendChild(view[S.GET_ELEMENT]());
				return;
			}
			views.splice(index, 0, view);
			var nextViewElement = nextView[S.GET_ELEMENT]();
			element.insertBefore(viewElement, nextViewElement);
		}
		function repositionItemIfNecessary(item, view, index){
			var currentIndex = views.indexOf(view);
			if(currentIndex==index)return;
			views.splice(currentIndex, 1);
			views.splice(index, 0, view);
			var viewsElement = view[S.GET_ELEMENT]();
			element.removeChild(viewsElement);
			var nextView = views[index+1];
			if(!nextView)
				element.appendChild(viewsElement);
			else
			{
				var nextViewElement = nextView[S.GET_ELEMENT]();
				element.insertBefore(viewsElement, nextViewElement);
			}				
		}
		function removeItemsById(itemIds){
			each(itemIds, function(itemId){
				removeItemById(itemId);
			});
		}
		function removeItemById(itemId){
			var view = mapItemIdToView[itemId];
			if(!view)return;
			view[S.DISPOSE]();
			var index = views.indexOf(view);
			views.splice(index, 1);
			delete mapItemIdToView[itemId];
			var viewElement = view['getElement']();
			element.removeChild(viewElement);
		}
		function dispatchChagned(){
			var p = {};
			p[S.TYPE]= S.CHANGED;
			self['dispatchEvent'](p);
		}
    };
    return _OrderedItems;
})();