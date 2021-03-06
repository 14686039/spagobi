/** SpagoBI, the Open Source Business Intelligence suite

 * Copyright (C) 2012 Engineering Ingegneria Informatica S.p.A. - SpagoBI Competency Center
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0, without the "Incompatible With Secondary Licenses" notice.
 * If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. **/

Ext.ns("Sbi.cockpit.widgets.barchart");

Sbi.cockpit.widgets.barchart.BarChartWidgetDesigner = function(config) {

		var defaultSettings = {
			name: 'barChartWidgetDesigner'
			,title: LN('sbi.cockpit.widgets.barchart.barChartWidgetDesigner.title')
			, border: false
			, showSeriesGroupingPanel: false
		};

		if (Sbi.settings && Sbi.settings.cockpit && Sbi.settings.cockpit.widgets && Sbi.settings.cockpit.widgets.barchart && Sbi.settings.cockpit.widgets.barchart.barChartWidgetDesigner) {
			defaultSettings = Ext.apply(defaultSettings, Sbi.settings.cockpit.widgets.barchart.barChartWidgetDesigner);
		}
		var c = Ext.apply(defaultSettings, config || {});
		Ext.apply(this, c);

		this.chartLib = 'ext3';
		if (Sbi.settings && Sbi.settings.cockpit && Sbi.settings.cockpit.chartlib) {
			this.chartLib = Sbi.settings.cockpit.chartlib;
		}
		this.chartLib = this.chartLib.toLowerCase();

		this.addEvents("attributeDblClick", "attributeRemoved");

		this.init();

		c = {
				items: [this.form]
			};

		Sbi.cockpit.widgets.barchart.BarChartWidgetDesigner.superclass.constructor.call(this, c);

		if(Ext.isIE){
			this.on('resize', function(a,b,c,d){try{ this.form.setWidth(b-50);}catch(r){}}, this);
		}

		this.on(
				'beforerender' ,
				function (thePanel, attribute) {
					var state = {};
					state.type = thePanel.type;
					state.orientation = thePanel.orientation;
					state.showvalues = thePanel.showvalues;
					state.showlegend = thePanel.showlegend;
					state.legendPosition = thePanel.legendPosition;
					state.category = thePanel.category;
					state.groupingVariable = thePanel.groupingVariable;
					state.series = thePanel.series;
					state.categoryAxis = thePanel.categoryAxis;
					state.seriesAxis = thePanel.seriesAxis;
					state.sortOrder = thePanel.sortOrder;
					state.wtype = 'barchart';
					this.setDesignerState(state);
				},
				this
			);
		this.on('afterLayout', this.addToolTips, this);

		this.categoryContainerPanel.on(	'beforeAddAttribute', this.checkIfAttributeIsAlreadyPresent, this);

		if(this.showSeriesGroupingPanel === true) {
			this.seriesGroupingPanel.on('beforeAddAttribute', this.checkIfAttributeIsAlreadyPresent, this);
		}
};

