// jTAC/CalcItems/Null.js
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
Module: Calculations
Class : CalcItems.Null
Extends: CalcItems.Base

Purpose:
The javascript value 'null' means that there is nothing to calculate and its not an error condition.

Its evaluate function always returns null, stopping the calculation.
This is generally used in a CalcItems.Conditional on its [failed] property
and in CalcItems.Group in its [valueWhenNull] and [valueWhenEmpty] properties.

See \jTAC\CalcItems\Base.js for an overview of CalcItems.

Properties introduced by this class:
None

Parsing calculation expressions:
The value null. (Not in quotes. Case sensitive.)
null


Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
CalcItems.Base

----------------------------------------------------------- */
jTAC._internal.temp._CalcItems_Null = {
   extend: "CalcItems.Base",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

/* 
Returns Null.
*/
   evaluate : function () {
      return null;
   },

   parse: function(text, parser) {
      this._checkParser(parser);
      var r = parser.asNull(text, false);
      if (r) {
         return { obj: jTAC.create("CalcItems.Null"), rem: r.rem };
      }
      return null;
   }


   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("CalcItems.Null", jTAC._internal.temp._CalcItems_Null);
if (jTAC.parser)
   jTAC.parser.register("CalcItems.Null");

