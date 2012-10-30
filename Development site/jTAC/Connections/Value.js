// jTAC/Connections/Value.js
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
Class : Connections.Value
Extends: Connections.Base

Purpose:
For holding a value in a property of this object.
Store the value in its value property.

If the type is something other than a string, identify the typeName that
makes typeSupported() return true. The typeName can be defined in
the [supportedTypeName] property or determined when the value property is set.
For numbers, its better to specify "integer" or "float" in [supportedTypeName] because
setvalue always treats a number type as "integer".

See \jTAC\Connections\Base.js for an overview of Connections.

Properties introduced by this class:
   value - The actual value stored.

   nullValue - Determines a value that means null. Used by isNullValue to
      compare the value property to this property.
      It defaults to null.

   supportedTypeName (string) - 
      The type name that makes the typeSupported() function return true.
      It is set whenever you set the [value] property, so long as the
      value is a number, string, or boolean. You must set it 
      explicitly for any other type or if your number is a float.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Connections.Base

----------------------------------------------------------- */
jTAC._internal.temp._Connections_Value = {
   extend: "Connections.Base",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );
   },

   config: {
      value: null,
      nullValue: null,
      supportedTypeName: null
   },
   /* 
   Retrieve the string representation of the value.
   Returns a string. If no value, it returns the empty string.
   */
   getTextValue : function () {
      var val = this.getValue();
      if (val == null)
         val = "";
      else {
         var tm = this.getTypeManager();
         try {
            val = tm ? tm.toString(val) : val.toString();
         }
         catch (e) {
            val = val.toString();
         }
      }
      return val;
   },

   /* 
   Set the value passing in a string.
     Text (string) - the value to set.
   */
   setTextValue : function (text) {
      this.setValue(text);
   },

   /*
   Supports the type of value defined by the constructor, or
   when setValue is called to refresh the default value.
   */
   typeSupported : function (typeName) {
      return typeName == this.getSupportedTypeName();
   },

   /*
   Retrieves a value of a specific type (number, Date, boolean, string).
   The caller must call typeSupported() first to determine if this function
   will work.
      typename (string) - If null, use the default type (usually there is a single type supported
         other than string). Otherwise, one of the values that would return
         true when calling typeSupported().
   Returns the value based on the expected type.
   */
   getTypedValue : function (typeName) {
      if ((typeName != null) && !this.typeSupported(typeName))
         this._error("Type not supported");
      return this.getValue();
   },

   /*
   Sets the value represented by a specific type (number, Date, boolean, string).
   The caller must call typeSupported() first to determine if this function
   will work.
      value - The value to update. Must be a type supported by this method
         or subclass should throw an exception.
   */
   setTypedValue : function (value) {
      this.setValue(value);
   },

   /*
   Returns true when the value assigned is actually null.
   Strings = "" and numbers = 0 are not null.
      override (boolean) - Normally a boolean value will cause
         this function to always return false. When override is true
         and the value is false, this function returns true.
   */
   isNullValue : function (override) {
      if (!override && (typeof(this._value) == "boolean")) {
         return false;
      }
      return this.getValue() == this.getNullValue();
   },

   /*
   If the widget is built to handle a specific data type
   other than string, it can create and return a TypeManager class for that data type.
   If it does not have a TypeManager to return, it returns null.
   Handles different types based on the supportedTypeName property:
      boolean - TypeManagers.Boolean
      date - TypeManagers.Date
      float - TypeManagers.Float
      integer - TypeManagers.Integer
   */
   getTypeManager : function () {
      switch (this.getSupportedTypeName())
      {
         case "boolean":
            return jTAC.create("TypeManagers.Boolean", null, true);
            break;
         case "integer":
            return jTAC.create("TypeManagers.Integer", null, true);
            break;
         case "float":
            return jTAC.create("TypeManagers.Float", null, true);
            break;
         case "date":
            return jTAC.create("TypeManagers.Date", null, true);
            break;
      }  // switch
      return null;
   },


   /*
   Utility to change the current "typeName" supported by the typeSupported(),
   based on the type of value passed as the parameter. It can only 
   identify "integer" from number, "boolean", and "date".
   For any other type, you should pass the type into the constructor.
   Does nothing if a value of null is passed.
   */
   _updateTypeName : function (value) {
      if (value != null) {
         var current = this.getSupportedTypeName();
         // Note: string type does not use supportedTypeName
         if (typeof (value) == "number") {
            if (current != "float") {  // float is preserved
               current = "integer";
            }
         }
         else if (typeof (value) == "boolean")
            current = "boolean";
         else if (typeof (value) == "object")
         {
            if (value instanceof Date)
               current = "date";
         }
         this.setSupportedTypeName(current);
      }
   },


   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

   /* value property: SET function
   Sets the value attribute value of an HTML element.
   */
   setValue : function (value)
   {
      this.config.value = value;
      this._updateTypeName(value);
   }
}
jTAC.define("Connections.Value", jTAC._internal.temp._Connections_Value);
