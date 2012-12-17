// jTAC/TypeManagers/BaseNumber.js
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
Class : TypeManger.BaseNumber   ABSTRACT CLASS
Extends: TypeManagers.BaseCulture

Purpose:
Abstract class to support a number as a native type.

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
   allowNegatives (bool) - Property determines if a negative number is valid.
     When it is not, isValidChar() and isValid() functions both report
     errors when they find a negative char or number.
   showGroupSep (bool) - Determines if the toString() function includes
     group separator character (aka "thousands separator"). Defaults to true.
   allowGroupSep (bool) - Sets up the keyboard filter to allow the thousands symbol.
      When not allowed, the thousands character causes validation error.
      Defaults to true.
   strictSymbols (boolean) -
      By default, the parser is flexible about the placement of symbols
      surrounding the digits. The minus, currency symbol, percentage symbol
      can appear before or after the digits. If using parentheses
      for negative indicators, the opening paren can be either before or after,
      and the closing paren can be missing.
      That's because the parser just uses the presence of these characters
      to detect a negative value, and then strips out all of these symbols.
      When this is true, these symbols must be found in the positions
      indicated by the culture's NegPattern and PosPattern.
      However, any spaces separating the symbols from the digits are still optional.
      It defaults to false.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseCulture
One of the Culture engines, such as Culture engine using jTAC_Culture
or Culture engine using jquery-globalize.

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_BaseNumber = {
   extend: "TypeManagers.BaseCulture",
   "abstract": true,

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      allowNegatives: true,
      showGroupSep: true,
      allowGroupSep: true,
      strictSymbols: false
   },

   nativeTypeName : function () {
      return "number";
   },
   /*
   Overridden method.
   Evaluates the number. Looks for illegal cases. Throws exceptions when found.
   It may change the value too, if needed, such as to round it.
   value (number) - The number to check. 
   Returns the finalized number.
   */
   _reviewValue : function (value) {
      if (value === null)
         return value;

      value = this.callParent([value]);
      if (isNaN(value))
         this._error("Cannot pass NaN.");
      this._checkAllowNegatives(value); // may throw an exception
      return value;
   },

   /*
   Returns the original value.
   */
   toNumber : function (value) {
      return value;
   },

   /*
   Indicates the maximum number of decimal places.
   When 0, no decimal places are allowed.
   This class returns 0.
   */
   getMaxDecimalPlaces : function () {
      return 0;
   },


   /* 
      Conversion from native value to culture neutral string. only digits, period, optional lead minus character
   */
   toStringNeutral : function (val) {
      if (val == null)
         return "";
      var r = val.toString(); // when > 6 decimal digits, it returns exponential notation: w.ddde+n or w.ddde-n, where n is the exponent
      if ((r.indexOf('e') > -1) && val.toFixed) {	// toFixed requires Javascript 1.5
         var m = r.match(/^.+e[\-\+](\d*)$/);
         var sz = parseInt(m[1], 10);
         if (isNaN(sz))
            return "";
         r = val.toFixed(sz);
      }
      return r;

   },


   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/


   // ---- UTILITY METHODS ---------------------------------------------------
/*
Redirects the rule to one of the TypeManagers.BaseCulture
methods that handle number formats.
This class uses numberFormat().
*/
   _nf: function(rule) {
      return this.numberFormat(rule);
   },


   /* 
    Call when the number format restricts the negative symbol to minus character.
    Negative symbols include: -, (, ). However, parenthesis are only supported
    if the culture allows it, whereas minus is always allowed.
    Throws exception if illegal symbol is found.
    Usually currency allows all. Percent and float usually only allow minus.
      text (string) - contains the number including the negative symbol.
      numberFormat (object) - from culture.numberFormat, culture.numberFormat.currency,
        or culture.numberFormat.percent. Must have a pattern property that is 
        an array, where the first element is the negative pattern.
   */
   _checkNegSymbol : function (text) {
      if ((text.indexOf("(") > -1) && !this._negPatHasParen()) {
            this._error("Illegal negative symbol");
      }
   },

/*
Returns true if the negative pattern includes the parenthesis to indicate negative values.
*/
   _negPatHasParen : function() {
      var r = this._cache.nPAP;
      if (r == null) {
         r = this._cache.nPAP = this._nf("NegPattern").indexOf("(") > -1;
      }
      return r;
   },

/*
Call when the strictSymbols property is true.
Pass in the text containing a number after its thousands separators are removed
and its decimal place is converted to period. Effectively the number inside
the string is just digits and period.
This will evaluate the text against the culture's NegPattern and PosPattern. 
It will throw an exception if the pattern is not matched.
*/
   _checkStrictSymbols: function( text ) {
      var nSym = this._nf("NegSymbol");
      var neg = (text.indexOf(nSym) > -1) || text.indexOf("(") > -1;
      var pat = this._nf(neg ? "NegPattern" : "PosPattern") || "";
      if (!pat)
         return;
      text = text.replace(nSym, "-");
      var sym = this._nf("Symbol") || "";
      var defSym = pat.indexOf("$") > -1 ? "$" : (pat.indexOf("%") > -1 ? "%" : "");
      var hasSym = text.indexOf(sym) > -1;
      if (hasSym) {
         text = text.replace(sym, defSym);
         pat = jTAC.escapeRE(pat);  // for negative symbols
         pat = pat.replace("\\ ", "\\s?");  // optional spaces
      }
      else { // no sym means remove space and defSym from the pattern
         pat = jTAC.replaceAll(pat, " ", "");
         pat = pat.replace(defSym, "");
         pat = jTAC.escapeRE(pat);  // for negative symbols
      }
      pat = pat.replace("n", "\\d+(\\.\\d*)?");
      pat = "^" + pat + "$";
   //NOTE: Does not save the regexp because there are several cases that vary based on the input
      var re = new RegExp(pat);
      if (!re.test(text))
         this._inputError("Symbols are not correctly positions.");
   },

   /*
     Inserts the group separator in the text parameter and returns the value.
     text - string to update. Separators are placed to the left of the decimal
         separator character if present.
   */
   _applyGroupSep : function (text)  {
      var gSep = this._nf("GroupSep");
      if (gSep == null)
         return text;

      var r = "";
      var dSep = this._nf("DecimalSep");

      var dPos = text.indexOf(dSep);
      var ePos = text.length;
      if (dPos > -1)  {// copy the trailing decimal section
         r = text.substring(dPos, ePos);
         ePos = dPos;
      }
      var gpSz = this._nf("GroupSizes");
      if (gpSz == null)
         gpSz = [ 3 ];

      var szIdx = 0;
      var nxtP = gpSz[0];
      var pos = 0;
      for (var i = ePos - 1; i >= 0; i--) {
         r = text.charAt(i) + r;
         if (i == 0)
            break;   // to avoid adding the thousands separator as the first character
         pos++;
         if (pos == nxtP) {
            r = gSep + r;
            if (szIdx < gpSz.length - 1) // continue with the last size
               szIdx++;
            if (gpSz[szIdx] == 0) // when 0, the last segment is unlimited size
               nxtP = 999;
            else
               nxtP = nxtP + gpSz[szIdx];

         } // if
      }  // for
      return r;
   },

   /*
   Utility for the _nativeToString() method of subclasses to test
   if the number is negative when allowNegatives is false. 
   Throws an exception if negatives are detected but not allowed.
   */
   _checkAllowNegatives : function(value) {
      if (!this.getAllowNegatives() && (typeof value == "number") && (value < 0))
         this._inputError("Negative values not allowed");
   },

   /*
      Utility to remove thousands separator characters when the showGroupSep property is false.
      It does not care about their positions. Every single instance of the character is removed here.
      (Subclass if you'd like a different behavior.)
   */
   _stripGroupSep : function(text) {
      return jTAC.replaceAll(text, this._nf("GroupSep"), "", true);
   },

   /*
     Call when converting to a string and there are trailing zeroes in the decimal part.
     It removes excess zeroes from the end.
       text (string) - string to clean up.
       td (int) - Number of trailing decimal characters allowed. When 0, no cleanup is applied.
       numberFormat (object) - from culture.numberFormat, culture.numberFormat.currency,
          or culture.numberFormat.percent. Must have a "." property containing the decimal separator.
   */
   _cleanTrailingZeros : function (text, tz) {
      // jquery-globalize may default numberFormat.decimals to 2, which is its own trailing decimals.
      // Unfortunately that value is fixed in the scripts and 2 is a poor choice for decimal numbers
      // which are not currencies. So this strips off any trailing zeros that exceed tz.
      if (tz)
      {
         // the decimal digits may be followed by additional text, like currency or percent symbol.
         // This technique extracts the decimal point and all following digits.
         // It modifies that string before using search and replace on the original string.
         var re = new RegExp(jTAC.escapeRE(this._nf("DecimalSep")) + "\\d*");
         var match = re.exec(text);
         if (match) {
            var ds = match[0];
            while (tz < (ds.length - 1)) {
               if (ds.charAt(ds.length - 1) != "0")   // once its not a trailing zero, stop
                  break;
               ds = ds.substr(0, ds.length - 1);
            }
            // see if missing trailing zeroes
            var add = tz - (ds.length - 1);
            if (add > 0) {
               ds += "000000000000".substr(0, add);
            }
            text = text.replace(match[0], ds);
         }
      }

      return text;
   }

}
jTAC.define("TypeManagers.BaseNumber", jTAC._internal.temp._TypeManagers_BaseNumber);


﻿// jTAC/TypeManagers/BaseFloat.js
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
Class : TypeManger.BaseFloat      ABSTRACT CLASS
Extends: TypeManagers.BaseNumber

