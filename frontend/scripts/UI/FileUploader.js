var FileUploader = function(params){
	EventEnabledBuilder(this);
	var self = this;
	var propertyNameVisible = params[S.PROPERTY_NAME_VISIBLE];
	var propertyNameFiles = params[S.PROPERTY_NAME_FILES];
	var propertyNameAccept = params[S.PROPERTY_NAME_ACCEPT];
	var viewModel = params[S.MODEL];
	var functionNameFilesChanged= params[S.FUNCTION_NAME_FILES_CHANGED];
	var p={};
	p[S.CLICK]=function(){fileInput.click();};
	p[S.IMAGE_SEMANTIC]= S.UPLOAD_ICON;
	p[S.IMAGE_SEMANTIC_HOVER]= S.UPLOAD_ICON_HOVER;
	var button = new Button(p);
	var element = E.DIV();
	element.classList.add('file-uploader');
	var fileInput = E.FILE();
	fileInput.type='file';
	element.appendChild(button[S.GET_ELEMENT]());
	var propertyBindingVisible = PropertyBinding[S.STANDARD](this, viewModel, propertyNameVisible, visibleChanged);
	if(propertyNameAccept)
		var propertyBindingAccept = PropertyBinding[S.STANDARD](this, viewModel, propertyNameAccept, acceptChanged);
	else{
		var accept = params[S.ACCEPT];
		if(accept){
			fileInput.accept=accept;
		}
	}
	fileInput.addEventListener('change', fileInputChanged);
	this[S.GET_ELEMENT] = function(){return element;};
	setFiles([]);
	function fileInputChanged(e){
		setFiles(fileInput['files']);
	}
	function setFiles(value){
		viewModel[functionNameFilesChanged](value);
		fileInput.value='';//cant really set it other than this. 
	}
	function visibleChanged(value){
		if(value)element.classList.add('visible');
		else element.classList.remove('visible');
	}
	function acceptChanged(value){
		fileInput.accept=value;
	}
};