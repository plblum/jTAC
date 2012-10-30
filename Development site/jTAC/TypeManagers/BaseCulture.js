// jTAC/TypeManagers/BaseCulture.js
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
Class : TypeManger.BaseCulture  ABSTRACT CLASS
Extends: TypeManagers.Base

Purpose:
TypeManagers.BaseCulture is an abstract base class for developing TypeManagers
that require culture specific formatting and parsing rules.

Its default configuration uses the global object jTAC.cultureInfo
to define each culture specific setting. See that class below.
You can change that class's properties to reflect another culture:
jTAC.cultureInfo.dtShortDatePattern = "MM/dd/yyyy";
You can also create an alias to describe another culture.
jTAC.defineAlias("Culture.fr-FR", { dtShortDatePattern: "dd/MM/yyyy" });
jTAC.cultureInfo = jTAC.create("Culture.fr-FR");

If you want to use jquery-globalize (https://github.com/jquery/globalize)
to supply culture info, add the 
\TypeManagers\Culture engine for jquery-globalize.js
after loading the BaseCulture.js file.
https://github.com/jquery/globalize.

You can provide other "culture engines". 
Just replace these jTAC.TypeManagers.BaseCulture.prototype
functions: numberFormat(), currencyFormat(), percentFormat(),
and dateTimeFormat(). See how \TypeManagers\Culture engine for jquery-globalize.js
does it.

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced in this class:
  cultureName (string) - 
      The globalization name for the culture used by jquery-globalize
      or whatever culture system you have in place.
      For example, "en-US", "fr-CA".
      If null, use a default culture.

Methods introduced in this class:
  numberFormat(rule) - 
      Converts rule names describing number formatting (not currency or percent) 
      into values specific for the culture.
  currencyFormat(rule) - 
      Converts rule names describing currency formatting 
      into values specific for the culture.
  percentFormat(rule) - 
      Converts rule names describing percent formatting 
      into values specific for the culture.
  dateTimeFormat(rule) - 
      Converts rule names describing date and time formatting 
      into values specific for the culture.

Required libraries:
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED

Does not require jquery-globalize until you add
\jTAC\TypeManagers\Culture engine for jquery-globalize.js.

------------------------------------------------------------*/

jTAC._internal.temp._TypeManagers_BaseCulture = {
   extend: "TypeManagers.Base",
   "abstract": true,

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },
   config: {
      cultureName: ""
   },
   configrule: {
      cultureName: {
         valFnc: jTAC.checkAsStrOrNull,
         clearCache: true
      }
   },


/* 
Converts rule names describing number formatting (not currency or percnet) into values specific for the culture.
By default, this method uses jTAC.cultureInfo for its data.
You can switch "culture engines" by replacing this methods's prototype.
Here are the rule names (case sensitive) and the values they return:
   NegPattern - string: negative number pattern: use "(n)|-n|- n|n-|n -", where n is replaced by the number
   Decimals - integer: number of decimal places normally shown
   GroupSep - string: string that separates number groups, as in 1,000,000
   DecimalSep  - string: string that separates a number from the fractional portion, as in 1.99
   GroupSizes  - array: array of numbers indicating the size of each number group.
   NegSymbol- string: symbol used for negative numbers

*/
   numberFormat: function(rule) {
      return jTAC.cultureInfo["num" + rule];
   },

/* 
Converts rule names describing currency formatting into values specific for the culture.
By default, this method uses jTAC.cultureInfo for its data.
You can switch "culture engines" by replacing this methods's prototype.
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
   currencyFormat: function(rule) {
      return jTAC.cultureInfo["cur" + rule];

   },

/*
Converts rule names describing percentage formatting into values specific for the culture.
By default, this method uses jTAC.cultureInfo for its data.
You can switch "culture engines" by replacing this methods's prototype.
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
   percentFormat: function(rule) {
      return jTAC.cultureInfo["pct" + rule];
   },



/* 
Converts rule names describing dates and times into values specific for the culture.
By default, this method uses jTAC.cultureInfo for its data.
You can switch "culture engines" by replacing this methods's prototype.
Here are the rule names (case sensitive) and the values they return:
   ShortDateSep- string: separator of parts of a date (e.g. "/" in 11/05/1955)
   TimeSep  - string: separator of parts of a time (e.g. ":" in 05:44 PM)
   FirstDay - integer: the first day of the week (0 = Sunday, 1 = Monday, etc)
   Days - array of 7 strings. Full names for days of the week
   DaysAbbr - array of 7 strings. Abbreviated names for days of the week
   DaysShort - array of 7 strings. Short names for days of the week
   Months - array of 13 strings. Full month names (13 months for lunar calendards -- 13th month should be "" if not lunar)
   MonthsAbbr - array of 13 strings. Abbreviated month names (13 months for lunar calendards -- 13th month should be "" if not lunar)
   AM - string: AM Designator. Null when not used
   PM - string: PM Designator. Null when not used
   TwoDigitYearMax   - integer: When a two digit year is given, it will never be parsed as a four digit
			                              - year greater than this year (in the appropriate era for the culture)
   ShortDatePattern  - string: short date pattern. Valid chars: "M", "d", "y" and "/" for separator
   ShortDatePatternMN  - string: short date pattern with the month replaced by MMM (abbr month). Valid chars: "M", "d", "y" and "/" for separator
   AbbrDatePattern   - string: abbr date pattern, similar to long, with abbreviated month name: "MMM" for abbr month name.  Does not include week day
   LongDatePattern   - string: long date pattern. "MMMM" for month name.  Does not include week day
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
   ShortMonthDayPatternMN      - string: month day pattern based on ShortDatePatternMN
   AbbrMonthDayPattern      - string: month day pattern with abbreviated month name
   LongMonthDayPattern      - string: month day pattern with long month name
   ShortMonthYearPattern      - string: month year pattern with only digits
   ShortMonthYearPatternMN      - string: month year pattern based on ShortDatePatternMN
   AbbrMonthYearPattern     - string: month year pattern with abbreviated month name
   LongMonthYearPattern     - string: month year pattern with long month name

*/
   dateTimeFormat: function(rule) {
      return jTAC.cultureInfo["dt" + rule];

   },

   /*
   Evaluates a single character to determine if it is valid in a string
   representing the type. It does not care about the position or quantity
   of this character in the string that is being created.
   For example, if this is a date entry that supports only the short date format,
   it considers digits and the decimal separator to be valid.
      chr - A single character string to evaluate.
   Returns: true when the character is valid and false when invalid.
   */
   isValidChar : function (chr) {
      if (!this.callParent([chr])) // tests for illegal parameter. 
         return false;
      var cache = this._cache;
      if (cache.noREvalchar)  // not supported indicator
         return true;
      var re = cache.valcharRE;
      if (!re) {
         re = cache.valcharRE = this._valCharRE();
         if (!re) {   // not supported
            cache.noREvalchar = true;
            return true;
         }
      }
      return re.test(chr);
   },

   /*
   Function called by isValidChar
   to create a regular expression that evaluates a character as legal.
   Return null if all characters are legal and isValidChar should always return true.
      culture - object defined by jquery-globalize that contains one culture's rules.
         Returned by Globalize.culture['name']

   This function returns null by default and subclasses should override it.
   */
   _valCharRE : function () {
      return null;
   },

   /*
     Overridden
   */
   setCultureName : function (name) {
      this._defaultSetter("cultureName", name);  //this.config.cultureName = name;
      this._clearCache();
   }

}
jTAC.define("TypeManagers.BaseCulture", jTAC._internal.temp._TypeManagers_BaseCulture);