Purpose:
Base abstract class for developing floating point TypeManagers.
Supports float as the native type. 
Uses the numberFormat object provided by the _getNumberFormat() function.
This allows subclasses like TypeManagers.Currency and TypeManagers.Percent
to provide alternative formatting rules.

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
   trailingZeroDecimalPlaces (int) - Determines how many trailing decimal places 
      should appear when reformatting a float value to a string.
   maxDecimalPlaces (int) - Determines the maximum number of decimal digits that are legal. 
      If there are more, it is either a validation error or rounded,
      depending on roundMode.
      Set to 0 or null to ignore this property.
   roundMode (int) - When maxDecimalPlaces is set, this determines
      how to round based or if an exception is thrown. 
      Values: 0 = Point5, 1 = Currency, 2 = Truncate, 3 = Ceiling, 4 = NextWhole, null = error
      Defaults to null.
   acceptPeriodAsDecSep (boolean) - 
      Many cultures do not use the period as the decimal separator. 
      It makes numeric entry from the numeric keypad more difficult, 
      because it features a period key.
      When true, both the culture's decimal separator and a period are allowed as the decimal separator.
      Does not apply for cultures that already use a period for the decimal separator. 
      Some cultures use a period as a thousands separator. In those cases, the parser will 
      only consider periods the decimal separator when there is only one period character 
      and the culture's decimal separator is not found.
      Defaults to false.


Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseCulture
TypeManagers.BaseNumber
One of the Culture engines, such as Culture engine using jTAC_Culture
or Culture engine using jquery-globalize.

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_BaseFloat = {
   extend: "TypeManagers.BaseNumber",
   "abstract": true,

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      maxDecimalPlaces: null,         // no limit
      trailingZeroDecimalPlaces: 1,   // none
      roundMode: null,                // throw exception if maxDecimalPlaces is exceeded
      acceptPeriodAsDecSep: false
   },

   configrules: {
      maxDecimalPlaces: jTAC.checkAsIntOrNull,
      trailingZeroDecimalPlaces: jTAC.checkAsInt, 
      roundMode: jTAC.checkAsIntOrNull    
   },

   /*
   Support for the toString() method.
   Returns a string formatted to match the value.
   NOTE: Designed to be used by TypeManagers., TypeManagers.Currency, and TypeManagers.Percent.
   Avoid adding anything unique to any of those cases here.
   */
   _nativeToString : function (value) {
      if (value == null)
         return "";
   /* Caller handles this through _reviewValue()
      if (isNaN(value))
         this._error("Cannot pass NaN.");
      this._checkAllowNegatives(value);   // may throw an exception

      value = this._applyMaxDec(value);  // may throw an exception
   */
      var s = this.floatToString(Math.abs(value));   // does not use culture specific formats. Has a period for a decimal separator.

      // Apply these formatting changes:
      // 1) trailingZeroDecimalPlaces
      // 2) Replace the period with the decimal separator
      // 3) add thousands separators 
      // 4) apply negative and positive formatting pattern
      s = this._applyTrailingZeros(s);
      var dSep = this._nf("DecimalSep");
      if (dSep != ".")
         s = s.replace(".", dSep);
      if (this.getShowGroupSep())
         s = this._applyGroupSep(s);
      var pr = (value < 0) ? "NegPattern" : "PosPattern";
      var pat = this._nf(pr);
      if (pat)
         s = pat.replace("n", s);

      return s;
   },

   /*
     Adds trailing zeros based on the current text representing a decimal
     value and the trailingZeroDecimalPlaces property.
      text (string) - A string representing a decimal number, with only
         digits and the period as the decimal separator. If no period,
         nothing happens.
     Returns the updated text.
   */
   _applyTrailingZeros : function (text) {
      var tz = this.getTrailingZeroDecimalPlaces();

      // when tz == null, don't add or remove trailing zeros, except for a whole number; 
      // when == 0, do not add ".0" to whole numbers; otherwise add trailing zeros
      if ((tz == null) && (text.indexOf(".") == -1)) {
         text += ".0";   // add a trailing decimal plus 0
      }
      if (tz > 0) {
         var p = text.indexOf(".");
         var add = tz;
         if (p == -1)
            text += ".";
         else
            add = tz - (text.length - p - 1);
         if (add > 0)
            text += String("000000000000000000").substr(0, add);
      }
      return text;
   },


   /*
   If the number of decimal places exceeds, maxDecimalPlaces, rounding is applied
   based on roundMode. May throw an exception.
      value (number) - The number to check. 
   */
   _reviewValue : function (value) {
      value = this.callParent([value]); // may throw an exception
      if (value != null)
         value = this._applyMaxDec(value);  // may throw an exception
      return value;
   },


   /* 
   Support for toValue() method. This is an override from the base class.
   Returns a float or throws an exception.
   */
   _stringToNative : function (text) {
      this._checkNegSymbol(text);   // throw exception if negative is () character.
      if (!this.getAllowGroupSep()) {
         var gSep = this.numberFormat("GroupSep");
         if (gSep && (text.indexOf(gSep) > -1))
            this._inputError("Group separator not allowed.");
      }


      var n = this._parse(text);
      if (isNaN(n))  // while handled in _reviewValue, this ensures child classes don't process the result when NaN
         this._inputError("Cannot convert [" + text + "] to " + this.dataTypeName() + ".");
   /* Caller handles this through _reviewValue()

      if (isNaN(n))
         this._error("Cannot convert [" + text + "]");
      if (n != null)
         n = this._applyMaxDec(n);

      this._checkAllowNegatives(n);
   */
      return n;
   },


/*
Parses the text, looking for a culture specific formatted number (floating point and integer).
If an error occurs, it throws an exception. 
It is very forgiving, to let users make the user typos that are harmless,
such as incorrectly positioned negative, currency, percent, and group symbols.
The caller has already tested for invalidate conditions that 
don't require some level of parsing, like the [allowGroupSep] property
and incorrect usage of parenthesis for negative symbols.
Returns a number or NaN.
*/
   _parse: function( text ) {

      // swap symbol character with "!!". This is never a legal symbol.
      // It becomes a placeholder, used by _checkStrictSymbols.
      // Then its stripped out entirely.
      var sym = this._nf("Symbol");
      if (sym) {
         text = text.replace(sym, "!!");
      }

      text = this._replaceDecSep(text);

      text = this._stripGroupSep(text);

   // replace the decimal symbol with period
      var dSep = this._nf("DecimalSep");
      if (dSep != ".") {
         if (text.indexOf(".") > -1)
            this._inputError("Period character not supported in this culture.");
         text = text.replace(dSep, ".");
      }

      if (this.getStrictSymbols()) {
         var temp = sym ? text.replace("!!", sym) : text;
         this._checkStrictSymbols(temp);
      }

      if (text.indexOf("!!") > -1) {
         text = jTAC.trimStr(text.replace("!!", ""));   // once past _checkStrictSymbols, we don't need the symbol anymore
      }

   // negative symbols just need to be present. Their location does not matter. 
   // If negPattern supports (), the closing paren is not required.
   // If user doesn't like this flexibility, they set [strictSymbols] to true.
      var nSym = this._nf("NegSymbol");
      var neg = (text.indexOf(nSym) > -1) || ((text.indexOf("(") > -1) && this._negPatHasParen());

    // After removing symbols, there may be a space left that separated the symbol from digits.
      text = jTAC.trimStr(text); 

   // ensure we have just digits, period and optionally negative symbol to the left or right of digits
      var re = this._cache.floatCharsRE;
	   if (!re) {
         var nsEsc = jTAC.escapeRE(nSym);
         this._cache.floatCharsRE = re = new RegExp("^([" + nsEsc + "\\(])?\\d+(\\.(\\d*))?([" + nsEsc + "\\)])?$");
      }
      if (!re.test(text))
         this._inputError("Invalid characters found");

      // parseFloat does not handle certain negative patterns. Remove the neg symbols
      if (neg) {
         text = jTAC.trimStr(text.replace(nSym, "").replace("(", "").replace(")", ""));
      }

      var n = parseFloat(text);
      if (isNaN(n)) {
         return n;
      }

      if (neg) {
         n = -n;
      }

      return n;
   },

   /*
     Applies the maxDecimalPlaces property rule to the value.
     Uses the roundMode property to determine what action to take
     when maxDecimalPlaces is exceeded. roundMode can have it throw an exception.
         value (float number) - the number to adjust.
     Returns the adjusted number.
   */
   _applyMaxDec : function (value) {
      var mdp = this.getMaxDecimalPlaces();
      if (mdp)
         return this.round(value, this.getRoundMode(), mdp); // throws exception when roundmode = null and maxDecimalPlaces is exceeded
      return value;
   },


   /* 
      Neutral format is only digits, one period, and optional lead minus character
      The period and trailing digits are optional, but if you have a period
      there must be at least one trailing digit.
   */
   toValueNeutral : function (text) {
      if (text == null)
         return null;
      try
      {
         this._pushContext(null, text);

         if (typeof (text) == "number")
            return this._reviewValue(text);
         if (/^\-?\d+(\.\d+)?$/.test(text))
            return parseFloat(text);
         this._inputError("Required format: [-]digits[.digits]");
      }
      finally {
         this._popContext();
      }
   },

   /* 
      Conversion from native value to culture neutral string. only digits, period, optional lead minus character
   */
   toStringNeutral : function (val) {
      if (val == null)
         return "";
      var r = this.callParent([val]);
      if (r.indexOf('.') == -1) {
         r = r + ".0";
      }
      return r;

   },


   /*
   Support for the isValidChar method. This is an override from the base class.
   Creates a regular expression object that allows digits and the thousands separator.
   This class provides digits, decimal separator, negative symbol, and thousands separator.
   Subclasses should override _moreValidChars() to introduce additional characters like 
   the currency symbol.
   */
   _valCharRE : function () {
      var pat = this._nf("NegPattern") || "";
      var ns = ""; // negative symbol.
      if (this.getAllowNegatives()) {
         // always allows negative symbol character, even when en-US doesn't define it.
         // users don't usually type the () characters when they can type a single - character.
         ns = "-";
         if (pat.indexOf("(") > -1)
            ns += "()";
      }
      var sp = pat.indexOf(" ") > -1 ? " " : "";  // has a space in the negative pattern

      var dSep = this.getMaxDecimalPlaces() != 0 ? this._nf("DecimalSep") : "";

      return new RegExp("[\\d" + jTAC.escapeRE(this._nf("GroupSep") + dSep + ns + this._moreValidChars()) + sp + "]");
   },

   /*
     Used by the _valCharRE method to add characters that it doesn't normally add.
   */
   _moreValidChars : function() {
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
Ancestor declares the same method. This is intended to override. 
AutoGetSet doesn't create it here because it already exists in the ancestor.
*/
   getMaxDecimalPlaces : function () {
      return this.config.maxDecimalPlaces;
   },

// --- UTILITY METHODS --------------------------------------------

/*
 When acceptPeriodAsDecSep is true, it converts a period decimal separator 
 to the culture's decimal separator.
 Call before cleaning up thousands separators.
   text - original text
 Returns the original or modified text.
*/
   _replaceDecSep: function (text) {
      if (!this.getAcceptPeriodAsDecSep())
         return text;
      var dSep = this._nf("DecimalSep");
      if ((dSep != ".") && (text.indexOf(".") > -1)) { // uses a non-period decimal separator
         // determine if that character is present.
         if (text.indexOf(dSep) == -1) {
            var replace = false;
            var gSep = this._nf("GroupSep");
            // evaluate the group separator. If the culture character is not a period, period is the decimal separator
            if (gSep != ".") {
               replace = true;
            }
            else // is there 0 or 1 group separator
            {
               var vPos1 = text.indexOf(gSep);
               var vPos2 = text.lastIndexOf(gSep);
               if ((vPos1 == -1) || (vPos1 == vPos2))
                  replace = true;
            }
            if (replace)
               text = text.replace(".", dSep);
         }
      }
      return text;
   }

}
jTAC.define("TypeManagers.BaseFloat", jTAC._internal.temp._TypeManagers_BaseFloat);

﻿// jTAC/TypeManagers/Integer.js
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
Class : TypeManger.Integer
Extends: TypeManagers.BaseNumber

Purpose:
Supports integer as the native type.

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
   fillLeadZeros (int) - Provides additional formatting when converting an integer to text
      by adding lead zeros. When > 0, it adds enough lead zeroes to match
      the value of this property. When 0 or null, it is not used.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseCulture
