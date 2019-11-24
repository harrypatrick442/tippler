var DatePicker = window['DatePicker']=(function (){
	
	return function DatePicker(params)
	{
		var self = this;
		var classNames = params[S.CLASS_NAMES];
		var asPopup = params[S.POPUP];
		var propertyNameDate = params[S.PROPERTY_NAME_DATE]
		var maxDate = params[S.MAX_DATE];
		var minDate = params[S.MIN_DATE];
		var dateSelected = params[S.DATE_SELECTED];
		var currentMonth = params[S.CURRENT_MONTH];
		var currentYear = params[S.CURRENT_YEAR];
		var model = params[S.MODEL];
		var placeholder = params[S.PLACEHOLDER];
		var propertyBinding, valueChanged;
		var element = asPopup?E.TEXT():E.DIV();
		var popup;
		element.classList.add(asPopup?'date-picker-popup':'date-picker-embedded');
		//if(!maxDate)maxDate = new Date().addYears(-18);
		//if(!minDate)minDate = new Date().addYears(-100);
		if(!dateSelected&&!currentMonth&&!currentYear)dateSelected=new Date().addYears(-25);
		if(classNames)
			each(classNames, function(className){
				element.classList.add(className);
			});
		if(asPopup){
			var popup = new Popup({});			
			var popupElement = popup[S.GET_ELEMENT]();
			popupElement.classList.add('popup-date-picker');
			document.documentElement.appendChild(popupElement);
			if(placeholder)
				element.placeholder=placeholder;
			element.addEventListener('click', showPopup);
			var positioner =E.DIV();
			popupElement.appendChild(positioner);
			var options ={
			  onSelect: function(instance){
				element.value = getDateString(instance.dateSelected);
				popup[S.HIDE]();
			  },
			  startDay: 1, // Calendar week starts on a Monday.
			  customDays: ['S', 'M', 'T', 'W', 'Th', 'F', 'S'],
			  customMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
			  overlayButton: 'Go!',
			  overlayPlaceholder: 'Enter a 4-digit year',
			  alwaysShow: true,
			  dateSelected: dateSelected,
			  maxDate: maxDate,
			  minDate: minDate,
			  startDate: dateSelected,
			  currentMonth:currentMonth,
			currentYear:currentYear,
			  /*noWeekends: false,
			  disabler:
			  disabledDates:*/ 
			  //disableMobile: false,
			  //disableYearOverlay: false, 
			 
			  //id: 1
			};
			setTimeout(function(){
				window['datepicker'](positioner, options);
			});
			
			valueChanged= function (value){
				
			};
			function showPopup(){
				popup[S.SHOW]();
				var absolute = getAbsolute(element);
				var p = {};
				p[S.LEFT]=absolute[S.LEFT];
				p[S.TOP]=absolute[S.TOP]+element.offsetHeight;
				popup[S.SET_POSITION](p);
			}
			function getDateString(date){
				return padZeros(String(date.getDate()), 2)+'/'+padZeros(String(date.getMonth()+1), 2) +'/'+date.getFullYear();
			}
		}
		else
		{
			var selectDay = E.SELECT();
			var selectMonth = E.SELECT();
			var selectYear = E.SELECT();
			element.classList.add('date-picker');
			element.appendChild(selectDay);
			element.appendChild(selectMonth);
			element.appendChild(selectYear);
			selectDay.classList.add('not-right');
			selectMonth.classList.add('not-right');
			var now = new Date();
			var year = 1900 + now.getYear();
			var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
			selectDay.appendChild(createOption('', 'Day'));
			selectMonth.appendChild(createOption('', 'Month'));
			selectYear.appendChild(createOption('', 'Year'));
			selectDay.addEventListener('change', changedNonPopup);
			selectMonth.addEventListener('change', changedNonPopup);
			selectYear.addEventListener('change', changedNonPopup);
			for (var i = 1; i < 32; i++)
			{
				var option = createOption(i, String(i));
				selectDay.appendChild(option);
			}
			for (var i = 1; i < 12; i++)
			{
				var option = createOption(i, months[i]);
				selectMonth.appendChild(option);
			}
			var maxYear = year - 17;
			for (var i = maxYear-1; i > maxYear-100; i--)
			{
				var option = createOption(i, String(i));
				selectYear.appendChild(option);
			}
			valueChanged= function (value){
				if(!value)return;
			};
		}
		if(propertyNameDate)
			propertyBinding = PropertyBinding[S.STANDARD](this, model, propertyNameDate, valueChanged);
		this[S.GET_ELEMENT] = function(){return element;};
		this[S.DISPOSE]=function(){
			propertyBinding&&propertyBinding[S.UNBIND]();
		};
		function changedNonPopup(){
			var day =selectDay.options[selectDay.selectedIndex].value;
			var month =selectMonth.options[selectMonth.selectedIndex].value;
			var year = selectYear.options[selectYear.selectedIndex].value;
			propertyBinding.set((day&&month&&year)?(new Date(parseInt(year), parseInt(month), parseInt(day),0, 0, 0, 0)):undefined);
		}
		function valueChanged(value){
			if(!value)return;
			setSelectedValue(selectDay, value.getDate());
			setSelectedValue(selectMonth, value.getMonth());
			setSelectedValue(selectYear, value.getFullYear());
		}
	};
	function setSelectedValue(select, value){
		for(var i=0; i<select.options.length; i++){
			var option = select.options[i];
			if(option.value==value){
				select.selectedIndex=i;
				break;
			}
		}
	}
    function createOption(value, txt)
    {
        var option = document.createElement('option');
        option.value = value;
        option.innerHTML = txt;
        return option;
    }
	function padZeros(str, length){
		while(str.length<length){
			str='0'+str;
		}
		return str;
	}
})();