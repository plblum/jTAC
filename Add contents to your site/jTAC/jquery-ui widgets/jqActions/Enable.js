// jTAC/jquery-ui widgets/jqActions/Enable.js
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
Class : jqActions.Enable
Extends: jqActions.Base

Purpose:
Action class to change the disabled attribute of elements
that support that attribute.

onsuccess: Makes the element enabled
onfailed: Makes the element disabled
Set [reverse] to true to reverse these behaviors.

Aliases:
"Enable" - default
"Disable" - reverses the actions so "success" disables and "failed" enables

Required libraries:
ALWAYS LOAD jquery.#.#.#.js
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED

------------------------------------------------------------*/

if (!window.jTAC)
   throw new Error("window.jTAC not created.");

jTAC._internal.temp.jqActions_Enable = {
   extend: "jqActions.Base",

   constructor: function (propertyVals) {

   },

   onsuccess: function (sender, elements) {
      elements.each(function (i) {
         if (this.disabled != null)
            this.disabled = false;
      });
   },

   onfailed: function (sender, elements) {
      elements.each(function (i) {
         if (this.disabled != null)
            this.disabled = true;
      });
   }



   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("jqActions.Enable", jTAC._internal.temp.jqActions_Enable);

jTAC.defineAlias("Enable", "jqActions.Enable");
jTAC.defineAlias("Disable", "jqActions.Enable", {reverse: true});
