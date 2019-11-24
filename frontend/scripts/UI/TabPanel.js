var TabPanel = window['TabPanel']= function(params, autoHeight, styleNames)
{
	var tabInfos = params['tabs'];
	var propertyNameTabName = params['propertyNameTabName'];
	var model = params[S.MODEL];
	styleNames=!styleNames?{}:styleNames;
    var self = this;
    var mapNameToPanel = {}; 
    var tabs = [];
    var element = E.DIV();
    var divPanelHousing = E.DIV();
    var divTabs = E.DIV();
	divTabs.classList.add('tabs');
    element.style.height =  autoHeight?'auto':'100%';
	element.classList.add('tab-panel');
    var tabPercent = 100 / tabInfos.length;
    divPanelHousing.style.height = autoHeight?'auto':'calc(100% - 20px)';
    divPanelHousing.style.width = '100%';
    if(!autoHeight)
		divPanelHousing.style.top = '20px';
    divPanelHousing.style.float='left';
    divPanelHousing.style.position = autoHeight?'relative':'absolute';
    element.appendChild(divTabs);
    element.appendChild(divPanelHousing);
    for (var i = 0, tabInfo; tabInfo = tabInfos[i]; i++)
    {
        var panel = new Panel();
		var name = tabInfo['name'];
		var text = tabInfo[S.TEXT];
        var tab = new Tab(name, text, panel, i);
        mapNameToPanel[name]=panel;
        mapNameToPanel[name]=panel;
        tabs.push(tab);
        divPanelHousing.appendChild(panel[S.GET_ELEMENT]());
        divTabs.appendChild(tab[S.GET_ELEMENT]());
    }
    var propertyBindingTabName = PropertyBinding[S.STANDARD](this, model, propertyNameTabName, tabNameChanged);
    this[S.CLOSE] = function () {
		var j=0;
        for (var i in mapNameToPanel)
        {
            mapNameToPanel[i].close();
            tabs[j++].close();
        }
    };
	this[S.GET_ELEMENT] = function(){
		return element;
	};
	this[S.GET_PANEL_ELEMENT]= function(name){
		return mapNameToPanel[name][S.GET_ELEMENT]();
	};
	this[S.DISPOSE]=function(){
		self[S.MY_BINDINGS]&&self[S.MY_BINDINGS][S.DISPOSE]();
	};
    function Tab(name, text, panel, iTab)
    {
        var self = this;
        var element = E.DIV();
        var divName = E.DIV();
        element.style.width = String(tabPercent) + '%';
        element.style.left = String(iTab * tabPercent) + '%';
        element.classList.add('tab');
        divName.classList.add('name');
        element.appendChild(divName);
        divName.innerHTML = text;
        element.addEventListener("mousedown", function () {
			setTimeout(function(){
            propertyBindingTabName.set(name);
			},0);
        });
        this.close = function () {
			
        };
        this.setActive = function () {
            element.style.height = '18px';
        };
        this.setInactive = function () {
            element.style.height = '17px';
        };
		this[S.GET_ELEMENT] = function(){return element;};
    }
    function Panel()
    {
        var self = this;
        var element = E.DIV();
        element.style.height =autoHeight?'auto':'calc(100% - 3px)';
        element.style.position = autoHeight?'relative':'absolute';
		element.classList.add('panel');

        this.show = function () {
            element.style.display = 'inline';
        };
        this.hide = function () {
            element.style.display = 'none';
        };
        this.close = function () {
			
        };
		this[S.GET_ELEMENT] = function(){
			return element;
		};
    }
    function setActivePanel(panel)
    {
		var j=0;
        for (var i in mapNameToPanel)
        {
            var p = mapNameToPanel[i];
            p.hide();
            if (panel != p)
                tabs[j++].setInactive();
            else
            {
                tabs[j++].setActive();
                if(self.onChangeTab)self.onChangeTab(i);
            }
        }
        panel.show();
    }
	function tabNameChanged(value){
		setActivePanel(mapNameToPanel[value]);
	}
};