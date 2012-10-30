// jTAC/CalcItems/Base.js
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
Class : CalcItems.Base     ABSTRACT CLASS
Extends: None

Purpose:
Part of the Calculation widget. These "CalcItem" objects describe a single
element within a calculation. Each object includes two key elements:
* The math operator: + - * \
* The evaluate() method: Evaluates something and returns a number or NaN when
  it could not calculate.

CalcItem classes:
There are a number of CalcItem classes, all subclassed from CalcItems.Base,
which defines the operator property and evaluate() method.
* Element - Evaluates an element on the page, whether DOM element
  or a widget. It uses a Connection object to associate with the element
  and a TypeManager to return a numeric value from the connection. 
  User must specify the id of the element and optionally which TypeManager to use.
  If no TypeManager is identified, TypeManagers.Float is used.
* Group - Holds an array of CalcItems. Calculates them
  together as if they are enclosed in parenthesis.
* Number - Holds a number that is part of the calculation.
* Conditional - Allows IF THEN logic.
  Define a Condition object in its 'condition' property.
  When that condition  evaluates as "success", it evaluates a CalcItem object 
  you define in the 'success' property. 
  When the condition evaluates as "failed", it evaluates a CalcItem object 
  you define in the 'failed' property.
* NaN - Its evaluate function always returns NaN, stopping the calculation.
  NaN means that the calculation failed with an error.
  This is generally used in a CalcItems.Conditional on its 'failed' property.
* Null - Its evaluate function always returns null, stopping the calculation.
  Null means that there is nothing to calculate and its not an error condition.
  This is generally used in a CalcItems.Conditional on its 'failed' property
  and in Groups's valueWhenNull and valueWhenEmpty properties.


Essential Methods:
   canEvaluate() - Returns true if the Condition is enabled and ready to evaluate data.
   evaluate() - Evaluates and returns a number, NaN for an error detected, 
      and null for nothing to calculate.

Essential properties:
   enabled (boolean) - 
      When false, evaluate should not be called. canEvaluate() uses it. Defaults to true.
   operator (string) - 
      One of these strings representing a match operator: "+", "-", "*", "/".
   stopProcessing (boolean) - 
      Use by the CalcItems.Group class when a CalcItem in its "items"
      property returns NaN or null. That CalcItem has its value
      replaced by CalcItems defined in the valueWhenNull and valueWhenInvalid
      properties.
      If the CalcItem generates a number, it can be used
      either to replace the null/NaN value in the calculation,
      or to replace the entire calculation with the number.
      When this property is false, the CalcItems.Group
      will replace the value of the CalcItem only.
      When true, the CalcItems.Group will replace
      the entire calculation with the number.
      It defaults to false.

Parsing Calculation Expressions:
Users can create a string in JavaScript-like syntax that can be converted
into CalcItem objects through the parse() method.

The text provided to the parser is called the "calculation expression".

The parse() method is the entry point to each CalcItem class's parsing capabilities.
It is passed the string to parse.
It evaluates the text at the start of the string. If it matches the pattern
supported by the CalcItem class, parsing continues. It returns an object
containing two properties:
  obj - A new instance of the class, prepared based on what the string offered.
  rem - A string which is the remainder for the caller to parse.
    Effectively the parse() function will strip out the part it parsed.
If the CalcItem doesn't support the text at the start of the string, it returns null.

Parsing syntax for each CalcItem class
======================================
General rules:
- Separators can be surrounded by 0 or more whitespace characters.
- Strings can be in single or double quotes
- Syntax should generally look like javascript

See \jTAC\Calculations\CalcItems\Base.js for an overview of CalcItems.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
CalcItems.Base
TypeManagers.Base
If using parsing, Parser.

----------------------------------------------------------- */
if (!window.jTAC)
   throw new Error("window.jTAC not created.");

