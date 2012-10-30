// jTAC/Connections/FormElement.js
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
Class : Connections.FormElement
Extends: Connections.BaseElement

Purpose:
Gets and sets the value attribute of an HTML form element,
like <input>, <select>, and <textarea>. 
getTextValue and setTextValue interact with the element's value attribute.
typeSupported() supports other types depending on the element,
such as checkbox supports "boolean".

User assigns the id value of an HTML element to the id property.

This class also can treat a group of radio buttons or checkboxes as a single widget.
Radio buttons only need their name attribute to match. Checkboxes need
you to identify which elements are in the group through its buttons property.
To use either of these groups, call getTypedValue("index") or pass an integer
index into setTypedValue().
Finally, a checkbox list also supports multiple selections by calling
getTypedValue("indices") or passing an array of integers to setTypedValue().

If working with individual checkbox or radio inputs, the getTextValue() and
setTextValue() methods respect the checked property of these inputs.
An empty string means unchecked. Any other string means checked.

See \jTAC\Connections\Base.js for an overview of Connections.

Properties introduced by this class:
  fixLength (boolean) - 
     When using a <TextArea> tag, the text length may differ between
     browsers for each ENTER character in the text.
     Many browsers report one character (%0A) while others report
     two (%0D%0A). In addition, all browsers post back two (%0D%0A).
     When true, this property ensures the textLength() function 
     counts 2 characters for each ENTER character in the text.
     When false, it uses the exact string size of the textarea's value.
     It defaults to true.
  buttons (array or function) - 
     When the element is part of a list of checkboxes or radio buttons
     from which you want to get or set by an index position,
     this can be used to identify the DOM input elements
     that form the list.
     This property supports several values:
     - function: Return an array of either string ids to elements
         or the actual DOM elements. The function takes one
         parameter, the original element assigned to the id property.
     - array of DOM elements
     - array of string ids to elements.
     When not supplied, radio buttons are handled automatically
     because they are grouped by their name attribute.
     However, if the order returned by document.getElementByName
     is incorrect, that's when you use the buttons property.
     Checkboxes always require this because there is no built 
     in grouping in HTML.
See also \jTAC\Connections\BaseElement.js

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Connections.Base
Connections.BaseElement

