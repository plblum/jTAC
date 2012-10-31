jTAC_Temp={config:{minValue:null,maxValue:null},invoke:function(c){var b=this._internal;var a=b.cmds;if(!a){b.cmds=a=[];this._initCmds()}else{if(b.needsCmds){this._initCmds();b.needsCmds=false}}c.changed=false;c.error=false;c.value=null;for(var d=0;d<a.length;d++){var g=a[d];if(g.commandName==c.commandName){if(!g.ignoreCurrent){try{c.value=this.toValueFromConnection(c.connection)}catch(f){if(!g.ignoreError){c.error=true;return}}}if(c.precmd){if(!c.precmd(c)||c.error){return}}if(!c.settings){c.settings=g}if(g.func.call(this,c)){c.changed=true;if(c.postcmd){if(!c.postcmd(c)||c.error){return}}c.connection.setTextValue(this.toString(c.value))}return}}},installCmd:function(c,e){var b=this._internal;var a=b.cmds;if(!a){b.cmds=a=[];b.needsCmds=true}if(!c.func){this._error("args.func not assigned.")}if(e){for(var d=0;d<a.length;d++){if(a[d].commandName==c.commandName){a[d]=c;return}}}a.push(c)},installValueCmd:function(c,b,a){this.installCmd({commandName:c,func:this.setValueCmd,value:b,ignoreCurrent:true},a)},getCmd:function(d){var b=this._internal;var a=b.cmds;if(!a){b.cmds=a=[];this._initCmds()}else{if(b.needsCmds){this._initCmds();b.needsCmds=false}}for(var c=0;c<a.length;c++){if(a[c].commandName==d){return a[c]}}return null},_initCmds:function(){},clearCmd:function(a){a.value=null;return true},setValueCmd:function(b){var a=this._internal.cmds;for(var c=0;c<a.length;c++){var d=a[c];if(d.commandName==b.commandName){b.value=d.value;return true}}return false},_inRange:function(b){var a=this.getMinValue();if((a!=null)&&(this.compare(b,a)<0)){return false}a=this.getMaxValue();if((a!=null)&&(this.compare(b,a)>0)){return false}return true},_adjustForRange:function(b){var a=this.getMinValue();if((a!=null)&&(this.compare(b,a)<0)){return a}a=this.getMaxValue();if((a!=null)&&(this.compare(b,a)>0)){return a}return b},setMinValue:function(a){this.config.minValue=(typeof a=="string")?this.toValueNeutral(a):this.toValue(a)},setMaxValue:function(a){this.config.maxValue=(typeof a=="string")?this.toValueNeutral(a):this.toValue(a)}};jTAC.addMembers("TypeManagers.Base",jTAC_Temp);if(jTAC.isDefined("TypeManagers.BaseDatesAndTimes")){jTAC_Temp={config:{blankStartsAt:null},_initCmds:function(){if(this.supportsDates()){this.installCmd({commandName:"NextDay",func:this.addDays,days:1});this.installCmd({commandName:"PrevDay",func:this.addDays,days:-1});this.installCmd({commandName:"NextMonth",func:this.addMonths,months:1});this.installCmd({commandName:"PrevMonth",func:this.addMonths,months:-1});this.installCmd({commandName:"NextYear",func:this.addMonths,months:12});this.installCmd({commandName:"PrevYear",func:this.addMonths,months:-12});this.installCmd({commandName:"Today",func:this.todayCmd,ignoreCurrent:true})}if(this.supportsTimes()){this.installCmd({commandName:"NextSeconds",func:this.addSeconds,seconds:1,roundBy:0});this.installCmd({commandName:"PrevSeconds",func:this.addSeconds,seconds:-1,roundBy:0});this.installCmd({commandName:"NextMinutes",func:this.addSeconds,seconds:60});this.installCmd({commandName:"PrevMinutes",func:this.addSeconds,seconds:-60});this.installCmd({commandName:"NextHours",func:this.addSeconds,seconds:3600});this.installCmd({commandName:"PrevHours",func:this.addSeconds,seconds:-3600});this.installCmd({commandName:"Now",func:this.nowCmd,ignoreCurrent:true})}this.installCmd({commandName:"Clear",func:this.clearCmd,ignoreCurrent:true})},addDays:function(c){var e=c.settings.days||1;var f=c.value;var b=f;if(!b){this._adjustBlank(c,e>0);c.value=this._adjustForRange(c.value);return true}if(!this.getUseUTC()){b=this.asUTCDate(b)}var d=b.valueOf()+(e*86400000);var a=new Date(d);if(!this.getUseUTC()){a=this._asLocalDate(a)}a=this._adjustForRange(a);c.value=a;return a.valueOf()!=f.valueOf()},addMonths:function(e){var f=e.settings.months||1;var i=e.value;var c=i;if(!c){this._adjustBlank(e,f>0);e.value=this._adjustForRange(e.value);return true}if(!this.getUseUTC()){c=this.asUTCDate(c)}var b=c.getUTCMonth(),h=c.getUTCFullYear(),g=c.getUTCDate(),a=null;if(f>0){b=b+f;h=h+Math.round((b/12)-0.5);b=b%12}else{b=11-b;b=b-f;h=h-Math.round((b/12)-0.5);b=11-(b%12)}do{a=this.asUTCDate(h,b,g);g--}while(a.getUTCMonth()!=b);if(!this.getUseUTC()){a=this._asLocalDate(a)}a=this._adjustForRange(a);e.value=a;return a.valueOf()!=i.valueOf()},_asLocalDate:function(a){return new Date(a.getUTCFullYear(),a.getUTCMonth(),a.getUTCDate(),a.getUTCHours(),a.getUTCMinutes(),a.getUTCSeconds())},todayCmd:function(b){var a=new Date();a=this.getUseUTC()?this.asUTCDate(a.getFullYear(),a.getMonth(),a.getDate()):new Date(a.getFullYear(),a.getMonth(),a.getDate(),0,0,0);b.value=a;return true},_adjustBlank:function(b,e){var d=this.getBlankStartsAt();var c=this.supportsDates();var f=this.supportsTimes();if(d==="Now"){if(f){this.nowCmd(b)}else{this.todayCmd(b)}}else{if((d instanceof Date)||(typeof(d)=="number")){b.value=d}else{var a=e?this.getMinValue():this.getMaxValue();if(a!=null){b.value=a}else{if(f){this.nowCmd(b)}else{this.todayCmd(b)}}}}},addSeconds:function(g){function l(r,p){var o=i.roundBy;if(o){var q=typeof(r)=="number";if(!q){r=f._dateToSeconds(r,b)}var n=Math.floor(r%o);if(n){r=r-n+(p?o:0)}if(!q){r=f._secondsToDate(r,b)}}return r}var m;var i=g.settings;if(i.roundBy===undefined){i.roundBy=60}if(i.nextMin==undefined){i.nextMin=58}var k=i.seconds||1;var d=k>0;var b=this.getUseUTC();var j=g.value;var c=j;var f=this;if(c==null){this._adjustBlank(g,d);if(i.roundBy){g.value=l(g.value,d)}g.value=this._adjustForRange(g.value);return true}if(c instanceof Date){c=this._dateToSeconds(c,b)}var h=c;if(!d&&i.nextMin&&i.roundBy&&(i.roundBy<Math.abs(k))){m=Math.floor(h%60);if(i.nextMin<m){h=h+(60-m)}}if(Math.floor(h%i.roundBy)){h=l(c,d)}else{h=l(h+k,d)}if(h<0){h=0}if(j instanceof Date){h=this._secondsToDate(h,b)}var a=this._adjustForRange(h);var e=this.compare(h,a);if(e<0){h=l(a,true)}else{if(e>0){h=l(a,false)}}g.value=h;return this.compare(j,h)!=0},nowCmd:function(b){if(b.now!=null){b.value=b.now;return true}var a=new Date();if(this._nativeTypeName=="number"){a=this._dateToSeconds(a,false)}else{if(this.getUseUTC()){a=this.asUTCDate(a)}}b.value=a;return true},_dateToSeconds:function(b,a){if(a){return b.getUTCHours()*3600+b.getUTCMinutes()*60+b.getUTCSeconds()}return b.getHours()*3600+b.getMinutes()*60+b.getSeconds()},_secondsToDate:function(e,b){if(e>=24*3600){e=24*3600-1}else{if(e<0){e=0}}var d=Math.floor(e/3600);var a=Math.floor((e%3600)/60);var c=Math.floor(e%60);e=new Date();e.setHours(d,a,c,0);if(b){e=jTAC.TypeManagers.Base.prototype.asUTCDate(e)}return e},getMinValue:function(){if(this.config.minValue==null){if(!this.supportsDates()&&this.supportsTimes()){if(this.nativeTypeName()=="number"){return 0}var a=new Date();a.setHours(0,0,0,0);if(this.getUseUTC()){a=this.asUTCDate(a)}return a}}return this.config.minValue},getMaxValue:function(){if(this.config.maxValue==null){if(!this.supportsDates()&&this.supportsTimes()){var b=23;if(this.getMaxHours&&(this.getMaxHours()!=null)){b=this.getMaxHours()}if(this.nativeTypeName()=="number"){return(b+1)*3600-1}var a=new Date();if(b>23){b=23}a.setHours(b,59,59,0);if(this.getUseUTC()){a=this.asUTCDate(a)}return a}}return this.config.maxValue}};jTAC.addMembers("TypeManagers.BaseDatesAndTimes",jTAC_Temp)}if(jTAC.isDefined("TypeManagers.BaseNumber")){jTAC_Temp={_initCmds:function(){this.installCmd({commandName:"PrevBy1",func:this.addBy,inc:-1});this.installCmd({commandName:"NextBy1",func:this.addBy,inc:1});this.installCmd({commandName:"PrevBy10",func:this.addBy,inc:-10});this.installCmd({commandName:"NextBy10",func:this.addBy,inc:10});this.installCmd({commandName:"PrevBy100",func:this.addBy,inc:-100});this.installCmd({commandName:"NextBy100",func:this.addBy,inc:100});this.installCmd({commandName:"PrevBy1000",func:this.addBy,inc:-1000});this.installCmd({commandName:"NextBy1000",func:this.addBy,inc:1000});if(this.getMaxDecimalPlaces()!=0){this.installCmd({commandName:"PrevByPt1",func:this.addBy,inc:-0.1});this.installCmd({commandName:"NextByPt1",func:this.addBy,inc:0.1});this.installCmd({commandName:"PrevByPt01",func:this.addBy,inc:-0.01});this.installCmd({commandName:"NextByPt01",func:this.addBy,inc:0.01})}this.installCmd({commandName:"Clear",func:this.clearCmd,ignoreCurrent:true})},addBy:function(b){var d=b.settings.inc||1;var f=b.value;var e=f;if(e==null){this._adjustBlank(b,d>0);b.value=this._adjustForRange(b.value);return true}if(this.numDecPlaces){var a=this.numDecPlaces(d);var c=this.numDecPlaces(e);e=this.round(e+d,0,Math.max(a,c))}else{e=e+d}e=this._adjustForRange(e);b.value=e;return e!=f},_adjustBlank:function(b,c){var a=c?this.getMinValue():this.getMaxValue();b.value=(a!=null)?a:0},getMinValue:function(){if(this.config.minValue==null){if(!this.getAllowNegatives()){return 0}}return this.config.minValue}};jTAC.addMembers("TypeManagers.BaseNumber",jTAC_Temp)};