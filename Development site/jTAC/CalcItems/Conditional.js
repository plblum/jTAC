// jTAC/CalcItems/Conditional.js
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
Class : CalcItems.Conditional
Extends: CalcItems.Base

Purpose:
Allows IF THEN logic.
Define a Condition object in its [condition] property.
Conditions evaluate something and return "success" and "failed".
See \jTAC\Conditions\Base.js for more.

When that Condition evaluates as "success", it evaluates a CalcItem object 
you define in the [success] property. 

When the Condition evaluates as "failed", it evaluates a CalcItem object 
you define in the [failed] property.

See \jTAC\CalcItems\Base.js for an overview of CalcItems.

Properties introduced by this class:
   condition (Condition object) - 
      The Condition object. Required.
   success (CalcItem object) - 
      The CalcItem to evaluate when the Condition evaluates as "success".
      Its common to assign a CalcItem.Group object to calculate a list of values, but it can
      host any type, including another CalcItem.Conditional object.
      Defaults to CalcItem.Group.
   failed (CalcItem object) - 
      The CalcItem to evaluate when the Condition evaluates as "failed".
      Its common to assign a CalcItem.Group to calculate a list of values, but it can
      host any type, including another CalcItem.Conditional.
      If you want the calculation to stop, assign a CalcItem.NaN here.
      Defaults to CalcItem.Group.
   cannotEvalMode (string) - 
      Determines how the calculation works when the Condition evaluates as "cannot evaluate". 
      Some Conditions cannot evaluate data until certain values exist. 
      For example, the Condition.Range object cannot evaluate until the text in the textbox 
      is formatted to match what is demanded by its TypeManager.
      Values are:
         "error" - Stop the calculation. It’s an error. This is the default.
         "zero" - Return 0.
         "success" - Evaluate the [success] property.
         "failed" - Evaluate the [failed] property.

Parsing calculation expressions:
A function named "Condition" with the with parameters.
Condition(conditional logic[, success calculation][, failed calculation][, JSon with additional property values])
The parameters are:
- condition logic - provides the boolean logic that selects whether to run success or failed calculation.
   Initially this is a JSon representation of the desired Condition class
   where the jtacClass property identifies the name of the class and the remaining properties
   are values to assign to properties on the object created.
   Condition({"jtacClass" : "CompareToValue", "elementId" : "TextBox1", "operator" : "LessThan", "ValueToCompare" : 10, "datatype" : "integer"}, remaining parameters)

   If this parser is expanded to support Conditions, then this parameter will also accept text compatible with those parsers.

- success calculation  The calculation expression to run when the Condition returns "success".
   If this expression is not used, assign the value "null".
   Condition(conditional logic, ("TextBox1" + "TextBox2"), failed calculation, JSon with additional property values)
   Condition(conditional logic, null, failed calculation, JSon with additional property values)

- failed calculation (optional). The calculation expression to run when the Condition returns "failed".
   If this expression is not used, assign the value "null". It can also be omitted if the last two parameters are not needed.
   Condition(conditional logic, success calculation, ("TextBox1" + "TextBox2"), JSon with additional property values)
   Condition(conditional logic, success calculation, null, JSon with additional property values)

- One of two values to provide additional property values:
   1) One of these strings to assign to cannotEvalMode: "error", "zero", "success", "failed"
   2) JSon with additional property values (optional). A JSon with property names found
     on the CalcItems.Conditional class, and the values to assign to those properties.
     Condition(conditional logic, success calculation, failed calculation, { "cannotEvalMode" : "success" })




Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
CalcItems.Base
CalcItems.Group
Conditions.Base


----------------------------------------------------------- */

