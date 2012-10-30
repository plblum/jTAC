// jTAC/Conditions/BaseRegExp.js
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
Class : Conditions.BaseRegExp
Extends: Conditions.BaseOneConnection

Purpose:
A base class for developing Conditions using a regular expression 
to evaluate the text in the connection property.
Subclasses must override _getExpression() to supply the expression. 
Optionally override _getCaseIns() and _getGlobal() to supply those regex flags.

This base class provides a framework for creating many expression generator
Conditions. This lets the user avoid trying to create the appropriate
expression for some common cases because those child Conditions
will let the user set rules (as properties) and the Condition's
_getExpression() method will generate the correct expression.
These child conditions make it easier to identify the business rule being
described. You don't have to analyze the regular expression, just 
look at the name of the condition class and its properties.

RECOMMENDATION: Create a TypeManager instead of a Condition when the regular
expression is always used to represent a specific data type.
TypeManagers are the preferred way to evaluate data types. The user
can then use the Condition.DataTypeCheck with it.
They can also use the TypeManager with the jquery-ui dataTypeEditor widget.
Result: Handles more cases and eliminates creating a validation rule for the new condition.

Evaluation rules:
When the text is matched by the regular expression, it evaluates as "success".
Otherwise it evaluates as "failed".
When the text is the empty string, evaluates as "cannot evaluate"
so long as [ignoreBlankText] is true.
If you want to reverse this logic, set the not property to true.

See \jTAC\Conditions\Base.js for an overview of Conditions.

Properties introduced by this class:
   ignoreBlankText (boolean) -
      Determines how blank text is evaluated. 
      When true, the condition cannot be evaluated.
      When false, the condition evaluates as failed (reports an error). 
      It defaults to true.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Conditions.Base
Conditions.BaseOneConnection
Connections.Base
Connections.BaseElement
Connections.FormElement
----------------------------------------------------------- */
jTAC._internal.temp._Conditions_BaseRegExp = {
   extend: "Conditions.BaseOneConnection",
   "abstract": true,

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      ignoreBlankText: true
   },

   /*
   Cannot evaluate when the expression is "".
   */
   canEvaluate : function () {
      if (!this.getExpression()) {
         return false;
      }
      return this.callParent();
   },

   /* 
   When the text is matched by the regular expression, it evaluates as "success".
   Otherwise it evaluates as "failed".
   When the text is the empty string, evaluates as "cannot evaluate"
   so long as IgnoreBlankText is true.
   If you want to reverse this logic, set the not property to true.
   */
   _evaluateRule : function () {
      var re = this._internal.regex;
      if (!re) {
         var exp = this._getExpression();
         if (!exp) {
            return -1;
         }
         var opts = "";
         if (this._getCaseIns()) {
            opts += "i";
         }
         if (this._getGlobal()) {
            opts += "g";
         }
         if (this._getMultiline()) {
            opts += "m";
         }
         re = this._internal.regex = new RegExp(exp, opts);
      }
      var s = this.connection.getTextValue();
      if (!s) {
         return this.getIgnoreBlankText() ? -1 : 0;
      }

      return re.test(s) ? 1 : 0;
   },

   /* ABSTRACT METHOD
   Returns the regular expression string that is passed to the first parameter
   of the RegExp object. It must be a legal expression or it will throw
   an exception.
   If it returns "", the Condition will return false from canEvaluate() and -1 from evaluate().
   */
   _getExpression : function () {
      this._AM();
   },

   /*
   Determines if the regular expression will use the case insensitive option.
   This class always returns false.
   */
   _getCaseIns : function () {
      return false;
   },

   /*
   Determines if the regular expression will use the global search option.
   This class always returns false.
   */
   _getGlobal : function () {
      return false;
   },

   /*
   Determines if the regular expression will use the multiline option.
   This class always returns false.
   */
   _getMultiline : function () {
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
jTAC.define("Conditions.BaseRegExp", jTAC._internal.temp._Conditions_BaseRegExp);

