if(!window.jTAC){throw new Error("window.jTAC not created.")}jTAC._internal.temp.jqActions_Style={extend:"jqActions.Base",constructor:function(a){},config:{styleName:"",value:null,valueFailed:null},configrules:{value:jTAC.checkAsStrOrNull,valueFailed:jTAC.checkAsStrOrNull},_prep:function(a,b){this._internal.orig=b.css(this.styleName)},onsuccess:function(a,b){if(this.value==null){return}b.css(this.styleName,this.value)},onfailed:function(a,b){var c=this.valueFailed;if(c==null){c=this._internal.orig}b.css(this.styleName,c)}};jTAC.define("jqActions.Style",jTAC._internal.temp.jqActions_Style);jTAC.defineAlias("Style","jqActions.Style");