// jTAC/TypeManagers/Duration.js
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
Class : TypeManger.Duration
Extends: TypeManagers.BaseTime

Purpose:
For time-only values which represent the time of day. Supports both javascript Date objects
and numbers depending on the valueAsNumber property.

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
   maxHours (int) - The upper limit for number of hours allowed. Defaults to 9999.
See also \jTAC\TypeManagers\BaseDatesAndTimes.js 

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseCulture
TypeManagers.BaseDatesAndTimes
TypeManagers.BaseTime

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_Duration = {
   extend: "TypeManagers.BaseTime",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      timeFormat: 10, // override the default
      maxHours: 9999
   },

   configrules: {
      timeFormat: [10, 11, 12, 100, 101]
   },

   dataTypeName: function () {
      return "duration";
   },

   /*
   Overridden.
   Ensures hours conforms to maxHours.
   */
   _reviewValue: function (value) {
      if (value instanceof Date) {
         if (value.getHours() > this.getMaxHours())
            this._inputError("Exceeded the max hours limit.");
      }
      else if (typeof (value) == "number") {
         var n = value;
         var oneEquals = this.getTimeOneEqualsSeconds();
         if (oneEquals > 1) {
            n = n * oneEquals;
         }

         if (Math.floor(n / 3600) > this.getMaxHours())
            this._inputError("Exceeded the max hours limit.");
      }
      else if (value != null)
         this._error("Value's type is not supported");
      return value;
   },

   _isTOD: function() {
      return false;
   },

/*
   Culture neutral formats for duration use 4 digit hours
   because one goal of this format is to provide sortable strings.
*/
   _timePattern: function() {
      switch (this.getTimeFormat()) {
         case 100:
            return "HHHH:mm:ss"; // culture neutral
         case 101:
            return "HHHH:mm"; // culture neutral
         default:
            return this.callParent();
      }  // switch
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("TypeManagers.Duration", jTAC._internal.temp._TypeManagers_Duration);

jTAC.defineAlias("Duration", "TypeManagers.Duration");
jTAC.defineAlias("Duration.NoSeconds", "TypeManagers.Duration", {timeFormat: 11});
jTAC.defineAlias("Duration.NoZeroSeconds", "TypeManagers.Duration", {timeFormat: 12});

jTAC.defineAlias("Duration.InSeconds", "TypeManagers.Duration", {valueAsNumber: true}); 
jTAC.defineAlias("Duration.InHours", "TypeManagers.Duration", {valueAsNumber: true, timeOneEqualsSeconds: 3600}); 
jTAC.defineAlias("Duration.InSeconds.NoSeconds", "TypeManagers.Duration", {valueAsNumber: true, timeFormat: 11}); 
jTAC.defineAlias("Duration.InHours.NoSeconds", "TypeManagers.Duration", {valueAsNumber: true, timeOneEqualsSeconds: 3600, timeFormat: 11}); 
jTAC.defineAlias("Duration.InSeconds.NoZeroSeconds", "TypeManagers.Duration", {valueAsNumber: true, timeFormat: 12}); 
jTAC.defineAlias("Duration.InHours.NoZeroSeconds", "TypeManagers.Duration", {valueAsNumber: true, timeOneEqualsSeconds: 3600, timeFormat: 12}); 


