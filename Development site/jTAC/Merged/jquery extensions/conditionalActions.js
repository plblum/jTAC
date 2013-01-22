// jTAC/jquery-ui widgets/jqActions/Base.js
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
Class : jqActions.Base     ABSTRACT CLASS
Extends: None

Purpose:
Abstract base class for Actions used by the conditionalActions jquery-ui widget.
Actions are wrappers around code that is fired by the widget based on the 
results of its evaluation of the Condition object. They can do almost anything,
but typically they modify the appearance or state of an element on the page,
as represented by a jquery element passed into its run method.

jTAC includes many Action classes including:
* jqActions.Show - Make the element's style visible or hidden, 
   optionally using animations like fade and slide.
* jqActions.Enable - Set the disabled attribute to true or false where supported.
* jqActions.ReadOnly - Set the readonly attribute to true or false where supported.
* jqActions.ClassName - Add, remove, or replace the classname attribute's value.
* jqActions.FieldValue - Set the value attribute on form fields.
* jqActions.Href - Set the href or src attribute on img and a tags to a URL.
* jqActions.Style - Change a style attribute.
* jqActions.Attribute - Change any attribute on the element by specifying its name and the new value.
* jqActions.UserFunction - Invoke a function that you attached to its [fnc] property.
Feel free to create your own too. The run() function offloads
the work to two methods, onsuccess() and onfailed() which you override 
to do the work. These methods are usually very simple.
function onsuccess(sender, elements)
{
   elements.show();
}
function onfailed(sender, elements)
{
   elements.hide();
}

Actions are designed as classes so you can provide additional properties on them,
such as the URL used by the UrlAction, the class name in the className action.
Fancier Actions may have rules for animation, references to other elements that 
they interact with or whatever else you need. The idea is that the ConditionalActions
widget is there to invoke the run() method. You do what you need within it.

Essential methods:
   prep() - Called when the Action is first created to let it review
      the list of jquery elements and capture stateful information about them
      that may be used during run().
      For example, the ClassNameAction may capture the current value of the class name
      on the element. That value is used in its onfailed() method to restore
      the class name to its original value.
  
   run() - Called each time the widget evaluates the condition, passing in the 
      result (success or failed), the widget's own object, and the jquery object
      to apply. It calls on the onsuccess() and onfailed() methods to do the actual work.
  
   onsuccess() - Called by run() to update the state of the jquery object
      when the condition was "success".
  
   onfailed() - Called by run() to update the state of the jquery object
      when the condition was "failed".

Essential properties:
   enabled (boolean) - 
      When false, run() does nothing.
  
   id (string) - 
      Optional unique id used to find this instance of the Action
      in the conditionalActions.Actions property so you can modify it.

   selector (string) -
      jquery selector string (the text passed to $(here)). See http://api.jquery.com/category/selectors/.
      While the caller can pass a jquery object identifying all elements to update,
      each Action can replace, append or remove elements based on this jquery selector.
      Use [selectorMode] to determine how to use this.
      If unassigned, the caller's jquery objects are used without modification.

   selectorMode (string) - 
      Determines how to use the [selector] property against the elements
      passed to run() by the caller. Valid strings are:
      * "replace" - Replaces the caller's list. This is the default.
      * "add" - Appends the two lists of elements. Uses $.add()
      * "filter" - A filter that only keeps elements from the caller's list that 
         are found in the [selector]. Uses $.filter()
      * "not" - A filter that only keeps elements from the caller's list that 
         are not found in the [selector]. Uses $.not().
  
   enableSuccess (boolean) - 
      When true (the default), a call to  run() with "success" runs onsuccess. 
      A good way to only modify the jquery object's state for one 
      of the two condition evaluation states.
  
   enableFailed (boolean) - 
      When true (the default), a call to run() with "failed" runs onfailed. 
      A good way to only modify the jquery object's state for one of the two 
      condition evaluation states.
  
   reverse (boolean) - 
      When false (the default), run() with "success"
      calls onsuccess() and with "failed" calls onfailed(). 
      When true, it reverses this calling onsuccess when "failed" and 
      onfailed when "success".
      When true, the [enableSuccess] and [enableFailed] properties
      impact the opposite method.

Required libraries:
ALWAYS LOAD jquery.#.#.#.js
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED

------------------------------------------------------------*/

if (!window.jTAC)
   throw new Error("window.jTAC not created.");

