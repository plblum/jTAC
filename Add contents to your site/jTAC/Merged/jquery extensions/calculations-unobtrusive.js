// jTAC/Parser.js
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
Module: General

Purpose:
Provides a Parser to convert various textual syntaxes into objects
of jTAC.
When the jTAC.parser object is defined (by loading this file),
each object created by jTAC.create offers the object in its "parser" property.
Subclasses can implement the method parse() which takes a text string
to parse from its first character. If it can extract text from the beginning
of that string, it converts that text into an object instance associated
with the class implementing parse(). It returns an object containing
both that object instance with these elements:
  obj - The object it created.
  rem - A string which is the remainder for the caller to parse.
    Effectively the parse() function will strip out the part it parsed.
If it cannot parse the first part of the string passed, parse() must return null.

The jTAC.parser object defines a number of generic parsing methods including:
* err() - Provides a standarized error message feedback system for parsers.
* asExact() - Extract an exact string.
* asNumber() - Extract a number, whether floating point or integer, in culture neutral format.
* asInt() - Extract an integer, in culture neutral format.
* asBool() - Extract the values of a boolean as the text "true" and "false".
* asParmDelim() - Extract separator characters in a parameter list, either a comma, 
   or a terminating parenthesis or terminating curley braces.
* oParen() - Extract an opening parenthesis
* cParen() - Extract a closing parenthesis
* asJSon() - Look for a Javascript Object Notation string. Extract the object made from that string.
* asNull() - Look for the text "null".
* asNaN() - Look for the text "NaN".
* asId() - Extract a string (in single or double quotes) that is a legal identifier.
   An identifier consists of only letters, digits and underscores.
* asClass() - Extract the next element, which represents an object or optionally null.
   There are three possible values:
   1) a string (in quotes) containing a class name registered with the jTAC.define() or defineAlias().
      It uses the jTAC.create to create an instance of the class. That instance
      is returned.
   2) a JSon object (using the asJSon() method) where its jtacClass property contains a
      class name registered with the jTAC.define or defineAlias.
   3) the string 'null' (using asNull() method).


Any class that offers a parse() method must register an instance of itself
with jTAC.parser.register(). These instances are used to search for a match to 
the next item in the string by calling next().

Parsing syntax general rules:
- Separators can be surrounded by 0 or more whitespace characters.
- Strings can be in single or double quotes
- Syntax should generally look like javascript

Required libraries:
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED

------------------------------------------------------------*/
if (!window.jTAC)
   throw new Error("window.jTAC not created.");

/*-----------------------------------------------------------
The jTAC.parser global object is used by individual
classes' parse() method for its various parsing utility methods.
Those classes must register an instance of themselves by
calling jTAC.parser.register(instance).

Classes created by jTAC.create are extended with a new property, parser,
that keeps a reference to this same instance.
------------------------------------------------------------*/