----------------------------------------------------------- */
jTAC._internal.temp._Connections_FormElement = {
   extend: "Connections.BaseElement",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      fixLength : true,
      buttons: null
   },

   /* 
   Retrieve the string representation of the value.
   Returns a string.
   If the element is not on the page and allowNone is true,
   it returns null.
   Respects the trim property.
   If working with individual checkbox or radio inputs, 
   an empty string means unchecked. Any other string means checked.

   */
   getTextValue : function () {
      var el = this.getElement();   // may throw exception
      if (el)
         return this._cleanString(this._getValueAttribute(el));
      return null;
   },

   /* 
   Set the value passing in a string.
     Text (string) - the value to set.
     If working with individual checkbox or radio inputs, this only
     changes the checked property, not the value property.
     The empty string means uncheck. Otherwise check.

   */
   setTextValue : function (text) {
      var el = this.getElement();   // may throw exception
      if (el) {
      // checkbox and radio buttons need their checked state modified.
         if (this._isCheckable(el)) {
            el.checked = !!text; // if it has any text, its checked
         }
         else {
            el.value = text;
         }
      }
   },

   /*
   Supports alternative types based on the type of HTML element:
     "integer" - Supports a number value that is an integer. 
         HTML5 number and range inputs support this.
     "float" - Supports a number value that is a float.
         HTML5 number input supports this.
     "date" - Supports a Date object representing only a date (the time is undefined).
         HTML5 date, datetime, datetime-local, and month inputs support this.
     "datetime" - Supports a Date object representing both date and time.
         HTML5 datetime and datetime-local inputs support this.
     "time" - Supports a Date object representing only a time (the date is undefined).
         HTML5 time input supports this.
     "boolean" - Supports a boolean value.
         checkbox and radio inputs support this.
     "index" - Supports a number value representing an offset in a list.
         -1 = no selection. 0 = first element.
         HTML's select and radio elements support this.
         When the buttons property is used, a list of checkboxes also supports it.
     "indices" - Supports an array of integers representing multiple 
         offsets in a list.
         HTML's select element supports this.
   When a browser does not support an HTML5 field enough to supply
   a strong typed value (like valueAsDate on date input), this returns false.
   */
   typeSupported : function (typeName) {
      var el = this.getElement();   // may throw exception
      if (el) {
         if (el.tagName == "INPUT") {
            var hdate = el.valueAsDate !== undefined;  // has date
            var hnum = el.valueAsNumber !== undefined;  // has number
            switch (el.type) {
               case "radio":
                  return typeName == "boolean" || typeName == "index";
               case "checkbox":
                  if (typeName == "boolean") {
                     return true;
                  }
                  else if ((typeName == "index") || (typeName == "indices")) { // a list of checkboxes requires the buttons property to be setup.
                     return this.getButtons() != null;
                  }
                  else
                     return false;
               case "date":
               case "month":
                  return hdate && (typeName == "date");
               case "datetime":
               case "datetime-local":
                  return hdate && ((typeName == "date") || (typeName == "datetime") || (typeName == "time"));
               case "time":
                  return hdate && (typeName == "time");
               case "number":
                  return hnum && ((typeName == "integer") || (typeName == "float"));
               case "range":
                  return hnum && (typeName == "integer");
            }
         }
         else if (el.tagName == "SELECT") {
            return (typeName == "index") || (typeName == "indices");
         }
      }
      return false;
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
      var el = this.getElement();   // may throw exception
      if (el) {
         if (el.tagName == "INPUT") {
            switch (el.type) {
               case "radio":
               case "checkbox":
                  if (!typeName || (typeName == "boolean")) {
                     return el.checked;
                  }
                  else if (typeName == "index") {
                     var btns = this._createButtonsList(el);
                     if (btns) {
                        for (var i = 0; i < btns.length; i++) {
                           if (btns[i].checked)
                              return i;
                        }
                        return -1;
                     }
                  }
                  else if ((typeName == "indices") && (el.type == "checkbox")) {
                     var btns = this._createButtonsList(el);
                     var a = new Array();
                     if (btns) {
                        for (var i = 0; i < btns.length; i++) {
                           if (btns[i].checked)
                              a.push(i);
                        }
                        return a;
                     }
                  }
                  break;
               case "date":
               case "datetime":
               case "datetime-local":
               case "month":
               case "time":
                  if (!typeName || (typeName == "date")) {
                     if (el.valueAsDate !== undefined) // See: http://dev.w3.org/html5/spec/common-input-element-apis.html#dom-input-valueasdate
                        return el.valueAsDate;    // valueAsDate returns null if it cannot interpret the date
/*
                     try
                     {
                     // date is in the format yyyy-MM-dd. http://www.w3.org/TR/html-markup/input.date.html
                     // Javascript 1.8.5 supports that pattern in the Date constructor: https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Date/parse
                        return new Date(el.value);
                     }
                     catch (x)
                     {
                        return null;   // illegal or blank value
                     }
*/
                  }
                  break;
               case "number":
               case "range":
                  if (!typeName || (typeName == "integer") || (typeName == "float")) {
                     if (el.valueAsNumber !== undefined) // See: http://dev.w3.org/html5/spec/common-input-element-apis.html#dom-input-valueasnumber
                        return !isNaN(el.valueAsNumber) ? el.valueAsNumber : null;   // valueAsNumber returns NaN if it cannot interpret the number
/*
                     try
                     {
                        var val = parseFloat(el.value);   // always start with a float
                        if (isNaN(val))
                           return null;
                        if ((typeName == "integer") && (Math.floor(val) != val))  // expects an integer but the value was a float
                           return null;
                        return val;
                     }
                     catch (x)
                     {
                        return null;   // illegal or blank value
                     }
*/
                  }
                  break;
            }  // switch
         }  // if "INPUT"
         else if (el.tagName == "SELECT") {
            if (!typeName || (typeName == "index")) {
               return el.selectedIndex;
            }
            else if (typeName == "indices") {
               var l = new Array();
               for (var i = 0; i < el.options.length; i++) {
                  if (el.options[i].selected)
                     l.push(i);
               }  // for
               return l;
            }
         }
         this._error("The HTML element " + this.getId() + " does not support the type " + typeName, "getTypedValue");
      }
      return null;
   },

   /*
   Supports several input types, including HTML 5 types that return
   Date objects and numbers. See typeSupported() method for more.
   Unsupported cases throw an exception.
   */
   setTypedValue : function (value) {
      var el = this.getElement();   // may throw exception
      if (el) {
         if (el.tagName == "INPUT")
         {
            switch (el.type)
            {
               case "radio":
               case "checkbox":
                  if (typeof (value) == "boolean") {
                     el.checked = value;
                     return;
                  }
                  else if (typeof (value) == "number") {
                     var btns = this._createButtonsList(el);
                     if (btns)
                     {
                        for (var i = 0; i < btns.length; i++)
                        {
                           btns[i].checked = i == value;
                        }
                        return;
                     }
                  }
                  else if ((value instanceof Array) && (el.type == "checkbox")) {
                     var btns = this._createButtonsList(el);
                     if (btns)
                     {
                        for (var i = 0; i < btns.length; i++)
                        {
                           btns[i].checked = value.indexOf(i) > -1;
                        }
                        return;
                     }
                  }
                  break;
               case "date":
               case "datetime":
               case "datetime-local":
               case "month":
               case "time":
                  if (value == null) {
                     el.value = "";  // required by http://dev.w3.org/html5/spec/common-input-element-apis.html#dom-input-valueasdate
                     return;
                  }
                  else if (value instanceof Date) {
                     if (el.valueAsDate !== undefined) // See: http://dev.w3.org/html5/spec/common-input-element-apis.html#dom-input-valueasdate
                     {
                        el.valueAsDate = value;
                        return;
                     }
                  }
                  break;
               case "number":
               case "range":
                  if (value == null) {
                     el.value = "";  // required by http://dev.w3.org/html5/spec/common-input-element-apis.html#dom-input-valueasdate
                     return;
                  }
                  else if (typeof (value) == "number") {
                     if (el.valueAsNumber !== undefined) { // See: http://dev.w3.org/html5/spec/common-input-element-apis.html#dom-input-valueasnumber
                        el.valueAsNumber = value;
                        return;
                     }
                  }
                  break;
            }
         }  // if "INPUT"
         else if (el.tagName == "SELECT") {
            if (typeof (value) == "number") {
               el.selectedIndex = value;
               return;
            }
            else if (value instanceof Array) {
               for (var i = 0; i < el.options.length; i++) {
                  el.options[i].selected = value.indexOf(i) != -1;
               }  // for
               return;
            }
         }
         this._error("The HTML element " + this.getId() + " does not support the type of the value", "setTypedValue");
      }
   },

   /*
   HTML form elements are null when their value attribute is "".
   Respects the trim property.
      override (boolean) - Normally radiobuttons and checkboxes
      will always return false here. When override is true,
      this returns true when they are unchecked.
   */
   isNullValue : function (override) {
      var el = this.getElement();   // may throw exception
      if (el) {
         if (!override && this._isCheckable(el)) {
            return false;
         }
         return this._cleanString(this._getValueAttribute(el)) == "";
      }
      return true;
   },

