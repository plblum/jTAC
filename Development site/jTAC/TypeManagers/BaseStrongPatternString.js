// jTAC/TypeManagers/BaseStrongPatternString.js
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

