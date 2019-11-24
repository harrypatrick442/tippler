var DynamicFieldsLayout  = window['DynamicFieldsLayout ']=(function(){//at the moment expects fields to roughly fill the entire width of the page but this may change and the way this is built will allow that to change.
	//var instancesFillingViewPortWidth =[];
	var instancesIndependent=[];
	var p ={};
	p[S.CALLBACK]=update;
	p[S.MAX_N_TRIGGERS]=20;	
	p[S.MAX_TOTAL_DELAY]=800;
	var temporalCallback = new TemporalCallback(p);
	WindowResizeManager.addEventListener(S.RESIZED, resized);
	return function DynamicFieldsLayout(params){
		EventEnabledBuilder(this);
		var self = this;
		var disposed = false;
		var element = params[S.ELEMENT];
		var currentWidthClassName;
		var widthToClassNames=params[S.WIDTH_TO_CLASS_NAMES];
		var widthToClassNamesDescending= [];
		for(var width in widthToClassNames){
			widthToClassNamesDescending.push([parseInt(width), widthToClassNames[width]]);
		}
		widthToClassNamesDescending = widthToClassNamesDescending[S.ORDER_BY_DESC](x=>x[0])[S.TO_LIST]();
		//var fillsViewPortWidth = params[S.FILLS_VIEW_PORT_WIDTH];//more efficient if able to assume this.
		//if(fillsViewPortWidth==undefined)fillsViewPortWidth=true;
		var instances = /*(fillsViewPortWidth?instancesFillingViewPortWidth:*/instancesIndependent/*)*/;
		this[S.DISPOSE]=function(){
			if(disposed)return;
			disposed = true;
			instances.splice(instances.indexOf(self),1);
		};
		this[S.UPDATE]=update;
		p = {};
		p[S.UPDATE]=/*fillsViewPortWidth?switchClassNames:*/update;
		instances.push(p);
		update();
		function switchClassNames(classNameToRemove, classNameToAdd){
			element.classList.remove(classNameToRemove);
			element.classList.add(classNameToAdd);
		}
		function update(){
			var	widthClassName = getWidthClassName(widthToClassNamesDescending, element);
			if(currentWidthClassName==widthClassName)return;
			switchClassNames(currentWidthClassName, widthClassName);
			currentWidthClassName=widthClassName;
			dispatchUpdated();
		}
		function dispatchUpdated(){
			self.dispatchEvent({[S.TYPE]:[S.CHANGED]});
		}
	};
	function resized(){
		temporalCallback[S.TRIGGER]();
	}
	function update(widthToClassNamesDescending){
		//if(instancesIndependent.length>0)
			updateInstancesIndependent();
		//if(instancesFillingViewPortWidth.length>0)updateFillingViewPortWidthInstances(widthToClassNamesDescending); 
	}
	function updateInstancesIndependent(){
		each(instancesIndependent, function(instance){
			instance[S.UPDATE]();
		});
	}/*
	function updateFillingViewPortWidthInstances(widthToClassNamesDescending){
		var widthClassName = getWidthClassName(widthToClassNamesDescending, document.body);
		if(currentWidthClassName==widthClassName)return;
		each(instancesFillingViewPortWidth, function(instance){
			instance[S.UPDATE](currentWidthClassName, widthClassName);
		});
		currentWidthClassName = widthClassName;
	}*/
	function getWidthClassName(widthToClassNamesDescending, element){
		for(var i=0; i<widthToClassNamesDescending.length; i++){
			var widthToClassName=widthToClassNamesDescending[i];
			if(element.offsetWidth>=widthToClassName[0]){
				return widthToClassName[1];
			}
		}
		return widthToClassNamesDescending[widthToClassNamesDescending.length-1][1];
	}
})();