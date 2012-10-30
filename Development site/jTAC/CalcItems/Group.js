// jTAC/CalcItems/Group.js
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
Class : CalcItems.Group
Extends: CalcItems.Base

Purpose:
Holds an array of CalcItems. Calculates them together as a group, 
like when you enclose elements in parenthesis in an expression.
Each CalcItem object that is added to the group has its own [operator]
property to determine how its calculated.

Handles 80 bit math rounding errors usually seen with javascript.

See \jTAC\Calculations\CalcItems\Base.js for an overview of CalcItems.

Properties introduced by this class:
   items (Array of CalcItem objects) - 
      A list of CalcItems to perform the calculations upon.
      If any of these items returns NaN or null from its calculation,
      the valueWhenInvalid or valueWhenNull properties determine
      how to handle those cases.

   valueWhenInvalid (CalcItem object) -
      If a child CalcItem returns NaN, this provides an alternative CalcItem object.
      Its calculation either replaces the CalcItem that failed or
      replaces the entire Group's calculation,
      depending on the stopProcessing defined on the valueWhenInvalid CalcItem object.
      If the value returned by this CalcItem is either NaN or null,
      that value is returned by CalcItems.Group. 
      (Only a number value can continue processing the remaining items.)
      Typically you assign a constant of 0 using CalcItems.Number(0)
      or NaN using CalcItems.NaN (that is actually the default).
      It defaults to CalcItems.NaN.

   valueWhenNull (CalcItem object) -
      If a child CalcItem returns null, this provides an alternative CalcItem object.
      Its calculation either replaces the CalcItem that failed or
      replaces the entire Group's calculation,
      depending on the stopProcessing defined on the valueWhenNull CalcItem object.
      If the value returned by this CalcItem is either NaN or null,
      that value is returned by CalcItems.Group. 
      (Only a number value can continue processing the remaining items.)
      Typically you assign a constant of 0 using CalcItems.Number(0)
      or null using CalcItems.Null (that is actually the default).
      It defaults to CalcItems.Number(0).

   valueWhenEmpty (CalcItem object) -
      If the items is empty or all of its children cannot evaluate,
      it evaluates this CalcItem.
      Typically you assign a constant of 0 using CalcItems.Number(0)
      (that is actually the default) or NaN using CalcItems.NaN.
      However, its valid to use any CalcItem.
      It defaults to CalcItems.Number(0).

ALERT: 
Any property that accepts a CalcItem (including the child elements of [items]) 
all support these values:
   * CalcItems subclass
   * JSon that converts to a CalcItem by specifying the class name in the jtacClass property
   * String - Must be the id of an element on the page. Converts to CalcItems.Element
   * Number - Converts to CalcItems.Number
   * Null - Converts to CalcItems.Null
   * NaN - Converts to CalcItems.NaN
   * Array - Contents can be any of the above types. Converts to CalcItems.Group with child CalcItems

Parsing calculation expressions:
A list of 1 or more child calculation expressions representing other CalcItems
optionally enclosed by parenthesis. Each is separated by one of the math operators: + - * /
(calculation expression1)
(calculation expression1 + calculation expression2 - calculation expression3)
calculation expression1 + calculation expression2 - calculation expression3

Note: If it finds a single calculation expression in the parenthesis, it 
does not return a CalcItems.Group object. Instead, it returns a CalcItem reflecting the expression.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
CalcItems.Base
CalcItems.Number
CalcItems.NaN
TypeManagers.Base
TypeManagers.BaseGlobalize
TypeManagers.BaseNumbers
TypeManagers.Float

