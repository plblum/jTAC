// jTAC/Conditions/RegExp.js
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
Class : Conditions.RegExp
Extends: Conditions.BaseRegExp

Purpose:
Use a regular expression to evaluate the text in the [connection] property.
This class allows the user to define the expression explicitly
in its [expression] property. There may be other Conditions that also 
generate the correct expression for a given business rule. Consider
using them as they better document the rule and are often an easier 
way to define the correct expression.

Evaluation rules:
   When the text is matched by the regular expression, it evaluates as "success".
   Otherwise it evaluates as "failed".
   When the text is the empty string, evaluates as "cannot evaluate"
   so long as [ignoreBlankText] is true.
   If you want to reverse this logic, set the not property to true.

Set up:
   Assign the element’s id to the [elementId] property. 

   Develop a regular expression and assign it to the [expression] property.

   Regular expressions have options which you can set with the 
   [caseIns], [global], and [multiline] properties.

See \jTAC\Conditions\Base.js for an overview of Conditions.

Properties introduced by this class:
   expression (string) -
      A valid regular expression pattern. 
      Hint: If you intend to evaluate the entire string, be sure to use the ^ and $ symbols.
      Regex Resources:
         Special characters: https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/RegExp#Special_characters_in_regular_expressions
         Find and test expressions: http://www.regexlib.com
   caseIns (boolean)
      When true, letters are matched case insensitively.
      Defaults to true.
   global (boolean)
      When true, use the global search option of regular expressions.
      Defaults to false.
   multiline (boolean)
      When true, use the multiline option of regular expressions.
      Defaults to false.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Conditions.Base
Conditions.BaseOneConnection
Conditions.BaseRegExp
Connections.Base
Connections.BaseElement
Connections.FormElement
----------------------------------------------------------- */
jTAC._internal.temp._Conditions_RegExp = {
   extend: "Conditions.BaseRegExp",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      expression: "",
      caseIns: true,
      global: false,
      multiline: false
   },

   /* 
   Returns the regular expression string that is passed to the first parameter
   of the RegExp object. It must be a legal expression or it will throw
   an exception.
   If it returns "", the Condition will return false from canEvaluate() and -1 from evaluate().
   */
   _getExpression : function ()
   {
      return this.getExpression();
   },

   /*
   Determines if the regular expression will use the case insensitive option.
   This class always returns false.
   */
   _getCaseIns : function ()
   {
      return this.getCaseIns();
   },

   /*
   Determines if the regular expression will use the global search option.
   This class always returns false.
   */
   _getGlobal : function ()
   {
      return this.getGlobal();
   },

   /*
   Determines if the regular expression will use the multiline option.
   This class always returns false.
   */
   _getMultiline : function ()
   {
      return this.getMultiline();
   }


   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("Conditions.RegExp", jTAC._internal.temp._Conditions_RegExp);
jTAC.defineAlias("RegExp", "Conditions.RegExp");