/* -------------------------------------------------------------------
Defines the jTAC.cultureInfo object. Used by TypeManagers.BaseCulture
to supply culture specific number, currency, percent, date and time settings.
This defines the TypeManagers.CultureInfo class. Below the default
is created using the settings shown here (which are en-US).
Edit values using jTAC.cultureInfo.property name or by creating a new instance
and assigning it to jTAC.cultureInfo.
This functionality is used by default by TypeManagers.BaseCulture.
You can load other culture engines, like "Culture engine for jquery-globalize.js",
which replace this functionality in TypeManagers.BaseCulture.
------------------------------------------------------------------- */

jTAC_Temp = {
   config: {
      numNegPattern: "-n", // string: negative number pattern: use "(n)|-n|- n|n-|n -", where n is replaced by the number
      numDecimals: 2,      // integer: number of decimal places normally shown
      numGroupSep: ",",    // string: string that separates number groups, as in 1,000,000
      numDecimalSep: ".",  //string: string that separates a number from the fractional portion, as in 1.99
      numGroupSizes: [3],  //  - array: array of numbers indicating the size of each number group.
      numNegSymbol: "-",    // string: symbol used for negative numbers
      curNegPattern: "($n)",  //string: negative pattern for currency, including symbol represented by $
      curPosPattern: "$n",  //string: positive pattern for currency, including symbol represented by $
      curSymbol: "$",      // string: symbol used to represent a currency
      curDecimals: 2, // integer: number of decimal places normally shown in a currency
      curGroupSep: ",", // string: string that separates number groups in a currency, as in 1,000,000
      curDecimalSep: ".",  //string: string that separates a number from the fractional portion, as in 1.99 in a currency
      curGroupSizes: [3],  //array: array of numbers indicating the size of each number group in a currency
      curNegSymbol: "-", // string: symbol used for negative numbers in a currency
      pctNegPattern: "-%n",  //string: negative pattern for percentage, including symbol represented by %
      pctPosPattern: "%n",  //string: positive pattern for percentage, including symbol represented by %
      pctSymbol: "%",      // string: symbol used to represent a percentage
      pctDecimals: 2, // integer: number of decimal places normally shown in a percentage
      pctGroupSep: ",", // string: string that separates number groups in a percentage, as in 1,000,000
      pctDecimalSep: ".",  //string: string that separates a number from the fractional portion, as in 1.99 in a percentage
      pctGroupSizes: [3],  //array: array of numbers indicating the size of each number group in a percentage
      pctNegSymbol: "-", // string: symbol used for negative numbers in a percentage
      dtShortDateSep: "/", // string: separator of parts of a date (e.g. "/" in 11/05/1955)
      dtTimeSep: ":",  //string: separator of parts of a time (e.g. ":" in 05:44 PM)
      dtFirstDay: 0, // integer: the first day of the week (0 = Sunday, 1 = Monday, etc)
      dtDays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], // array of 7 strings. Full names for days of the week
      dtDaysAbbr: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], // array of 7 strings. Abbreviated names for days of the week
      dtDaysShort: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"], // array of 7 strings. Short names for days of the week
      dtMonths: [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December", "" ],
      dtMonthsAbbr: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", ""],
      dtAM: "AM", // string: AM Designator. Null when not used
      dtPM: "PM", // string: PM Designator. Null when not used
      dtTwoDigitYearMax : 2029,  //integer: When a two digit year is given, it will never be parsed as a four digit year greater than this year (in the appropriate era for the culture)
      dtShortDatePattern: "M/d/yyyy",  //string: short date pattern. Valid chars: "M", "d", "y" and "/" for separator
      dtShortDatePatternMN: "MMM/d/yyyy",  //string: short date pattern with the month replaced by MMM (abbr month). Valid chars: "M", "d", "y" and "/" for separator
      dtAbbrDatePattern : "MMM dd, yyyy",  //string: abbr date pattern, similar to long, with abbreviated month name: "MMM" for abbr month name. Does not include week day
      dtLongDatePattern : "MMMM dd, yyyy",  //string: long date pattern. "MMMM" for month name. Does not include week day
      dtShortTimePattern: "h:mm tt",  //string: time pattern without seconds: "H", "m", "tt"
      dtLongTimePattern : "h:mm:ss tt",  //string: time pattern with seconds: "H", "m", "s", "tt"
      dtShortDurationPattern: "h:mm",  // duration pattern without seconds: "H", "m"
      dtLongDurationPattern: "h:mm:ss",  // duration pattern with seconds: "H", "m", "s"
      dtShortDateShortTimePattern: "M/d/yyyy h:mm tt",  //string: short date pattern + short time pattern
      dtShortDateLongTimePattern: "M/d/yyyy h:mm:ss tt",  //string: short date pattern + long time pattern
      dtAbbrDateShortTimePattern: "MMM dd, yyyy h:mm tt",  //string: abbr date pattern + short time pattern
      dtAbbrDateLongTimePattern : "MMM dd, yyyy h:mm:ss tt",  //string: abbr date pattern + long time pattern
      dtLongDateShortTimePattern: "MMMM dd, yyyy h:mm tt",  //string: long date pattern + short time pattern
      dtLongDateLongTimePattern : "MMMM dd, yyyy h:mm:ss tt",  //string: long date pattern + long time pattern
      dtShortMonthDayPattern: "M/dd",   // string: month day pattern with only digits
      dtShortMonthDayPatternMN: "MMM/dd",   // string: month day pattern based on ShortMonthDayPattern
      dtAbbrMonthDayPattern : "MMM dd",  //string: month day pattern with abbreviated month names
      dtLongMonthDayPattern: "MMMM dd",  //string: month day pattern with long month name
      dtShortMonthDayPattern: "M/yyyy", // string: month year pattern with only digits
      dtShortMonthDayPattern: "MMM/yyyy", // string: month year pattern based on ShortMonthYearPattern
      dtAbbrMonthYearPattern: "MMM yyyy",  //string: month year pattern with abbreviated month names
      dtLongMonthYearPattern: "MMMM yyyy"  //string: month year pattern with long month name
   },

   configrules: {
      dtAM: jTAC.checkAsStrOrNull,
      dtPM: jTAC.checkAsStrOrNull
   }
}

jTAC.define("TypeManagers.CultureInfo", jTAC_Temp);

// The Global that is used by TypeManagers.BaseCulture classes by default
// You can replace it with another instance if you like, or edit its properties directly.
jTAC.cultureInfo = jTAC.create("TypeManagers.CultureInfo"); // creates the default

