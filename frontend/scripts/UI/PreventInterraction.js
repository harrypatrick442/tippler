var PreventInterraction = function(){
	var element=E.DIV();
	element.classList.add('prevent-interraction');
	document.documentElement.appendChild(element);
	this[S.GET_ELEMENT]=function(){return element;};
};