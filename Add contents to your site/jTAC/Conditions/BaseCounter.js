// jTAC/Conditions/BaseCounter.js
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
Class : Conditions.BaseCounter      ABSTRACT CLASS
Extends: Conditions.BaseOneOrMoreConnections

Purpose:
One or more Connections are evaluated to total something about the value
of each, such as number of characters, words, or selected items. That total is compared
to a range defined by minimum and maximum.

Subclass overriding the _connCount() function. It should evaluate the connection passed in
to return a number that is added to the total by the caller.

Set up:
   For the first Connection, set the widget's id in the [elementId] property or modify
   the Connection object in its [connection] property.
   For additional connections, create Connection objects like Connection.FormElement.
   Add them to [moreConnections] property, which is an array
   by using the array's push() method.


See \jTAC\Conditions\Base.js for an overview of Conditions.

Properties introduced by this class:
   minimum (integer)  -
      Determines the minimum of the count to report "success".
      If null, it is not used. Otherwise it must be a positive integer.
   
   maximum (integer)
      Determines the maximum of the count to report "success".
      If null, it is not used. Otherwise it must be a positive integer.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Conditions.Base
Conditions.BaseOneConnection
Conditions.BaseOneOrMoreConnections
Connections.Base
Connections.BaseElement
Connections.FormElement

----------------------------------------------------------- */
jTAC._internal.temp._Conditions_BaseCounter = {
   extend: "Conditions.BaseOneOrMoreConnections",
   "abstract": true,

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      minimum: null,
      maximum: null
   },

   configrules: {
      minimum: jTAC.checkAsIntOrNull,
      maximum: jTAC.checkAsIntOrNull
   },

   /*
   Call to determine if the Condition can be evaluated.
   If it returns true, you can call evaluate().
   Returns false when both [minimum] and [maximum] have not been assigned (are both null).
   */
   canEvaluate : function () {
      if ((this.getMinimum() == null) && (this.getMaximum() == null)) {
         return false;
      }
   
      return this.callParent();
   },


   /*
   Counts each connection using the overridden _connCount() function.
   If the total is between the range (minimum/maximum), returns 1. Otherwise returns 0.
   Returns -1 (cannot evaluate) if none of the connections are editable (when ignoreNotEditable = true).
   */
   _evaluateRule : function () {
      var conns = this._cleanupConnections();   // list will omit non-editable connections if ignoreNotEditable=true
      var ttl = conns.length;   // total connections
      if (!ttl) {
         return -1;  // cannot evaluate
      }

      var cnt = 0;
      for (var i = 0; i < conns.length; i++) {
         cnt += this._connCount(conns[i]);
      }

      this.count = cnt;
      var min = this.getMinimum();
      var max = this.getMaximum();
      if ((min != null) && (cnt < min)) {
         return 0;
      }
      if ((max != null) && (cnt > max)) {
         return 0;
      }
      return 1;
   },

   /* ABSTRACT METHOD
   Returns an integer representing the count determined for the connection passed in.
   Must return at least a value of 0.
      conn (Connection object)
   */
   _connCount : function (conn) {
      this._AM();
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("Conditions.BaseCounter", jTAC._internal.temp._Conditions_BaseCounter);