/*
   Determines the length of the text value.
   This function respects the trim property.
   While usually the length is the same as the string value represented by 
   the element, there are cases where the string value is not what is
   saved on postback. 
   This class adjusts for the HTML TextArea, which may include one
   or two characters for each ENTER in the text. 
   Many browsers report the length of the string with 1 character (%AO) for each ENTER.
   However, all browsers postback two characters (%0D%A0). 
   So this function can return a length adjusted with the value used in postback.
   Set the fixLength property to false to disable this. It defaults to true.
*/
   textLength: function() {
      var text = this.getTextValue();
      if (!text) {
         return 0;
      }
      var l = text.length;
      if (this.getFixLength()) {
         var el = this.getElement(true);
         if (el && (el.tagName == "TEXTAREA")) { 
         // FireFox 15, Safari 5, and IE 9 use only ASCII 10.
         // Opera 12 and older IE use ASCII 13 + ASCII 10.
         // Goal is to assume ASCII 10 alone is two characters.
            var m;
            var re = this._internal.findEnterRE;
            if (!re) {

            // Anything other than ASCII 13 followed by ASCII 10, or ASCII 13 at the very end
               this._internal.findEnterRE = re = /([^\r](?=\n))|(\r$)|(^\n)/g;
            }
            while ((m = re.exec(text)) != null)  {
               l++;
            }
         }
      }
      return l;
   },


   /*
   Checks the HTML element to confirm that it is supported.
   If not, it should throw an exception.
   */
   _checkElement : function(element) {
      if (element.value === undefined)
         this._error("HTML Element does not have a value attribute.");
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
      return this._addEvt(this.getElement(), name, func, funcid);   // getElement may throw exception
   },

   /* UTILITY
   Attaches a function to an event handler on the element.
      el (DOM element) - The element to evaluate
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
   _addEvt : function (el, name, func, funcid) {
      if (el) {
         // is the function already attached?
         if (funcid) {
            var da = "data-formconnection-" + funcid;
            if (el.getAttribute(da) != null)
               return true;   // already attached
            el.setAttribute(da, true);
         }
         if ((name == "onchange") && this._isCheckable(el)) { // convert to onclick for inputs that don't have an onchange event
               name = "onclick";
         }

         if (el.addEventListener) {
            el.addEventListener(name.substr(2), func, false);
            return true;
         }
         else if (el.attachEvent) {
            el.attachEvent(name, func);
            return true;
         }
      }
      return false;
   },

   /*
   Attaches a function to an event handler to additional DOM elements
   associated with the main element that build a single widget.
   It does not impact the main element. Use addEventListener for that.
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
   Returns: Nothing.

   This class looks at the buttons property to find additional items to update.
   */
   addSupportEventListeners : function (name, func, funcid) {
      var el = this.getElement(true);
      if (!el)
         return;
      // if there are buttons, apply to them
      var btns = this._createButtonsList(el);
      if (btns) {
         for (var i = 0; i < btns.length; i++) {
            if (el != btns[i])
               this._addEvt(btns[i], name, func, funcid);
         }  // for
      }
   },


   /*
   Returns an array of all elements identified by the buttons property
   or null if none are supplied.
   If the buttons property is null and its a radiobutton, it uses
   document.getElementByName.
   */
   _createButtonsList : function (element) {
      var b = this.getButtons();
      if (b) {
         if (typeof (b) == "function") {
            b = b(element);   // can return an array of strings or elements. Need to convert the strings into elements.
         }
         if (b instanceof Array) {
            var nb = [];   // since we are about to modify the list, do not allow it to impact the original

            for (var i = 0; i < b.length; i++) {
               if (typeof (b[i]) == "string") {
                  var el = document.getElementById(b[i]);
                  if (el) {
                     nb.push(el);
                  }
                  else {
                     if (window.console)
                        console.log("'" + b[i] + "' element not found on page. Check spelling and case. Specified in a Connections.FormElement using element id '" + element.id + "'." );
                  }
               }
               else if (typeof (b[i]) == "object") {
                  nb.push(b[i]);
               }
               // skips (eliminates) nulls and other unwanted data
            }  // for
            return nb.length ? nb : null;
         }
      }
      else if (element.type == "radio") {
         b = document.getElementsByName(element.name);
         return b.length ? b : null;
      }
      return null;
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
      if (typeof (id) == "string") {
         var el = document.getElementById(id);
         return el && (el.form != null);
      }
      else {
         return ((typeof (id) == "object") && (id.tagName !== undefined) && (id.form != null));
      }
   },

   /*
   Utility to get the text value of an element. Normally it returns
   element.value. But when its a checkbox or radio, it only returns
   the value if its checked. Returns "" if unchecked.
      element (DOM element)
   */
   _getValueAttribute : function (element) {
      if (this._isCheckable(element)) {
         if (!element.checked) {
            return "";
         }
         return element.value ? element.value : "on"; // must have a textual value for a checked checkbox. "on" is used by browsers by default.
      }
      return element.value;
   },

   /*
   Utility.
   Returns true if the element in an INPUT type=checkbox or radio
      element (DOM element)
   */
   _isCheckable : function (element) {
      return (element.tagName == "INPUT") && /^(checkbox)|(radio)$/.test(element.type);
   },


   /*
   Determines if the element is visible.
   Returns true if visible.
   When the buttons property is used, its list of elements are all evaluated.
   If at least one button is visible, this returns true.
   */
   isVisible : function () {
      var el = this.getElement(true);
      if (!el) {
         return true;
      }
      var b = this._createButtonsList(el);
      if (b) {
         for (var i = 0; i < b.length; i++) {
            if (this._isDOMVisible(b[i])) {
               return true;
            }
         }  // for
         return false;
      }
      else {
         return this._isDOMVisible(el);
      }
   },

   /*
   Determines if the element is enabled.
   Returns true if enabled.
   When the buttons property is used, its list of elements are all evaluated.
   If at least one button is enabled, this returns true.
   */
   isEnabled : function () {
      var el = this.getElement(true);
      if (!el) {
         return true;
      }
      var b = this._createButtonsList(el);
      if (b) {
         for (var i = 0; i < b.length; i++) {
            if (this._isDOMEnabled(b[i])) {
               return true;
            }
         }  // for
         return false;
      }
      else {
         return this._isDOMEnabled(el);
      }
   },

   /*
   If the widget is built to handle a specific data type
   other than string, it can create and return a TypeManager class for that data type.
   It also looks for the data-jtac-typemanager and data-jtac-datatype attributes
   for a TypeManager.
   If it does not have a TypeManager to return, it returns null.
   HTML INPUT tags have several data type specific cases based on
   the 'type' attribute. Here are the types supported:
      radio, checkbox - TypeManagers.Boolean
      date - TypeManagers.Date
      datetime, datetime-local - TypeManagers.DateTime
      month - TypeManagers.MonthYear
      time - TypeManagers.TimeOfDay
      number - TypeManagers.Float
      range - TypeManagers.Integer
   */
   _createTypeManager : function (el) {
      var tm = this.callParent([el]);
      if (tm)
         return tm;
      switch (el.type) {
         case "checkbox":
         case "radio":
            return jTAC.createByClassName("TypeManagers.Boolean", null, true);
            break;
         case "date":
            return jTAC.createByClassName("TypeManagers.Date", null, true);
            break;
         case "datetime":
         case "datetime-local":
            return jTAC.createByClassName("TypeManagers.DateTime", null, true);
            break;
         case "month":
            return jTAC.createByClassName("TypeManagers.MonthYear", null, true);
         case "time":
            return jTAC.createByClassName("TypeManagers.TimeOfDay", null, true);
            break;
         case "number":
            return jTAC.createByClassName("TypeManagers.Float", null, true);
            break;
         case "range":
            return jTAC.createByClassName("TypeManagers.Integer", null, true);
            break;
      }
      return null;
   },

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/
   /*
     buttons property: SET function
   */
   setButtons : function (val) {
      if (typeof(val) == "string") { // try to convert to a global function
         val = window[val];   // may return null which will invoke _error() below.
      }
      if ((typeof (val) == "function") || (val instanceof Array)) {
         this.config.buttons = val;
      }
      else
         this._error("Illegal value. See function's documentation.");
   }

}
jTAC.define("Connections.FormElement", jTAC._internal.temp._Connections_FormElement);

