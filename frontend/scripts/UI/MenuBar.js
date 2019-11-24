var MenuBar = window['MenuBar']=(function(){
	var _MenuBar = function(params){
		var self = this;
		var model = params[S.MODEL];
		var propertyNameItemId = params[S.PROPERTY_NAME_ITEM_ID];
		var propertyNameItems = params[S.PROPERTY_NAME_ITEMS];
		var propertyNameText = params[S.PROPERTY_NAME_TEXT];
		var propertyNameEnabled = params[S.PROPERTY_NAME_ENABLED];
		var propertyNameVisible = params[S.PROPERTY_NAME_VISIBLE];
		var propertyNameOnClick = params[S.PROPERTY_NAME_ON_CLICK];
		var createView = params[S.CREATE_VIEW];
		var className=params[S.CLASS_NAME];
		var classNames = params[S.CLASS_NAMES];
		var _createView = __createView;
		var hasPopupItems;
		var popup,popupElement;
		var activeMenuItem;
		var element = E.UL();
		element.classList.add('menu-bar');
		if(className)
			element.classList.add(className);
		if(classNames)each(classNames, function(className){
			element.classList.add(className);
		});
		
		
		this['getMenuType']=function(){
			return MenuTypes.Bar;
		};
		
		var p = {};
		p[S.ELEMENT]=element;
		p[S.MODEL]=model;
		p[S.PROPERTY_NAME_ITEMS]=propertyNameItems;
		p[S.PROPERTY_NAME_ITEM_ID]=propertyNameItemId;
		p[S.CREATE_VIEW]=createViewForMenuItem;
        var orderedItems = new OrderedItems(p);
		orderedItems.addEventListener(S.CHANGED, itemsChanged);
		var orderedItemsPopup;
		
			
		p = {};
		p[S.CLASS_NAME]=className;
		p[S.CLASS_NAMES]=classNames;
		p[S.ELEMENT]=E.UL();
		popup = new Popup(p);
		popupElement = popup[S.GET_ELEMENT]();
		popupElement.classList.add('menu-item-popup');
		element.appendChild(popupElement);
		p={};
		p[S.CLASS_NAME]='menu-item-hamburger';
		p[S.IMAGE_SEMANTIC]= S.MAIN_MENU_HAMBURGER;
		p[S.IMAGE_SEMANTIC_HOVER]= S.MAIN_MENU_HAMBURGER_HOVER;
		p[S.CLICK]=buttonMobileMenuClick;
		var buttonMobileMenu= new Button(p);
		element.appendChild(buttonMobileMenu[S.GET_ELEMENT]());
		buttonMobileMenu
		p = {};
		p[S.ELEMENT]=popupElement;
		p[S.MODEL]=model;
		p[S.PROPERTY_NAME_ITEMS]=propertyNameItems;
		p[S.PROPERTY_NAME_ITEM_ID]=propertyNameItemId;
		p[S.CREATE_VIEW]=createViewForMobilePopup;
		orderedItemsPopup = new OrderedItems(p);
		
		setTimeout(updateItemVisibility,0);
		p = {};
		p[S.ELEMENT]=element;
		p[S.ON_RESIZED]=onResize;
		p[S.ON_FIRST_RESIZE]=onFirstResize;
		p[S.STAGGERED]=true;
		var resizeManagerWatcher = ResizeManager[S.ADD](p);
		var controlsCollection = new ControlsCollection( orderedItems,
		orderedItemsPopup, buttonMobileMenu);
		this[S.GET_ELEMENT] = function(){return element;};
		this[S.DISPOSE]=function(){
			controlsCollection[S.DISPOSE]();
			resizeManagerWatcher[S.DISPOSE]();
		};
		function updateItemVisibility(){
			var itemIds = orderedItems['getItemIds']();
			var halfBarHeight = element.offsetHeight/2;
			hasPopupItems=false;
			setHamburgerButtonVisible(false);
			var lastViewElement;
			var lastPopupView;
			each(itemIds, function(itemId){
				var barView = orderedItems['getViewFromItemId'](itemId);
				var viewElement = barView['getElement']();
				var popupView = orderedItemsPopup['getViewFromItemId'](itemId);
				
				if(updatePopupViewVisability(viewElement, popupView, halfBarHeight)&&!hasPopupItems){
					setHamburgerButtonVisible(true);
					if(lastViewElement)
						updatePopupViewVisability(lastViewElement, lastPopupView, halfBarHeight);
					hasPopupItems=true;
				}
				//barView['setVisible'](!overflowing);
				lastViewElement = viewElement;
				lastPopupView = popupView;
			});
		}
		function updatePopupViewVisability(viewElement, popupView, halfBarHeight){
			var overflowing=viewElement.offsetTop>halfBarHeight;
			popupView['setVisible'](overflowing);
			return overflowing;
		}
		function buttonMobileMenuClick(e){
			if(!hasPopupItems)return;
			popup['show']();
			setMobilePopupPosition();
			addActiveEnd();
		}
		function setMobilePopupPosition(){
			var buttonMobileMenuElement = buttonMobileMenu['getElement']();
			var left = buttonMobileMenuElement['offsetLeft']+buttonMobileMenuElement['offsetWidth']-popupElement['offsetWidth'];
			var top = buttonMobileMenuElement['offsetHeight']+buttonMobileMenuElement['offsetTop'];
			popup['setPosition']({'left':left,'top':top});
			
		}
		function setHamburgerButtonVisible(value){
			buttonMobileMenu['getElement']().style.display=value?'block':'none';
			if(value)
				element.classList.add('hamburger-showing');
			else
				element.classList.remove('hamburger-showing');
		}
		function createViewForMobilePopup(model){
			p={};
			p[S.PARENT_IS_POPUP]=true;
			var view = _createView(model, p);
			if(view['addEventListener']){
				view['addEventListener']('showingpopup', onShowingPopupHamburger);
				view['addEventListener']('hidingpopup', onHidingPopup);
				view['addEventListener']('hideentiremenu', onHideEntireMenu);
			}
			return view;
		}
		function createViewForMenuItem(model){
			var view = _createView(model);
			if(view['addEventListener']){
				view['addEventListener'](S.ACTIVATED, onActivatedPopupMenuItem);
				view['addEventListener']('hidingpopup', onHidingPopup);
			}
			return view;
		}
		function __createView(model,p){
			p=p|| {};
			p[S.MODEL]=model;
			p[S.PROPERTY_NAME_ITEM_ID]=propertyNameItemId;
			p[S.PROPERTY_NAME_ITEMS]=propertyNameItems;
			p[S.PROPERTY_NAME_TEXT]=propertyNameText;
			p[S.PROPERTY_NAME_ENABLED]=propertyNameEnabled;
			p[S.PROPERTY_NAME_VISIBLE]=propertyNameVisible;
			p[S.PROPERTY_NAME_ON_CLICK]=propertyNameOnClick;
			p[S.PARENT]=self;
			p[S.CREATE_VIEW]=createView;
			p[S.CLASS_NAME]=className;
			p[S.CLASS_NAMES]=classNames;
			var view;
			if(createView)
				view = createView(p);
			if(!view)
				view = new MenuItem(p);
			return view;
		}
		function onShowingPopupHamburger(e){
			popup['addChildPopup'](e[S.POPUP]);
			removeActiveEnd();
		}
		function onActivatedPopupMenuItem(e){
			activeMenuItem = e[S.MENU_ITEM];
		}
		function onHidingPopup(e){
			addActiveEnd();
		}
		function onResize(e){
			updateItemVisibility();
		}
		function onFirstResize(){
			popup['hide']();
			activeMenuItem&&activeMenuItem['hide']();
			activeMenuItem=null;
		}
		function addActiveEnd(){
			if(popupElement)
				popupElement.classList.add('active-end');
		}
		function removeActiveEnd(){
			if(popupElement)
				popupElement.classList.remove('active-end');
		}
		function onHideEntireMenu(e){
			popup&&popup['hide']();
		}
		function itemsChanged(){
			setTimeout(updateItemVisibility,0);
		}
	};
	return _MenuBar;
})();