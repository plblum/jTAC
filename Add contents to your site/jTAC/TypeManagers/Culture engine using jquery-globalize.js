// jTAC/TypeManagers/Culture engine using jquery-globalize.js
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

Companion to the TypeManagers.BaseCulture class that customizes
it to work with jquery-globalize.
It replaces the cultureInfo() function in that class's prototype.

Always load this file AFTER TypeManagers.BaseCulture.

Required libraries:
jquery-globalize: https://github.com/jquery/globalize
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
ALWAYS LOAD \jTAC\TypeManagers\BaseCulture.js BEFORE THIS FILE IS LOADED
----------------------------------------------------------- */

jTAC.require("TypeManagers.BaseCulture");


/* 
Converts rule names describing number formatting (not currency or percnet) into values specific for the culture.
This method is normally replaced in jTAC.Typemanagers.BaseCulture.prototype.numberFormat
with the actual function, by loading the appropriate culture engine script file:
Culture engine for jquery-globalize.js, Culture engine manual.js, or 
one that you create.
Here are the rule names (case sensitive) and the values they return:
   NegPattern - string: negative number pattern: use "(n)|-n|- n|n-|n -", where n is replaced by the number
   Decimals - integer: number of decimal places normally shown
   GroupSep - string: string that separates number groups, as in 1,000,000
   DecimalSep  - string: string that separates a number from the fractional portion, as in 1.99
   GroupSizes  - array: array of numbers indicating the size of each number group.
   NegSymbol- string: symbol used for negative numbers

*/
jTAC.TypeManagers.BaseCulture.prototype.numberFormat = function( rule ) {
   return this._toNF(this._culture().numberFormat, rule);
}

/* 
Converts rule names describing currency formatting into values specific for the culture.
This method is normally replaced in jTAC.Typemanagers.BaseCulture.prototype.currencyFormat
with the actual function, by loading the appropriate culture engine script file:
Culture engine for jquery-globalize.js, Culture engine manual.js, or 
one that you create.
Here are the rule names (case sensitive) and the values they return:
   NegPattern  - string: negative pattern for currency, including symbol represented by $
   PosPattern  - string: positive pattern for currency, including symbol represented by $
   Symbol- string: symbol used to represent a currency
   Decimals - integer: number of decimal places normally shown in a currency
   GroupSep - string: string that separates number groups in a currency, as in 1,000,000
   DecimalSep  - string: string that separates a number from the fractional portion, as in 1.99 in a currency
   GroupSizes  - array: array of numbers indicating the size of each number group in a currency
   NegSymbol- string: symbol used for negative numbers in a currency
*/
jTAC.TypeManagers.BaseCulture.prototype.currencyFormat = function( rule ) {
   var r = this._toNF(this._culture().numberFormat.currency, rule);
   if (r === undefined) {  // fallback
      r = this._toNF(this._culture().numberFormat, rule);
   }
   return r;
}


/* 
Converts rule names describing percentage formatting into values specific for the culture.
This method is normally replaced in jTAC.Typemanagers.BaseCulture.prototype.percentFormat
with the actual function, by loading the appropriate culture engine script file:
Culture engine for jquery-globalize.js, Culture engine manual.js, or 
one that you create.
Here are the rule names (case sensitive) and the values they return:
   NegPattern  - string: negative pattern for percentage, including symbol represented by %
   PosPattern  - string: positive pattern for percentage, including symbol represented by %
   Symbol - string: symbol used to represent a percentage
   Decimals - integer: number of decimal places normally shown in a percentage
   GroupSep - string: string that separates number groups in a percentage, as in 1,000,000
   DecimalSep  - string: string that separates a number from the fractional portion, as in 1.99 in a percentage
   GroupSizes  - array: array of numbers indicating the size of each number group in a percentage
   NegSymbol- string: symbol used for negative numbers in a percentage

*/
jTAC.TypeManagers.BaseCulture.prototype.percentFormat = function( rule ) {
   return this._toNF(this._culture().numberFormat.percent, rule);
}


/* 
Support method.
Numbers, Currency, and Percent all use a common object structure for their data.
numberFormat(), currencyFormat() and percentFormat() all pass their object
and the rule name here. Rule names are consistent between these types.
*/
jTAC.TypeManagers.BaseCulture.prototype._toNF = function( owner, rule ) {
   switch (rule) {
      case "NegPattern":  // string: negative pattern: n is replaced by the number
         return owner.pattern instanceof Array ? owner.pattern[0] : "-n";
      case "PosPattern":   // string: positive pattern, n is replaced by the number
         return owner.pattern instanceof Array ? owner.pattern[1] : "n";
      case "Decimals":  // integer: number of decimal places normally shown
         return owner.decimals;
      case "GroupSep":  // string: string that separates number groups, as in 1,000,000
         return owner[","];
      case "DecimalSep":   // string: string that separates a number from the fractional portion, as in 1.99
         return owner["."];
      case "GroupSizes":   // array: array of numbers indicating the size of each number group.
         return owner.groupSizes;
      case "NegSymbol": // string: symbol used for negative numbers
         return owner["-"];
      case "Symbol": // string: symbol used to represent a currency or percent
         return owner.symbol || "";
   }
}