TypeManagers.BaseNumber
One of the Culture engines, such as Culture engine using jTAC_Culture
or Culture engine using jquery-globalize.

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_Integer = {
   extend: "TypeManagers.BaseNumber",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );
   },

   config: {
      fillLeadZeros: 0
   },

   configrules: {
      fillLeadZeros : jTAC.checkAsIntOrNull
   },

   dataTypeName : function () {
      return "integer";
   },

   storageTypeName : function () {
      return "integer";
   },

   /* 
   Returns an integer or throws an exception.
   */
   _stringToNative : function (text) {
      if (text == null)
         this._error("Cannot evaluate null value");
      // if there is a decimal point, it is illegal
      if (text.indexOf(this.numberFormat("DecimalSep")) > -1)
         this._error("Cannot evaluate a floating point number.");

      var gSep = this.numberFormat("GroupSep");

      if (!this.getAllowGroupSep() && gSep && (text.indexOf(gSep) > -1))
         this._inputError("Group separator not allowed.");

      var n = this._parse(text);

      if (isNaN(n))  // while handled in _reviewValue, this ensures child classes don't process the result when NaN
         this._inputError("Cannot convert [" + text + "] to " + this.dataTypeName() + ".");
   /* handled by _reviewValue which is called by toValue
      if (isNaN(n))
         this._error("Cannot convert [" + text + "]");
      if (Math.floor(n) != n)
         this._error("Floating point value not allowed");
      this._checkAllowNegatives(n); // may throw an exception
   */
      return n;
   },

/*
Parses the text, looking for a culture specific formatted integer.
If an error occurs, it throws an exception. 
It is very forgiving, to let users make the user typos that are harmless,
such as incorrectly positioned minus symbol.
The caller has already tested for invalidate conditions that 
don't require some level of parsing, like the [allowGroupSep] property
and text that contains a decimal value.
Returns a number or NaN.
*/
   _parse: function (text) {

      text = this._stripGroupSep(text);

      if (this.getStrictSymbols()) {
         this._checkStrictSymbols(text);
      }

      var nSym = this._nf("NegSymbol");
      var neg = text.indexOf(nSym) > -1;

   // ensure we have just digits and optionally negative symbol to the left or right of digits
      var re = this._cache.intCharsRE;
      if (!re) {
         var nsEsc = jTAC.escapeRE(nSym);
         this._cache.intCharsRE = re = new RegExp("^(" + nsEsc + ")?\\d+(" + nsEsc + ")?$");
      }
      if (!re.test(text))
         this._inputError("Illegal character found.");

      if (neg) {   // neg symbol stripped because its location may not be left of the digits.
         text = text.replace(nSym, "");
      }


      var n = parseInt(text, 10);

   // limit the value to Server side Int32 min max range.
      if (!isNaN(n) && (n != null) && ((n > 2147483647) || (n < -2147483648)))
         this._inputError("Exceeds 32 bit integer.");

      if (neg) {
         n = -n;
      }

      return n;
   },

   /*
   Converts the value to a string. If null is passed,
   it returns "". If NaN is passed, it throws an exception.
   */
   _nativeToString : function (value) {
      if (value == null)
         return "";
   /* handled by _reviewValue which is called by toString
      if (isNaN(value))
         this._error("Cannot pass NaN.");
      if (Math.floor(value) != value)
         this._error("Has decimal point.");
      this._checkAllowNegatives(value);   // may throw an exception
   */
      var s = Math.abs(value).toString();
      if (this.getShowGroupSep())
         s = this._applyGroupSep(s);
      var flz = this.getFillLeadZeros();
      if (flz && (s.length < flz)) {
         e = "0000000000";
         s = e.substr(0, flz - s.length) + s;
      }

      if (value < 0)
         s = this.numberFormat("NegPattern").replace("n", s);
      return s;
   },

   /*
   If the number of decimal places exceeds, maxDecimalPlaces, rounding is applied
   based on roundMode. May throw an exception.
      value (number) - The number to check. 
   */
   _reviewValue : function (value) {
      if (Math.floor(value) != value)
         this._inputError("Has decimal point.");
      return this.callParent([value]);
   },

   /* 
      Neutral format is only digits and optional lead minus character
   */
   toValueNeutral : function (text) {
      if (text == null)
         return null;
      try {
         this._pushContext();

         if (typeof (text) == "number")
            return this._reviewValue(text);
         if (/^\-?\d+$/.test(text))
            return parseInt(text);
         this._inputError("Required format: [-]digits");
      }
      finally {
         this._popContext();
      }
   },


   /*
   Support for the isValidChar method. This is an override from the base class.
   Creates a regular expression object that allows digits and the thousands separator.
   */
   _valCharRE : function () {
      var ts = this.getAllowGroupSep() ? this.numberFormat("GroupSep") : "";   // thousands separator
      var ns = this.getAllowNegatives() ? this.numberFormat("NegSymbol") : ""; // negative symbol
      return new RegExp("[\\d" + jTAC.escapeRE(ts + ns) + "]");
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("TypeManagers.Integer", jTAC._internal.temp._TypeManagers_Integer);
jTAC.defineAlias("Integer", "TypeManagers.Integer");
jTAC.defineAlias("Integer.Positive", "TypeManagers.Integer", {allowNegatives: false});

﻿// jTAC/TypeManagers/Float.js
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
Class : TypeManger.Float
Extends: TypeManagers.BaseFloat

Purpose:
Supports float as the native type. Use for all decimal numbers
unless they are covered by another TypeManager (like Currency and Percent).

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
   NONE

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseCulture
TypeManagers.BaseNumber
TypeManagers.BaseFloat
One of the Culture engines, such as Culture engine using jTAC_Culture
or Culture engine using jquery-globalize.

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_Float = {
   extend: "TypeManagers.BaseFloat",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   dataTypeName : function () {
      return "float";
   },

   storageTypeName : function () {
      return "float";
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("TypeManagers.Float", jTAC._internal.temp._TypeManagers_Float);
jTAC.defineAlias("Float", "TypeManagers.Float");
jTAC.defineAlias("Float.Positive", "TypeManagers.Float", {allowNegatives: false});
﻿// jTAC/TypeManagers/Currency.js
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
Class : TypeManger.Currency
Extends: TypeManagers.BaseFloat

Purpose:
For decimal values that represent currencies.
Supports float as the native type. Strings are formatted as currencies.
Conversion with jquery-globalize uses Globalize.parseFloat().

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
   showCurrencySymbol (bool) - Determines if a string shows the currency symbol. 
      Only used by toString(). Defaults to true.
   allowCurrencySymbol (bool) - Determines if validation reports an error if 
      the currency symbol is found. Defaults to true.
   useDecimalDigits (bool) - Determines if the number of decimal digits
      is constrained to the culture (culture.numberFormat.currency.decimals)
      or the user can add more digits. Defaults to true.
   hideDecimalWhenZero (bool) - Determines a number that has only zeros in the decimal
      section shows the decimal part. For example, when the currency is 12.00, "12" 
      is shown while 12.1 shows "12.10".

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseCulture
TypeManagers.BaseNumber
TypeManagers.BaseFloat
globalize.js from jquery-globalize: https://github.com/jquery/globalize

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_Currency = {
   extend: "TypeManagers.BaseFloat",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      trailingZeroDecimalPlaces: null,   // override ancestor's default of 1

      showCurrencySymbol: true,
      allowCurrencySymbol: true,
      useDecimalDigits: true,
      hideDecimalWhenZero: false
   },

   dataTypeName : function () {
      return "currency";
   },

   storageTypeName : function () {
      return "float";
   },

   /*
   Returns a string converted from the float passed.
   */
   _nativeToString : function (value) {
      var s = this.callParent([value]);
      // at this point, thousands separators, decimal character and negative characters are localized.
      // The currency symbol is always present and represented by the "$" character.

      if (!this.getShowCurrencySymbol()) {  // strip out the $ and optional lead or trailing space
         var re = /\s?\$\s?/;
         s = s.replace(re, "");
      }
      else { // replace the $ character with the culture's currency symbol
         var sym = this._nf("Symbol");
         s = s.replace("$", sym);
      }

      if (this.getHideDecimalWhenZero()) {
         // if the value is an integer (lacks decimal digits), strip trailing digits
         var re = this._cache.checkDecRE;
         if (!re) {
            this._cache.checkDecRE = re = new RegExp(jTAC.escapeRE(this._nf("DecimalSep")) + "0+(?![1-9])"); // zeros until the next character is not a digit or its the end of the string
         }
         s = s.replace(re, "");
      }
      return s;
   },


   /* 
   Support for toValue() method. This is an override from the base class.
   Returns a float or throws an exception.
   */
   _stringToNative : function (text) {
      if (!this.getAllowCurrencySymbol() && (text.indexOf(this._nf("Symbol")) > -1))
         this._inputError("Currency symbol found but not allowed.");
      return this.callParent([text]);
   },

   /*
      Overridden to only apply when useDecimalDigits is true.
   */
   _applyMaxDec : function (value) {
      if (this.getUseDecimalDigits())
         return this.callParent([value]);
      return value;
   },

   /*
     Used by the _valCharRE method to add characters that it doesn't normally add.
   */
   _moreValidChars : function() {
      return this.getAllowCurrencySymbol() ? this._nf("Symbol") : "";
   },


   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

   /*
      Overrides ancestor to return the currencyFormat("Decimals")
      or the value that the user set for maxDecimalPlaces. 
   */
   getMaxDecimalPlaces : function () {
      if (this.config.maxDecimalPlaces != null)
         return this.config.maxDecimalPlaces;
      return this._nf("Decimals");
   },

   /*
      Overrides ancestor to return the currencyFormat("Decimals")
      or the value that the user set for trailingZeroDecimalPlaces. 
   */
   getTrailingZeroDecimalPlaces : function () {
      if (this.config.trailingZeroDecimalPlaces != null)
         return this.config.trailingZeroDecimalPlaces;
      return this._nf("Decimals");
   },

   // --- UTILITY METHODS ---------------------------------
   /*
   Uses currencyFormat for all rules.
   */
   _nf : function ( rule ) {
      var r = this.currencyFormat(rule);
      if (r === undefined)
         r = this.numberFormat(rule);  // fallback
      return r;
   }

}
jTAC.define("TypeManagers.Currency", jTAC._internal.temp._TypeManagers_Currency);
jTAC.defineAlias("Currency", "TypeManagers.Currency");
jTAC.defineAlias("Currency.Positive", "TypeManagers.Currency", {allowNegatives: false});

﻿// jTAC/TypeManagers/Percent.js
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
Class : TypeManger.Percent
Extends: TypeManagers.BaseFloat

Purpose:
For decimal and integer values representing a percentage.

Use maxDecimalPlaces set to 0 to keep percents as integers.
A value of 1 can mean 100% or 1% based on the usage. Use the oneEqualsOneHundred
to determine which.

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
   showPercentSymbol (bool) - Determines if a string shows the Percent symbol. 
      Only used by toString(). Defaults to true.
   allowPercentSymbol (bool) - Determines if validation reports an error if 
      the Percent symbol is found. Defaults to true.
   oneEqualsOneHundred (bool) - Determines if the numeric value of 1.0 is shown as 1% or 100%,
      but only when using floating point values. If maxDecimalPlaces = 0,
      it is not used. It defaults to true (convert 1 to 100).

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseCulture
TypeManagers.BaseNumber
TypeManagers.BaseFloat
globalize.js from jquery-globalize: https://github.com/jquery/globalize

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_Percent = {
   extend: "TypeManagers.BaseFloat",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );
   },

   config: {
      trailingZeroDecimalPlaces: null,   // override ancestor's default of 1

      showPercentSymbol: true,
      allowPercentSymbol: true,
      oneEqualsOneHundred: true
   },

   dataTypeName : function () {
      return "percent";
   },

   storageTypeName : function () {
      return "float";
   },

   /* 
   Support for toValue() method. This is an override from the base class.
   Returns a float or throws an exception.
   */
   _stringToNative : function (text) {
      if (!this.getAllowPercentSymbol() && (text.indexOf(this._nf("Symbol")) > -1))
         this._inputError("Percent symbol found but not allowed.");

      var n = this.callParent([text]);   // throws exceptions if it cannot return a number

      if ((n != null) && this.getOneEqualsOneHundred() && (this.getMaxDecimalPlaces() != 0)) {
         // calculation errors are fixed by rounding
         var ndp = this.numDecPlaces(n);
         n = n / 100;
         ndp = ndp + 2;  // 2 is due to / 100
         n = this.round(n, 2, ndp);
      }

      return n;
   },

   /*
   Returns a string converted from the float passed.
   */
   _nativeToString : function (value) {
      var mdc = this.getMaxDecimalPlaces();
      if (this.getOneEqualsOneHundred() && (mdc != 0)) {
         // calculation errors occur: 1.1 * 100 = 110.000000000000001
         // Fixed by rounding
         var ndp = this.numDecPlaces(value);
         value = 100.0 * value;
         ndp = ndp - 2;  // 2 is due to x 100
         if (ndp < 0)
            ndp = 0;
         value = this.round(value, 2, ndp);
      }

      var s = this.callParent([value]);
      // at this point, thousands separators, decimal character and negative characters are localized.
      // The percent symbol is always present and represented by the "%" character.

      if (!this.getShowPercentSymbol()) { // strip out the % and optional lead or trailing space
         var re = this._cache.stripSymbolRE;
         if (!re) {
            re = this._cache.stripSymbolRE = new RegExp("\\s?%\\s?");
         }
         s = s.replace(re, "");
      }
      else { // replace the % character with the culture's currency symbol
         s = s.replace("%", this._nf("Symbol"));
      }

      return s;
   },


   /*
     Used by the _valCharRE method to add characters that it doesn't normally add.
   */
   _moreValidChars : function(nf) {
      return this.getAllowPercentSymbol() ? this._nf("Symbol") : "";
   },


   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

   /*
      Overrides ancestor to return percentFormat("Decimals")
      or the value that the user set for trailingZeroDecimalPlaces. 
      Always returns 0 when MaxDecimalPlaces = 0.
   */
   getTrailingZeroDecimalPlaces : function () {
      if (this.getMaxDecimalPlaces() == 0)
         return 0;
      if (this.config.trailingZeroDecimalPlaces != null)
         return this.config.trailingZeroDecimalPlaces;
      return this._nf("Decimals");
   },

   // --- UTILITY METHODS ---------------------------------

   _nf: function(rule) {
      var r = this.percentFormat(rule);
      if (r === undefined)
         r = this.numberFormat(rule);  // fallback
      return r;
   }

}
jTAC.define("TypeManagers.Percent", jTAC._internal.temp._TypeManagers_Percent);
jTAC.defineAlias("Percent", "TypeManagers.Percent");
jTAC.defineAlias("Percent.Positive", "TypeManagers.Percent", {allowNegatives: false});
jTAC.defineAlias("Percent.Integer", "TypeManagers.Percent", {maxDecimalPlaces: 0});
jTAC.defineAlias("Percent.Integer.Positive", "TypeManagers.Percent", {maxDecimalPlaces: 0, allowNegatives: false});

