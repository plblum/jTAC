// jTAC/TypeManagers/Percent.js
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