jTAC.parser =
{
/* 
Global hosting entries made with register().
These have their parse() method called in the order defined here,
until one returns a value. 
*/
   _registered: new Array(),

/* 
Registers a class that supports parsing.
Call it during page initialization, such as after defining
the constructor function:

jTAC.define("namespace.class", { members } ");
jTAC.parser.register("namespace.class" );

Parameters:
   name (string) - A full class name or alias name.
*/
   register: function (name) {
      var cl = jTAC.create(name, null, false);
      this._registered.push(cl);
   },

/*
Parses the text to match the first characters to one of the registered
parsers. The first found will process and return an instance of the object
created from that call. 
This function returns an object with these parameters:
  obj - The object created by the parser.
  rem - A string which is the remainder for the caller to parse.
    Effectively the parse() function will strip out the part it parsed.
If none are found, it returns null.
If there are errors, exceptions are thrown.
*/
   next: function(text) {
      var reg = this._registered;
      for (var i = 0; i < reg.length; i++) {
         var r = reg[i].parse(text, this);
         if (r) {
            return r;
         }  // if r
      }  // for

      return null;
   },


/*
Provides a standarized error message feedback system for parsers.
*/
   err : function(text, details, callerInst, action) {
      var msg = "Could not parse the expression starting here: " + text;
      if (details)
         msg = "Error: " + details + " " + msg;
      jTAC.error(msg, callerInst, action ? action : (callerInst ? null : "Parser"));
   },


/*
Extract the next element, which must exactly match the string passed.
It can be preceded by whitespace.
   text (string) - The content to parse, starting at the first character of this string.
   match (string) - The text to exactly match.
   req (boolean) - Optional. When true, a value is required and exception is thrown if missing
   caseIns (boolean) - Optional. If true, use a case insensitive match.
   afterRE (string) - If the expression should look ahead to ensure the following characters don't conflict,
      specify the pattern to allow here. It will be inserted into a larger expression: (?=[your pattern]|$).
      If null, don't care about what follows.
Returns an object if found, and null if not. The object has these properties:
   rem (string) - the remaining text after the element was extracted
*/
   asExact : function(text, match, req, caseIns, afterRE) {
      var peREs = this._peREs;
      if (!peREs) {
         this._peREs = peREs = [];
      }
      var re = peREs[match];
      if (!re) {
         var pat = "^\\s*" + jTAC.escapeRE(match);
         if (afterRE) {
            pat += "(?=" + afterRE + "|$)";
         }
         peREs[match] = re = new RegExp(pat, caseIns ? "i" : "");
      }
      var m = re.exec(text);
      if (m) {
         return { rem : text.substr(m[0].length) };
      }
      if (req)
         this.err(text, match + " expected.", null, "Parser.asExact");
      return null;

   },

/*
Extract the next element, where it must be a number in culture neutral format.
It can be decimal or integer. It can have a lead minus character.
It can be preceded by whitespace.
   text (string) - The content to parse, starting at the first character of this string.
   req (boolean) - Optional. When true, a value is required and exception is thrown if missing
Returns an object if found, and null if not. The object has these properties:
   number (number) - the number extracted
   rem (string) - the remaining text after the number was extracted
*/
   asNumber : function(text, req) {
      if (!this._numRE) {
         this._numRE = new RegExp("^\\s*(\\-?\\d+(\\.\\d+)?)(?![\\.\\dA-Za-z])");
      }
   // look for delimiter
      var m = this._numRE.exec(text);
      if (m) {
         var n = parseFloat(m[1]);
         return { number: n, rem : text.substr(m[0].length)};
      }

      if (req)
         this.err(text, "Number expected.", null, "Parser.asNumber");
      return null;
   },

/*
Extract the next element, where it must be an integer in culture neutral format.
It can have a lead minus character.
It can be preceded by whitespace.
   text (string) - The content to parse, starting at the first character of this string.
   req (boolean) - Optional. When true, a value is required and exception is thrown if missing
Returns an object if found, and null if not. The object has these properties:
   number (number) - the number extracted
   rem (string) - the remaining text after the number was extracted
*/
   asInt : function(text, req) {
      if (!this._numRE) {
         this._numRE = new RegExp("^\\s*(\\-?\\d+)(?!\\.A-Za-z)");
      }
   // look for delimiter
      var m = this._numRE.exec(text);
      if (m) {
         var n = parseInt(m[1], 10);
         return { number: n, rem : text.substr(m[0].length)};
      }

      if (req)
         this.err(text, "Integer expected.", null, "Parser.asInt");
      return null;
   },

/*
Extract the next element, where it must be one of these strings (without quotes):
true or false. Uses a case sensitive match.
It can be preceded by whitespace.
   text (string) - The content to parse, starting at the first character of this string.
   req (boolean) - Optional. When true, a value is required and exception is thrown if missing
Returns an object if found, and null if not. The object has these properties:
   bool (number) - the boolean value
   rem (string) - the remaining text after the element was extracted
*/
   asBool : function(text, req) {
      var r = this.asExact(text, "true", false, false, "\\W");
      if (r) {
         r.bool = true;
         return r;
      }
      r = this.asExact(text, "false", false, false, "\\W");
      if (r) {
         r.bool = false;
         return r;
      }
      if (req)
         this.err(text, "true or false expected.", null, "Parser.asBool");
      return null;
   },

/*
Extract the next element, where it must be a parameter delimiter as
one of these characters: comma, closing parenthesis, or curley brace
It can be preceded by whitespace.
   text (string) - The content to parse, starting at the first character of this string.
   req (boolean) - Optional. When true, a value is required and exception is thrown if missing
Returns an object if found, and null if not. The object has these properties:
   delim (string) - the delimiter character extracted
   rem (string) - the remaining text after the element was extracted
*/
   asParmDelim : function(text, req) {
      if (!this._sepRE) {
         this._sepRE = new RegExp("^\\s*(\\,|\\)|\\})");
      }
   // look for delimiter
      var m = this._sepRE.exec(text);
      if (m) {
         return { delim: m[1], rem : text.substr(m[0].length)};
      }

      if (req)
         this.err(text, "Comma or ) character expected.", null, "Parser.asParmDelim");
      return null;
   },

/*
Extract the next element, where it must be a opening parenthesis.
It can be preceded by whitespace.
   text (string) - The content to parse, starting at the first character of this string.
   req (boolean) - Optional. When true, a value is required and exception is thrown if missing
Returns an object if found, and null if not. The object has these properties:
   rem (string) - the remaining text after the element was extracted
*/
   oParen : function (text, req) {
      return this.asExact(text, "(", req, false, null);
   },

/*
Extract the next element, where it must be a closing parenthesis.
It can be preceded by whitespace.
   text (string) - The content to parse, starting at the first character of this string.
   req (boolean) - Optional. When true, a value is required and exception is thrown if missing
Returns an object if found, and null if not. The object has these properties:
   rem (string) - the remaining text after the element was extracted
*/
   cParen : function (text, req) {
      return this.asExact(text, ")", req, false, null);
   },

/*
Utility to extract the next element, where it must be a JSon expression.
This code creates an object that represents the data.
The string must start with a left curley brace and later have a right curley brace.
If both are found, then that string is run through a JSon converter
to make it into the object that is returned.
It handles nested JSon objects too.
   text (string) - The content to parse, starting at the first character of this string.
   req (boolean) - Optional. When true, a value is required and exception is thrown if missing
Returns an object if found, and null if not. The object has these properties:
   JSon(object) - the JSon object
   rem (string) - the remaining text after the element was extracted
*/
   asJSon : function(text, req) {
      var m, obj, re;
   // see if it starts with a lead { (whitespace before allowed)
      if (!/^\s*\{/.test(text)) {
         return null;
      }
   // strip lead whitespace
      m = /^\s*/.exec(text);
      if (m) {
         text = text.substr(m[0].length);
      }

   // collect positions of each { and } throughout the string until balancing } is found
   // NOTE: Don't store this regexp because of the "g" option. It's instance preserves stateful
   // info that we must reset when entering this function. That only happens
   // by creating a new instance.
      var nest = 0;
      re = new RegExp("([\\{\\}])", "g");
      while (m = re.exec(text)) {
         if (m[1] == "{")
            nest++;
         else if (nest) { // m[1] == "}"
            nest--;
            if (!nest) { // endpoint
               try {
                  obj = eval("(" + text.substr(0, m.index + 1) + ");"); 
               }
               catch (e) {
                  this.err(text, "JSon parsing error. " + e.message, null, "Parser.asJSon");
               }

               return { JSon : obj, rem : text.substr(m.index + 1) };
            }
         }
      }  // while
      this.err(text, "JSon parsing error. Missing closing }.", null, "Parser.asJSon");
   },

/*
Extract the next element, which must be "null" (without quotes).
It can be preceded by whitespace.
   text (string) - The content to parse, starting at the first character of this string.
   req (boolean) - Optional. When true, a value is required and exception is thrown if missing
Returns an object if found, and null if not. The object has these properties:
   rem (string) - the remaining text after the element was extracted

   NOTE: Uppercase N on Null is used only because all-lowercase null is a reserved word.
*/
   asNull : function(text, req) {
      return this.asExact(text, "null", req, false, "\\W");
   },

/*
Extract the next element, which must be "NaN" (without quotes).
It can be preceded by whitespace.
   text (string) - The content to parse, starting at the first character of this string.
   req (boolean) - Optional. When true, a value is required and exception is thrown if missing
Returns an object if found, and null if not. The object has these properties:
   rem (string) - the remaining text after the element was extracted
*/
   asNaN : function(text, req) {
      return this.asExact(text, "NaN", req, false, "\\W");
   },

/*
Extract the next element if it is an ID.
An id is a string, enclosed in single or double quotes, and is limited to letters, digits, and underscore.
The first letter cannot be a digit.
It can be preceded by whitespace.
   text (string) - The content to parse, starting at the first character of this string.
   req (boolean) - Optional. When true, a value is required and exception is thrown if missing
Returns an object if found, and null if not. The object has these properties:
   id (string) - the id extracted
   rem (string) - the remaining text after the id was extracted
*/
   asId: function (text, req) {
      if (!this._idRE) {
         this._idRE = new RegExp("^\\s*((\"([A-Za-z_][\\w]*)\")(?=\\W|$))|^\\s*(('([A-Za-z_][\\w]*)')(?=\\W|$))", "i");
      }
      var m = this._idRE.exec(text);
      if (m) {
         var content = m[0];
         if (content)
            return { id: m[3] || m[6], rem : text.substr(content.length)};
      }
      if (req)
         this.err(text, "Id required", null, "Parser.asId");
      return null;
   },

/*
Extract the next element, which represents an object or optionally null.
There are three possible values:
1) a string (in quotes) containing a class name registered with the jTAC.define or defineAlias.
   It uses the jTAC.create to create an instance of the class. That instance
   is returned.
2) a JSon object (using the asJSon() method) where its jtacClass property contains a
   class name registered with the jTAC.define or defineAlias.
3) the string 'null' (using asNull() method).
It can be preceded by whitespace.
   text (string) - The content to parse, starting at the first character of this string.
   allowNull (boolean) - When true, if this value is not found as a class name or JSon,
      it still could look for 'null'.
   valinst (function) - When defined, it is a function that is passed the object created
      from the jTAC.create. It determines if that object is compatible with 
      what the caller wants. It returns true if compatible; false if not.
   req (boolean) - Optional. When true, a value is required and exception is thrown if missing
Returns an object if found, and null if not. The object has these properties:
   obj (object) - the object instance created or null if it found 'null'
   rem (string) - the remaining text after the class was extracted
*/
   asClass : function(text, allowNull, valinst, req) {
      var obj;
      var r = this.asId(text, false);
      if (r) {
         try {
            obj = jTAC.create(r.id);
         }
         catch (e) {
            this.err(text, e.message);
         }
      }
      else {  // Next try a JSon.
         r = this.asJSon(text, false);
         if (r) {
            try {
               obj = jTAC.create(null, r.JSon);
            }
            catch (e) {
               this.err(text, e.message);
            }
         }
         else if (allowNull) {// finally try null
            r = this.asNull(text, false);
            if (r) {
               return {obj : null, rem : r.rem };
            }
         }
      }

      if (obj) {
         if (valinst && !valinst(obj))
            this.err(text, "Unexpected class", null, "Parser.asClass");
         return { obj : obj, rem : r.rem };
      }
      if (req)
         this.err(text, "Class name expected.", null, "Parser.asClass");
      return null;
   }


}  // object assigned to jTAC.parser
﻿// jTAC/CalcItems/Base.js
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

﻿// jTAC/CalcItems/Null.js
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

﻿// jTAC/CalcItems/NaN.js
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
Class : CalcItems.NaN
Extends: CalcItems.Base

Purpose:
NaN means that the calculation failed with an error.

Its evaluate function always returns NaN, stopping the calculation.
This is generally used in a CalcItems.Conditional object on its [failed] property.

See \jTAC\CalcItems\Base.js for an overview of CalcItems.

Properties introduced by this class:
None

Parsing calculation expressions:
The value NaN. (Not in quotes. Case sensitive.)
NaN


Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
CalcItems.Base

----------------------------------------------------------- */
jTAC._internal.temp._CalcItems_NaN = {
   extend: "CalcItems.Base",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

/* 
Returns NaN.
*/
   evaluate : function () {
      return NaN;
   },

   parse: function(text, parser) {
      this._checkParser(parser);
      var r = parser.asNaN(text, false);
      if (r) {
         return { obj: jTAC.create("CalcItems.NaN"), rem: r.rem };
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
jTAC.define("CalcItems.NaN", jTAC._internal.temp._CalcItems_NaN);
if (jTAC.parser)
   jTAC.parser.register("CalcItems.NaN");

﻿// jTAC/CalcItems/Number.js
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
﻿// jTAC/CalcItems/Element.js
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
Class : CalcItems.Element
Extends: CalcItems.Base

Purpose:
Evaluates an element on the page, whether DOM element or a widget. 
It uses a Connection object to associate with the element
and a TypeManager to return a numeric value from the connection. 
User must specify the id of the element in the [elementId] property
or the Connection object in the [connection] property.
If they specify the id, the jTAC.connectionResolver object will
determine the best Connection object for that id.

The TypeManager is determined in several ways:
1. The user can supply it by defining its name in the [datatype] property
   or creating an instance and assigning it to the [typeManager] property.
2. The Connection object may return a TypeManager, especially if the 
   element is a specific datatype like integer, float, or date.
3. If neither of the above supply a TypeManager, TypeManagers.Float is used.

See \jTAC\Calculations\CalcItems\Base.js for an overview of CalcItems.

Properties introduced by this class:
   typeManager (TypeManager object)- 
      Gets the user specified TypeManager object.
      If not defined, the above rules are used to determine it.

   datatype (string) - 
      The datatype assigned to the TypeManager object.
      When setting it, the typeManager property is updated.
      Names are strings registered with jTAC.define() or jTAC.defineAlias(),
      such as "Integer", "Float", "Date", "DateTime", "Currency",
      "Percent", "TimeOfDay", and "Duration". (Those are predefined.)

   connection (Connection object) -
      The Connection object that attaches to the element on the page
      that is the source of the number used in this calculation.
      If you don't set it, its value is determined by the [elementId] property.

   elementId (string) -
      Updates the connection with a new Connection class using this Id
      to identify its element.
      Uses jTAC.connectionResolver to replace the existing
      connection class if the id needs it.

   valueWhenInvalid (CalcItem object) -
      If the connection's value is invalid (cannot be resolved to a number),
      this CalcItem is evaluated.
      Typically you assign a constant of 0 using CalcItems.Number({value:0})
      or NaN using CalcItems.NaN().
      However, its valid to use any CalcItem.
      If you use CalcItems.NaN, it also stops the calculation.
      It defaults to CalcItems.NaN().
      This is a shortcut to using CalcItems.WhenInvalid() around the CalcItems.Element.

   valueWhenNull (CalcItem object) -
      If the Connection determines its value is null (empty textbox for example),
      it evaluates this CalcItem.
      Typically you assign a constant of 0 using CalcItems.Number({value:0})
      or null using CalcItems.Null().
      However, its valid to use any CalcItem.
      It defaults to CalcItems.Null({value:0}).
      This is a shortcut to using CalcItems.WhenNull() around the CalcItems.Element.

Parser rules:
1) The ID of an element alone, as a string: 
   "id". Example: "TextBox1".
   The string pattern must be legal for an HTML ID: letters, digits, underscore, period. No whitespace.
   NOTE: DOM uses a case sensitive match for ids passed into document.getElementById().
2) A function named "Element" with parameters: 
   Element("id")
   - "id" is the same as in #1, a string in quotes.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
CalcItems.Base
CalcItems.Null
CalcItems.NaN
TypeManagers.Base
TypeManagers.BaseGlobalize
TypeManagers.BaseNumber
Either or both: TypeManagers.Integer, TypeManagers.Float
Connections.Base
Connections.BaseElement
Connections.FormElement

----------------------------------------------------------- */
jTAC._internal.temp._CalcItems_Element = {
   extend: "CalcItems.Base",
   require: ["CalcItems.Null", "CalcItems.NaN", "Connections.FormElement", "TypeManagers.BaseNumber"],

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      datatype: "",
      typeManager: null,
      connection: "Connections.FormElement",// jTAC.checkAsConnection will convert this to an instance
      elementId: null,
      valueWhenNull: "CalcItems.Null", // jTAC.checkAsCalcItem will convert this to an instance
      valueWhenInvalid: "CalcItems.NaN"
   },

   configrules: {
      typeManager: jTAC.checkAsTypeManagerOrNull,
      connection: jTAC.checkAsConnectionOrNull,
      valueWhenNull: jTAC.checkAsCalcItem,
      valueWhenInvalid: jTAC.checkAsCalcItem
   },

   /*
   Call to determine if the CalcItem can be evaluated.
   If it returns true, you can call evaluate().
   This returns false if no connection is defined or 
   it does not specify an actual element.
   */
   canEvaluate : function () {
      var conn = this.getConnection();
      if (!conn || !conn.getElement(true)) {
         return false;
      }
      return this.callParent();
   },

   /* 
   If the connection cannot supply a number, it returns NaN, null, or 0
   depending on the valueWhenInvalid and valueWhenNull properties.
   Otherwise, it returns the number of the connection.
   */
   evaluate : function () {
      try {
         this._pushContext();

         var conn = this.getConnection();
         if (conn) {
            if (conn.isNullValue()) {
               var vwn = this.getValueWhenNull();
               if (!vwn || !vwn.canEvaluate()) {
                  return null;
               }
               return vwn.evaluate();
            }
            var tm = this.getTypeManager();
            if (!tm) {
               tm = conn.getTypeManager();
               if (!tm)
                  tm = jTAC.create("TypeManagers.Float");
               this.setTypeManager(tm);
            }

            try {
               if (!conn.isValidValue(tm.storageTypeName()))
                  throw new Error();   // just to jump to the catch statement
               var val = tm.toValueFromConnection(conn);
               return tm.toNumber(val); // while Integer and Float TypeManagers just return their actual value, this helps when using a date or time
            }
            catch (e) { // conversion error. Illegal value
               var vwi = this.getValueWhenInvalid();
               if (!vwi || !vwi.canEvaluate()) {
                  return NaN;
               }
               return vwi.evaluate();
            }
         }
         else {
            return NaN;
         }
      }
      finally {
         this._popContext();
      }
   },

   /*
   Let's the caller retrieve the collection instances defined in 
   the CalcItem subclass into a new list.
      list (Array) - Add collection objects to this list.
   */
   collectConnections : function(list) {
      var conn = this.getConnection();
      if (conn) {
         list.push(conn);
      }
   },


   parse : function (text, parser) {
      try {
         this._pushContext();

         this._checkParser(parser);
         var r, id, tm, conn;

         r = parser.asId(text); // { id: id, rem: remaining text}
         if (r) {
            return { obj: jTAC.create("CalcItems.Element", {elementId: r.id}), rem: r.rem };
         }

      // Element("id")
         r = parser.asExact(text, "Element(", false, false, null);
         if (r)
         {
            text = r.rem; 
         // look at the first parameter: ID
            r = parser.asId(text, true); // { id: id, rem: remaining text}
            text = r.rem;
            var id = r.id;

            r = parser.cParen(text, true);
            text = r.rem;

            return { obj: jTAC.create("CalcItems.Element", {elementId: id}), rem: text };
         }
         return null;
      }
      finally {
         this._popContext();
      }
   },

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

   /* datatype property: GET function
   Gets the datatype assigned to the TypeManager object.
   */
   getDatatype : function () {
      return this.config.typeManager ? this.config.typeManager.dataTypeName() : null;
   },

   setDatatype : function (datatype) {
   // The setTypeManager property does all of the work, converting the string to a TypeManager object
   // and throwing exceptions when the type is unknown.
   // This technique effectively makes setDatatype an alias for setTypeManager,
   // allowing the user to specify either a string or typemanager object.
      this.setTypeManager(datatype);
   },

   /* elementId property: GET function
   Returns the HTML Element ID within the Connection object
   or null if not available.
   */
   getElementId : function () {
      var conn = this.config.connection;
      return conn && conn.getId ? conn.getId() : null;
   },

   /* elementId property: SET function
   Updates the connection with a new Connection class using this Id
   to identify its element.
   Uses jTAC.connectionResolver to replace the existing
   connection class if the id needs it.
   Alternatively, this accepts a Connection object, which it
   redirects to the setConnection method.
   */
   setElementId : function (id) {
      if (typeof id == "object") {
         this.setConnnection(id);
      }
      else {
         var def = jTAC.create("Connections.FormElement", {id: id, allowNone: true} );   // allowNone=true
         var conn = jTAC.connectionResolver.create(id, def);   // may create a replacement connection
         this.config.connection = conn ? conn : def;
      }
   }

}
jTAC.define("CalcItems.Element", jTAC._internal.temp._CalcItems_Element);
if (jTAC.parser)
   jTAC.parser.register("CalcItems.Element");

﻿// jTAC/CalcItems/Group.js
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

﻿// jTAC/CalcItems/Conditional.js
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

}﻿// jTAC/CalcItems/BaseFunction.js
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
Class : CalcItems.BaseFunction
Extends: CalcItems.Base