﻿// jTAC/TypeManagers/BaseDatesAndTimes.js
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
﻿// jTAC/TypeManagers/BaseString.js
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
Class : TypeManger.BaseString    ABSTRACT CLASS
Extends: TypeManagers.Base

Purpose:
Base class for any types that use a string to host its data.

The toNumber() function always returns null.
Subclasses can override isCaseIns() function to determine if 
compare() uses case sensitive or insensitive matches.

There is no localization built into this class.

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
None

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_BaseString = {
   extend: "TypeManagers.Base",
   "abstract": true,

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   nativeTypeName : function () {
      return "string";
   },

   storageTypeName : function () {
      return "string";
   },

   /*
   Converts non strings to strings first before letting _stringToNative 
   do further processing. Validation occurs last, with _reviewValue.
   */
   toValue : function (text) {
      if (text == null)
         return "";
      if (typeof (text) != "string") {
         text = text.toString();
      }
      var v = this._stringToNative(text);
      return this._reviewValue(v);  // may throw exception
   },


   /* 
   Convert from a native value to a string, applying globalization
   rules for the culture defined in the cultureName property.
     value - the native value to convert. Its type must be supported by 
             the subclass implementing this method or it should throw an exception. 
             You can also pass a string in a format compatible with a default formatting
             rule known to the jquery-globalize. That string will be converted
             first to the native type through toValue(). Then converted back to a string
             using the format parameter (or defaultFormat property).
   Returns: string. If the value represents nothing or is null, this will return
   the empty string.
   Exceptions: Throws exceptions when conversion cannot happen
   such as when the format is not appropriate for the data type being converted.
   SUBCLASSING: Override _nativeToString method to do the actual
   conversion.
   */
   toString : function (value) {

      if (value == null)
         return "";
      if (typeof (value) != "string") {
         value = value.toString();
      }

      value = this._reviewValue(value);   // may throw exceptions

      return this._nativeToString(value);
   },

   /* 
    Returns the same value. If value is not a string, it is converted to a string
    using the javascript toString() method. If the value is null, this returns null.
   */
   _nativeToString : function (value) {
      if (value == null)
         return "";
      return value.toString();
   },


   /*
    Returns the same value passed in.
   */
   _stringToNative : function (text) {
      return text;
   },

   /*
   Returns true if the value represents null.
   This method allows null. if emptyStrFalse is false
   the empty string also means null.
   */
   _isNull : function (val) {
      if (val == "")
         return true;
      return val == null;
   },

   /* 
   Compare two strings, applying case insensitive matching if _isCaseIns() is true.
      val1 - the value to compare on the left side of the comparison operator.
      val2 - the value to compare on the right side of the comparison operator.
   Returns: -1 when val1 < val2; 0 when val1 = val2; 1 when val1 > val2.
   Exceptions: Throws exceptions when either of the values is null.
   */
   compare : function (val1, val2) {
      val1 = this.toValue(val1); // ensures it is a string
      val2 = this.toValue(val2);
      if ((val1 == null) || (val2 == null))
         this._error("Parameter value was null.");
      if (this._isCaseIns()) {
         val1 = val1.toLowerCase();
         val2 = val2.toLowerCase();
      }
      if (val1 < val2)
         return -1;
      else if (val1 > val2)
         return 1;
      return 0;
   },

/*
Tells compare() if it needs to do a case sensitive or insensitive match.
When true, it is case insensitive.
*/
   _isCaseIns : function() {
      return false;
   },


   /* 
      Returns the original text.
   */
   toValueNeutral : function (text) {
      return text;
   },


   /* 
      Returns the original value, converted to string if needed.
   */
   toStringNeutral : function (val) {
      return this.toString(val);
   },


   /*
   Always returns true
   */
   isValidChar : function (chr) {
      return true;
   },

   /*
   Returns null. (not used)
   */
   toNumber : function (value) {
      return null;
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("TypeManagers.BaseString", jTAC._internal.temp._TypeManagers_BaseString);

﻿// jTAC/TypeManagers/BaseStrongPatternString.js
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
Class : TypeManger.BaseStrongPatternString   ABSTRACT CLASS
Extends: TypeManagers.BaseString

Purpose:
Base class for any string that is evaluated against a regular expression
to validate it.

Override these methods:
_regExp() - Returns an instance of the javascript RegExp object used to evaluate
   the string. Always ensure that it evaluates the full string by using the 
   ^ and $ symbols in the regexp pattern.  
dataTypeName() - Return the type name.

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
   altREPattern (string) - 
      Allows overriding the predefined regular expression pattern
      in case you have a different idea of the appropriate regular expression.
      If set, the _regExp() function is not used to create this. Instead,
      this and the _isCaseIns() are used.
      A good way to override this globally is to add a script that
      sets this in the prototype of the class you are modifying:
      TypeManagers.classname.prototype._REPattern = "pattern";


Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseString

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_BaseStrongPatternString = {
   extend: "TypeManagers.BaseString",
   "abstract": true,

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      altREPattern : ""
   },

   configrules: {
   },

/*
Checks the string against the regular expression. Throws
exception if there is no match. Otherwise, it returns the same text
*/
   _reviewValue : function(value) {
      var text = this.callParent([value]);
      if (text == "") {
         return text;
      }
      var re;
      if (this.getAltREPattern()) {
         re = new RegExp(this.getAltREPattern(), this._isCaseIns() ? "i" : "");
      }
      else {
         re = this._regExp();
      }
      if (!re || re.test(text)) {
         return text;
      }
      this._inputError("Invalid " + this.dataTypeName() + " [" + text + "]");
   },

/* ABSTRACT METHOD
Returns an instance of the javascript RegExp object used to evaluate
   the string. Always ensure that it evaluates the full string by using the 
   ^ and $ symbols in the regexp pattern.   
*/
   _regExp : function() {
      this._AM();
   }


   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("TypeManagers.BaseStrongPatternString", jTAC._internal.temp._TypeManagers_BaseStrongPatternString);

﻿// jTAC/TypeManagers/BaseRegionString.js
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
Class : TypeManger.BaseRegionString
Extends: TypeManagers.BaseString

Purpose:
Handles characteristics of a data type that varies by the region of the world,
such as phone numbers, postal codes, etc.

Each subclass defines a "RegionsData" object on the window object and overrides
_defaultRegionsData to supply it.
The RegionsData object defines each region as a property name 
and an object with these properties as the value:
   * name (string) - Same name as the property. Lets consumers of this object
      identify it.
   * pattern (string) - The regular expression pattern used
      to validate the entire string passed into the TypeManager (via toValue).
      Patterns must be created within this structure: (^your pattern$).
      This allows for multiple patterns to be merged when the user
      defined a pipe delimited list of region names in the TypeManager's
      'region' property.

      Alternatively, this can be a function that is passed the text
      and returns true if it is valid.
   * caseIns (boolean) - When case insensitivity is required,
      define this with a value of true. Omit or set to false if not needed.
   * validChars (string) - The regular expression pattern used
      to validate a single character as a legal character of the pattern.
      This is used by the isValidChar() function.
   * toNeutral (function) - If you want to pass back to the server
      a string without some of the formatting, define this function.
      It is passed the text and returns the cleaned up text.
      For example, phone number may have everything except digits stripped.
      This value will be used by the toValueNeutral() function and
      is used by the dataTypeEditor widget when you have setup the hidden field
      that hosts a neutral format.
   * toFormat (function) - If you want to apply formatting to a neutral format
      to display it to the user, define a function here. It is passed
      the text to format and returns the formatted text.
      This value is used by toString(). You may need to make it work with 
      already formatted text, such as running it through the toNeutral()
      function first.

The RegionsData object must always have a "defaultName" property whose value is
the name of another property that will be used if the 'region' property
is left unassigned.

Sometimes a few regions use the same patterns. You can create alias properties.
Define the property name for the region and the value as a string with the 
name of the other property that holds an object.

Example RegionsData object:
var jTAC_PhoneNumberRegionsData = 
{
   defaultName: "UnitedStates",

   UnitedStates:
   {
      pattern : "(^([1])?\\s*(\\([2-9]\\d{2}\\))?\\s*\\d{3}[\\s\\-]?\\d{4}$)",
      validChars : "[0-9 \\(\\)\\-]",
      toNeutral : function(text)
         {  
            // strip digits here
            return r;
         }
      toFormat : function(text)
         {
            var r = jTAC_PhoneNumberRegionData.UnitedStates.toNeutral(text);
            // insert separators here.
            return r;
         }
   }
}

This is designed so the user can expand the list of regions, by adding
new properties to the object, and replace elements of an individual RegionsData node if needed.
To add, you can use this:
object["regionname"] = {pattern: value, more properties};
To replace the pattern property:
object["regionname"].pattern = "pattern";

You can also create your own full RegionsData object and merge its properties
with the existing one like this:
jTAC.extend(your object, existing RegionsData object);

Set up:
Set the 'region' property to the name of the desired region, or to "" to 
select the 'defaultName' property which specifies the default region name.

You can also define the region globally by passing the region name
to window.jTAC.setGlobalRegionName(name).
Then assign 'region' to "GLOBAL" (all caps) to use its values.
This way, you can build a Country field that when changed, impacts all TypeManagers.
Then all validation will be applied to that region.
When doing this, ENSURE that all patterns objects support the names
you will be used in jTAC.regionName.
REMINDER: Server side validation must know to use the same region name.

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
   region (string) -
      One of the region names defined in 'regionsdata'.
      If "", it uses patterns.defaultName's value as the region name.
      You can include a mixture of regions by specifying a pipe delimited list
      of region names.
      It defaults to "".
   regionsData (object) - 
      The RegionData object as described above. Each subclass should
      assign a default here by overriding _defaultRegionsData().

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseString

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_BaseRegionString = {
   extend: "TypeManagers.BaseString",
   "abstract": true,

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      region: "",
      regionsData: null
   },

   configrules: {
   },

   /* 
   Returns the same value. If value is not a string, it is converted to a string
   using the javascript toString() method. If the value is null, this returns null.
   */
   _nativeToString: function (value) {
      if (value == null)
         return "";
      var text = value.toString();
      if (text == "")
         return "";
      var rd = this._getRegionNode(text);
      if (!rd)
         this._inputError("Invalid " + this.dataTypeName());
      if (rd.toFormat) {
         text = rd.toFormat(text);
      }
      return text;
   },



   _reviewValue: function (text)
   {
      text = this.callParent([text]);
      if (text == "")
         return text;
      var obj = this._getRegionNode(text);
      if (!obj)
         this._inputError("Invalid " + this.dataTypeName() + " [" + text + "]");

      return text;
   },

   // Digits and the optional allowSeps value.
   isValidChar: function (chr) {
      if (!this.callParent([chr])) {
         return false;
      }
      var rds = this._selectRegionNodes();
      if (!rds.length) {
         return true;   // no data to validate. So allow all characters
      }
      for (var i = 0; i < rds.length; i++) {
         var rd = rds[i];
         if (!rd.validChar)   // if any have no filtering capability, then all have no filtering capability   
            return true;
         if (typeof rd.validChar == "string") {
            var re = this._cache.validCharRE;
            if (!re)
               re = this._cache = new RegExp(rd.validChar);
            return re.test(chr);
         }
         if (rd.validChar(chr)) {
            return true;
         }
      }  // for
      return false;
   },

   /* 
   Uses the RegionData.toNeutral function if available.
   Otherwise returns the original text.
   Exception: text does not match any validation patterns.
   */
   toValueNeutral: function (text) {
      if (!text) {
         return "";
      }
      try
      {
         this._pushContext();

         var rn = this._getRegionNode(text);
         if (!rn)
            this._inputError("Invalid " + this.dataTypeName() + " [" + text + "]");
         if (rn.toNeutral)
            text = rn.toNeutral(text);
         return text;
      }
      finally {
         this._popContext();
      }
   },



   /*
   Returns an array of 0 or more RegionData objects based on the region property.
   The caller will generally go through this to apply each rule.
   */
   _selectRegionNodes: function () {
      function add(n) {
         var names = n.split('|');
         var rd = this.getRegionsData();
         for (var i = 0; i < names.length; i++)
         {
            var rn = rd[names[i]];
            if (!rn)
               this._error("Region [" + names[i] + "] not defined in the regionsData object.");
            if (typeof rn == "string") {
               add.call(this, rn);   //!RECURSION
               continue;
            }
            if (typeof rn == "object") {
               r.push(rn);
            }
            else
               this._error("Region [" + rn + "] definition invalid.");
         }  // for
      }
      var rds = this._internal.rds;
      if (!rds || (this._internal.rdc != jTAC._globalRegionNameCount))
      {
         var name = this.getRegion();
         if (name == "")
            name = this.getRegionsData().defaultName;
         if (name == "GLOBAL")
            name = jTAC._globalRegionName;
         if (!name)
            this._error("Could not identify a region name from the region property.");
         var r = [];
         add.call(this, name);
         rds = this._internal.rds = r;
         this._internal.rdc = jTAC._globalRegionNameCount;
      }
      return rds;
   },


   /* 
   Gets an object from the patterns based on the region name.
   There can be multiple region names. The text parameter is used
   to match to a region's pattern to identify it as the correct object
   to return. If text is "", the first object from the region name list is returned.
   If the text does not match anything, it returns null.
   */
   _getRegionNode: function (text) {
      var regionNodes = this._selectRegionNodes();
      for (var i = 0; i < regionNodes.length; i++) {
         var regionNode = regionNodes[i];
         if (!text)  // no text, return the first
            return regionNode;
         if (typeof regionNode.pattern == "function") { // alternative way to supply the pattern. Function is passed text and returns true if valid.
            if (regionNode.call(this, text))
               return regionNode;
         }
         else {
            var re = new RegExp(this._resolvePattern.call(this, regionNode), regionNode.caseIns ? "i" : "");
            if (re.test(text))
               return regionNode;
         }
      }
      return null;   // not found
   },

   /*
   Gets the regular expression pattern from the region data object passed.
   This gets it from the pattern property.
      rn (object) - A region node object from the regionData.
   */
   _resolvePattern: function (rn) {
      return rn.pattern;
   },

/* ABSTRACT METHOD
Override to supply the RegionData object. 
*/
   _defaultRegionsData: function() {
      this._AM();
   },

   /* STATIC METHOD
   Utility to format text that has none of its formatting characters.
   It replaces elements of the mask parameter that have the "#" character
   with digits from the text and returns the result.
      text (string) - Neutral text. Should be digits. Any existing formatting
         is ignored.
      mask (string) - Pattern of the mask. Digits replace the "#"
         elements either in forward or reverse direction based on dir.
      dir (boolean) - When true, replace from left to right.
         When false, replace from right to left.
      unused (string) - Text to use when there are remaining "#" symbols
         after all of 'text' has been used.
   Returns: formatted text.
   To call this from anywhere, use:
   jTAC.TypeManagers.BaseRegionString.prototype.applyNumberMask(parameters)
   */
   applyNumberMask: function(text, mask, dir, unused) {
      var t = dir ? 0 : text.length - 1;   // current position in text being extracted
      var m = dir ? 0 : mask.length - 1;  // current position in mask being replaced
      var inc = dir ? 1 : -1; // how to increment t and m
      var lt = dir ? text.length : -1; // last position of text + 1
      var lm = dir ? mask.length - 1 : 0; // last position of mask

      var r = ""; // result
   // go through the mask. Add each char to r that is not a "#"
   // When "#", get the next digit from text.
      for (var i = m; dir ? i <= lm : i >= lm; i = i + inc) {
         var chr = mask.charAt(i);
         if (chr == "#") {
            // get the next digit from text.
            // Skip anything in text that is not a digit.
            // If exceeding the number of available text digits, substitute 'unused'.
            do {
               if (t == lt) {
                  chr = unused;
                  break;
               }
               chr = text.charAt(t);
               t = t + inc;
            } while ((chr < "0") || (chr > "9"));

         }
         if (dir) {
            r = r + chr;
         }
         else {
            r = chr + r;
         }
      }  // for

      if (t != lt) {   // have extra characters in text. They need to be included
         for (var i = t; dir ? i < lt : i > lt; i = i + inc) {
            var chr = text.charAt(i);
            if ((chr >= "0") && (chr <= "9")) {
               if (dir) {
                  r = r + chr;
               }
               else {
                  r = chr + r;
               }
            }  // if
         }  // for
      }  // if

      return r;

   },


   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

   /*
   One of the region names defined in patterns.
   If "", it uses patterns.defaultName's value as the region name.
   You can include a mixture of regions by specifying a pipe delimited list
   of region names.
   If "GLOBAL", it uses the value set by jTAC.setGlobalRegionName().
   It defaults to "".
   */
   setRegion: function (val)
   {
      this.config.region = jTAC.checkAsStr(val);
      this._internal.rds = null; // clear cached region array
   },

   getRegionsData: function()
   {
      var rd = this.config.regionsData;
      if (!rd)
         rd = this.config.regionsData = this._defaultRegionsData();
      return rd;
   },

   setRegionsData: function(val)
   {
      if (typeof(val) != "object")
         this._error("RegionsData must be an object");
      this.config.regionsData = val;
   }
}
jTAC.define("TypeManagers.BaseRegionString", jTAC._internal.temp._TypeManagers_BaseRegionString);



/* --- EXTENSIONS TO jTAC GLOBAL -------------------------- */
/*
The region name to use when a TypeManager's 'region' property is set to "GLOBAL".
Update this value when you are using an editable Country field.
Always assign a region name defined in the RegionsData object
and be sure that all RegionsData objects have that region.
You may have to convert a value stored in the country field into a 
different value for the region name.
*/
jTAC.setGlobalRegionName = function (region)
{
   jTAC._globalRegionName = region;
   jTAC._globalRegionNameCount++;
}
jTAC._globalRegionName = null; // if this is changed, always increment jTAC._globalRegionNameCount. (Hint: Use jTAC.setGlobalRegionName)
// Each time jTAC._globalRegionName is changed, jTAC._globalRegionNameCount must be incremented.
// TypeManagers.BaseRegionString._selectRegionNodes() saves this value locally.
// If a call to _selectRegionNodes finds this to differ from its local copy, it abandons the cached value.
jTAC._globalRegionNameCount = 0;
﻿// jTAC/TypeManagers/String.js
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
Class : TypeManger.String
Extends: TypeManagers.BaseString

Purpose:
For any string. There are other TypeManagers that host strings,
and can look for specific features of that string to ensure it reflects
a specific type of string data, such as phone number or postal code.
Always consider using the most specific TypeManager if available.

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
   caseIns (boolean) - 
      When true, use case insensitive comparison in the compare() method.
      It defaults to false.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseString

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_String = {
   extend: "TypeManagers.BaseString",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      caseIns: false
   },


   dataTypeName : function () {
      return "string";
   },

/*
Tells compare() if it needs to do a case sensitive or insensitive match.
When true, it is case insensitive.
*/
   _isCaseIns : function() {
      return this.config.caseIns;
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("TypeManagers.String", jTAC._internal.temp._TypeManagers_String);
jTAC.defineAlias("String", "TypeManagers.String");
jTAC.defineAlias("String.caseins", "TypeManagers.String", {caseIns: true});

﻿// jTAC/TypeManagers/EmailAddress.js
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
Class : TypeManger.EmailAddress
Extends: TypeManagers.BaseStrongPatternString

Purpose:
Validates the pattern of an Email address.
You can optionally support multiple email addresses, defining
the desired delimiters between them.

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
   multiple (boolean) -
      Determines if multiple email addresses are permitted.
      When true, they are.
      It defaults to false.
   delimiterRE (string) - 
      A regular expression pattern that determines the delimiter
      between multiple email addresses.
      As a regular expression, be sure to escape any character
      that must be a kept as is.
      It defaults to ";[ ]?". It permits an optional space.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseString
TypeManagers.BaseStrongPatternString

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_EmailAddress = {
   extend: "TypeManagers.BaseStrongPatternString",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      multiple: false,
      delimiterRE : ";[ ]?"
   },


   dataTypeName : function () {
      return "EmailAddress";
   },

/* 
Builds a pattern from the properties.
*/
   _regExp : function() {
      var re = "^" + this._addressRE;
      if (this.getMultiple()) {
         re += "(" + this.getDelimiterRE() + this._addressRE + ")*";
      }
      re += "$";

      return new RegExp(re, "i");
   },

/*
Regular expression pattern for an email address.
It lacks ^ and $ to allow its reuse in multiple email addresses.
Those characters will be added by _regExp().

A good way to override this globally is to add a script that
sets this in the prototype of the class you are modifying:
jTAC.TypeManagers.EmailAddress.prototype._addressRE = "pattern";

If you prefer the pattern used by jquery-validate's "email" rule, here it is:
    ((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?

*/
   _addressRE : "([\\w\\.!#\\$%\\-+.'_]+@[A-Za-z0-9\\-]+(\\.[A-Za-z0-9\\-]{2,})+)"


   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("TypeManagers.EmailAddress", jTAC._internal.temp._TypeManagers_EmailAddress);
jTAC.defineAlias("EmailAddress", "TypeManagers.EmailAddress");
jTAC.defineAlias("EmailAddress.Multiple", "TypeManagers.EmailAddress", {multiple: true});

﻿// jTAC/TypeManagers/PhoneNumber.js
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
Class : TypeManger.PhoneNumber
Extends: TypeManagers.BaseRegionString

Purpose:

Validates the pattern of a phone number.
Supports regional patterns of phone numbers, as defined in
window.jTAC_PhoneNumberRegionsData field.
To add, you can use this:
window.jTAC_PhoneNumberRegionsData["regionname"] = {pattern: value, more properties};
To replace the pattern property:
window.jTAC_PhoneNumberRegionsData["regionname"].pattern = "pattern";

You can also create your own full RegionsData object and merge its properties
with the existing one like this:
jTAC.extend(your object, window.jTAC_PhoneNumberRegionsData);

Set the 'region' property to the name of the desired region, or to "" to 
select the 'defaultName' property which specifies the default region name.

Example of multiple regions: "NorthAmerica|CountryCode".

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
   supportsExt (boolean) -
      When true, the string can contain the extension.
      It defaults to false.
      Extensions insert their RegExp pattern into the main pattern before "$)".
      There is a default pattern for most extensions, but a region
      can override it with the 'extensionRE' property in its object.
      That will contain the regular expression pattern for the extension.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseString
TypeManagers.BaseRegionString

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_PhoneNumber = {
   extend: "TypeManagers.BaseRegionString",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      supportsExt: false
   },

   dataTypeName : function () {
      return "PhoneNumber";
   },
/*
   Gets the regular expression pattern from the region data object passed.
   This gets it from the pattern property.
*/
   _resolvePattern: function(regionNode) {
      var r = regionNode.pattern;

      if (this.getSupportsExt())
      {
   // insert the extension's regexp before any "$)" element.
         var ext = regionNode.extensionRE || "(\\s?\\#\\d{1,10})?";

         r = jTAC.replaceAll(r, "\\$\\)", ext + "$)", false);
      }

      return r;
   },

   _defaultRegionsData: function()
   {
      return window.jTAC_PhoneNumberRegionsData;
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("TypeManagers.PhoneNumber", jTAC._internal.temp._TypeManagers_PhoneNumber);
jTAC.defineAlias("PhoneNumber","TypeManagers.PhoneNumber"); 
jTAC.defineAlias("PhoneNumber.NorthAmerica", "TypeManagers.PhoneNumber", {region:"NorthAmerica"}); 
jTAC.defineAlias("PhoneNumber.NorthAmerica.CountryCode", "TypeManagers.PhoneNumber", {region:"NorthAmerica|CountryCode"}); 
jTAC.defineAlias("PhoneNumber.UnitedStates", "TypeManagers.PhoneNumber", {region:"UnitedStates"}); 
jTAC.defineAlias("PhoneNumber.UnitedKingdom", "TypeManagers.PhoneNumber", {region:"UnitedKingdom"}); 
jTAC.defineAlias("PhoneNumber.France", "TypeManagers.PhoneNumber", {region:"France"}); 
jTAC.defineAlias("PhoneNumber.Japan", "TypeManagers.PhoneNumber", {region:"Japan"}); 
jTAC.defineAlias("PhoneNumber.Germany", "TypeManagers.PhoneNumber", {region:"Germany"}); 
jTAC.defineAlias("PhoneNumber.China", "TypeManagers.PhoneNumber", {region:"China"}); 
jTAC.defineAlias("PhoneNumber.Canada", "TypeManagers.PhoneNumber", {region:"Canada"}); 


/*
Used by TypeManagers.PhoneNumber as its default RegionsData.
Defines the regions and their patterns, with the regionname
as the property name and phone number pattern as the value of the property.
Here is a good resource for building these patterns:
http://www.itu.int/oth/T0202.aspx?parent=T0202

To add a region, you can use this:
window.jTAC_PhoneNumberRegionsData["regionname"] = {pattern: value, more properties};
To replace the pattern property in a region:
window.jTAC_PhoneNumberRegionsData["regionname"].pattern = "pattern";

You can also create your own full RegionsData object and merge its properties
with the existing one like this:
jTAC.extend(your object, window.jTAC_PhoneNumberRegionsData);

Finally you can substitute your own RegionsData object by setting it to the
TypeManagere.PhoneNumber.regionsData property.

*/
var jTAC_PhoneNumberRegionsData = {
   // This specifics which of the other properties is used when you don't assign the regionName
   defaultName: "Any",

   
   Any: {
      name: "Any",
      pattern: "(^\\+?\\d([\\-\\.]?\\d){6,19}$)",// optional +, 7 to 20 digits, with optional dash or period between digits
      validChar: "[0-9\\+\\-\\.]"
   },

   // requires a country code preceded by +. http://blog.stevenlevithan.com/archives/validate-phone-number
   CountryCode: {  
      name: "CountryCode",
   // +########. Between 7 and 15 digits, with lead and trailing digit. Single space separators allowed between digits
      pattern: "(^\\+(?:\\d ?){6,14}\\d$)",
      validChar: "[0-9\\+ ]"
   },

  
   NorthAmerica: { 
      name: "NorthAmerica",
   // 1(###) ####-####.  Formatting characters and lead 1 are optional.
      pattern: "(^([1])?[ ]?((\\([2-9]\\d{2}\\))|([2-9]\\d{2}))?[ ]?\\d{3}[ \\-]?\\d{4}$)",
      validChar: "[0-9\\+\\- \\(\\)]",
      toNeutral: function (text) { // keeps only digits
         var r = "";
         for (var i = 0; i < text.length; i++) {
            var chr = text.charAt(i);
            if ((chr >= "0") && (chr <= "9"))
               r += chr;
         }
         return r;
      },
      toFormat: function (text) {
         var that = jTAC_PhoneNumberRegionsData.NorthAmerica;
         var r = that.toNeutral(text);
         return jTAC.TypeManagers.BaseRegionString.prototype.applyNumberMask(r, that.formatMask, false, "");
      },

// Modify this mask if your business prefers a different format.
      formatMask : "#(###) ###-####"
   },

   UnitedStates: "NorthAmerica",
   Canada: "NorthAmerica",

   France: {
      name: "France",
   // 0# ## ### ### or 0# ## ## ## ##  or 0 ### ### ### or 0 ### ## ## ##   lead 2 digits are optional (0#)
      pattern: "(^(0( \\d|\\d ))?\\d\\d \\d\\d(\\d \\d| \\d\\d )\\d\\d$)",
      validChar: "[0-9 ]"
   },

   Japan: {
      name: "Japan",
     // 0#-#-#### or (0#) #-#### or #-####. Any single # can be 1-4 digits
      pattern: "(^(0\\d{1,4}-|\\(0\\d{1,4}\\) ?)?\\d{1,4}-\\d{4}$)",
      validChar: "[0-9\\- \\(\\)]"
   },

   Germany: {
      name: "Germany",
     // (0##) ## ## ## or (0###) # ## ## ## or (0####) # ##-## or (0####) # ##-# or # ## ## ##
      pattern: "(^((\\(0\\d\\d\\) |(\\(0\\d{3}\\) )?\\d )?\\d\\d \\d\\d \\d\\d|\\(0\\d{4}\\) \\d \\d\\d-\\d\\d?)$)",
      validChar: "[0-9\\- \\(\\)]"
   },

   China: {
      name: "China",
      // (###)######## or ###-######## or ########
      pattern: "(^(\\(\\d{3}\\)|\\d{3}-)?\\d{8}$)",
      validChar: "[0-9\\- \\(\\)]"
   },

   UnitedKingdom: {  
      name: "UnitedKingdom",
      // reference: http://en.wikipedia.org/wiki/Telephone_numbers_in_the_United_Kingdom
      // expression source: http://regexlib.com/REDetails.aspx?regexp_id=593
      // +44 #### ### ### or 0#### ### ### or +44 ### ### #### or 0### ### #### or +44 ## #### #### or 0## #### ####
      pattern: "(^(((\\+44\\s?\\d{4}|\\(?0\\d{4}\\)?)\\s?\\d{3}\\s?\\d{3})|((\\+44\\s?\\d{3}|\\(?0\\d{3}\\)?)\\s?\\d{3}\\s?\\d{4})|((\\+44\\s?\\d{2}|\\(?0\\d{2}\\)?)\\s?\\d{4}\\s?\\d{4}))$)",
      validChar: "[0-9\\+ \\(\\)]"
   }
}

﻿// jTAC/TypeManagers/PostalCode.js
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
Class : TypeManger.PostalCode
Extends: TypeManagers.BaseRegionString

Purpose:

Validates the pattern of a postal code.
Supports regional patterns of postal codes, as defined in
window.jTAC_PostalCodeRegionsData field.
To add, you can use this:
window.jTAC_PostalCodeRegionsData["regionname"] = {pattern: value, more properties};
To replace the pattern property:
window.jTAC_PostalCodeRegionsData["regionname"].pattern = "pattern";

You can also create your own full RegionsData object and merge its properties
with the existing one like this:
jTAC.extend(your object, window.jTAC_PostalCodeRegionsData);

Set the 'region' property to the name of the desired region, or to "" to 
select the 'defaultName' property which specifies the default region name.

Example of multiple regions: "America|Canada".

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
None

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseString
TypeManagers.BaseRegionString

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_PostalCode = {
   extend: "TypeManagers.BaseRegionString",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      supportsExt: false
   },

   dataTypeName : function () {
      return "PostalCode";
   },

   _defaultRegionsData: function()
   {
      return window.jTAC_PostalCodeRegionsData;
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("TypeManagers.PostalCode", jTAC._internal.temp._TypeManagers_PostalCode);

jTAC.defineAlias("PostalCode","TypeManagers.PostalCode"); 
jTAC.defineAlias("PostalCode.NorthAmerica", "TypeManagers.PostalCode", {region:"NorthAmerica"}); 
jTAC.defineAlias("PostalCode.UnitedStates", "TypeManagers.PostalCode", {region:"UnitedStates"}); 
jTAC.defineAlias("PostalCode.UnitedKingdom", "TypeManagers.PostalCode", {region:"UnitedKingdom"}); 
jTAC.defineAlias("PostalCode.France", "TypeManagers.PostalCode", {region:"France"}); 
jTAC.defineAlias("PostalCode.Japan", "TypeManagers.PostalCode", {region:"Japan"}); 
jTAC.defineAlias("PostalCode.Germany", "TypeManagers.PostalCode", {region:"Germany"}); 
jTAC.defineAlias("PostalCode.China", "TypeManagers.PostalCode", {region:"China"}); 
jTAC.defineAlias("PostalCode.Canada", "TypeManagers.PostalCode", {region:"Canada"}); 

/*
Used by TypeManagers.PostalCode as its default RegionsData.
Defines the regions and their patterns, with the regionname
as the property name and phone number pattern as the value of the property.
Here is a good resource for building these patterns:
http://www.itu.int/oth/T0202.aspx?parent=T0202

To add a region, you can use this:
window.jTAC_PostalCodeRegionsData["regionname"] = {pattern: value, more properties};
To replace the pattern property in a region:
window.jTAC_PostalCodeRegionsData["regionname"].pattern = "pattern";

You can also create your own full RegionsData object and merge its properties
with the existing one like this:
jTAC.extend(your object, window.jTAC_PostalCodeRegionsData);

Finally you can substitute your own RegionsData object by setting it to the
TypeManagere.PostalCode.regionsData property.

*/
var jTAC_PostalCodeRegionsData = {
   // This specifics which of the other properties is used when you don't assign the regionName
   defaultName: "UnitedStates|Canada",

   UnitedStates:  { 
      name: "UnitedStates",
      pattern: "(^(\\d{5}-\\d{4}|\\d{5})$)",
      validChar : "[0-9\\-]"
   },

   Canada:  {
      name: "Canada",

      // resource: http://www.dreamincode.net/code/snippet3209.htm, http://www.itsalif.info/content/canada-postal-code-us-zip-code-regex
      pattern: "(^[ABCEGHJ-NPRSTVXY]\\d[ABCEGHJ-NPRSTV-Z][ ]?\\d[ABCEGHJ-NPRSTV-Z]\\d$)",
//      pattern: "(^([A-Za-z]\\d[A-Za-z][ ]?\\d[A-Za-z]\\d$)",
      caseIns : true,
      validChar : "[0-9A-Za-z ]"
   },

   NorthAmerica: "UnitedStates|Canada",
/*
   NorthAmerica: {
      name: "NorthAmerica",
      pattern: function() {
         return jTAC_PostalCodeRegionsData.UnitedStates.pattern + "|" + jTAC_PostalCodeRegionsData.Canada.pattern;
      },
      validChar : "[0-9A-Za-z \\-]" // blends US and Canada digits
   },
*/
   UnitedKingdom:  {
      name: "UnitedKingdom",
      // resource: http://en.wikipedia.org/wiki/Postal_codes_in_the_United_Kingdom
      pattern: "(^(GIR 0AA|[A-PR-UWYZ]([0-9][0-9A-HJKPS-UW]?|[A-HK-Y][0-9][0-9ABEHMNPRV-Y]?) [0-9][ABD-HJLNP-UW-Z]{2})$)",
/*
      pattern: function() {
         return (!this.spacesOptional) ?
         //  this pattern demands spaces. 
            "(GIR 0AA|[A-PR-UWYZ]([0-9][0-9A-HJKPS-UW]?|[A-HK-Y][0-9][0-9ABEHMNPRV-Y]?) [0-9][ABD-HJLNP-UW-Z]{2})" :
          // spaces are optional.It can be used by assigning the property "spacesOptional" on the TypeManager
            "(GIR 0AA|[A-PR-UWYZ]([0-9][0-9A-HJKPS-UW]?|[A-HK-Y][0-9][0-9ABEHMNPRV-Y]?)[ ]?[0-9][ABD-HJLNP-UW-Z]{2})"; 
      },
*/
      validChar: "[0-9A-Z ]"
   },


   France: {
      name: "France",
      //#####
      pattern: "(^\\d{5}$)",
      validChar: "[0-9]"
   },

   Japan: {
      name: "Japan",
      //  ### or ###-#### or ###-##
      pattern : "(^\\d{3}(-(\\d{4}|\\d{2}))?$)",
      validChar : "[0-9\\-]"
   },

   Germany: {
      name: "Germany",
      pattern: "(^\\d{5}$)",
      validChar : "[0-9\\-D]"
   },

   China: {
      name: "China",
      pattern : "(^\\d{6}$)",
      validChar: "[0-9]"
   }
}

﻿// jTAC/TypeManagers/CreditCardNumber.js
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
Class : TypeManger.CreditCardNumber
Extends: TypeManagers.BaseString

Purpose:
Validates a credit card number against Luhn's algorithm.
In addition, it can limit the brand of the credit card supported
and allow optional spaces.
By default it limits brands. If you want to include all possible
credit cards, set the brands property to null or use the alias "CreditCardNumber.AllBrands".

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
   brands (array) -
      Defines the signatures of various brands of credit cards.
      These are checked if defined. To disable this feature,
      assign brands to null.
      This list is prepopulated with populate cards. Add, edit, and delete
      as needed.
      Each item of the array is a javascript object with these properties:
         len (int) - If defined, it is the exact number of digits allowed.
         prefix (string) - A pipe delimited list of digits that
            start the credit card number and are used to identify the brand.
   allowSeps (char) -
      Assign to a single character that is a legal value for the user
      to use while typing, such as space or minus.
      It defaults to "" (which means not allowed).

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseString

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_CreditCardNumber = {
   extend: "TypeManagers.BaseString",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      brands:
         [{len: 16, prefix: '51|52|53|54|55'}, // Mastercard
          {len: 13, prefix: '4'}, // Visa-13char
          {len: 16, prefix: '4'}, // Visa-16char
          {len: 15, prefix: '34|37'}, // American Express
          {len: 14, prefix: '300|301|302|303|305|36|38'}, // Diners Club/Carte Blanche
          {len: 16, prefix: '6011'} // Discover
         ],
      allowSeps: ""

   },

   configrules: {
   },

   dataTypeName : function () {
      return "CreditCardNumber";
   },

/* 
Returns the same string passed in, but reports errors based on
the validation rules.

NOTE: This code is adapted from Peter's Data Entry Suite's CreditCardNumberValidator.
It is used here by permission from the author of that product.
*/
   _reviewValue : function(text) {
      if (text == "")
         return "";
      var as = this.getAllowSeps();
      if (as) {  // allow spaces. Strip out the spaces here to evaluate
         text = jTAC.replaceAll(text, as, "", true);
      }

      var len = text.length;
      if (len < 10)
         this._inputError("Not enough digits");   // under 10 is immediately rejected
      
   // must be all digits
      if (!/^(\d+)$/.test(text))
         this._inputError("Illegal character");

      var brands = this.getBrands();
      if (brands) {
   // match the length to elements in brands
         var fd = 0;  // found
         for (var i = 0; i < brands.length; i++) {
            var brand = brands[i];
         // elements in brands are objects with two properties:
         // len: the number length; prefix: a Regular expression to check the prefixes
            if (brand.len == len) {
               var re = new RegExp("^(" + brand.prefix + ")", "i");
               if (re.test(text)) {
                  fd = 1;
                  break;
               }
            }
         }  // for
         if (!fd)   // length not found
            this._inputError("Brand mismatch");
      }

   // perform Luhn's formula.
   // 1. Double the value of alternating digits starting from the second to last and going backward.
   // 2. Add the digits formed in step one. For example, starting with 7, we'd get 14 and add 1+4 here
   // 3. Add the alternating digits starting from the last. (This never uses the digits from step 1)
   // 4. Add the results of steps 2 and 3. If the result evenly divides by 10, success.
      var t = 0; // total
      var normal = true;   // when true, adding normal. False, adding after doubling.
      for (var i = len - 1; i >= 0; i--) {
         var d = parseInt(text.charAt(i), 10); // convert textual digit into number
         if (normal) {   // step 3
            t += d;
         }
         else {  // step 1 and 2
            d = d * 2;
            if (d > 9)
               t += 1 + (d % 10);   // doubled is between 10 and 19. '1' + the trailing digit
            else
               t += d;
         }
         normal = !normal;
      }  // for

      if (t % 10 != 0)
         this._inputError("Failed Luhns");

      return text;
   },

// Digits and the optional allowSeps value.
   isValidChar : function (chr)
   {
      if (!this.callParent([chr]))
         return false;
      if (this.getAllowSeps() == chr)
         return true;
      return "1234567890".indexOf(chr) > -1;
   },

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/
   /*
   brands property: SET function
   */
   setBrands : function (val)
   {
      if ((val instanceof Array) || (val == null))
         this.config.brands = val;
      else
         this._error("Parameter must be an array or null.");
   },

   /*
   allowSeps property: SET function
      Assign to a single character that is a legal value for the user
      to use while typing, such as space or minus.
      It defaults to "" (which means not allowed).
   */
   setAllowSeps : function (val)
   {
      if ((typeof val == "string") && (val.length <= 1))
         this.config.allowSeps = val;
      else
         this._error("Parameter must be a 1 character string.");
   }

}
jTAC.define("TypeManagers.CreditCardNumber", jTAC._internal.temp._TypeManagers_CreditCardNumber);
jTAC.defineAlias("CreditCardNumber", "TypeManagers.CreditCardNumber");
jTAC.defineAlias("CreditCardNumber.AllBrands", "TypeManagers.CreditCardNumber", {brands: null});
﻿// jTAC/TypeManagers/Url.js
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
Class : TypeManger.Url
Extends: TypeManagers.BaseStrongPatternString

Purpose:
Validates the pattern of a URL.
Offers numerous options to select the parts of a URL
supported, which uri schemes, and which domain name extensions you allow.

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
   uriScheme (string) -
      A pipe delimited list of valid Uri Schemes.
      These are "http", "https", "ftp", etc.
      It defaults to "http|https".

   domainExt (string) - 
      A pipe delimited list of domain extensions, ignoring the country part.
      For example: "com|co|edu". Do not use "co.uk" as it contains a specific country part.
      To allow all, set to "".
      Defaults to "aero|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|travel|jobs|mobi|pro|co".

   supportsIP (boolean) - 
      When true, allow the domain name part to be an IP address instead of a domain name.
      It defaults to false.

   supportsPort (boolean) - 
      When true, allow the port number to be specified.
      It defaults to false.

   supportsPath (boolean) - 
      When true, allow a path after the domain name.
      It defaults to true.

   requireUriScheme (boolean) - 
      When true, there must be a Uri Scheme.
      It defaults to true.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseString
TypeManagers.BaseStrongPatternString

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_URL = {
   extend: "TypeManagers.BaseStrongPatternString",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      uriScheme: "http|https",
      domainExt: "aero|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|travel|jobs|mobi|pro|co",
      supportsIP: false,
      supportsPort: false,
      supportsPath: true,
      requireUriScheme: true
   },

   configrules: {
   },

   dataTypeName : function () {
      return "Url";
   },

/* 
Builds a pattern from the properties.
*/
   _regExp : function() {
      var re = "^((?:" + this.getUriScheme() + ")\\://)";
      if (!this.getRequireUriScheme())
         re += "?";
      if (this.getSupportsIP()) {
         re += "((";
      }
      re += this._domainRE;
      var de = this.getDomainExt();
      if (!de) {
         de = this._defDomainExt;
      }
      re += this._domainExtRE.replace("{DE}", de);
      if (this.getSupportsIP()) {
         re += ")|(" + this._IPAddressRE + "))";
      }

      if (this.getSupportsPort()) {
         re = re + this._portRE;
      }
      if (this.getSupportsPath()) {
         re += "/?(" + this._filePathRE + ")?";
      }
      else {
         re += "/?";
      }
      re += "$";

      return new RegExp(re, "i");
   },

/* ---------------------------------------------------------------  
The following fields ending in "RE" allows overriding their regular expression pattern.
A good way to override this globally is to add a script that
sets this in the prototype of the class you are modifying:
jTAC.TypeManagers.Url.prototype._domainRE = "pattern";
*/

/*
Regular expression pattern for a domain name.
*/
   _domainRE : "[a-zA-Z0-9\\-\\.]+",

/*
Regular expression pattern for a domain name.
*/
   _IPAddressRE : "(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|0?[1-9]{1}[0-9]{1}|0{0,2}[1-9])\\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|0?[1-9]{1}[0-9]{1}|0{0,2}[1-9]|0)\\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|0?[1-9]{1}[0-9]{1}|0{0,2}[1-9]|0)\\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|0?[1-9]{1}[0-9]{1}|0{0,2}[0-9])",  // see http://www.regexlib.com/REDetails.aspx?regexp_id=32

/*
Regular expression pattern for a domain name extension.
Use the token {DE} to be replaced by the value of the domainExt property.
*/
   _domainExtRE : "(?:\\.[a-z]{2})?\\.(?:{DE})(?:\\.[a-z]{2})?",  // NOTE: {DE} is a token that is replaced by the validDomainExt property.

/*
Used in the {DE} token of the _domainExtRE when _domainExt is "".
*/
   _defDomainExt : "[a-zA-Z]{2,3}",
/*
Regular expression pattern for a port number.
*/
   _portRE : "(?:\\:\\d+)?",

/*
Regular expression pattern for a file path after the domain name.
*/
   _filePathRE : "(?:/[a-zA-Z0-9_/%\\$#~][a-zA-Z0-9\\-\\._\\'/\\+%\\$#~]+[A-Za-z0-9])*" // exclude white space, \, ?, &, and =


   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("TypeManagers.Url", jTAC._internal.temp._TypeManagers_URL);
jTAC.defineAlias("Url", "TypeManagers.Url");
jTAC.defineAlias("Url.FTP", "TypeManagers.Url", {uriScheme:"ftp"});

﻿// jTAC/TypeManagers/Boolean.js
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
Class : TypeManger.Boolean
Extends: TypeManagers.Base

Purpose:
Handles boolean types. Often used with
Condition.CompareToValue to compare a boolean value to
the value of a checkbox or radiobutton.

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
   reFalse (string or regex) - 
      Regular expression used to convert a string into false.
      Must match valid strings representing "false".
      Can pass either a RegExp object or a string that is a valid
      regular expression pattern. 
      Defaults to ^((false)|(0))$

   reTrue (string or regex) - 
      Regular expression used to convert a string into true.
      Must match valid strings representing "true".
      Can pass either a RegExp object or a string that is a valid
      regular expression pattern. 
      Defaults to ^((true)|(1))$

   numFalse (array of integers) -
      Array of numbers representing false.
      If null or an empty array, no numbers match.
      Defaults to [0]

   numTrue (array of integers or true) -
      Array of numbers representing true.
      If null or an empty array, no numbers match.
      If true, then all numbers not defined in numFalse match.
      Defaults to [1]

   falseStr (string) -
      The string representing "false". Defaults to "false".

   trueStr (string) -
      The string representing "true". Defaults to "true".

   emptyStrFalse (boolean) - 
     When true, the empty string represents false in the toValue function.
     It defaults to true.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_Boolean = {
   extend: "TypeManagers.Base",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      reFalse: /^((false)|(0))$/i, // the last () represents the empty string
      reTrue: /^((true)|(1))$/i,
      numFalse: [0],   // array of numbers that match to false
      numTrue: [1], // array of numbers that match to true. Also valid: true to match all numbers not in numFalse.

      falseStr: "false",  // returned by _nativeToString for false
      trueStr: "true",  // returned by _nativeToString for true

      emptyStrFalse: true
   },

   configrules: {
      reFalse: jTAC.checkAsRegExp,
      reTrue: jTAC.checkAsRegExp

   },

   nativeTypeName : function () {
      return "boolean";
   },


   dataTypeName : function () {
      return "boolean";
   },

   storageTypeName : function () {
      return "boolean";
   },

   /* 
    Returns the strings defined in the falseStr and trueStr properties.
    Assumes the value is a boolean. If not, its still evaluated as if it was
    a boolean.
   */
   _nativeToString : function (value) {
      return value ? this.getTrueStr() : this.getFalseStr();
   },

   /*
    By default, converts the following to FALSE:
    false, "false" (case insenstive), 0, "0", and "".
    Converts the following for TRUE:
    true, "true" (case insensitive), 1, "1"
    If you want to change the rules of string matching,
    change the regular expressions in reFalse and reTrue.
    To change the rules of number matching, change
    the numFalse and numTrue properties.
   */
   toValue : function (text) {
      if (typeof (text) == "number")
         return this._numberToBoolean(text); 
      return this.callParent([text]);
   },


   /*
    Uses the regular expressions in reFalse and reTrue
    to identify supported strings that convert to false or true.
   */
   _stringToNative : function (text) {
      if (text == "")
      {
         if (this.getEmptyStrFalse())
            return false;
         this._error("Empty string is not permitted when emptyStrFalse = false.");
      }
      else
      {
         var re = this.getReFalse();
         if (re && re.test(text))
            return false;
         re = this.getReTrue();
         if (re && re.test(text))
            return true;
      }
      this._inputError("Could not convert the string '" + text + "' to a boolean.");
   },

   /*
   Returns true if the value represents null.
   This method allows null. if emptyStrFalse is false
   the empty string also means null.
   */
   _isNull : function (val) {
      if (val == "")
         return !this.getEmptyStrFalse();
      return val == null;
   },

   /*
   Used by toValue when the value is a number.
   Processes values identified by the rules of numFalse and numTrue properties.
   If it cannot process, it throws an exception.
   By default, it only supports 1 for true and 0 for false.
   */
   _numberToBoolean : function (num) {
      var nf = this.getNumFalse();
      if (nf && (nf.length > 0) && (nf.indexOf(num) > -1))
         return false;
      var nt = this.getNumTrue();
      if (nt) {
         if (nt === true)
            return true;
         if ((nt.length > 0) && (nt.indexOf(num) > -1))
            return true;
      }
      this._inputError("Could not convert the number " + num + " to a boolean.");
   },

   /* 
      Supports the strings "false" and "true" (case insensitive)
   */
   toValueNeutral : function (text) {
      if (typeof(text) == "boolean")
         return text;
      if (/^false$/i.test(text))
         return false;
      if (/^true$/i.test(text))
         return true;
      this._inputError("Required values: 'false' and 'true'");
   },


   /* 
      Conversion from native value to culture neutral string. "false" and "true"
   */
   toStringNeutral : function (val) {
      if (val == null)
         return "";
      return val ? "true" : "false";
   },

   /*
   Accepts all values, converting those that are not the correct type
   into a boolean.
   */
   _reviewValue : function (value) {
      return !!value;
   },

   /*
   Always returns true
   */
   isValidChar : function (chr) {
      return true;
   },

   /*
   Returns 1 or 0.
   */
   toNumber : function (value) {
      return value ? 1 : 0;
   },

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

   /*
     numFalse property: SET function
   */
   setNumFalse : function (numbers) {
      if (typeof(numbers) == "number")
         numbers = [ numbers ];
      this.config.numFalse = numbers;
   },

   /*
     numTrue property: SET function
   */
   setNumTrue : function (numbers) {
      if (typeof(numbers) == "number")
         numbers = [ numbers ];
      this.config.numTrue = numbers;
   }

}
jTAC.define("TypeManagers.Boolean", jTAC._internal.temp._TypeManagers_Boolean);

jTAC.defineAlias("Boolean", "TypeManagers.Boolean");
