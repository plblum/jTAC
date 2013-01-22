// jTAC/jquery-ui widgets/jqActions/Href.js
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
Class : jqActions.Href
Extends: jqActions.Base

Purpose:
Action class to change the Url in element that have a src
or href attribute, such as <img> and <a>.

onsuccess: Assigns the url to the value in [Url]
onfailed: Assigns the url to the original value or the value in [UrlFailed].
Set [reverse] to true to reverse these behaviors.

Additional properties:
   Url (string) -
      The URL to replace.
      If not assigned, nothing happens.
      If "", it is a valid value which assigns the Url to "".

   UrlFailed (string) -
      The URL to use in onfailed.
      If unassigned, its value is captured from the first
      element passed into prep().
      If "", it is a valid value which assigns the Url to "".

Required libraries:
ALWAYS LOAD jquery.#.#.#.js
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED

------------------------------------------------------------*/

if (!window.jTAC)
   throw new Error("window.jTAC not created.");

jTAC._internal.temp.jqActions_Href = {
   extend: "jqActions.Base",

   constructor: function (propertyVals) {

   },

   config: {
      Url: null,
      UrlFailed: null
   },

   configrules: {
      Url: jTAC.checkAsStrOrNull,
      UrlFailed: jTAC.checkAsStrOrNull
   },

   /*
   Captures the url from the first element passed in.
   */
   _prep: function (sender, elements) {
      val = "";
      var el = elements.first();
      val = el.attr("src");
      if (val === undefined)
         val = el.attr("href"); // may be undefined

      this._internal.orig = val;
   },

   onsuccess: function (sender, elements) {
      if (this.Url == null)
         return;
      var that = this;
      elements.each(function (i, el) {
         that._replaceUrl(el, that.Url);
      });
   },

   onfailed: function (sender, elements) {
      var url = this.UrlFailed;
      if (url == null)
         url = this._internal.orig;
      var that = this;
      elements.each(function (i, el) {
         that._replaceUrl(el, url);
      });
   },

   _replaceUrl: function (el, url) {
      if (el.src != undefined)
         el.src = url;
      else if (el.href != undefined)
         el.href = url;
   }



   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("jqActions.Href", jTAC._internal.temp.jqActions_Href);
jTAC.defineAlias("Href", "jqActions.Href");
