// jTAC/TypeManagers/EmailAddress.js
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

