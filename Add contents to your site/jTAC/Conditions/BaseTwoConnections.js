// jTAC/Conditions/BaseTwoConnections.js
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
Class : Conditions.BaseTwoConnections     ABSTRACT CLASS
Extends: Conditions.BaseOneConnection

Purpose:
Abstract base class that supports two Connection objects to elements on the page.

See \jTAC\Conditions\Base.js for an overview of Conditions.

Properties introduced by this class:
   connection2 (Connection object) - The Connection object used to get the 
      second value. It defaults to a Connection.FormElement.
   elementId2 (string) - Exposes the [id] property within the second Connection
      because it is often get and set.
      Use only when the second Connection inherits from Connections.BaseElement.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Conditions.Base
Conditions.BaseOneConnection
Connections.Base
Connections.BaseElement
Connections.FormElement
USUALLY LOAD \jTAC\TypeManagers\Base.js and other TypeManager classes

----------------------------------------------------------- */
jTAC._internal.temp._Conditions_BaseTwoConnections = {
   extend: "Conditions.BaseOneConnection",
   "abstract": true,

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      connection2: null,
      elementId2: null
   },


   /*
   Adds a Connections.FormElement object to the array passed in. 
   */
   _createConnections : function (connections)
   {
      this.callParent([connections]);

      connections[1] = jTAC.create("Connections.FormElement");
   },


   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/
   /* connection2 property: GET function
   Returns the Connection object.
   */
   getConnection2 : function ()
   {
      return this.config.connections[1];
   },

   /* connection2 property: SET function
   Replaces the Connection object. User can also pass a string
   that is a name defined by jTAC.define() or jTAC.defineAlias() and that object
   will be created.
   User can also pass a JSon object with the jtacClass property assigned to the class name of the Connection.
   */
   setConnection2 : function (conn)
   {
      this.config.connections[1] = jTAC.checkAsConnection(conn, this.config.connections[1]);
   },

   /* elementId2 property: GET function
   Returns the [id] from current the Connection object
   or null if not available.
   */
   getElementId2 : function () {
      var conn = this.config.connections[1];
      return conn && conn.getId ? conn.getId() : null;
   },

   /* elementId2 property: SET function
   Replaces the Connection object in [connection2] with this value 
   as the [id] property.
   Uses jTAC.connectionResolver to replace the existing
   Connection object if the id needs it.
   */
   setElementId2 : function (id) {
      var conns = this.config.connections;
      var conn = jTAC.connectionResolver.create(id, conns[1]);   // may create a replacement connection
      if (conn) {
         conns[1] = conn;
      }
      else {
         conns[1].id = id;
      }
      
   }
}
jTAC.define("Conditions.BaseTwoConnections", jTAC._internal.temp._Conditions_BaseTwoConnections);

