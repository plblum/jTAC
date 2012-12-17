// jTAC/TypeManagers/BaseDatesAndTimes.js
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
Additional licensing:
Portions adapted from the commercial product, Peter's Data Entry Suite v5,
a product from Peter L. Blum who is the author of jTAC.
http://www.peterblum.com/des/home.aspx
Used by permission and covered by the same license as above.
-------------------------------------------------------------
Module: TypeManager objects
Class : TypeManger.BaseDatesAndTimes   ABSTRACT CLASS
Extends: TypeManagers.BaseCulture

Purpose:
Base class for all date and time values.
Supports the javascript Date object. When working with time-only values, 
it supports number types.

Because there are many cases for date and time format entries,
the parser is replaceable. The built in parser for date handles
only the short date pattern (MM/dd/yyyy or MM/dd or MM/yyyy).
The build-in parser for time of day expects any of these patterns:
H:mm, H:mm:ss, hh:mm tt, hh:mm:ss tt.

You can load up another parser file that replaces the
TypeManagers.BaseDatesAndTimes.prototype._parse function.
jTAC includes two:
TypeManagers.PowerDateParser in \TypeManagers\PowerDateParser.js
TypeManagers.PowerTimeParser in \TypeManagers\PowerTimeParser.js

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:

   useUTC (boolean) -
      When true, the Date object is a UTC value. When false, it is a local value.
      It defaults to false.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseCulture

----------------------------------------------------------- */
if (!window.jTAC)
   throw new Error("window.jTAC not created.");

