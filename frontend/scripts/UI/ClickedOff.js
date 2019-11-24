var ClickedOff = new (function () {
    var handles = [];
    this['register'] = function (element, callbackHide) {
		var handle =  new Handle(element, callbackHide, dispose);
		setTimeout(function () {
			if (!containsElement(element)) {
				handles.push(handle);
			}
		},0);
        return handle;
    };
	this['remove'] = function(element){
		var iterator = new Iterator(handles);
		while(iterator['hasNext']()){
			var handle = iterator['next']();
			if(handle['getElement']()==element)
			{
				handle['dispose']();
				break;
			}
				
		}
	};
	function dispose(handle){
		var index = handles.indexOf(handle);
		if(index<0)return;
		handles.splice(index, 1);
	}
    function clickedDocument(e) {
        var x = e.pageX;
        var y = e.pageY;
		var handlesSnashot = handles.slice();
        for (var i = 0, handle; handle = handlesSnashot[i]; i++) {
			var elements = handle[S.GET_ELEMENTS]();
			var withinOne=false;
			for(var j=0,element; element=elements[j];j++){
				var absolutePosition = getAbsolute(element);
				var xLeft = absolutePosition['left'];
				var xRight = xLeft + element.offsetWidth;
				var yTop = absolutePosition['top'];
				var yBottom = yTop + element.offsetHeight;
				if (!(x < xLeft || x > xRight || y < yTop || y > yBottom)) {
					withinOne=true;
					break;
				}
			}
			if(!withinOne)
				handle['hide']();
        }
    }
    function containsElement(element) {
        for (var i = 0, handle; handle = handles[i]; i++) {
            if (handle['getElement']() == element)
                return true;
        }
        return false;
    }
    function Handle(element, callbackHide, callbackDispose){
		var self = this;
		var additionalElements =[];
		this['addAdditionalElement']= function(additionalElement){
			if(additionalElements.indexOf(additionalElement)<0)
				additionalElements.push(additionalElement);
		};
		this['removeAdditionalElement'] = function(element){
			var index = additionalElements.indexOf(element);
			if(index<0)return;
			additionalElements.splice(index, 1);
		};
		this['getElements'] = function(){
			var elements = [element];
			return elements.concat(additionalElements);
		};
		this['getElement'] = function(){return element;};
		this['hide'] = function(){
			callbackDispose(self);
			callbackHide();
		};
		this['dispose'] = callbackDispose;
	}
    document.addEventListener('mousedown', clickedDocument);

})();