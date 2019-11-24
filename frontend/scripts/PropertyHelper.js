var PropertyHelper = window['PropertyHelper']=new (function(){
	//type '+model.constructor.name+' does not contain a getter method with name '+getterName);
	this[S.GET_GETTER_NAME]=function(propertyName){return getGetterName(capitalizeFirstLetter(propertyName));};
	this[S.GET_SETTER_NAME]=function(propertyName){return getSetterName(capitalizeFirstLetter(propertyName));};
	this[S.HAS_GETTER]=function(model, propertyName){
		return model[getGetterName(capitalizeFirstLetter(propertyName))]?true:false;
	};
	this[S.PROPERTY_VALUES_TO_OBJ]=function(obj, model, propertyNames){
		if(!obj)obj={};
		each(propertyNames, function(propertyName){
			var getterName = getGetterName(capitalizeFirstLetter(propertyName));
			var method = model[getterName];
			if(method==U)throw new Error('Model of type '+model.constructor.name+' has no method '+getterName);
			obj[propertyName]=method();
		});
		return obj;
	};
	function getGetterName(capitalizedName){
		return 'get'+capitalizedName;
	}
	function getSetterName(capitalizedName){
		return 'set'+capitalizedName;
	}
})();