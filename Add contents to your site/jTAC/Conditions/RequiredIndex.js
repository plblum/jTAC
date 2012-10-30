// jTAC/Conditions/RequiredIndex.js
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
Class : Conditions.RequiredIndex
Extends: Conditions.BaseOneConnection

Purpose:
Ensures that there is a selected item in a list type widget by evaluating the 
state of its [unassignedIndex] property.

While often lists have a value="" representing no selection, many developers 
prefer to add a "---NO SELECTION--" item. As a result, sometimes "no selection" 
means selectedIndex = 0 and other times it means selectedIndex = -1. 
Therefore, the user can specify which they are using in the unassignedIndex property.

Note: The Conditions.Required class can also be used to evaluate a list, 
but evaluates the textual value, not the selected index.

Evaluation rules:
   When the index specified in [unassignedIndex] matches the selected index, it means "failed".
   Any other index means "success".
   If you want to reverse this logic, set the not property to true.

Set up:
   Assign the list element’s id to the [elementId] property.

   The [unassignedIndex] property defaults to 0, so it is correctly setup 
   if you have a “no selection” item first in the list. If you do not, 
   assign the [unassignedIndex] property. Set it to -1 if it is unassigned by having no selection.


See \jTAC\Conditions\Base.js for an overview of Conditions.

Properties introduced by this class:
   unassignedIndex (int) -
      The index value that when selected, indicates that the list has no selection.
      It is typically 0 (when the first item is for "no selection") or -1
      (when any selected index indicates a selection.)
      It defaults to 0.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Conditions.Base
Connections.Base
Connections.BaseElement
Connections.FormElement
USUALLY LOAD \jTAC\TypeManagers\Base.js and other TypeManager classes

----------------------------------------------------------- */
jTAC._internal.temp._Conditions_RequiredIndex = {
   extend: "Conditions.BaseOneConnection",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      unassignedIndex: 0
   },

   /* 
   Evaluation rules. When the index specified in unassignedIndex
   matches the selected index, it means "failed".
   Any other index means "success".
   If you want to reverse this logic, set the not property to true.
   Returns 1 for "success" and 0 for "failed".
   */
   _evaluateRule : function () {
      var conn = this.getConnection();
      if (conn.typeSupported("index")) {
         var sel = conn.getTypedValue("index");
         return (sel != this.getUnassignedIndex()) ? 1 : 0;
      }
      else // if you have a custom list, create a Connection.BaseElement subclass that supports "index" in its typeSupported method
         this._error("The element [" + this.getElementId() + "] does not support list lookup functions.");
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("Conditions.RequiredIndex", jTAC._internal.temp._Conditions_RequiredIndex);
jTAC.defineAlias("RequiredIndex", "Conditions.RequiredIndex");

