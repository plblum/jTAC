// jTAC/Connections/UserFunction.js
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
Class : Connections.UserFunction
Extends: Connections.Base

Purpose:
Write code that supplies a value to a Condition, such as a calculated
number or a string built from several other fields.
If using calculations, also consider using the Calculations.CalcWidget
or Calculation jquery-ui widget, which has its own Connection class.

This Connection class only reads data. It does not support setTextValue()
or setTypedValue().

Set up:
If the value returned is a string type, it does not need a TypeManager.
Otherwise, define a TypeManager in the [datatype] or [typeManager] properties.

Then you can either override the userFunction() method or create a separate
method that you assign to the [fnc] property.

Your function will be passed a list of values extracted from other
connections. Those connections are identified in the [connections] property,
which is an array of actual Connection objects or ids to elements on the page.

The function has these parameters:
- sender (Connection.UserFunction) - The object that calls this.
   Use it to access the TypeManager with getTypeManager().
- values (Array of values) - This array contains values retrieved from 
   the [connections] and prepared with the TypeManager (if used).
   The values will be strings if no TypeManager is used.
Return: A value compatible with the TypeManager or a string if no TypeManager.
Return null if there is no value available.

Properties introduced by this class:
   fnc (function) - 
      The user function to call when you do not override this class.
      It can be assigned a javascript function or the name of
      a globally defined function (it is a function on the window object).
      Leave it null if overriding the userFunction() method in a subclass.

   connections (array of Connections) - 
      Connections that are the source of data to pass to your user function.
      This array can contain:
         - Actual Connection objects
         - strings which are the IDs of elements on the page
         - a JavaScript object with the jtacClass property defining 
            the Connection class to create and other properties to assign to the
            instance of that Connection class.
      All elements will be converted to Connection objects by the time the 
      user function is invoked.

   required (array of boolean) -
      If you require a valid and non-null value from a Connection,
      assign the array element matching the Connection element in 
      [connections] to true. For example, if the 2nd Connection object
      in [connections] is required, use required: [false, true].
      Can be left unassigned.

   datatype (string) -
      The class or alias name of the TypeManager that determines the
      native type of values passed into your user function.
      (This does not determine the type returned by your function. Use [typeName]
      for that.)

   typeManager (TypeManager) -
      The TypeManager that determines the
      native type of values passed into your user function.
      (This does not determine the type returned by your function. Use [typeName]
      for that.)
      Set this if the [datatype] property cannot specify 
      the correct TypeManager because you need to explicitly set properties.
      It will be set if using [datatype] by the time your user function is invoked.

   typeName (string) - 
      The type that will be returned by your user function.
      This value is used by the typeSupported() method to determine
      if the getTypedValue() method is available.
      This value is normally determined by the TypeManager's storageTypeName() method.
      If there is no TypeManager, it defaults to "string".
      Set it explicitly if another type is needed. Supported values:
      "integer", "float", "date", "time", "datetime", "boolean", "string".

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED

Does not require or utilize jquery itself. These classes can be
used outside of jquery, except where jquery globalize demands it
(jquery globalize is designed to work independently of jquery.)

------------------------------------------------------------*/
if (!window.jTAC)
   throw new Error("window.jTAC not created.");

jTAC._internal.temp._Connections_UserFunction = {
   extend: "Connections.Base",

   constructor: function ( propertyVals ) {
      this.callParent([propertyVals]);

   },

   config: {
      fnc: null,
      connections: [],
      required: [],
      datatype: "",
      typeManager: null,
      typeName: ""
   },

   configrules: {
      fnc: jTAC.checkAsFunctionOrNull,
      typeManager: jTAC.checkAsTypeManagerOrNull
   },



/*
   If the user subclasses, override this function to do the calculation.
   It is set to [fnc] by default. It is replaced when the user sets the [fnc] property.
      sender (conn) - The connection object making this call.
      elementVals (array) - Array of values returned from the list of connections
         identified by the [elementIds] property. These should all be strings or "" when no value was found.
   Return the value based on the correct type. If are are not using a TypeManager, return strings.
   Otherwise, return the native type defined by the TypeManager defined in [datatype].
   If there is no value to return, return null.
   This function is also used by isNullValue, which returns true when this returns null.
*/
   userFunction: function(sender, elementVals) {
      this._AM();
   },

   /* 
   Retrieve the string representation of the value.
   Returns a string.
   */
   getTextValue : function () {
      this._prepare();
      if (!this.config.typeManager) {
         var vals = this._getConnValues();
         if (!vals)
            return "";
         return this.config.fnc.call(this, this, vals);
      }
      var val = this.getTypedValue(this.config.typeName);
      return val != null ? val.toString() : "";
   },

   typeSupported : function (typeName) {
      this._prepare();
      return typeName == this.config.typeName;
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
      this._prepare();
      if (!this.config.typeManager)
         this._error("Not supported.");
      var vals = this._getConnValues();
      if (vals == null)
         return null;
      return this.config.fnc.call(this, this, vals);
   },



   /*
   Determines if the value is assigned or not.
   This uses calls [fnc] method. If that returns null, so does isNullValue().
   Also, if using the [required] property and a connection has a null value
   when required, this returns true.
   Otherwise is returns false.
      override (boolean) - ignored
   */
   isNullValue : function (override) {
      this._prepare();
      var vals = this._getConnValues();
      if (vals == null)
         return true;

      return this.config.fnc.call(this, this, vals) == null;
   },
   
   /*
   Determines if the element is editable.
   Returns true when editable.
   This class always returns true.
   */
   isEditable: function () {
      return false;
   },

   /*
   If the widget is built to handle a specific data type
   other than string, it can create and return a TypeManager class for that data type.
   If it does not have a TypeManager to return, it returns null.
   This class always returns null.
   */
   getTypeManager : function () {
      this._prepare();
      return this.config.typeManager;
   },

/*
   Called by entry point methods before doing work to ensure
   the [fnc], [connections], [typeManager], and [typeName] properties
   have been setup.
*/
   _prepare: function () {
      var config = this.config;
      if (!this.config.fnc)
         this.config.fnc = this.userFunction;

      var conns = config.connections;

      for (var i = 0; i < conns.length; i++) {
         var conn = conns[i];
         if (!(conn instanceof jTAC.Connections.Base)) {
            if (typeof conn == "string") {   // it is an element Id
               conns[i] = jTAC.connectionResolver.create(conn, null);
            }
            else { // it is an actual Connection object or object with jtacClass property.
               conns[i] = jTAC.checkAsConnection(conn);
            }
         }
      }  // for

      if (!config.typeManager && config.datatype) {
         config.typeManager = jTAC.create(config.datatype);
      }
      config.typeName = config.typeManager ? config.typeManager.storageTypeName() : "string";

   },

/*
   Returns an array of values retrieved from the Connections in 
   [connections]. If the [required] property is true and a 
   Connection returns IsNullValue() = true, this returns null.
*/
   _getConnValues: function() {
      var config = this.config;
      var conns = config.connections;
      var tm = config.typeManager;
      var result = [];
      for (var i = 0; i < conns.length; i++) {
         var conn = conns[i];
         var val = tm ? null : "";
         if (conn.isValidValue(config.typeName)) {
            if (conn.isNullValue()) {
               if (config.required[i] == true)
                  return null;
            }
           
            val = tm ? tm.toValueFromConnection(conn) : conn.getTextValue();
         }
         result.push(val);
      }
      return result;
   }



}
jTAC.define("Connections.UserFunction", jTAC._internal.temp._Connections_UserFunction);