/* 
Converts rule names describing dates and times into values specific for the culture.
This method is normally replaced in jTAC.Typemanagers.BaseCulture.prototype.dateTimeFormat
with the actual function, by loading the appropriate culture engine script file:
Culture engine for jquery-globalize.js, Culture engine manual.js, or 
one that you create.
Here are the rule names (case sensitive) and the values they return:
   ShortDateSep- string: separator of parts of a date (e.g. "/" in 11/05/1955)
   TimeSep  - string: separator of parts of a time (e.g. ":" in 05:44 PM)
   FirstDay - integer: the first day of the week (0 = Sunday, 1 = Monday, etc)
   Days - array of 7 strings. Full names for days of the week
   DaysAbbr - array of 7 strings. Abbreviated names for days of the week
   Months - array of 13 strings. Full month names (13 months for lunar calendards -- 13th month should be "" if not lunar)
   MonthsAbbr - array of 13 strings. Abbreviated month names (13 months for lunar calendards -- 13th month should be "" if not lunar)
   AM - string: AM Designator. Null when not used
   PM - string: PM Designator. Null when not used
   TwoDigitYearMax   - integer: When a two digit year is given, it will never be parsed as a four digit
			                              - year greater than this year (in the appropriate era for the culture)
   ShortDatePattern  - string: short date pattern. Valid chars: "M", "d", "y" and "/" for separator
   ShortDatePatternMN  - string: short date pattern with the month replaced by MMM (abbr month). Valid chars: "M", "d", "y" and "/" for separator
   AbbrDatePattern   - string: abbr date pattern, similar to long, with abbreviated month name: "MMM" for abbr month name. Does not include week day
   LongDatePattern   - string: long date pattern. "MMMM" for month name. Does not include week day
   ShortTimePattern  - string: time pattern without seconds: "H", "m", "tt"
   LongTimePattern   - string: time pattern with seconds: "H", "m", "s", "tt"
   ShortDurationPattern - duration pattern without seconds: "H", "m"
   LongDurationPattern - duration pattern with seconds: "H", "m", "s"
   ShortDateShortTimePattern  - string: short date pattern + short time pattern
   ShortDateLongTimePattern  - string: short date pattern + long time pattern
   AbbrDateShortTimePattern  - string: abbr date pattern + short time pattern
   AbbrDateLongTimePattern   - string: abbr date pattern + long time pattern
   LongDateShortTimePattern  - string: long date pattern + short time pattern
   LongDateLongTimePattern   - string: long date pattern + long time pattern
   ShortMonthDayPattern      - string: month day pattern with only digits
   ShortMonthDayPatternMN      - string: month day pattern based in ShortDatePatternMN
   AbbrMonthDayPattern      - string: month day pattern with abbreviated month name
   LongMonthDayPattern      - string: month day pattern
   ShortMonthYearPattern      - string: month year pattern with only digits
   ShortMonthYearPatternMN      - string: month year pattern based in ShortDatePatternMN
   AbbrMonthYearPattern     - string: month year pattern with abbreviated month name
   LongMonthYearPattern     - string: month year pattern

*/
jTAC.TypeManagers.BaseCulture.prototype.dateTimeFormat = function( rule ) {
   function stripPart(text, symbol) {
      var svRules = this._cache.svRules;
      if (!svRules) {
         svRules = this._cache.svRules = {};
      }
      if (svRules[rule] === undefined) {
         var dSep = df["/"];
         text = jTAC.replaceAll(text, symbol, "").replace(dSep + dSep, dSep);
         dSep = jTAC.escapeRE(dSep);
         var re = new RegExp("^" + dSep + "|" + dSep + "$", "g");  // look for leading and trailing seps
         svRules[rule] = text.replace( re, "" );  // trim
      }
      return svRules[rule];
   }

   var df = this._culture().calendars.standard;
   // CREDIT: Comments are borrowed from jquery-validate's Globalize.cultures[default] object.
   switch (rule) {
      case "ShortDateSep": // string: separator of parts of a date (e.g. "/" in 11/05/1955)
         return df["/"];
      case "TimeSep":   // string: separator of parts of a time (e.g. ":" in 05:44 PM)
         return df[":"];
      case "FirstDay":  // integer: the first day of the week (0 = Sunday, 1 = Monday, etc)
         return df.firstDay;
      case "Days":      // array of 7 strings. Full names for days of the week
         return df.days.names;
      case "DaysAbbr":  // array of 7 strings. Abbreviated names for days of the week
         return df.days.namesAbbr;
      case "DaysShort":  // array of 7 strings. Short names for days of the week
         return df.days.namesShort;
      case "Months":    // array of 13 strings. Full month names (13 months for lunar calendards -- 13th month should be "" if not lunar)
         return df.months.names;
      case "MonthsAbbr":// array of 13 strings. Abbreviated month names (13 months for lunar calendards -- 13th month should be "" if not lunar)
         return df.months.namesAbbr;
      case "AM":  // string: AM Designator. Null when not used
         return df.AM ? df.AM[0] : "";
      case "PM":  // string: PM Designator. Null when not used
         return df.PM ? df.PM[0] : "";
      case "TwoDigitYearMax":    // when a two digit year is given, it will never be parsed as a four digit year greater than this year (in the appropriate era for the culture)
         return df.twoDigitYearMax;
      case "ShortDatePattern":   // short date pattern. Valid chars: "M", "d", "y" and "/" for separator
         return df.patterns.d;
      case "ShortDatePatternMN": // string: short date pattern with the month replaced by MMM (abbr month). Valid chars: "M", "d", "y" and "/" for separator
         return this._createPattern(1, null);
      case "AbbrDatePattern":    // abbr date pattern, similar to long, with abbreviated month name: "MMM" for abbr month name. Does not include week day
         return this._createPattern(10, null);
      case "LongDatePattern":    // long date pattern. "MMMM" for month name. Does not include week day
         return this._createPattern(20, null);
      case "ShortTimePattern":   // time pattern without seconds: "H", "m", "tt"
         return this._createPattern(null, 0);
      case "LongTimePattern":    // time pattern with seconds: "H", "m", "s", "tt"
         return this._createPattern(null, 1);
      case "ShortDurationPattern":   // duration pattern without seconds: "H", "m"
         return this._createPattern(null, 10);
      case "LongDurationPattern":    // duration pattern with seconds: "H", "m", "s"
         return this._createPattern(null, 11);
      case "ShortDateShortTimePattern":   // short date pattern + short time pattern
         return this._createPattern(0, 0);
      case "ShortDateLongTimePattern":   // short date pattern + long time pattern
         return this._createPattern(0, 1);
      case "AbbrDateShortTimePattern":   // abbr date pattern + short time pattern
         return this._createPattern(10, 0);
      case "AbbrDateLongTimePattern":   // abbr date pattern + long time pattern
         return this._createPattern(10, 1);
      case "LongDateShortTimePattern":   // long date pattern + short time pattern
         return this._createPattern(20, 0);
      case "LongDateLongTimePattern":   // long date pattern + long time pattern
         return this._createPattern(20, 1);
      case "ShortMonthDayPattern":      // string: month day pattern with only digits
         return stripPart.call(this, df.patterns.d, "y");
      case "ShortMonthDayPatternMN":      // string: month day pattern with only digits
         return stripPart.call(this, this.dateTimeFormat("ShortDatePatternMN"), "y");
      case "AbbrMonthDayPattern":       // month day pattern with abbreviated month name
         return (df.patterns.M || "").replace("MMMM", "MMM");
      case "LongMonthDayPattern":      // month day pattern with long month
         return df.patterns.M;
      case "ShortMonthYearPattern":      // string: month year pattern with only digits
         return stripPart.call(this, df.patterns.d, "d");
      case "ShortMonthYearPatternMN":      // string: month year pattern with only digits
         return stripPart.call(this, this.dateTimeFormat("ShortDatePatternMN"), "d");
      case "AbbrMonthYearPattern":      // month year pattern with abbreviated month name
         return (df.patterns.Y || "").replace("MMMM", "MMM");
      case "LongMonthYearPattern":      // month year pattern with long month
         return df.patterns.Y;
   }  // switch

}

