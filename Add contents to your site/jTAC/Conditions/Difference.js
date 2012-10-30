// jTAC/Conditions/Difference.js
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
Class : Conditions.Difference
Extends: Conditions.BaseOperator

Purpose:
Compares the difference between two values to another number
in the [differenceValue] property.
The [operator] property defines the comparison rule. 

Evaluation rules:
   Returns “success” when the values compare according to the operator.
   Returns “failed” when the values do not compare correctly.
   Returns “cannot evaluate” when either of the element’s values cannot be converted into the native type.

Set up:
   Assign one element’s id to the [elementId] property and the other to the [elementId2] property. 
   These two will have their values calculated as Math.abs(elementId – elementId2). 
   The result is compared to the value of [differenceValue]. Assign a number to [differenceValue]
   and an [operator] to determine how the elements are compared to [differenceValue].

   The TypeManager is normally identified by adding either [data-jtac-datatype] or [data-jtac-typemanager] 
   attributes to the element. If that is not done, you can use the [datatype] or [typeManager] property 
   to define the TypeManager.

See \jTAC\Conditions\Base.js for an overview of Conditions.

Properties introduced by this class:
   differenceValue - The value to compare on the right side of the 
      operator. ((connection - connection2) operator differenceValue) 
      Must be a number. Can be integer or float.
      How this is used depends on the TypeManager's toNumber() method.
      For example, DateTypeManager expects this to be a number of days.
      Defaults to 1.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Conditions.Base
Conditions.BaseOneConnection
Conditions.BaseTwoConnection
Conditions.BaseOperator
Connections.Base
Connections.BaseElement
Connections.FormElement
TypeManagers.Base
other TypeManager classes as needed

----------------------------------------------------------- */
jTAC._internal.temp._Conditions_Difference = {
   extend: "Conditions.BaseOperator",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      differenceValue: 1
   },

   configrules: {
      differenceValue: function(val) { if (typeof val == "number") return val; jTAC.error("Requires a number"); }
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

      try {
         var tm = this.getTypeManager();
         var value1 = tm.toValueFromConnection(conn);
         var value2 = tm.toValueFromConnection(this.getConnection2());
         if ((value1 == null) || (value2 == null)) {
            return -1;
         }
      // if not numbers already, make them numbers
         value1 = tm.toNumber(value1);
         value2 = tm.toNumber(value2);
         if ((value1 == null) || (value2 == null)) { // null means they could not be represented as numbers (for example string types)
            return -1;
         }
         return this._compare(Math.abs(value1 - value2), this.getDifferenceValue()) ? 1 : 0;
      }
      catch (e) {
         return -1;   // could not convert. Illegal value.
      }
   },

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/
   getTypeManager : function () {
      return this._checkTypeManager();
   }


}
jTAC.define("Conditions.Difference", jTAC._internal.temp._Conditions_Difference);
jTAC.defineAlias("Difference", "Conditions.Difference");

