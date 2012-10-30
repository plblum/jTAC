// jTAC/Conditions/CompareToValue.js
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
Class : Conditions.CompareToValue
Extends: Conditions.BaseOperator

Purpose:
Compares the value from a form element or widget
to a fixed value declared in the [valueToCompare] property. 
Use the [operator] property to define the comparison.

Evaluation rules:
   Returns “success” when the values compare according to the operator.
   Returns “failed” when the values do not compare correctly.
   Returns “cannot evaluate” when the element’s value cannot be converted into the native type.

Set up:
   Assign the id of the element to the [elementId] property.

   Assign the value to compare to the [valueToCompare] property. This property can take native types, 
   like a number or Date object. It also can take strings that it converts to the native type, 
   so long as you use the culture neutral format for that data type.

   Use the [operator] property to define the comparison with one of these strings: 
   “=”, “<>”, “<”, “>”, “<=”, “>=”.

   The TypeManager is normally identified by adding either [data-jtac-datatype] or 
   [data-jtac-typemanager] attributes to the element. If that is not done, 
   you can use the [datatype] or [typeManager] property to define the TypeManager.


See \jTAC\Conditions\Base.js for an overview of Conditions.

Properties introduced by this class:
   valueToCompare - The value to compare on the right side of the 
      operator. (connection operator valueToCompare) 
      A string or any value that is compatible with the TypeManager.
      If it is a string, its format must be culture neutral.
      Integers: [-]digits
      Float, Currency, Percent: [-]digits.digits  (always has at least one decimal place)
      Date: yyyy-MM-dd
      TimeOfDay and Duration: H:mm:ss
      DateTime: yyyy-MM-dd H:mm:ss
      DayMonth: MM-dd
      MonthYear: yyyy-MM

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Conditions.Base
Conditions.BaseOneConnection
Conditions.BaseTwoConnections
Conditions.BaseOperator
Connections.Base
Connections.BaseElement
Connections.FormElement
TypeManagers.Base
other TypeManager classes as needed

----------------------------------------------------------- */
jTAC._internal.temp._Conditions_CompareToValue = {
   extend: "Conditions.BaseOperator",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      valueToCompare: null
   },

   /*
   The second connection is not used. Disable it by using allowNone=true.
   */
   _createConnections : function (connections) {
      this.callParent([connections]);

      connections[1].setAllowNone(true);
   },


   /*
   Requires valueToCompare to be assigned.
   */
   canEvaluate : function () {
      return this.callParent() && (this.config.valueToCompare != null);
   },

   /* 
   Returns:
      1 - The two values compared according to the operator.
      0 - The two values did not compare.
      -1 - At least one value was null/empty string. Cannot evaluate.
   */
   _evaluateRule : function () {
      var conn = this.getConnection();
      if (conn.isNullValue() || (this.getValueToCompare() == null)) {
         return -1;
      }

      var tm = this.getTypeManager();
      var value2 = null;
      try {
         value2 = tm.toValueNeutral(this.getValueToCompare());
      }
      catch (e) {
         var msg = "valueToCompare property must be in the culture neutral format for " + tm.storageTypeName() + " on element id " + conn.getId() + ". " + e.message;
         this._error(msg);
      }
      try {
         var value1 = tm.toValueFromConnection(conn);
         if ((value1 == null) || (value2 == null)) {
            return -1;
         }
         return this._compare(value1, value2) ? 1 : 0;
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
jTAC.define("Conditions.CompareToValue", jTAC._internal.temp._Conditions_CompareToValue);

jTAC.defineAlias("CompareToValue", "Conditions.CompareToValue");
