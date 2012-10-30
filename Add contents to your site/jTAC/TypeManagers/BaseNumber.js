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


