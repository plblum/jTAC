// jTAC/TypeManagers/Float.js
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
Class : TypeManger.Float
Extends: TypeManagers.BaseFloat

Purpose:
Supports float as the native type. Use for all decimal numbers
unless they are covered by another TypeManager (like Currency and Percent).

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
   NONE

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseCulture
TypeManagers.BaseNumber
TypeManagers.BaseFloat
One of the Culture engines, such as Culture engine using jTAC_Culture
or Culture engine using jquery-globalize.

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_Float = {
   extend: "TypeManagers.BaseFloat",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   dataTypeName : function () {
      return "float";
   },

   storageTypeName : function () {
      return "float";
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("TypeManagers.Float", jTAC._internal.temp._TypeManagers_Float);
jTAC.defineAlias("Float", "TypeManagers.Float");
jTAC.defineAlias("Float.Positive", "TypeManagers.Float", {allowNegatives: false});