Ext.extend(Sbi.cockpit.widgets.barchart.BarChartWidgetDesigner, Sbi.cockpit.core.WidgetDesigner, {
	// =================================================================================================================
	// PROPERTIES
	// =================================================================================================================
	form: null
	, items: null
	, typeRadioGroup: null
	, orientationCombo: null
	, showValuesCheck: null
	, imageTemplate: null
	, categoryContainerPanel: null
	, seriesGroupingPanel: null
	, seriesContainerPanel: null
	, axisDefinitionPanel: null
	, showLegendCheck: null
	, radioGroupIds: null
	, chartLib: null
	, categoryAxis: null
	, seriesAxis: null
	, sortOrder: null
	, legendPositionCombo: null

	// =================================================================================================================
	// METHODS
	// =================================================================================================================



	// -----------------------------------------------------------------------------------------------------------------
	// init methods
	// -----------------------------------------------------------------------------------------------------------------

	, init: function () {
		this.initTemplate();

		this.radioGroupIds = [Ext.id(), Ext.id(), Ext.id()]; // generate random id

		this.typeRadioGroup = new Ext.form.RadioGroup({
			hideLabel: true,
			columns: 3,
			items: [
		        {name: 'type', height: 80, width: 80, id: this.radioGroupIds[0], ctCls:'side-by-side-barchart-vertical', inputValue: 'side-by-side-barchart', checked: true},
		        {name: 'type', height: 80, width: 80, id: this.radioGroupIds[1], ctCls:'stacked-barchart-vertical', inputValue: 'stacked-barchart'},
		        {name: 'type', height: 80, width: 80, id: this.radioGroupIds[2], ctCls:'percent-stacked-barchart-vertical', inputValue: 'percent-stacked-barchart'}
			]
		});
		this.typeRadioGroup.on('change', this.changeBarChartImage, this);

		this.orientationComboStore = new Ext.data.ArrayStore({
			fields : ['name', 'description']
			, data : [['vertical', LN('sbi.worksheet.designer.barchartdesignerpanel.form.orientation.vertical')]
					, ['horizontal', LN('sbi.worksheet.designer.barchartdesignerpanel.form.orientation.horizontal')]]
		});
		this.orientationCombo = new Ext.form.ComboBox({
			queryMode:      'local',
			triggerAction:  'all',
			forceSelection: true,
			editable:       false,
			allowBlank: 	false,
			fieldLabel:     LN('sbi.worksheet.designer.barchartdesignerpanel.form.orientation.title'),
			name:           'orientation',
			displayField:   'description',
			valueField:     'name',
			value:			'vertical',
			labelWidth:		120,
			store:          this.orientationComboStore
		});
		this.orientationCombo.on('change', this.changeBarChartImage, this);


		this.showValuesCheck = new Ext.form.Checkbox({
			name: 'showvalues'
			, labelWidth: 80
			, checked: false
			, fieldLabel: LN('sbi.worksheet.designer.barchartdesignerpanel.form.showvalues.title')
		});

		this.showLegendCheck = new Ext.form.Checkbox({
			name: 'showlegend'
			, labelWidth: 80
			, checked: false
			, fieldLabel: LN('sbi.worksheet.designer.barchartdesignerpanel.form.showlegend.title')
		});

		this.legendPositionStore = new Ext.data.ArrayStore({
			fields : ['name', 'description']
			, data : [['bottom', LN('sbi.cockpit.widgets.piechartwidgetdesigner.form.legend.position.bottom')]
					, ['top', LN('sbi.cockpit.widgets.piechartwidgetdesigner.form.legend.position.top')]
					, ['left', LN('sbi.cockpit.widgets.piechartwidgetdesigner.form.legend.position.left')]
					, ['right', LN('sbi.cockpit.widgets.piechartwidgetdesigner.form.legend.position.right')]]
		});
		this.legendPositionCombo = new Ext.form.ComboBox({
//			width:			160,
			queryMode:      'local',
			triggerAction:  'all',
			forceSelection: true,
			editable:       false,
			allowBlank: 	false,
			fieldLabel:      LN('sbi.cockpit.widgets.piechartwidgetdesigner.form.legend.position.title'),
			name:           'position',
			displayField:   'description',
			valueField:     'name',
			value:			'bottom',
			labelWidth:		100,
			store:          this.legendPositionStore
		});

		this.categoryAxisText = new Ext.form.Text({
			 name: 'categoryAxis',
			 fieldLabel: LN('sbi.worksheet.designer.barchartdesignerpanel.form.categoryaxis.title'),
			 allowBlank: true,
			 labelWidth:		120,
		});

		this.seriesAxisText = new Ext.form.Text({
			 name: 'seriesAxis',
			 fieldLabel: LN('sbi.worksheet.designer.barchartdesignerpanel.form.seriesaxis.title'),
			 allowBlank: true,
			 labelWidth:		100,
		});

		this.sortOrderComboStore = new Ext.data.ArrayStore({
			fields : ['name', 'description']
			, data : [['ASC', LN('sbi.worksheet.designer.barchartdesignerpanel.form.sortorder.ascending')]
					, ['DESC', LN('sbi.worksheet.designer.barchartdesignerpanel.form.sortorder.descending')]]
		});
		this.sortOrderCombo = new Ext.form.ComboBox({
			queryMode:      'local',
			triggerAction:  'all',
			forceSelection: true,
			editable:       false,
			allowBlank: 	false,
			fieldLabel:     LN('sbi.worksheet.designer.barchartdesignerpanel.form.sortorder.title'),
			name:           'sortOrder',
			displayField:   'description',
			valueField:     'name',
			value:			'ASC',
			store:          this.sortOrderComboStore,
			labelWidth:		120
		});

		this.categoryContainerPanel = new Sbi.cockpit.widgets.chart.ChartCategoryPanel({
            width: 200
            , height: 70
            , initialData: null
            , ddGroup: this.ddGroup
		});
		// propagate events
		this.categoryContainerPanel.on(
			'attributeDblClick' ,
			function (thePanel, attribute) {
				this.fireEvent("attributeDblClick", this, attribute);
			},
			this
		);
		this.categoryContainerPanel.on(
			'attributeRemoved' ,
			function (thePanel, attribute) {
				this.fireEvent("attributeRemoved", this, attribute);
			},
			this
		);

		if(this.showSeriesGroupingPanel === true) {
			this.seriesGroupingPanel = new Sbi.cockpit.widgets.chart.SeriesGroupingPanel({
	            width: 430
	            , height: 70
	            , initialData: null
	            , ddGroup: this.ddGroup
			});
			// propagate events
			this.seriesGroupingPanel.on(
				'attributeDblClick' ,
				function (thePanel, attribute) {
					this.fireEvent("attributeDblClick", this, attribute);
				},
				this
			);
			this.seriesGroupingPanel.on(
				'attributeRemoved' ,
				function (thePanel, attribute) {
					this.fireEvent("attributeRemoved", this, attribute);
				},
				this
			);
		} else {
			this.seriesGroupingPanel = new Ext.Panel({border:false, frame: false});
		}


		this.seriesContainerPanel = new Sbi.cockpit.widgets.chart.ChartSeriesPanel({
            width: 430
            , height: 110
            , initialData: []
            , crosstabConfig: {}
            , ddGroup: this.ddGroup
            , parent: 'barchart'
		});


		this.imageContainerPanel = new Ext.Panel({
            width: 200
            , height: 110
            , html: this.imageTemplate.apply(['side-by-side-barchart', 'vertical'])
		});

	    this.axisDefinitionPanel = new Ext.Panel({
	        baseCls:'x-plain'
//		    , cls: 'centered-panel' //for center the panel
	        , cls: 'x-axis-definition-table'	
			, width: '100%'
	        , padding: '0 10 10 10'
	        , layout: {type: 'table', columns : 2}
	    	//, items: axisDefinitionPanelItems
	        , items:[
	              this.seriesContainerPanel
	            , this.imageContainerPanel
	            , this.seriesGroupingPanel
		        , this.categoryContainerPanel

		    ]
	    });

		var controlsItems = new Array();

		controlsItems.push(this.orientationCombo);
		
		controlsItems.push(this.legendPositionCombo);
		/*
		switch (this.chartLib) {
	        case 'ext3':
	        	break;
	        default:
	        	controlsItems.push(this.showValuesCheck);
		}*/

		controlsItems.push(this.showValuesCheck);
		
		controlsItems.push(this.categoryAxisText);
		
		controlsItems.push(this.seriesAxisText);

    	controlsItems.push(this.showLegendCheck);
    	

    	controlsItems.push(this.sortOrderCombo);


		this.form = new Ext.form.FormPanel({
			border: false
			,layout: 'anchor'
			, items: [
			    {
			    	
			    	padding: '5 10 5 10'
			    	, border: false
			    	, items: [
		    	          {
							  xtype: 'fieldset'
							, fieldDefaults: { margin: '0 9 5 0'}
							, layout: {type: 'table', columns: 3}
				            , collapsible: true
				            , collapsed: true
				            , title: LN('sbi.worksheet.designer.barchartdesignerpanel.form.options.title')
			            	, margin: '0 0 10 0'
//								, title: LN('sbi.worksheet.designer.barchartdesignerpanel.form.fieldsets.options')
							, columnWidth : .275
//								, border: false
							, items: controlsItems
						},
		  			    {
							xtype: 'fieldset'
							, margin: '0 0 0 0'
//							, title: LN('sbi.worksheet.designer.barchartdesignerpanel.form.fieldsets.type')
							, columnWidth : .430
							, border: false
							, items: [this.typeRadioGroup]
						}
						
//						{
//							xtype: 'fieldset'
//								, layout: 'hbox'
//								, collapsible: true
//					            , collapsed: true
//					            , margin: '5 0 5 0'
//					            , title: 'Axis Options'
//								, columnWidth : .275
//								, border: false
//								, items: [this.categoryAxisText,this.seriesAxisText,this.sortOrderCombo]
//							}
			    	]
			    }
				, this.axisDefinitionPanel
			]
		});







	}

	, initTemplate: function () {
	    this.imageTemplate = new Ext.Template('<div class="{0}-{1}-preview" style="height: 100%;"></div>');
	    this.imageTemplate.compile();
	}


	//-----------------------------------------------------------------------------------------------------------------
	//public methods
	//-----------------------------------------------------------------------------------------------------------------
	, addToolTips: function(){
		this.removeListener('afterLayout', this.addToolTips, this);

		var sharedConf = {
			anchor : 'top'
			, width : 200
			, trackMouse : true
		};

		new Ext.ToolTip(Ext.apply({
			target: this.radioGroupIds[0] + '-bodyEl',
			html: LN('sbi.worksheet.designer.barchartdesignerpanel.form.type.tooltip.side-by-side')
		}, sharedConf));
		new Ext.ToolTip(Ext.apply({
			target: this.radioGroupIds[1] + '-bodyEl',
			html: LN('sbi.worksheet.designer.barchartdesignerpanel.form.type.tooltip.stacked')
		}, sharedConf));
		new Ext.ToolTip(Ext.apply({
			target: this.radioGroupIds[2] + '-bodyEl',
			html: LN('sbi.worksheet.designer.barchartdesignerpanel.form.type.tooltip.percent-stacked')
		}, sharedConf));
	}


	, changeBarChartImage: function() {
		var type = this.typeRadioGroup.getValue().type;
		var orientation = this.orientationCombo.getValue();
		var newHtml = this.imageTemplate.apply([type, orientation]);
		this.imageContainerPanel.update(newHtml);
	}

	, getDesignerState: function() {
		Sbi.trace("[BarChartWidgetDesigner.getDesignerState]: IN");
		Sbi.trace("[BarChartWidgetDesigner.getDesignerState]: " + Sbi.cockpit.widgets.barchart.BarChartWidgetDesigner.superclass.getDesignerState);
//		var state = {};
		var state = Sbi.cockpit.widgets.barchart.BarChartWidgetDesigner.superclass.getDesignerState(this);
		state.designer = 'Bar Chart';
		state.wtype = 'barchart';
		state.type = this.typeRadioGroup.getValue().type;
		state.orientation = this.orientationCombo.getValue();
		state.showvalues = this.showValuesCheck.getValue();
		state.showlegend = this.showLegendCheck.getValue();
		state.legendPosition = this.legendPositionCombo.getValue();
		state.categoryAxis = this.categoryAxisText.getValue();
		state.sortOrder = this.sortOrderCombo.getValue();
		state.seriesAxis = this.seriesAxisText.getValue();
		state.category = this.categoryContainerPanel.getCategory();
		if(this.showSeriesGroupingPanel === true) {
			state.groupingVariable = this.seriesGroupingPanel.getSeriesGroupingAttribute();
		}
		state.series = this.seriesContainerPanel.getContainedMeasures();

		Sbi.trace("[BarChartWidgetDesigner.getDesignerState]: OUT");
		return state;
	}

	, setDesignerState: function(state) {
		Sbi.trace("[BarChartWidgetDesigner.setDesignerState]: IN");
		Sbi.cockpit.widgets.barchart.BarChartWidgetDesigner.superclass.setDesignerState(this, state);
		if (state.type) this.typeRadioGroup.setValue({type: state.type});
		if (state.orientation) this.orientationCombo.setValue(state.orientation);
		if (state.showvalues) this.showValuesCheck.setValue(state.showvalues);
		if (state.showlegend) this.showLegendCheck.setValue(state.showlegend);
		if (state.legendPosition) this.legendPositionCombo.setValue(state.legendPosition);
		if (state.categoryAxis) this.categoryAxisText.setValue(state.categoryAxis);
		if (state.seriesAxis) this.seriesAxisText.setValue(state.seriesAxis);
		if (state.sortOrder) this.sortOrderCombo.setValue(state.sortOrder);
		if (state.category) this.categoryContainerPanel.setCategory(state.category);
		if (state.groupingVariable && this.showSeriesGroupingPanel === true) this.seriesGroupingPanel.setSeriesGroupingAttribute(state.groupingVariable);
		if (state.series) this.seriesContainerPanel.setMeasures(state.series);
//		state.wtype = 'barchart';
		Sbi.trace("[BarChartWidgetDesigner.setDesignerState]: OUT");
	}


	, validate: function(validFields){
		Sbi.trace("[BarChartWidgetDesigner.validate]: IN");
		var valErr='';

		valErr+=''+this.categoryContainerPanel.validate(validFields);
		valErr+=''+this.seriesContainerPanel.validate(validFields);
		if(this.showSeriesGroupingPanel === true) {
			valErr+=''+this.seriesGroupingPanel.validate(validFields);
		}

		if(valErr!= ''){
			valErr = valErr.substring(0, valErr.length - 1)
			return LN("sbi.worksheet.designer.validation.invalidFields")+valErr;
		}

		if (this.categoryContainerPanel.category == null){
			return LN("sbi.designerchart.chartValidation.noCategory");
		}
		var store = this.seriesContainerPanel.store;
		var seriesCount = store.getCount();
		if (seriesCount == 0) {
			return LN("sbi.designerchart.chartValidation.noSeries");
		}

		return;

	}

	, containsAttribute: function (attributeId) {
		Sbi.trace("[BarChartWidgetDesigner.containsAttribute]: IN");
		var category = this.categoryContainerPanel.getCategory();
		if (category != null && category.id == attributeId) {
			return true;
		}
		if(this.showSeriesGroupingPanel === true) {
			var groupingVariable = this.seriesGroupingPanel.getSeriesGroupingAttribute();
			if (groupingVariable != null && groupingVariable.id == attributeId) {
				return true;
			}
		}
		return false;
	}

	, checkIfAttributeIsAlreadyPresent: function(aPanel, attribute) {
		var attributeId = attribute.id;
		var alreadyPresent = this.containsAttribute(attributeId);
		if (alreadyPresent) {
			Ext.Msg.show({
				   title: LN('sbi.crosstab.attributescontainerpanel.cannotdrophere.title'),
				   msg: LN('sbi.crosstab.attributescontainerpanel.cannotdrophere.attributealreadypresent'),
				   buttons: Ext.Msg.OK,
				   icon: Ext.MessageBox.WARNING
			});
			return false;
		}
		return true;
	}
});