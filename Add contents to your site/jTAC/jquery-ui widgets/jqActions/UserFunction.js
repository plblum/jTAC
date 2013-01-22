// jTAC/jquery-ui widgets/jqActions/UserFunction.js
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
Class : jqActions.UserFunction
Extends: jqActions.Base

Purpose:
Action class to run your own function where you can do whatever you 
want without writing a custom Action class.

Your function takes the same parameters as the run() function:
* sender (the widget object)
* elements - jquery object whose elements should be modified.
* success (boolean) - when true, the condition evaluated as success.
   When false, the condition evaluated as failed.

The onsuccess and onfailed functions are not used. The [enabled]
and [reverse] properties still work.

Example that changes several styles on all elements:
function dim(sender, elements, success) {
	if (success)
		elements.css({border-color: '', background-color:''});	// removes these values
	else
		elements.css({border-color:'red', 'background-color':'yellow'});
}

Additional properties:
   fnc (function) -
      A reference to a javascript function that will do the work.
      Its parameters are described above.
      It can also be assigned to a string that is the name of a function
      found on the window object. This simplifies unobtrusive setup.

Required libraries:
ALWAYS LOAD jquery.#.#.#.js
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED

------------------------------------------------------------*/

if (!window.jTAC)
   throw new Error("window.jTAC not created.");

jTAC._internal.temp.jqActions_UserFunction = {
   extend: "jqActions.Base",

   constructor: function (propertyVals) {

   },

   config: {
      fnc: null
   },

   configrules: {
      fnc: jTAC.checkAsFunction
   },

   run: function (sender, elements, success) {
      if (!this.enabled || !this.fnc)
         return;
      if (this.reverse) {
         success = !success;
      }
      this.fnc(sender, elements, success);
   },



   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("jqActions.UserFunction", jTAC._internal.temp.jqActions_UserFunction);
