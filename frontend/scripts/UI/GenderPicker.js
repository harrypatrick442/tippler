function GenderPicker()
{
    var element = E.SELECT();
	element.classList.add('gender');
    for(var i=0; i<GenderOptions.length; i++)
    {
        var values = GenderOptions[i];
        var option = E.OPTION();
        option.innerHTML = values[S.TEXT];
        option.value=values[S.VALUE];
        element.appendChild(option);
    }
    this[S.GET_VALUE]=function(){
        return element.options[element.selectedIndex].value;
    };
	this[S.GET_ELEMENT]= function(){return element;};
}