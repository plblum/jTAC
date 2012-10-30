// jTAC/TypeManagers/Boolean.js
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
      Defaults to ^(false)|(0)$

   reTrue (string or regex) - 
      Regular expression used to convert a string into true.
      Must match valid strings representing "true".
      Can pass either a RegExp object or a string that is a valid
      regular expression pattern. 
      Defaults to ^(true)|(1)$

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
      reFalse: /^(false)|(0)$/i, // the last () represents the empty string
      reTrue: /^(true)|(1)$/i,
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
   Always returns false
   */
   isValidChar : function (chr) {
      return false;
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
