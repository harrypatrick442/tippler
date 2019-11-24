var LocationPicker=window['LocationPicker']=function(params) {
	var model = params[S.MODEL];
	if(!model) throw new Error('No model supplied');
	var propertyNameLatLng= params[S.PROPERTY_NAME_LAT_LNG];
	if(!propertyNameLatLng)throw new Error('No '+S.PROPERTY_NAME_LAT_LNG+' was supplied');
	var propertyNameFormattedAddress = params[S.PROPERTY_NAME_FORMATTED_ADDRESS];
	var map,timerResize,resizeManagerWatcher;
	var loaded=false;
	var resizing=false;
	var showing=false;
	var element = E.DIV();
	element.classList.add('location-picker');
	var mapElement = E.DIV();
	mapElement.classList.add('map');
	var textSearch = new TextSearch();
	var markerHousing = new MarkerHousing();
    var marker = new Marker(mapElement);
	var p={};
	var spinner = new Spinner(p);
	element.appendChild(spinner[S.GET_ELEMENT]());
    element.appendChild(mapElement);
    element.appendChild(textSearch[S.GET_ELEMENT]());
    element.appendChild(markerHousing[S.GET_ELEMENT]());
	element.appendChild(marker[S.GET_ELEMENT]());
    marker.addEventListener(S.MOVED, draggedMarker);
	p={};
	p[S.ON_RESIZED]=scheduleResize;
	p[S.ON_FIRST_RESIZE]=onStartResize;
	p[S.ELEMENT]=element;
	resizeManagerWatcher= ResizeManager.add(p);
	var p ={};
	p[S.CALLBACK]=resize;
	p[S.MAX_N_TRIGGERS]=20;
	p[S.MAX_TOTAL_DELAY]=500;
	var temporalCallbackResize = new TemporalCallback(p);
	spinner[S.SET_VISIBLE](true);
	var propertyBindingLatLng = PropertyBinding[S.STANDARD](this, model, propertyNameLatLng, latLngChanged, true);
	latLngChanged(propertyBindingLatLng[S.GET]());
    GoogleMaps[S.GET](function() {
		loaded=true;
		spinner[S.SET_VISIBLE](false);
        textSearch[S.INITIALIZE]();
        initMap();
		updateMarkerHousingVisible();
		updateMarkerVisible();
    });
	this[S.WAS_SET_VISIBLE]=function(){
		showing = true;
		setTimeout(function(){
			latLngChanged(propertyBindingLatLng[S.GET]());
		}, 0);
	};
	this[S.WAS_SET_HIDDEN]=function(){
		showing = false;
		updateMarkerHousingVisible();
		updateMarkerVisible();
		//marker[S.HIDE]();
	};
	this[S.GET_ELEMENT]=function(){
		return element;
	};
	//mapElement.addEventListener('touchstart', resizeMap);
    function geolocate() {
        if (!navigator['geolocation'])return;
		navigator['geolocation']['getCurrentPosition'](function(position) {
			var geolocation = {
				'lat': position['coords']['latitude'],
				'lng': position['coords']['longitude']
			};
			setLatLng(geolocation);
		});
    }
	function setLatLng(latLng){
		propertyBindingLatLng[S.SET](latLng);
	}
	function onStartResize(){
		updateMarkerVisible();
	}
	function resize(){
		resizing=false;
		if(mapElement.offsetWidth<=0||mapElement.offsetHeight<=0)return;
		google.maps.event.trigger(map, 'resize');
		if(hasSelectedLatLng())marker[S.CENTER]();
		updateMarkerVisible();
		updateMarkerHousingVisible();
	}
	function hasSelectedLatLng(){
		return propertyBindingLatLng[S.GET]()?true:false;
	}
    function scheduleResize() {
		resizing=true;
		updateMarkerVisible();
		temporalCallbackResize['trigger']();
    }
    function movedMap(){
        resetMarker();
    }
    function draggingMap(){
		textSearch[S.CLEAR]();
    }
    function draggedMarker(){
        textSearch[S.CLEAR]();
    }
    function resetMarker(){
		marker[S.RESET]();
		updateMarkerHousingVisible();
		updateMarkerVisible();
    }
	function updateMarkerHousingVisible(){
		var visible=visible||!marker[S.IS_SET]();
		visible=visible||!latLngIsSet();
		visible=visible&&!marker[S.BEING_DRAGGED]();
		visible = visible&&loaded;
		markerHousing[S.SET_VISIBLE](visible);
	}
	function updateMarkerVisible(){
		var visible = !resizing;
		visible=visible&&loaded;
		visible = visible&&showing;
		marker[S.SET_VISIBLE](visible);
	}
	function latLngIsSet(){
		return propertyBindingLatLng[S.GET]()?true:false;
	}
    function initMap() {
        var uluru = {'lat': -25.363, 'lng': 131.044};
        map = new google['maps']['Map'](mapElement, {
            zoom: 4,
            center: uluru,
			
			  zoomControl: true,
			  mapTypeControl: true,
			  scaleControl: true,
			  streetViewControl: false,
			  rotateControl: true,
			  fullscreenControl: false,
			  mapTypeControlOptions: {
				  style: google['maps']['MapTypeControlStyle']['HORIZONTAL_BAR'],
				  position: google['maps']['ControlPosition']['BOTTOM_LEFT']
			  },
			  rotateControlOptions: {
				  style: google['maps']['MapTypeControlStyle']['HORIZONTAL_BAR'],
				  position: google['maps']['ControlPosition']['BOTTOM_CENTER']
			  },
        });
        map.addListener('center_changed',movedMap);
        map.addListener('dragstart', draggingMap);
    }

	function latLngChanged(value){
		if(!value){
			updateMarkerHousingVisible();
			updateMarkerVisible();
			return;
		}
		if(!map)return;
        map['setZoom'](16);      // This will trigger a zoom_changed on the map
        map['setCenter'](value);
        marker[S.CENTER]();
		updateAddressFieldsFromLatLng(value);
		updateMarkerHousingVisible();
		updateMarkerVisible();
        marker[S.CENTER]();
	}
	
	//{ #region updating formatted address string
	
	function getLocationStringAndAddressComponentsFromLatLng(latLng, callback)
	{
		var geocoder = new google['maps']['Geocoder']();
		geocoder['geocode']({'latLng': latLng}, function(results, status) {
			if (status != google.maps.GeocoderStatus.OK) return;
				var res = results[0];
				if (!res)return;
				var addressComponents = GeocodingHelper[S.GET_ADDRESS_COMPONENTS_FROM_GEOCODE_RESULT](res);
				callback(GeocodingHelper[S.GET_FORMATTED_ADDRESS_FROM_ADDRESS_COMPONENTS](addressComponents), addressComponents);
		});
	}
	function updateAddressFieldsFromLatLng(latLng){
		getLocationStringAndAddressComponentsFromLatLng(latLng, function(formattedAddress, addressComponents) {
			textSearch[S.SET_VALUE](formattedAddress);
			setAddressComponentsOnModel(addressComponents);
			//setQuadrantTree(QuadTree.getMyQuadrants(selectedGeolocation));
		});
	}
	function setAddressComponentsOnModel(addressComponents){
		for(var addressComponentName in addressComponents){
			var setterName = PropertyHelper[S.GET_SETTER_NAME](addressComponentName);
			var setter = model[setterName];
			if(setter)
				setter(addressComponents[addressComponentName]);
		}
	}
	//} #endregion updating formatted address string
	//{ #region Marker
	function Marker(mapElement) {
        EventEnabledBuilder(this);
        var self = this;
        var boundaries;
        var startOffsets;
        var position;
		var set=false;
		var beingDragged = false;
		var markerWidth, markerHeight;
        var element = E.DIV();
		element.classList.add('marker');
		var p = {};
		p[S.SEMANTIC]= S.LOCATION_PICKER_MAP_MARKER_ICON;
		p[S.SEMANTIC_HOVER]= S.LOCATION_PICKER_MAP_MARKER_ICON_HOVER;
        var img = new ImageControl(p);
        element.appendChild(img[S.GET_ELEMENT]());
        mapElement.appendChild(element);
		var defaultRight,defaultTop;
		var firstSetVisible=true;
        this[S.RESET] = function() {
			set=false;
			setPosition(mapElement.offsetWidth - defaultRight, defaultTop);
        };
		this[S.IS_SET]=function(){
			return set;
		};
		this[S.BEING_DRAGGED]=function(){return beingDragged;};
		this[S.HIDE]=function(){
			setVisible(false);
		};
		this[S.SET_VISIBLE]= setVisible;
        this[S.CENTER] = function()
        {
			set=true;
			setVisible(true);
            setPosition((mapElement.offsetWidth -element.offsetWidth)/2,
			(mapElement.offsetHeight / 2) - element.offsetHeight);
        };
		p={};
		p[S.ELEMENT]=element;
		p[S.STOP_PROPAGATION]=true;
        var efficientMovingCycle = new EfficientMovingCycle(p);
        efficientMovingCycle[S.ON_START] = function(e, isTouch) {
			preventDefault(e);
			if(isTouch)
				mouseDown(getTouchesX(e), getTouchesY(e));
			else
				mouseDown(e.pageX, e.pageY);
        };
        efficientMovingCycle[S.ON_MOVE] = function(e, isTouch) {
			preventDefault(e);
			if(isTouch)
				mouseMove(getTouchesX(e), getTouchesY(e));
			else
				mouseMove(e.pageX, e.pageY);
        };
        efficientMovingCycle[S.ON_END] = mouseUp;
		this[S.GET_ELEMENT]=function(){
			return element;
		};
		function setVisible(value){
			if(value)element.classList.add('visible');
			else element.classList.remove('visible');
			if(value&&firstSetVisible){
				setTimeout(function(){
					defaultRight= mapElement.offsetWidth - element.offsetLeft;
					defaultTop=element.offsetTop;
				},0);
				firstSetVisible=false;
			}
		}
		function getTouchesX(e){return e.changedTouches[e.changedTouches.length - 1].pageX;}
		function getTouchesY(e){return e.changedTouches[e.changedTouches.length - 1].pageY;}
		function preventDefault(e){
            e.preventDefault && e.preventDefault();
		}
		function setUnset(value){
			if(value){
				element.classList.add('unset');
				return;
			}
			element.classList.remove('unset');
		}
        function setPosition(x, y)
        {
            element.style.left = String(x) + 'px';
            element.style.top = String(y) + 'px';
        }
        function pixelOffsetToLatLng(x, y) {
            var offsetx = mapElement.offsetWidth / 2 - x;
            var offsety = y - mapElement.offsetHeight / 2;
            var latLng = map['getCenter']();
            var scale = Math.pow(2, map['getZoom']());

            var worldCoordinateCenter = map['getProjection']()['fromLatLngToPoint'](latLng);
			var Point = google['maps']['Point'];
            var pixelOffset = new Point((offsetx / scale) || 0, (offsety / scale) || 0);
			
            var worldCoordinateNewCenter = new Point(worldCoordinateCenter.x - pixelOffset.x,worldCoordinateCenter.y + pixelOffset.y);
            var latLngPosition = map['getProjection']()['fromPointToLatLng'](worldCoordinateNewCenter);
            var latLng = {};
			latLng['lat'] = latLngPosition['lat']();
			latLng['lng'] = latLngPosition['lng']();
            return latLng
        }
        function mouseDown(x, y)
        {
			set=false;
			beingDragged=true;
            startOffsets = {};
			startOffsets[S.X]=element.offsetLeft - x;
			startOffsets[S.Y]=element.offsetTop - y;
			markerWidth = element.offsetWidth;
            var halfWidth = markerWidth / 2;
			markerHeight = element.offsetHeight;
            boundaries = {};
			boundaries[S.X_FROM]=-halfWidth;
			boundaries[S.Y_FROM]= -markerHeight;
			boundaries[S.X_TO]= mapElement.offsetWidth - halfWidth;
			boundaries[S.Y_TO]=mapElement.offsetHeight - markerHeight;
			updateMarkerHousingVisible();
        }
        function mouseMove(x, y)
        {
            x = startOffsets[S.X] + x;
            y = startOffsets[S.Y] + y;
            if (x < boundaries[S.X_FROM])
                x = boundaries[S.X_FROM];
            else
            {
                if (x > boundaries[S.X_TO])
                    x = boundaries[S.X_TO];
            }
            if (y < boundaries[S.Y_FROM])
                y = boundaries[S.Y_FROM];
            else
            {
                if (y > boundaries[S.Y_TO])
                    y = boundaries[S.Y_TO];
            }
            position = {};
			position[S.X]=x;
			position[S.Y]=y;
            setPosition(x, y);
        }
        function mouseUp(){
			set=true;
			beingDragged=false;
            var latLng = pixelOffsetToLatLng((markerWidth / 2) + position[S.X], markerHeight + position[S.Y]);
            setLatLng(latLng);
            dispatchMoved();
			updateMarkerHousingVisible();
        }
		function dispatchMoved(){
			var p ={};
			p[S.TYPE]= S.MOVED;
			self.dispatchEvent(p);
		}
    }
	//} #endregion Marker
	function MarkerHousing(){
		var element = E.DIV();
		p={};
		p[S.TEXT]='Drag Me';
		var textBlock = new TextBlock(p);
		element.appendChild(textBlock[S.GET_ELEMENT]());
		element.classList.add('marker-housing');
		this[S.GET_ELEMENT]=function(){
			return element;
		};
		this[S.SET_VISIBLE]=function(value){
			if(value)element.classList.add('visible');
			else element.classList.remove('visible');
		};
	}
	function TextSearch(){
		if(!propertyNameFormattedAddress)throw new Error('No propertyNameFormattedAddress was supplied');
		var propertyBindingFormattedAddress = PropertyBinding[S.STANDARD](this, model, propertyNameFormattedAddress, formattedAddressChanged);
		var p={};
		p[S.CLASS_NAMES]=['autocomplete'];
		p[S.MODEL]=model;
		p[S.PROPERTY_NAME]=propertyNameFormattedAddress;
		var textBox = new TextBox(p);
		var element = textBox[S.GET_ELEMENT]();
		var autocomplete;
		this[S.GET_ELEMENT]=function(){
			return element;
		};
		this[S.CLEAR]=function(){
			setValue('');
		};
		this[S.INITIALIZE]=function(){
			initAutocomplete();
			setVisible(true);
		};
		this[S.SET_VALUE] = setValue;
		function setValue(value){
			propertyBindingFormattedAddress[S.SET](value);
		};
		function setVisible(value){
			if(value)element.classList.add('visible');
			else element.classList.remove('visible');
		}
		function formattedAddressChanged(value){
			
		}
		function initAutocomplete() {
			autocomplete = new google['maps']['places']['Autocomplete'](textBox[S.GET_ELEMENT](),{types: ['geocode']});
			autocomplete['addListener']('place_changed', fillInAddress);
		}
		function fillInAddress() {
			var place = autocomplete['getPlace']();
			var geolocation={lat:place['geometry']['location']['lat'](),'lng':place['geometry']['location']['lng']()};
			setLatLng(geolocation, false);
			setFormattedAddress(element.value);
		}
		function setFormattedAddress(value){
			propertyBindingFormattedAddress[S.SET](value);
		}
	}
};