/*
Support method to return the culture object.
*/
jTAC.TypeManagers.BaseCulture.prototype._culture = function() {
   var c = this._cache.svCulture;
   if (!c) {
      if (!window.Globalize) {
         this._error("Include jquery-globalize scripts. (https://github.com/jquery/globalize).");
      }
      else {
         var cn = this.getCultureName() || Globalize.cultures["default"].name;
         c = Globalize.culture(cn); // if getCultureName() returns null, Globalize uses the current culture.
         if (!c)
            this._error("Requires the script file for the culture named [" + this.getCultureName() + "].");
      }
      this._cache.svCulture = c;
   }
   return c;
}


/*
Returns a string reflecting a localized date + time pattern based on the rules.
   dateFormat (int) - 0 = short, 1 = short with abbrev month, 10 = abbrev, 20 = long, null = not used
   timeFormat (int) - 0 = short (no seconds), 1 = long (with seconds), 10 = 24 hour short, 11 = 24 hour long, null = not used
*/
jTAC.TypeManagers.BaseCulture.prototype._createPattern = function( dateFormat, timeFormat ) {
   var hasDF = dateFormat != null;
   var hasTF = timeFormat != null;
   if (!hasDF && !hasTF)
      return "";

   var dtfi = this._culture().calendars.standard;
   var pat = this._getCulturePtn(dateFormat, timeFormat, dtfi);

   // clean up the pattern. Issues:
   // convert long month and day of week to abbreviated format if needed.
   // remove the day of week if needed.
   // remove the "tt" on a duration
   // short date format month switch to MMM if needed

   if (hasDF && (dateFormat == 10)) { // long to abbreviated month
      pat = pat.replace("MMMM", "MMM");
   }
   if (dateFormat >= 10) {   // remove day of week
      // pat has one of these patterns:
      // dddd[separators][day month year]
      // [day month year][separators]dddd
      // NOTE: most cultures use space for separators. See am-ET for: "dddd '፣' MMMM d 'ቀን' yyyy"
      var beforeRE = /dddd[^A-Za-z]{1,}/;
      var afterRE = /[^A-Z]{1,}dddd/;
      // since there is only one dddd, replace both versions. Only one (or none) will be applied.
      pat = pat.replace(beforeRE, "");
      pat = pat.replace(afterRE, "");
   }

   if (dateFormat == 1) {  // short month to abbrv month
      if (pat.indexOf("MM") > -1)
         pat = pat.replace("MM", "MMM");
      else
         pat = pat.replace("M", "MMM");
   }


   if (timeFormat >= 10) { // duration (always 24 hour time). Remove "tt" and either lead or trailing space
      // since there is only one tt, replace both versions. Only one (or none) will be applied.
      pat = pat.replace("tt ", "");
      pat = pat.replace(" tt", "");
   }

   // a pattern of 1 character is not legal as globalize.jquery identifies a single character
   // as a way to look up an entry in dtfi.patterns[character].
   // So ensure there are at least two characters. Cases are: M and d.
   if (pat.length == 1)
      pat += pat; // repeats the character

   return pat;
}

