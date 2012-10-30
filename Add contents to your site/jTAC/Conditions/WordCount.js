// jTAC/Conditions/WordCount.js
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
Class : Conditions.WordCount
Extends: Conditions.BaseCounter

Purpose:
Use to ensure the number of Words in a string are within a range.

Totals the number of Words in each connection and compares it to a
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
jTAC._internal.temp._Conditions_WordCount = {
   extend: "Conditions.BaseCounter",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   /*
   Returns the number of Words. Applies the trim property rule if setup.
      conn (Connection object)
   */
   _connCount : function (conn) {
      var s = conn.getTextValue();  // will trim if conn has its trim property set.
      if (s.length == 0) {
         return 0;
      }
      
      // use a regex to find the words. The \w and \W tokens handle most of what
      // we want. \w = any of these chars: A-Z,a-z,0-9,_
      // We also want the single quote (possessive nouns and contractions) in there
      s = s.replace(new RegExp("'", "gi"), "");  // remove single quotes

      var re = new RegExp(this._wordREPattern, "ig");
   // unfortunately, this loop will have to do even though its slower than letting the underlying JS engine
   // find all copies internally. JS simply doesn't have that capability
      var cnt = 0;
      while (re.exec(s) != null) {
        cnt++;
      }
      return cnt;
   },

/*
The regular expression used to identify words. Its separated
here so you can replace it by setting this field.
*/
   _wordREPattern : "(\\b|^)(\\w+?)(\\b|$)"

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("Conditions.WordCount", jTAC._internal.temp._Conditions_WordCount);
jTAC.defineAlias("WordCount", "Conditions.WordCount");

