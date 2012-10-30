// jTAC/TypeManagers/BaseFloat.js
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

