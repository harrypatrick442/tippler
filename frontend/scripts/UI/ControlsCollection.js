var ControlsCollection = window['ControlsCollection']=function(){
	var disposed=false;
	var controls=[];
	for(var i=0; i<arguments.length; i++){
		var control = arguments[i];
		if(control)
			controls.push(control);
	}
	this[S.ADD]=function(control){
		controls.push(control);
	};
	this[S.DISPOSE]=function(){
		if(disposed)return;
		disposed=true;
		each(controls, function(control){
			control[S.DISPOSE]();
		});
	};
};