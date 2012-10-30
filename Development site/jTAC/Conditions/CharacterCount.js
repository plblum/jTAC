// jTAC/Conditions/CharacterCount.js
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
Class : Conditions.CharacterCount
Extends: Conditions.BaseCounter

Purpose:
Use to ensure the number of characters in a string are within a range.

Totals the number of characters in each connection and compares it to a
range. Although its typical to use a single connection, specified by
the [elementId] or [connection] property, you can total multiple
connections by specifying others in the [moreConnections] property.

Set up:
   For the first Connection, set the widget's id in the [elementId] property or modify
   the Connection object in its [connection] property.
   For additional connections, create Connection objects like Connections.FormElement.
   Add them to [moreConnections] property, which is an array
   by using the array's push() method.

See \jTAC\Conditions\Base.js for an overview of Conditions.

Properties introduced by this class:
None

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Conditions.Base
Conditions.BaseOneConnection
Conditions.BaseOneOrMoreConnections
Conditions.BaseCounter
Connections.Base
Connections.BaseElement
Connections.FormElement

----------------------------------------------------------- */
jTAC._internal.temp._Conditions_CharacterCount = {
   extend: "Conditions.BaseCounter",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   /*
   Returns the number of characters. Applies the trim property rule if setup.
      conn (Connection object)
   */
   _connCount : function (conn) {
   //NOTE: Some elements return a string length that differs from the
   // intended number of characters to post back. <TextArea> does this
   // when there are ENTER characters. textLength() ensures the connection
   // resolves this difference. As a result, this does not use getTextValue() 
   // and check the string length.
      return conn.textLength();  // will trim if conn has its trim property set.
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("Conditions.CharacterCount", jTAC._internal.temp._Conditions_CharacterCount);
jTAC.defineAlias("CharacterCount", "Conditions.CharacterCount");

