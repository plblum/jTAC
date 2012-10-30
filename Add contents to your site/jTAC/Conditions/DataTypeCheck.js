// jTAC/Conditions/DataTypeCheck.js
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
Class : Conditions.DataTypeCheck
Extends: Conditions.BaseOneConnection

Purpose:
Ensures the text can be converted to the native type as defined by a TypeManager.

Evaluation rules:
   Returns “success” when the text can be converted.
   Returns “failed” when the text cannot be converted.
   Returns “cannot evaluate” when the text is the empty string or represents null.

Set up:
   Assign the [elementId] property to the element whose text 
   value will be evaluated.

   The TypeManager is normally identified by adding either [data-jtac-datatype] or [data-jtac-typemanager] 
   attributes to the element. If that is not done, you can use the [datatype] or [typeManager] property 
   to define the TypeManager.

See \jTAC\Conditions\Base.js for an overview of Conditions.

Properties introduced by this class:
None

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Conditions.Base
Connections.Base
Connections.BaseElement
Connections.FormElement
ALWAYS LOAD \jTAC\TypeManagers\Base.js and any TypeManager classes you need

----------------------------------------------------------- */
jTAC._internal.temp._Conditions_DataTypeCheck = {
   extend: "Conditions.BaseOneConnection",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   /* 
   Returns:
      1 - Text converted to value.
      0 - Text could not convert.
      -1 - Text was an empty string or represents null. Cannot evaluate.
   */
   _evaluateRule : function () {
      var conn = this.getConnection();
      if (conn.isNullValue()) {
         return -1;
      }
      try {
         var result = this.getTypeManager().toValueFromConnection(conn);

         return result != null ? 1 : -1;
      }
      catch (e) {
         return 0;   // could not convert. Illegal value.
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
jTAC.define("Conditions.DataTypeCheck", jTAC._internal.temp._Conditions_DataTypeCheck);
jTAC.defineAlias("DataTypeCheck", "Conditions.DataTypeCheck");