Purpose:
Defines the evaluate() function to provide specialized math functions.

Subclasses override the _func() method to handle the function.
That function is passed either an array of values or a single value,
depending on the [parms] property contents and the numParms() method.
The caller, evaluate(), goes through the CalcItems defined in the [parms]
property, calling evaluate() on each, to build the value passed to _func().

The _numParms() determines how many parameters are used by your function.
When it returns 0 (the default), it returns an array of every CalcItem defined.
When it returns 1, it returns a single value, from the first CalcItem defined.
When it returns any other value, it returns an array of that many CalcItems defined.

See \jTAC\CalcItems\Base.js for an overview of CalcItems.

Properties introduced by this class:
   parms (Array of CalcItem objects) - 
      A list of CalcItems to perform the calculations upon.
      If any of these parms returns NaN or null from its calculation,
      the [valueWhenInvalid] or [valueWhenNull] properties determine
      how to handle those cases.

   valueWhenInvalid (CalcItem object) -
      If a child CalcItem returns NaN, this provides an alternative CalcItem object.
      Its calculation either replaces the CalcItem that failed or
      replaces the entire Group's calculation,
      depending on the [stopProcessing] property defined on the 
      [valueWhenInvalid] CalcItem object.
      If the value returned by this CalcItem is either NaN or null,
      that value is returned by CalcItems.Group. 
      (Only a number value can continue processing the remaining parms.)
      Typically you assign a constant of 0 using CalcItems.Number
      or NaN using CalcItems.NaN (that is actually the default).
      It defaults to CalcItems.NaN.

   valueWhenNull (CalcItem object) -
      If a child CalcItem returns null, this provides an alternative CalcItem object.
      Its calculation either replaces the CalcItem that failed or
      replaces the entire Group's calculation,
      depending on the [stopProcessing] property defined on the 
      [valueWhenNull] CalcItem object.
      If the value returned by this CalcItem is either NaN or null,
      that value is returned by CalcItems.Group. 
      (Only a number value can continue processing the remaining parms.)
      Typically you assign a constant of 0 using CalcItems.Number
      or null using CalcItems.Null (that is actually the default).
      It defaults to CalcItems.Number.

Parsing calculation expressions:
Functions all have a pattern of:
Name(parameters)
The Name is defined by the _getParseName() method in the subclass.
The parameters are populated by the _getParseParms method, which returns an array
of the parameters.
The conversion to a CalcItem is handled by _convertParseParms().


Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
CalcItems.Base
CalcItems.Number
CalcItems.NaN

----------------------------------------------------------- */
jTAC._internal.temp._CalcItems_BaseFunction = {
   extend: "CalcItems.Base",
   "abstract": true,
   require: ["CalcItems.Number", "CalcItems.NaN"],

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      parms: [],
      valueWhenInvalid: "CalcItems.NaN",// jTAC.checkAsCalcItem will convert this to an instance
      valueWhenNull: "CalcItems.Number"
   },

   configrules: {
      valueWhenInvalid: jTAC.checkAsCalcItem,
      valueWhenNull: jTAC.checkAsCalcItem
   },
   /* 
   If the connection cannot supply a number, it returns NaN or 0
   depending on the Func and Func properties.
   Otherwise, it returns the number of the connection.
   If there are any Parms that calculate to NaN or null (after evaluating
   valueWhenInvalid and valueWhenNull), the function is not called.
   Instead the evaluate function returns immediately with NaN or null.
   If the number of parameters is not reached, it returns NaN.
   */
   evaluate : function () {
      try {
         this._pushContext();
         this._cleanupParms();
         var np = this._numParms();
         var evalparms = [];
         var parms = this.getParms();
         for (var i = 0; i < parms.length; i++) {
            if (np && i > np)
               break;
            var parm = parms[i];
            var val = null;
            if (parm.canEvaluate()) {
               val = parm.evaluate();
               if (isNaN(val)) {
                  var vwi = this.getValueWhenInvalid();
                  if (!vwi || !vwi.canEvaluate()) {
                     return NaN;
                  }
                  val = vwi.evaluate();
                  if (isNaN(val) || (val == null) || vwi.getStopProcessing()) {
                     return val; // replacement for the function calculation
                  }
               }
               else if (val == null) {
                  var vwe = this.getValueWhenNull();
                  if (!vwe || !vwe.canEvaluate()) {
                     return null;
                  }
                  val = vwe.evaluate();
                  if (isNaN(val) || (val == null) || vwe.getStopProcessing()) {
                     return val; // replacement for the function calculation
                  }
               }
               evalparms.push(val);
            }
         }  // for

         if (np && evalparms.length < np) {  // does not have enough parameters to process
            return NaN;
         }
         if (np == 1) {  // convert to the single value
            evalparms = evalparms[0];
         }

         // NOTE: when np = 0, the evalparms array can be empty. Its up to your function to determine how to handle that.

         return this._func(evalparms);
      }
      finally {
         this._popContext();
      }
   },


/* ABSTRACT METHOD
   Evaluate the parameter and return a number, NaN if it is an error condition,
   or null if there is nothing to evaluate.
      parms - This is either an array of numbers, or a single number,
         depending on the _numParms() method. 
         The array can be empty.
*/
   _func : function(parms) {
      this._AM();
   },

/*
   Determines how many parameters are used by your function.
   When it returns 0 (the default), it returns an array of every CalcItem defined.
   When it returns 1, it returns a single value, from the first CalcItem defined.
   When it returns any other value, it returns an array of that many CalcItems defined.
*/
   _numParms : function() {
      return 0;
   },

   /*
   Looks through the parms collection. If any are JSON objects, they are converted
   to CalcItems. If any are illegal entries, an exception is thrown.
   */
   _cleanupParms : function () {
      var parms = this.getParms();
      for (var i = 0; i < parms.length; i++) {
         parms[i] = this._cleanupCalcItemInput(parms[i]);
      }  // for
   },

   /* 
   Adds a CalcItem to the end of the Parms collection.
      parm - Can be any of these:
         * CalcItem object
         * JSon that converts to a CalcItem by specifying the class name in the jtacClass property
         * String - Must be the id of an element on the page. Converts to CalcItems.Element
         * Number - Converts to CalcItems.Number
         * Null - Converts to CalcItems.Null
         * NaN - Converts to CalcItems.NaN
         * Array - Contents can be any of the above types. Converts to CalcItems.Group with child CalcItems

   */
   addParm : function (parm) {
      this._cleanupParms();  // may throw exception
      parm = this._cleanupCalcItemInput(parm);  // may throw exception
      this.getParms().push(parm);
   },

   /*
   Let's the caller retrieve the collection instances defined in 
   the CalcItem subclass into a new list.
      list (Array) - Add collection objects to this list.
   */
   collectConnections : function(list) {
      this._cleanupParms();
      var parms = this.getParms();
      for (var i = 0; i < parms.length; i++) {
         parms[i].collectConnections(list);
      }  // for

   },

