jTAC._internal.temp._Conditions_Required={extend:"Conditions.BaseOneOrMoreConnections",constructor:function(a){this.callParent([a]);this._internal.allMustBeEditable=false},config:{mode:"OneOrMore",minimum:0,maximum:999},configrules:{mode:["All","OneOrMore","AllOrNone","One","Range"]},_evaluateRule:function(){var b=this.getMoreConnections();if(b.length==0){var f=this.getConnection();if(!f.isEditable()){return -1}return this.count=(f.isNullValue(true)?0:1)}var c=this._cleanupConnections();var a=c.length;if(!a){return -1}var e=0;for(var d=0;d<c.length;d++){if(!c[d].isNullValue(true)){e++}}this.count=e;switch(this.getMode()){case"All":return e==a?1:0;case"OneOrMore":return(e>0)?1:0;case"AllOrNone":return((e==0)||(e==a))?1:0;case"One":return(e==1)?1:0;case"Range":return((this.getMinimum()<=e)&&(e<=this.getMaximum()))?1:0;default:this._error("Unknown mode name.")}}};jTAC.define("Conditions.Required",jTAC._internal.temp._Conditions_Required);jTAC.defineAlias("Required","Conditions.Required");