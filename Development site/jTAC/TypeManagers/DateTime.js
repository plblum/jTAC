// jTAC/TypeManagers/DateTime.js
/* -----------------------------------------------------------
JavaScript Types and Conditions ("jTAC")
Copyright (C) 2012  Peter L. Blum

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
-------------------------------------------------------------
Module: TypeManager objects
Class : TypeManger.DateTime
Extends: TypeManagers.BaseDatesAndTimes

Purpose:
Class for using both date and time elements of the javascript Date object.
While this class supports time values, it does not support a value of type number,
unlike TypeManagers.TimeOfDay. It only supports values of type Date object.

This class utilitizes the TypeManagers.Date and TypeManagers.TimeOfDay classes
to do most of the work. It exposes them through the [dateOptions] and [timeOptions]
properties. The user sets properties on these objects to determine parsing
and formatting rules.
TypeManagers.DateTime knows how to redirect all key methods (toString, toValue, etc)
to both TypeManagers.

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
   dateOptions (TypeManager.Date) - 
      The TypeManagers.Date object where all date parsing and formatting is handled.
      Set its properties to customize its parsing and formatting behaviors.
      You can set this property to an object hosting the same-named properties
      as on the TypeManagers.Date object. It will copy those property values
      onto the existing TypeManagers.Date object.
      You can also set this to an instance of TypeManagers.Date.
      It creates the TypeManagers.Date object by default.

   timeOptions (TypeManager.TimeOfDay) - 
      The TypeManagers.TimeOfDay object where all time of day parsing and formatting is handled.
      Set its properties to customize its parsing and formatting behaviors.
      You can set this property to an object hosting the same-named properties
      as on the TypeManagers.TimeOfDay object. It will copy those property values
      onto the existing TypeManagers.TimeOfDay object.
      You can also set this to an instance of TypeManagers.TimeOfDay.
      It creates the TypeManagers.TimeOfDay object by default.

   timeRequired (boolean)
      Determines if only the date is supplied, is the value valid,
      where the time is 0:0:0. When true, the time is required
      and an error is reported. When false, time is considered 0:0:0.
      It defaults to true.

See \jTAC\TypeManagers\BaseDatesAndTimes.js for others.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseCulture
TypeManagers.BaseDatesAndTimes
TypeManagers.BaseDate,
TypeManagers.Date,
TypeManagers.BaseTime,
TypeManagers.TimeOfDay

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_DateTime = {
   extend: "TypeManagers.BaseDatesAndTimes",
   require: ["TypeManagers.Date", "TypeManagers.TimeOfDay"],

   config: {
      dateOptions: null, // will automatically create a TypeManagers.Date object
      timeOptions: null, // will automatically create a TypeManagers.TimeOfDay object
      timeRequired: true
   },

   dataTypeName : function () {
      return "datetime";
   },

   storageTypeName : function () {
      return "datetime";
   },

   supportsDates: function() {
      return true;
   },

   supportsTimes: function() {
      return true;
   },

/*
   Parses the text, looking for a culture specific formatted date and time.
   If an error occurs, it throws an exception. 
   Returns an object with properties of "d", "M", "y", "h", "m", "s".
   d = date 1-31, M = month 1-12 (not 0 to 11), y = year 0 to 9999.
*/
   _parse: function ( text ) {
      var date, time,
      parts = this._dateTimeSplitter(text);

      date = this.getDateOptions()._parse(parts.d);
      if (!date)
         return null;   // date is required
      time = this.getTimeOptions()._parse(parts.t);
      if (!time) {
         if (this.getTimeRequired())
            this._inputError("Time required.");
         time = {h: 0, m: 0, s: 0};
      }
      date.h = time.h;
      date.m = time.m;
      date.s = time.s;
         
      return date;
   },

/*
Used by _parse() to return two strings based on text,
the date part and the time part. Each will be passed to
date and time specific parsers by the caller.
The return value is an object with "d" and "t" properties,
each containing a string or null if not used.
*/
   _dateTimeSplitter: function( text ) {
      var df = this.getDateOptions().getDateFormat();
      if ((df < 10) || (df == 100)) {  // short date pattern lacks spaces. The two parts are separated by a space.
         var pos = text.indexOf(" ");
         if (pos == -1) {
            return {d: text, t: null};
         }
         return {d: text.substr(0, pos), t: text.substr(pos + 1) };
      }
      else {
   // always uses the time pattern, which is pretty stable, to identify the time part.
   // This limits the flexibility, as it depends on having at least one time separator
         var tm = this.getTimeOptions();
         var re = this._cache.timeFindRE;
         if (!re) {
            var tPat = tm.dateTimeFormat("LongTimePattern"); // need to determine which side of hours "tt" is on
            var tSep = jTAC.escapeRE(tm.dateTimeFormat("TimeSep"));
            var pos = tPat.indexOf("t");
            var rePat = "\\d?\\d" + tSep + "\\d?\\d(" + tSep + "\\d?\\d)?";
            if (pos > -1) {
               var am = tm.dateTimeFormat("AM") || "";
               var pm = tm.dateTimeFormat("PM") || "";
               if (am) {
                  var des = "((" + am + ")|(" + pm + "))";
                  rePat = pos < tPat.indexOf("h") ?
                     des + "\\s?" + rePat :
                     rePat + "\\s?" + des;
               }
            }
            re = this._cache.timeFindRE = new RegExp(rePat, "i");
         }
         var m = re.exec(text);
         if (!m)
            return {d: text, t: null};
         return {d: text.replace(m[0], ""), t: m[0]};
      }
   },


