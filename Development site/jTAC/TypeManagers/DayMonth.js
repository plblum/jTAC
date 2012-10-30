// jTAC/TypeManagers/DayMonth.js
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
Class : TypeManger.DayMonth
Extends: TypeManagers.BaseDate

Purpose:
For date-only values where just the day and month are used, such
as a birthday or anniversary.
Only supports values that are javascript date objects.
String patterns should only include the "M" and "d" symbols.
jquery-Globalize's culture.calendar.patterns provides the localized format
in its "M" property.

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
jTAC._internal.temp._TypeManagers_DayMonth = {
   extend: "TypeManagers.BaseDate",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
   },

   configrules: {
   },

   dataTypeName : function () {
      return "daymonth";
   },

/*
   Returns the number of days into the year 2012 (which was chosen because its a leap year).
*/
   _dateToNumber : function (date) {
      var date = this.getUseUTC() ? // create a local date using the year 2012
         new Date(2012, date.getUTCMonth(), date.getUTCDate()) :
         new Date(2012, date.getMonth(), date.getDate());
      return this.callParent([date]);
   },


   _datePattern: function() {
      var name;
      switch (this.getDateFormat()) {
         case 0:
            name = "ShortMonthDayPattern";
            break;
         case 1:
         case 2:
            name = "ShortMonthDayPatternMN";
            break;
         case 10:
            name = "AbbrMonthDayPattern";
            break;
         case 20:
            name = "LongMonthDayPattern";
            break;
         case 100:
            return "MM-dd";
         default:
            return "";
      }  // switch
      return this.dateTimeFormat(name);
   },

   _skipDatePart: function() {
      return "y";
   }


   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/


}
jTAC.define("TypeManagers.DayMonth", jTAC._internal.temp._TypeManagers_DayMonth);

jTAC.defineAlias("DayMonth", "TypeManagers.DayMonth");  
jTAC.defineAlias("DayMonth.Short", "TypeManagers.DayMonth");  
jTAC.defineAlias("DayMonth.Abbrev", "TypeManagers.DayMonth", {dateFormat: 10}); 
jTAC.defineAlias("DayMonth.Long", "TypeManagers.DayMonth", {dateFormat: 20});
