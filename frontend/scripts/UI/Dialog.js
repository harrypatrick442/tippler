var Dialog =  window['Dialog']=(function(){
	var _Dialog = function(params){
		var self = this;
		var propertyNameVisible = params[S.PROPERTY_NAME_VISIBLE];
		var propertyNameMessage = params[S.PROPERTY_NAME_MESSAGE];
		var propertyNameOptions=params[S.PROPERTY_NAME_OPTIONS];
		var propertyNameTitle = params[S.PROPERTY_NAME_TITLE];
		var preventInterraction = params[S.PREVENT_INTERRACTION];
		var options = params[S.OPTIONS];
		var disposeOnHide=params[S.DISPOSE_ON_HIDE];
		var message = params[S.MESSAGE];
		var title = params[S.TITLE];
		var model = params[S.MODEL];
		var className = params[S.CLASS_NAME];
		var classNames = params[S.CLASS_NAMES];
		var callbackAll = params[S.CALLBACK];
		var popup = new Popup({closeOnClickOff:false});
		var element = popup[S.GET_ELEMENT]();
		var rootElement=element;
		if(preventInterraction){
			var p={};
			p[S.ELEMENT]=element;
			new PreventInterraction(p);
			var preventInterractionElement = element;
			element = E.DIV();
			preventInterractionElement.appendChild(element);
		}
		var disposed = false;
        if (className)
            element.classList.add(className);
		if(classNames)each(classNames, function(className){
			element.classList.add(className);
		});
		var inner = E.DIV();
		var messageElement = E.DIV();
		var titleElement;
		if(title||propertyNameTitle)
		{
			titleElement = E.DIV();
			titleElement.classList.add('title');
			inner.appendChild(titleElement);
			if(title)titleChanged(title);
		}
		element.classList.add('dialog');
		inner.classList.add('inner');
		messageElement.classList.add('message');
		messageChanged(message);
		document.body.appendChild(popup[S.GET_ELEMENT]());
		element.appendChild(inner);
		inner.appendChild(messageElement);
		var mapOptionHashToButton={};
		var buttons=[];
		var propertyBindingOptions,propertyBindingVisible,propertyBindingMessage;
		if(propertyNameOptions){
			propertyBindingOptions = PropertyBinding[S.STANDARD](this, model, propertyNameOptions, optionsChanged);
		}
		if(propertyNameVisible){
			propertyBindingVisible = PropertyBinding[S.STANDARD](this, model, propertyNameVisible, visibleChanged);
		}
		if(propertyNameMessage){
			propertyBindingMessage = PropertyBinding[S.STANDARD](this, model, propertyNameMessage, messageChanged);
		}
		else{
			if(options){
				optionsChanged(options);
			}
			else throw new Error('No options provided');
		}
		this[S.SHOW] = function(){
			if(disposed){
				setTimeout(function(){console.log(new Error('Cannot show after disposal'));},0);
				return self;
			}
			setVisible(true);
			return self;
		};
		this[S.DISPOSE] = dispose;
		function hide(){
			if(disposeOnHide){
				dispose();
				return;
			}
			if(propertyBindingVisible)
				propertyBindingVisible[S.SET](false);
			else
				setVisible(false);
		}
		function setVisible(value){
			if(value)
				popup[S.SHOW]();
			else
				popup[S.HIDE]();
		}
		function dispose(){
			if(disposed)return;
			disposed=true;
			popup[S.DISPOSE]();
			self[S.MY_BINDINGS]&&self[S.MY_BINDINGS][S.DISPOSE]();
			each(buttons, function(button){
				button[S.DISPOSE]();
			});
		}
		function optionsChanged(value){
			if(disposed)return;
			var hashesSeen=[];
			each(value, function(option){
				var hash = HashBuilder(option);
				hashesSeen.push(hash);
				var button = mapOptionHashToButton[hash];
				if(button){
					return;
				}
				button = createButton(option);
				mapOptionHashToButton[hash]=button;
				buttons.push(button);
				inner.appendChild(button[S.GET_ELEMENT]());
			});
			for(var hash in mapOptionHashToButton){
				if(hashesSeen.indexOf(hash)>=0)continue;
				removeButtonByHash(hash);
			}
		}
		function visibleChanged(value){
			setVisible(value);
		}
		function messageChanged(value){
			messageElement.innerHTML = value;
		}
		function titleChanged(value){
			titleElement.innerHTML = value;
		}
		function removeButtonByHash(hash){
			var button = mapOptionHashToButton[hash];
			delete mapOptionHashToButton[hash];
			buttons.splice(buttons.indexOf(button), 1);
			inner.removeChild(button[S.GET_ELEMENT]());
		}
		function createButton(option){
			var p ={};
			if(typeof(option)=='string'){
				p[S.CLICK] = function(){
					callbackAll&&callbackAll(option);
					hide();
				};
				p[S.TEXT]=option;
			}
			else{
				var model =p[S.MODEL] = option[S.MODEL];
				p[S.PROPERTY_NAME_DISABLED]= option[S.PROPERTY_NAME_DISABLED];
				var methodNameClick = option[S.METHOD_NAME_CLICK];
				if(methodNameClick&&!model)throw new Error('Method name click was supplied but no model');
				var _click = option[S.CLICK];
				p[S.TEXT] = option[S.TEXT];
				var classNames = option[S.CLASS_NAMES];
				if(!classNames)classNames=[];
				classNames.push('dialog-button');
				p[S.CLASS_NAMES]= classNames;
				p[S.CLASS_NAME]=option[S.CLASS_NAME];
				var callback = option[S.CALLBACK];
				p[S.CLICK] = function(e){
					callback&&callback(option);
					methodNameClick&&model[methodNameClick]();
					_click&&_click();
					callbackAll&&callbackAll(option);
					hide();
				};
			}
			return new Button(p);
		}
	};
	_Dialog[S.SHOW] = function(params){
		params[S.DISPOSE_ON_HIDE] = true;
		var dialog = new _Dialog(params);
		dialog[S.SHOW]();
		return dialog;
	};
	return _Dialog;
})();