/*
   Formatter for the datetime data based on the formatting 
   and culture specific date pattern of [dateOptions] and [timeOptions].
      data (object) - The properties of this object are: "y", "M", "d", "h", "m", "s".
         Month is 1-12.
         All must be included.
   Returns the resulting formatted string.
*/
   _format: function( data ) {
      var dText = this.getDateOptions()._format(data);
      var tText = this.getTimeOptions()._format(data);

      if (dText) {
         if (tText) {
            return dText + " " + tText;
         }
         else
            return dText;
      }
      else
         return tText;
   },

   /* 
   Used by isValidChar to create a string of all valid characters.
   This class handles most cases for both date and time.
   */
   _valChars: function () {
      return this.getDateOptions()._valChars() + this.getTimeOptions()._valChars() + " ";
   },


/* 
   Neutral format is yyyy-MM-dd H:mm:ss (24 hour format)
*/
   _setNeutralFormat: function(sourceTM) {
      this.callParent([sourceTM]);
      this.getDateOptions()._setNeutralFormat(sourceTM.getDateOptions());
      this.getTimeOptions()._setNeutralFormat(sourceTM.getTimeOptions());
   },

/*
   If it is a Date object with the year = 1, return true.
   If it is a string with a year of 1, return true.
   If it does not use the year, it only checks for null and the empty string.
*/
   _isNull : function (val) {
      var r = this.callParent([val]);
      if (r) 
         return true;
      return this._isNullYear(val);
   },



/* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
These members are GETTER and SETTER methods associated with properties
of this class.
Not all are defined here. Any that are defined in this.config
can be setup by the autoGet and autoSet capability. If they are, they 
will not appear here.
---------------------------------------------------------------------*/

/*
   Creates the default if not assigned.
*/
   getDateOptions: function() {
      var val = this.config.dateOptions;
      if (!this.config.dateOptions) {
         val = this.config.dateOptions =  jTAC.create("TypeManagers.Date");
         this._registerChild(val);
      }
      return val;
   },

/*
Can only assign an object whose properties will be copied onto 
the same named properties of the dateOptions.
It can be an actual TypeManagers.Date object, which will be directly assigned.
*/
   setDateOptions: function (val) {
      if ((val == null) || (typeof val != "object"))
         this._error("Must pass an object whose properties match those on the dateOptions property.");
      if (val instanceof jTAC.TypeManagers.Date) {
         this._registerChild(val);
         this.config.dateOptions = val;
      }

      else {
         var parser = this.getDateOptions();
         for (var name in parser.config)
         {
            if (val[name] != undefined)
               parser.config[name] = val[name];
         }
      }
   },

/*
   Creates the default if not assigned.
*/
   getTimeOptions: function() {
      var val = this.config.timeOptions;
      if (!this.config.timeOptions) {
         val = this.config.timeOptions =  jTAC.create("TypeManagers.TimeOfDay");
         this._registerChild(val);
      }
      return val;
   },

/*
Can only assign an object whose properties will be copied onto 
the same named properties of the timeOptions.
It can be an actual TypeManagers.Time object, which will be directly assigned.
*/
   setTimeOptions: function ( val ) {
      if ((val == null) || (typeof val != "object"))
         this._error("Must pass an object whose properties match those on the timeOptions property.");
      if (val instanceof jTAC.TypeManagers.TimeOfDay) {
         this._registerChild(val);
         this.config.timeOptions = val;
      }

      else {
         var parser = this.getTimeOptions();
         for (var name in parser.config)
         {
            if (val[name] != undefined)
               parser.config[name] = val[name];
         }
      }
   },

   setCultureName: function( val ) {
      this.callParent([val]);
      this.getDateOptions().setCultureName(val);
      this.getTimeOptions().setCultureName(val);
   }



}
jTAC.define("TypeManagers.DateTime", jTAC._internal.temp._TypeManagers_DateTime);

jTAC.defineAlias("DateTime", "TypeManagers.DateTime");  
jTAC.defineAlias("DateTime.Short", "TypeManagers.DateTime");  
jTAC.defineAlias("DateTime.Short.NoSeconds", "TypeManagers.DateTime", {timeOptions: {timeFormat: 1}});  
jTAC.defineAlias("DateTime.Abbrev", "TypeManagers.DateTime", {dateOptions: {dateFormat: 10}}); 
jTAC.defineAlias("DateTime.Long", "TypeManagers.DateTime", {dateOptions: {dateFormat: 20}});