if (jTAC.isDefined("Conditions.Base")) {  // favored over using the require property because a merged calculations.js file should not require Conditions to be loaded
jTAC._internal.temp._CalcItems_Conditional = {
   extend: "CalcItems.Base",
   require: ["CalcItems.Group", "Conditions.Base"],

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );
      jTAC.require("Conditions.Base");
   },

   config: {
      condition: null,
      success: "CalcItems.Group", // jTAC.checkAsCalcItem will convert this to an instance
      failed: "CalcItems.Group",
      cannotEvalMode: "error"
   },

   configrules: {
      condition: jTAC.checkAsCondition,
      success: jTAC.checkAsCalcItem,
      failed: jTAC.checkAsCalcItem,
      cannotEvalMode: ["error", "zero", "success", "failed"]
   },

   /*
   Call to determine if the CalcItem can be evaluated.
   If it returns true, you can call evaluate().
   This returns false if no Condition is defined or 
   its own canEvaluate() method returns false.
   */
   canEvaluate : function () {
      var cond = this.getCondition();
      if (!cond || !cond.canEvaluate()) {
         return false;
      }
      return this.callParent();
   },

   /* 
   Uses the Condition to select which of 'success' or 'failed'
   properties to evaluate. If the Condition cannot evaluate,
   it uses the rule in the cannotEvalMode property.
   */
   evaluate : function ()
   {
      try {
         this._pushContext();

         var cond = this.getCondition();
         if (!cond || !cond.canEvaluate()) {
            return -1;
         }
         var r = cond.evaluate();
         if (r == -1) {   // cannot evaluate returned
            switch (this.getCannotEvalMode()) {
               case "error":
                  return NaN;
               case "zero":
                  return 0;
               case "success":
                  r = 1;
                  break;
               case "failed":
                  r = 0;
                  break;
            }  // switch
         }  // if

         var item = r ? this.getSuccess() : this.getFailed();
         if (!item || !item.canEvaluate()) {
            return null;
         }
         return item.evaluate();
      }
      finally {
         this._popContext();
      }
   },

   parse: function(text, parser) {
      try {
         this._pushContext();

         this._checkParser(parser);

         var r = parser.asExact(text, "Condition(", false, false, null),
         cond, sci, fci, json, mode;
         if (r) {
            text = r.rem;
            r = parser.asJSon(text, true);
            cond = jTAC.create(null, r.JSon);
            if (!(cond instanceof jTAC.Conditions.Base))
               parser.err(text, "JSon for condition must specify a Condition class", this);
            text = r.rem;

            r = parser.asParmDelim(text, true);
            text = r.rem;

         // success expression or null
            r = parser.asNull(text);
            if (!r) {
               r = this.calcexpr(text, parser); // it returns either a CalcItems.Group or another CalcItem type. Either case, this value is actually returned.
               if (r) {
                  sci = r.ci;
               }
               else
                  parser.err(text, "Missing success parameter", this);
            }
            text = r.rem;

            r = parser.asParmDelim(text, false);
            if (!r || (r.delim == "}"))
               parser.err("Illegal delimiter", this);
            text = r.rem;
            if (r.delim == ",") {
            // failed expression or null
               r = parser.asNull(text);
               if (!r) {
                  r = this.calcexpr(text, parser); // it returns either a CalcItems.Group or another CalcItem type. Either case, this value is actually returned.
                  if (r)
                     fci = r.ci;
               }

               if (r) {
                  text = r.rem;
                  r = parser.asParmDelim(text, false);
                  if (!r || (r.delim == "}"))
                     parser.err("Illegal delimiter", this);
                  text = r.rem;

                  if (r.delim == ",") {
                  // last parameter to set certain properties.
                     r = parser.asId(text, false);  // used with EvalMode. Any string can be returned but assigning an illegal value to the property will throw an exception
                     if (r) {
                        mode = r.id;
                     }
                     else { // try a JSon
                        r = parser.asJSon(text, true);
                        json = r.JSon;
                     }
                     text = r.rem;
                     r = parser.cParen(text, true);
                     text = r.rem;
                  }

               }

            }

            var ci = jTAC.create("CalcItems.Conditional");
            ci.condition = cond;
            ci.success = sci;
            ci.failed = fci;
            if (mode != null) {
               ci.cannotEvalMode = mode;
            }
            if (json) {
               ci.setProperties(json);
            }
            return { obj: ci, rem: text };
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
jTAC.define("CalcItems.Conditional", jTAC._internal.temp._CalcItems_Conditional);
if (jTAC.parser)
   jTAC.parser.register("CalcItems.Conditional");

}