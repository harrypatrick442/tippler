function DatePickerPopup(params) {
    var propertyNameDate = params[S.PROPERTY_NAME_DATE];
    var model = params[S.MODEL];
    var propertyBinding = PropertyBinding[S.STANDARD](this, model, propertyNameDate, valueChanged);
    var p = {};
    p[S.PROPERTY_NAME] = propertyNameDate;
    p[S.MODEL] = model;
    p[S.CLASS_NAME] = params[S.CLASS_NAME];
    p[S.CLASS_NAMES] = params[S.CLASS_NAMES];
	p[S.VALIDATE]=params[S.VALIDATE];
    var textBox = new TextBox(p);
    this[S.GET_ELEMENT] = textBox[S.GET_ELEMENT];

    window['$'](textBox[S.GET_ELEMENT]())['datepicker']({
        'dateFormat': "dd/mm/yy",
        'onSelect': onSelect
    });
    function valueChanged(value) {
        
    }
    function onSelect(value) {
        propertyBinding[S.SET](value);
    }
}