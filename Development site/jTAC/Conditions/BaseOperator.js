// jTAC/Conditions/BaseOperator.js
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
Class : Conditions.BaseOperator     ABSTRACT CLASS
Extends: Conditions.BaseTwoConnections

Purpose:
Abstract base class that compares two values based on the rule
in the [operator] property.

See \jTAC\Conditions\Base.js for an overview of Conditions.

Properties introduced by this class:
   operator (string) - Supports these values:
      "=", "<>", "<", ">", "<=", ">="

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Conditions.Base
Conditions.BaseOneConnection
Conditions.BaseTwoConnections
Connections.Base
Connections.BaseElement
Connections.FormElement
USUALLY LOAD \jTAC\TypeManagers\Base.js and other TypeManager classes

----------------------------------------------------------- */
jTAC._internal.temp._Conditions_BaseOperator = {
   extend: "Conditions.BaseTwoConnections",
   "abstract": true,

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      operator: "="
   },

   configrules: {
      operator:["=", "<>", ">", "<", ">=", "<="]
   },

   /*
   Utility to compare two values to be used by subclasses. 
   Both values can be native or string types.
   TypeManager.compare() is used for the evaluation and operator applied against the result.
   Returns true if the values match the operator's rule and false when they do not.
   */
   _compare : function(value1, value2) {
      var result = this.getTypeManager().compare(value1, value2);
      switch (this.getOperator()) {
         case "=":
            return result == 0;
         case "<>":
            return result != 0;
         case ">":
            return result == 1;
         case "<":
            return result == -1;
         case ">=":
            return result > -1;
         case "<=":
            return result < 1;
      }
   }
   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("Conditions.BaseOperator", jTAC._internal.temp._Conditions_BaseOperator);

