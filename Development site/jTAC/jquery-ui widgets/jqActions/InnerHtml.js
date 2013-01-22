// jTAC/jquery-ui widgets/jqActions/InnerHtml.js
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
Class : jqActions.InnerHtml
Extends: jqActions.Base

Purpose:
Action class to change the innerHTML attribute in form elements.

onsuccess: Assigns the innerHTML attribute to the string in [html]
onfailed: Assigns the innerHTML attribute to the original value or the value in [htmlFailed].
Set [reverse] to true to reverse these behaviors.

Additional properties:
   html (string) -
      The Html to replace.
      If not assigned, nothing happens.
      If "", it is a valid value which assigns the innerHtml to "".

   htmlFailed (string) -
      The Html to use in onfailed.
      If unassigned, its value is captured from the first
      element passed into prep().
      If "", it is a valid value which assigns the innerHtml to "".

Required libraries:
ALWAYS LOAD jquery.#.#.#.js
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED

------------------------------------------------------------*/

if (!window.jTAC)
   throw new Error("window.jTAC not created.");

jTAC._internal.temp.jqActions_InnerHtml = {
   extend: "jqActions.Base",

   constructor: function (propertyVals) {

   },

   config: {
      html: null,
      htmlFailed: null
   },

   configrules: {
      html: jTAC.checkAsStrOrNull,
      htmlFailed: jTAC.checkAsStrOrNull
   },

   /*
   Captures the value attribute from the first element passed in.
   */
   _prep: function (sender, elements) {

      this._internal.orig = elements.html();
   },

   onsuccess: function (sender, elements) {
      if (this.html == null)
         return;
      elements.html(this.html);
   },

   onfailed: function (sender, elements) {
      var val = this.htmlFailed;
      if (val == null) {
         val = this._internal.orig;
      }
      elements.html(val);
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("jqActions.InnerHtml", jTAC._internal.temp.jqActions_InnerHtml);
jTAC.defineAlias("InnerHtml", "jqActions.InnerHtml");
