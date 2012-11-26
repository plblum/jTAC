// jTAC/Connections/BaseElement.js
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
Class : Connections.BaseElement     ABSTRACT CLASS
Extends: Connections.Base

Purpose:
Base class for accessing an element on the page.

Its default functionality handles many aspects of DOM.

Its getElement() method returns an instance of the object that describes
the widget. It does not have to be a DOM element. For example,
a jquery connection can be built around jquery elements.

Its getLabel() method can locate the label for the element instead of
using the value from the defaultLabel property.
If the element has the data-msglabel attribute, its value is used.
Otherwise, if there is a <label> tag whose for= points to the element,
its text is used, after cleaning it up in the _cleanLabel() method.

See \jTAC\Connections\Base.js for an overview of Connections.

Properties introduced by this class:
   id (string) - the id attribute value of an element on the page.

   allowNone (boolean) - When true, if the id is not found when calling
      get or set methods, nothing happens. When false, an exception occurs.

   trim (boolean) - Determines if strings are returned from getTextValue()
      after trimming lead and trailing spaces. isNullValue also 
      applies this property to evaluate if null.
      Defaults to true.
      Subclasses should call _cleanString(text) in their getTextValue()
      and isNullValue() methods.

   unassigned (string) - Allows for watermarks in a textbox
      and a non-empty string value for a list to mean unselected.
      A watermark is text that appears when the textbox is empty.
      Lists usually use the value "" to mean an unselected state.
      But if you want to have a "no selection" item with a different value,
      assign this to the string for that value.
      When assigned, this string is compared to the textual value
      of the widget. If it matches, getTextValue() returns the empty string
      and IsNullValue() returns true.
      It defaults to null.

   unassignedCase (boolean) - When using the unassigned property, 
      this determines if the 'unassigned' string is compared case sensitive or not. 
      When true, it compares case sensitive. 
      When false, it does not.
      It defaults to false.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Connections.Base

