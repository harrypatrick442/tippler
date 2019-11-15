var MyPropertyBindingsBuilder = window['MyPropertyBindingsBuilder']= (function(){
	return function(me){
		if(me[S.MY_BINDINGS])return me[S.MY_BINDINGS];
		me[S.MY_BINDINGS]= new _MyBindings(me);
		return me[S.MY_BINDINGS];
	};
	function _MyBindings(me){
		var propertyBindings = [];
		var disposed=false;
		this[S._ADD]=function(propertyBinding){
			if(propertyBindings.indexOf(propertyBindings)>=0)return;
			propertyBindings.push(propertyBinding);
		};
		this[S._REMOVE]=function(propertyBinding){
			 var index = propertyBindings.indexOf(propertyBinding);
			 if(index<0)return;
			propertyBindings.splice(index, 1);
		};
		this[S.DISPOSE]=function(){	
			if(disposed)return;
			disposed=true;
			each(propertyBindings, function(propertyBinding){
				propertyBinding[S._UNBIND]();
			});
			propertyBindings=[];
		};
	}
})();