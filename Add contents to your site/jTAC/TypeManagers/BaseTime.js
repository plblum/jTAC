// jTAC/TypeManagers/BaseTime.js
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
Class : TypeManger.BaseTime   ABSTRACT CLASS
Extends: TypeManagers.BaseDatesAndTimes

Purpose:
Base class for time-only values. Supports both javascript date objects
and numbers depending on the valueAsNumber property.

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
   timeFormat (int) - Determines how to setup the time pattern.
      It is also used to format a string.
      Its values:
      0 - Includes seconds. Uses culture's choice of 12/24 hr format.
         Ex: hh:mm:ss tt; HH:mm:ss
      1 - Omits seconds. Uses culture's choice of 12/24 hr format.
         Ex: hh:mm tt; HH:mm
      2 - Same as 0 except it omits seconds when they are 0 (while formatting a string).

      10 - Duration includes seconds. A duration is always using the 24 hour clock format.
         When using a number to hold the value, it supports hours higher than 24.
      11 - Duration omits seconds.
      12 - Same as 0 except it omits seconds when they are 0.
      100 - Culture neutral pattern: H:mm:ss
      101 - Culture neutral pattern without seconds: H:mm

   timeOneEqualsSeconds (int) - Used when the value is a number representing only time.
      Determines how many seconds is respresented by a value of 1.
      For 1 hour, use 3600. For 1 minute, use 60. For 1 second, use 1.

   valueAsNumber (boolean) - When true, it works with  number types.
      When false, it works with Date objects. It defaults to false.

   parseStrict (boolean) -
      When this is false, the parseTime() parser lets you omit or incorrectly 
      position the AM/PM designator.
      When true, it requires the AM/PM designator if its part of the time pattern,
      and it must be in the same location as that pattern.
      It defaults to false.

   parseTimeRequires (string) -
      When the time pattern has seconds,
      set this to "s" to require seconds be entered.
      When "m", minutes are required but not seconds.
      When "h", only hours are required.
      It defaults to "h".

See \jTAC\TypeManagers\Base.js for the rest.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseCulture
TypeManagers.BaseDatesAndTimes

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_BaseTime = {
   extend: "TypeManagers.BaseDatesAndTimes",
   "abstract": true,

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );
   },

   config: {
      timeFormat: 0,
      timeOneEqualsSeconds: 1,
      valueAsNumber : false,
      parseStrict: false,
      parseTimeRequires: "h"
   },

   configrules: {
      timeFormat: {
         values: [0, 1, 2, 10, 11, 12, 100, 101],
         clearCache: true
      },
      parseTimeRequires: {
         values: ["h", "m", "s"],
         clearCache: true
      }
   },


   nativeTypeName: function () {
      return this.getValueAsNumber() ? "number" : "object";
   },

   storageTypeName: function () {
      return this.getValueAsNumber() ? "float" : "time";
   },

/* 
   Returns true if the class supports dates. 
*/
   supportsDates: function() {
      return false;
   },

/* ABSTRACT METHOD
   Returns true if the class supports times. 
*/
   supportsTimes: function() {
      return true;
   },


   /*
   A duration format is always a specific pattern: HH:mm:ss (where each number can be one or two characters).
   Returns either a Date object or number, depending on valueAsNumber.
   */
   _stringToNative: function ( text ) {
      var neutral = this._parse(text);
      if (neutral == null)
         this._inputError("Cannot convert [" + text + "] to " + this.dataTypeName() + ".");

      if (this.getValueAsNumber())
         return this._fromNeutralToNumber(neutral);
      if (neutral.h > 23)
         this._inputError("Hours exceeds 23");
      return this._fromNeutralToDate(neutral);
   },

   _nativeToString: function ( value ) {
      if (value == null)
         return "";

      var neutral = (value instanceof Date) ?
         this._fromDateToNeutral(value) :
         this._fromNumberToNeutral(value);

      return this._format(neutral);
   },


/*
Parses the text, looking for a culture specific formatted time.
If an error occurs, it throws an exception. 
Returns an object with properties of "h", "m", and "s".
h = hours 0 to 9999, m = minutes 0 - 59 (not 0 to 11), s = seconds 0 to 59.
*/
   _parse: function ( text ) {
      return this._parseTime(text);
   },

