var isWithinViewport = global['isWithinViewport']=function(element, viewportDimensions, absolutePosition){
	if(!absolutePosition)
		absolutePosition = getAbsolute(element);
	var left = window.pageXOffset;
	if(absolutePosition.left<left)return false;
	var top = window.pageYOffset;
	var elementTop = element.offsetTop;
	if(absolutePosition.top <top)return false
	if(!viewportDimensions)
		viewportDimensions = getViewportDimensions();
	if(isOverflowingViewportRight(element, viewportDimensions, absolutePosition))return false;
	if(isOverflowingViewportBottom(element, viewportDimensions, absolutePosition))return false;
	return true;
};
var isOverflowingViewportRight = global['isOverflowingViewportRight']=function(element, viewportDimensions/*optional*/, absolutePosition){
	if(!viewportDimensions)viewportDimensions = getViewportDimensions();
	if(!absolutePosition)absolutePosition = getAbsolute(element);
	var right = window.pageXOffset+viewportDimensions[0];
	var elementRight = absolutePosition.left+element.offsetWidth;
	return elementRight > right;
};
var isOverflowingViewportBottom = global['isOverflowingViewportBottom']=function(element, viewportDimensions/*optional*/, absolutePosition){
	if(!viewportDimensions)viewportDimensions = getViewportDimensions();
	if(!absolutePosition)absolutePosition = getAbsolute(element);
	var top = window.pageYOffset;
	var bottom = top + viewportDimensions[1];
	var elementBottom = absolutePosition.top + element.offsetHeight;
	return elementBottom>bottom;
};