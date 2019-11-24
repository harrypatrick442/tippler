var Spinner = window['Spinner']=function (params) {
    var self = this;
	var preventInterraction=params[S.PREVENT_INTERRACTION];
	var propertyNameVisible = params[S.PROPERTY_NAME_VISIBLE];
	var nested=params[S.NESTED];
	var version=params[S.VERSION];
	var spinner = E.DIV();
	var element;
	spinner.classList.add('spinner');
	spinner.classList.add(nested?'nested':'page');
	if(!version)
		version = SpinnerVersions.DefaultWhite;
	spinner.classList.add(version);
	if(version == SpinnerVersions.SmallBlack){
		for(var i=0; i<8; i++)
		{
			var div = E.DIV();
			div.classList.add('f_circleG');
			div.id = 'frotateG_0'+String(i+1);
			spinner.appendChild(div);
		}
	}
	else{
		for(var i=0; i<3; i++)
		{
			spinner.appendChild(E.DIV());
		}
	}

	if(preventInterraction){
		
		element = new PreventInterraction()[S.GET_ELEMENT]();
		element.appendChild(spinner);
	}
	else{
		element = spinner;
	}
	element.style.display='none';

	var propertyBindingVisible;
	if(propertyNameVisible)
		propertyBindingVisible	= PropertyBinding[S.STANDARD](this, params[S.MODEL], propertyNameVisible, visibleChanged);
	this[S.GET_ELEMENT] = function(){
		return element;
	};
	this[S.SET_VISIBLE]=function(value){
		if(propertyBindingVisible)propertyBindingVisible[S.SET](value);
		else visibleChanged(value);
	};
	this[S.DISPOSE]=function(){
		self[S.MY_BINDINGS]&&self[S.MY_BINDINGS][S.DISPOSE]();
	};
	if(preventInterraction){
		preventEventPropagation('click');
		preventEventPropagation('mousedown');
		preventEventPropagation('mouseup');
	}
	function visibleChanged(value){
        element.style.display = value?'inline-block':'none';
		if(!value||!preventInterraction)return;
        setTimeout(function () {
            if(document.activeElement&&document.activeElement.blur)
                document.activeElement.blur();
        }, 0);
	}
    function preventEventPropagation(name) {
        element.addEventListener(name, function (e) {
            if (!e) e = window.event;
            e.stopPropagation&&e.stopPropagation();
			e.preventDefault&&e.preventDefault();
            return false;
        });
    }
};