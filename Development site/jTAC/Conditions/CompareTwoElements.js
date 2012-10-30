// jTAC/Conditions/CompareTwoElements.js
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
Class : Conditions.CompareTwoElements
Extends: Conditions.BaseOperator

Purpose:
Compares the values of two elements.
Provides the [operator] property to define the comparison.

Evaluation rules:
   Returns “success” when the values compare according to the operator.
   Returns “failed” when the values do not compare correctly.
   Returns “cannot evaluate” when either of the element’s values cannot be converted into the native type.

Set up:
   Assign one element’s id to the [elementId] property and the other to the [elementId2] property.

   Use the [operator] property to define the comparison with one of these strings: 
   “=”, “<>”, “<”, “>”, “<=”, “>=”.

   The TypeManager is normally identified by adding either [data-jtac-datatype] or [data-jtac-typemanager] 
   attributes to the element. If that is not done, you can use the [datatype] or [typeManager] property 
   to define the TypeManager.

See \jTAC\Conditions\Base.js for an overview of Conditions.

Properties introduced by this class:
None

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
jTAC._internal.temp._Conditions_CompareTwoElements = {
   extend: "Conditions.BaseOperator",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   /* 
   Returns:
      1 - The two values compared according to the operator.
      0 - The two values did not compare.
      -1 - At least one value was null/empty string. Cannot evaluate.
   */
   _evaluateRule : function () {
      var conn = this.getConnection();
      var conn2 = this.getConnection2();
      if (conn.isNullValue() || conn2.isNullValue()) {
         return -1;
      }

      try {
         var tm = this.getTypeManager();
         var value1 = tm.toValueFromConnection(conn);
         var value2 = tm.toValueFromConnection(conn2);
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
jTAC.define("Conditions.CompareTwoElements", jTAC._internal.temp._Conditions_CompareTwoElements);
jTAC.defineAlias("CompareTwoElements", "Conditions.CompareTwoElements");

