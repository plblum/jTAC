// jTAC/Connections/Base.js
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
Class : Connections.Base      ABSTRACT CLASS
Extends: nothing

Purpose:
A Connection object provides two-way data transfer between code and an element
on the page, such as a form field's value attribute. 
It can be limited to one-way transfer, where the code can request a value,
but not set it. This allows Connections be hosts to a value.

Connections are used by Condition objects to retrieve a value to evaluate.
That value can come from an element on the page when the FormConnection class is used.
When using the ValueConnection class, it holds a fixed value.

Connections can transfer several types of data. All should handle
getting and setting string values via their getTextValue() and setTextValue() methods,
even if the native value of stored in another type. 
(They should convert native to string in that case.)
HTML Form elements all keep a string representation in their value attribute
(document.getElementById("textbox1").value).
Some Form elements have other representations of data:
  * The checkbox and radio inputs have the checked attribute which is a boolean value.
  * The HTML5 date, time, datetime, etc inputs have the valueAsDate property which is 
      a Date object.
  * The HTML5 number and range inputs have the valueAsNumber property which
      is a number value.

To support these non-string values, use the getTypedValue() and setTypedValue()
methods. First check if a type is supported by passing one of the following
strings to the typeSupported() method:
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
      HTML's select element supports this.
  "indices" - Supports an array of integers representing multiple 
      offsets in a list.
      HTML's select element supports this.


Essential Methods:
Here are the essential methods of a Connection class
  getTextValue() - retrieve the string representation of the value.
  setTextValue(value) - assign a value represented as a string.
  typeSupported(typename) - Check if a type other than string is supported.
      If it is, the setTypedValue() and getTypedValue() methods
      can be used for this type. See 
      Subclasses may introduce other type strings, such as a rich text editor
      may offer "string" to return a value without any formatting codes
      and "html" to get the formatted version.
  getTypedValue(typename) - if the typeSupported() function supports a type and that type
      is needed, this will be called to get a value of that type.
  setTypedValue(value) - if the typeSupported() function supports a type and 
      that type is needed, this is called to set the value, passing in that type.
  isNullValue() - Determines if the value is assigned or not.
      HTML form elements are null when their value attribute is "".
  isValidValue(typename) - Determines if the value held by the widget
      will create a validvalue for the given type. Returns true
      if it can convert and false if not. It also returns true if isNullValue is true.
  textLength() - Determines the length of the text value.
  isEditable() - Determines if the element allows editing.
  getTypeManager() - If the widget is built to handle a specific data type
      other than string, it can create and return a TypeManager class for that data type.
  getLabel() - Returns a string that can be displayed as the label for the element.
  
By using subclassing, you can support data transfer with widgets that
may use code to access its value, and it may supply the value as
something other than a string. For example, a datePicker may introduce
a DatePickerConnection that calls its API function to get a Date object.
Also, a rich text editor may introduce a RichTextConnection that calls
its API to get and set the string it contains.
Your subclasses may support other types of data than those listed above
for the typeSupported(), getTypedValue(), and setTypedValue().


Properties introduced by this class:
   defaultLabel (string) - 
      The string returned by getLabel() when the user did not 
      provide support for it on the element.

   defaultLookupKey (string) -
      Provides a key that is used with the jTAC.translations system
      to retrieve a localized string that is used instead of defaultLabel.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED

Does not require or utilize jquery itself. These classes can be
used outside of jquery, except where jquery globalize demands it
(jquery globalize is designed to work independently of jquery.)

------------------------------------------------------------*/
if (!window.jTAC)
   throw new Error("window.jTAC not created.");

