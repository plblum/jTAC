// jTAC/Conditions/Required.js
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
Class : Conditions.Required
Extends: Conditions.BaseOneOrMoreConnections

Purpose:
One or more elements are evaluated to see if its value is not unassigned, empty, or null. 
You can evaluate the value of it to any widget: textbox, list, checkbox, radio, calendar widget, etc.

Evaluation rules:
   Uses the Connection class’ isNullValue() method to determine if the element has data or not.
   With just one Connection, it returns “success” when the element’s value 
   has been assigned and “failed” and it is unassigned.
   With more than one Connection, it uses the [mode] property to count the number of elements 
   that have their values assigned. It returns “success” if the number of elements matches 
   the mode property rule and “failed” when it does not.

Set up:
   For the first element, set the widget's id in the [elementId] property.

   For additional elements, add their ids to the [moreConnections] property, 
   which is an array. Use either its push() method or assign an array of ids. 
   Then assign the [mode] property to determine how to evaluate multiple elements. 
   mode has these values: “All”, “OneOrMore”, “AllOrNone”, “One”, and “Range”. 
   If using “Range”, also set the [minimum] and [maximum] properties.

   When working with textual or list widgets, a value of the empty string is 
   normally considered unassigned. However, when a textbox has a watermark or 
   a list has its first item as "No Selection", specify the text of the watermark or 
   value of the first item in the Connection's [unassigned] property.
   For example, a list has an option with the label "No selection" and value of "NONE".
      var cond = jTAC.create("Required", {elementId: "ListBox1"});
      cond.connection.unassigned = "NONE";

See \jTAC\Conditions\Base.js for an overview of Conditions.

Properties introduced by this class:
   mode (string) -
      When there are multiple connections, this is used to determine how many
      must be not null to report "success". Here are the mode values:
         "All" - All must have text
         "OneOrMore" - At least one must have text. This is the default.
         "AllOrNone" - All or none must have text
         "One" - Only one must have text
         "Range" - Specify the minimum and maximum number of widgets in this Condition's
            [minimum] and [maximum] properties.

   minimum (integer) and maximum (integer) -
      When [mode] = "Range", use these to determine the number of connections
      with values that are not null to report "success".


Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Conditions.Base
Conditions.BaseOneConnection
Conditions.BaseOneOrMoreConnections
Connections.Base
Connections.BaseElement
Connections.FormElement

----------------------------------------------------------- */
jTAC._internal.temp._Conditions_Required = {
   extend: "Conditions.BaseOneOrMoreConnections",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

      this._internal.allMustBeEditable = false;
   },

   config: {
      mode: "OneOrMore",
      minimum: 0,
      maximum: 999
   },

   configrules: {
      mode: ["All", "OneOrMore", "AllOrNone", "One", "Range"]
   },

   /*
   If there is one connection, success when not null and failed otherwise.
   With multiple connections, depends on the mode property.
   Sets a field called count with the number of non-null connections.
   Cannot evaluate if none of the connections are editable (when ignoreNotEditable = true).
   */
   _evaluateRule : function () {
      var m = this.getMoreConnections();
      if (m.length == 0) {   // no mode property
         var conn = this.getConnection();
         if (!conn.isEditable()) { // ignoreNotEditable does not apply.
            return -1;  // cannot evaluate
         }
         // isNullValue uses a true parameter to make unchecked checkboxes and radiobuttons act as null
         return this.count = (conn.isNullValue(true) ? 0 : 1);   // assigns to this.count then returns it. Should be =, not ==.
      }
      var conns = this._cleanupConnections();   // list will omit non-editable connections if ignoreNotEditable=true
      var ttl = conns.length;   // total connections
      if (!ttl) {
         return -1;  // cannot evaluate
      }
      var cnt = 0;
      for (var i = 0; i < conns.length; i++) {
         if (!conns[i].isNullValue(true)) {
            cnt++;
         }
      }

      this.count = cnt;
      switch (this.getMode()) {
         case "All":
            return cnt == ttl ? 1 : 0;
         case "OneOrMore":
            return (cnt > 0) ? 1 : 0;
         case "AllOrNone":
            return ((cnt == 0) || (cnt == ttl)) ? 1 : 0;
         case "One":
            return (cnt == 1) ? 1 : 0;
         case "Range":
            return ((this.getMinimum() <= cnt) && (cnt <= this.getMaximum())) ? 1 : 0;
         default:
            this._error("Unknown mode name.");
      }  // switch
   }


   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("Conditions.Required", jTAC._internal.temp._Conditions_Required);
jTAC.defineAlias("Required", "Conditions.Required");

