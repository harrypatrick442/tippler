var Validation = window['Validation']=new (function(){
	this[S.IS_NULL_OR_EMPTY]=function(value){
		return value==undefined||value==null||value=='';
	};
	this[S.IS_NUMBER]=function(value){
		if(isNullOrEmpty(value))return false;
		return !isNaN(value);
	};
	this[S.IS_INT]=function(value){
		if(!isNumber(value))return false;
		return parseFloat(value)==parseInt(value);
	};
	this[S.IS_DATE]=function (value){
		if(isNullOrEmpty(value))return false;
		return !isNaN(new Date(value).getTime());
	};
})();