/* ---- PARSER SUPPORT ------------------------------------- */

/*
   If text starts with a match to _getParseName + "(" or _getParseName2 + "(",
   it is a match and will process parameters within the parenthesis.
   Otherwise it returns null.
*/
   parse: function (text, parser) {
      try {
         this._pushContext();

         this._checkParser(parser);
         var r = parser.asExact(text, this._getParseName() + "(", false, false, null);
         if (!r) {
            var pn2 = this._getParseName2();
            if (pn2) {
               r = parser.asExact(text, pn2 + "(", false, false, null);
            }
            if (!r) {
               return null;
            }
         }
         text = r.rem;
         r = this._getParseParms(text, parser);

         return { obj: this._convertParseParms(r.parms), rem: r.rem};
         }
      finally {
         this._popContext();
      }
   },

/* 
Returns the string name of the function, without trailing parenthesis.
By default, it returns the actual class name used by the jTAC.define() function.
*/
   _getParseName: function () {
      return this.$className;
   },

/* 
Returns the string name of the function, without trailing parenthesis.
This is an alternative to _getParseName. Returns null if not used.
*/
   _getParseName2: function () {
      return null;
   },

/*
Used by _getParseParms to indicate the number of calculation expression
to be parsed. By default, it returns the same value oas _numParms().
*/
   _numParserParms: function() {
      return this._numParms();
   },

/*
Converts a comma delimited list of parameters until a closing parenthesis is reached.
Returns an object if found, and null if not. The object has these properties:
   parms (array) - an array of parameter values
   rem (string) - the remaining text after the number was extracted
This class assumes all parameters convert to calculation expressions.
*/
   _getParseParms: function (text, parser) {
      var r,
      parms = [],
      np = this._numParserParms(),
      i = 0;
      while (true) {
         r = this.calcexpr(text, parser);
         if (!r)
            parser.err(text, "Missing parameter", this);
         text = r.rem;
         parms.push(r.ci);

         r = parser.asParmDelim(text, false);
         if (!r || r.delim == "}")
            parser.err(text, "parameter missing terminating delimiter", this);
         text = r.rem;
         if (r.delim == ")")  // done!
            return { parms : parms, rem : text };
         i++;
         if (np && (i >= np))
            parser.err(text, "too many calc expressions", this);
      }  // while
   },

/* 
Creates the actual CalcItem object from the parameters.
Returns the CalcItem. If it cannot convert, it should throw an exception (via this.getParser().err()).
This class creates an instance using the fullClassName of this instance
and sets its parms property.
*/
   _convertParseParms: function (parms) {
      var ci = jTAC.create(this.$fullClassName);
      ci.setParms(parms);
      return ci;
   },

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/
   setParms : function (val)
   {
      if (val instanceof Array)
         this.config.parms = val;
      else
      {
         this.config.parms = [this._cleanupCalcItemInput(val)];  // may throw exception
      }
   }
}
jTAC.define("CalcItems.BaseFunction", jTAC._internal.temp._CalcItems_BaseFunction);

﻿// jTAC/CalcItems/Abs.js
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
Class : CalcItems.Abs
Extends: CalcItems.BaseFunction

Purpose:
Returns the absolute value of the number passed in.
Only supports one number passed in.

See \jTAC\CalcItems\Base.js for an overview of CalcItems.

Properties introduced by this class:
None

Parsing calculation expressions:
1) A function named "Abs" that takes one parameter, a calculation expression.
   Abs(calculation expression)

   Abs("TextBox1" - 100)

2) A function named "Math.abs" to minic the javascript function of the same name.
   Math.abs(calculation expression)

   Math.abs("TextBox1" - 100)


Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
CalcItems.Base
CalcItems.BaseFunction

----------------------------------------------------------- */
jTAC._internal.temp._CalcItems_Abs = {
   extend: "CalcItems.BaseFunction",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },


   _func : function (parms) {
      return Math.abs.apply(window, [parms]);
   },

   _numParms : function() {
      return 1;
   },

/* ---- PARSER SUPPORT ------------------------------------- */

   _getParseName2: function () {
      return "Math.abs";
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("CalcItems.Abs", jTAC._internal.temp._CalcItems_Abs);
if (jTAC.parser)
   jTAC.parser.register("CalcItems.Abs");

﻿// jTAC/CalcItems/Avg.js
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
﻿// jTAC/CalcItems/Fix.js
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
﻿// jTAC/CalcItems/Max.js
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
Class : CalcItems.Max
Extends: CalcItems.BaseFunction

Purpose:
Returns the highest valued number from the list passed in.

See \jTAC\CalcItems\Base.js for an overview of CalcItems.

Properties introduced by this class:
None

Parsing calculation expressions:
1) A function named "Max" that a comma delimited list of calculation expressions.
   Max(calculation expression1, calculation expression2, calculation expression3, etc)

   Max("TextBox1", "TextBox2", 100)

2) A function named "Math.Max" to mimic the javascript function of the same name.
   Math.Max(calculation expression1, calculation expression2, calculation expression3, etc)

   Math.Max("TextBox1", "TextBox2", 100)


Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
CalcItems.Base
CalcItems.BaseFunction

----------------------------------------------------------- */
jTAC._internal.temp._CalcItems_Max = {
   extend: "CalcItems.BaseFunction",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },


   _func : function (parms) {
      return Math.max.apply(window, parms);
   },

/* ---- PARSER SUPPORT ------------------------------------- */

   _getParseName2: function () {
      return "Math.max";
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("CalcItems.Max", jTAC._internal.temp._CalcItems_Max);

if (jTAC.parser)
   jTAC.parser.register("CalcItems.Max");
﻿// jTAC/CalcItems/Min.js
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
Class : CalcItems.Min
Extends: CalcItems.BaseFunction

Purpose:
Returns the lowest valued number from the list passed in.

See \jTAC\CalcItems\Base.js for an overview of CalcItems.

Properties introduced by this class:
None

Parsing calculation expressions:
1) A function named "Min" that a comma delimited list of calculation expressions.
   Min(calculation expression1, calculation expression2, calculation expression3, etc)

   Min("TextBox1", "TextBox2", 100)

2) A function named "Math.min" to minic the javascript function of the same name.
   Math.min(calculation expression1, calculation expression2, calculation expression3, etc)

   Math.min("TextBox1", "TextBox2", 100)


Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
CalcItems.Base
CalcItems.BaseFunction

----------------------------------------------------------- */
jTAC._internal.temp._CalcItems_Min = {
   extend: "CalcItems.BaseFunction",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },


   _func : function (parms) {
      return Math.min.apply(window, parms);
   },

/* ---- PARSER SUPPORT ------------------------------------- */

   _getParseName2: function () {
      return "Math.min";
   }


   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("CalcItems.Min", jTAC._internal.temp._CalcItems_Min);

if (jTAC.parser)
   jTAC.parser.register("CalcItems.Min");
﻿// jTAC/CalcItems/Round.js
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
         1 = Currency: Banker's rounding. Like Point5 except when the last digit is 5, round up when the prior digit is odd and round down when even.
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
         1 = Currency: Banker's rounding. Like Point5 except when the last digit is 5, round up when the prior digit is odd and round down when even.
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
﻿// jTAC/CalcItems/UserFunction.js
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
﻿// jTAC/Calculations/Widget.js
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
Class : Calculations.Widget
Extends: None

Purpose:
Calculations.Widget is a UI interface element that runs a calculation
based on the CalcItem objects. It is always assigned to a hidden input field,
which can be defined by the user or created by the Widget. That hidden
field's value contains the current calculation value in neutral number format,
"NaN" if there is an illegal value, or the empty string if no calculation was run.

The Widget can output its value using any Connection object to specify the 
element to display it, and a TypeManager to format the value for that Connection.
Given the flexibility of Connection objects, the output can be to a textbox,
custom data entry widget or even an HTML element whose [innerHTML] property is updated.
(In this last case, use Calculations.WidgetConnection.)

Set up the calculation in the [calcItem] or [expression] property.
[calcItem] will host actual CalcItem objects while [expression] is a 
string with a calculation expression. See \jTAC\CalcItems\Base.js for documentation on both.

Assign the id of the hidden input in the [elementId] property. If this HTML element does not 
exist on the page, it wil be created in the first <form> tag. So if you want to 
locate it elsewhere, explicitly add the hidden input field.
This object will automatically attach itself to the [data-calcWidget] attribute of the hidden field.

Use the Calculations.WidgetConnection class as a Connection object for other jTAC
objects, such as to let a Condition object read its value from a calculation
instead of just an HTML field.

When creating a Calculations.Widget instance, its ready() method needs to run after 
you establish all properties. ready() establishes event handlers to the textboxes
that include values for it to calculation. It also runs an initial calculation
if [calcOnInit] is true.
So call it explicitly. 

