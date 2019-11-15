//TODO

//Error with it not updating was caused by using changed in _carryOver with parent  name instead of viewModelName.
 var PropertyBinding = window['PropertyBinding']=(function(){
	const verbose = true;
	if(!verbose)console ={log:function(){}, error:function(){}};
	
	var _PropertyBinding = {};
	_PropertyBinding[S.STANDARD] = standard;
	
	//meOrParams, model, nameParam, onChange, converter, viewModelName, onSetByView
	/*params {
		S.ME
		S.MODEL
		S.NAME or S_NAMES
		S.VIEW_MODEL_NAME (optional)
		S.ON_CHANGE(optional) Not intended if more than one name supplied.
		S.CONVERTER (optional)
		S.ON_SET_BY_VIEW (optional)
	}*/
	_PropertyBinding[S.CARRY_OVER]= carryOver;
	
	//me, model, name, viewModelClass, onViewModelSet
	//me, model, name, viewModelName, viewModelClass, onViewModelSet
	_PropertyBinding[S.CARRY_OVER_CHILD_MODEL_AS_CHILD_VIEW_MODEL]= carryOverChildModelAsChildViewModel;
	
	_PropertyBinding[S.CARRY_OVER_CHILD_VIEW_MODEL_AS_CHILD_VIEW]=carryOverChildViewModelAsChildView;
	
	_PropertyBinding[S.ARRAY_CONVERSION]= arrayConversion;
	_PropertyBinding[S.ARRAY_CONVERSION_FROM_PRIMITIVES]=arrayConversionFromPrimitives;
	//me, model, name, createViewModel
    //me, model, name, viewModelsName, createViewModel
	_PropertyBinding[S.CARRY_OVER_MODEL_ARRAY_AS_VIEW_MODEL_ARRAY]=carryOverModelArrayAsViewModelArray;
	function __PropertyBinding(me, model, name, valueChanged){
		var self=this;
		var disposed=false;
		var capitalizedName = capitalizeFirstLetter(name);
		var setterName = getSetterName(capitalizedName);
		var getterName = getGetterName(capitalizedName);
		if(!model)throw new Error('No model provided');
		model[S.BIND](name, valueChanged);
		var myPropertyBindings= MyPropertyBindingsBuilder(me);
		myPropertyBindings[S._ADD](this);
		this[S.SET] = function(value){
			var setter = model[setterName];
			if(!setter)throw new Error('model of type '+model.constructor.name+' does not contain a setter method with name '+setterName);
			if(typeof(setter)!=='function')throw new Error(model.constructor.name+'.'+setterName+' is not a function');
			setter(value);
		};
		this[S.GET]=function(){
			var getter = model[getterName];
			if(!getter)throw new Error('model of type '+model.constructor.name+' does not contain a getter method with name '+getterName);
			if(typeof(getter)!=='function')throw new Error(model.constructor.name+'.'+getterName+' is not a function');
			return getter();
		};
		this[S.GET_NAME]=function(){
			return name;
		};
		this[S._UNBIND]=unbind;
		this[S.DISPOSE]=function(){
			if(disposed)return;
			disposed=true;
			myPropertyBindings[S._REMOVE](self);
			unbind();
		};
		function unbind(){
			model[S.UNBIND](name, valueChanged);
		}
	}
	function carryOver(meOrParams, model, nameParam, viewModelName, converter, onChange, onSetByView){
		var me, viewModelName;
		if(model==undefined&&nameParam==undefined){
			me=meOrParams[S.ME];
			model = meOrParams[S.MODEL];
			nameParam=meOrParams[S.NAME];
			if(!nameParam)
				nameParam=meOrParams[S.NAMES];
			else 
			{
				viewModelName = meOrParams[S.VIEW_MODEL_NAME];
				if(!viewModelName){
					viewModelName = nameParam;
				}
			}
			onChange=meOrParams[S.ON_CHANGE];
			converter=meOrParams[S.CONVERTER];
			onSetByView=meOrParams[S.ON_SET_BY_VIEW];
		}
		else
			me=meOrParams;
		if(typeof(nameParam)==='string'){
			return new _carryOver(me, model, nameParam, onChange, converter, onSetByView, viewModelName);
		}
		var propertyBindings=[];
		each(nameParam, function(name){
			propertyBindings.push(new _carryOver(me, model, name, undefined, converter));
		});
		return propertyBindings;
	}
	function carryOverChildModelAsChildViewModel(me, model/*the model being carried over is a property of this model*/, name, a,b,c){
		var createViewModel, onViewModelSet,viewModelName;
		if(typeof(a)==='string')
		{
			viewModelName=a;
			createViewModel = b;
			onViewModelSet = c;
		}else{
			viewModelName=name;
			createViewModel=a;
			onViewModelSet=b;
		}		
		var bindingsHandler = BindingsHandlerBuilder(me);
		var viewModel;
		var currentModel;
		function change(value){
			if(!value)
			{
				if(!currentModel)return;
				_change(null);
				currentModel= null;
				return;
			}
			if(value==currentModel)
			{
				return;
			}
			currentModel = value;
			viewModel = createViewModel(value);
			_change(viewModel);
		};
		function _change(value){
			bindingsHandler[S.CHANGED](viewModelName, value);
			onViewModelSet&&onViewModelSet(value);
		}
		var capitalizedName = capitalizeFirstLetter(viewModelName);
		var getterName = getGetterName(capitalizedName);
		//if(!model[getterName])throw new Error('Model of type '+model.constructor.name+' does not contain a getter with name '+getterName);
		me[getterName]=function(){return viewModel;};
		
		var propertyBinding = new __PropertyBinding(me, model, name, change);
		change(propertyBinding[S.GET]());
		return propertyBinding;
	}
	function carryOverChildViewModelAsChildView(me, viewModel,// this is actually very similar to the above but for now keep as seperate to avoid confusion.
		name, createView, onViewSet){
		var bindingsHandler = BindingsHandlerBuilder(me);
		var view;
		var currentViewModel;
		function change(value){
			if(!value)
			{
				if(!currentViewModel)return;
				var oldView = view;
				disposeCurrentView();
				_change(null, oldView);
				currentViewModel= null;
				return;
			}
			if(value==currentViewModel)
			{
				return;
			}
			var oldView = view;
			disposeCurrentView();
			currentViewModel = value;
			view = createView(value);
			_change(view, oldView);
		};
		function disposeCurrentView(){
			if(!view)return;
			view[S.DISPOSE]();//force implementing dispose for good practise so dont forget cleanup.
			view = null;
		}
		function _change(view, oldView){
			bindingsHandler[S.CHANGED](name, view);
			onViewSet&&onViewSet(view, oldView);
		}
		var capitalizedName = capitalizeFirstLetter(name);
		var getterName = getGetterName(capitalizedName);
		var getter = viewModel[getterName];
		if(!getter)throw new Error('Model of type '+viewModel.constructor.name+' does not contain a get method for property named '+name);
		change(getter());
		me[getterName]=function(){return view;};
		var propertyBinding = new __PropertyBinding(me, viewModel, name, change);
		return propertyBinding;
	}
	function arrayConversion(me, model, name, createConvertedItem, removedItem, changedCallback, postpone/* called any time the child changes*/){
		return _arrayConversion(me, model, name, createConvertedItem, removedItem, changedCallback, postpone, function(item){
			return  HashBuilder(item);
		});
	}
	function arrayConversionFromPrimitives(me, model, name, createConvertedItem, removedItem, changedCallback/* called any time the child changes*/, postpone){
		return _arrayConversion(me, model, name, createConvertedItem, removedItem, changedCallback, postpone, function(item){
			return String(item);
		});
	}
	function _arrayConversion(me, model, name, createConvertedItem, removedItem, changedCallback/* called any time the child changes*/, postpone, getHashFromItem){
		var mapHashToConvertedItem={};
		var currentConvertedItems=[];
		var propertyBinding = standard(me, model, name, changed, true);
		function changed(items){
			var hashesSeen = [];
			for(var i=0; i<items.length; i++){
				var item = items[i];
				var hash = getHashFromItem(item);
				hashesSeen.push(hash);
				var convertedItem = mapHashToConvertedItem[hash];
				if(!convertedItem)
				{
					convertedItem = createConvertedItem(item);
					mapHashToConvertedItem[hash]=convertedItem;
					currentConvertedItems.splice(i, 0, convertedItem);
				}
				else//reposition
				currentConvertedItems.splice(i, 0, currentConvertedItems.splice(currentConvertedItems.indexOf(convertedItem), 1)[0]);
			}
			for(var hash in mapHashToConvertedItem){
				if(hashesSeen.indexOf(hash)<0)
				{
					var convertedItem = mapHashToConvertedItem[hash];
					delete mapHashToConvertedItem[hash];
					currentConvertedItems.splice(currentConvertedItems.indexOf(convertedItem), 1);
					removedItem&&removedItem(convertedItem);
				}
			}
			changedCallback&&changedCallback(currentConvertedItems);
		}
		function getMethod (){return currentConvertedItems;}
		function setMethod (){throw new Error('Cannot set a converted array. Not currently supported. Try setting the array being converted.');}
		var items = propertyBinding[S.GET]();
		if(!items)throw new Error( name +' had no get method on object of type '+model.constructor.name);
		if(!postpone)
			changed(items);
		return new PropertyBindingCarriedOver(propertyBinding, new PropertyBindingShell(getMethod, setMethod));
	}
	function carryOverModelArrayAsViewModelArray(me, model, name, a, b, c){
        var createViewModel, viewModelsName, callbackChanged;
        if (typeof (a) === 'string') {
            viewModelsName = a;
            createViewModel = b;
			callbackChanged=c;
        } else {
            viewModelsName = name;
            createViewModel = a;
			callbackChanged=b;
        }
		var bindingsHandler = BindingsHandlerBuilder(me);
        var capitalizedName = capitalizeFirstLetter(viewModelsName);
        var getterName = getGetterName(capitalizedName);
		var propertyBinding;
        me[getterName] = function () { return propertyBinding[S.GET_CARRIED_OVER]()[S.GET](); };
        function _change(value) {
            bindingsHandler[S.CHANGED](viewModelsName, value);
			callbackChanged&&callbackChanged(value);
        }
		function removed(viewModel){
			viewModel[S.DISPOSE]();
		}
		propertyBinding = arrayConversion(me, model, name, createViewModel, removed, _change);
		return propertyBinding;
	};
	return _PropertyBinding;	
	
	function standard(me, model, name, valueChanged, postpone){
		var propertyBinding = new __PropertyBinding(me, model, name, valueChanged);
		if(!postpone)
			valueChanged(propertyBinding[S.GET]());
		return propertyBinding;
	}
	function _carryOver(me, model, name, onChange, converter, onSetByView, viewModelName){
		var bindingsHandler = BindingsHandlerBuilder(me);
		var change;
		var capitalizedName = capitalizeFirstLetter(name);
		var setterName = getSetterName(capitalizedName);
		var getterName = getGetterName(capitalizedName);
		var capitalizedNameViewModel;
		var setterNameViewModel;
		var getterNameViewModel;
		if(viewModelName){
		 capitalizedNameViewModel = capitalizeFirstLetter(viewModelName);
		 setterNameViewModel = getSetterName(capitalizedNameViewModel);
		 getterNameViewModel = getGetterName(capitalizedNameViewModel);
		}
		else{
		 setterNameViewModel = setterName;
		 getterNameViewModel = getterName;
		 viewModelName=name;
		}
		if(model[getterName]===undefined)
			throw new Error(getterName+' is not defined on model type '+model.constructor.name);
		/*if(model[setterName]===undefined)
			throw new Error(setterName+' is not defined on model type '+model.constructor.name);*/
		var s;
		var changed = bindingsHandler[S.CHANGED];
		if(converter){
			change = 
				onChange
				?function(value){
					var convertedValue=converter[S.FROM](value);
					changed(viewModelName, convertedValue);
					onChange(convertedValue);
				}
				:function(value){
					changed(viewModelName, converter[S.FROM](value));
				};
			me[getterNameViewModel]=function(){
					return converter[S.FROM](model[getterName]());
				};
				
			s  =function(value){ model[setterName](converter[S.TO](value));};
		}
		else{
			change = 
			onChange
			?function(value){
				changed(viewModelName, value);
				onChange(value);
			}
			:function(value){
				changed(viewModelName, value);
			};
			me[getterNameViewModel]=function(){
				return model[getterName]();
			};
			s = function(value){ model[setterName](value);};
		}
		if(onSetByView)
			s = (function(main){ return function(value){main(value);onSetByView(value);};})(s);
		me[setterNameViewModel]=s;
		
		return new __PropertyBinding(me, model, name, change);
	}
	function PropertyBindingCarriedOver(propertyBindingSource, propertyBindingCarriedOver){
		this[S.GET_SOURCE]=function(){return propertyBindingSource;};
		this[S.GET_CARRIED_OVER]=function(){return propertyBindingCarriedOver;};
	}
	function PropertyBindingShell(getterMethod, setterMethod){
		this[S.GET]=getterMethod;
		this[S.SET]=setterMethod;	
	}
	function getGetterName(capitalizedName){
		return 'get'+capitalizedName;
	}
	function getSetterName(capitalizedName){
		return 'set'+capitalizedName;
	}
	function capitalizeFirstLetter(str){
		return str.substr(0, 1).toUpperCase()+str.substr(1, str.length-1);
	}
})();