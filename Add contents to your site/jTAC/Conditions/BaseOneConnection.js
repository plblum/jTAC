// jTAC/Conditions/BaseOneConnection.js
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
Class : Conditions.BaseOneConnection     ABSTRACT CLASS
Extends: Conditions.Base

Purpose:
Abstract base class that supports one Connection to an element
on the page.

See \jTAC\Conditions\Base.js for an overview of Conditions.

Properties introduced by this class:
   connection (Connection object) - The Connection object
      used to get a value. It defaults to a Connections.FormElement.

   elementId (string) - exposes the [id] property within the Connection
      because it is often get and set.
      Use only when the Connection inherits from Connections.BaseElement.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Conditions.Base
Connections.Base
Connections.BaseElement
Connections.FormElement
USUALLY LOAD \jTAC\TypeManagers\Base.js and other TypeManager classes

----------------------------------------------------------- */
jTAC._internal.temp._Conditions_BaseOneConnection = {
   extend: "Conditions.Base",
   "abstract": true,

   require: ["Connections.FormElement"],


   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      connection: null,
      elementId: null
   },

   /*
   Adds a Connections.FormElement object to the array passed in. 
   */
   _createConnections : function (connections) {
      connections[0] = jTAC.create("Connections.FormElement");
   },


   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

   /* connection property: GET function
   Returns the Connection object.
   */
   getConnection : function ()
   {
      return this.config.connections[0];
   },

   /* connection property: SET function
   Replaces the Connection object. User can also pass a string
   that is a name defined by jTAC.define() or jTAC.defineAlias() and that object
   will be created.
   User can also pass a JSon object with the jtacClass property assigned to the class name of the Connection.
   */
   setConnection : function (conn)
   {
         this.config.connections[0] = jTAC.checkAsConnection(conn, this.config.connections[0]);
   },

   /* elementId property: GET function
   Returns the [id] from current the Connection object
   or null if not available.
   */
   getElementId : function () {
      var conn = this.config.connections[0];
      return conn && conn.getId ? conn.getId() : null;
   },

   /* elementId property: SET function
   Replaces the Connection object in [connection] with this value 
   as the [id] property.
   Uses jTAC.connectionResolver to replace the existing
   Connection object if the id needs it.
   */
   setElementId : function (id) {
      var conns = this.config.connections;
      var conn = jTAC.connectionResolver.create(id, conns[0]);   // may create a replacement connection
      if (conn) {
         conns[0] = conn;
      }
      else {
         conns[0].id = id;
      }
      
   }

}
jTAC.define("Conditions.BaseOneConnection", jTAC._internal.temp._Conditions_BaseOneConnection);