/*
Formatter for the time data based on the timeFormat property
and culture specific time pattern.
   neutral (object) - The properties of this object are: "h", "m", "s".
      All must be included.
Returns the resulting formatted string.
*/
   _format: function( neutral ) {
      return this._formatTime(neutral);
   },


   /*
   Used by isValidChar to create a string of all valid characters.
   This class handles most cases for both date and time.
   */
   _valChars: function () {
      var pat = "",
      has = new Array(),  // add the names extracted from the pat so they don't get added twice
      r = "1234567890",
      tSep = this.dateTimeFormat("TimeSep"),
      exp = "(tt)|('[^']+')|(\\s)|(\\:)",
      re = new RegExp(exp, "g"), // look for containers of letters
      m, sym, atj,
      temp = this._timePattern();
      if (temp) {
         pat += temp;
         r += tSep;  // always assume short time pattern can be used
      }

   // Combines all names, which means that there will be repeated letters in the result.
   // Its lower cost to make a long string that is searched occassionally in isValidChar
   // than to search for each character found in all names to be sure no dups are added.
      while ((m = re.exec(pat)) != null) {
         sym = m[0];
         if (has.indexOf(sym) == -1) {
            atj = null;   // array to join
            var name = null;
            switch (sym)  {
               case "tt":
                  var am = this.dateTimeFormat("AM") || "";
                  var pm = this.dateTimeFormat("PM") || "";
                  atj = [am, pm];
                  break;
               case ":":   // already added
                  break;
               default: // covers space, comma, and literals
                  r += ((sym.indexOf("'") == 0) ? 
                     sym.replace("'", "") : // strip lead/trail quotes
                     sym);
                  break;
            }   // switch
            if (name) {
               atj = this.dateTimeFormat(name);
            }
            if (atj) {
               var t = atj.join("");   // eliminate the separator
               r += t.toLowerCase() + t.toUpperCase();
            }
            has.push(sym);
         }  // if has[sym]
      }  // while

      return r;
   },


   /* 
      Conversion from native value to culture neutral string. HH:mm:ss
   */
/* handled in base class
   toStringNeutral: function ( val ) {
      if (val == null)
         return "";
      if (val instanceof Date) {
         return this.callParent([val]);
      }
      else if (typeof val == "number") {
         return this._getNeutralFormatTM().toString(val);
      }
      else
         this._error("Requires a Date object");
   },
*/

/* 
   Neutral format is H:mm:ss (always 24 hour style).
*/
   _setNeutralFormat: function( sourceTM ) {
      this.setTimeFormat(100);
      this.setValueAsNumber(sourceTM.getValueAsNumber());
      this.setTimeOneEqualsSeconds(sourceTM.getTimeOneEqualsSeconds());
      this.setParseTimeRequires("s");
      this.setParseStrict(true);
   },

/*
   Returns the total seconds from the time part of the Date object.
*/
   _dateToNumber: function ( date ) {
      return this._toTimeInSeconds(date, 1);
   },

/*
Indicates if the time value represents a time of day or not (Duration).
When true, it is a time of day. This class returns true.
Durations should return false.
*/
   _isTOD: function() {
      return true;
   },


   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

   /*
   timeFormat property: SET function
   Determines how to setup the time pattern.
   It is also used to format a string.
   */
   setTimeFormat: function ( val ) {
      this._defaultSetter("timeFormat", val);
      this._clearCache();
   },

   /*
   timeOneEqualsSeconds property: SET function
   Used when the value is a number representing only time.
   Determines how many seconds is respresented by a value of 1.
   For 1 hour, use 3600. For 1 minute, use 60. For 1 second, use 1 (null also works).
   */
   setTimeOneEqualsSeconds: function ( val ) {
      this._defaultSetter("timeOneEqualsSeconds", val);
      this._clearCache();
   },

   // --- UTILITY METHODS -------------------------------------------------------
/*
   Gets the culture specific time pattern requested by the user.
   A time pattern has these characters:
      "H", "HH" - hours as is.
      "h", "hh" - hours in 12 hour format.
      "m", "mm" - minutes
      "s", "ss" - seconds
      "tt" - AM/PM designator.
      ":" - time separator
   This class uses [timeFormat] to select a pattern.
   When timeFormat is 2 or 12, it will return the long pattern.
   The caller will have to strip the ":ss" part when seconds are zero.
   Return "" if time patterns are not supported.
*/
   _timePattern: function() {
      var name;
      switch (this.getTimeFormat()) {
         case 0:
         case 2:
            name = "LongTimePattern";
            break;
         case 1:
            name = "ShortTimePattern";
            break;
         case 10:
         case 12: 
            name = "LongDurationPattern";
            break;
         case 11:
            name = "ShortDurationPattern";
            break;
         case 100:
            return "HH:mm:ss"; // culture neutral
         case 101:
            return "HH:mm"; // culture neutral
         default:
            return "";
      }  // switch
      return this.dateTimeFormat(name);
   },


