var DragManager = (function(){
	var _DragManager= function(params){
		var self = this;
		var handle = params[S.HANDLE];
		var stopPropagation = params[S.STOP_PROPAGATION];
		var p={};
		p[S.ELEMENT]=handle[S.GET_ELEMENT]();
		p[S.STOP_PROPAGATION]=stopPropagation;
		var efficientMovingCycle = new EfficientMovingCycle(p);
		var localConstraints;
		var offsets;
		efficientMovingCycle[S.ON_START] = function(e){
			self[S.ON_START]&&self[S.ON_START](e);
			offsets = getOffsets(e);
			localConstraints = handle[S.GET_CONSTRAINTS]();
		};
		efficientMovingCycle[S.ON_MOVE] = function(e){
			var newLocalPosition = getNewLocalPosition(e);
			constrainNewLocalPosition(newLocalPosition);
			handle[S.SET_POSITION](newLocalPosition);
		};
		efficientMovingCycle[S.ON_END] = function(){
			handle[S.END_DRAG]&&handle[S.END_DRAG]();
		};
		function constrainNewLocalPosition(localPosition){
			if(localPosition[S.X]>localConstraints[S.MAX_X])
				localPosition[S.X]=localConstraints[S.MAX_X];
			else
				if(localPosition[S.X]<localConstraints[S.MIN_X])
					localPosition[S.X] = localConstraints[S.MIN_X];
			if(localPosition[S.Y]>localConstraints[S.MAX_Y])
				localPosition[S.Y]=localConstraints[S.MAX_Y];
			else
				if(localPosition[S.Y]<localConstraints[S.MIN_Y])
					localPosition[S.Y] = localConstraints[S.MIN_Y];
		}
		function getOffsets(e){
			var absolute = handle[S.GET_ABSOLUTE_POSITION](e);
			return {x:handle[S.GET_X]() - absolute[S.LEFT], 
					y:handle[S.GET_Y]() - absolute[S.TOP]};
		}
		function getNewLocalPosition(e){
			var p={};
			p[S.X]=e.pageX + offsets[S.X]
			p[S.Y]=e.pageY + offsets[S.Y];
			return p;
		}
	};
	return _DragManager;
})();