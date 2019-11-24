var CheckboxArray = window['CheckboxArray'] = (function(){
	var _CheckboxArray = function(params){
		var self = this;
		var model = params[S.MODEL];
		var className = params[S.CLASS_NAME];
		var classNames = params[S.CLASS_NAMES];
		var _default = params[S.DEFAULT];
		var propertyNameItems = params[S.PROPERTY_NAME_ITEMS];
		var propertyNameReadOnly = params[S.PROPERTY_NAME_READ_ONLY];
		var getColumnsName = PropertyHelper[S.GET_GETTER_NAME](params[S.PROPERTY_NAME_COLUMNS]);
		var columns = model[getColumnsName]();
		var _default = params[S.DEFAULT];
		var readOnly = false;
		//if(!columns)throw new Error('No columns provided');
		var element = E.DIV();
		element.classList.add('checkbox-array');
		//each(columns, function(column){
			
		//});
		
		var p={};
		p[S.ELEMENT]=element;
		p[S.MODEL]=model;
		p[S.PROPERTY_NAME_ITEMS]=propertyNameItems;
		p[S.CREATE_VIEW]=createRow;
		var orderedItems = new OrderedItems(p);
		this[S.GET_ELEMENT]=function(){
			return element;
		};
		if(propertyNameReadOnly)
			PropertyBinding[S.STANDARD](this, model, propertyNameReadOnly, readOnlyChanged);
		function readOnlyChanged(value){
			if(value===readOnly)return;
			readOnly = value;
			orderedItems[S.GET_VIEWS]()[S.EACH](function(row){
				row[S.SET_READ_ONLY](readOnly);
			});
		}
		function createRow(model){
			return new Row(model);
		}
		function Row(row){
			var self = this;
			var element = E.DIV();
			element.classList.add('row');
			var p={};
			p[S.TEXT]=row[S.TEXT];
			var text = new TextBlock(p);
			var _columns=[];
			var propertyBinding = PropertyBinding[S.STANDARD](this, model, row[S.PROPERTY_NAME], changed, true);
			var startValue=propertyBinding[S.GET]();
			each(columns, function(column){
				var c = new Column(column, callbackChanged, column[S.VALUE]==startValue);
				_columns.push(c);
				element.appendChild(c[S.GET_ELEMENT]());
			});
			element.appendChild(text[S.GET_ELEMENT]());
			function callbackChanged(column, ticked){
				each(_columns, function(c){
					if(c!=column)c[S.UNTICK]();
				});
				propertyBinding[S.SET](ticked?column[S.GET_VALUE]():_default);
			}
			this[S.GET_ELEMENT]=function(){
				return element;	
			};
			this[S.DISPOSE]=function(){
				
			};
			this[S.SET_READ_ONLY]=function(value){
				each(_columns, function(column){
					column[S.SET_READ_ONLY](value);
				});
			};
			function changed(value){
				for(var i=0; i<_columns.length; i++){
					var column = _columns[i];
					if(column[S.GET_VALUE]()==value){
						column[S.TICK]();
						return;
					}
				}
			}
		}
		function Column(columnParams, callbackChanged, ticked){
			var self = this;
			var p={};
			p[S.CHANGED]=changed;
			p[S.CLASS_NAME]=columnParams[S.CLASS_NAME];
			p[S.IMAGE_SEMANTIC]= columnParams[S.IMAGE_SEMANTIC];
			p[S.IMAGE_SEMANTIC_TICKED]= columnParams[S.IMAGE_SEMANTIC_HOVER];
			p[S.IMAGE_SEMANTIC_HOVER]= columnParams[S.IMAGE_SEMANTIC_TICKED];
			p[S.IMAGE_SEMANTIC_TICKED_HOVER]=columnParams[S.IMAGE_SEMANTIC_TICKED_HOVER];
			p[S.READ_ONLY]=readOnly;
			var tickbox = new Tickbox(p);
			var element = tickbox[S.GET_ELEMENT]();
			this[S.UNTICK]=function(){tickbox[S.SET](false);};
			this[S.TICK]=function(){tickbox[S.SET](true);};
			this[S.GET_ELEMENT]=function(){return element;};
			this[S.GET_VALUE]=function(){return columnParams[S.VALUE];}
			this[S.SET_READ_ONLY]=tickbox[S.SET_READ_ONLY];
			if(ticked){
				tickbox[S.SET](true);
			}
			function changed(e){
				callbackChanged(self, e[S.TICKED]);
			}
		}
	};
	return _CheckboxArray;
})();