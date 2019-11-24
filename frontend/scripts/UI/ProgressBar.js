var ProgressBar = (function(){
	var _ProgressBar = function(params){
		var self = this;
		var showText = params[S.SHOW_TEXT];
		var model = params[S.MODEL];
		var propertyNamePercent = params[S.PROPERTY_NAME_PERCENT];
		var propertyNameProportion = params[S.PROPERTY_NAME_PROPORTION];
		var propertyNameText = params[S.PROPERTY_NAME_TEXT];
		var decimalPlaces = params[S.DECIMAL_PLACES];
		var textContent, percent;
		var element = E.DIV();
		element.classList.add('progress-bar');
		var progress = E.DIV();
		progress.classList.add('progress');
		element.appendChild(progress);
		var text = E.DIV();
		text.classList.add('text');
		var textPercent = E.DIV();
		textPercent.classList.add('text-percent');
		var textWrapper = E.DIV();
		textWrapper.classList.add('text-wrapper');
		textWrapper.appendChild(text);
		textWrapper.appendChild(textPercent);
		element.appendChild(textWrapper);
		textWrapper.appendChild(textPercent);
		var propertyBindingText = PropertyBinding[S.STANDARD](this, model, propertyNameText, textChanged);
		var propertyBindingPercent, propertyBindingProportion;
		if(propertyNamePercent)
			propertyBindingPercent = PropertyBinding[S.STANDARD](this, model, propertyNamePercent, percentChanged);
		else{
			if(propertyNameProportion)propertyBindingProportion = PropertyBinding[S.STANDARD](this, model, propertyNameProportion, proportionChanged);
			else throw new Error('No proportion or percent propertyName provided');
		}
		this[S.GET_ELEMENT] = function(){return element;};
		this[S.DISPOSE]=function(){
			self[S.MY_BINDINGS]&&self[S.MY_BINDINGS][S.DISPOSE]();
		};
		function percentChanged(value){
			percent = value;
			update();
		}
		function proportionChanged(proportion){
			percentChanged(proportion*100);
		}
		function done(){
			element.classList.add('done');
		}
		function notDone(){
			element.classList.remove('done');
		}
		function textChanged(value){
			textContent = value;
			update();
		}
		function update(){
			if(percent===undefined)return;
			var str;
			if(decimalPlaces!==undefined) str = parseFloat(percent).toFixed(decimalPlaces)+'%';
			else str = String(percent)+'%';
			progress.style.width=str;
			if(showText)text.innerHTML=(textContent?textContent:'');
			textPercent.innerHTML = str;
			if(percent>=100)
				done();
			else
				notDone();
		}
	};
	return _ProgressBar;
})();