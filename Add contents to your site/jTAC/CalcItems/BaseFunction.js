// jTAC/CalcItems/BaseFunction.js
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