jTAC.defineAlias("FormElement", "Connections.FormElement");

/* --- jTAC.connectionResolver ----------------------------------------
The jTAC.connectionResolver object provides a way to
create the appropriate instance of a BaseElement subclass
associated with a unique id of an element on the page.
Normally the id is a DOM element and this factory will return a Connections.FormElement.
However, if you register other connection classes, their
testElementAndCreate() method will be used to determine if 
the id is supported.
You can also register a function which evaluates the id and returns
and instance of the appropriate connection.

Defining your own function
----------------------------
Your function is passed one parameter, id, and returns either
an instance of the BaseElement object, already
assigned to the id, or null indicating that the id is not supported.
The id parameter may be passed either a string or object.
The string is an actual identifier to an object on the page.
The object is an instance of the class used to manage your widget.
For example, Connections.FormElement requires the object to be a DOMElement.

Auto registering your custom BaseElement class
--------------------------------------------------------------
Creators of Connections.BaseElement subclasses need to
determine if their is a definitive way to determine an id is for their
connection, such as a way to locate a jquery-ui object specific to their widget.
When they can do this, they should automatically call register with their
class in their page load code. That allows the page developer to avoid
setting up this factory to handle their class.

jTAC.define("Connections.MyClass", {members});
jTAC.connectionResolver.register(new myConnection());


jTAC.connectionResolver functions
-----------------------------------------
register()
   Pass in either a function or an instance of the 
   Connections.BaseElement subclass that will have its testElementAndCreate()
   function called to see if an id can become your connection class.
   This function actually supports a list of parameters, each
   can be either a function or Connections.BaseElement subclass.
   There is no need to register Connections.FormElement.

create()
   Pass an id. It returns an instance of a Connections.BaseElement
   subclass or null if none found.
   It goes through the items added by register(), first the functions,
   then the classes, in the order they were added.
   If none in that list match, it finally tries Connections.FormElement
   before returning null.
   You can optionally pass a second parameter, a Connections.BaseElement
   that will be used instead of returning null.
   When this returns an object, it will have the id assigned or
   will be able to return an object from its getElement() function.
------------------------------------------------------------------------ */

