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
      this.AM();
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

