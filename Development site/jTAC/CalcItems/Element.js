// jTAC/CalcItems/Element.js
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
Class : CalcItems.Element
Extends: CalcItems.Base

Purpose:
Evaluates an element on the page, whether DOM element or a widget. 
It uses a Connection object to associate with the element
and a TypeManager to return a numeric value from the connection. 
User must specify the id of the element in the [elementId] property
or the Connection object in the [connection] property.
If they specify the id, the jTAC.connectionResolver object will
determine the best Connection object for that id.

The TypeManager is determined in several ways:
1. The user can supply it by defining its name in the [datatype] property
   or creating an instance and assigning it to the [typeManager] property.
2. The Connection object may return a TypeManager, especially if the 
   element is a specific datatype like integer, float, or date.
3. If neither of the above supply a TypeManager, TypeManagers.Float is used.

See \jTAC\Calculations\CalcItems\Base.js for an overview of CalcItems.

Properties introduced by this class:
   typeManager (TypeManager object)- 
      Gets the user specified TypeManager object.
      If not defined, the above rules are used to determine it.

   datatype (string) - 
      The datatype assigned to the TypeManager object.
      When setting it, the typeManager property is updated.
      Names are strings registered with jTAC.define() or jTAC.defineAlias(),
      such as "Integer", "Float", "Date", "DateTime", "Currency",
      "Percent", "TimeOfDay", and "Duration". (Those are predefined.)

   connection (Connection object) -
      The Connection object that attaches to the element on the page
      that is the source of the number used in this calculation.
      If you don't set it, its value is determined by the [elementId] property.

   elementId (string) -
      Updates the connection with a new Connection class using this Id
      to identify its element.
      Uses jTAC.connectionResolver to replace the existing
      connection class if the id needs it.

   valueWhenInvalid (CalcItem object) -
      If the connection's value is invalid (cannot be resolved to a number),
      this CalcItem is evaluated.
      Typically you assign a constant of 0 using CalcItems.Number({value:0})
      or NaN using CalcItems.NaN().
      However, its valid to use any CalcItem.
      If you use CalcItems.NaN, it also stops the calculation.
      It defaults to CalcItems.NaN().
      This is a shortcut to using CalcItems.WhenInvalid() around the CalcItems.Element.

   valueWhenNull (CalcItem object) -
      If the Connection determines its value is null (empty textbox for example),
      it evaluates this CalcItem.
      Typically you assign a constant of 0 using CalcItems.Number({value:0})
      or null using CalcItems.Null().
      However, its valid to use any CalcItem.
      It defaults to CalcItems.Null({value:0}).
      This is a shortcut to using CalcItems.WhenNull() around the CalcItems.Element.

Parser rules:
1) The ID of an element alone, as a string: 
   "id". Example: "TextBox1".
   The string pattern must be legal for an HTML ID: letters, digits, underscore, period. No whitespace.
   NOTE: DOM uses a case sensitive match for ids passed into document.getElementById().
2) A function named "Element" with parameters: 
   Element("id")
   - "id" is the same as in #1, a string in quotes.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
CalcItems.Base
CalcItems.Null
CalcItems.NaN
TypeManagers.Base
TypeManagers.BaseGlobalize
TypeManagers.BaseNumber
Either or both: TypeManagers.Integer, TypeManagers.Float
Connections.Base
Connections.BaseElement
Connections.FormElement

