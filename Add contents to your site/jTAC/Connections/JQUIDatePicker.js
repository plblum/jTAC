// jTAC/Connections/JQUIDatePicker.js
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
Class : Connections.JQUIDatePicker
Extends: Connections.BaseJQUIElement

Purpose:
Supports the jquery-ui datepicker widget.
The id is an HTML input field that has been attached to a datePicker object.
The element object is the jquery-UI object.

See \jTAC\Connections\Base.js for an overview of Connections.

Properties introduced by this class:

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Connections.Base

----------------------------------------------------------- */
jTAC._internal.temp._Connections_JQUIDatePicker = {
   extend: "Connections.BaseJQUIElement",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   /*
   Supports "date"
   */
   typeSupported : function (typeName) {
      return typeName == "date";
   },

   /*
   Supports several input types, including HTML 5 types that return
   Date objects and numbers. See typeSupported() method for more.
      typeName (string) - If null, always get the default type supported.
         Otherwise, it must be a value from the list supported
         by this control as shown in the typeSupported() method description.
   Returns: the typed value.
   Throws exception if the HTML element does not support the requested type.
   Call typeSupported() prior to this to ensure it will return a value
   instead of throwing an exception.
   */
   getTypedValue : function (typeName) {
      var js = this.getElement();   // may throw exception
      if (js) {
         if (typeName && (typeName != "date"))
            this._error("The jquery element " + this.getId() + " does not support the type " + typeName, "getTypedValue");
   //      return js.datepicker("getDate"); // http://docs.jquery.com/UI/Datepicker#method-getDate

   /* While it would be better to use js.datepicker("getDate"),
   that method never looks at the text in the textbox. It gets the value
   from the calendar object.
   So the textbox can contain something different, and something illegal
   while the calendar does not.
   Since we must valid the textbox because it is actually passed to the server,
   this code ensures getting the actual date object based on the textbox.
   It is modeled after code in datepicker._setDateFromField().
   */
         var dp = $.datepicker;
		   var inst = dp._getInst(js[0]);
		   var dateFormat = dp._get(inst, 'dateFormat');
		   var dates = js.val();
		   var settings = dp._getFormatConfig(inst);
		   try  {
			   return dp.parseDate(dateFormat, dates, settings);
		   } 
         catch (event)  {
			   dp.log(event);
            throw event;   // indicate the error to the caller
		   }

      }
      return null;
   },

   /*
   Supports several input types, including HTML 5 types that return
   Date objects and numbers. See typeSupported() method for more.
   Unsupported cases throw an exception.
   */
   setTypedValue : function (value) {
      var js = this.getElement();   // may throw exception
      if (js) {

         if (value instanceof Date)
         {
            js.datepicker("setDate", value);  // http://docs.jquery.com/UI/Datepicker#method-setDate
         }
         else
            this._error("The HTML element " + this.getId() + " does not support the type of the value", "setTypedValue");
      }
   },

   /*
   HTML form elements are null when their value attribute is "".
   Respects the trim property.
      override (boolean) - Ignored here.
   */
   isNullValue : function (override) {
      return this.getTextValue() == "";
   },

   /*
   Checks the HTML element to confirm that it is supported.
   If not, it should throw an exception.
   */
   _checkElement : function(element) {
      this.callParent([element]);
      if (!this.testElement(element))
         this._error("Element must have a datepicker object.");
   },

   /*
   Determines if the id or object passed is supported by this class.
   Returns true if it is.
   Subclasses should implement this as this class always returns false.
   Your implementation can support ids and objects that are not 
   associated with DOM elements. For example, you have a jquery-ui
   class that manages how a textbox works.
      id (string or object) - If its string, evaluate it as a unique id
         used to identify the element. If its an object, see if its
         the correct class, such as DOMElement.
   Returns true when id is supported by this class and false when not.
   */
   testElement : function (id) {
      if (window.$ && $.datepicker) {
         var el = (typeof id == "string") ? document.getElementById(id) : id;
         if (el) {
            if (el.jquery)
               el = el[0];

            return $.data(el, "datepicker") != null;
         }
      }
      return false;
   },

   /*
   Returns TypeManagers.Date. Supports these data attributes on the element:
   data-jtac-typemanager, data-jtac-datatype. See Connections.BaseElement.getTypeManager for details.
   */
   _createTypeManager : function (el) {
      if (!jTAC.isDefined("TypeManagers.Base"))
         this._error("Must load TypeManager scripts.");

      var tm = this.callParent();
      if (!tm)
         return jTAC.create(this._defaultTypeManager);
      return tm;
   },

/*
Specifies the class name or alias to a TypeManager that is created by 
_createTypeManager when data-jtac-datatype is not used.
*/
   _defaultTypeManager : "TypeManagers.Date"

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("Connections.JQUIDatePicker", jTAC._internal.temp._Connections_JQUIDatePicker);

jTAC.connectionResolver.register("Connections.JQUIDatePicker");
