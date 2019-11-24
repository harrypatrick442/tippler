var Popup= new (function(){
	//var active;
	var _Popup = function(params){
		params=params||{};
		EventEnabledBuilder(this);
		var self = this;
		var className=params[S.CLASS_NAME];
		var classNames =params[S.CLASS_NAMES];
		var propertyNameVisible = params[S.PROPERTY_NAME_VISIBLE];
		var element = params[S.ELEMENT];
		var model = params[S.MODEL];
		var clickedOffHandle;
		var childPopups = [];
		if(!element)
			element = E.DIV();
		var showing = false;
		var disposed = false;
		if(className)
			element.classList.add(className);
		if(classNames)each(classNames, function(className){
			element.classList.add(className);
		});
		var closeOnClickOff = params[S.CLOSE_ON_CLICK_OFF]==undefined?true:params[S.CLOSE_ON_CLICK_OFF];
		element.classList.add('popup');
		var propertyBindingVisible;
		if(propertyNameVisible)
			propertyBindingVisible = PropertyBinding[S.STANDARD](this, model, propertyNameVisible, visibleChanged);
		this[S.SHOW] = show;
		this[S.HIDE] = hide;
		function visibleChanged(value){
			(value?_show:_hide)();
		}
		function show(){
			setVisible(true);
		}
		function _show(){
			if(showing)return;
			if(closeOnClickOff)
				if(clickedOffHandle)clickedOffHandle[S.DISPOSE]();
				clickedOffHandle = ClickedOff[S.REGISTER](element, hide);
			setVisibleClass(true);
			showing = true;
			dispatchShow();
		}
		function setVisible(value){
			if(propertyBindingVisible)
				propertyBindingVisible[S.SET](value);
			else
				visibleChanged(value);
		}
		this[S.SET_POSITION]=function(params){
			if(params[S.LEFT])
				element.style.left=getPositionString(params[S.LEFT]);
			if(params[S.TOP])
				element.style.top=getPositionString(params[S.TOP]);
			if(params[S.RIGHT])
				element.style.right=getPositionString(params[S.RIGHT]);
			if(params[S.BOTTOM])
				element.style.bottom=getPositionString(params[S.BOTTOM]);
		};
		this[S.DISPOSE] = dispose;
		this[S.ADD_CHILD_POPUP] = function(childPopup){//a child control which can be outside the bounds but will not trigger a click off when its clicked on.
			if(!showing)throw new Error('Cant add child while popup is not showing. Children should be added when made visible only');
			if(!clickedOffHandle)return;
			childPopup.addEventListener(S.HIDE, childHidden);
			clickedOffHandle[S.ADD_ADDITIONAL_ELEMENT](childPopup[S.GET_ELEMENT]());
			childPopups.push(childPopup);
		};
		this[S.IS_WITHIN_VIEWPORT]=function(viewportDimensions){
			return isWithinViewport(element,viewportDimensions);
		};
		this[S.GET_ELEMENT] = function(){return element;};
		function hide(){
			setVisible(false);
		}
		function childHidden(e){
			removeChildPopup(e[S.POPUP]);
		}
		function dispose(){
			if(disposed)return;
			disposed = true;
			if(closeOnClickOff)
				clickedOffHandle[S.DISPOSE]();
			element.parentNode.removeChild(element);
		}
		function removeChildPopup(childPopup){
			clickedOffHandle[S.REMOVE_ADDITIONAL_ELEMENT](childPopup[S.GET_ELEMENT]());
			var index = childPopups.indexOf(childPopup);
			if(index<0)return;
			childPopups.splice(index, 1);
		}
		function onHidingPopup(e){
			//self['addChildPopup'](e['popup']);
			//addActiveEnd();
		}
		function _hide(){
			if(!showing)return;
			showing = false;
			if(closeOnClickOff)clickedOffHandle[S.DISPOSE]();
			setVisibleClass(false);
			each(childPopups.slice(), removeChildPopup);
			dispatchHide();
		}
		function setVisibleClass(value){
			if(value)element.classList.add('visible');
			else element.classList.remove('visible');
		}
		function dispatchHide(){
			self[S.DISPATCH_EVENT]({[S.TYPE]:S.HIDE, [S.POPUP]:self});
		}
		function dispatchShow(){
			self[S.DISPATCH_EVENT]({[S.TYPE]:S.SHOW, [S.POPUP]:self});
		}
		function getPositionString(o){
			if(typeof(o)==='string')
				return o;
			return String(o)+'px';
		}
	};
	return _Popup;
})();