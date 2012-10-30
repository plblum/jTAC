// jTAC/CalcItems/UserFunction.js
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
Class : CalcItems.UserFunction
Extends: CalcItems.BaseFunction

Purpose:
Calls your own function in its evaluate() method. Allows you
to add custom code into the calculation.

Your function takes one parameter and must return a number or NaN.
The parameter will be an array of numbers, determined by evaluating
the CalcItems in the parms property.

Your function can use or ignore the values passsed in.

This example calculates the sum of the values in parms:

function (parms) {
   var total = 0;
   for (var i = 0; i < parms.length; i++)
      total = total + parms[i];
   return total;
}
See \jTAC\CalcItems\Base.js for an overview of CalcItems.

Properties introduced by this class:
   func (function) - 
      Reference to a function to call.

Parsing calculation expressions:
A function named "Function" where the first parameter is the name of a globally defined
function to call (assigned to the window object) and the remaining parameters are 
a comma delimited list of calculation expressions.
The function must follow the definition giving by CalcItems.UserFunction.
   Function("function name", calculation expression1, calculation expression2)

   Function("MyFunction", "TextBox1", 100)



Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
CalcItems.Base
CalcItems.BaseFunction

----------------------------------------------------------- */
jTAC._internal.temp._CalcItems_UserFunction = {
   extend: "CalcItems.BaseFunction",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      func: null
   },

   configrules: {
      func: jTAC.checkAsFunctionOrNull
   },

   /*
   Call to determine if the CalcItem can be evaluated.
   If it returns true, you can call evaluate().
   This returns false if no function is assigned.
   */
   canEvaluate : function () {
      var func = this.getFunc();
      if (!func)
         return false;
      return this.callParent();
   },

   /* 
   If the connection cannot supply a number, it returns NaN or 0
   depending on the Func and Func properties.
   Otherwise, it returns the number of the connection.
   */
   _func : function (parms) {
      var func = this.getFunc();
      if (!func) {
         return NaN;
      }
      return func.call(this, parms);
   },


/* ---- PARSER SUPPORT ------------------------------------- */

   _getParseName: function () {
      return "Function";
   },

   /*
   First parameter is the function name, represented by an id.
   The remainder are calculation expressions.
   */
   _getParseParms: function (text, parser) {
      var r,
      parms = [];
      r = parser.asId();
      if (!r)
         parser.err(text, "First parameter must be a function name.", this);
      parms.push(r.id);
      text = r.rem;
      r = this.callParent([text]);
      if (r) {
         parms = parms.concat(r.parms);
         text = r.rem;
      }
      return parms;
   },

   _convertParseParms: function (parms) {
      var name = parms.shift();
      var ci = this.callParent([parms]);
      ci.setFunc(name);
      return ci;
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("CalcItems.UserFunction", jTAC._internal.temp._CalcItems_UserFunction);

if (jTAC.parser)
   jTAC.parser.register("CalcItems.UserFunction");
