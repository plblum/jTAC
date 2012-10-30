// jTAC/Calculations/WidgetConnection.js
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
Module: Calculations
Class : Calculations.WidgetConnection
Extends: Connections.BaseElement

Purpose:
A Connection object that interacts with a hidden input field
associated with a Calculations.Widget object.
It requires the Calculations.Widget has already been initialized.
It gets the value from getTextValue() and getTypedValue()
by calling the Calculations.Widget.evaluate() method.
It supports these types: "Integer", "Float".

Use the addEventListener() method to attach the "onchange" event to 
the Calculations.Widget so each time it calculates, it fires the onchange event.

The getClass() and setClass() methods use the style sheet class
on the element defined by the [displayConnection]. If that property is not setup,
nothing happens.

See \jTAC\Calculations\Widget.js for an overview of Calculations.Widget.
See \jTAC\Connections\Base.js for an overview of Connection objects.

Properties introduced by this class:
None


Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Connections.Base
Connections.BaseElement
Calculations.Widget

----------------------------------------------------------- */
jTAC._internal.temp._CalcItems_WidgetConnection = {
   extend: "Connections.BaseElement",

   require: ["Calculations.Widget"],

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

/*
Utility to retrieve the actual Calculations.Widget object associated with the ID of this connection.
*/
   _getCalcWidget: function () {
      var el = this.getElement(true);
      if (this._checkElement(el)) {
         return el.calcWidget;
      }
      return null;

   },


   /* 
   Returns a string. If no value, it returns the empty string.
   */
   getTextValue: function () {
      var cw = this._getCalcWidget();
      if (cw && cw.canEvaluate()) {
         var val = cw.evaluate();
         if ((val != null) && !isNaN(val)) {
            // format as a string using displayTypeManager
            return cw.getDisplayTypeManager().toString(val);
         }
      }

   },

   /* 
   Does nothing.
   */
   setTextValue: function (text) {
   },

   /*
   Always returns false.
   */
   typeSupported: function (typeName) {
      return (typeName == "integer") || (typeName == "float");
   },

   /*
   Retrieves a value of a specific type (number, Date, boolean, string).
   The caller must call typeSupported() first to determine if this function
   will work.
      typename (string) - If null, use the default type (usually there is a single type supported
         other than string). Otherwise, one of the values that would return
         true when calling typeSupported().
   Returns the value based on the expected type.
   If the value cannot be created in the desired type, it returns null.
   */
   getTypedValue : function (typeName) {
      if (!typeName || this.typeSupported(typeName))
      {
         var cw = this._getCalcWidget();
         if (cw && cw.canEvaluate()) {
            var val = cw.evaluate();
            if ((typeName == "integer") && (Math.floor(val) != val)) { // value has decimal places and the caller wants an integer
               return null;
            }

            return val;
         }

      }
      return null;
   },

   /*
   Does nothing
   */
   setTypedValue : function (value) {
   },

   /*
   Only returns true if Calculations.Widget.evaluate returns null.
   */
   isNullValue: function (override) {
      var cw = this._getCalcWidget();
      if (cw && cw.canEvaluate()) {
         var val = cw.evaluate();
         return val == null;
      }
      return false;
   },

   /*
   Always returns false.
   */
   isEditable: function () {
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
   testElement: function (id) {
      if (typeof (id) == "string") {
         id = document.getElementById(id);
      }
      return this._checkElement(id);
   },

   /*
   Utility to determine if the element hosts the Calculations.Widget object
   in its data-calcWidget attribute.
   */
   _checkElement: function (el) {
      if (el && el.calcWidget)
         return true;

      return false;
   },


   /*
   Always returns true.
   */
   isEnabled: function () {
      return true;
   },

   /*
   Determines if the element is visible.
   Returns true if it has a displayConnection setup and that element is visible.
   */
   isVisible : function () {
      var cw = this._getCalcWidget();
      if (cw && cw.getDisplayConnection()) {
         return cw.getDisplayConnection().isVisible();
      }
      return false;
   },

   /*
   Always returns true to let a validator know it has data to be validated.
   */
   isEditable: function () {
      return true;
   },

   /*
   Let's the caller retrieve the collection instances into a new list.
   In addition to getting those in the connections property, subclasses
   can retrieve others which may be elsewhere, such as in a child
   Condition object.
      list (Array) - Add collection objects to this list.
   */
   collectConnections : function(list) {
      var cw = this._getCalcWidget();
      if (cw) {
         cw.getCalcItem().collectConnections(list);
      }
   },

/*
Supports the "onchange" event which maps to the change event type
on the Calculations.Widget.
*/
   addEventListener : function (name, func, funcid) {
      if (name == "onchange") {
         var cw = this._getCalcWidget();
         if (cw) {
            cw.attachEvent("change", func);
            return true;
         }
      }
      return false;
   },

/*
If displayConnection is setup, its class is returned.
Otherwise, it returns "".
*/
   getClass : function() {
      var cw = this._getCalcWidget();
      if (cw) {
         var conn = cw.getDisplayConnection();
         if (conn) {
            return conn.getClass();
         }
      }
      return "";
   },

/*
If displayConnection is setup, its class is updated.
*/
   setClass : function(css) {
      var cw = this._getCalcWidget();
      if (cw) {
         var conn = cw.getDisplayConnection();
         if (conn) {
            conn.setClass(css);
         }
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
jTAC.define("CalcItems.WidgetConnection", jTAC._internal.temp._CalcItems_WidgetConnection);

jTAC.connectionResolver.register("CalcItems.WidgetConnection");
