var MenuItem = window['MenuItem']=(function(){
	var _MenuItem = function(params){
		EventEnabledBuilder(this);
		var self = this;
		var propertyNameItemId = params[S.PROPERTY_NAME_ITEM_ID];
		var propertyNameItems = params[S.PROPERTY_NAME_ITEMS];
		var propertyNameText = params[S.PROPERTY_NAME_TEXT];
		var propertyNameEnabled = params[S.PROPERTY_NAME_ENABLED];
		var propertyNameVisible = params[S.PROPERTY_NAME_VISIBLE];
		var propertyNameOnClick = params[S.PROPERTY_NAME_ON_CLICK];
		var propertyNameOnHover = params[S.PROPERTY_NAME_ON_HOVER];
		var parent = params[S.PARENT];
		var model = params[S.MODEL];
		var className=params[S.CLASS_NAME];
		var classNames =params[S.CLASS_NAMES];
		var createView = params[S.CREATE_VIEW];
		var element = E.LI();
		var popupElement;
		var popup;
		var paragraph = E.P();
		var onClick;
		//var parentIsMenuItem=parent['getMenuType']()===MenuTypes.Item;
		var parentIsPopup = params[S.PARENT_IS_POPUP];
		element.appendChild(paragraph);
		element.classList.add('menu-item');
		if(className)
			element.classList.add(className);
		if(classNames)each(classNames, function(className){
			element.classList.add(className);
		});
		if(hasItems()){
			var p = {};
			p[S.CLASS_NAME]=className;
			p[S.CLASS_NAMES]=classNames;
			p[S.ELEMENT]=E.UL();
			popup = new Popup(p);
			popupElement = popup['getElement']();
			popupElement.classList.add('menu-item-popup');
			element.appendChild(popupElement);
			popup['addEventListener']('hide', popupHiding);
			p = {};
			p[S.ELEMENT]=popupElement;
			p[S.MODEL]=model;
			p[S.PROPERTY_NAME_ITEMS]=propertyNameItems;
			p[S.PROPERTY_NAME_ITEM_ID]=propertyNameItemId;
			p[S.CREATE_VIEW]=_createView;
			var orderedItems = new OrderedItems(p);
		}
		
		var propertyBindingText = PropertyBinding[S.STANDARD](this, model, S.TEXT, textChanged);
		var propertyBindingOnClick;
		if(propertyNameOnClick){
			propertyBindingOnClick = PropertyBinding[S.STANDARD](this, model, propertyNameOnClick, onClickChanged);
			onClick=propertyBindingOnClick['get']();
		}
		this['getMenuType']=function(){
			return MenuTypes.Item;
		};
		this['getElement'] = function(){return element;};
		this['setVisible']=function(value){
			element.style.display=value?'list-item':'none';
		};
		this['dispose']=function(){
			
		};
		this['hide']=function(){
			popup&&popup['hide']();
		};
		element.addEventListener('click', _click);
		function hideEntireMenu(){
			dispatchHideEntireMenu();
		}
		function textChanged(value){
			paragraph.innerHTML = value;
		}
		function hasItems(){
			if(!model)return false;
			var methodName = PropertyHelper['getGetterName'](propertyNameItems);
			var method = model[methodName];
			if(!method)return false;
			var items = method();
			if(!items)return false;
			return items.length>0;
		}
		function _createView(model){
			var p = {};
			p[S.MODEL]=model;
			p[S.PROPERTY_NAME_ITEM_ID]=propertyNameItemId;
			p[S.PROPERTY_NAME_ITEMS]=propertyNameItems;
			p[S.PROPERTY_NAME_TEXT]=propertyNameText;
			p[S.PROPERTY_NAME_ENABLED]=propertyNameEnabled;
			p[S.PROPERTY_NAME_VISIBLE]=propertyNameVisible;
			p[S.PROPERTY_NAME_ON_CLICK]=propertyNameOnClick;
			p[S.PARENT]=self;
			p[S.CLASS_NAME]=className;
			p[S.CLASS_NAMES]=classNames;
			p[S.CREATE_VIEW]=createView;
			p[S.PARENT_IS_POPUP]=true;
			var view;
			if(createView)
				view = createView(p);
			if(!view)
				view = new MenuItem(p);
			if(view['addEventListener']){
				view['addEventListener']('showingpopup', onShowingPopup);
				view['addEventListener']('hidingpopup', onHidingPopup);
				view['addEventListener']('hideentiremenu', onHideEntireMenu);
			}
			return view;
		}
		function showPopup(){
			if(!orderedItems['hasItems']())return;
			popup['show']();
			setPopupPosition();
			dispatchShowingPopup(popup);
			addActiveEnd();
		}
		function onShowingPopup(e){
			popup['addChildPopup'](e['popup']);
			self['dispatchEvent'](e);
			removeActiveEnd();
		}
		function onHidingPopup(e){
			addActiveEnd();
		}
		function setPopupPosition(){
			if(parentIsPopup)setPopupPositionParentIsPopup();
			else setPopupPositionParentIsNotPopup();
		}
		function setPopupPositionParentIsPopup(){
			var viewportDimensions = getViewportDimensions();
			popup['setPosition'](getPopupPositionRightParentIsPopup());
			if(popup['isWithinViewport'](viewportDimensions))return;
			popup['setPosition'](getPopupPositionLeftParentIsPopup());
			if(popup['isWithinViewport'](viewportDimensions))return;
			popup['setPosition'](getPopupPositionOnTopParentIsPopup());
			if(!popupIsOverflowingRight(viewportDimensions))return;
			popup['setPosition'](getPopupPositionShiftedLeftParentIsPopup(viewportDimensions));
		}
		function setPopupPositionParentIsNotPopup(){
			popup['setPosition'](getPopupPositionRightParentIsNotPopup());
			var viewportDimensions = getViewportDimensions();
			if(!popupIsOverflowingRight(viewportDimensions))return;
			popup['setPosition'](getPopupPositionShiftedLeftParentIsNotPopup(viewportDimensions));
		}
		function popupIsOverflowingRight(viewportDimensions){
			return isOverflowingViewportRight(popupElement, viewportDimensions);
		}
		function getPopupPositionRightParentIsPopup(){
			return {'top':element.offsetTop, 'left':(element.offsetWidth-3)};
		}
		function getPopupPositionLeftParentIsPopup(){
			return {'top':element.offsetTop, 'left':(3-popupElement.offsetWidth)};
		}
		function getPopupPositionOnTopParentIsPopup(){
			return {'top':getTopParentIsPopup(), 'left':3};
		}
		function getPopupPositionRightParentIsNotPopup(){
			return {'top':element.offsetHeight, 'left':element.offsetLeft};
		}
		function getPopupPositionShiftedLeftParentIsNotPopup(viewportDimensions){
			var left = viewportDimensions[0]-(popupElement.offsetWidth+1);
			return {'left':left,'top':element.offsetHeight};
		}
		function getPopupPositionShiftedLeftParentIsPopup(viewportDimensions){
			var absolutePositionParent = getAbsolute(popupElement.parentNode);
			var left = viewportDimensions[0]-(popupElement.offsetWidth+3 +absolutePositionParent.left);
			return {'left':left,'top':getTopParentIsPopup()};
		}
		function getTopParentIsPopup(){
			return element.offsetTop +(element.offsetHeight-3);
		}
		function _click(e){
			e=e||window.event;
			e.preventDefault();
			e.stopPropagation();
			dispatchActivated();
			addActiveEnd();
			var p={};
			p[S.MENU_ITEM]=model;
			onClick&&onClick(p);
			if(hasItems())
				showPopup();
			else
				hideEntireMenu();
		}
		function popupHiding(){
			removeActiveEnd();
			dispatchHidingPopup(popup);
		}
		function dispatchActivated(){
			var p = {};
			p[S.TYPE]='activated';
			p[S.MENU_ITEM]=self;
			self['dispatchEvent'](p);
		}
		function dispatchShowingPopup(popup){
			var p ={};
			p[S.TYPE]='showingpopup';
			p[S.POPUP]=popup;
			p[S.MENU_ITEM]=self;
			self['dispatchEvent'](p);
		}
		function dispatchHidingPopup(popup){
			var p ={};
			p[S.TYPE]='hidingpopup';
			p[S.POPUP]=popup;
			p[S.MENU_ITEM]=self;
			self['dispatchEvent'](p);
		}
		function dispatchHideEntireMenu(popup){
			var p ={};
			p[S.TYPE]='hideentiremenu';
			p[S.MENU_ITEM]=self;
			self['dispatchEvent'](p);
		}
		function addActiveEnd(){
			if(popupElement)
				popupElement.classList.add('active-end');
		}
		function removeActiveEnd(){
			if(popupElement)
				popupElement.classList.remove('active-end');
		}
		function onClickChanged(value){
			onClick = value;
		}
		function onHideEntireMenu(e){
			popup&&popup['hide']();
			self['dispatchEvent'](e);
		}
	};
	return _MenuItem;
})();