----------------------------------------------------------- */
jTAC._internal.temp._Connections_BaseElement = {
   extend: "Connections.Base",
   "abstract": true,

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      id: null,
      allowNone: false,
      trim: true,
      unassigned: null,
      unassignedCase: false
   },

   configrules: {
      id: jTAC.checkAsStrOrNull,
      unassigned: jTAC.checkAsStrOrNull
   },

   /*
   Retrieves the object associated with the id that manages the widget.
   Throws exceptions if not found, unless allowNone is true.
   noneAllowed (boolean) - When defined, it overrides the allowNone property.
   When null/undefined, use allowNone.
   */
   getElement: function (noneAllowed) {
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
         if (!id) {
            if (noneAllowed == null) {
               noneAllowed = this.getAllowNone();
            }
            if (!noneAllowed)
               this._error("Did not assign the id.");
            return null;
         }
         var el = document.getElementById(id);
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
   Lets you set the element object itself that is returned by getElement.
   Normally you will assign the id and let getElement do the work.
   Use this when you have an instance of the element AND do not expect
   it to be deleted for the life of this Connection.
   This is intended to be a public method.
   */
   setElement: function (value) {
      this._internal.element = value;
   },

   /*
   Checks the HTML element to confirm that it is supported.
   If not, it should throw an exception.
   */
   _checkElement: function (element) {
      this.AM();  // throws exception
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
   addEventListener: function (name, func, funcid) {
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
   Returns: When true, the event was attached. When false it was not supported.

   This class does nothing.
   */
   addSupportEventListeners: function (name, func, funcid) {
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
   testElement: function (id) {
      return false;
   },

   /*
   Determines if the id or object passed is supported by this class.
   If so, it creates an instance of the connection class using 
   the id or object passed in to support the getElement() method.
   Uses the testElement method to handle the evaluation of id.

   id (string or object) - If its string, evaluate it as a unique id
   used to identify the element. If its an object, see if its
   the correct class, such as DOMElement.

   Returns an instance of the implementing class with the id assigned
   or the getElement() method ready to return the element.
   If the id is not supported, it returns null.
   */
   testElementAndCreate: function (id) {
      if (this.testElement(id)) {
         var conn = jTAC.createByClassName(this.$fullClassName);
         (typeof id == "string") ? conn.setId(id) : conn.setElement(id);

         return conn;
      }
      return null;
   },

   /*
   Returns the TypeManager assigned to the element. 
   If none is found, it attempts to create one.
   Any created is stored with the element so all consumers
   of the element get the same TypeManager.
   */
   getTypeManager: function () {
      var tm,
      el = this.getElement(true);
      if (el) {

         var tm = this.getData("typemanager");  // NOTE: All connections to this element will share the same TypeManager instance due to this.
         if (tm) {
            return tm;
         }
         tm = this._createTypeManager(el);
         if (tm) {
            if (tm instanceof jTAC.TypeManagers.Base)
            {
               this.setData("typemanager", tm);

               return tm;
            }
            // tm may still be an object with properties to assign in the next step
         }
      }
      return null;
   },
   /*
   The widget can define a TypeManager as an attribute.
   There are several formats:
   1) JSon exposed as an HTML attribute called "data-jtac-typemanager":
   <input type='text' data-jtac-typemanager="{'jtacClass': 'date', 'dateFormat' : 1 }" />
   2) A string specifying a class name defined in by jTAC.define() or jTAC.defineAlias()
   such as "Integer", "Float", "Date", "DateTime", "Currency",
   "Percent", "TimeOfDay", and "Duration".
   Use the "data-jtac-datatype" attribute.
   <input type='text' data-jtac-datatype="date.abbrev" />
   3) A hybrid of the above two, where data-jtac-datatype defines the object to create
   and data-jtac-typemanager contains an object with property name and value
   pairs that override those in the typemanager created.
   4) An actual TypeManager object created programmatically and
   assigned to the Element as the property 'data-typemanager'.
   The first two formats actually get converted and create this value.

   */
   _createTypeManager: function (el) {
      try
      {
         this._pushContext();
         var tm = this.getData("typemanager");  // NOTE: All connections to this element will share the same TypeManager instance due to this.
         if (tm)
            return tm;
         tm = this.getData("jtac-typemanager");
         if (tm) {
            if (typeof tm == "string") {
               try {
                  tm = eval("(" + tm + ");");
               }
               catch (e) {
                  jTAC.error("JSon parsing error. " + e.message, this, null, true);
               }
            }
            if (tm.jtacClass) {
               tm = jTAC.create(null, tm);
            }

            if (tm instanceof jTAC.TypeManagers.Base)
            {
               this.setData("typemanager", tm);

               return tm;
            }
            // tm may still be an object with properties to assign in the next step
         }

         var dt = this.getData("jtac-datatype");
         if (dt) {
            tm = jTAC.create(dt, tm);
         }


         if (tm instanceof jTAC.TypeManagers.Base) {
            this.setData("typemanager", tm);
            return tm;
         }
         else if (tm)
            this._error("data-jtac-typemanager or datatype could not convert into a TypeManager object.");

         return null;
      }
      finally {
         this._popContext();
      }

   },
   /*
   Attempts to get a value associated with the data collection of the element.
      key (string) - The value key in the data collection.
   Returns the value or null if not available.
   */
   getData: function (key) {
      var val,
      el = this.getElement(true);
      if (el) {
         var val = el["data-" + key];
         if (val === undefined) {
            val = el.getAttribute("data-" + key);
            if (val != null) {
               el["data-" + key] = val;
            }
         }
      }
      return val;
   },


   /*
   Assigns or replaces the value into the data collection of the element.
   key (string) - The value key in the data collection.
      value - The data to store with the key.
   */
   setData: function (key, value) {
      var el = this.getElement(true);
      if (el) {
         el["data-" + key] = value;
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
   isVisible: function () {
      return this._isDOMVisible(this.getElement(true));
   },

   /* STATIC METHOD
   Utility to check if a DOM element is visible by looking at its
   display and visibilty styles.
   el (DOM Element)
   */
   _isDOMVisible: function (el) {
      if (!el) {
         return true;
      }
      var v = 1;
      while (v && (el != null) && (el != document.body)) {
         v = !((el.style.visibility == "hidden") || (el.style.display == "none"));
         el = el.parentNode;
      }  // while 
      return v;
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
   isEnabled: function () {
      return this._isDOMEnabled(this.getElement(true));
   },

   /*
   Utility to check of a DOM element is disabled. It must have
   a disabled property to be checked. Otherwise, this returns true.
   el (DOM Element)
   */
   _isDOMEnabled: function (el) {
      if (!el || el.disabled == null)
         return true;
      return !el.disabled;
   },

   /*
   Determines if the element is editable by the user.
   Returns true when editable.
   This class returns true if both isVisible() and isEnabled() are true.
   */
   isEditable: function () {
      return this.isVisible() && this.isEnabled();
   },

   /* 
   Locates a string that can be displayed as the label for the element.
   There are several sources for a label:
   * The element can host this label in its data-msglabel attribute.
     If you are using localization, a lookupID can be in the data-msglabel-lookupid attribute.
     If present, this overrides the remaining options.
   * The element can specify the id of another HTML element whose innerHTML
     is the label with the data-msglabel-from attribute.
     The text retrieved will be cleaned up (no HTML tags, trimmed non-alphanumeric characters)
     via _cleanLabel().
   * A <label for=> HTML element where for= specifies the ID of this element.
     Its innerHTML is used, after cleaning up.
      NOTE: This function requires jquery to locate the label for= node. If
      jquery is not present, that feature is not used.
   Returns the label string or the value passed into the missing parameter if not found.
   NOTE: The value "data-msglabel" was chosen over "data-label" to avoid
   conflicts with other systems.
   If element is null, it returns missing.
   */
   getLabel: function () {
      var r = this._locateLabel(this.getElement(true));
      if (r == null) {
         r = this.callParent();
      }
      return r;
   },

   /* Low level function used by getLabel().
   Locates a string that can be displayed as the label for the element.
   There are several sources for a label:
   * The element can host this label in its data-msglabel attribute.
     If you are using localization, a lookupID can be in the data-msglabel-lookupid attribute.
     Define the lookupid in your \jTAC\Translations\ script files with the localized names. 
     If present, this overrides the remaining options.
   * The element can specify the id of another HTML element whose innerHTML
     is the label with the data-msglabel-from attribute.
     The text retrieved will be cleaned up (no HTML tags, trimmed non-alphanumeric characters)
     via _cleanLabel().
   * A <label for=> HTML element where for= specifies the ID of this element.
     Its innerHTML is used, after cleaning up.
      NOTE: This function requires jquery to locate the label for= node. If
      jquery is not present, that feature is not used.
   NOTE: The value "data-msglabel" was chosen over "data-label" to avoid
   conflicts with other systems.
      element (DOM Element) - Accepts null.
   Returns the label string or null if not located.
   The result will not contain HTML tags found in the source.
   */
   _locateLabel: function (element)
   {
      if (!element)
         return null;
      var update = false;  // when true, use cleanlabel and update data-msglabel.
      var t = element.getAttribute("data-msglabel");
      var lu = element.getAttribute("data-msglabel-lookupid");
      if (lu) {
         t = jTAC.translations.lookup(lu, t);
         update = true;
      }
      if (t == null) {
         var id = element.getAttribute("data-msglabel-from");
         if (id) {
            var lbl = document.getElementById(id);
            if (lbl) {
               t = lbl.innerHTML;
               update = true;
            }
         }
      }
      if ((t == null) && window.jQuery) { // this code only works with jQuery present
         var lbl = $("label[for='" + element.id + "'][generated!='true']");  // jquery-validate creates a label to host the error message. 
         // It assigns a custom attribute, 'generated=true' to that label. 
         // We need to avoid it.
         if (lbl) {
            t = lbl.html();
            update = true;
         }
      }
      if (t && update) {
         t = this._cleanLabel(t);
         // update data-label to avoid searching each time
         element.setAttribute("data-msglabel", t);
      }

      return t;   // may be null
   },

   /* Utility function
   Prepares a label string extracted from HTML on the page.
   It removes HTML tags and trims lead and trailing non-alphanumeric characters.
   For example:
   "My favorite:" -> "My favorite"
   */
   _cleanLabel: function (label) {
      // strip the HTML tags. Tags are always "<" + 1 or more characters + ">".
      var t = jTAC.replaceAll(label, "<(.|\n)+?>", "");

      // if it came from a label, strip lead and trail non-alpha numeric text.
      t = t.replace(/[^\dA-Za-z]+$/, ""); // trail non-alpha numeric
      t = t.replace(/^[^\dA-Za-z]+/, ""); // lead
      return t;
   },

   /*
   Returns the current style sheet class name associated with the element
   or "" if none.
   This class returns the value of the class property on the HTML element.
   */
   getClass: function () {
      var el = this.getElement();
      if (el && (el.className != null)) {
         return el.className;
      }
      return "";
   },

   /*
   Sets the current style sheet class name. If the widget has multiple
   classes for its various parts, this impacts the part most closely associated
   with the data entry, such as the input tag.
   */
   setClass: function (css) {
      var el = this.getElement();
      if (el && (el.className != null)) {
         el.className = css;
      }
   },

   /*
   Appends the class name provided to the existing one. 
   Effectively it creates the pattern "[old class] [new class]".
   css (string) - The class name to append.
   Returns true unless the class already appears. If so, no changes
   are made and it returns false.
   */
   addClass: function (css) {
      if (!css)
         return false;
      var oc = this.getClass();
      var re = jTAC.delimitedRE(css, "\\s");
      if (re.test(oc))
         return false;
      var nc = jTAC.trimStr(oc + " " + css);
      this.setClass(nc);
      return true;
   },

   /*
   Removes the style sheet class from the element's current class.
   */
   removeClass: function (css) {
      if (css) {
         var nc = this.getClass();
         // need to ensure the space or line ends surround css so we don't delete "blah" within "[old class] superblah"
         var re = jTAC.delimitedRE(css, "\\s");
         nc = jTAC.trimStr(nc.replace(re, " "));  // inserts a space in case both lead and trailing spaces are matched by the regexp. It will be stripped in the final step
         this.setClass(nc);
      }
   },

   /*
   Trims lead and trailing spaces from the string
   if the trim property is true.
   Then compares the result to the unassigned property, if setup.
   If it matches the unassigned property, it returns the empty string.
   */
   _cleanString: function (value)
   {
      var s = this.getTrim() ? jTAC.trimStr(value) : value;
      return this._matchUnassigned(s) ? "" : s;
   },

   /*
   Returns true if the text passed matches the 'unassigned' property's text
   and false if it does not.
   */
   _matchUnassigned: function (text)
   {
      var wm = this.getUnassigned();
      if (wm)
      {
         var cs = this.getUnassignedCase();
         if ((wm == text) ||
             (!cs && (wm.toLowerCase() == text.toLowerCase())))
         {
            return true;
         }
      }
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
jTAC.define("Connections.BaseElement", jTAC._internal.temp._Connections_BaseElement);