jTAC.connectionResolver =
{
   /* Global hosting entries made with register(). */
   _regCls: new Array(),
   _regFns: new Array(),

   /* Used by create() when no other registered connection supports the id */
   _formElement: jTAC.create("Connections.FormElement"),

   /* 
   Pass in either a function, the name of a Connections.BaseElement class,
    or an instance of the Connections.BaseElement subclass that will have its testElementAndCreate()
   function called to see if an id can become your connection class.
   This function actually supports a list of parameters, each
   can be either a function or Connections.BaseElement subclass.
   There is no need to register Connections.FormElement.

   Parameters:
      classOrFn (string, object or function) - The first of a list of 
      Connections.BaseElement class names, Connections.BaseElement subclasses 
      or functions to add to the registered list.
   */
   register: function (classOrFn) {
      try
      {
         jTAC._internal.pushContext("connectionResolver.register");

         for (var i = 0; i < arguments.length; i++) {
            var val = arguments[i];
            if (typeof (val) == "function") {
               this._regFns.push(val);
               continue;
            }
            if (typeof val == "string") {
               val = jTAC.create(val, null, true);
            }
            if (val && val.testElementAndCreate) {
               this._regCls.push(val);
            }
            else
               jTAC.error("Could not register an item.");

         }
      }
      finally {
         jTAC._internal.popContext();
      }
   },

   /* 
   Creates an instance of a Connections.BaseElement subclass 
   based on the id passed. It will be a new instance, unless
   the alt parameter is used.
   The instance it returns will have its id or getElement() function
   established to return a valid value.
   It goes through the items added by register(), first the functions,
   then the classes,  in the order they were added.
   If none in that list match, it finally tries Connections.FormElement
   before returning null.
   You can optionally pass a second parameter, a Connections.BaseElement
   that will be used before testing Connections.FormElement.
   When this returns an object, it will have the id assigned or
   will be able to return an object from its getElement() function.

   If the element for the id is a DOM element and contains the
   data-jtac-connection attribute, the name from that attribute
   specifies the Connection class to create.
   This option is only needed if the DOM element is not fully setup
   with widget extensions that map to a specific Connection class
   when the first request from create is made.
   For example, when using unobtrusive validation, it will
   run its setup phase prior to any $(document).ready() call
   in the page where the user has code that adds something like
   the jquery-ui datepicker. Changing the order of scripts
   on the page also fixes this.

   Parameters:
      id (string or Connection object) - Identifies the element that needs
         a connection. 
         The string is an actual identifier to an object on the page.
         The object is an instance of the class used to manage your widget.
         For example, Connections.FormElement requires the object to be a DOMElement.

      altconn (Connection object) - Optional. 
         When no other connection has matched the id,
         this instance of a connection is tested and if supported,
         returned, after having its id updated.
         When another connection has matched the id,
         the properties shared by both connections will have
         their values transferred to the new instance.
   Returns: Instance of the class or null.
   */
   create: function (id, altconn) {

      try
      {
         jTAC._internal.pushContext("resolveConnection");

         var conn = null;
         // see if it is an HTML element with data-jtac-connection. That can specify the class to create
         var el = typeof id == "string" ? document.getElementById(id) : id;   // both cases may return null or undefined
         if (el && el.getAttribute) {
            var name = el.getAttribute("data-jtac-connection");
            if (name) {
               conn = jTAC.create(name, null, true);
               if (conn) {
                  if (!(conn instanceof jTAC.Connections.Base))
                  {
                     jTAC.error("Unknown name in data-jtac-connection attribute of [" + el.id + "].", null, null, true);
                     conn = null;
                  }
               }
            }
         }

         if (!conn) {
            for (var i = 0; i < this._regFns.length; i++) {
               conn = _regFns[i](id);
               if (conn)
                  break;
            }  // for
         }

         if (!conn) {
            for (var i = 0; i < this._regCls.length; i++) {
               conn = this._regCls[i].testElementAndCreate(id);
               if (conn)
                  break;
            }  // for
         }

         if (altconn) {
            if (conn) {   // copy properties from altconn
               conn.allowNone = altconn.allowNone;
            }
            else { // use altconn as the connection
               if (altconn.testElement(id)) // only if id can be proven compatible
                  conn = altconn;
            }
         }
         // last attempt. Use Connections.FormElement
         if (!conn && this._formElement.testElement(id)) {
            conn = jTAC.create("Connections.FormElement");
         }

         if (conn) {
            (typeof (id) == "string") ? conn.setId(id) : conn.setElement(id);
         }

         return conn;
      }
      finally {
         jTAC._internal.popContext();
      }

   }

}  // object assigned to jTAC.ConnectionResolver