jTAC._internal.temp._CalcItems_Base = {
   "abstract": true,

   constructor: function ( propertyVals ) {

   },

   config: {
      enabled: true,
      operator: "+",
      stopProcessing: false
   },

   configrules: {
      operator: ["+", "-", "*", "/"]
   },

   /*
   Call to determine if the Condition can be evaluated.
   If it returns true, you can call evaluate().
   */
   canEvaluate : function () {
      if (!this.getEnabled()) {
         return false;
      }
   
      return true;
   },

   /* ABSTRACT METHOD
   Evaluates and returns a number, NaN for an error detected, 
   and null for nothing to calculate.
   */
   evaluate : function () {
      this.AM();
   },

   /*
   Let's the caller retrieve the collection instances defined in 
   the CalcItem subclass into a new list.
      list (Array) - Add collection objects to this list.
   */
   collectConnections : function(list) {
      // this class does nothing.
   },

   /*
   Utility to handle various ways to represent a CalcItem.
   If passed an actual CalcItem object, it is returned.
   If passed a JSon object, it attempts to convert into a CalcItem object.
   If passed an array, it creates CalcItems.Group with child items.
   If passed a number, it creates CalcItems.Number with that value.
   If passed a string, it creates a CalcItems.Element which uses the string as the elementID.
   If passed NaN, it creates CalcItems.NaN.
   If passed Null, it creates CalcItems.Null
   Other values throw an exception.
   */
   _cleanupCalcItemInput : jTAC_CleanupCalcItemInput,

/* STATIC METHOD
Supports parsing calculation expressions.
REQUIRES: jTAC.parser. Caller should ensure it is loaded \jTAC\Parser.js

This is a parser that looks for calculation expressions delimited by math operators (+ - * /).
If it finds one, it returns the actual CalcItem instance for that one expression,
such as CalcItems.Number or CalcItems.Element.
Otherwise, it creates a CalcItems.Group object and collects all 
calculation expressions into its [items] property. Each is assigned the operator
the precedes it.
   text (string) - The content to parse, starting at the first character of this string.
Returns an object with these parameters:
  ci - A CalcItem instance, prepared based on what the string offered.
  rem - A string which is the remainder for the caller to parse.
    Effectively the parse() function will strip out the part it parsed.

This is a static method. Call it from anywhere like this: 
jTAC.CalcItems.Base.prototype.calcexpr("string").
*/
   calcexpr: function(text, parser, callerInst) {
      try {
         jTAC._internal.pushContext(); // uses jTAC._internal because its a static method

         var proto = jTAC.CalcItems.Base.prototype;
         proto._checkParser(parser);
         var r,
         gci = null,   // if assigned, it is a CalcItems.Group object with its children found in the loop
         op = "+"; // the operator for the next calcItem. 
         if (!proto._opRE) {
            proto._opRE = new RegExp("^\\s*([\\+\\-\\*/])");
         }
         while (r = parser.next(text)) {
            text = r.rem;
            r.obj.operator = op;
         
         // see if there is an operator following. If so, add this to a CalcItems.Group object and get the next item
            var m = proto._opRE.exec(text);
            if (m) {
               if (!gci) {
                  gci = jTAC.create("CalcItems.Group");
               }

               op = m[1];
               text = text.substr(m[0].length);
            }

            if (gci) {
               gci.addItem(r.obj);
            }
            if (!m) {
               return { ci: gci ? gci : r.obj, rem : text };
            }

         }  // while

         parser.err(text, "Invalid calculation expression.", callerInst || this);
      }
      finally {
         jTAC._internal.popContext();
      }
   },

/*
Call to test the parser parameter passed to each parse() method.
*/
   _checkParser: function(parser)
   {
      if (!parser)
         this._error("Parser script has not been loaded.");
   }


   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("CalcItems.Base", jTAC._internal.temp._CalcItems_Base);

/* STATIC METHOD
Utility to handle various ways to represent a CalcItem.
If passed an actual CalcItem subclass, it is returned.
If passed a JSon object, it attempts to convert into a CalcItem object.
If passed an array, it creates CalcItems.Group with child items. Each child CalcItem
   uses a "+" operator. You can change that by adding a string item with "+", "-", "*", "/"
   preceding the CalcItem that needs is operator changed.
If passed a number, it creates CalcItems.Number with that value.
If passed a string, it creates a CalcItems.Element which uses the string as the elementID.
If passed NaN, it creates CalcItems.NaN.
If passed Null, it creates CalcItems.Null
Other values throw an exception.
*/
function jTAC_CleanupCalcItemInput(input) {
   try
   {
      jTAC._internal.pushContext("convert data into CalcItem");

      if (input == null) {
         return jTAC.create("CalcItems.Null");
      }
      if (input instanceof Array) {
         var pci = jTAC.create("CalcItems.Group");
         for (var i = 0; i < input.length; i++) {
            pci.items.push(input[i]);
         }
         return pci;
      }
      if (typeof (input) == "number") {
         return isNaN(input) ? jTAC.create("CalcItems.NaN") : jTAC.create("CalcItems.Number", {number: input});
      }
      if (input instanceof jTAC.CalcItems.Base) {
         return input;
      }
      if (typeof (input) == "object") {
         if (!input.jtacClass)
            jTAC.error("Must define the CalcItem's class in the 'jtacClass' property of the object that describes a CalcItem.");
         return jTAC.create(null, input);  // may throw an exception
      }
      if (typeof (input) == "string") {
       // first try for a CalcItem class name. If not found, then its the ID of an element
         var cl = jTAC.createByClassName(input, null, true);
         if (cl && cl instanceof jTAC.CalcItems.Base) {
            return cl;
         }
         if (input.indexOf("CalcItems.") > -1)
            jTAC.error("Must load scripts for the class [" + input + "]");
         return jTAC.create("CalcItems.Element", {elementId: input});
      }
      jTAC.error("Must supply a CalcItem object or an array of CalcItem objects.");
   }
   finally {
      jTAC._internal.popContext();
   }

}


jTAC.checkAsCalcItem = function ( val ) {
   return jTAC_CleanupCalcItemInput(val);
}
jTAC.checkAsCalcItemOrNull = function ( val ) {
   if (!val) // includes null and ""
      return null;
   return jTAC.checkAsCalcItem(val);
}

