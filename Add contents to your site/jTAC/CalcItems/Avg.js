// jTAC/CalcItems/Avg.js
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
Class : CalcItems.Avg
Extends: CalcItems.BaseFunction

Purpose:
Returns the average value from the values passed in.

See \jTAC\CalcItems\Base.js for an overview of CalcItems.

Properties introduced by this class:
None

Parsing calculation expressions:
A function named "Avg" that a comma delimited list of calculation expressions.
   Avg(calculation expression1, calculation expression2, calculation expression3, etc)

   Avg("TextBox1", "TextBox2", "TextBox3")



Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
CalcItems.Base
CalcItems.BaseFunction

----------------------------------------------------------- */
jTAC._internal.temp._CalcItems_Avg = {
   extend: "CalcItems.BaseFunction",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },


   /* 
   Calculates the average. Returns a value that is not rounded.
   */
   _func : function (parms)
   {
      var l = parms.length;
      if (!l)
         return NaN;
      var s = 0;
      for (var i = 0; i < l; i++)
         s += parms[i];
      return s / l;
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("CalcItems.Avg", jTAC._internal.temp._CalcItems_Avg);

if (jTAC.parser)
   jTAC.parser.register("CalcItems.Avg");
