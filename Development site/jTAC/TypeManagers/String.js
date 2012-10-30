// jTAC/TypeManagers/String.js
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
Class : TypeManger.String
Extends: TypeManagers.BaseString

Purpose:
For any string. There are other TypeManagers that host strings,
and can look for specific features of that string to ensure it reflects
a specific type of string data, such as phone number or postal code.
Always consider using the most specific TypeManager if available.

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
   caseIns (boolean) - 
      When true, use case insensitive comparison in the compare() method.
      It defaults to false.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseString

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_String = {
   extend: "TypeManagers.BaseString",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      caseIns: false
   },


   dataTypeName : function () {
      return "string";
   },

/*
Tells compare() if it needs to do a case sensitive or insensitive match.
When true, it is case insensitive.
*/
   _isCaseIns : function() {
      return this.config.caseIns;
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("TypeManagers.String", jTAC._internal.temp._TypeManagers_String);
jTAC.defineAlias("String", "TypeManagers.String");
jTAC.defineAlias("String.caseins", "TypeManagers.String", {caseIns: true});

