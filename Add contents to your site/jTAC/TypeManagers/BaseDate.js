// jTAC/TypeManagers/BaseDate.js
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