/*
   Parser specific to handling time.
   It requires the user to supply hours, minutes and if part of the pattern,
   the AM/PM descriptor. Seconds are optional.
   When using parseStrict = false (the default), it will disregard 
   the time pattern, assuming it is always hours(sep)minute(sep)seconds. 
   The location of AM/PM designator is ignored too. If its missing, that's fine too.
   If hours are > 12, that is valid when there is no AM/PM designator.
   When using parseStrict = true, the time pattern must be respected,
   except for seconds.

   This method can be replaced by a custom parser by assigning
   your function to TypeManagers.BaseDatesAndTimes.prototype._parseTime.

   This function should not impose a 24 hour limit on the time,
   because this is used for both time of day and duration.
      text (string) - The text to parse. An empty string will be considered an invalid entry.

   Returns an object with properties of "h", "m", and "s".
   h = hours 0 to 9999, m = minutes 0 - 59 (not 0 to 11), s = seconds 0 to 59.
   (It lets the caller create the final Date object or number.)
   Throw exceptions for illegal values found. Can also return null
   to let the caller supply an error.
*/

   _parseTime: function ( text ) {
      if (this.getParseStrict()) {
         var re = this._strictTimePatternRE();  // there are expression groups for h, m, s, t and one more that starts with the time sep.
         var parts = re.exec(text);
         if (!parts)
            return null;   // let the caller know its just too incorrect to determine any specific issues.
      }

      var vals = [0, 0, 0],
      tSep = this.dateTimeFormat("TimeSep"),
      tod = this._isTOD(),
      isAM = false,
      isPM = false;

      // work with AM/PM designator to set isAM/PM, then strip it out
      if (tod) {
         text = text.toLowerCase(); // so we can find and strip AM PM easily
         var amDes = this.dateTimeFormat("AM") || "",
         pmDes = this.dateTimeFormat("PM") || "";
         if (amDes) {
            isAM = text.indexOf(amDes.toLowerCase()) > -1;    // doesn't compare to the time pattern. Present, missing, right or left doesn't matter.
         }
         if (pmDes) {
            isPM = text.indexOf(pmDes.toLowerCase()) > -1;    // doesn't compare to the time pattern. Present, missing, right or left doesn't matter.
         }
         var des = isPM ? pmDes : amDes;
         text = text.replace(des.toLowerCase(), "");
         text = jTAC.trimStr(text);
      }

      // at this point, there should be only digits and separators
      // if anything else is found, return null
      var re = this._cache.parseTimeRE;
      if (!re) {
      // We assume a fixed order of h:m:s here
         var etsep = jTAC.escapeRE(tSep);
         var tReq = this.getParseTimeRequires();

         var exp = "^(\\d{1,4})" + 
               "(" + etsep + "(\\d{1,2}))" + ((tReq == "h") ? "?" : "");
         if (this._timePattern().indexOf("s") > -1) {
            exp += "(" + etsep + "(\\d{1,2}))" + ((tReq != "s") ? "?" : "");
         }
         exp += "$";

         this._cache.parseTimeRE = re = new RegExp(exp);
      }
      var parts = re.exec(text);
      if (parts == null)
         return null;
      var r = {
         h: parseInt(parts[1], 10),
         m: parts[3] != null ? parseInt(parts[3], 10) : 0,
         s: parts[5] != null ? parseInt(parts[5], 10) : 0
      }

      if (tod) {
         if (isAM || isPM) {
            if (this.getParseStrict()) {
               if ((r.h > 12) || (r.h == 0))
                  this._inputError("Hours conflict with designator.");
            }
            if (r.h < 12 && isPM) {
               r.h = r.h + 12;
            }
            else if (isAM && (r.h == 12)) {
               r.h = 0;
            }
         }
         if (r.h > 23)
            this._inputError("Hours exceeds 24.");
      }
      if (r.m > 59)
         this._inputError("Minutes exceeds 59.");
      if (r.s > 59)
         this._inputError("Seconds exceeds 59.");
      return r;
   },

