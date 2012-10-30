// jTAC/CalcItems/Round.js
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
Class : CalcItems.Round
Extends: CalcItems.BaseFunction

Purpose:
Returns the rounded value using rules defined in the [roundMode]
and [maxDecimalPlaces] properties. It can also indicate an error
if the maximum decimal places are exceeded.

Only supports one number passed in.

See \jTAC\CalcItems\Base.js for an overview of CalcItems.

Properties introduced by this class:
   roundMode (int) - 
      Determines the way to round. 
         0 = Point5: round to the next number if .5 or higher; round down otherwise
         1 = Currency: round to the nearest even number.
         2 = Truncate: drop any decimals after mdp; largest integer less than or equal to a number.
         3 = Ceiling: round to the nearest even number.
         4 = NextWhole: Like ceiling, but negative numbers are rounded lower instead of higher
         null = Report an error (return NaN).
      Defaults to 0.
   maxDecimalPlaces (int) - 
      Determines the maximum number of decimal digits that are legal. 
      If there are more, it is either a validation error or rounded,
      depending on roundMode.
      Defaults to 3.

Parsing calculation expressions:
1) A function named "Round" with several parameters.
   Round(calculation expression[, roundmode, maxdecimalplaces)
   - calculation expression
   - roundmode (optional) defines how to round with these values:
         0 = Point5: round to the next number if .5 or higher; round down otherwise
         1 = Currency: round to the nearest even number.
         2 = Truncate: drop any decimals after mdp; largest integer less than or equal to a number.
         3 = Ceiling: round to the nearest even number.
         4 = NextWhole: Like ceiling, but negative numbers are rounded lower instead of higher
     When not assigned, it uses 0.
   - maxdecimalplaces (optional) defines at how many decimal places to round.
     When 0, round as an integer. When not assigned, it uses 3.

     Round("TextBox1" + "TextBox2")
     Round("TextBox1" + "TextBox2", 2)
     Round("TextBox1" + "TextBox2", 2, 3)

2) A function named "Math.round" to mimic the javascript function for Point5 rounding
   to the nearest integer.
   It takes one parameter, the calculation expression.
   Math.round(calculation expression)

3) A function named "Math.floor" to mimic the javascript function for Truncate rounding
   to the nearest integer lower than the value provided.
   It takes one parameter, the calculation expression.
   Math.floor(calculation expression)

4) A function named "Math.ceil" to mimic the javascript function for Ceiling rounding
   to the nearest integer higher than the value provided.
   It takes one parameter, the calculation expression.
   Math.ceiling(calculation expression)


Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
CalcItems.Base
CalcItems.BaseFunction
TypeManagers.Base

----------------------------------------------------------- */
jTAC._internal.temp._CalcItems_Round = {
   extend: "CalcItems.BaseFunction",
   require: "TypeManagers.Base",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      roundMode: 2, 
      maxDecimalPlaces: 3
   },

   /* 
   Uses the jTAC.TypeManagers.Base.prototype.round function.
   */
   _func: function ( parms ) {
      try {
         return jTAC.TypeManagers.Base.prototype.round(parms, this.getRoundMode(), this.getMaxDecimalPlaces());
      }
      catch (e) {
      // rounding error reported, due to roundMode = null.
         return NaN; 
      }
   },

   _numParms: function () {
      return 1;
   },

/* ---- PARSER SUPPORT ------------------------------------- */

   /*
   Handles all formats. Looks for "Round(", "Math.round(", "Math.floor(", "Math.ceil(".
   Does not use the CalcItems.BaseFunction's parse() method at all.
   */
   parse: function (text, parser) {
      this._checkParser(parser);
      var r = parser.asExact(text, "Round(");
      if (r) {
         text = r.rem;
         return this._parseRound(text, parser);
      }
      var ci,
      roundmode = 0;

      r = parser.asExact(text, "Math.round(");
      if (r) {
         roundmode = 0;
      }
      else {
         r = parser.asExact(text, "Math.floor(");
         if (r) {
            roundmode = 2;
         }
         else {
            r = parser.asExact(text, "Math.ceil(");
            if (r) {
               roundmode = 3;
            }
            else {
               return null;   // no match
            }

         }
      }
      text = r.rem;

      r = this._getParseParms(text, parser);
      ci = jTAC.create("CalcItems.Round");
      ci.setParms(r.parms);
      ci.setRoundMode(roundmode);
      ci.setMaxDecimalPlaces(0);
      return { obj: ci, rem: r.rem };
   },

   /* 
   Used with the "Round(" lead text. There are up to 3 parameters.
   - calculation expression (required)
   - roundMode (optional, integer). null also valid
   - maxdecimalplaces (optional, integer). null also valid
   */
   _parseRound: function (text, parser) {
      var ci,
      mdp = 3,
      roundmode = 0,
      // calculation expression
      r = this.calcexpr(text, parser);
      if (!r)
         parser.err(text, "Must be an expression.", this);
      text = r.rem;
      ci = r.ci;

      r = parser.asParmDelim(text, false);
      if (!r || r.delim == "}")
         parser.err(text, "parameter missing terminating delimiter", this);
      text = r.rem;
      if (r.delim == ",") {
         var re = /^\s*([01234])/;
         var m = re.exec(text);
         if (!m) {
            r = parser.asId(text);
            if (r) {
               text = r.rem;
               switch (r.id) {
                  case "point5":
                  case "round":
                     roundmode = 0;
                     break;
                  case "currency":
                     roundmode = 1;
                     break;
                  case "truncate":
                  case "floor":
                     roundmode = 2;
                     break;
                  case "ceiling":
                  case "ceil":
                     roundmode = 3;
                     break;
                  case "nextwhole":
                     roundmode = 4;
                     break;
                  default:
                     parser.err(text, "Valid values: point5, truncate, currency, ceiling, nextwhole", this);
               }  // switch
            }
            else {
            // when null, use the default roundmode which is 0
               r = parser.asNull(text, true);
            }
            text = r.rem;
         }
         else {
            roundmode = parseInt(m[1], 10);
            text = text.substr(m[0].length);
         }

         r = parser.asParmDelim(text, false);
         if (!r || r.delim == "}")
            parser.err(text, "parameter missing terminating delimiter", this);
         text = r.rem;
         if (r.delim == ",") {
            r = parser.asInt(text, false);
            if (r) {
               mdp = r.number;
            }
            else {
               r = parser.asNull(text, true);
            }
            text = r.rem;

            r = parser.asParmDelim(text, false);
            if (!r || r.delim != ")")
               parser.err(text, "parameter missing terminating delimiter", this);
            text = r.rem;
         }
      }
      var rci = jTAC.create("CalcItems.Round");
      rci.setParms(ci);
      rci.setRoundMode(roundmode);
      rci.setMaxDecimalPlaces(mdp);

      return { obj: rci, rem: text };

   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("CalcItems.Round", jTAC._internal.temp._CalcItems_Round);

if (jTAC.parser)
   jTAC.parser.register("CalcItems.Round");
