// jTAC/TypeManagers/Integer.js
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

