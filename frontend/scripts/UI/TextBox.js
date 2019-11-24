var TextBox = window['TextBox'] = (function () {
    return function (params) {
        EventEnabledBuilder(this);
        var className = params[S.CLASS_NAME];
        var classNames = params[S.CLASS_NAMES];
        var placeholder = params[S.PLACEHOLDER];
        var isPassword = params[S.IS_PASSWORD];
        var isTextArea = params[S.IS_TEXT_AREA];
        var readOnly = params[S.READ_ONLY];
		var validate = params[S.VALIDATE];
		var propertyName = params[S.PROPERTY_NAME];
		var model = params[S.MODEL];
		var autoHeight=params[S.AUTO_HEIGHT];
        var propertyNameDisabled = params[S.PROPERTY_NAME_DISABLED];
		var propertyNameReadOnly = params[S.PROPERTY_NAME_READ_ONLY];
		var validityIndicator;
		var _valueChanged=valueChanged;
		var disabled;
        var element = (isPassword ? E.PASSWORD : (isTextArea ? E.TEXTAREA : E.TEXT))();
		if(isTextArea&&autoHeight==undefined||autoHeight){
			element.setAttribute('style', 'height:' + (element.scrollHeight) + 'px;overflow-y:hidden;');
			element.addEventListener("input", resizeTextarea);
			_valueChanged = groupFunctions(_valueChanged, resizeTextarea);
			function resizeTextarea() {
				element.style.height = 'auto';
				element.style.height = (element.scrollHeight) + 'px'; 
			}
			setTimeout(resizeTextarea,0);
		}
        if (readOnly)
            readOnlyChanged(true);
        if (className)
            element.classList.add(className);
        if (classNames) each(classNames, function (className) {
            element.classList.add(className);
        });
        if (placeholder)
            element.placeholder = placeholder;
        element.classList.add('text-box');
        this[S.GET_ELEMENT] = function () { return element; };
		this[S.GET_VALIDITY_INDICATOR]=function(){return validityIndicator;};
        element['addEventListener']('keyup', keyUp);
		if(validate){
			validityIndicator = new ValidityIndicator(this, model, propertyName, element);
		}
        var propertyBinding = PropertyBinding[S.STANDARD](this, model, propertyName, _valueChanged);
		var propertyBindingReadOnly;
		if(propertyNameReadOnly){
			propertyBindingReadOnly = PropertyBinding[S.STANDARD](this, model, propertyNameReadOnly, readOnlyChanged);
		}
		var propertyBindingDisabled;
		if(propertyNameDisabled){
			propertyBindingDisabled = PropertyBinding[S.STANDARD](this, model, propertyNameDisabled, disabledChanged);
		}
		var _addEventListener= this[S.ADD_EVENT_LISTENER];
        this[S.ADD_EVENT_LISTENER] = addEventListener;
        this['focus'] = function () {
            element.focus();
        };
        this[S.DISPOSE]=function(){
			self[S.MY_BINDINGS]&&self[S.MY_BINDINGS][S.DISPOSE]();
        };
		function readOnlyChanged(value){
			if(readOnly==value)return;
			readOnly = value;
			element.readOnly = value;
			if(value){
				element.classList.add('readonly');
			}
			else{
				element.classList.remove('readonly');
			}
			updateDisabled();
		}
		function disabledChanged(value){
			if(disabled==value)return;
			disabled = value;
			updateDisabled();
		}
		function updateDisabled(){
			element.disabled=disabled||readOnly?true:false;
		}
        function valueChanged(value) {
            if (value == undefined || value == null) return;
            element.value = value;
        }
        function keyUp() {
            propertyBinding['set'](element.value);
        }
        function addEventListener(name, callback) {
            switch (name) {
                case 'keydown':
                case 'keyup':
                case 'click':
                    element.addEventListener(name, callback);
                    break;
				default:
					//_addEventListener(name, callback);
				break;
            }
        }
    };
})();