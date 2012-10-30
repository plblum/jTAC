// jTAC/Conditions/DuplicateEntry.js
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
Class : Conditions.DuplicateEntry
Extends: Conditions.BaseOneOrMoreConnections

Purpose:
Ensures that the list of elements on the page have different values.

If you are comparing list type widgets, it compares their textual values, 
not their index or the text shown the user.

Evaluation rules:
   If a pair is found to have the same string value, it evaluates as "failed".
   Otherwise it evaluates as "success".

Set up:
   For the first Connection, set the widget's id in the [elementId] property.

   For additional Connections, add their ids to the [moreConnections] property, 
   which is an array. Use either its push() method or assign an array of ids.

   Determine if comparisons are case insensitive with [caseIns] and if unassigned 
   fields are included with [ignoreUnassigned].


See \jTAC\Conditions\Base.js for an overview of Conditions.

Properties introduced by this class:
   caseIns (boolean) -
      When true, strings are compared using a case insensitive match.
      It defaults to true.

   ignoreUnassigned (boolean) - 
      When true, if the element's value is unassigned, it is never matched. 
      When false, the element's value is always used, even when blank. 
      It defaults to true.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Conditions.Base
Conditions.BaseOneConnection
Conditions.BaseOneOrMoreConnections
Connections.Base
Connections.BaseElement
Connections.FormElement

----------------------------------------------------------- */
jTAC._internal.temp._Conditions_DuplicateEntry = {
   extend: "Conditions.BaseOneOrMoreConnections",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      caseIns: true,
      ignoreUnassigned: true
   },
   /*
   Compares all of the string values from the connections. If any
   pair matches, it returns 0 ("failed". It will also retains references
   to the two connections that had the match in the fields _errconn1 and _errconn2.
   */
   _evaluateRule : function () {
      this._errconn1 = null;
      this._errconn2 = null;
      var conns = this._cleanupConnections();   // list will omit non-editable connections if ignoreNotEditable=true
      var ttl = conns.length;   // total connections
      if (!ttl) {
         return -1;  // cannot evaluate
      }

      var vals = []; // collects values in the same order as conns
      for (var i = 0; i < conns.length; i++) {
         var s = conns[i].getTextValue();
         if ((s.length == 0) && this.getIgnoreUnassigned())
            continue;

         if (this.getCaseIns()) {
            s = s.toUpperCase();
         }

         var exist = vals[s];
         if (exist != null) {   // error
            this._errconn1 = exist;
            this._errconn2 = conns[i];
            return 0;
         }

         vals[s] = conns[i];
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

}
jTAC.define("Conditions.DuplicateEntry", jTAC._internal.temp._Conditions_DuplicateEntry);
jTAC.defineAlias("DuplicateEntry", "Conditions.DuplicateEntry");