Essential Methods:
   canEvaluate() - Returns true if the Calculation is enabled and ready to evaluate data.
      (Tests CalcItem.canEvaluate() on the calcItem property.
   evaluate() - Evaluates and returns a number or NaN.
   ready() - Call after properties have been established to attach
      eventhandlers to the textboxes and to run an initial calculation.
   attachEvent() - Attach an event handler function for the "change", "preCalc" and "postCalc" events.
      Details are below.

Essential properties:
   elementId (string) - 
      The id to the HTML hidden input field element to which this
      object is assigned. If this HTML element does not 
      exist on the page, it wil be created in the first <form> tag. So if you want to 
      locate it elsewhere, explicitly add the hidden input field.

   calcItem (CalcItem object) -
      The initial CalcItem object of the calculation.
      Normally you will use a CalcItems.Group object here.
      If you don't assign it explicitly, a CalcItems.Group object is created for you.

   expression (string) -
      Alternative to setting the [calcItem] property by using a string that uses
      JavaScript syntax to describe the calculation.
      A parser converts the string into CalcItem objects, which then are assigned
      to the [calcItem] property.
      Parsing syntax is described in each CalcItem script file.

   calcOnInit (boolean) -
      When true, ready() will run an initial calculation, updating the [displayConnection]
      for the user's benefit. It defaults to true.

   useChangeEvt (boolean) -
      When true, ready() will attach onchange event handlers to the textboxes associated with the
      calculation, letting them run the calculation after the field is changed. 

   useKeyEvt (boolean) -
      When true, ready() will attach onkeydown and onkeyup event handlers to the textboxes associated with the
      calculation, letting them run the calculation after the onkeyup event. It defaults to false.

   displayConnection (Connection object) - 
      When you want to display the value of the calculation, set this up, either here or
      with the [displayElementId] property.
      This Connection class should be compatible with the type of element it communicates with.

   displayElementId (string) - 
      Assigns the ID of the element that will display the calculated value.
      If [displayConnection] is not assigned, setting this will also define
      [displayConnection]. Otherwise, it just updates the id from displayConnection.

   displayTypeManager (TypeManager object) - 
      Defines how to format the string shown by [displayConnection].
      This value can be set by assigning the [displayDatatype] property too.
      If not assigned, it first checks the displayConnection for a TypeManager.
      If that doesn't work, it uses TypeManagers.Float.
      displayConnection will look for the [data-jtac.datatype] and [data-jtac.typemanager]
      attributes on the HTML element it points to.
      Avoid using TypeManagers that are not intended to handle numbers.

   displayDatatype (string) - 
      Alternative way to set the [displayTypeManager]. Specify the name of
      a TypeManager that was defined with jTAC.define() or jTAC.defineAlias().
      Avoid using TypeManagers that are not intended to handle numbers.
      Supported names include: "Integer", "Float", "Currency", and "Percent".

   displayErrorClass (string) -
      When the calculation reports an error, this style sheet class is assigned
      to the [displayConnection] element.
      It defaults to "calcwidget-error".

   displayNullClass (string) - 
      When the calculation has nothing to show, this style sheet class 
      is assigned to the [displayConnection] element.
      It defaults to "calcwidget-null".

   displayErrorText (string) - 
      When the calculation reports an error, this string is assigned
      to the [displayConnection] element.
      It defaults to "***".

   displayNullText (string) - 
      When the calculation has nothing to show, this string is assigned
      to the [displayConnection] element.
      It defaults to "".

Events:
   "preCalc" - Use attachEvent("preCalc", fnc) to attach your function.
      Function is called prior to calculating. It is the first action of the evaluate() method.
      The function is passed no parameters, but its [this] value is the Calculations.Widget event object.
      If the function returns false, it prevents the rest of evaluate() from running.
      Otherwise, the function result is ignored.

   "postCalc" - Use attachEvent("postCalc", fnc) to attach your function.
      Function is called after calculating, updating the hidden field value, and displaying the result
      with the [displayConnection]. It is the last action of the evaluate() method.
      The function is passed one parameter, the value returned by the calculation.
      Its [this] value is the Calculations.Widget event object.
      The function result is ignored.

   "change" - Use attachEvent("change", fnc) to attach your function.
      Function is called after calculating when the calculated value has changed.
      The function is passed one parameter, the value returned by the calculation.
      Its [this] value is the Calculations.Widget event object.
      The function result is ignored.
      


Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Connections.Base 
Connections.BaseElement 
Connections.FormElement
TypeManagers.Base 
TypeManagers.BaseGlobalize 
TypeManagers.BaseNumber 
TypeManager.Integer
CalcItems.Base 
CalcItems.Null 
CalcItems.NaN 
CalcItems.Number 
CalcItems.Group

If using the expression property, LOAD \jTAC\Parser.js too

----------------------------------------------------------- */
if (!window.jTAC)
   throw new Error("window.jTAC not created.");


jTAC._internal.temp._Calculations_Widget = {

   require: ["Connections.FormElement", "TypeManagers.Integer",
      "CalcItems.Null", "CalcItems.NaN", "CalcItems.Number", "CalcItems.Group"],

   constructor: function ( propertyVals ) {

      this._internal = {
         events: null,  // will hold an array. Use attachEvent
         readied: false,  // used by ready() method to ensure it runs only once
         eval: false, // Used by evaluate() to prevent recursive calls
         lastValue: null,   // The value from the previous evaluate() call. Used by the "change" event.
         lastDisplayTxt: null   // Used by the _keyDnEvt and keyUpEvt to detect changes after a character was edited.  

      }

   },

   config: {
      elementId: null,
      calcItem: "CalcItems.Group",
      expression: null,
      displayConnection: null,
      displayElementId: null,
      displayTypeManager: null,
      displayDatatype: null,
      displayErrorClass: "calcwidget-error",
      displayNullClass: "calcwidget-null",
      displayErrorText: "***",
      displayNullText: "",
      calcOnInit: true,
      useChangeEvt: true,
      useKeyEvt: false
   },

   configrules: {
      elementId: jTAC.checkAsStr,
      calcItem: jTAC.checkAsCalcItemOrNull,
      expression: jTAC.checkAsStrOrNull,
      displayConnection: jTAC.checkAsConnectionOrNull,
      displayTypeManager: jTAC.checkAsTypeManager
   },

   /* 
   Call after all properties have been setup to run the initial calculation
   and attach textbox's onchange events to the evaluation function.
   This is usually called automatically by document.onload.
   If you create the object after that action (including on an AJAX call),
   call this manually.
   */
   ready: function () {
      if (this._internal.readied)
         return;
      this._internal.readied = true;

      if (this.getCalcOnInit()) {
         if (this.canEvaluate()) {
            this.evaluate();
         }
      }

      if (this._needsEvts()) {
         var conns = [];
         this.getCalcItem().collectConnections(conns);
         for (var i = 0; i < conns.length; i++) {
            this._attachEvents(conns[i]);
         }
      }  // if

   },

   /*
   Call before evaluate() to determine if the calculation can be run.
   Returns true if it can. If false, don't call evaluate().
   */
   canEvaluate: function () {
      return this.getCalcItem().canEvaluate();
   },

   /*
   Runs the calculation. Then updates both the hidden field value
   and the display element, if defined.
   If it was an illegal value, it returns NaN. If there was nothing
   to calculate, it returns null. Otherwise it returns a number.
   Calls the preCalc, change, and postCalc event handlers. If preCalc returns false,
   this function returns null.
   */
   evaluate: function () {
      try
      {
         this._pushContext();

         var intnl = this._internal;
         if (this._fireEvent("preCalc", null) == false) {
            return null;
         }

         if (intnl.eval) {   // prevent recursion
            return null;
         }

         intnl.eval = true;
         try {
         
            var val = this.getCalcItem().evaluate();
            this._storeValue(val);
            this._displayValue(val);

         }
         finally {
            intnl.eval = false;
         }

         if (val != intnl.lastValue) {
            this._fireEvent("change", [val]);
         }
         intnl.lastValue = val;

         this._fireEvent("postCalc", [val]);
         return val;
      }
      finally {
         this._popContext();
      }

   },

   /*
   Writes the value to the hidden field specified by [elementId].
   Creates the hidden field if missing.
      val - The value to set. Must be either a number, NaN, or "".
      The hidden field's value will be a string with one of these values:
         number - using culture neutral formatted float.
         "NaN" - if there is an error to report.
         "" - if no calculated value to show.
   */
   _storeValue: function (val) {
      var hf = this._getHiddenFld();

      if (val == null) {
         val = "";
      }

      // valid values: "NaN", "", and number as a string.
      hf.value = isNaN(val) ? "NaN" : val.toString();
   },

   /*
   If the [displayConnection] is setup, this will update its text and style sheet class
   based on the value passed. If the value is a number, it uses the TypeManager
   to format it as a string.
   */
   _displayValue: function (val)
   {
      var conn = this.getDisplayConnection();
      if (!conn)
         return;

      // undo previous style sheet classes
      conn.removeClass(this.getDisplayNullClass());
      conn.removeClass(this.getDisplayErrorClass());
      if (typeof val == "number") {
         if (isNaN(val)) {
            this._displayError(conn);
         }
         else {
            var tm = this.getDisplayTypeManager();
            this._displayNumber(val, conn, tm);
         }
      }
      else {
         this._displayNull(conn);
      }
   },

   /*
   Used by _displayValue to setup the [displayConnection] to indicate an error.
   It uses the [displayErrorText] and [displayErrorClass] properties.
   */
   _displayError: function (conn) {
      conn.setTextValue(this.getDisplayErrorText());
      conn.addClass(this.getDisplayErrorClass());
   },

   /*
   Used by _displayValue to setup the [displayConnection] to indicate no value.
   It uses the [displayNullText] and [displayNullClass] properties.
   */
   _displayNull: function (conn) {
      conn.setTextValue(this.getDisplayNullText());
      conn.addClass(this.getDisplayNullClass());
   },

   /*
   Used by _displayValue to setup the [displayConnection] with the value
   formatted by the [displayTypeManager].
      val (number) - number to convert to a string and show.
      conn (Connection object) - connected element to update.
      tm (TypeManager object) - TypeManager defined 
         by the displayTypeManager property.
   */
   _displayNumber: function (val, conn, tm) {
      conn.setTextValue(tm.toString(val));
   },

   /*
   Returns the DOM element for the hidden field identified
   by the [elementId] property.
   Creates the hidden field in the first <form> if not found.
   Throws exception if the id is not found.
   */
   _getHiddenFld: function () {
      try
      {
         this._pushContext();

         var id = this.getElementId();
         if (!id)
            this._error("Must assign the elementId property.");
         var hf = document.getElementById(id);
         if (!hf) { // create a hidden field in the first form group
            hf = document.createElement("input");
            hf.id = id;
            hf.name = id;
            hf.type = "hidden";
            if (!document.forms.length)
               this._error("Must have a <form> tag.");
            document.forms[0].appendChild(hf);
         }

         if (!hf.calcWidget) {
            hf.calcWidget = this;
         }
         return hf;
      }
      finally {
         this._popContext();
      }

   },

   // --- EVENT HANDLERS -------------------------------------------------------
  
/*
Adds an event handler function.
   name (string) - the name of the event. Choose from "preCalc" and "postCalc" (case sensitive)
   fnc (function) - the function to call. Parameters and return value are specific
      to the event type.   

Supported event types:
   "preCalc" -
      Function is called prior to calculating. It is the first action of the evaluate() method.
      The function is passed no parameters, but its 'this' value is the Calculations.Widget event object.
      If the function returns false, it prevents the rest of evaluate() from running.
      Otherwise, the function result is ignored.
      If you need to establish stateful data that is shared between preCalc and postCalc,
      you can add a field to the Calculations.Widget object so long as the field name
      doesn't conflict with existing properties.

   "postCalc" -
      Function is called after calculating, updating the hidden field value, and displaying the result
      with the [displayConnection]. It is the last action of the evaluate() method.
      The function is passed one parameter, the value returned by the calculation.
      Its 'this' value is the Calculations.Widget event object.
      The function result is ignored.
      If you need to establish stateful data that is shared between preCalc and postCalc,
      you can add a field to the Calculations.Widget object so long as the field name
      doesn't conflict with existing properties.

   "change" - 
      Function is called after calculating when the calculated value has changed.
      The function is passed one parameter, the value returned by the calculation.
      Its 'this' value is the Calculations.Widget event object.
      The function result is ignored.
*/
   attachEvent: function(name, fnc) {
// an object where each property is 'name'
// and value is an array of functions.
      var e = this._internal.events;
      if (!e) {
         e = {};
         this._internal.events = e;
      }
      var l = e[name];
      if (!l) {
         l = [];
         e[name] = l;
      }
      l.push(fnc);

   },

/*
Removes an event handler function, or all functions for a given name.
   name (string) - The event type. Supported values: "change", "preCalc", "postCalc"
   fnc (function) - Must be the identical object for the function.
      If null, all events for the given name was deleted.
*/
   detachEvent: function(name, fnc) {
      var e = this._internal.events;
      if (!e)
         return;
      var l = e[name];
      if (l) {
         if (!fnc) {
            delete e[name];
         }
         else {
            var i = l.indexOf(fnc);
            if (i > -1)
            {
               l.splice(i, 1);
            }
         }
      }
   },

/*
   Invokes all event handlers for the given event type.
   However, if any event handler function returns a value,
   it stops and returns that value.
      name (string) - Event name to call
      options (array) - Null or an array of parameter values to pass.
*/
   _fireEvent: function(name, options) {
      try
      {
         this._pushContext();

         if (!this._internal.events) {
            return;
         }
         if (typeof options != "object") {
            options = [ options ];
         }
         var l = this._internal.events[name];
         if (l) {
            for (var i = 0; i < l.length; i++) {
               var r = l[i].apply(this, options);
               if (r !== undefined) { // any function that is defined is returned, stopping iterations.
                  return r;
               }
            }
         }
      }
      finally {
         this._popContext();
      }

   },

   /*
   Attached to the connection to handle its onchange event.
   When invoked, it runs evaluate to update the results.
   */
   _changeEvt: function (evt, conn) {
      if (this.canEvaluate())
         this.evaluate();
   },


   /*
   Attached to the connection to handle its onkeyup event.
   When invoked, it runs evaluate to update the results.
   */
   _keyUpEvt: function (evt, conn) {
      if (!conn || (this._internal.lastDisplayTxt == null)) {
         return;
      }
      if ((this._internal.lastDisplayTxt != conn.getTextValue()) && this.canEvaluate()) {
         this.evaluate();
      }
   },

   /*
   Attached to the connection to handle its onkeydown event.
   When invoked, it runs evaluate to update the results.
   */
   _keyDnEvt: function (evt, conn) {
      this._internal.lastDisplayTxt = conn ? conn.getTextValue() : null;
   },


/*
Return true if event handlers need to be setup. This is called to determine
if _attachEvents() should be called.
*/
   _needsEvts : function () {
      return this.getUseChangeEvt() || this.getUseKeyEvt();
   },

/* 
Attach event handlers to the connection object. Called only if
_needsEvts() returns true.
   conn (Connection object) - Call its addEventListener method.
*/
   _attachEvents : function(conn) {
      var that = this;
      if (this.getUseChangeEvt()) {
         conn.addEventListener("onchange", function (evt) { that._changeEvt.call(that, evt, conn);} );
      }
      if (this.getUseKeyEvt()) {
         conn.addEventListener("onkeydown", function (evt) { that._keyDnEvt.call(that, evt, conn);});
         conn.addEventListener("onkeyup", function (evt) { that._keyUpEvt.call(that, evt, conn);});
      }
   },

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/
   setElementId: function (val) {
      this.config.elementId = jTAC.checkAsStr(val);
      if (val) {
        // creates the hidden field if needed. Done here to ensure 
        // its on the page before calculations in case other features need to find it.
         this._getHiddenFld(); 
      }
   },

   setExpression: function (val) {
      try {
         this._pushContext(null, val != null ? val.toString() : "");
      
         var parser = jTAC.parser;
         if (!parser)
            this._error("Must load Parser.js");
         var r = jTAC.CalcItems.Base.prototype.calcexpr(jTAC.checkAsStr(val), parser, this);
         if (!r)
            parser.err(val, "syntax error", this);
         this.setCalcItem(r.ci);
         this.config.expression = val;
      }
      finally {
         this._popContext();
      }
   },

   getDisplayElementId: function () {
      var conn = this.getDisplayConnection();
      return conn && conn.getId ? conn.getId() : null;
   },

   setDisplayElementId: function (id) {
      var def = jTAC.create("Connections.FormElement", {id: id, allowNone: true});  
      var conn = jTAC.connectionResolver.create(id, def);   // may create a replacement connection
      this.config.displayConnection = conn ? conn : def;
   },

   getDisplayTypeManager: function () {
      try
      {
         this._pushContext();

         if (!this.config.displayTypeManager) {
            var tm;
            var conn = this.getDisplayConnection();
            if (conn) {
               tm = conn.getTypeManager();
            }
            if (!tm)
               tm = jTAC.create("TypeManagers.Float");
            this.config.displayTypeManager = tm;
         }
         return this.config.displayTypeManager;
      }
      finally {
         this._popContext();
      }

   },

   getDisplayDatatype: function () {
      return this.config.displayTypeManager ? this.config.displayTypeManager.dataTypeName() : null;
   },

   setDisplayDatatype: function (val) {
      this.setDisplayTypeManager(val);
   }

}
jTAC.define("Calculations.Widget", jTAC._internal.temp._Calculations_Widget);

﻿// jTAC/Calculations/WidgetConnection.js
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
Class : Calculations.WidgetConnection
Extends: Connections.BaseElement

Purpose:
A Connection object that interacts with a hidden input field
associated with a Calculations.Widget object.
It requires the Calculations.Widget has already been initialized.
It gets the value from getTextValue() and getTypedValue()
by calling the Calculations.Widget.evaluate() method.
It supports these types: "Integer", "Float".

Use the addEventListener() method to attach the "onchange" event to 
the Calculations.Widget so each time it calculates, it fires the onchange event.

The getClass() and setClass() methods use the style sheet class
on the element defined by the [displayConnection]. If that property is not setup,
nothing happens.

See \jTAC\Calculations\Widget.js for an overview of Calculations.Widget.
See \jTAC\Connections\Base.js for an overview of Connection objects.

Properties introduced by this class:
None


Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Connections.Base
Connections.BaseElement
Calculations.Widget

----------------------------------------------------------- */
jTAC._internal.temp._CalcItems_WidgetConnection = {
   extend: "Connections.BaseElement",

   require: ["Calculations.Widget"],

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

/*
Utility to retrieve the actual Calculations.Widget object associated with the ID of this connection.
*/
   _getCalcWidget: function () {
      var el = this.getElement(true);
      if (this._checkElement(el)) {
         return el.calcWidget;
      }
      return null;

   },


   /* 
   Returns a string. If no value, it returns the empty string.
   */
   getTextValue: function () {
      var cw = this._getCalcWidget();
      if (cw && cw.canEvaluate()) {
         var val = cw.evaluate();
         if ((val != null) && !isNaN(val)) {
            // format as a string using displayTypeManager
            return cw.getDisplayTypeManager().toString(val);
         }
      }

   },

   /* 
   Does nothing.
   */
   setTextValue: function (text) {
   },

   /*
   Always returns false.
   */
   typeSupported: function (typeName) {
      return (typeName == "integer") || (typeName == "float");
   },

   /*
   Retrieves a value of a specific type (number, Date, boolean, string).
   The caller must call typeSupported() first to determine if this function
   will work.
      typename (string) - If null, use the default type (usually there is a single type supported
         other than string). Otherwise, one of the values that would return
         true when calling typeSupported().
   Returns the value based on the expected type.
   If the value cannot be created in the desired type, it returns null.
   */
   getTypedValue : function (typeName) {
      if (!typeName || this.typeSupported(typeName))
      {
         var cw = this._getCalcWidget();
         if (cw && cw.canEvaluate()) {
            var val = cw.evaluate();
            if ((typeName == "integer") && (Math.floor(val) != val)) { // value has decimal places and the caller wants an integer
               return null;
            }

            return val;
         }

      }
      return null;
   },

   /*
   Does nothing
   */
   setTypedValue : function (value) {
   },

   /*
   Only returns true if Calculations.Widget.evaluate returns null.
   */
   isNullValue: function (override) {
      var cw = this._getCalcWidget();
      if (cw && cw.canEvaluate()) {
         var val = cw.evaluate();
         return val == null;
      }
      return false;
   },

   /*
   Always returns false.
   */
   isEditable: function () {
      return false;
   },

   /*
   Determines if the id or object passed is supported by this class.
   Returns true if it is.
   This evaluates the element for an innerHTML property.
   id (string or object) - If its string, evaluate it as a unique id
   used to identify the element. If its an object, see if its
   the correct class, such as DOMElement.
   Returns true when id is supported by this class and false when not.
   */
   testElement: function (id) {
      if (typeof (id) == "string") {
         id = document.getElementById(id);
      }
      return this._checkElement(id);
   },

   /*
   Utility to determine if the element hosts the Calculations.Widget object
   in its data-calcWidget attribute.
   */
   _checkElement: function (el) {
      if (el && el.calcWidget)
         return true;

      return false;
   },


   /*
   Always returns true.
   */
   isEnabled: function () {
      return true;
   },

   /*
   Determines if the element is visible.
   Returns true if it has a displayConnection setup and that element is visible.
   */
   isVisible : function () {
      var cw = this._getCalcWidget();
      if (cw && cw.getDisplayConnection()) {
         return cw.getDisplayConnection().isVisible();
      }
      return false;
   },

   /*
   Always returns true to let a validator know it has data to be validated.
   */
   isEditable: function () {
      return true;
   },

   /*
   Let's the caller retrieve the collection instances into a new list.
   In addition to getting those in the connections property, subclasses
   can retrieve others which may be elsewhere, such as in a child
   Condition object.
      list (Array) - Add collection objects to this list.
   */
   collectConnections : function(list) {
      var cw = this._getCalcWidget();
      if (cw) {
         cw.getCalcItem().collectConnections(list);
      }
   },

/*
Supports the "onchange" event which maps to the change event type
on the Calculations.Widget.
*/
   addEventListener : function (name, func, funcid) {
      if (name == "onchange") {
         var cw = this._getCalcWidget();
         if (cw) {
            cw.attachEvent("change", func);
            return true;
         }
      }
      return false;
   },

/*
If displayConnection is setup, its class is returned.
Otherwise, it returns "".
*/
   getClass : function() {
      var cw = this._getCalcWidget();
      if (cw) {
         var conn = cw.getDisplayConnection();
         if (conn) {
            return conn.getClass();
         }
      }
      return "";
   },

/*
If displayConnection is setup, its class is updated.
*/
   setClass : function(css) {
      var cw = this._getCalcWidget();
      if (cw) {
         var conn = cw.getDisplayConnection();
         if (conn) {
            conn.setClass(css);
         }
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
jTAC.define("CalcItems.WidgetConnection", jTAC._internal.temp._CalcItems_WidgetConnection);

jTAC.connectionResolver.register("CalcItems.WidgetConnection");
﻿// jTAC/Connections/InnerHtml.js
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
Module: Connection objects
Class : Connections.InnerHtml
Extends: Connections.BaseElement

Purpose:
Interacts with an HTML tag that supports
the innerHTML property, such as <span>, <div>, and <td>.
These tags contain HTML as their value, so they are not type specific. 
Therefore, there is no default TypeManager class.

See \jTAC\Connections\Base.js for an overview of Connections.

Properties introduced by this class:

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Connections.Base

----------------------------------------------------------- */
jTAC._internal.temp._Connections_InnerHtml = {
   extend: "Connections.BaseElement",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   /* 
   Returns a string. If no value, it returns the empty string.
   */
   getTextValue : function () {
      var el = this.getElement();
      if (this._checkElement(el))
         return el.innerHTML;
      return "";

   },

   /* 
   Set the value passing in a string.
     Text (string) - the value to set.
   */
   setTextValue : function (text) {
      var el = this.getElement();
      if (this._checkElement(el))
         el.innerHTML = text;
   },

   /*
   Always returns false.
   */
   typeSupported : function (typeName) {
      return false;
   },

   /*
   Always returns false.
   */
   isNullValue : function (override) {
      return false;
   },

   /*
   Always returns false.
   */
   isEditable : function () {
      return false;
   },

   /*
   Determines if the id or object passed is supported by this class.
   Returns true if it is.
   This evaluates the element for an innerHTML property.
      id (string or object) - If its string, evaluate it as a unique id
         used to identify the element. If its an object, see if its
         the correct class, such as DOMElement.
   Returns true when id is supported by this class and false when not.
   */
   testElement : function(id) {
      if (typeof (id) == "string") {
         id = document.getElementById(id);
      }
      return this._checkElement(id);
   },

/*
Utility to determine if the element is a type of HTML tag that supports
reading and writing the innerHTML property.
Most HTML tags have innerHTML even when they don't actually use it to store data.
*/
   _checkElement : function(el) {
      if (el && (typeof (el) == "object") && (el.tagName !== undefined) && (el.innerHTML !== undefined) && (el.form === undefined)) {
         if (typeof el.innerHTML == "string") {
            return true;
         }
      }

      return false;
   },


   /*
   Always returns true.
   */
   isEnabled : function () {
      return true;
   },

   /*
   Always returns false.
   */
   isEditable : function () {
      return false;
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("Connections.InnerHtml", jTAC._internal.temp._Connections_InnerHtml);

if (jTAC.connectionResolver)
   jTAC.connectionResolver.register("Connections.InnerHtml");
// jTAC/jquery-ui widgets/calculator.js
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
Module: jquery-ui widgets

Purpose:
calculator is a jquery-ui widget that runs a calculation
based on the CalcItem objects. 
It is effectively a wrapper around Calculations.Widget (which does not use jquery).
So use the documentation in /jTAC/Calculations/Widget.js for an overview.

Establishing this ui widget:
1. Add a hidden input field. Assign the id and name properties to the same value.
   This element will host the Calculations.Widget object and hold the current value.
   Its value can be used in a postback too.

2. If working in code, use this to attach the calculator jquery-ui object to
   the hidden field.
   $("selector for the hidden field").calculator(options);
   The options reflect the properties shown below and are the same in the Calculations.Widget class.
   This code usually runs as the page loads, such as in $(document).ready.

3. If you want unobstrusive setup, add the [data-jtac-calculator] attribute to 
   the hidden field. Its value is a JSon description of the properties.

4. The jquery-validator library is supported against the hidden field.
   If you like, add unobtrusive validator rules to the hidden field.

Options:
   calcItem (CalcItem object) -
      The expression to calculate using CalcItem objects.
      calcItem hosts a single CalcItem object, which is the base of the calculation.
      Normally you will use a CalcItems.Group object here.
      If you don't assign it explicitly, a CalcItems.Group is created for you.
      You can either supply this as an instance of a CalcItem object,
      a JSon object that converts into a CalcItem (with the [jtacClass] property
      defined to specify the class name), or a shorthand notation
      that creates simple expressions.

   expression (string) -
      Alternative to setting the [calcItem] property by using a string that uses
      javascript syntax to describe the calculation.
      A parser converts the string into CalcItem objects, which then are assigned
      to the calcItem property.
      Requires /jTAC/Parser.js.
      Parsing syntax is described in each CalcItem object file.
      Note that parsing requires more resources, both in script files loaded
      and work to convert strings to CalcItem objects. If you prefer speed,
      use the [calcItem] property directly.

   calcOnInit (boolean) -
      When true, init() will run an initial calculation, updating the [displayConnection]
      for the user's benefit. It defaults to true.

   useChangeEvt (boolean) -
      When true, init() will attach [onchange] event handlers to the textboxes associated with the
      calculation, letting them run the calculation after the field is changed. 

   useKeyEvt (boolean) -
      When true, init() will attach [onkeydown] and [onkeyup] event handlers to the textboxes associated with the
      calculation, letting them run the calculation after the [onkeyup] event. It defaults to false.

   displayElementId (string) - 
      Assigns the ID of the element that will display the calculated value.
      Only setup if you want to display the value. It's common to avoid displaying
      the value, but still use the calculation to drive other calculations
      or be evaluated by a Condition object.

   displayConnection (Connection class) - 
      When [displayElementId] is object, it creates this object, a Connection object
      to the element that displays the calculated value.
      Generally you assign this when you need to define a different object or parameters
      than given you when [displayElementId] is setup.
      This Connection class should be compatible with the type of element it communicates with.
      Typical types: Connections.InnerHtml and Connections.FormElement.
      You can either supply this as an instance of a Connection class,
      or a JSon object that converts into a Connection class (with the [jtacClass] property
      defined to specify the class name).
      Once setup, you can use the members of the Connection class
      to interact with the element that displays the calculated value.

   displayTypeManager (TypeManager object) - 
      Defines how to format the string shown by [displayConnection].
      This value can be set by assigning the [displayDatatype] property too.
      If not assigned, it uses TypeManagers.Float.
      Avoid using TypeManagers that are not intended to handle numbers.

   displayDatatype (string) - 
      Alternative way to set the [displayTypeManager]. 
      Specify the class name or alias of a TypeManager.
      Avoid using TypeManagers that are not intended to handle numbers.
      Supported names include: "integer", "float", "currency", and "percent".

   displayErrorClass (string) -
      When the calculation reports an error, this style sheet class is assigned
      to the [displayConnection] element.
      It defaults to "calcwidget-error".

   displayNullClass (string) - 
      When the calculation has nothing to show, this style sheet class 
      is assigned to the [displayConnection] element.
      It defaults to "calcwidget-null".

   displayErrorText (string) - 
      When the calculation reports an error, this string is assigned
      to the [displayConnection] element.
      It defaults to "***".

   displayNullText (string) - 
      When the calculation has nothing to show, this string is assigned
      to the [displayConnection] element.
      It defaults to "".
      
   preCalc (function) -
      Function is called prior to calculating. This function must be 
      compatible with jquery's bind() method which demands two parameters:
      event and ui. Both of those parameters will be passed as null to your [preCalc] function.
      If it returns false, the remainder of the calculation is skipped.

   postCalc (function) -
      Function is called after calculating, updating the hidden field value, and displaying the result
      with the [displayConnection].
      This function must be compatible with jquery's bind() method which demands two parameters:
      event and ui. Event will be null. ui will be an object with one property, [value],
      which holds the numeric value of the calculation, null, or NaN.
      It ignores the returned value.

   change (function) -
      Function is called after calculating when the calculated value has changed.
      The function result is ignored.
      This function must be compatible with jquery's bind() method which demands two parameters:
      event and ui. Event will be null. ui will be an object with one property, [value],
      which holds the numeric value of the calculation, null, or NaN.
      change = function(event, ui) { your code. ui.value is the value of the calculation. }.

Required libraries:
ALWAYS LOAD jquery.#.#.#.js
ALWAYS LOAD jquery-ui-#.#.#.js
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
ALWAYS LOAD /jTAC/Calculations/CalcItem classes.js BEFORE THIS FILE IS LOADED
ALWAYS LOAD /jTAC/Calculations/CalcWidget.js BEFORE THIS FILE IS LOADED
ALWAYS LOAD /jTAC/TypeManagers/Base classes.js
ALWAYS LOAD /jTAC/TypeManagers/Numbers.js
When using CalcItems.Conditional, LOAD Conditions.Base AND other Condition classes.

------------------------------------------------------------*/
/* --- jquery-ui extension "calculator" ------------------------------
See documentation in the file header.
-----------------------------------------------------------------------*/
(function($) {  
   var calc = {  
/*
The Calculations.Widget attached to the $element.
*/
      _calcWidget : null,
      options: new jTAC_CalculatorOptions(),

      _create: function() {
         if ( !window.jTAC )
            throw new Error( "window.jTAC not created." );
         jTAC.require(["CalcItems.Base", "Calculations.Widget", "TypeManagers.Float"]);

         var that = this;
         var cw = jTAC.create("Calculations.Widget");
         that._calcWidget = cw;
         cw.elementId = that.element.get()[0].id;  // connects the calcwidget to the hidden field

         cw.attachEvent("preCalc",function () {
            return that._trigger("preCalc", null, { });   // uses options.preCalc if setup
         });
         cw.attachEvent("postCalc",function (val) {
            return that._trigger("postCalc", null, { "value": val  });
         });
         cw.attachEvent("change",function (val) {
            that._trigger("change", null, { "value": val });
            // always returns undefined. This lets CalcWidgets._fireEvent to continue through multiple change events
         });

      },

      _init: function() {  
         try
         {
            jTAC._internal.pushContext("calculator._init()");

            var that = this;
            var o = this.options;

         // convert events that are string names into actual functions
            this._convertEvent("preCalc");
            this._convertEvent("postCalc");
            this._convertEvent("change");

         // populate cw from the options
            var cw = this._calcWidget;

            for (var key in o) {
               var val = o[key];
               if ((val != null) &&  // null indicates to use the default on Calculations.Widget
                   (cw[key] !== undefined) && // property must exist in the destination
                   (typeof (val) != "function")) {  // event handler functions are designed for jquery and not passed into the child
                  cw[key] = val;
               }
            }

            cw.ready();
         }
         finally {
            jTAC._internal.popContext();
         }

      },  

/*
Checks the options for the event name. If it is a string type,
it attempts to convert it into a function.
*/
      _convertEvent: function( evtName ) {
         var evt = this.options[evtName];
         if (evt) {
            if (typeof evt == "string") {
               evt = window[evt];
               if (!evt) {
                  jTAC.warn("Calculator [" + this.element.get()[0].id + "] options include [" + evtName + "]. This must be a globally defined function name to be used.");
                  evt = null;
               }
               this.options[evtName] = evt;
            }

         }
      },

      _setOption: function( key, value ) {
         $.Widget.prototype._setOption.apply( this, arguments );  
         var cw = this._calcWidget;
         switch (key) {
            case "calcItem":
               cw.calcItem = value;
               if (cw.calcOnInit && cw.canEvaluate()) {
                  cw.evaluate();
               }
               break;

            case "calcOnInit":   // a nifty way to invoke calculation on demand. Set calcOnInit to true after init.
               if (value) {
                  if (cw.canEvaluate()) {
                     cw.evaluate();
                  }
               }
               break;
            case "displayErrorClass":
               cw.displayErrorClass = value;
               break;
            case "displayNullClass":
               cw.displayNullClass = value;
               break;
            case "displayErrorText":
               cw.displayErrorText = value;
               break;
            case "displayNullText":
               cw.displayNullText = value;
               break;
            case "preCalc":
            case "postCalc":
            case "change":
               this._convertEvent(key);
               break;

            default:
               // the remaining properties cannot be changed after init.
               // They include displayConnection, displayElementId,
               // displayTypeManager, displayDataType,
               // useChangeEvt, and useKeyEvt.

         }  // switch
      }  // _setOption
   }; // calc object
   $.widget("ui.calculator", calc); 
})(jQuery);  



/* --- CLASS jTAC_CalculatorOptions -------------------------------
Options object definition used by calculator.

NOTE: All properties are set to null initially. If changed
from null, then they override the value in the Calculations.Widget.
-----------------------------------------------------------------------*/

function jTAC_CalculatorOptions() {
}
jTAC_CalculatorOptions.prototype = {
/* Type: function
   The expression to calculate.
   calcItem hosts a single CalcItem object, which is the base of the calculation.
   Normally you will use a CalcItems.Group here.
   If you don't assign it explicitly, a CalcItems.Group is created for you.
   You can either supply this as an instance of a CalcItem object,
   a JSon object that converts into a CalcItem object (with the [jtacClass] property
   defined to specify the class name), or a shorthand notation
   that creates simple expressions.
*/
   calcItem : null, // null indicates to use the default on Calculations.Widget

/*
   Type: string
      Alternative to setting the [calcItem] property by using a string that uses
      javascript syntax to describe the calculation.
      A parser converts the string into CalcItem objects, which then are assigned
      to the calcItem property.
      Requires /jTAC/Parser.js.
      Parsing syntax is described in each CalcItem object file.
      Note that parsing requires more resources, both in script files loaded
      and work to convert strings to CalcItem objects. If you prefer speed,
      use the [calcItem] property directly.
*/

   expression : null, // null indicates to use the default on Calculations.Widget


/* Type: boolean
   When true, init() will run an initial calculation, updating the [displayConnection]
   for the user's benefit. It defaults to true.
*/
   calcOnInit: null, // null indicates to use the default on Calculations.Widget

/* Type: boolean
   When true, init() will attach [onchange] event handlers to the textboxes associated with the
   calculation, letting them run the calculation after the field is changed. 
*/
   useChangeEvt: null, // null indicates to use the default on Calculations.Widget

/* Type: boolean
   When true, init() will attach [onkeydown] and [onkeyup] event handlers 
   to the textboxes associated with the calculation, 
   letting them run the calculation after the onkeyup event. 
   It defaults to false.
*/
   useKeyEvt: null, // null indicates to use the default on Calculations.Widget

/* Type: Connection object
   When [displayElementId] is assigned, it creates this object, a Connection object
   to the element that displays the calculated value.
   Generally you assign this when you need to define a different object or parameters
   than given you when [displayElementId] is setup.
   This Connection class should be compatible with the type of element it communicates with.
   Typical types: Connections.InnerHtml and Connections.FormElement.
   You can either supply this as an instance of a Connection object,
   or a JSon object that converts into a Connection class (with the [jtacClass] property
   defined to specify the class name).
   Once setup, you can use the members of the Connection class
   to interact with the element that displays the calculated value.
*/
   displayConnection : null, // null indicates to use the default on Calculations.Widget

/* Type: string
   Assigns the ID of the element that will display the calculated value.
   Only setup if you want to display the value. It's common to avoid displaying
   the value, but still use the calculation to drive other calculations
   or be evaluated by a Condition object.
*/
   displayElementId: null, // null indicates to use the default on Calculations.Widget

/* Type: TypeManager class
   Defines how to format the string shown by [displayConnection].
   This value can be set by assigning the [displayDatatype] property too.
   If not assigned, it uses TypeManagers.Float.
   Avoid using TypeManagers that are not intended to handle numbers.
*/
   displayTypeManager : null, // null indicates to use the default on Calculations.Widget

/* Type: string
   Alternative way to set the [displayTypeManager]. 
   Specify the class name or alias of a TypeManager class.
   Avoid using TypeManagers that are not intended to handle numbers.
   Supported names include: "integer", "float", "currency", and "percent".
*/
   displayDatatype: null, // null indicates to use the default on Calculations.Widget

/* Type: string
   When the calculation reports an error, this style sheet class is assigned
   to the [displayConnection] element.
   It defaults to "calcwidget-error".
*/
   displayErrorClass: null, // null indicates to use the default on Calculations.Widget

/* Type: string
   When the calculation has nothing to show, this style sheet class 
   is assigned to the [displayConnection] element.
   It defaults to "calcwidget-null".
*/
   displayNullClass: null, // null indicates to use the default on Calculations.Widget

/* Type: string
   When the calculation reports an error, this string is assigned
   to the [displayConnection] element.
   It defaults to "***".
*/
   displayErrorText: null, // null indicates to use the default on Calculations.Widget

/* Type: string
   When the calculation has nothing to show, this string is assigned
   to the [displayConnection] element.
   It defaults to "".
*/
   displayNullText: null, // null indicates to use the default on Calculations.Widget

/* Type: function
   Function is called prior to calculating. This function must be 
   compatible with jquery's bind() method which demands two parameters:
   event and ui. Both of those parameters will be passed as null to your [preCalc] function.
   If it returns false, the remainder of the calculation is skipped.
   preCalc = function(event, ui) { your code }.
*/
   preCalc : null,

/* Type: function
      Function is called after calculating, updating the hidden field value, 
      and displaying the result with the [displayConnection].
      This function must be compatible with jquery's bind() method which demands two parameters:
      event and ui. Event will be null. ui will be an object with one property, [value],
      which holds the numeric value of the calculation, null, or NaN.
      It ignores the returned value.
   postCalc = function(event, ui) { your code. ui.value is the value of the calculation. }.
*/
   postCalc : null,

/* Type: function
      Function is called after calculating when the calculated value has changed.
      The function result is ignored.
      This function must be compatible with jquery's bind() method which demands two parameters:
      event and ui. Event will be null. ui will be an object with one property, [value],
      which holds the numeric value of the calculation, null, or NaN.
      change = function(event, ui) { your code. ui.value is the value of the calculation. }.
*/
   change : null

};

// jTAC/jquery-ui widgets/calculator-unobtrusive.js
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
Module: jquery-ui widgets

Purpose:
Provides unobtrusive javascript support for the calculator widget.

Establishing this ui widget:
1. Add both calculator.js and calculator-unobtrusive.js
   to the page. The act of adding this file automatically runs code to detect
   hidden fields with the data-jtac-calculator attribute assigned.

2. If you prefer to use the expression property (which parsers javascript-like syntax to build the calculation expression),
   add the /jTAC/Parser.js file.

3. Add a hidden input field for each calculation. Assign the id and name properties to the same value.
   This element will host the Calculations.Widget object and hold the current value.
   Its value can be used in a postback too.

4. Assign the attribute "data-jtac-calculator" to the hidden input.
   Its value should be an object with the same properties
   supported by the options of the calculator.
   At minimum, assign the calcItem property to the calculation rule.

   See jquery-ui-calculator.js for details on the options.

   <input type='hidden' id='calculator1' name='calculator'
      data-jtac-calculator='{"calcItem" : ["TextBox1", "TextBox2"], "displayElementId" : "Result"}' />
   <span id='Result'></span>

   Example when using the expression property:
   <input type='hidden' id='calculator1' name='calculator'
      data-jtac-calculator='{"expression" : '"TextBox1" + "TextBox2"', "displayElementId" : "Result"}' />
   <span id='Result'></span>



Required libraries:
ALWAYS LOAD jquery.#.#.#.js
ALWAYS LOAD jquery-ui-#.#.#.js
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
ALWAYS LOAD /jTAC/Calculations/CalcItem classes.js BEFORE THIS FILE IS LOADED
ALWAYS LOAD /jTAC/Calculations/CalcWidget.js BEFORE THIS FILE IS LOADED
ALWAYS LOAD /jTAC/TypeManagers/Base classes.js
ALWAYS LOAD /jTAC/TypeManagers/Numbers.js
When using CalcItems.Conditional, LOAD Conditions.Base AND other Condition classes.
jquery-ui widgets/calculator.js
------------------------------------------------------------*/


(function ($){
   function applyOne(idx, element) {
      element = $(element);
      var options = element.data("jtac-calculator");
      if (options) {
         element.data("calculator", null);
         try {
            if (typeof options == "string")
               options = window.eval("(" + options +");");
            element.calculator(options);
         }
         catch (e) {
            jTAC.error("Could not parse the data-jtac-calculator attribute of id [" + element.get()[0].id + "] Error info:" + e.toString());
         }
      }
   }

   function apply() {
      try {
         jTAC._internal.pushContext("calculator-unobtrusive.apply()");

         var elements = $("input[type=hidden]");
         elements.each(applyOne);
      }
      finally {
         jTAC._internal.popContext();
      }

   } // apply fnc

   if (!window.jTAC_CalculatorOptions)
      jTAC.error("Requires the calculator scripts.");

   $(document).ready(apply);

})(jQuery);

