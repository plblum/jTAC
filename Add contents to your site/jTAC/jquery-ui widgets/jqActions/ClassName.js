// jTAC/jquery-ui widgets/jqActions/ClassName.js
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
Class : jqActions.ClassName
Extends: jqActions.Base

Purpose:
Action class to change the [className] attribute of elements.
It can replace the entire value, or append and remove a class name
from within the larger value.
The user can provide either class names for both onsuccess and onfailed cases,
or capture the original class name and use it for the onfailed case.

onsuccess: Changes the class name based on the [mode] and [className] properties
onfailed: Changes the class name back to the original value if [classNameFailed] is unassigned
   or [mode] = "replace".
   Otherwise, it uses the reverse action of the mode ("add"->"remove" and "remove"->"add").
Set [reverse] to true to reverse these behaviors.

Additional properties:
   className (string) -
      The class name to replace, append, or remove in onsuccess. 
      If not assigned, nothing happens.
      If "", it is a valid value which assigns the ClassName to "".

   classNameFailed (string) -
      The class name to use in onfailed when [mode] = "replace".
      If unassigned, its value is captured from the first
      element passed into prep().
      If "", it is a valid value which assigns the ClassName to "".

   mode (string) -
      Determines the behavior:
      * "replace" - replaces the complete class name. This is the default.
      * "add" - uses $.addClass() to add another class to the existing values.
      * "remove" - uses $.removeClass() to remove the class from the existing value.

Aliases:
"ClassName"
"AddClassName" - mode="add"
"RemoveClassName" - mode="remove"

Required libraries:
ALWAYS LOAD jquery.#.#.#.js
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED

------------------------------------------------------------*/

if (!window.jTAC)
   throw new Error("window.jTAC not created.");

jTAC._internal.temp.jqActions_ClassName = {
   extend: "jqActions.Base",

   constructor: function (propertyVals) {

   },

   config: {
      className: null,
      classNameFailed: null,
      mode: "replace"
   },

   configrules: {
      className: jTAC.checkAsStrOrNull,
      classNameFailed: jTAC.checkAsStrOrNull,
      mode: ["replace", "add", "remove"]
   },

   /*
   Captures the class name from the first element passed in.
   */
   _prep: function (sender, elements) {
      this._internal.orig = elements.first().attr("class");
   },

   onsuccess: function (sender, elements) {
      var cn = this.className;
      if (cn == null)
         return;
      switch (this.mode) {
         case "replace":
            elements.attr("class", cn);
            break;
         case "add":
            elements.addClass(cn);
            break;
         case "remove":
            elements.removeClass(cn);
            break;
      }
   },

   onfailed: function (sender, elements) {
      var cn = this.className;
      switch (this.mode) {
         case "replace":
            cn = this.classNameFailed;
            if (cn == null) {
               cn = this._internal.orig;
            }
            if (cn == null)
               return;
            elements.attr("class", cn);
            break;
         case "add":
            elements.removeClass(cn);
            break;
         case "remove":
            elements.addClass(cn);
            break;
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
jTAC.define("jqActions.ClassName", jTAC._internal.temp.jqActions_ClassName);
jTAC.defineAlias("ClassName", "jqActions.ClassName");
jTAC.defineAlias("AddClassName", "jqActions.ClassName", {mode: "add"});
jTAC.defineAlias("RemoveClassName", "jqActions.ClassName", {mode: "remove"});