jTAC._internal.temp.jqActions_Base = {
   "abstract": true,

   constructor: function (propertyVals) {

   },

   config: {
      enabled: true,
      id: "",
      selector: "",
      selectorMode: "replace",
      enableSuccess: true,
      enableFailed: true,
      reverse: false
   },

   configrules: {
      selectorMode: ["replace", "add", "remove", "not"]
   },

   /*
   Called when the Action is first created to let it review
   the list of jquery elements and capture stateful information about them
   that may be used during run().
   For example, the ClassNameAction may capture the current value of the class name
   on the element. That value is used in its onfailed() method to restore
   the class name to its original value.
   You must override _prep() to do something. Init() itself is merely a shell
   to setup the call to _prep().
   * sender - The conditionalActions widget. Mostly used to get to its Options object.
   * elements - jquery object identifying the elements whose state may be modified.
   */
   prep: function (sender, elements) {
      elements = this._getElements(elements);
      this._prep(sender, elements);
   },

   /*
   Override to provide prep() functionality. See prep() for details.
   The elements collection has been updated based on the elements passed to prep(),
   [selector] and [selectorMode] properties.
   */
   _prep: function (sender, elements) {
   },

   /*
   Called each time the widget evaluates the condition, passing in the 
   result (success or failed), the widget's own object, and the jquery object
   to apply. It calls on the onsuccess() and onfailed() methods to do the actual work.
   * sender - The conditionalActions widget. Mostly used to get to its Options object.
     If your code needs to know whether it is called from a trigger or page init,
     it can check sender._inInit = true for in page init and false for in a trigger.
   * elements - jquery object identifying the elements whose state may be modified.
   * success (boolean) - When true, run onsuccess. When false, run onfailed.
   If reverse is true, reverse those calls.
   */
   run: function (sender, elements, success) {
      if (!this.enabled)
         return;
      if (this.reverse) {
         success = !success;
      }
      elements = this._getElements(elements);
      if (success && this.enableSuccess) {
         this.onsuccess(sender, elements);
      }
      if (!success && this.enableFailed) {
         this.onfailed(sender, elements);
      }
   },

   /* ABSTRACT METHOD
   Called by run() to update the state of the jquery object
   when the condition was "success".
   * sender - The conditionalActions widget. Mostly used to get to its Options object.
     If your code needs to know whether it is called from a trigger or page init,
     it can check sender._inInit = true for in page init and false for in a trigger.
   * elements - jquery object identifying the elements whose state may be modified.
   */
   onsuccess: function (sender, elements) {
      this.AM();
   },

   /* ABSTRACT METHOD
   Called by run() to update the state of the jquery object
   when the condition was "success".
   * sender - The conditionalActions widget. Mostly used to get to its Options object.
     If your code needs to know whether it is called from a trigger or page init,
     it can check sender._inInit = true for in page init and false for in a trigger.
   * elements - jquery object identifying the elements whose state may be modified.
   */
   onfailed: function (sender, elements) {
      this.AM();
   },

   /*
   Given two sources of elements, callerElements and the [selector] property,
   this returns a source of elements to pass to onsuccess() and onfailed().
   It takes the [selectorMode] into account so long as [selector] has a value.
   Otherwise, it returns the callerElements unchanged.
   */
   _getElements: function (callerElements) {
      if (callerElements.Length == 0) {
         return $(this.selector);
      }
      if (this.selector == "") {
         return callerElements;
      }
      switch (this.selectorMode) {
         case "replace":
            return $(this.selector);
         case "add":
            return callerElements.add(this.selector);
         case "filter":
            return callerElements.filter(this.selector);
         case "not":
            return callerElements.not(this.selector);
         default: // same as replace
            return $(this.selector);
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
jTAC.define("jqActions.Base", jTAC._internal.temp.jqActions_Base);

/* --- jTAC EXTENSIONS ----------------------------------- */
/* STATIC METHOD - EXTENDS jTAC
Creates or updates a Action object.
Returns the object. Use in property setters that host objects.
   val - Supports these values:
      * Class specific object - If passed, it is returned without change.
      * javascript object with jtacClass property -
         Creates an instance of the class named by the jtacClass property
         and assigns the remaining properties to the new object.
      * javascript object without jtacClass property - 
         if existingObject is assigned, its properties are updated.
         If existingObject is null, an exception is thrown.
         If illegal properties are found, exceptions are thrown.
      * string - Specify the class or alias name of the class to create. 
         That class is created with default properties
         and returned.
      * null - return the value of existingObject.
   existingObject - Either null or an object instance. Usage depends on val.
         
*/
jTAC.checkAsAction = function (val, existingObject) {
   return jTAC.checkAsClass(val, existingObject, jTAC.jqActions.Base);
}


jTAC.checkAsActionOrNull = function (val) {
   if (!val) // includes null and ""
      return null;
   return jTAC.checkAsAction(val);
}
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
jTAC.defineAlias("Attribute", "jqActions.Attribute");// jTAC/jquery-ui widgets/jqActions/ClassName.js
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
Class : jqActions.ClassName
Extends: jqActions.Base

Purpose:
Action class to change the [className] attribute of elements.
It can replace the entire value, or append and remove a class name
from within the larger value.
The user can provide either class names for both onsuccess and onfailed cases,
or capture the original class name and use it for the onfailed case.

onsuccess: Changes the class name based on the [mode] and [className] properties
onfailed: Changes the class name back to the original value if [classNameFailed] is unassigned
   or [mode] = "replace".
   Otherwise, it uses the reverse action of the mode ("add"->"remove" and "remove"->"add").
Set [reverse] to true to reverse these behaviors.

Additional properties:
   className (string) -
      The class name to replace, append, or remove in onsuccess. 
      If not assigned, nothing happens.
      If "", it is a valid value which assigns the ClassName to "".

   classNameFailed (string) -
      The class name to use in onfailed when [mode] = "replace".
      If unassigned, its value is captured from the first
      element passed into prep().
      If "", it is a valid value which assigns the ClassName to "".

   mode (string) -
      Determines the behavior:
      * "replace" - replaces the complete class name. This is the default.
      * "add" - uses $.addClass() to add another class to the existing values.
      * "remove" - uses $.removeClass() to remove the class from the existing value.

Aliases:
"ClassName"
"AddClassName" - mode="add"
"RemoveClassName" - mode="remove"

Required libraries:
ALWAYS LOAD jquery.#.#.#.js
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED

------------------------------------------------------------*/

if (!window.jTAC)
   throw new Error("window.jTAC not created.");

jTAC._internal.temp.jqActions_ClassName = {
   extend: "jqActions.Base",

   constructor: function (propertyVals) {

   },

   config: {
      className: null,
      classNameFailed: null,
      mode: "replace"
   },

   configrules: {
      className: jTAC.checkAsStrOrNull,
      classNameFailed: jTAC.checkAsStrOrNull,
      mode: ["replace", "add", "remove"]
   },

   /*
   Captures the class name from the first element passed in.
   */
   _prep: function (sender, elements) {
      this._internal.orig = elements.first().attr("class");
   },

   onsuccess: function (sender, elements) {
      var cn = this.className;
      if (cn == null)
         return;
      switch (this.mode) {
         case "replace":
            elements.attr("class", cn);
            break;
         case "add":
            elements.addClass(cn);
            break;
         case "remove":
            elements.removeClass(cn);
            break;
      }
   },

   onfailed: function (sender, elements) {
      var cn = this.className;
      switch (this.mode) {
         case "replace":
            cn = this.classNameFailed;
            if (cn == null) {
               cn = this._internal.orig;
            }
            if (cn == null)
               return;
            elements.attr("class", cn);
            break;
         case "add":
            elements.removeClass(cn);
            break;
         case "remove":
            elements.addClass(cn);
            break;
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
jTAC.define("jqActions.ClassName", jTAC._internal.temp.jqActions_ClassName);
jTAC.defineAlias("ClassName", "jqActions.ClassName");
jTAC.defineAlias("AddClassName", "jqActions.ClassName", {mode: "add"});
jTAC.defineAlias("RemoveClassName", "jqActions.ClassName", {mode: "remove"});
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
// jTAC/jquery-ui widgets/jqActions/FieldValue.js
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
Class : jqActions.FieldValue
Extends: jqActions.Base

Purpose:
Action class to change the value attribute in form elements.

onsuccess: Assigns the value attribute to the string in [value]
onfailed: Assigns the value attribute to the original value or the value in [valueFailed].
Set [reverse] to true to reverse these behaviors.

Additional properties:
   value (string) -
      The Value to replace.
      If not assigned, nothing happens.
      If "", it is a valid value which assigns the Value to "".

   valueFailed (string) -
      The Value to use in onfailed.
      If unassigned, its value is captured from the first
      element passed into prep().
      If "", it is a valid value which assigns the Value to "".

Required libraries:
ALWAYS LOAD jquery.#.#.#.js
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED

------------------------------------------------------------*/

if (!window.jTAC)
   throw new Error("window.jTAC not created.");

jTAC._internal.temp.jqActions_FieldValue = {
   extend: "jqActions.Base",

   constructor: function (propertyVals) {

   },

   config: {
      value: null,
      valueFailed: null
   },

   configrules: {
      value: jTAC.checkAsStrOrNull,
      valueFailed: jTAC.checkAsStrOrNull
   },

   /*
   Captures the value attribute from the first element passed in.
   */
   _prep: function (sender, elements) {

      this._internal.orig = elements.val();
   },

   onsuccess: function (sender, elements) {
      if (this.value == null)
         return;
      elements.val(this.value);
   },

   onfailed: function (sender, elements) {
      var val = this.valueFailed;
      if (val == null) {
         val = this._internal.orig;
      }
      elements.val(val);
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("jqActions.FieldValue", jTAC._internal.temp.jqActions_FieldValue);
jTAC.defineAlias("FieldValue", "jqActions.FieldValue");
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
// jTAC/jquery-ui widgets/jqActions/ReadOnly.js
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
Class : jqActions.ReadOnly
Extends: jqActions.Base

Purpose:
Action class to change the readOnly attribute of elements
that support that attribute.

onsuccess: Makes the element readOnly=true
onfailed: Makes the element readOnly=false
Set [reverse] to true to reverse these behaviors.

Aliases:
"ReadOnly"
"ReadWrite" - Where reversed = true

Required libraries:
ALWAYS LOAD jquery.#.#.#.js
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED

------------------------------------------------------------*/

if (!window.jTAC)
   throw new Error("window.jTAC not created.");

jTAC._internal.temp.jqActions_ReadOnly = {
   extend: "jqActions.Base",

   constructor: function (propertyVals) {

   },

   onsuccess: function (sender, elements) {
      elements.each(function (i) {
         if (this.readOnly != null)
            this.readOnly = true;
      });
   },

   onfailed: function (sender, elements) {
      elements.each(function (i) {
         if (this.readOnly != null)
            this.readOnly = false;
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
jTAC.define("jqActions.ReadOnly", jTAC._internal.temp.jqActions_ReadOnly);
jTAC.defineAlias("ReadOnly", "jqActions.ReadOnly");
jTAC.defineAlias("ReadWrite", "jqActions.ReadOnly", {reverse: true});
// jTAC/jquery-ui widgets/jqActions/Show.js
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
Class : jqActions.Show
Extends: jqActions.Base

Purpose:
Action class to change the visibility of the elements.
It uses jquery's show() and hide() methods, offering properties
to optionally use these method's animation parameters.
It optionally can use alternative effect methods: slideDown()/slideUp()
or fadeIn()/fadeOut()

onsuccess: Shows a hidden element
onfailed: Hides a visible element
Set [reverse] to true to reverse these behaviors.

Use the [speed] and [callback] properties if you want to use
the animation capabilities built into $.show(speed, callback)
and $.hide(speed, callback).
Change the effect by setting the [effect] property to one of these:
* preserve" - changes the style attribute using visibility
  of "inherit" for show and "hidden" for hide.
  This retains the space consumed by the element
  whereas $.hide() uses style=display:none removing the element completely.
* "fade" - Uses $.fadeIn() and $.fadeOut().
* "slide" - Uses $.slideDown() and $.slideUp().
See http://docs.jquery.com/Effects for more.

Additional properties:
   effect (string) - 
      When "", it uses $.show()/$.hide() functions. This is the default.
      When "preserve", it changes the style attribute using visibility
         of "inherit" for show and "hidden" for hide.
         This retains the space consumed by the element
         whereas $.hide() uses style=display:none removing the element completely.
      When "fade", it uses $.fadeIn() and $.fadeOut().
      When "slide", it uses $.slideDown() and $.slideUp().
  
   speed ("slow", "fast" or integer) -
      When [effect] = "", passed to the speed parameter of the $.show() and $.hide() functions.
      Other effects require it as a parameter and if unassigned, it uses "slow".

   callback (function) - 
      Callback when any animation effect finishes. This is the callback parameter
      for any of the effect functions.
      Unlike the parameterless callback function offered by these jquery functions,
      you can have 1 parameter that will document the call to your callback.
      It is an object with these properties:
         * sender - the widget
         * elements - the jquery object defining all elements to which this function was applied.
         * success - when true, onsuccess() ran. When false, onfailed() ran.
  
Aliases:
"Show"
"Hide"
"FadeIn" - show using $.FadeIn()
"FadeOut" - show using $.FadeOut()
"SlideDown" - show using $.SlideDown()
"SlideUp" - show using $.SlideUp()

Required libraries:
ALWAYS LOAD jquery.#.#.#.js
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED

------------------------------------------------------------*/

if (!window.jTAC)
   throw new Error("window.jTAC not created.");

jTAC._internal.temp.jqActions_Show = {
   extend: "jqActions.Base",

   constructor: function (propertyVals) {

   },

   config: {
      effect: "",
      speed: null,
      callback: null
   },

   configrules: {
      callback: jTAC.checkAsFunctionOrNull
   },

   /*
   Makes visible based on [effect] property rule.
   Uses _show(). Logic is separated out to allow subclasses
   to call _show() or _hide() from either onsuccess() or onfailed().
   */
   onsuccess: function (sender, elements) {
      this._show(sender, elements);
   },

   /*
   Makes visible based on [effect] property rule.
   */
   _show: function (sender, elements) {
      if (sender._inInit) {
         elements.show();
      }
      else {
         var cb = this.callback;
         var that = this;
         if (cb) {
            // creates a closure so the callback knows about sender, elements, 
            // success=false, and the action (represented by 'this')
            var success = false;
            cb = function () {
               that.callback.call(that, {sender: sender, elements: elements, success: true, action: that});
            }
         }

         switch (this.effect) {
            case "":
               if (this.speed == null)
                  elements.show();
               else
                  elements.show(this.speed, cb);
               break;
            case "preserve":
               elements.css("visibility", "inherit");
               if (cb) {
                  that.cb.call(that);
               }
               break;
            case "fade":
               elements.fadeIn(this._fixedSpeed(), cb);
               break;
            case "slide":
               elements.slideDown(this._fixedSpeed(), cb);
               break;
         }
      }
   },

   /*
   Makes invisible based on [effect] property rule.
   Uses _hide(). Logic is separated out to allow subclasses
   to call _show() or _hide() from either onsuccess() or onfailed().
   */
   onfailed: function (sender, elements) {
      this._hide(sender, elements);
   },


   /*
   Makes invisible based on [effect] property rule.
   */
   _hide: function (sender, elements) {
      if (sender._inInit) {
         elements.hide();
      }
      else {
         var cb = this.callback;
         var that = this;
         if (cb) {
            // creates a closure so the callback knows about sender, elements, 
            // success=false, and the action (represented by 'this')
            cb = function () {
               that.callback.call(that, {sender: sender, elements: elements, success: false, action: that});
            }
         }
         switch (this.effect) {
            case "":
               if (this.speed == null)
                  elements.hide();
               else
                  elements.hide(this.speed, cb);
               break;
            case "preserve":
               elements.css("visibility", "hidden");
               if (cb) {
                  that.cb.call(that);
               }
               break;
            case "fade":
               elements.fadeOut(this._fixedSpeed(), cb);
               break;
            case "slide":
               elements.slideUp(this._fixedSpeed(), cb);
               break;
         }
      }
   },



   /*
   Utility to determine the value of the speed property.
   If null, it returns "slow". Otherwise, it returns the speed property value.
   */
   _fixedSpeed: function () {
      return this.speed != null ? this.speed : "slow";
   },


   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

   setSpeed: function (val) {
      if (typeof val == "string") {
         var allowed = ["", "slow", "fast"];
         if (allowed.indexOf(val) == -1)
            this._error("Illegal value [" + val + "].");
      }
      else if (typeof val != "number") {
         this._error("Illegal value [" + val + "].");
      }
      this._defaultSetter("speed", val);
   }
}
jTAC.define("jqActions.Show", jTAC._internal.temp.jqActions_Show);

jTAC.defineAlias("Show", "jqActions.Show");
jTAC.defineAlias("Hide", "jqActions.Show", { reverse: true });
jTAC.defineAlias("FadeIn", "jqActions.Show", { effect: "fade" });
jTAC.defineAlias("FadeOut", "jqActions.Show", { effect: "fade", reverse: true });
jTAC.defineAlias("SlideDown", "jqActions.Show", { effect: "slide" });
jTAC.defineAlias("SlideUp", "jqActions.Show", { effect: "Slide", reverse: true });
// jTAC/jquery-ui widgets/jqActions/Style.js
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
Class : jqActions.Style
Extends: jqActions.Base

Purpose:
Action class to change the value of any value in the style attribute on an element.
The style name is defined in [Name]. Its value is defined in [value]

onsuccess: Assigns the style name to the value in [value]
onfailed: Assigns the style name to the original value or the value in [valueFailed].
Set [reverse] to true to reverse these behaviors.

Additional properties:
   styleName (string) -
      The name of the style to change.

   value  -
      The value to replace. It is up to the user to assign a valid value
      for the style.
      If "", the style item is removed.

   valueFailed (string, number, or boolean) -
      The value to use in onfailed.
      If "[", the style item is removed.
      If null, its value is captured from the first
      element passed into prep().
      It defaults ot null.

Required libraries:
ALWAYS LOAD jquery.#.#.#.js
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED

------------------------------------------------------------*/

if (!window.jTAC)
   throw new Error("window.jTAC not created.");

jTAC._internal.temp.jqActions_Style = {
   extend: "jqActions.Base",

   constructor: function (propertyVals) {

   },

   config: {
      styleName: "",
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

      this._internal.orig = elements.css(this.styleName);
   },

   onsuccess: function (sender, elements) {
      if (this.value == null)
         return;
      elements.css(this.styleName, this.value);
   },

   onfailed: function (sender, elements) {
      var val = this.valueFailed;
      if (val == null) {
         val = this._internal.orig;
      }
      elements.css(this.styleName, val);
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("jqActions.Style", jTAC._internal.temp.jqActions_Style);
jTAC.defineAlias("Style", "jqActions.Style");// jTAC/jquery-ui widgets/jqActions/UserFunction.js
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
Class : jqActions.UserFunction
Extends: jqActions.Base

Purpose:
Action class to run your own function where you can do whatever you 
want without writing a custom Action class.

Your function takes the same parameters as the run() function:
* sender (the widget object)
* elements - jquery object whose elements should be modified.
* success (boolean) - when true, the condition evaluated as success.
   When false, the condition evaluated as failed.

The onsuccess and onfailed functions are not used. The [enabled]
and [reverse] properties still work.

Example that changes several styles on all elements:
function dim(sender, elements, success) {
	if (success)
		elements.css({border-color: '', background-color:''});	// removes these values
	else
		elements.css({border-color:'red', 'background-color':'yellow'});
}

Additional properties:
   fnc (function) -
      A reference to a javascript function that will do the work.
      Its parameters are described above.
      It can also be assigned to a string that is the name of a function
      found on the window object. This simplifies unobtrusive setup.

Required libraries:
ALWAYS LOAD jquery.#.#.#.js
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED

------------------------------------------------------------*/

if (!window.jTAC)
   throw new Error("window.jTAC not created.");

jTAC._internal.temp.jqActions_UserFunction = {
   extend: "jqActions.Base",

   constructor: function (propertyVals) {

   },

   config: {
      fnc: null
   },

   configrules: {
      fnc: jTAC.checkAsFunction
   },

   run: function (sender, elements, success) {
      if (!this.enabled || !this.fnc)
         return;
      if (this.reverse) {
         success = !success;
      }
      this.fnc(sender, elements, success);
   },



   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("jqActions.UserFunction", jTAC._internal.temp.jqActions_UserFunction);
// jTAC/jquery-ui widgets/ConditionalActions.js
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

Purpose:
ConditionalActions is a jquery-ui widget that uses a Condition to determine
when to run one or more actions. It implements a classic pattern: the "if" statement
with one or more triggers that invoke it. The Condition is the boolean logic
of the if statement while the actions are the code to run based on the result
of the Condition. Triggers are click, change and keypress, events attached to other HTML 
elements.

Primarily actions change the appearance of HTML elements on the page, such as
visibility or a style.

The triggers are usually HTML elements whose data changes or that are clickable,
like checkboxes being toggled, textboxes whose text has changed, or a tabbed
interface where a tab is a <div> tag whose click event is the trigger.

This pattern is easy to create with jquery without using the ConditionalActions widget.
Here it is changing the visibility of a textbox based on a checkbox being clicked:

$("#CheckBox1").click(function (evt) {
   if ($("#CheckBox1").val() != "") {
      $("#TextBox1").show();
   }
   else {
      $("#TextBox1").hide();
   } 
});

Here it is using the widget. 
$("#TextBox1").ConditionalActions(
   {condition: jTAC.create("CompareToValue", {elementId: "CheckBox1", valueToCompare: true}),
    actions: jTAC.create("jqActions.Show")
});

Let's look through this example:
* Notice that the widget is attached to the element that will be changed (the textbox) 
  and the Condition evaluates the checkbox.

* The widget knows that the elementid value of the Condition is also the trigger and 
  even knows to use a click event because its a checkbox instead of a changed event.
  You can specify other triggers by adding a jquery object that specifies those triggers
  in the [triggers] property.

  This adds triggers for all radiobuttons with the name "Group" where the first is
  evaluated by the Condition.
      $("#TextBox1").ConditionalActions(
         {condition: jTAC.create("CompareToValue", {elementId: "Radio1", valueToCompare: true}),
          actions: jTAC.create("jqActions.Show"),
          triggers: $("input[name='group']:radio")
      });

* The Condition can be setup with a shorthand if you want to evaluate a checkbox,
   radiobutton or textbox for having a value or not, by specifying its element ID
   instead of a Condition object. This is the same as above.
      $("#TextBox1").ConditionalActions(
         {condition: "CheckBox1",
          actions: [jTAC.create("jqActions.Show")]
      });

* The Condition is actually optional. If you don't specify it, another popular
   pattern is created: the click, change, or keypress event handler firing
   some action.
      $("#TextBox1").ConditionalActions(
         {condition: jTAC.create("CompareToValue", {elementId: "Radio1", valueToCompare: true}),
          actions: [ 
            jTAC.create("jqActions.Disabled"), 
            jTAC.create("jqActions.ClassName", {className: "normal", classNameFailed: "dimmed"})
          ]
      });

* Each action is an object that inherits from jqActions.Base.

  jTAC provides a number of action classes.
   > jqActions.Show - Make the element's style visible or hidden, 
      optionally using animations like fade and slide.
   > jqActions.Enable - Set the disabled attribute to true or false where supported.
   > jqActions.ReadOnly - Set the readonly attribute to true or false where supported.
   > jqActions.ClassName - Add, remove, or replace the classname attribute's value.
   > jqActions.FieldValue - Set the value attribute on form fields.
   > jqActions.Href - Set the href or src attribute on img and a tags to a URL.
   > jqActions.Style - Change a style attribute.
   > jqActions.Attribute - Change any attribute on the element by specifying its name and the new value.
   > jqActions.UserFunction - Invoke a function that you attached to its [fnc] property.
   See \jTAC\jquery-ui widgets\jqActions\Base.js for details on Actions.

* A Condition's evaluate() method returns one of three values: "success", "failed",
  or "cannot evaluate". Each Action object runs different code based on the result of the condition.
  For example, jqActions.Show uses $().show() when the condition evaluates as "success"
  and $().hide() when the condition evaluates as "failed".

  When evaluate() returns "cannot evaluate", the actions are not applied normally.
  But you can override this by using the [cannotEvalUses] property.

* Most Action classes have properties to customize their appearance. 
  You can see how the jqActions.ClassName class (shown above) 
  has properties that specify two class names.
  When you see "Failed" in a property name, it means its used when
  the condition evaluates as "failed" (effectively runs the action for the "else" clause).

* The [actions] property name is plural for a reason. It can host an array
  of actions allowing you to do multiple things.
      $("#TextBox1").ConditionalActions(
         {condition: jTAC.create("CompareToValue", {elementId: "Radio1", valueToCompare: true}),
          actions: [ 
            jTAC.create("jqActions.Disabled"), 
            jTAC.create("jqActions.ClassName", {className: "normal", classNameFailed: "dimmed"})
          ]
      });

* There are other options. See the Options section below.


Establishing this ui widget:
NOTE: These instructions apply to the non-unobtrusive approach only.
Please see conditionalActions-unobtrusive.js if using the unobtrusive approach.

The SHORT VERSION:
1. Add script files
2. Add $("#elementid").ConditionalActions(options) to the element to change,
   passing in an object with options defined below under "Options".

Step-by-step:

1. Add these scripts:
   jquery.#.#.#.js
   jquery-ui-#.#.#.js
   /JTAC/jTAC.js
   /jTAC/TypeManagers/Base.js
   /jTAC/Connections/Base.js
   /jTAC/Conditions/Base.js
   /jTAC/jquery-ui widgets/conditionalActions.js
   /jTAC/jquery-ui widgets/jqActions/Base.js

2. Create a JavaScript function that will run after all HTML is setup such as through
   $(document).ready(function() { your code });

3. Create the [options] object in your new function. 
   Options can use the class jTAC_ConditionalActionOptions as a template
   or just an ordinary javascript object.
   NOTE: Visual Studio 2010+ users will have intellisense support when setting up
   properties when using jTAC_ConditionalActionOptions.

   var options = new jTAC_ConditionalActionOptions();

4. Identify these HTML elements on the page.
   * The element whose appearance or state will change.
     This is the element that will be attached to the conditionalActions widget.
     If you have additional elements to change based on the same Condition
     and get the same actions, they can be defined in the [elementsToChange] property
     of the [options] object.
   * The elements whose data values are evaluated by the Condition.
   * All elements identified by Conditions will become triggers.
     If there are more elements to use a triggers, they can be defined
     in the [triggers] property of the [options] object.

5. Create the condition and assign it to the [options.conditions] property. 
   It will be a class inheriting from jTAC.Conditions.Base.
   Use this pattern:
   options.condition = new jTAC.create('[classname]', {properties});
   
   Example:
   options.condition = new jTAC.create('Conditions.CompareToValue', {elementId: 'checkBox1', valueToCompare: true});

   There are two shortcut cases:
   * If using a checkbox or radiobutton whose checked state is the only thing evaluated by the Condition,
     just assign [options.condition] to the HTML elementID of the checkbox or radiobutton. 
     It knows to create the Conditions.CompareToValue condition.
     options.condition = "checkBox1";

   * If using a single textbox or list and its value is evaluated as either blank or assigned,
     just assign [options.condition] to the HTML elementID of the textbox or list. 
     It knows to create the Conditions.Required condition.
     options.condition = "textBox1";

   NOTE: The Condition is optional. If omitted, you must setup the [options.triggers] property
   and the actions will only run their "onsuccess" functions.

5b. Add script files that support the Condition you have selected. There are often
   base classes and classes for TypeManagers and Connections needed.

6. Create the actions and assign them to the [options.actions] property. 
   You can have one or more.

   Actions are objects that inherit from jqActions.Base. These classes are defined in the 
   \jTAC\jquery-ui widgets\jqActions\ folder.

   If none of the Action classes suit your needs, you can hookup a function where you do 
   the work to the [options.actionFnc] property.

   Here are several ways to define the action:
   * Create an instance of the object:
     options.actions = new jTAC.create("[classname]", {property:value, property2:value, etc});

     Example:
     options.actions = new jTAC.create("jqActions.Show", {effect: 'fade', reverse: true});

   * If you don't need to assign any properties, you can just define the action
     by using its class name:
     options.actions = "[classname]";
     Example:
     options.actions = "jqActions.Show";

   * If you have a single action, assign its object to the [options.actions] property.
     options.actions = action;

   * If you have several actions, assign an array of Action objects to the [options.actions] property.
     options.actions = [action1, action2];
     
6b. Add script files for each Action class used.

7. Define the conditionalActions widget attached to the element that will be changed
   by the actions. Pass in the [options] object.
   
   Its syntax is:
   $("#elementid").ConditionalActions(options);

   Example:
      var options = new jTAC_ConditionalActionsOptions();
      options.condition = new jTAC.create('Conditions.CompareToValue', {elementId: 'checkBox1', valueToCompare: true});
      options.actions = ['jqActions.Show'];
      $("#textbox1").ConditionalActions(options);

   Feel free to consolidate it all into one statement without defining the jTAC_ConditionalActionsObject:
      $("#textbox1").ConditionalActions(
         {  condition: new jTAC.create('Conditions.CompareToValue', {elementId: 'checkBox1', valueToCompare: true}), 
            actions: ["jqActions.Show"]
         });


8. Sometimes you need several ConditionalActions widgets on a single HTML element
   because there are differences in Conditions and Actions.
   jquery-ui does not permit multiple ui widgets of the same class on a single HTML element.
   Instead, create an array of options and pass them into the widget:

      $("#elementid").ConditionalActions([options, options2]);

      In this example, there are two checkboxes. Each has its own action. Checkbox1 changes the disabled attribute
      while Checkbox2 changes the background-color style between blue and green.

      $("#textbox1").ConditionalActions(
      [
         {condition: new jTAC.create('Conditions.CompareToValue', {elementId: 'checkBox1', valueToCompare: true}), 
          actions: ["jqActions.Enable"]},
         {condition: new jTAC.create('Conditions.CompareToValue', {elementId: 'checkBox2', valueToCompare: true}), 
          actions: [new jTAC.create("jqActions.Style", {attrStyle: 'background-color', value: 'green', valueFailed: 'blue'})]}
      ]);


Options:
   condition (Conditions.Base subclass) -
      The Condition that will be run to determine whether the action
      runs its onsuccess() or onfailed() method.

      Supported values:
      - A Conditions.Base subclass fully setup, including its elementID specifying the element to evaluate.
      - A JSON string with the 'jtacClass' property identifying the class name of the Condition
         and remaining properties are to set same-named properties on the Condition created.
      - A string with the element ID to evaluate. If the element is a checkbox or radiobutton,
         it will create a Conditions.CompareToValue condition with its valueToCompare=true
         (when the control is marked, it evaluates as "success").
         If the element is any other form element (input, textarea, select),
         it will create a Conditions.Required condition. When the element has text,
         it evaluates as "success".
      - A jquery object representing one HTML form element. Used to get the element ID
        and create conditions just like described above.
      - A Connections.BaseElement subclass representing one HTML form element.
        Used to get the element ID and create conditions just like described above.

      You can omit this property. Without a condition, the [triggers] property
      sets up click or change event handlers that always invoke the Action's onsuccess() function
      (or its onfailed() function when Action.reverse is true).

   triggers (jquery object) -
      A jquery object that is used to setup either click or change event handlers
      on the elements it refers to. When those elements invoke their click or changed
      event, it runs the full process: calls condition.evaluate() and then
      calls the run() method of each action with the result of evaluate().
      The HTML type of elements determines if a check or change event handler is setup.
      Those that have an onchange event will have it setup. The rest will have their onclick event setup.
      This list can be populated from elements identified in the Condition when [autotrigger] is true.

      Alternative values:
      - Assign a string that is jquery selector ID. See: http://api.jquery.com/category/selectors/
      - jTAC Connection.
      - Array of any of the supported types.
      If any are assigned, they replace the existing value and are 
      immediately converted to a jquery object.

   autoTrigger (boolean) - 
      When true, populate the [triggers] jquery object by looking through the Condition's Connections.
      If a Connection points to an HTML element, it is added.
      This always appends to [triggers] allowing a mixture of triggers from both those 
      preassigned and the condition.
      When null, it does the same as true if [triggers] is unassigned.
      It defaults to null.

   keypressTriggers (boolean) -
      When true, textbox inputs and textarea elements will include triggers
      using their keyPress event. This will let the action run on each keystroke.
      It defaults to true.

   actions (list of jqAction.Base) -
      An array of jqAction.Base objects. They are called in the order found.

      Alternative values:
      - A single jqAction. An array will be created to contain it when assigned.
      - JSON string describing a single jqAction, 
         with the 'jtacClass' property identifying the class name of the Action
         and remaining properties are to set same-named properties on the Action created.
      - JSON string describing an array of jqActions. It is basically:
         "[{action}, {action2}, ...]" where each action is JSON as described previously.

   actionFnc (function) -
      Adds to the actions list a function where you define how to handle the action.
      This is the same as adding a jqAction.UserFunction to the [actions] property,
      but simplifies the process since it's often used.
      Your function must have these parameters:
      * sender (the widget object)
      * elements - jquery object whose elements should be modified.
      * success (boolean) - when true, the condition evaluated as success.
         When false, the condition evaluated as failed.
      You can also assign a string that is the name of a function
      found on the window object. This simplifies unobtrusive setup.


   elementsToChange (jquery object) - 
      A jquery object describing all elements that will be modified by the Actions.
      This list is passed to the Action's run() method. (Individual actions
      can used a modified version of this list or even replace it based on their
      [selector] and [selectorMode] properties.)

      Alternative values:
      - Assign a string that is jquery selector ID. See: http://api.jquery.com/category/selectors/
      - jTAC Connection.
      - Array of any of the supported types.
      If any are assigned, they replace the existing value and are 
      immediately converted to a jquery object.
   
   autoElementToChange (boolean) -
      Determines if the element to which the widget is attached is 
      added to the elementsToChange collection automatically.
      It defaults to true.

   cannotEvalUses (integer) -
      When the condition.evaluate() method returns "cannot evaluate",
      this value is used to determine what to do. 
      When 1, use "success".
      When 0, use "failed".
      When -1, do nothing.
      It defaults to -1.

   runOnLoad (boolean) -
      When true, trigger/run the process after the widget is installed.
      When false, the elements to change remain unchanged until 
      a trigger is invoked.
      It defaults to true.

   depend (Conditions.Base subclass) - 
      An optional condition that when setup must evaluate as "success"
      before any Action's run() method will be invoked. 
      When its evaluate() method returns "failed" or "cannot evaluate",
      no actions are run.

Commands supported by $().conditionalActions("here"):
   "run" -
      Runs the same process as a trigger would: calls the condition's evaluate()
      method and passes its result to each Action.

Required libraries:
ALWAYS LOAD jquery.#.#.#.js
ALWAYS LOAD jquery-ui-#.#.#.js
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
ALWAYS LOAD /jTAC/Conditions/Base.js
ALWAYS LOAD /jTAC/TypeManagers/Base.js
ALWAYS LOAD /jTAC/Connections/Base.js
Load supporting Conditions, TypeManagers, and Connections.

------------------------------------------------------------*/
/* --- jquery-ui extension "ConditionalActions" ------------------------------
See documentation in the file header.
-----------------------------------------------------------------------*/
(function ($) {
   var ca = {
      options: new jTAC_ConditionalActionsOptions(),

      _create: function () {
         if (!window.jTAC)
            throw new Error("window.jTAC not created.");
         jTAC.require(["Conditions.Base", "Connections.Base", "TypeManagers.Base"]);

      },

      _init: function () {
         try {
            jTAC._internal.pushContext("ConditionalActions._init()");

            var that = this;
            var fullOpts = this.options;
            // the options should be an array of jTAC_ConditionalActionsOptions (or equivalents)
            // When passed through $(id).ConditionalActions([options, options2]) is a real array.
            // By jquery-ui converts it to an object with property names of "0", "1", etc.
         // Detect if its that converted object. If not, convert it into an array.
            if (fullOpts["0"] !== undefined) {
               // since its not an array, convert it back to an array
               var fixed = [];
               for (var pos = 0; true; pos++) {
                  var key = pos.toString();
                  var item = fullOpts[key];
                  if (item === undefined)
                     break;   //!done
                  fixed.push(item);
               }

               fullOpts = this.options = fixed;
            }
            else {
               fullOpts = this.options = [fullOpts]; // convert to array
            }
            for (var i = 0; i < fullOpts.length; i++) {
               this._prepOptions(fullOpts[i]);
               this._attachTriggers(fullOpts[i]);
            }
            this._inInit = true; // flag lets jqActions.Base.run() know its called from within _init in case it needs different behaviors.
            try {
               for (var i = 0; i < fullOpts.length; i++) {
                  var o = fullOpts[i]; 
                  if (o.runOnLoad) {
                     this._runOne(o);
                  }
               }
            }
            finally {
               this._inInit = false;
            }
         }
         finally {
            jTAC._internal.popContext();
         }

      },

      _prepOptions: function (o) {
         var that = this;

      // fix defaults for missing non-null properties
         if (o.runOnLoad === undefined) {
            o.runOnLoad = true;
         }
         if (o.autoElementToChange === undefined) {
            o.autoElementToChange = true;
         }
         if (o.cannotEvalUses === undefined) {
            o.cannotEvalUses = -1;
         }
         if (o.autoTrigger === undefined) {
            o.autoTrigger = null;
         }
         if (o.keypressTriggers === undefined) {
            o.keypressTriggers = true;
         }

         if (o.depend === undefined) {
            o.depend = null;
         }
         // Conditions may initially be a string or object identifying the HTML element ID
         // to use with a Conditions.Required or Conditions.ValueToCompare object.

         var cond = o.condition;
         if (cond) {
            var ceid = null;
            if (cond instanceof jTAC.Connections.BaseElement) {
               ceid = cond.getElement(false).id;
            }
            else if (cond instanceof jQuery) {
               if (cond.length)
                  ceid = cond.get()[0].id;
            }
            else if ((typeof cond == "string") && (cond.indexOf("{") == -1)) {   // a string without JSON is considered an ID
               ceid = cond;
            }

            if (ceid) {
               var condel = document.getElementById(ceid);
               if (!condel) {
                  jTAC.error("Option.condition specifies the id of element [" + ceid + "]. This element is not found.");
               }
               if ((condel.tagName == "INPUT") &&
                  /^(checkbox)|(radio)$/.test(condel.type)) {
                  cond = jTAC.create("Conditions.CompareToValue", {elementId: ceid, valueToCompare:true});
               }
               else {
                  cond = jTAC.create("Conditions.Required", {elementId: ceid});
               }

            }
            else { // did not convert an ID. Check for the usual: Condition object or JSON
               cond = jTAC.checkAsConditionOrNull(cond);
            }
         }
         o.condition = cond || null;

         var trig = o.triggers;
         if (trig) {
            trig = jTAC.checkAsJquery(trig);
         }
         if (cond && (o.autoTrigger || ((o.autoTrigger == null) && !trig))) {
            var list = [];
            o.condition.collectConnections(list);
            var t = jTAC.checkAsJquery(list);
            trig = trig ? trig.add(t) : t;
         }
         o.triggers = trig;

         var a = o.actions;
         var la = o.actions = [];
         if (a) {
            if (a instanceof Array) {
               for (var i = 0; i < a.length; i++) {
                  la.push(jTAC.checkAsAction(a[i]));
               }
            }
            else
               la.push(jTAC.checkAsAction(a));
         }
         if (o.actionFnc) {
            var a = jTAC.create("jqActions.UserFunction");
            a.fnc = jTAC.checkAsFunction(o.actionFnc);
            la.push(a);
         }
         var etc = o.elementsToChange;
         if (etc) {
            etc = jTAC.checkAsJquery(etc);
         }
         if (o.autoElementToChange) {
            if (etc) {
               etc = etc.add(this.element);
            }
            else {
               etc = this.element;
            }
         }
         o.elementsToChange = etc;
         
         for (var i = 0; i < la.length; i++) {
            la[i].prep(this, etc);
         }

         if (o.depend) {
            o.depend = jTAC.checkAsConditionOrNull(o.depend);
         }
      },


      _setOption: function (key, value) {
         $.Widget.prototype._setOption.apply(this, arguments);
      },

      /*
      Applies the Options.triggers fire either their onchange or onclick
      event to invoke the run() method.
      */
      _attachTriggers: function (o) {
         // at this point, o.triggers should contain a jquery object
         var that = this;
         o.triggers.each(function (elIdx, el) {
            var click = true;
            switch (el.tagName) {
               case "INPUT":
                  click = /^(checkbox)|(radio)$/.test(el.type);
                  break;
               case "TEXTAREA":
                  click = true;
                  break;
               case "SELECT":
                  click = true;
                  break;
            }
            if (click) {
               $(el).click(function (evt) {
                  that._runOne(o); 
               });
            }
            else {
               $(el).change(function (evt) {
                  that._runOne(o); 
               });
            }
            if (o.keypressTriggers) {
               var use = el.tagName == "TEXTAREA";
               if (!use && (el.tagName == "INPUT"))
                  use = !/^(checkbox)|(radio)|(button)|(submit)|(image)|(reset)|(range)$/.test(el.type);
               if (use) {
                  $(el).keyup( function ( evt ) {
                     that._runOne(o);
               });
               }
            }
         });
      },

   /*
   Calls the condition's evaluate() method and passes its result to each Action.
   This is invoked by the triggers and can be used as the "run" command
   in $(id).conditionalActions("run").
   Takes no action if the condition's canEvaluate() returns false.
   If the condition's evaluate() returns -1 ("cannot evaluate"),
   the action is run only when options.cannotEvalUses is 1 or 0.
   If the options is an array of options, this runs the options
   specified by the index position or the first if index=null.
   */
      run: function (index) {
         if (index == null)
            index = 0;
         this._runOne(this.options[index]);
      },

   /*
      For the "run2" command to run the 2nd options in the array
      through $(id).conditionalActions("run2").
   */
      run2: function () {
         this.run(1);
      },
   /*
      For the "run3" command to run the third options in the array
      through $(id).conditionalActions("run3").
   */
      run3: function () {
         this.run(2);
      },

   /*
      Same as run(), but runs all elements in the options array.
      Supported by the "runAll" command in 
      in $(id).conditionalActions("run").
   */
      runAll: function () {
         var o = this.options;
         for (var i = 0; i < o.length; i++) {
            this._runOne(o[i]);
         }
      },

   /*
   Called by run() to run for the option object passed in.
   */
      _runOne: function (o) {
         var that = this;
         if (o.actions) {
            if (o.depend) { 
               if (!o.depend.canEvaluate())
                  return;
               if (o.depend.evaluate() != 1)
                  return;
            }
            var result = -1;  // success=1, failed=0, cannot eval=-1
            if (o.condition) {
               if (!o.condition.canEvaluate())
                  return;
               result = o.condition.evaluate();
               if (result == -1)
                  result = o.cannotEvalUses;
            }
            else // no condition
               result = 1; //success
            if (result != -1) {
               var acts = o.actions;
               for (var i = 0; i < acts.length; i++) {
                  acts[i].run(this, o.elementsToChange, result != 0);
               }
            }
         }
      }

   }; // ca object
   $.widget("ui.ConditionalActions", ca);
})(jQuery);  



/* --- CLASS jTAC_ConditionalActionsOptions -------------------------------
Options object definition used by ConditionalActions.
-----------------------------------------------------------------------*/

function jTAC_ConditionalActionsOptions() {
}
jTAC_ConditionalActionsOptions.prototype = {
   /* Type: Conditions.Base object
      The Condition that will be run to determine whether the action
      runs its onsuccess() or onfailed() method.

      Supported values:
      - A Conditions.Base subclass fully setup, including its elementID specifying the element to evaluate.
      - A JSON string with the 'jtacClass' property identifying the class name of the Condition
         and remaining properties are to set same-named properties on the Condition created.
      - A string with the element ID to evaluate. If the element is a checkbox or radiobutton,
         it will create a Conditions.CompareToValue condition with its valueToCompare=true
         (when the control is marked, it evaluates as "success").
         If the element is any other form element (input, textarea, select),
         it will create a Conditions.Required condition. When the element has text,
         it evaluates as "success".
      - A jquery object representing one HTML form element. Used to get the element ID
        and create conditions just like described above.
      - A Connections.BaseElement subclass representing one HTML form element.
        Used to get the element ID and create conditions just like described above.

      You can omit this property. Without a condition, the [triggers] property
      sets up click or change event handlers that always invoke the Action's onsuccess() function
      (or its onfailed() function when Action.reverse is true).

   */
   condition : null,

   /* Type: jquery object
   A jquery object that is used to setup either click or change event handlers
   on the elements it refers to. When those elements invoke their click or changed
   event, it runs the full process: calls condition.Evaluate() and then
   calls the run() method of each action with the result of Evaluate().
   The HTML type of elements determines if a check or change event handler is setup.
   Those that have an onchange event will have it setup. The rest will have their onclick event setup.
   This list can be populated from elements identified in the Condition when [autotrigger] is true.

   Alternative values:
   - Assign a string that is jquery selector ID. See: http://api.jquery.com/category/selectors/
   - jTAC Connection.
   - Array of any of the supported types.
   If any are assigned, they replace the existing value and are 
   immediately be converted to a jquery object.
   */
   triggers : null,

   /* Type: Boolean
   When true, populate the [triggers] jquery object by looking through the Condition's ValueConnections.
   If a ValueConnection points to an HTML element, it is added.
   This always appends to [triggers] allowing a mixture of triggers from both those 
   preassigned and the condition.
   When null, it does the same as true if [triggers] is unassigned.
   It defaults to null.
   */
   autoTrigger: null,

   /* Type: Boolean
      When true, textbox inputs and textarea elements will include triggers
      using their keyPress event. This will let the action run on each keystroke.
      It defaults to true.
   */
   keypressTriggers: true,

   /* Type: array of jqAction.Base objects
   An array of jqAction.Base objects. They are called in the order found.

   Alternative values:
   - Assign to a function. It will create a jqAction.UserFunction action for this function.
   Your function must has these parameters:
   * sender (the widget object)
   * elements - jquery object whose elements should be modified.
   * success (boolean) - when true, the condition evaluated as success.
   When false, the condition evaluated as failed.
   - A single jqAction. An array will be created to contain it when assigned.
   - JSON string describing a single jqAction, 
   with the 'jtacClass' property identifying the class name of the Action
   and remaining properties are to set same-named properties on the Action created.
   - JSON string describing an array of jqActions. It is basically:
   "[{action}, {action2}, ...]" where each action is JSON as described previously.   
   */
   actions: null,


   /* Type: function
      Adds to the actions list a function where you define how to handle the action.
      This is the same as adding a jqAction.UserFunction to the [actions] property,
      but simplifies the process since its often used.
      Your function must has these parameters:
      * sender (the widget object)
      * elements - jquery object whose elements should be modified.
      * success (boolean) - when true, the condition evaluated as success.
         When false, the condition evaluated as failed.
      You can also assign a string that is the name of a function
      found on the window object. This simplifies unobtrusive setup.
   */
   actionFnc: null,

   /* Type: jquery object
   A jquery object describing all elements that will be modified by the Actions.
   This list is passed to the Action's run() method. (Individual actions
   can used a modified version of this list or even replace it based on their
   [selector] and [selectorMode] properties.)

   Alternative values:
   - Assign a string that is jquery selector ID. See: http://api.jquery.com/category/selectors/
   - jTAC Connection.
   - Array of any of the supported types.
   If any are assigned, they replace the existing value and are 
   immediately be converted to a jquery object.
   */
   elementsToChange: null,

   /* Type: Boolean
      Determines if the element to which the widget is attached is 
      added to the elementsToChange collection automatically.
      It defaults to true.
   */
   autoElementToChange: true,

   /* Type: Integer
      When the condition.evaluate() method returns "cannot evaluate",
      this value is used to determine what to do. 
      When 1, use "success".
      When 0, use "failed".
      When -1, do nothing.
      It defaults to -1.
   */
   cannotEvalUses: -1,

   /* Type: boolean
      When true, trigger/run the process after the widget is installed.
      When false, the elements to change remain unchanged until 
      a trigger is invoked.
      It defaults to true.
   */
   runOnLoad: true,

/* Type: Conditions.Base subclass
      An optional condition that when setup must evaluate as "success"
      before any Action's run() method will be invoked. 
      When its evaluate() method returns "failed" or "cannot evaluate",
      no actions are run.
*/
   depend: null

};

/*
Utility to convert a value into a jquery object.
It supports:
- Existing jquery object
- string representing a jquery selector string
- jTAC Connection object
- Array of any of the above
*/
jTAC.checkAsJquery = function(val) {
   if (val instanceof jQuery)
      return val;
   if (val instanceof Array) {
      var result = $();
      for (var i = 0; i < val.length; i++) {
         result = result.add(jTAC.checkAsJquery(val[i]));
      }
      return result;
   }
   if (val instanceof jTAC.Connections.BaseElement) {
      return $(val.getElement(true));
   }
   if (typeof val == "string") {
      return $(val);
   }
   if (val instanceof jTAC.Connections.Base) {
      return $(); // handle Connections are do not include elements
   }
   jTAC.error("Cannot convert to a jquery object");
}

