// jTAC/TypeManagers/Currency.js
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

