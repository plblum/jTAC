// jTAC/Conditions/BaseOneOrMoreConnections.js
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
Class : Conditions.BaseOneOrMoreConnections     ABSTRACT CLASS
Extends: Conditions.BaseOneConnection

Purpose:
Abstract base class that supports one or more Connections to elements
on the page. If you only have one Connection, it can use the [elementId]
or [connection] property. For any more, add an array of connections to the
[moreConnections] property.

See \jTAC\Conditions\Base.js for an overview of Conditions.

Properties introduced by this class:
   moreConnections (array) - 
      Use when there are more than one Connection. The first connection always
      goes in the 'connection' property. The rest in moreConnections.
      Create the Connection.BaseElement subclass that works with the widget
      and use the push() method on the array to add it to the end of the array.

   ignoreNotEditable (boolean) -
      When there are two or more connections used, this determines
      if elements that are not editable are counted.
      For example, when Mode = All and there is one non-editable connection,
      "All" means one less than the total connections.
      When true, not editable connections are not counted.
      When false, they are.
      It defaults to false.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Conditions.Base
Conditions.BaseOneConnection
Connections.Base
Connections.BaseElement
Connections.FormElement

----------------------------------------------------------- */
jTAC._internal.temp._Conditions_BaseOneOrMoreConnections = {
   extend: "Conditions.BaseOneConnection",
   "abstract": true,

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

      this._internal.allMustBeEditable = true;  // managed by subclasses, not as a user editable property
   },

   config: {
      moreConnections: [],
      ignoreNotEditable: true
   },

   /*
   Used by canEvaluate when [autoDisable] = true to evaluate each connection
   to ensure that they are all enabled.
   Returns true if editable and false if not.
   Use the field [_internal.allMustBeEditable] to determine if all or just one connection must be
   editable to return true. [_internal.allMustBeEditable] defaults to true.
   */
   _connsEditable : function () {
      if (this._internal.allMustBeEditable) {
         return this.callParent();
      }

      var conns = this.getConnections();
      if (conns) {
         for (var i = 0; i < conns.length; i++) {
            if (conns[i].isEditable()) {
               return true;
            }
         }  // for
      }
      return false;
   },

   /*
   Returns an array holding the available connections.
   It merges the value in connection with [moreConnections].
   It also updates [moreConnections] where it hosts a string, replacing
   the string with a DOM element.
   The array is a new instance.
   */
   getConnections : function () {
      var conns = [];
      if (this.config.connections)
         conns = this.config.connections.concat(conns);
      var m = this.getMoreConnections();
      for (var i = 0; i < m.length; i++) {
         conns.push(m[i]);
      }
      return conns;
   },

   /*
   Returns an array of connections, combined from the [connection] and [moreConnections] properties.
   It eliminates those that are not editable when [ignoreNotEditable] is true.
   May return an empty array.
   */
   _cleanupConnections : function () {
      var nc = [];
      var conns = this.getConnections();
      if (conns) {
         for (var i = 0; i < conns.length; i++) {
            if (!this.getIgnoreNotEditable() || conns[i].isEditable()) {
               nc.push(conns[i]);
            }
         }  // for
      }
      return nc;
   },

   /*
   Looks through the [moreConnections] collection. If any are JSON objects, they are converted
   to Connection objects. If there are any strings, they represent and element ID
   and those are resolved. If any are illegal entries, an exception is thrown.
   */
   _resolveMoreConnections : function () {
      var conns = this.config.moreConnections;  // do not call getMoreConnections() since this is called within that call
      for (var i = 0; i < conns.length; i++) { 
         var conn = conns[i];
         if (typeof conn == "string") {
            var id = conn;
            var def = jTAC.create("Connections.FormElement", {id: id});
            conn = jTAC.connectionResolver.create(id, def);
            conns[i] = conn ? conn : def;
         }
         else if (!(conn instanceof jTAC.Connections.Base) && (typeof (conn) == "object")) { // see if its a json object.
            if (!conn.jtacClass)
               this._error("Must define the Connection's class in the 'jtacClass' property of the object that describes a Connection.");
            conn = jTAC.create(null, conn);
            conns[i] = conn;
         }
         else if (!(conn instanceof jTAC.Connections.Base))
            this._error("The moreConnections property must only contain Connection objects and JSon objects that generate Connection objects.");

      }  // for
   },


   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

   /* moreConnections property: GET function
   Use when there are more than one Connection object. The first Connection always
   goes in the [connection] property. The rest in [moreConnections].
   Create the Connections.Base subclass that works with the element
   and use the push() method on the array to add it to the end of the array.
   */
   getMoreConnections : function () {
      if (this.config.moreConnections)
         this._resolveMoreConnections();
      return this.config.moreConnections;
   }

}
jTAC.define("Conditions.BaseOneOrMoreConnections", jTAC._internal.temp._Conditions_BaseOneOrMoreConnections);

