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
