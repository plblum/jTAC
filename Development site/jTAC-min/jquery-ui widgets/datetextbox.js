(function(b){var a={options:new jTAC_DataTypeEditorOptions(),_create:function(){if(!window.jTAC){throw new Error("window.jTAC not created.")}jTAC.require("Connections.FormElement","TypeManagers.Date");if(!window.jTAC_DataTypeEditorOptions){jTAC.error("Requires the datatypeeditor scripts.")}},_init:function(){try{jTAC._internal.pushContext("datetextbox._init()");var g=this;var d=this.element[0];if(!this.options.datatype&&!this.element.data("jtac-datatype")){this.options.datatype="TypeManagers.Date"}if(!b.data(d,"jtac-datatype")){d.setAttribute("data-jtac-datatype",this.options.datatype)}if(!this.options.getCommandName){this.options.getCommandName=function(j,k,i){if(b.datepicker._datepickerShowing){return g._getCommandName(j,k,i)}return null}}this.element.dataTypeEditor(this.options);var f=b.data(d,"dataTypeEditor");if(!f){return}var c=f._tm;if(!c||(c.dataTypeName()!="date")){return}this._dte=f;this._tm=c;if(c.installCmd){c.installCmd({commandName:"Calendar",func:function(i){return g._popup.call(g,i)},ignoreCurrent:true})}var e=this.options.datepicker||{};e.constrainInput=false;if(!e.dateFormat){e.dateFormat=this._convertDatePattern(c._datePattern())}e.dayNames=c.dateTimeFormat("Days");e.dayNamesMin=c.dateTimeFormat("DaysShort");e.dayNamesShort=c.dateTimeFormat("DaysAbbr");e.monthNames=c.dateTimeFormat("Months");e.monthNamesShort=c.dateTimeFormat("MonthsAbbr");if(!e.minDate&&c.getMinValue&&c.getMinValue()){e.minDate=c.getMinValue}if(!e.maxDate&&c.getMaxValue&&c.getMaxValue()){e.maxDate=c.getMaxValue}if(!e.showOn){e.showOn="button"}this._prepAutoButton(this.options);this.element.datepicker(e);var h=b.data(d,"datepicker");this._finishAutoButton(h,this.options);b(document).ready(function(){if(b.validator){var i=b.data(d.form,"validator");if(i&&i.settings){var j=i.settings.ignore||"";if(j instanceof Array){if(j.length){i.settings.ignore.push(".ui-datepicker-trigger")}else{j=""}}if(typeof j=="string"){i.settings.ignore=(j?j+",":"")+".ui-datepicker-trigger"}}}})}finally{jTAC._internal.popContext()}},_convertDatePattern:function(c){if(c.indexOf("MMMM")>-1){c=c.replace("MMMM","MM")}else{if(c.indexOf("MMM")>-1){c=c.replace("MMM","M")}else{if(c.indexOf("MM")>-1){c=c.replace("MM","mm")}else{if(c.indexOf("M")>-1){c=c.replace("M","m")}}}}if(c.indexOf("yyyy")>-1){c=c.replace("yyyy","yy")}else{if(c.indexOf("yy")>-1){c=c.replace("yy","yy")}}return c},_getCommandName:function(d,e,c){switch(d.keyCode){case 37:case 38:case 39:case 40:case 35:case 36:return d.ctrlKey?"":null;case 27:case 13:case 33:case 34:return !d.ctrlKey?"":null}return null},_prepAutoButton:function(c){var d=c.datepicker;if(!d.buttonImage||d.buttonImage.toLowerCase().indexOf("spacer.gif")==-1){return}if(d.showOn=="focus"){return}c.autoButton=true;if(d.buttonImageOnly==null){d.buttonImageOnly=true}if(d.buttonText==null){d.buttonText="Open"}},_finishAutoButton:function(k,d){if(!d.autoButton){return}var f=window.document.styleSheets;if(!f){return}var j="ui-datepicker-trigger-pressed";for(var c=0;c<f.length;c++){var g=f[c];var h=g.cssRules?g.cssRules:g.rules;for(var e=0;e<h.length;e++){if(h[e].selectorText&&h[e].selectorText.toLowerCase()=="."+j){k.trigger.mousedown(function(i){k.trigger.addClass(j)});k.trigger.mouseup(function(i){k.trigger.removeClass(j)});k.trigger.mouseout(function(i){k.trigger.removeClass(j)});return}}}},_popup:function(c){this.element.datepicker("show");return false},_setOption:function(c,d){b.Widget.prototype._setOption.apply(this,arguments)}};b.widget("ui.dateTextBox",a)})(jQuery);if(jTAC.isDefined("TypeManagers.BaseDate")){var jTAC_DateCmds=jTAC.TypeManagers.BaseDate.prototype.getCommandKeys();jTAC_DateCmds.push({commandName:"Calendar",keyCode:13,ctrl:true});jTAC.TypeManagers.BaseDate.prototype.getCommandKeys=function(){return jTAC_DateCmds}};