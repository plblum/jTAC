// jTAC/jquery-ui widgets/jqActions/Style.js
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
Class : jqActions.Style
Extends: jqActions.Base

Purpose:
Action class to change the value of any value in the style attribute on an element.
The style name is defined in [Name]. Its value is defined in [value]

onsuccess: Assigns the style name to the value in [value]
onfailed: Assigns the style name to the original value or the value in [valueFailed].
Set [reverse] to true to reverse these behaviors.

Additional properties:
   styleName (string) -
      The name of the style to change.

   value  -
      The value to replace. It is up to the user to assign a valid value
      for the style.
      If "", the style item is removed.

   valueFailed (string, number, or boolean) -
      The value to use in onfailed.
      If "[", the style item is removed.
      If null, its value is captured from the first
      element passed into prep().
      It defaults ot null.

Required libraries:
ALWAYS LOAD jquery.#.#.#.js
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED

------------------------------------------------------------*/

if (!window.jTAC)
   throw new Error("window.jTAC not created.");

jTAC._internal.temp.jqActions_Style = {
   extend: "jqActions.Base",

   constructor: function (propertyVals) {

   },

   config: {
      styleName: "",
      value: null,
      valueFailed: null
   },

   configrules: {
      value: jTAC.checkAsStrOrNull,
      valueFailed: jTAC.checkAsStrOrNull
   },

   /*
   Captures the attribute's from the first element passed in.
   */
   _prep: function (sender, elements) {

      this._internal.orig = elements.css(this.styleName);
   },

   onsuccess: function (sender, elements) {
      if (this.value == null)
         return;
      elements.css(this.styleName, this.value);
   },

   onfailed: function (sender, elements) {
      var val = this.valueFailed;
      if (val == null) {
         val = this._internal.orig;
      }
      elements.css(this.styleName, val);
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("jqActions.Style", jTAC._internal.temp.jqActions_Style);
jTAC.defineAlias("Style", "jqActions.Style");