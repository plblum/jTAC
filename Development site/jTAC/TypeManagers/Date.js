// jTAC/TypeManagers/Date.js
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
Class : TypeManger.Date
Extends: TypeManagers.BaseDate

Purpose:
For date-only values. Only supports values that are javascript Date objects.

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
See \jTAC\TypeManagers\BaseDatesAndTimes.js.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseCulture
TypeManagers.BaseDatesAndTimes

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_Date = {
   extend: "TypeManagers.BaseDate",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },
   dataTypeName : function () {
      return "date";
   },

/*
   If it is a Date object with the year = 1, return true.
   If it is a string with a year of 1, return true.
   If it does not use the year, it only checks for null and the empty string.
*/
   _isNull : function (val) {
      var r = this.callParent([val]);
      if (r) 
         return true;
      return this._isNullYear(val);
   }


   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("TypeManagers.Date", jTAC._internal.temp._TypeManagers_Date);

jTAC.defineAlias("Date", "TypeManagers.Date");  
jTAC.defineAlias("Date.Short", "TypeManagers.Date");  
jTAC.defineAlias("Date.Abbrev", "TypeManagers.Date", {dateFormat: 10}); 
jTAC.defineAlias("Date.Long", "TypeManagers.Date", {dateFormat: 20});
