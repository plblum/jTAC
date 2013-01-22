// jTAC/jquery-ui widgets/jqActions/Attribute.js
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
Class : jqActions.Attribute
Extends: jqActions.Base

Purpose:
Action class to change the value of any attribute in on the element.
The attribute name is defined in [Name]. Its value is defined in [value]

onsuccess: Assigns the attribute to the value in [value]
onfailed: Assigns the value attribute to the original value or the value in [valueFailed].
Set [reverse] to true to reverse these behaviors.

Additional properties:
   attrName (string) -
      The name of the attribute to change. Its value must be a case sensitive
      to the attribute name.

   value (string, number, or boolean) -
      The value to replace. It is up to the user to assign a valid value
      for the attribute.
      If null, nothing happens.
      If "", it is a valid value which assigns the value to "".

   valueFailed (string, number, or boolean) -
      The value to use in onfailed.
      If null, its value is captured from the first
      element passed into prep().
      If "", it is a valid value which assigns the value to "".
      It defaults ot null.

Required libraries:
ALWAYS LOAD jquery.#.#.#.js
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED

------------------------------------------------------------*/

if (!window.jTAC)
   throw new Error("window.jTAC not created.");

jTAC._internal.temp.jqActions_Attribute = {
   extend: "jqActions.Base",

   constructor: function (propertyVals) {

   },

   config: {
      attrName: "",
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

      this._internal.orig = elements.attr(this.attrName);
   },

   onsuccess: function (sender, elements) {
      if (this.value == null)
         return;
      elements.attr(this.attrName, this.value);
   },

   onfailed: function (sender, elements) {
      var val = this.valueFailed;
      if (val == null) {
         val = this._internal.orig;
      }
      elements.attr(this.attrName, val);
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("jqActions.Attribute", jTAC._internal.temp.jqActions_Attribute);
jTAC.defineAlias("Attribute", "jqActions.Attribute");