jTAC._internal.temp._Connections_Base = {
   "abstract": true,

   constructor: function ( propertyVals ) {

   },

   config: {
      defaultLabel: "Field",
      defaultLookupKey: null
   },

   configrules: {
      defaultLookupKey: jTAC.checkAsStrOrNull
   },

   /* 
   Retrieve the string representation of the value.
   Returns a string.
   */
   getTextValue : function () {
      this.AM();  // throws exception
   },

   /* 
   Set the value passing in a string.
     Text (string) - the value to set.
   */
   setTextValue : function (text) {
      this.AM();  // throws exception
   },

   /*
   Check if a type other than string is supported.
   If it is, the setTypedValue() and getTypedValue() methods
   can be used for this type. 
   Here are the predefined type names that can be passed into the typeName parameter:
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
         HTML's select element supports this.
     "indices" - Supports an array of integers representing multiple 
         offsets in a list.
         HTML's select element supports this.
   Subclasses may introduce other type strings, such as a rich text editor
   may offer "string" to return a value without any formatting codes
   and "html" to get the formatted version.

   */
   typeSupported : function (typeName) {
      this.AM();  // throws exception
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
      this.AM();  // throws exception
   },

   /*
   Sets the value represented by a specific type (number, Date, boolean, string).
   The caller must call typeSupported() first to determine if this function
   will work.
   Subclasses should test the type of the object passed in to ensure it is still legal.
      value - The value to update. Must be a type supported by this method
         or subclass should throw an exception.
   */
   setTypedValue : function (value) {
      this.AM();  // throws exception
   },

   /*
   Determines if the value is assigned or not.
   For example, HTML form elements are null when their value attribute is "".
      override (boolean) - Some widgets can either return a real value
         or treat that value as null. For example, a checkbox and radiobutton
         can treat its checked=false state as either false or null.
         Normally isNullValue should indicate false in these cases.
         When override is true, isNullValue will indicate true in these cases.
   */
   isNullValue : function (override) {
      this.AM();  // throws exception
   },

   /*
   Determines if the value held by the widget will create a valid value for the given type.
      typename (string) - If null, use the default type (usually there is a single type supported
         other than string). Otherwise, one of the values that would return
         true when calling typeSupported(). 
   Returns true if it can convert and false if not. It also returns true if isNullValue is true
   or the typename is not supported.
   */
   isValidValue : function (typename) {
      if (!this.typeSupported(typename))
         return true;
      if (this.isNullValue())
         return true;
      try {
         var val = this.getTypedValue(typename);
         if ((val == null) || isNaN(val))
            return false;
      }
      catch (e) {
         return false;
      }
      return true;
   },

/*
   Determines the length of the text value.
   While usually the length is the same as the string value represented by 
   the element, there are cases where the string value is not what is
   saved on postback. 
   For example, the HTML TextArea allows ENTER in the text. Many browsers
   report the length of the string with 1 character (%AO) for each ENTER.
   However, all browsers postback two characters (%0D%A0). 
   So this function can return a length adjusted with the value used in postback.
*/
   textLength: function() {
      var text = this.getTextValue();
      return text ? text.length : 0;
   },
   
   /*
   Determines if the element is editable.
   Returns true when editable.
   This class always returns true.
   */
   isEditable : function () {
      return true;
   },

   /* 
   Returns a string that can be displayed as the label for the element.
   This class returns the defaultLabel property value.
   It will also use defaultLookupKey to get a localized value.
   */
   getLabel : function () {
      return jTAC.translations.lookup(this.getDefaultLookupKey(), this.getDefaultLabel());
   },

   /*
   If the widget is built to handle a specific data type
   other than string, it can create and return a TypeManager class for that data type.
   If it does not have a TypeManager to return, it returns null.
   This class always returns null.
   */
   getTypeManager : function () {
      return null;
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("Connections.Base", jTAC._internal.temp._Connections_Base);


/* STATIC METHOD - EXTENDS jTAC
   Creates or updates a TypeManager object.
   Returns the object. Use in property setters that host objects.
      val - Supports these values:
         Class specific object - If passed, it is returned without change.
         javascript object with jtacClass property -
            Creates an instance of the class named by the jtacClass property
            and assigns the remaining properties to the new object.
         javascript object without jtacClass property - 
            if existingObject is assigned, its properties are updated.
            If existingObject is null, an exception is thrown.
            If illegal properties are found, exceptions are thrown.
         string - Specify the class or alias name of the class to create. 
            That class is created with default properties
            and returned.
         null - return the value of existingObject.
      existingObject - Either null or an object instance. Usage depends on val.
         
*/
jTAC.checkAsConnection = function ( val, existingObject ) {
   return jTAC.checkAsClass( val, existingObject, jTAC.Connections.Base );
}
/*
jTAC.checkAsConnection = function ( val, defaultValue ) {
   try
   {
      jTAC._internal.pushContext();

      if ( (val == null) && (defaultVal !== undefined) )
         return defaultVal || null;

      if ( val && (typeof val == "object") && !val.$className) {
         if ( val.jtacClass ) {
            val = jTAC.create(null, val, true);
         }
         else if ( defaultVal ) {
      // a plain object and just update the properties on defaultVal and return it.
      // Reject it if any property is not legal
            for (var name in val) {
               if (!defaultVal.setProperty(name, val[name]))  // will throw exceptions for illegal values
                  jTAC.error("Could not set the property [" + name + "] on the Connection.");
            }
            return defaultVal;
         }
      }
      else if (typeof(val) == "string") {
         val = jTAC.create(val, null, true);
      }
      if (val instanceof jTAC.Connections.Base) {
         return val;
      }
      jTAC.error("Requires a Connection object.");
   }
   finally {
      jTAC._internal.popContext();
   }
}
*/

/* STATIC METHOD - EXTENDS jTAC
Same as jTAC.checkAsConnection but allows assigning null to the result.
*/
jTAC.checkAsConnectionOrNull = function ( val ) {
   return jTAC.checkAsConnection(val, null);
}