/*
   Used by _parseDate to provide a regular expression with 
   up to three groups, each that will contain only digits.
   The regex pattern is based on the date pattern.
*/
   _strictTimePatternRE: function() {
      var re = this._cache.strictTimeRE;
      if (!re) {
         var pat = this._timePattern();
         pat = jTAC.replaceAll(pat, "'", "");

         var tReq = this.getParseTimeRequires();
         if (tReq != "s") {
            pat = pat.replace(":ss", "(:ss)?"); // make seconds optional
            if (tReq != "m") {
               if (pat.indexOf("mm") > -1) { // make minutes optional
                  pat = pat.replace(":mm", "(:mm)?");
               }
               else {
                  pat = pat.replace(":m", "(:m)?");
               }
            }
         }

      // convert pat into a regular expression that 
      // returns up to three groups of digits.
      // It replaces h, m, s characters and separators.
         pat = pat.replace(/h{1,4}/i, "(\\d{1,4})"); 
         pat = pat.replace(/m?m/, "(\\d{1,2})");
         pat = pat.replace(/s?s/, "(\\d{1,2})");

         pat = jTAC.replaceAll(pat, ":", jTAC.escapeRE(this.dateTimeFormat("TimeSep")), true);
         pat = pat.replace(" ", "\\s?");

         if (pat.indexOf("t") > -1) {
            var amDes = this.dateTimeFormat("AM");
            var pmDes = this.dateTimeFormat("PM");
            var des = amDes ? "((?:" + jTAC.escapeRE(amDes) + ")|(?:" + jTAC.escapeRE(pmDes) + "))" : "";
            pat = pat.replace(/t?t/, des);
         }

         pat = "^" + pat + "$";
         this._cache.strictTimeRE = re = new RegExp(pat, "i");
      }
      return re;
   },

/*
   Formatter for the time based on the pattern passed in.
      neutral (object) - The properties of this object are: "h", "m", "s".
         All must be included.
         This object can be created with _fromDateToNeutral().

      pat (string) - A time pattern with these special characters.
         "H", "HH" - hours as is.
         "h", "hh" - hours in 12 hour format.
         "m", "mm" - minutes
         "s", "ss" - seconds
         "tt" - AM/PM designator.
         ":" - time separator
         If null, _timePattern() is used.
   Returns the resulting formatted string.

   This method can be replaced by a custom parser by assigning
   your function to TypeManagers.BaseDatesAndTimes.prototype._formatTime.
*/
   _formatTime: function ( neutral, pat ) {
      if (!pat) {
         pat = this._timePattern();
      }
      if (!neutral.s && (this.getTimeFormat() % 10 == 2)) { // strip seconds
         pat = pat.replace(":ss", "").replace(":s", "");
      }

      var r = pat;
      r = jTAC.replaceAll(r, ":", this.dateTimeFormat("TimeSep"), true);
      if (pat.indexOf("h") > -1) {
         var v = neutral.h % 12;
         if (v == 0) {
            v = 12;
         }
         r = this._replacePart("h", v, r);
      }
      else {
         r = this._replacePart("H", neutral.h, r);
      }

      r = this._replacePart("m", neutral.m, r);
      r = this._replacePart("s", neutral.s, r);
      r = r.replace("tt", this.dateTimeFormat(neutral.h > 11 ? "PM" : "AM"));

      return r;
   },


/*
   If valueAsNumber is true, pass the neutral value returned by _parse()
   here to convert it into a number.
      neutral (object) - An object with these properties: 
         h - hours
         m - minutes
         s - seconds
   Returns a number.
*/
   _fromNeutralToNumber: function (neutral) {
      var v = neutral.h * 3600 + neutral.m * 60 + neutral.s;
      var oes = this.getTimeOneEqualsSeconds();
      return (oes > 1) ? v / oes : v;
   },

/*
   If valueAsNumber is true, pass the number to have it converted
   into an object reflecting the time parts.
  
   Returns an object with these properties: 
      h - hours
      m - minutes
      s - seconds
*/
   _fromNumberToNeutral: function (number) {
   // convert the value to seconds
      var oes = this.getTimeOneEqualsSeconds();
      if (oes > 1) {
         number = Math.floor(number * oes);   // strip off decimal after calculation
      }
      return {y: 0, M: 1, d: 1,
         h: Math.floor(number / 3600),
         m: Math.floor((number % 3600) / 60),
         s: Math.floor(number % 60) 
         };
   },

/*
   Used when you need a number reflecting the time portion of a Date object, in seconds.
      date (Date object) - The Date object whose time value will be used.
      oneEqualsSeconds (int) - Determines how many seconds is respresented by a value of 1.
         For 1 hour, use 3600. For 1 minute, use 60. For 1 second, use 1 (null also works).
         Usually pass the timeOneEqualsSeconds property value.
   Returns the string. Respects the useUTC property.
*/
   _toTimeInSeconds: function ( date, oneEqualsSeconds ) {
      var s = this.getUseUTC() ? 
         date.getUTCHours() * 3600 + date.getUTCMinutes() * 60 + date.getUTCSeconds() :
         date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
      if (oneEqualsSeconds > 1) {
         return s / oneEqualsSeconds;
      }
      return s;
   }

}
jTAC.define("TypeManagers.BaseTime", jTAC._internal.temp._TypeManagers_BaseTime);

