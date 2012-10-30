// jTAC/Connections/InnerHtml.js
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
Module: Connection objects
Class : Connections.InnerHtml
Extends: Connections.BaseElement

Purpose:
Interacts with an HTML tag that supports
the innerHTML property, such as <span>, <div>, and <td>.
These tags contain HTML as their value, so they are not type specific. 
Therefore, there is no default TypeManager class.

See \jTAC\Connections\Base.js for an overview of Connections.

Properties introduced by this class:

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Connections.Base

----------------------------------------------------------- */
jTAC._internal.temp._Connections_InnerHtml = {
   extend: "Connections.BaseElement",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   /* 
   Returns a string. If no value, it returns the empty string.
   */
   getTextValue : function () {
      var el = this.getElement();
      if (this._checkElement(el))
         return el.innerHTML;
      return "";

   },

   /* 
   Set the value passing in a string.
     Text (string) - the value to set.
   */
   setTextValue : function (text) {
      var el = this.getElement();
      if (this._checkElement(el))
         el.innerHTML = text;
   },

   /*
   Always returns false.
   */
   typeSupported : function (typeName) {
      return false;
   },

   /*
   Always returns false.
   */
   isNullValue : function (override) {
      return false;
   },

   /*
   Always returns false.
   */
   isEditable : function () {
      return false;
   },

   /*
   Determines if the id or object passed is supported by this class.
   Returns true if it is.
   This evaluates the element for an innerHTML property.
      id (string or object) - If its string, evaluate it as a unique id
         used to identify the element. If its an object, see if its
         the correct class, such as DOMElement.
   Returns true when id is supported by this class and false when not.
   */
   testElement : function(id) {
      if (typeof (id) == "string") {
         id = document.getElementById(id);
      }
      return this._checkElement(id);
   },

/*
Utility to determine if the element is a type of HTML tag that supports
reading and writing the innerHTML property.
Most HTML tags have innerHTML even when they don't actually use it to store data.
*/
   _checkElement : function(el) {
      if (el && (typeof (el) == "object") && (el.tagName !== undefined) && (el.innerHTML !== undefined) && (el.form === undefined)) {
         if (typeof el.innerHTML == "string") {
            return true;
         }
      }

      return false;
   },


   /*
   Always returns true.
   */
   isEnabled : function () {
      return true;
   },

   /*
   Always returns false.
   */
   isEditable : function () {
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
jTAC.define("Connections.InnerHtml", jTAC._internal.temp._Connections_InnerHtml);

if (jTAC.connectionResolver)
   jTAC.connectionResolver.register("Connections.InnerHtml");
