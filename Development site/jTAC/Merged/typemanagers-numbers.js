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