----------------------------------------------------------- */
jTAC._internal.temp._CalcItems_Element = {
   extend: "CalcItems.Base",
   require: ["CalcItems.Null", "CalcItems.NaN", "Connections.FormElement", "TypeManagers.BaseNumber"],

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      datatype: "",
      typeManager: null,
      connection: "Connections.FormElement",// jTAC.checkAsConnection will convert this to an instance
      elementId: null,
      valueWhenNull: "CalcItems.Null", // jTAC.checkAsCalcItem will convert this to an instance
      valueWhenInvalid: "CalcItems.NaN"
   },

   configrules: {
      typeManager: jTAC.checkAsTypeManagerOrNull,
      connection: jTAC.checkAsConnectionOrNull,
      valueWhenNull: jTAC.checkAsCalcItem,
      valueWhenInvalid: jTAC.checkAsCalcItem
   },

   /*
   Call to determine if the CalcItem can be evaluated.
   If it returns true, you can call evaluate().
   This returns false if no connection is defined or 
   it does not specify an actual element.
   */
   canEvaluate : function () {
      var conn = this.getConnection();
      if (!conn || !conn.getElement(true)) {
         return false;
      }
      return this.callParent();
   },

   /* 
   If the connection cannot supply a number, it returns NaN, null, or 0
   depending on the valueWhenInvalid and valueWhenNull properties.
   Otherwise, it returns the number of the connection.
   */
   evaluate : function () {
      try {
         this._pushContext();

         var conn = this.getConnection();
         if (conn) {
            if (conn.isNullValue()) {
               var vwn = this.getValueWhenNull();
               if (!vwn || !vwn.canEvaluate()) {
                  return null;
               }
               return vwn.evaluate();
            }
            var tm = this.getTypeManager();
            if (!tm) {
               tm = conn.getTypeManager();
               if (!tm)
                  tm = jTAC.create("TypeManagers.Float");
               this.setTypeManager(tm);
            }

            try {
               if (!conn.isValidValue(tm.storageTypeName()))
                  throw new Error();   // just to jump to the catch statement
               var val = tm.toValueFromConnection(conn);
               return tm.toNumber(val); // while Integer and Float TypeManagers just return their actual value, this helps when using a date or time
            }
            catch (e) { // conversion error. Illegal value
               var vwi = this.getValueWhenInvalid();
               if (!vwi || !vwi.canEvaluate()) {
                  return NaN;
               }
               return vwi.evaluate();
            }
         }
         else {
            return NaN;
         }
      }
      finally {
         this._popContext();
      }
   },

   /*
   Let's the caller retrieve the collection instances defined in 
   the CalcItem subclass into a new list.
      list (Array) - Add collection objects to this list.
   */
   collectConnections : function(list) {
      var conn = this.getConnection();
      if (conn) {
         list.push(conn);
      }
   },


   parse : function (text, parser) {
      try {
         this._pushContext();

         this._checkParser(parser);
         var r, id, tm, conn;

         r = parser.asId(text); // { id: id, rem: remaining text}
         if (r) {
            return { obj: jTAC.create("CalcItems.Element", {elementId: r.id}), rem: r.rem };
         }

      // Element("id")
         r = parser.asExact(text, "Element(", false, false, null);
         if (r)
         {
            text = r.rem; 
         // look at the first parameter: ID
            r = parser.asId(text, true); // { id: id, rem: remaining text}
            text = r.rem;
            var id = r.id;

            r = parser.cParen(text, true);
            text = r.rem;

            return { obj: jTAC.create("CalcItems.Element", {elementId: id}), rem: text };
         }
         return null;
      }
      finally {
         this._popContext();
      }
   },

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

   /* datatype property: GET function
   Gets the datatype assigned to the TypeManager object.
   */
   getDatatype : function () {
      return this.config.typeManager ? this.config.typeManager.dataTypeName() : null;
   },

   setDatatype : function (datatype) {
   // The setTypeManager property does all of the work, converting the string to a TypeManager object
   // and throwing exceptions when the type is unknown.
   // This technique effectively makes setDatatype an alias for setTypeManager,
   // allowing the user to specify either a string or typemanager object.
      this.setTypeManager(datatype);
   },

   /* elementId property: GET function
   Returns the HTML Element ID within the Connection object
   or null if not available.
   */
   getElementId : function () {
      var conn = this.config.connection;
      return conn && conn.getId ? conn.getId() : null;
   },

   /* elementId property: SET function
   Updates the connection with a new Connection class using this Id
   to identify its element.
   Uses jTAC.connectionResolver to replace the existing
   connection class if the id needs it.
   Alternatively, this accepts a Connection object, which it
   redirects to the setConnection method.
   */
   setElementId : function (id) {
      if (typeof id == "object") {
         this.setConnnection(id);
      }
      else {
         var def = jTAC.create("Connections.FormElement", {id: id, allowNone: true} );   // allowNone=true
         var conn = jTAC.connectionResolver.create(id, def);   // may create a replacement connection
         this.config.connection = conn ? conn : def;
      }
   }

}
jTAC.define("CalcItems.Element", jTAC._internal.temp._CalcItems_Element);
if (jTAC.parser)
   jTAC.parser.register("CalcItems.Element");

