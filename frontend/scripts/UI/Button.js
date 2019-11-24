var Button = (function () {
    var _Button = function (params) {
        EventEnabledBuilder(this);
        var self = this;
        var preventPropagation = params[S.PREVENT_PROPAGATION];
        var className = params[S.CLASS_NAME];
        var classNames = params[S.CLASS_NAMES];
        var classNameToggled = params[S.CLASS_NAME_TOGGLED];
        var model = params[S.MODEL];
		var isToggle = params[S.TOGGLE];
		var toggled;
		var imageName=params[S.IMAGE_NAME];
		var imageSemantic=params[S.IMAGE_SEMANTIC];
		var imageSemanticHover=params[S.IMAGE_SEMANTIC_HOVER];
        var parameterNameDisabled = params[S.PROPERTY_NAME_DISABLED];
		var propertyNameText = params[S.PROPERTY_NAME_TEXT];
		var propertyNameVisible = params[S.PROPERTY_NAME_VISIBLE];
        var text = params[S.TEXT];
		var _click = params[S.CLICK];
        var methodNameClick = params[S.METHOD_NAME_CLICK];
        var element = E.BUTTON();
		var disposed=false;
        if (className)
            element.classList.add(className);
        if (classNames)
            each(classNames, function (className) {
                element.classList.add(className);
            });
        element.classList.add('button');
        var getToggled;
		var setToggled;
		var propertyBindingToggled;
		var imageControl;
		if(imageName||imageSemantic){
			createImageControl(imageName, imageSemantic, imageSemanticHover);
		}
		else
			setTimeout(doSpritesheetImageFromCssIfHasOne, 0);
        var propertyBindingDisabled;
		var propertyBindingText;
        if (parameterNameDisabled) {
            propertyBindingDisabled = PropertyBinding[S.STANDARD](this, model, parameterNameDisabled, disabledChanged);
           // disabledChanged(propertyBindingDisabled.get());
        }
		var propertyBindingVisible;
		if(propertyNameVisible){
			propertyBindingVisible = PropertyBinding[S.STANDARD](this, model, propertyNameVisible, visibleChanged);
		}
		if(propertyNameText){
			propertyBindingText = PropertyBinding[S.STANDARD](this, model, propertyNameText, textChanged);
		}
        if (text)
            textChanged(text);
        element.addEventListener('click', click);
		if(isToggle){
			var propertyNameToggled = params[S.PROPERTY_NAME_TOGGLED];
			if(propertyNameToggled){
				propertyBindingToggled = PropertyBinding[S.STANDARD](this, model, propertyNameToggled, toggledChanged);
				getToggled = function(){return propertyBindingToggled[S.GET]();};
				setToggled = function(value){ propertyBindingToggled[S.SET](value);};
			}
			else{
				toggled = params[S.TOGGLED] ? true : false;
				getToggled = function(){return toggled;}
				setToggled=function(value){ 
					toggled = value;
					toggledChanged(value);
				};
				setToggled(toggled);
			}
		}
		var customAddEventListener = this.addEventListener;
		this.addEventListener=function(type, callback){
			switch(type){
				case 'mouseenter':
					element.addEventListener('mouseenter', callback);
					break;
				case 'mouseleave':
					element.addEventListener('mouseleave', callback);
					break;
				default:
					customAddEventListener(type, callback);
					break;
			}
		};
		var customRemoveEventListener = this.removeEventListener
		this.removeEventListener=function(type, callback){
			switch(type){
				case 'mouseenter':
					element.removeEventListener('mouseenter', callback);
					break;
				case 'mouseleave':
					element.removeEventListener('mouseleave', callback);
					break;
				default:
					customRemoveEventListener(type, callback);
					break;
			}
		};
        this[S.GET_ELEMENT] = function () { return element; };
        this[S.SET_DISSABLED] = function (value) {
            disabledChanged(value);
        };
		this[S.DISPOSE]=function(){
			imageControl&&imageControl[S.DISPOSE]();
			self[S.MY_BINDINGS]&&self[S.MY_BINDINGS][S.DISPOSE]();
		};
        function click(e) {
            e = e || window.event;
            if (preventPropagation) {
                e.stopPropagation();
            }
			e.preventDefault();
            methodNameClick&&model[methodNameClick]();
			_click&&_click(e);
            dispatchClick();
            toggle();
        }
        function toggle() {
            if (!isToggle) return;
			var toggled = !getToggled();
			setToggled(toggled);
			dispatchToggled(toggled);
        }
        function dispatchClick() {
			var p ={};
			p[S.TYPE]= S.CLICK;
            self[S.DISPATCH_EVENT](p);
        }
        function dispatchToggled(toggled) {
			var p={};
			p[S.TYPE]= S.TOGGLED;
			p[S.TOGGLED]=toggled;
            self[S.DISPATCH_EVENT](p);
        }
        function disabledChanged(value) {
            element.disabled = value ? true : false;
        }
		function visibleChanged(value){
			if(value)element.classList.add('visible');
			else element.classList.remove('visible');
		}
		function textChanged(value){
			element.innerHTML=value;
		}
		function toggledChanged(value){
            if (value)
                element.classList.remove(classNameToggled);
			else
                element.classList.add(classNameToggled);
		}
        function doSpritesheetImageFromCssIfHasOne() {
			if(disposed)return;
            var spritesheetImageName = ImageControl[S.GET_SPRITESHEET_IMAGE_NAME_FROM_ELEMENT_CSS](element);
            if (!spritesheetImageName) return;
            createImageControl(spritesheetImageName);
        }
		function createImageControl(name, semantic, semanticHover){
			var p = {};
            p[S.NAME] = name;
			p[S.SEMANTIC]=semantic;
			if(semanticHover){
			    p[S.SEMANTIC_HOVER]=semanticHover;
				p[S.HOVER_OVERRIDDEN]=true;
				var imageControl = _createImageControl(p);
				element.addEventListener('mouseenter', function(){imageControl[S.SET_HOVERING](true)});
				element.addEventListener('mouseleave', function(){imageControl[S.SET_HOVERING](false);});
				return;
			}
			_createImageControl(p);
		}
		function _createImageControl(p){
			imageControl = new ImageControl(p);
            element.appendChild(imageControl['getElement']());
			return imageControl;
		}
    };
    return _Button;
})();