jTAC._internal.temp._TypeManagers_BaseDatesAndTimes = {
   extend: "TypeManagers.BaseCulture",
   "abstract": true,
/*
   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );
   },
*/
   config: {
      useUTC: false
   },


/*
   Expects javascript Date objects.
*/
   nativeTypeName: function () {
      return "object";
   },

/* ABSTRACT METHOD
   Returns true if the class supports dates. 
*/
   supportsDates: function() {
      this.AM();
   },

/* ABSTRACT METHOD
   Returns true if the class supports times. 
*/
   supportsTimes: function() {
      this.AM();
   },

   /*
   Uses the _parse() method.
   Returns a javascript Date object or null when text is "".
   Throws exceptions when conversion is not possible.
   */
   _stringToNative: function ( text ) {
      var neutral = this._parse( text );
      if ( neutral == null )
         this._inputError( "Cannot convert [" + text + "] to " + this.dataTypeName() + "." );

      return this._fromNeutralToDate( neutral );
   },

/* ABSTRACT METHOD
Parses the text, looking for a culture specific formatted date and/or time.
If an error occurs, it throws an exception. It can also return null to let the caller provide a generic error message.
Returns an object with these properties:
   "y": year
   "M": month, 1-12
   "d": day
   "h": hours
   "m": minutes
   "s": seconds
If date is missing, omit y, M, d and the caller will use today's date. 
If time is missing, omit h, m, s and the caller will use 0:0:0.
*/
   _parse: function ( text ) {
      this.AM();
   },

/*
   Creates a string reflecting both date and time parts
   based on the culture's date and time patterns.
      value (date object)
   Return a string. If null is passed, returns "".
*/
   _nativeToString: function ( value ) {
      if ( value == null )
         return "";
      var neutral = this._fromDateToNeutral( value );
      return this._format( neutral );
   },

/* ABSTRACT METHOD
Formatter for the date and/or time data with culture specific date pattern.
   neutral (object) - The properties of this object are: "y", "M", "d", "h", "m", "s".
      Month is 1-12. Day is 1-31.
      Can omit all date or all time elements.
      Use _fromDateToNeutral() to create this object.
Returns the resulting formatted string.
Subclasses should consider calling _formatDate() and/or _formatTime() to do most of the work.
*/
   _format: function( neutral ) {
      this.AM();
   },

/* 
   Uses the toNumber() method to convert Date objects to numbers.
   (Subclasses have different numeric values for Dates, as defined
   by overriding _dateToNumber().)
   Uses the ancestor function to compare numbers.
      val1 - the value to compare on the left side of the comparison operator.
         If it is a string, it is passed to toValue() first to get it into a native value.
      val2 - the value to compare on the right side of the comparison operator.
         If it is a string, it is passed to toValue() first to get it into a native value.
   Returns: -1 when val1 < val2; 0 when val1 = val2; 1 when val1 > val2.
   Exceptions: Throws exceptions when conversion from strings fails
   or either of the values is null.
*/
   compare: function (val1, val2) {
      if (typeof val1 == "string")
         val1 = this.toValue(val1);  // convert to native type (date or number)
      val1 = this.toNumber(val1);   // convert native type to number
      if (typeof val2 == "string")
         val2 = this.toValue(val2);
      val2 = this.toNumber(val2);

      return this.callParent([val1, val2]);
   },

/*
   While the ancestor class provides a regular expression to parse, dates may include unicode characters
   for the localized day of week and month names. Those are harder to represent in a regex ([A-Za-z]
   only handles the ascii letters). So this gathers all characters from the names that are used
   by the dateFormat's pattern into a string that also contains the date separator,
   space, and digits. It also uses timeFormat to determine if there are any "AM/PM" letters to include.
   Each character is checked against the resulting string.
*/
   isValidChar: function ( chr ) {
      if (!this.callParent([chr])) // tests for illegal parameter. 
         return false;
      var vc = this._cache.validChars;
      if (vc == null) {
         vc = this._cache.validChars = this._valChars();
      }
      return vc.indexOf(chr) > -1;
   },

   /* ABSTRACT METHOD
   Used by isValidChar to create a string of all valid characters.
   This class handles most cases for both date and time.
   */
   _valChars: function () {
      this.AM();
   },


/* 
   Neutral format is determined by subclasses.
   This class creates another TypeManager of the same class name
   and uses _setNeutralFormat() to change its properties to generate
   the neutral format. Then it uses its toValue() method to do the work.
*/
   toValueNeutral : function ( text ) {
      if (text == null)
         return null;
      try {
         this._pushContext();
         if (text instanceof Date)
            return this._reviewValue(text);

         return this._getNeutralFormatTM().toValue(text);
      }
      finally {
         this._popContext();
      }
   },


/* 
   Neutral format is determined by subclasses.
   This class creates another TypeManager of the same class name
   and uses _setNeutralFormat() to change its properties to generate
   the neutral format. Then it uses its toString() method to do the work.
*/
   toStringNeutral: function ( val ) {
      if (val == null)
         return "";
      return this._getNeutralFormatTM().toString(val);
   },


/* 
   Used by toValueNeutral() and toStringNeutral() to create a new TypeManager 
   of the same class using culture neutral patterns.
*/
   _getNeutralFormatTM: function() {
      var tm = this._internal.neutralTM;
      if (!tm) {
         tm = this._internal.neutralTM = jTAC.create(this.$fullClassName);
         tm._setNeutralFormat(this);
      }
      return tm;
   },

/* ABSTRACT METHOD
   Used by _getNeutralFormatTM to change this TypeManager's propertise
   so they use the culture neutral date and/or time patterns.
*/
   _setNeutralFormat: function( sourceTM ) {
      this.setUseUTC(sourceTM.getUseUTC());
   },


/*
   When passing a Date object, it returns a number of seconds,
   using both date and time parts of the Date object.
   When passing a number, it returns that number.
   When passing null, it returns 0.
   Otherwise it returns null.
*/
   toNumber: function ( value ) {
      if (value == null) {
         return 0;
      }
      if (value instanceof Date) {
         return this._dateToNumber(value);
      }
      else if (typeof value == "number")
         return value;
      return null;
   },

/*
Used by toNumber when the value is a Date object to convert
that date object into a number that uniquely represents the date.
This class returns the number of seconds using both date and time parts
of the Date object.
*/
   _dateToNumber: function (date) {
      return Math.floor(date.valueOf() / 1000);
   },


// --- UTILITY METHODS -------------------------------------------------------

/*
   Creates a Date object based on the data of the neutral property. 
   Generally used by the _parse() method to convert the results of parsing.
      neutral (object) - An object with these properties: 
         y - year
         M - month, 1 - 12
         d - day, 1 - 31
         h - hours
         m - minutes
         s - seconds
         Can omit y/M/d for time only and h/m/s for date only.
   Returns a Date reflecing the useUTC property rule. If date was omitted, the current date is used.
   If time was omitted, the time is 0:0:0.
*/
   _fromNeutralToDate: function( neutral ) {
      var r = new Date();  // current date + time in local time. Time will always be replaced. Date only if supplied
      if (neutral.y === undefined) {
         neutral.y = r.getFullYear();
         neutral.M = r.getMonth();
         neutral.d = r.getDate();
      }
      if (neutral.h === undefined) {
         neutral.h = neutral.m = neutral.s = 0;
      }

      if (this.getUseUTC()) {
      // Safari 1-1.2.3 has a severe bug that setUTCFullYear(y, m, d) avoids.
      // In most time zones (GMT + 0000 through GMT + 1200 through GTM - 0800)
      // It returns the wrong values. It often returns one month and one day back
      // This doesn't fix Safari but consistently returns better dates of one day back for those
      // time zones without breaking the US timezones
         r.setUTCFullYear(neutral.y, neutral.M - 1, neutral.d);
         r.setUTCHours(neutral.h, neutral.m, neutral.s, 0);
      }
      else {
         r.setFullYear(neutral.y, neutral.M - 1, neutral.d);
         r.setHours(neutral.h, neutral.m, neutral.s, 0);
      }

      return r;
   },

/*
   Creates a neutral object representing a date's values from a Date object.
   Generally used by the _format() method.
      date (object) - Date object
      content (int) - 0 or null means use both date and time parts; 1 use date; 2 use time.
   Returns an object with these properties:
      y - year
      M - month, 1 - 12
      d - day, 1 - 31
      h - hours
      m - minutes
      s - seconds
   Will omit properties based on the context.
*/
   _fromDateToNeutral: function( date, content ) {
      var r = {};
      var utc = this.getUseUTC();
      if (content != 2) {
         r.y = utc ? date.getUTCFullYear() : date.getFullYear();
         r.M = utc ? date.getUTCMonth() + 1 : date.getMonth() + 1;
         r.d = utc ? date.getUTCDate() : date.getDate();
      }
      if (content != 1) {
         r.h = utc ? date.getUTCHours() : date.getHours();
         r.m = utc ? date.getUTCMinutes() : date.getMinutes();
         r.s = utc ? date.getUTCSeconds() : date.getSeconds();
      }

      return r;
   },


/*
   Used when parsing.
   Creates an array that contains the characters from the match parameter,
   in the order they were found in the pattern. Only one instance of each character is included.
   This is used to determine the order of elements in the pattern.
      isDate (boolean) - When true, use the date pattern. When false, use the time pattern.
      match (string) - The characters to extract, such as "dMy" for dates and "Hhmst" for time.
*/
   _patternOrder: function ( isDate, match ) {
      var r = this._cache.order;
      if (!r) {
         var pat = isDate ? this._datePattern() : this._timePattern();
         r = []; // will be populated with unique characters that are valid from the match
         var inQuote = false;
         for (var i = 0; i < pat.length; i++) {
            var chr = pat.charAt(i);
            if ((match.indexOf(chr) > -1) && (r.indexOf(chr) == -1) && !inQuote) {
               r.push(chr);
            }
            else if (chr == "'") {
               inQuote = !inQuote;
            }
         }  // for
         this._cache.order = r;
      }
      return r;
   },

/*
   Utility used when formatting to replace a symbol in the date or time
   pattern with a number. It adds lead zeros when the number of digits
   of the number is less than the number of symbols.
      chr (string) - A single letter to be found in the text: "M", "d", "h", "m", "s"
      val (int) - The number to replace.
      text (string) - The text to be modified.
   Returns the modified text.
*/
   _replacePart: function( chr, val, text ) {
      var s = val.toString();
      var re = new RegExp("(" + chr + "+)");
      var m = re.exec(text);
      if (!m)
         return text;
      var zeros = m[0].length - s.length;
      if (zeros > 0)
         s = "000000".substr(0, zeros) + s;

      return text.replace(m[0], s);
   },

/*
   When formatting, some patterns have a literal between single or double quotes
   extract that literal and add it in later.
   This extracts all literals and returns both the modified pattern
   and an array of literals.
   Call _restoreLiterals() to reverse this.
   Returns an object with these properties: "pat" (the updated pattern)
   and "lit" : null or an array of strings that are the literals. This array is
   passed to _restoreLiterals().
*/
   _extractLiterals: function ( pat ) {
      var re = /(['"]([^'"]+)['"])/;
      var m, pos,
      lit = null;  // forms an array of literals
      while (m = re.exec(pat)) {
         if ((m[2].charAt(0) != "'") && (m[2].charAt(0) != '"')) {  // ignore those inside quotes. We want inner text
            if (!lit)
               lit = [];
            pos = lit.length;
            lit.push(m[2]); // save the inner content. The quotes must be abandoned 
            pat = pat.replace(m[1], "{" + pos + "}");
         }  // if
      }  // while

      return {pat: pat, lit: lit};
   },

/*
After format() updates all elements of the pattern,
it calls this with the lit array that was returned from _extractLiterals.
This returns updated text, replacing the tokens with the text of the literals.
   text (string) - Text containing tokens made by _extractLiterals
   lit (array of strings, or null)
*/
   _restoreLiterals: function ( text, lit ) {
      if (lit)
         for (var i = 0; i < lit.length; i++)
            text = text.replace("{" + i + "}", lit[i]);
      return text;
   },

/*
   Supports classes that have a Year to determine if that year is 1.
   Use it in _isNull functions to return true when the year is 1.
   If it is a Date object with the year = 1, return true.
   If it is a string with a year of 1, return true.
*/
   _isNullYear : function (val) {
      if (val instanceof Date) {
         return val.getUTCFullYear() == 1;
      }
      var intnl = this._internal;
      var nullPat = intnl.nullPat;
      if (nullPat == null) {
         nullPat = intnl.nullPat = this._format({y: 1, M: 1, d: 1, h: 0, m: 0, s: 0});
      }

      return val === nullPat;
   }


   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("TypeManagers.BaseDatesAndTimes", jTAC._internal.temp._TypeManagers_BaseDatesAndTimes);

﻿// jTAC/TypeManagers/BaseDate.js
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
Class : TypeManger.BaseDate               ABSTRACT CLASS
Extends: TypeManagers.BaseDatesAndTimes

Purpose:
Base class for date-only values. Only supports values that are javascript Date objects.

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
   dateFormat (int) - Determines how to format a string containing a date. 
      The parser will also use it.
      When using the built-in parser, it ignores this. However,
      the formatter does not. So only set it to something other than 0
      when using the formatter exclusively (such as creating text for a <span> tag).
      Its values:
      0 - Short date pattern with all digits. Ex: dd/MM/yyyy, dd/MM, and MM/yyyy
          This is the only format supported by the built-in parser.
      1 - Short date pattern with abbreviated month name. Ex: dd/MMM/yyyy
      2 - Short date pattern with abbreviated month name. Ex: dd/MMM/yyyy
            Month name is shown in uppercase only. (Its legal to parse it in lowercase.)

      10 - Abbreviated date pattern. Ex: MMM dd, yyyy

      20 - Long date pattern. Ex: MMMM dd, yyyy

      100 - Culture neutral pattern: yyyy'-'MM'-'dd

   twoDigitYear (boolean) -
      When true, two digit years are supported and converted to 4 digit years.
      When false, two digit years are an error.
      It defaults to true.

See also \jTAC\TypeManagers\BaseDatesAndTimes.js.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseCulture
TypeManagers.BaseDatesAndTimes

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_BaseDate = {
   extend: "TypeManagers.BaseDatesAndTimes",
   "abstract": true,

   config: {
      dateFormat: 0,
      twoDigitYear: true
   },

   configrules: {
      dateFormat: {
         values: [0, 1, 2, 10, 20, 100],
         clearCache: true
      }
   },

   storageTypeName : function () {
      return "date";
   },

/* 
   Returns true if the class supports dates. 
*/
   supportsDates: function() {
      return true;
   },

/* 
   Returns true if the class supports times. 
*/
   supportsTimes: function() {
      return false;
   },


/*
   Parses the text, looking for a culture specific formatted date.
   If an error occurs, it throws an exception. 
   Returns an object with properties of "d", "M", and "y".
   d = date 1-31, M = month 1-12 (not 0 to 11), y = year 0 to 9999.
*/
   _parse: function (text) {
      return this._parseDate(text);
   },

/*
   Formatter for the date data based on the dateFormat property
   and culture specific time pattern.
      neutral (object) - The properties of this object are: "y", "M", "d".
         Month is 1-12. Date is 1-31.
         All must be included.
         This object can be created with _fromDateToNeutral().

   Returns the resulting formatted string.
*/
   _format: function(neutral) {
      return this._formatDate(neutral);
   },


/*
   Used by isValidChar to create a string of all valid characters.
   This class handles most cases for both date and time.
*/
   _valChars: function () {
      var pat = "",
      has = new Array(),  // add the names extracted from the pat so they don't get added twice
      r = "1234567890",
      dSep = this.dateTimeFormat("ShortDateSep"),
      exp = "(d{3,4})|(M{3,4})|('[^']+')|(\\s)|(\\,)|(/)",
      re = new RegExp(exp, "g"), // look for containers of letters
      m, sym, atj,
      temp = this._datePattern();

      if (temp) {
         pat += temp;
         r += dSep;  // always assume short date pattern can be used
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
               case "ddd":
                  name = "DaysAbbr";
                  break;
               case "dddd":
                  name = "Days";
                  break;
               case "MMM":
                  name = "MonthsAbbr";
                  break;
               case "MMMM":
                  name = "Months";
                  break;
               case "/":   // already added
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
   Neutral format is yyyy-MM-dd.
*/
   _setNeutralFormat: function(sourceTM) {
      this.callParent([sourceTM]);
      this.setDateFormat(100);
      this.setTwoDigitYear(false);
   },

/*
   Returns a number based on the date only part of the Date object.
   Each day adds a value of 1.
*/
   _dateToNumber: function ( date ) {
      return Math.floor(date.valueOf() / 86400000);
   },

/*
   Subclass to return "y", "d", or "M". This value will
   indicate which part of the date pattern to omit.
*/
   _skipDatePart: function() {
      return "";
   },

   _timePattern: function() {
      return "";
   },

/* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
These members are GETTER and SETTER methods associated with properties
of this class.
Not all are defined here. Any that are defined in this.config
can be setup by the autoGet and autoSet capability. If they are, they 
will not appear here.
---------------------------------------------------------------------*/

/*
   dateFormat property: SET function
*/
   setDateFormat: function ( val ) {
      this._defaultSetter("dateFormat", val);
      this._clearCache();
   },

// --- UTILITY METHODS -------------------------------------------------------

/*
   Parser specific to handling dates.
   This class ignores only uses the short date pattern. It ignores the dateFormat property, if in a subclass.
   It requires the user to supply all elements of the pattern.
   However, the year can be two or four digits and lead zeroes are optional.
   The pattern string comes from the _datePattern(). Subclasses
   will override that to provide other patterns, like month/year and day/month.

   This method can be replaced by a custom parser by assigning
   your function to TypeManagers.BaseDatesAndTimes.prototype._parseDate.
      text (string) - The text to parse. An empty string will be considered an invalid entry.

   Returns an object with properties of "d", "M", and "y".
   d = date 1-31, M = month 1-12 (not 0 to 11), y = year 0 to 9999.
   (It lets the caller create the final Date object.)
   Throw exceptions for illegal values found. Can also return null
   to let the caller supply an error.
*/
   _parseDate: function ( text ) {
      var re = this._createDatePatternRE();

      var parts = re.exec(text);
      if (!parts)
         return null;   // let the caller know its just too way out to determine any specific issues.
      var r = {y: 1900, m: 0, d: 1}, // will become the result object. 1900 default for year is because assigning 0 to new Date() results in 1900 anyway
      v,
      order = this._patternOrder(true, "Mdy");
      for (i = 0; i < order.length; i++) {
         r[order[i]] = v = parseInt(parts[i + 1], 10);
         if (!isNaN(v)) {
            switch (order[i]) {
               case 'd':
                  if ((v > 31) || (v == 0)) {
                     v = NaN;
                  }
                  break;

               case 'M':
                  if ((v > 12) || (v == 0)) {
                     v = NaN;
                  }
                  break;

               case 'y':
                  if (v < 100) {
                     if (this.getTwoDigitYear()) {
                        r.y += (2000 + v) < this.dateTimeFormat("TwoDigitYearMax") ? 2000 : 1900;
                     }
                     else
                        this._inputError("Requires 4 digit year");
                  }
                  else if (v > 9999) { // if exceeds limit, error
                     v = NaN;
                  }

                  break;
            }  // switch        
         }
         
         if (isNaN(v))
            this._inputError("Invalid date part: " + order[i]);

      }  // for i
      
      // check if day was higher than last day of the month
      var v = new Date(r.y, r.M - 1, r.d, 0, 0, 0, 0),
      vy = v.getFullYear(),
      vm = v.getMonth();

      if ((vy != r.y) || (vm != (r.M - 1))) {
         this._inputError("Day exceeds month range");
      }
      return r;

   },


/*
   Used by _parseDate to provide a regular expression with 
   up to three groups, each that will contain only digits.
   The regex pattern is based on the date pattern.
*/
   _createDatePatternRE: function() {
      var re = this._cache.shortDateRE;
      if (!re) {
         var pat = this._datePattern();
         pat = jTAC.replaceAll(pat, "'", "");
      // convert pat into a regular expression that 
      // returns up to three groups of digits.
      // It replaces M, d, y characters and separators.
         pat = pat.replace(/d?d/, "(\\d{1,2})"); // replace first because the rest add "d" characters.
         pat = pat.replace(/M?M/, "(\\d{1,2})");
         pat = pat.replace(/y{2,4}/, this.getTwoDigitYear() ? "(\\d{2,4})" : "(\\d{4})");
         pat = jTAC.replaceAll(pat, "/", this.dateTimeFormat("ShortDateSep"), true);

         pat = "^" + pat + "$";
         this._cache.shortDateRE = re = new RegExp(pat);
      }
      return re;
   },

/*
   Formatter for the date based on the pattern passed in.
      neutral (object) - The properties of this object are: "y", "M", "d".
         Month is 1-12.
         All must be included.
         This object can be created with _fromDateToNeutral().
      pat (string) - A date pattern with these special characters:
         "yyyy" - 4 digit year
         "M" and "MM" - month as digits
         "d" and "dd" - day as digits.
         "MMM" - abbreviated month name
         "MMMM" - month name
         "/" - date separator
         If null, _datePattern() is used.

   Returns the resulting formatted string.

   This method can be replaced by a custom formatter by assigning
   your function to TypeManagers.BaseDatesAndTimes.prototype._formatDate.
*/
   _formatDate: function ( neutral, pat ) {
      var r = pat || this._datePattern();
      var lit = this._extractLiterals(r);
      r = lit.pat;
      r = jTAC.replaceAll(r, "/", this.dateTimeFormat("ShortDateSep"), true);
      r = this._replacePart("d", neutral.d, r);
      r = this._replacePart("yyyy", neutral.y, r);
      r = this._replacePart("yy", neutral.y, r);
/*
      r = r.replace("yyyy", neutral.y.toString());
      r = r.replace("yy", String(neutral.y % 100));
*/
      if (r.indexOf("MMMM") > -1) {
         var name = this.dateTimeFormat("Months")[neutral.M - 1];
         r = r.replace("MMMM", name);
      }
      else if (r.indexOf("MMM") > -1) {
         var name = this.dateTimeFormat("MonthsAbbr")[neutral.M - 1];
         if (this.getDateFormat() == 2)
            name = name.toUpperCase();
         r = r.replace("MMM", name);
      }
      else {
         r = this._replacePart("M", neutral.M, r);
      }
      return this._restoreLiterals(r, lit.lit);
   },

/*
   Gets the culture specific date pattern requested by the user.
   A date pattern has these special characters:
      "yyyy" - 4 digit year
      "M" and "MM" - month as digits
      "d" and "dd" - day as digits.
      "MMM" - abbreviated month name
      "MMMM" - month name
      "/" - date separator
   This class uses [dateFormat] to select a pattern.
   Subclasses for MonthYear and DayMonth types will override.
   Return "" if date patterns are not supported.
*/
   _datePattern: function() {
      var name;
      switch (this.getDateFormat()) {
         case 0:
            name = "ShortDatePattern";
            break;
         case 1:
         case 2:
            name = "ShortDatePatternMN";
            break;
         case 10:
            name = "AbbrDatePattern";
            break;
         case 20:
            name = "LongDatePattern";
            break;
         case 100:
            return "yyyy'-'MM'-'dd";   // culture neutral
         default:
            return "";
      }  // switch
      return this.dateTimeFormat(name);
   }

}
jTAC.define("TypeManagers.BaseDate", jTAC._internal.temp._TypeManagers_BaseDate);

﻿// jTAC/TypeManagers/Date.js
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
Class : TypeManger.Date
Extends: TypeManagers.BaseDate

Purpose:
For date-only values. Only supports values that are javascript Date objects.

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
See \jTAC\TypeManagers\BaseDatesAndTimes.js.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseCulture
TypeManagers.BaseDatesAndTimes

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_Date = {
   extend: "TypeManagers.BaseDate",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },
   dataTypeName : function () {
      return "date";
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
   }


   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("TypeManagers.Date", jTAC._internal.temp._TypeManagers_Date);

jTAC.defineAlias("Date", "TypeManagers.Date");  
jTAC.defineAlias("Date.Short", "TypeManagers.Date");  
jTAC.defineAlias("Date.Abbrev", "TypeManagers.Date", {dateFormat: 10}); 
jTAC.defineAlias("Date.Long", "TypeManagers.Date", {dateFormat: 20});
﻿// jTAC/TypeManagers/BaseTime.js
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
      this.callParent([sourceTM]);
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

﻿// jTAC/TypeManagers/TimeOfDay.js
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
Class : TypeManger.TimeOfDay
Extends: TypeManagers.BaseTime

Purpose:
For time-only values which represent the time of day. Supports both javascript Date objects
and numbers depending on the valueAsNumber property.
Enforces a maximum of 24 hours.

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
See \jTAC\TypeManagers\BaseDatesAndTimes.js.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseCulture
TypeManagers.BaseDatesAndTimes
TypeManagers.BaseTime
globalize.js from jquery-globalize: https://github.com/jquery/globalize

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_TimeOfDay = {
   extend: "TypeManagers.BaseTime",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   dataTypeName : function () {
      return "timeofday";
   },

   /*
   Overridden.
   Ensures hours is 0 to 23 hours.
   */
   _reviewValue : function (value) {
      value = this.callParent([value]);
      if (typeof (value) == "number") {
         var n = value;
         var oneEquals = this.getTimeOneEqualsSeconds();
         if (oneEquals > 1) {
            n = n * oneEquals;
         }
         if (Math.floor(n / 3600) >= 24)
            this._inputError("Exceeds 24 hours");
      }
      return value;
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("TypeManagers.TimeOfDay", jTAC._internal.temp._TypeManagers_TimeOfDay);

jTAC.defineAlias("TimeOfDay", "TypeManagers.TimeOfDay");
jTAC.defineAlias("TimeOfDay.NoSeconds", "TypeManagers.TimeOfDay", {timeFormat: 1});
jTAC.defineAlias("TimeOfDay.NoZeroSeconds", "TypeManagers.TimeOfDay", {timeFormat: 2});

jTAC.defineAlias("TimeOfDay.InSeconds", "TypeManagers.TimeOfDay", {valueAsNumber: true}); 
jTAC.defineAlias("TimeOfDay.InHours", "TypeManagers.TimeOfDay", {valueAsNumber: true, timeOneEqualsSeconds: 3600}); 
jTAC.defineAlias("TimeOfDay.InSeconds.NoSeconds", "TypeManagers.TimeOfDay", {valueAsNumber: true, timeFormat: 1}); 
jTAC.defineAlias("TimeOfDay.InHours.NoSeconds", "TypeManagers.TimeOfDay", {valueAsNumber: true, timeOneEqualsSeconds: 3600, timeFormat: 1}); 
jTAC.defineAlias("TimeOfDay.InSeconds.NoZeroSeconds", "TypeManagers.TimeOfDay", {valueAsNumber: true, timeFormat: 2}); 
jTAC.defineAlias("TimeOfDay.InHours.NoZeroSeconds", "TypeManagers.TimeOfDay", {valueAsNumber: true, timeOneEqualsSeconds: 3600, timeFormat: 2}); 
﻿// jTAC/TypeManagers/DateTime.js
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
﻿// jTAC/TypeManagers/Duration.js
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
Class : TypeManger.Duration
Extends: TypeManagers.BaseTime

Purpose:
For time-only values which represent the time of day. Supports both javascript Date objects
and numbers depending on the valueAsNumber property.

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
   maxHours (int) - The upper limit for number of hours allowed. Defaults to 9999.
See also \jTAC\TypeManagers\BaseDatesAndTimes.js 

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseCulture
TypeManagers.BaseDatesAndTimes
TypeManagers.BaseTime

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_Duration = {
   extend: "TypeManagers.BaseTime",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      timeFormat: 10, // override the default
      maxHours: 9999
   },

   configrules: {
      timeFormat: [10, 11, 12, 100, 101]
   },

   dataTypeName: function () {
      return "duration";
   },

   /*
   Overridden.
   Ensures hours conforms to maxHours.
   */
   _reviewValue: function (value) {
      if (value instanceof Date) {
         if (value.getHours() > this.getMaxHours())
            this._inputError("Exceeded the max hours limit.");
      }
      else if (typeof (value) == "number") {
         var n = value;
         var oneEquals = this.getTimeOneEqualsSeconds();
         if (oneEquals > 1) {
            n = n * oneEquals;
         }

         if (Math.floor(n / 3600) > this.getMaxHours())
            this._inputError("Exceeded the max hours limit.");
      }
      else if (value != null)
         this._error("Value's type is not supported");
      return value;
   },

   _isTOD: function() {
      return false;
   },

/*
   Culture neutral formats for duration use 4 digit hours
   because one goal of this format is to provide sortable strings.
*/
   _timePattern: function() {
      switch (this.getTimeFormat()) {
         case 100:
            return "HHHH:mm:ss"; // culture neutral
         case 101:
            return "HHHH:mm"; // culture neutral
         default:
            return this.callParent();
      }  // switch
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("TypeManagers.Duration", jTAC._internal.temp._TypeManagers_Duration);

jTAC.defineAlias("Duration", "TypeManagers.Duration");
jTAC.defineAlias("Duration.NoSeconds", "TypeManagers.Duration", {timeFormat: 11});
jTAC.defineAlias("Duration.NoZeroSeconds", "TypeManagers.Duration", {timeFormat: 12});

jTAC.defineAlias("Duration.InSeconds", "TypeManagers.Duration", {valueAsNumber: true}); 
jTAC.defineAlias("Duration.InHours", "TypeManagers.Duration", {valueAsNumber: true, timeOneEqualsSeconds: 3600}); 
jTAC.defineAlias("Duration.InSeconds.NoSeconds", "TypeManagers.Duration", {valueAsNumber: true, timeFormat: 11}); 
jTAC.defineAlias("Duration.InHours.NoSeconds", "TypeManagers.Duration", {valueAsNumber: true, timeOneEqualsSeconds: 3600, timeFormat: 11}); 
jTAC.defineAlias("Duration.InSeconds.NoZeroSeconds", "TypeManagers.Duration", {valueAsNumber: true, timeFormat: 12}); 
jTAC.defineAlias("Duration.InHours.NoZeroSeconds", "TypeManagers.Duration", {valueAsNumber: true, timeOneEqualsSeconds: 3600, timeFormat: 12}); 


﻿// jTAC/TypeManagers/MonthYear.js
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
Class : TypeManger.MonthYear
Extends: TypeManagers.BaseDate

Purpose:
For date-only values where just the month and year are used. 
Only supports values that are javascript Date objects.
String patterns should only include the "M" and "y" symbols.
jquery-Globalize's culture.calendar.patterns provides the localized format
in its "Y" property.

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
See \jTAC\TypeManagers\BaseDatesAndTimes.js.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseCulture
TypeManagers.BaseDatesAndTimes
TypeManagers.BaseDate
----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_MonthYear = {
   extend: "TypeManagers.BaseDate",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   dataTypeName : function () {
      return "monthyear";
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



/*
   Returns the number of months since year 0.
*/
   _dateToNumber : function (date) {
      return this.getUseUTC() ?
         date.getUTCFullYear() * 12 + date.getUTCMonth() :
         date.getFullYear() * 12 + date.getMonth();
   },


   _datePattern: function() {
      var name;
      switch (this.getDateFormat()) {
         case 0:
            name = "ShortMonthYearPattern";
            break;
         case 1:
         case 2:
            name = "ShortMonthYearPatternMN";
            break;
         case 10:
            name = "AbbrMonthYearPattern";
            break;
         case 20:
            name = "LongMonthYearPattern";
            break;
         case 100:
            return "yyyy-MM";
         default:
            return "";
      }  // switch
      return this.dateTimeFormat(name);
   },

   _skipDatePart: function() {
      return "d";
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/


}
jTAC.define("TypeManagers.MonthYear", jTAC._internal.temp._TypeManagers_MonthYear);

jTAC.defineAlias("MonthYear", "TypeManagers.MonthYear");  
jTAC.defineAlias("MonthYear.Short", "TypeManagers.MonthYear");  
jTAC.defineAlias("MonthYear.Abbrev", "TypeManagers.MonthYear", {dateFormat: 10}); 
jTAC.defineAlias("MonthYear.Long", "TypeManagers.MonthYear", {dateFormat: 20});
﻿// jTAC/TypeManagers/DayMonth.js
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
Class : TypeManger.DayMonth
Extends: TypeManagers.BaseDate

Purpose:
For date-only values where just the day and month are used, such
as a birthday or anniversary.
Only supports values that are javascript date objects.
String patterns should only include the "M" and "d" symbols.
jquery-Globalize's culture.calendar.patterns provides the localized format
in its "M" property.

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
See \jTAC\TypeManagers\BaseDatesAndTimes.js.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseCulture
TypeManagers.BaseDatesAndTimes
TypeManagers.BaseDate

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_DayMonth = {
   extend: "TypeManagers.BaseDate",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
   },

   configrules: {
   },

   dataTypeName : function () {
      return "daymonth";
   },

/*
   Returns the number of days into the year 2012 (which was chosen because its a leap year).
*/
   _dateToNumber : function (date) {
      var date = this.getUseUTC() ? // create a local date using the year 2012
         new Date(2012, date.getUTCMonth(), date.getUTCDate()) :
         new Date(2012, date.getMonth(), date.getDate());
      return this.callParent([date]);
   },


   _datePattern: function() {
      var name;
      switch (this.getDateFormat()) {
         case 0:
            name = "ShortMonthDayPattern";
            break;
         case 1:
         case 2:
            name = "ShortMonthDayPatternMN";
            break;
         case 10:
            name = "AbbrMonthDayPattern";
            break;
         case 20:
            name = "LongMonthDayPattern";
            break;
         case 100:
            return "MM-dd";
         default:
            return "";
      }  // switch
      return this.dateTimeFormat(name);
   },

   _skipDatePart: function() {
      return "y";
   }


   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/


}
jTAC.define("TypeManagers.DayMonth", jTAC._internal.temp._TypeManagers_DayMonth);

jTAC.defineAlias("DayMonth", "TypeManagers.DayMonth");  
jTAC.defineAlias("DayMonth.Short", "TypeManagers.DayMonth");  
jTAC.defineAlias("DayMonth.Abbrev", "TypeManagers.DayMonth", {dateFormat: 10}); 
jTAC.defineAlias("DayMonth.Long", "TypeManagers.DayMonth", {dateFormat: 20});
