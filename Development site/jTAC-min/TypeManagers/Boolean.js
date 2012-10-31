jTAC._internal.temp._TypeManagers_Boolean={extend:"TypeManagers.Base",constructor:function(a){this.callParent([a])},config:{reFalse:/^(false)|(0)$/i,reTrue:/^(true)|(1)$/i,numFalse:[0],numTrue:[1],falseStr:"false",trueStr:"true",emptyStrFalse:true},configrules:{reFalse:jTAC.checkAsRegExp,reTrue:jTAC.checkAsRegExp},nativeTypeName:function(){return"boolean"},dataTypeName:function(){return"boolean"},storageTypeName:function(){return"boolean"},_nativeToString:function(a){return a?this.getTrueStr():this.getFalseStr()},toValue:function(a){if(typeof(a)=="number"){return this._numberToBoolean(a)}return this.callParent([a])},_stringToNative:function(b){if(b==""){if(this.getEmptyStrFalse()){return false}this._error("Empty string is not permitted when emptyStrFalse = false.")}else{var a=this.getReFalse();if(a&&a.test(b)){return false}a=this.getReTrue();if(a&&a.test(b)){return true}}this._inputError("Could not convert the string '"+b+"' to a boolean.")},_isNull:function(a){if(a==""){return !this.getEmptyStrFalse()}return a==null},_numberToBoolean:function(a){var c=this.getNumFalse();if(c&&(c.length>0)&&(c.indexOf(a)>-1)){return false}var b=this.getNumTrue();if(b){if(b===true){return true}if((b.length>0)&&(b.indexOf(a)>-1)){return true}}this._inputError("Could not convert the number "+a+" to a boolean.")},toValueNeutral:function(a){if(typeof(a)=="boolean"){return a}if(/^false$/i.test(a)){return false}if(/^true$/i.test(a)){return true}this._inputError("Required values: 'false' and 'true'")},toStringNeutral:function(a){if(a==null){return""}return a?"true":"false"},_reviewValue:function(a){return !!a},isValidChar:function(a){return false},toNumber:function(a){return a?1:0},setNumFalse:function(a){if(typeof(a)=="number"){a=[a]}this.config.numFalse=a},setNumTrue:function(a){if(typeof(a)=="number"){a=[a]}this.config.numTrue=a}};jTAC.define("TypeManagers.Boolean",jTAC._internal.temp._TypeManagers_Boolean);jTAC.defineAlias("Boolean","TypeManagers.Boolean");