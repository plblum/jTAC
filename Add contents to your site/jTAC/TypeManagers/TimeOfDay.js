// jTAC/TypeManagers/TimeOfDay.js
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
Class : TypeManger.TimeOfDay
Extends: TypeManagers.BaseTime

Purpose:
For time-only values which represent the time of day. Supports both javascript Date objects
and numbers depending on the valueAsNumber property.
Enforces a maximum of 24 hours.

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
See \jTAC\TypeManagers\BaseDatesAndTimes.js.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseCulture
TypeManagers.BaseDatesAndTimes
TypeManagers.BaseTime
globalize.js from jquery-globalize: https://github.com/jquery/globalize

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_TimeOfDay = {
   extend: "TypeManagers.BaseTime",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   dataTypeName : function () {
      return "timeofday";
   },

   /*
   Overridden.
   Ensures hours is 0 to 23 hours.
   */
   _reviewValue : function (value) {
      value = this.callParent([value]);
      if (typeof (value) == "number") {
         var n = value;
         var oneEquals = this.getTimeOneEqualsSeconds();
         if (oneEquals > 1) {
            n = n * oneEquals;
         }
         if (Math.floor(n / 3600) >= 24)
            this._inputError("Exceeds 24 hours");
      }
      return value;
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("TypeManagers.TimeOfDay", jTAC._internal.temp._TypeManagers_TimeOfDay);

jTAC.defineAlias("TimeOfDay", "TypeManagers.TimeOfDay");
jTAC.defineAlias("TimeOfDay.NoSeconds", "TypeManagers.TimeOfDay", {timeFormat: 1});
jTAC.defineAlias("TimeOfDay.NoZeroSeconds", "TypeManagers.TimeOfDay", {timeFormat: 2});

jTAC.defineAlias("TimeOfDay.InSeconds", "TypeManagers.TimeOfDay", {valueAsNumber: true}); 
jTAC.defineAlias("TimeOfDay.InHours", "TypeManagers.TimeOfDay", {valueAsNumber: true, timeOneEqualsSeconds: 3600}); 
jTAC.defineAlias("TimeOfDay.InSeconds.NoSeconds", "TypeManagers.TimeOfDay", {valueAsNumber: true, timeFormat: 1}); 
jTAC.defineAlias("TimeOfDay.InHours.NoSeconds", "TypeManagers.TimeOfDay", {valueAsNumber: true, timeOneEqualsSeconds: 3600, timeFormat: 1}); 
jTAC.defineAlias("TimeOfDay.InSeconds.NoZeroSeconds", "TypeManagers.TimeOfDay", {valueAsNumber: true, timeFormat: 2}); 
jTAC.defineAlias("TimeOfDay.InHours.NoZeroSeconds", "TypeManagers.TimeOfDay", {valueAsNumber: true, timeOneEqualsSeconds: 3600, timeFormat: 2}); 