----------------------------------------------------------- */
jTAC._internal.temp._CalcItems_Group = {
   extend: "CalcItems.Base",
   require: ["CalcItems.NaN", "CalcItems.Number", "TypeManagers.Float"],

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      items: [],
      valueWhenEmpty: "CalcItems.Number", // jTAC.checkAsCalcItem will convert this to an instance
      valueWhenInvalid: "CalcItems.NaN",
      valueWhenNull: "CalcItems.Number"
   },

   configrules: {
      valueWhenEmpty: jTAC.checkAsCalcItem,
      valueWhenInvalid: jTAC.checkAsCalcItem,
      valueWhenNull: jTAC.checkAsCalcItem
   },

   /*
   Call to determine if the CalcItem can be evaluated.
   If it returns true, you can call evaluate().
   This returns false if no CalcItem exists in items.
   */
   canEvaluate: function () {
      if (!this.getItems().length) {
         return false;
      }
      return this.callParent();
   },


   /* 
   Returns the total from all calcItems. 
   If any CalcItem returns NaN, it uses valueWhenInvalid 
   to determine how to proceed.
   If any CalcItem returns null, it uses valueWhenNull
   to determine how to proceed.
   If the entire list was empty or all items returned false
   from canEvaluate(), it uses valueWhenEmpty to determine
   the result.
   There are some serious challenges with 80 bit floating point math
   that are managed through the rounding logic here.
   */
   evaluate: function () {
      try {
         this._pushContext();

         this._cleanupItems();
         var items = this.getItems();
         var ttl = 0;   // total
         var ftm = jTAC.create("TypeManagers.Float");   // provides tools for rounding
         var empty = true;

         for (var i = 0; i < items.length; i++) {
            if (items[i].canEvaluate()) {
               empty = false;
               var val = items[i].evaluate();
               if (isNaN(val)) {
                  var vwi = this.getValueWhenInvalid();
                  if (!vwi || !vwi.canEvaluate()) {
                     return NaN;
                  }
                  val = vwi.evaluate();
                  if (isNaN(val) || (val == null) || vwi.getStopProcessing()) {
                     return val; // replacement for the group calculation
                  }
                  // if here, the value becomes part of this group's calculation.
               }
               else if (val == null) {
                  var vwe = this.getValueWhenNull();
                  if (!vwe || !vwe.canEvaluate()) {
                     return null;
                  }
                  val = vwe.evaluate();
                  if (isNaN(val) || (val == null) || vwe.getStopProcessing()) {
                     return val; // replacement for the group calculation
                  }
                  // if here, the value becomes part of this group's calculation.
               }
               // special case. First item ignores operator.
               // No need to deal with rounding.
               // Also doesn't address if the first item's canEvaluate() returns false.
               if (!i) {
                  ttl = val;
                  continue;
               }

               // clean up math errors with a little rounding.
               // Capture # of dec places in current value
               var cu = 1;  //CleanUp with rounding when 1. Set to 0 if division is used
               var vdp = ftm.numDecPlaces(val);  // value's decimal places
               var tdp = ftm.numDecPlaces(ttl); // total's decimal places
               // use the operator to include it in the total
               switch (items[i].getOperator()) {
                  case "+":
                     vdp = Math.max(vdp, tdp);  // used by rounding
                     ttl += val;
                     break;
                  case "-":
                     vdp = Math.max(vdp, tdp);  // used by rounding
                     ttl -= val;
                     break;
                  case "*":
                     // Decimal multiplication will have at most
                     // the # of decimal places of each value added together.
                     // Example: if ttl has 2 dec and val has 3, vdp needs to be 5.
                     vdp = vdp + tdp;
                     ttl *= val;
                     break;
                  case "/":  // divide - watch for divide by zero errors
                     if (val != 0.0)
                        ttl = ttl / val;
                     else
                        return NaN;
                     cu = 0; //decimalPlaces is unknown, turn off cleanup because 1/3 = 0.333333333333 which needs to be preserved
                     break;
               }  // switch

               // clean up math errors with a little rounding.
               // Always round to the highest precision needed, using Point5 method
               // vdp is the precision
               // This is to prevent any floating point rounding that javascript does
               // during basic mathmatical operations
               if (cu) {
                  ttl = ftm.round(ttl, 0, vdp);
               }

            }
         }  // for
         if (empty) {
            var vwe = this.getValueWhenEmpty();
            if (!vwe || !vwe.canEvaluate()) {
               return null;
            }
            return vwe.evaluate();
         }
         return ttl;
      }
      finally {
         this._popContext();
      }
   },

   /*
   Looks through the items collection. If any are JSON objects, they are converted
   to CalcItems. If there are any strings representing operators, they
   are applied to the next CalcItem.
   If any are illegal entries, an exception is thrown.
   */
   _cleanupItems: function () {
      var items = this.getItems();
      var nextOp = null;
      for (var i = 0; i < items.length; i++) {
         var item = items[i];
         // look for operator strings
         if ((typeof item == "string") && ("+-*/".indexOf(item) > -1)) {
            nextOp = item;
         // strip out the operator
            items.splice(i, 1);
            if (i >= items.length)
               continue;
            item = items[i];

         }
         item = this._cleanupCalcItemInput(item);
         items[i] = item;
         if (nextOp) {
            item.operator = nextOp;
            nextOp = null;
         }
      }  // for
   },

   /* 
   Adds a CalcItem to the end of the Items collection.
   item - Can be any of these:
   * CalcItems subclass
   * JSon that converts to a CalcItem by specifying the class name in the jtacClass property
   * String - Must be the id of an element on the page. Converts to CalcItems.Element
   * Number - Converts to CalcItems.Number
   * Null - Converts to CalcItems.Null
   * NaN - Converts to CalcItems.NaN
   * Array - Contents can be any of the above types. Converts to CalcItems.Group with child CalcItems
   operator - Optional. If supplied, it is a string with one of these values: "+" "-", "*", "/".
   Assigns the operator property.
   */
   addItem: function (item, operator) {
      this._cleanupItems();  // may throw exception
      item = this._cleanupCalcItemInput(item);  // may throw exception
      if (operator) {
         item.operator = operator;
      }
      this.getItems().push(item);
   },

   /*
   Let's the caller retrieve the collection instances defined in 
   the CalcItem subclass into a new list.
      list (Array) - Add collection objects to this list.
   */
   collectConnections: function (list) {
      this._cleanupItems();
      var items = this.getItems();
      for (var i = 0; i < items.length; i++) {
         items[i].collectConnections(list);
      }  // for

   },

   parse : function (text, parser) {
      try {
         this._pushContext();

         this._checkParser(parser);
         var r = parser.oParen(text),
         ci;
         if (r) {
            text = r.rem;
            r = this.calcexpr(text, parser); // it returns either a CalcItems.Group or another CalcItem type. Either case, this value is actually returned.
            if (r) {
               text = r.rem;
               ci = r.ci;
               r = parser.cParen(text);
               if (r) {
                  return { obj: ci, rem: r.rem };
               }
               else
                  parser.err(text, "Missing closing paren.", this);
            }
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
jTAC.define("CalcItems.Group", jTAC._internal.temp._CalcItems_Group);
if (jTAC.parser)
   jTAC.parser.register("CalcItems.Group");

