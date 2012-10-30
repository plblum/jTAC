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
