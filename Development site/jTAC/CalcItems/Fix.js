// jTAC/CalcItems/Fix.js
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
Class : CalcItems.Fix
Extends: CalcItems.BaseFunction

Purpose:
Use when another CalcItem may return null or NaN and you want to replace that
value with something else, such as a CalcItem.Number.

This function normally returns the same value passed in.
If the value is null, it returns the value determined by the CalcItem object
in the [valueWhenNull] property.
If the value is NaN, it returns the value determined by the CalcItem object
in the [valueWhenInvalid] property.

The function's [parms] property takes exactly one CalcItem object.

See \jTAC\CalcItems\Base.js for an overview of CalcItems.

Properties introduced by this class:
None


Parsing calculation expressions:
A function named "Fix" that that has two or three parameters, each a calculation expression.
Fix(calculation expression, calculation expression when null, calculation expression when NaN)
Pass null for either of the 2nd and 3rd parameters to use the default rule,
where null will use CalcItems.Number and NaN will use CalcItems.NaN.

Fix("TextBox1", '0')
Fix("TextBox1", '0', '0')


Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
CalcItems.Base
CalcItems.BaseFunction

----------------------------------------------------------- */
jTAC._internal.temp._CalcItems_Fix = {
   extend: "CalcItems.BaseFunction",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

  
/*
By the time this function is called, the evaluate() function has already
determined that the parameter was null or NaN and applied the values
from [valueWhenNull] and [valueWhenNaN].   
*/
   _func : function (parms) {
      return parms;
   },

   _numParms: function() {
      return 1;
   },

/* ---- PARSER SUPPORT ------------------------------------- */
/* 
Returns the string name of the function, without trailing parenthesis.
By default, it returns the actual class name used by the jTAC.define() function.
*/
   _getParseName: function () {
      return "Fix";
   },

   _numParserParms: function() {
      return 3;
   },

/* 
Expects as many as 3 parameters. The first is assigned as the parameter to be
return by the function. Then second, if defined, replaces [valueWhenNull].
The last, if defined, replaces [valueWhenNaN].
*/
   _convertParseParms: function (parms) {
      var ci, ciNull, ciNaN;
      ci = parms[0];
      ciNull = parms[1] || null;
      ciNaN = parms[2] || null;

      var rci = jTAC.create("CalcItems.Fix");
      rci.setParms([ci]);
      if (ciNull) {
         rci.valueWhenNull = ciNull;
      }
      if (ciNaN) {
         rci.valueWhenInvalid = ciNaN;
      }
      return rci;
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("CalcItems.Fix", jTAC._internal.temp._CalcItems_Fix);

if (jTAC.parser)
   jTAC.parser.register("CalcItems.Fix");