/* STATIC METHOD
Retrieves a string from the culture.calendars.standard.patterns properties that reflects
a date (with year) and/or time. Does not support Day/Month, Month/Year, or Duration patterns.
   dateFormat (int) - 0 = short, 1 = short with abbrev month, 10 = abbrev, 20 = long, null = not used
   timeFormat (int) - 0 = short (no seconds), 1 = long (with seconds), 10 = 24 hour short, 11 = 24 hour long, null = not used
   dtfi (culture.calendars.standard) - Required
Can be accessed as a static method by using jTAC.TypeManagers.BaseCulture.prototype._getCulturePtn(parms)
*/
jTAC.TypeManagers.BaseCulture.prototype._getCulturePtn = function ( dateFormat, timeFormat, dtfi ) {

   // when using both date and time, there are predefined patterns. But they do not cover all cases (durations, short dates).
   // Use them for cases they cover and create alternatives for cases they don't.
   if ((dateFormat != null) && (timeFormat != null) && (dateFormat >= 10) && (timeFormat < 10)) {
      return timeFormat != 1 ? dtfi.patterns.F : dtfi.patterns.f;
   }

   // select a pattern for short or long from dtfi based on dateformat.
   // dtfi does not have a pattern reflecting abbreviated. Its value is derived from the long pattern.
   var pat = "";
   var ptns = dtfi.patterns;

   if (dateFormat != null) {
      pat = (dateFormat < 10) ? ptns.d : ptns.D;
   }

   if (timeFormat != null) {
      if (pat.length > 0)
         pat += " ";
      switch (timeFormat) {
         case 0:
            pat += ptns.t;
            break;
         case 1:
            pat += ptns.T;
            break;
         case 10:
         case 11:
            // construct a 24 hour format for durations, not directly using the time pattern, but it assists in getting lead zero formats.
            var lz = (ptns.T.indexOf("HH") > -1) || (ptns.T.indexOf("hh") > -1); //lead zero
            pat += lz ? "HH" : "H";
            pat += dtfi[":"];
            lz = ptns.T.indexOf("mm") > -1; //lead zero
            pat += lz ? "mm" : "m";
            if (timeFormat == 11) {
               pat += dtfi[":"];
               lz = ptns.T.indexOf("ss") > -1; //lead zero
               pat += lz ? "ss" : "s";
            }
            break;
         case 100:
            pat += "HH:mm:ss";  // culture neutral and sortable
            break;

      }  // switch
   }  // if hasTF
   return pat;
}





