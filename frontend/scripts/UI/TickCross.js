var TickCross = window['TickCross']=(function(){
	var TICK='tick';
	var CROSS ='cross';
	return function(params){
		var model = params[S.MODEL];
		var propertyName = params[S.PROPERTY_NAME];
		var element = E.DIV();
		element.classList.add('tickcross');
		var image =new ImageControl({});
		var imageElement=image[S.GET_ELEMENT]();
		if(params[S.TEXT]){
			var text = E.DIV();
			text.classList.add('text');
			element.appendChild(text);
			text.innerHTML=params[S.TEXT];
		}
		element.appendChild(imageElement);
		this[S.GET_ELEMENT] = function(){return element;};
		this[S.DISPOSE]=function(){
			propertyBinding&&propertyBinding['unbind']();
		};
		var propertyBinding = PropertyBinding[S.STANDARD](this, model, propertyName, tickedChanged);
		function tickedChanged(value){
			if(value==undefined){
				removeTick();
				removeCross();
				image.update();
				return;
			}
			if(value){
				removeCross();
				if(element.classList.contains(TICK))return;
				element.classList.add(TICK);
				image.update();
				return;
			}
			removeTick();
			if(element.classList.contains(CROSS))return;
			element.classList.add(CROSS);
				image.update();
		}
		function removeTick(){
				if(!element.classList.contains(TICK))return;
				element.classList.remove(TICK);
		}
		function removeCross(){
				if(!element.classList.contains(CROSS))return;
				element.classList.remove(CROSS);
		}
	};
})();