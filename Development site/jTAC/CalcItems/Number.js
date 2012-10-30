// jTAC/CalcItems/Number.js
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
Class : CalcItems.Number
Extends: CalcItems.Base

Purpose:
Holds a number that is part of the calculation.
Assign the number to the [number] property. If not assigned,
that property defaults to 0.

See \jTAC\Calculations\CalcItems\Base.js for an overview of CalcItems.

Properties introduced by this class:
   number (number) - 
      The numeric value to return in the evaluate() method.
      It defaults to 0.

Parsing calculation expressions:
Any number, whether integer or float, positive or negative
in the culture neutral format. (Period is the decimal separator,
there are no thousands separators, minus character to the left without a space after it).
0
-10
200000.00


Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
CalcItems.Base

----------------------------------------------------------- */
jTAC._internal.temp._CalcItems_Number = {
   extend: "CalcItems.Base",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      number: 0
   },

   configrules: {
      number: jTAC.checkAsNumber
   },
   /* 
   Returns the value of the number property.
   */
   evaluate : function () {
      return this.getNumber();
   },

   parse : function(text, parser) {
      try {
         this._pushContext();

         var r = parser.asNumber(text, false);
         if (r) {
            return { obj: jTAC.create("CalcItems.Number", {number: r.number}), rem: r.rem };
         }
         return null;
      }
      finally {
         this._popContext();
      }
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("CalcItems.Number", jTAC._internal.temp._CalcItems_Number);

if (jTAC.parser)
   jTAC.parser.register("CalcItems.Number");
