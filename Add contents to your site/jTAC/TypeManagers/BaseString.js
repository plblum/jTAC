// jTAC/TypeManagers/BaseString.js
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

