// jTAC/Connections/BaseJQUIElement.js
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
Class : Connections.BaseJQUIElement    ABSTRACT CLASS
Extends: Connections.BaseElement

Purpose:
A base class for any jquery widget that wants to refer to the "element" object
as a jquery object.

See \jTAC\Connections\Base.js for an overview of Connections.

Properties introduced by this class:
None

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Connections.Base
Connections.BaseElement

----------------------------------------------------------- */
jTAC._internal.temp._Connections_BaseJQUIElement = {
   extend: "Connections.BaseElement",
   "abstract": true,

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   /*
   Retrieves the HTML Element associated with the id.
   Throws exceptions if not found, unless allowNOne is true.
   Also throws exception if the HTML element does not have a value attribute.
   */
   getElement : function () {
      try
      {
         this._pushContext();

         if (this._internal.element != null) {
            return this._internal.element;
         }

         // instead of capturing the HTML element and using that instance each time
         // the value is retrieved with each call. This allows AJAX and other
         // scripts to delete and re-add the element.
         var id = this.getId();
         if (!id)
            this._error("Did not assign the id.");
         var el = $("#" + id);
         if (el) {
            this._checkElement(el);  // may throw an exception
         }
         else if (!el && !this.getAllowNone())
            this._error("HTML Element not found for " + id);
         return el;
      }
      finally {
         this._popContext();
      }

   },

   /*
   Lets you set the jquery object that is returned by getElement.
   Normally you will assign the id and let getElement do the work.
   Use this when you have an instance of the jquery object AND do not expect
   it to be deleted for the life of this Connection.
   This is intended to be a public method.
   The value can be either a jquery object or a DOM element.
   */
   setElement : function (value) {
      if (typeof (value.jquery) != "string") {
         value = $(value);
      }
      this._internal.element = value;

   },

   /*
   Checks the object to confirm its a jquery object.
   */
   _checkElement : function(element) {
      if (typeof(element.jquery) == "string" )
         return true;
      this._error("Element must be a jQuery instance.");
   },

   /* 
   Retrieve the string representation of the value.
   Returns a string.
   If the element is not on the page and allowNone is true,
   it returns null.
   Respects the trim property.
   */
   getTextValue : function () {
      var jq = this.getElement();   // may throw exception
      if (jq) {
         return this._cleanString(jq.val());
      }
      return null;
   },

   /* 
   Set the value passing in a string.
     Text (string) - the value to set.
   */
   setTextValue : function (text) {
      var jq = this.getElement();   // may throw exception
      if (jq) {
         jq.val(text);
      }
   },

   /*
   Attaches a function to an event handler on the element.
      name (string) - Name of the event handler. Strings are case sensitive.
         Typical names: "onchange", "onfocus", "onblur", "onclick", "onkeydown".
         The subclass determines how to use them and may ignore those it doesn't support.
      func (function) - A function that will be called when the event is raised.
         Its parameters should either match those supported by the event, which is usually
         the event object itself, or there should be no parameters.
      funcid (string) - Optional. If you want to only hook up the function
         once to the element, pass a name here. That name will be attached to the element's data.
         Later calls with the same name will not attempt to add the event.
         A good usage is attaching a validation function. That function generally
         handles all validators. So only the first validation rule should attach
         the validation function. When not used, omit the parameter or pass null.
   Returns: When true, the event was attached. When false it was not supported.
   */
   addEventListener : function (name, func, funcid) {
      var js = this.getElement();   // may throw exception
      if (js) {
         // is the function already attached?
         if (funcid) {
            var da = "data-jqueryconnection-" + funcid;
            if (js.data(da) != null) {
               return true;   // already attached
            }
            js.data(da, true);
         }

         js.bind(name.substr(2), func);
      }
      return false;
   },

/*
Attempts to get a value associated with the data collection of the element.
   key (string) - The value key in the data collection.
Returns the value or null if not available.
This class handles DOM using getAttribute("data-" + key).
*/
   getData : function (key) {
      var el = this.getElement(true);
      if (el) {
         return el.data(key);
      }
      return null;
   },


/*
Assigns or replaces the value into the data collection of the element.
   key (string) - The value key in the data collection.
   value - The data to store with the key.
*/
   setData : function (key, value) {
      var el = this.getElement(true);
      if (el) {
         el.data(key, value);
      }
   },


   /*
   Determines if the element is visible.
   Returns true if visible.
   This class looks at the display and visibility styles on the actual HTML element
   and up the DOM tree until it finds one invisible or nothing being invisible.
   Subclasses may have widgets with multiple HTML parts, some of which 
   may be visible and others hidden. Its up to those subclasses to determine
   what "visible" means.
   */
   isVisible : function () {
      var js = this.getElement(true);
      if (!js) {
         return true;
      }
   
      return this._isDOMVisible(js.get(0));
   },

   /*
   Determines if the element is enabled.
   Returns true if enabled.
   This class looks at the disabled attribute of the element. If no attribute
   exists, it returns true.

   Subclasses may have widgets with multiple HTML parts, some of which 
   may be enabled and others disabled. Its up to those subclasses to determine
   what "enabled" means.
   */
   isEnabled : function () {
      var js = this.getElement(true);
      if (!js) {
         return true;
      }
      return this._isDOMEnabled(js.get(0));
   },

   /* 
   Locates a string that can be displayed as the label for the element.
   */
   getLabel : function () {
      var el = this.getElement(true);
      if (el) {
         el = el.get(0);
      }
      return this._locateLabel(el, this.getDefaultLabel());
   },

/*
Returns the current style sheet class name associated with the element
or "" if none.
This class returns the value of the class property on the HTML element.
*/
   getClass : function() {
      var el = this.getElement();
      if (el) {
         return el.css();
      }
      return "";
   },

/*
Sets the current style sheet class name. If the widget has multiple
classes for its various parts, this impacts the part most closely associated
with the data entry, such as the input tag.
*/
   setClass : function(css) {
      var el = this.getElement();
      if (el) {
         el.css(css);
      }
   },

/*
Appends the class name provided to the existing one. 
Effectively it creates the pattern "[old class] [new class]".
   css (string) - The class name to append.
Returns true unless the class already appears. If so, no changes
are made and it returns false.
*/
   addClass : function(css) {
      var el = this.getElement();
      if (el) {
         el.addClass(css);
      }
   },

/*
Removes the style sheet class from the element's current class.
*/
   removeClass : function(css) {
      var el = this.getElement();
      if (el) {
         el.removeClass(css);
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
jTAC.define("Connections.BaseJQUIElement", jTAC._internal.temp._Connections_BaseJQUIElement);

