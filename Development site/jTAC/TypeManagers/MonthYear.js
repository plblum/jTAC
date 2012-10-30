// jTAC/TypeManagers/MonthYear.js
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
Class : TypeManger.MonthYear
Extends: TypeManagers.BaseDate

Purpose:
For date-only values where just the month and year are used. 
Only supports values that are javascript Date objects.
String patterns should only include the "M" and "y" symbols.
jquery-Globalize's culture.calendar.patterns provides the localized format
in its "Y" property.

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
See \jTAC\TypeManagers\BaseDatesAndTimes.js.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseCulture
TypeManagers.BaseDatesAndTimes
TypeManagers.BaseDate
----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_MonthYear = {
   extend: "TypeManagers.BaseDate",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   dataTypeName : function () {
      return "monthyear";
   },


/*
   Returns the number of months since year 0.
*/
   _dateToNumber : function (date) {
      return this.getUseUTC() ?
         date.getUTCFullYear() * 12 + date.getUTCMonth() :
         date.getFullYear() * 12 + date.getMonth();
   },


   _datePattern: function() {
      var name;
      switch (this.getDateFormat()) {
         case 0:
            name = "ShortMonthYearPattern";
            break;
         case 1:
         case 2:
            name = "ShortMonthYearPatternMN";
            break;
         case 10:
            name = "AbbrMonthYearPattern";
            break;
         case 20:
            name = "LongMonthYearPattern";
            break;
         case 100:
            return "yyyy-MM";
         default:
            return "";
      }  // switch
      return this.dateTimeFormat(name);
   },

   _skipDatePart: function() {
      return "d";
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/


}
jTAC.define("TypeManagers.MonthYear", jTAC._internal.temp._TypeManagers_MonthYear);

jTAC.defineAlias("MonthYear", "TypeManagers.MonthYear");  
jTAC.defineAlias("MonthYear.Short", "TypeManagers.MonthYear");  
jTAC.defineAlias("MonthYear.Abbrev", "TypeManagers.MonthYear", {dateFormat: 10}); 
jTAC.defineAlias("MonthYear.Long", "TypeManagers.MonthYear", {dateFormat: 20});
