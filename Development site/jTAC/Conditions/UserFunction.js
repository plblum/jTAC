// jTAC/Conditions/UserFunction.js
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
Class : Conditions.UserFunction
Extends: Conditions.BaseOneOrMoreConnections

Purpose:
Lets the user assign a function to do the work of the _evaluateRule() method.
Your function will be passed the instance of the Condition so it can
access all of its Connections and any properties assigned by the user.
It returns a value of 1 ("success"), 0 ("failed"), and -1 ("cannot evaluate").

Examples:
function IsVisible(cond) {
   // check if the first Connection is a visible DOM element
   var conn = cond.connection;
   if (!conn || !conn.getElement(true))   // nothing to evaluate
      return -1; // cannot evaluate
   return conn.isVisible() ? 1 : 0;

}

function MatchClassName(cond) {
   // check if the first Connection's class name is the value of 
   // cond.options.ClassName which is a custom property you defined.
   if (cond.options.ClassName === undefined)
      return -1;  // cannot evaluate
   var conn = cond.connection;
   if (!conn || !conn.getElement(true))   // nothing to evaluate
      return -1; // cannot evaluate
   return conn.getClass() == cond.options.ClassName ? 1 : 0;
}

Set up:
   Assign the element’s id to the [elementId] property and any additional
   elements to the [moreConnections] property. You can also omit
   these values and let your function acquire the elements it needs.

   Assign the [fnc] property to your function. 

   If you want to pass in values, create an object with properties hosting
   the desired values and assign that object to the [options] property.
   Your function can access them as cond.options.propertyname.

See \jTAC\Conditions\Base.js for an overview of Conditions.

Properties introduced by this class:
   fnc (function) -
      Reference to the function that is evaluated.
      You can pass a string name of the function so long
      as that function is defined on the window object.

   options (object) -
      An option where you can define property names 
      and values for those properties. This object is passed along
      with the condition object passed to your function giving
      you a way to pass along data that your function can use.
      One way to assign it is to use javascript's object notation:

      cond.options = {propertyName: value, propertyName2: value};

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Conditions.Base
Conditions.BaseOneConnection
Connections.Base
Connections.BaseElement
TypeManagers.Base
Other TypeManager classes as needed

----------------------------------------------------------- */
jTAC._internal.temp._Conditions_UserFunction = {
   extend: "Conditions.BaseOneOrMoreConnections",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      fnc: null,
      options: null,
      autoDisable : false  // overrides default because this is often used with non-editable connections
   },

   configrules: {
      fnc: jTAC.checkAsFunction
   },

   /*
   Requires the function is assigned.
   */
   canEvaluate : function () {
      return this.callParent() && this.fnc;
   },
   _evaluateRule : function () {
      return this.fnc(this);
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("Conditions.UserFunction", jTAC._internal.temp._Conditions_UserFunction);
// while valid, there are other object heirarchies with the same name. jTAC.defineAlias("UserFunction", "Conditions.UserFunction");

