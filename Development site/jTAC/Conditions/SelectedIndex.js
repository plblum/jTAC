// jTAC/Conditions/SelectedIndex.js
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
Class : Conditions.SelectedIndex
Extends: Conditions.BaseOneConnection

Purpose:
Compares an index specified in the [index] property with 
the actual selected index. The [index] property can also
supply an array of indices to match, including
ranges, like this: [1, 2, [10, 20]]
Each item in the array is an integer of an index to match.
If a range is needed, the item should be an array with to items,
a start and end index.

Supports both single selection and multiselection lists.

Evaluation rules:
When the index specified in [index] matches a selected index, it means "success".
Any other index means "failed".
If you want to reverse this logic, set the "not" property to true.


See \jTAC\Conditions\Base.js for an overview of Conditions.

Properties introduced by this class:
   index (integer or array) -
      The index value to match against the selected indices of the list.
      The value can either be an integer or an array.
      When it is an array, each item either an index number
      or an array representing a range. A range's array
      has two elements, start index and end index.
      It defaults to null.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Conditions.Base
Conditions.BaseOneConnection
Connections.Base
Connections.BaseElement
Connections.FormElement

----------------------------------------------------------- */
jTAC._internal.temp._Conditions_SelectedIndex = {
   extend: "Conditions.BaseOneConnection",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      index: null
   },

   /*
   Cannot evaluate when the index property is null.
   */
   canEvaluate : function () {
      if (this.getIndex() == null)
         return false;
      return this.callParent();
   },


   /* 
   Evaluation rules. When the index specified in index
   matches the selected index, it means "failed".
   Any other index means "success".
   If you want to reverse this logic, set the not property to true.
   Returns 1 for "success" and 0 for "failed".
   */
   _evaluateRule : function () {
      // Looks for itf (the index to find) in the array, ia. That array
      // contains integers to match, and child arrays that define a range to match.
      function inIdxArray(itf, ia) {
         for (var i = 0; i < ia.length; i++) {
            var item = ia[i];
            if (item instanceof Array) { 
             // array must have two integers, start and end to compare
               if (item.length != 2)
                  this._error("Invalid range. Must be array of 2 integers.");
               if ((item[0] <= itf) && (itf <= item[1])) {
                  return true;
               }
            }
            else {
               if (itf == item) {
                  return true;
               }
            }
         }  // for
         return false;
      }
      var idx = this.getIndex();
      var conn = this.getConnection();
      if (conn.typeSupported("indices")) {
         var sel = conn.getTypedValue("indices");
         if (typeof idx == "number") {
            if (idx == -1) {
               return sel.length == 0 ? 1 : 0;
            }
            idx = [idx];
         }
         for (var i = 0; i < sel.length; i++) {
            if (inIdxArray(sel[i], idx)) {
               return 1;
            }
         }
         return 0;
      }
      else if (conn.typeSupported("index")) {
         var sel = conn.getTypedValue("index");
         if (idx instanceof Array) {
            return inIdxArray(sel, idx) ? 1 : 0;
         }
         return (sel == idx) ? 1 : 0;
      }
      else // if you have a custom list, create a Connection subclass that supports "index" in its typeSupported method
         this._error("The element [" + this.getElementId() + "] does not support list lookup functions.");
   },

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/
   setIndex : function (val)
   {  
      if (val instanceof Array)
         this.config.index = val;
      else
         this.config.index = jTAC.checkAsIntOrNull(val);
   }

}
jTAC.define("Conditions.SelectedIndex", jTAC._internal.temp._Conditions_SelectedIndex);
jTAC.defineAlias("SelectedIndex", "Conditions.SelectedIndex");

