// jTAC/Conditions/BooleanLogic.js
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
Class : Conditions.BooleanLogic
Extends: Conditions.Base

Purpose:
Defines an AND or OR expression using other Conditions.
For example, RequiredCondition on TextBox1 OR CompareToValueCondition on DecimalTextBox1.
You create Condition objects and add them to the [conditions] property.
Then set the [operator] property to "AND" or "OR".
You can use any type of Condition object including Conditions.BooleanLogic,
which means you can have child boolean expressions.

Evaluation rules:
   If using an AND operator, all child Conditions must evaluate as "success" for this condition to return "success".
   If using an OR operator, at least one child Condition must evaluate as "success" for this condition to return "success".
   If not, it returns "failed".
   If a child Condition returns false from canEvaluate() or returns "cannot evaluate" from evaluate(),
   it is excluded from evaluation. If all child Conditions are excluded, Conditions.BooleanLogic
   returns "cannot evaluate".

Set up:
   Create Condition objects and add them to the [conditions] property. 
   Then set the [operator] property to "AND" or "OR".

   If you want to switch operators, add a Conditions.BooleanLogic with its operator 
   set differently and populate its own [conditions] property to apply against its operator.

   Use the [not] property if you want to reverse the result.

Example to evaluate the following expression:
TextBox1 is required AND (((TextBox2 holds integer) AND (TextBox2 is in range 1 to 10)) OR ((TextBox3 holds integer) AND (TextBox3 is in range 1 to 10)))

Conditions.BooleanLogic  operator="AND" with these child conditions:
   Conditions.Required elementId="TextBox1"
   Conditions.BooleanLogic operator="OR" with these child conditions:
      Conditions.BooleanLogic operator="AND" with these child conditions:
         Conditions.DataTypeCheck elementId="TextBox2" datatype="Integer"
         Conditions.Range elementId="TextBox2" datatype="Integer" minimum=1 maximum=10
      Conditions.BooleanLogic operator="AND" with these child conditions:
         Conditions.DataTypeCheck elementId="TextBox3" datatype="Integer"
         Conditions.Range elementId="TextBox3" datatype="Integer" minimum=1 maximum=10

Here is the above logic represented in JSon:
{"jtacClass" : "BooleanLogic", "operator": "AND", 
  "conditions": [
    {"jtacClass": "Required", "elementId" : "TextBox1" },
    {"jtacClass" : "BooleanLogic", "operator": "OR", 
     "conditions": [
      { "jtacClass" : "BooleanLogic", "operator": "AND", 
        "conditions": [
         {"jtacClass" : "DataTypeCheck", "elementId" : "TextBox2" },
         {"jtacClass" : "Range", "elementId" : "TextBox2", "minimum" : 1, "maximum": 10 }
        ] },
      {"jtacClass" : "BooleanLogic", "operator": "AND", 
        "conditions": [
         {"jtacClass" : "DataTypeCheck", "elementId" : "TextBox3" },
         {"jtacClass" : "Range", "elementId" : "TextBox3", "minimum" : 1, "maximum": 10 }
        ] }
      ] }
 ] }


See \jTAC\Conditions\Base.js for an overview of Conditions.

Properties introduced by this class:
   operator (string) -
      Determines the boolean operator. Only allows "AND", "OR".
      Defaults to "OR".

   conditions (array of Condition objects) - 
      Add any Condition object that defines elements of the logic
      between each AND or OR operator. If you want to switch
      operators, add a Conditions.BooleanLogic with its operator set
      differently and its child Condition classes to apply against its own operator.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Conditions.Base

----------------------------------------------------------- */
jTAC._internal.temp._Conditions_BooleanLogic = {
   extend: "Conditions.Base",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      operator: "OR",
      conditions: []
   },

   configrules: {
      operator: ["OR", "AND"]
   },

   /*
   Requires at least one condition to return true.
   */
   canEvaluate : function () {
      if (!this.getConditions().length)
         return false;
   
      return this.callParent();
   },

   /*
   If using an AND operator, all child Conditions must evaluate as "success" for this condition to return "success".
   If using an OR operator, at least one child Condition must evaluate as "success" for this condition to return "success".
   If not, it returns "failed".
   If a child Condition returns false from canEvaluate() or returns "cannot evaluate" from evaluate(),
   it is excluded from evaluation. If all child Conditions are excluded, Condition.BooleanLogic
   returns "cannot evaluate".
   */
   _evaluateRule : function () {
      var ho; // "has one". Set to true if there is a condition to evaluate
      this._cleanupConditions();

      var conds = this.getConditions();
      var and = this.getOperator() == "AND";
      for (var i = 0; i < conds.length; i++) {
         var cond = conds[i];

         if (cond.canEvaluate()) {
            var r = cond.evaluate();
            if (r != -1) {
               ho = true;
               if (r) {  // success
                  if (!and) // at least one is success for "OR" operator
                     return 1;
               }
               else { // failed
                  if (and)
                     return 0;
               }
            }  // if r != -1
         }  // if canEvaluate
      }  // for

      if (!ho) // no conditions were found to report "success" or "failed" means "cannot evaluate"
         return -1;
      return and ? 1 : 0;  // when "and", all were found "success". So return "success". When "or", all were found "failed", so return "failed"
   },

   /*
   Looks through the conditions collection. If any are JSON objects, they are converted
   to Conditions. If any are illegal entries, an exception is thrown.
   */
   _cleanupConditions : function () {
      try
      {
         this._pushContext();

         var conds = this.getConditions();
         for (var i = 0; i < conds.length; i++) {
            var cond = conds[i];
            if (!(cond instanceof jTAC.Conditions.Base) && (typeof (cond) == "object")) {  // see if its a json object.
               if (!cond.jtacClass)
                  this._error("Must define the Condition's class in the 'jtacClass' property of the object that describes a condition.");
               cond = jTAC.create(null, cond);
               conds[i] = cond;
            }
            else if (!(cond instanceof jTAC.Conditions.Base))
               this._error("The conditions property must only contain Condition objects and JSon objects that generate Condition objects.");

         }  // for
      }
      finally {
         this._popContext();
      }

   },

   /*
   Let's the caller retrieve the collection instances into a new list.
   In addition to getting those in the connections property, 
   it returns the connections from child Condition classes.
      list (Array) - Add collection objects to this list.
   */
   collectConnections : function (list) {
      this.callParent([list]);
      this._cleanupConditions();
      var conds = this.getConditions();
      if (conds) {
         for (var i = 0; i < conds.length; i++) {
            conds[i].collectConnections(list);
         }  // for
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
jTAC.define("Conditions.BooleanLogic", jTAC._internal.temp._Conditions_BooleanLogic);
jTAC.defineAlias("BooleanLogic", "Conditions.BooleanLogic");

