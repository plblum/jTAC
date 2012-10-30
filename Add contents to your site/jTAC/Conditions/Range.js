// jTAC/Conditions/Range.js
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
Module: Condition objects
Class : Conditions.Range
Extends: Conditions.BaseOneConnection

Purpose:
Compares the value from an element on the page
to a range established by the properties.

Evaluation rules:
   Returns “success” when the value is within the range.
   Returns “failed” when the value is outside the range.
   Returns “cannot evaluate” when the element’s value cannot be converted into the native type.

Set up:
   Assign the element’s id to the [elementId] property. 

   Assign the range with the [minimum] and [maximum] properties. 
   This property can take native types, like a number or Date object. 
   It also can take strings that it converts to the native type, 
   so long as you use the culture neutral format for that data type.

   The TypeManager is normally identified by adding either [data-jtac-datatype] or 
   [data-jtac-typemanager] attributes to the element. If that is not done, 
   you can use the [datatype] or [typeManager] property to define the TypeManager.

   The TypeManager also has [minValue] and [maxValue] properties when you include 
   the jquery-ui widgets\Command extensions.js file or Merged\TypeManagers\datatypeeditor.js file.
    
   The Conditions.Range object will use those properties if its own minimum and maximum are null.

See \jTAC\Conditions\Base.js for an overview of Conditions.

Properties introduced by this class:
   minimum - The minimum value. If null, not evaluated.
      A string or any value that is compatible with the TypeManager.
      If it is a string, its format must be culture neutral.
      Integers: [-]digits
      Float, Currency, Percent: [-]digits.digits  (always has at least one decimal place)
      Date: yyyy-MM-dd
      TimeOfDay and Duration: H:mm:ss
      DateTime: yyyy-MM-dd H:mm:ss
      DayMonth: MM-dd
      MonthYear: yyyy-MM

   maximum - The maximum value. If null, not evaluated.
      A string or any value that is compatible with the TypeManager.
      If it is a string, its format must be culture neutral.

   lessThanMax (boolean) - When true, evaluate less than the maximum.
      When false, evaluate less than or equals the maximum.
      Defaults to false.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Conditions.Base
Conditions.BaseOneConnection
Connections.Base
Connections.BaseElement
Connections.FormElement
TypeManagers.Base
Other TypeManager classes as needed

----------------------------------------------------------- */
jTAC._internal.temp._Conditions_Range = {
   extend: "Conditions.BaseOneConnection",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      minimum: null,
      maximum: null,
      lessThanMax: false
   },

   /*
   Requires at least one of minimum or maximum to be assigned.
   */
   canEvaluate : function () {
      return this.callParent() && 
         ((this.config.minimum != null) || (this.config.maximum != null));
   },

   /* 
   Returns:
      1 - The two values compared according to the operator.
      0 - The two values did not compare.
      -1 - At least one value was null/empty string. Cannot evaluate.
   */
   _evaluateRule : function () {
      var conn = this.getConnection();
      if (conn.isNullValue()) {
         return -1;
      }

      var tm = this.getTypeManager();
      var min, max;
      var p = "minimum";
      try {
      // The typemanager may have its own min/maxValue. Use it if the RangeCondition does not have it.
      // This allows the user to change typemanager's value and have it impact the RangeCondition.
         min = tm.toValueNeutral(this.getMinimum());
         if ((min == null) && tm.getMinValue) {
            min = tm.getMinValue;
         }
            
         p = "maximum"
         max = tm.toValueNeutral(this.getMaximum());
         if ((max == null) && tm.getMaxValue) {
            max = tm.getMaxValue;
         }
      }
      catch (e) {
         var msg = p + " property must be in the culture neutral format for " + tm.storageTypeName() + " on element id " + conn.getId() + ". " + e.message;
         this._error(msg);
      }

      try {
         var value = tm.toValueFromConnection(conn);
         if (value == null) {
            return -1;
         }
      }
      catch (e) {
         return -1;   // could not convert. Illegal value.
      }
      if (min != null) {
         if (tm.compare(value, min) < 0) {
//         if (value < min) {
            return 0;
         }
      }
      if (max != null) {
         if (this.getLessThanMax()) {
            if (tm.compare(value, max) >= 0) {
//            if (value >= max) {
               return 0;
            }
         }
         else
         {
            if (tm.compare(value, max) > 0) {
//            if (value > max) {
               return 0;
            }
         }
      }
      return 1;
   },


   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

   getTypeManager : function ()
   {
      return this._checkTypeManager();
   }
}
jTAC.define("Conditions.Range", jTAC._internal.temp._Conditions_Range);
jTAC.defineAlias("Range", "Conditions.Range");

