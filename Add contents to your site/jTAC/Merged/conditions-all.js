// jTAC/Conditions/Base.js
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
Module: Condition objects
Class : Conditions.Base       ABSTRACT CLASS
Extends: None

Purpose:
Condition classes evaluate something about your page and return "success", "failed", 
or "cannot evaluate". They are the underlying tool used by input validators, but lack
a lot of extras used by validation because Conditions appear in many situations other than validation.

Effectively Condition objects let you create IF THEN logic in your javascript
evaluating information about the page, without you having to worry about
details like getting the value from an input element, converting it into a date or number,
or applying a regular expression to it.

A Condition object does not contain any UI, unlike validators.
A validator needs an error message to show in the UI and a mechanism
to display it (such as showing an alert or inserting it in a <span> tag).

A library of Condition objects supports many common real-world cases.
You can also create Condition objects for your special cases.
Once created, they can be plugged into validation or used in other situations that need
IF THEN logic.

Essential Methods:
   canEvaluate() - Returns true if the Condition is enabled and ready to evaluate data.
   evaluate() - Evaluates and returns one of these results: 1 = success, 0 = failed, -1 = cannot evaluate.
      Internally it calls upon another method, _evaluateRule, which the subclass
      implements to handle the condition's rule.
   isValid() - A variation of the evaluate() function that returns a boolean.
      When true, the condition evaluates as success or cannot evaluate.
      When false, it evaluates as failed.

Essential properties:
   enabled (boolean) - When false, evaluate should not be called. canEvaluate() uses it. Defaults to true.
   typeManager (TypeManager object) - Used when the condition needs 
      to convert a string to another type, like number or date. Assign
      the TypeManager subclass that handles the conversion.
   datatype (string) - When using the typeManager, this is the name associated with the typemanager.
      When not using the typeManager, this is null. Setting it will always update the typeManager property.
   not (boolean) - When true, apply a NOT operator to the result of evaluation,
      so "success" = 0 and "failed" = 1. ("Cannot evaluate" stays -1). 
   trim (boolean) - When true (the default), string values are trimmed before evaluating.
   lastEvaluateResult (int) - Indicates the value from the last time the Evaluate() method was run.
      If it has not been run, it is null.
   name (string) - Gets a string that gives the class a unique name.
   autoDisable (boolean) - Determines if a connection that is attached to a non-editable widget
      causes this condition to disable itself by returning false in
      its canEvaluate() method.
      When true, connections are checked. If any return false in their isEditable()
      method, canEvalaute() will return false.
      When false, connections are not checked.
      It defaults to true.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED

USUALLY LOAD \jTAC\TypeManagers\Base.js and other TypeManager classes

----------------------------------------------------------- */
if (!window.jTAC)
   throw new Error("window.jTAC not created.");


jTAC._internal.temp._Conditions_Base = {
   "abstract": true,

   constructor: function ( propertyVals ) {

      this._createConnections(this.config.connections);

   },

   config: {
      enabled: true,
      lastEvaluateResult: null,
      trim: true,
      connections: new Array(),
      not: false,
      typeManager: null,
      datatype: null,
      autoDisable: true
   },

   configrules: {
      typeManager: jTAC.checkAsTypeManager,
      lastEvaluateResult: jTAC.checkAsIntOrNull,
      connections: {autoSet: false}
   },

   /*
   Call to determine if the Condition can be evaluated.
   If it returns true, you can call evaluate().
   */
   canEvaluate : function () {  // IF MODIFIED, see also the /jquery-validate/Extensions file which replaces this function. UPDATE IT TOO.
      if (!this.getEnabled())
         return false;
      if (this.getAutoDisable() && !this._connsEditable())
         return false;
   
      return true;
   },

   /*
   Evaluates and returns one of these results: 1 = success, 0 = failed, -1 = cannot evaluate.
   Internally it calls upon another method, _evaluateRule, which the subclass
   implements to handle the condition's rule.
   */
   evaluate : function () {
      try
      {
         this._pushContext();

         switch (this._evaluateRule()) {
            case 1:
               return this.config.lastEvaluateResult = this.getNot() ? 0 : 1;
            case 0:
               return this.config.lastEvaluateResult = this.getNot() ? 1 : 0;
            default: // -1
               this.config.lastEvaluateResult = -1; 
               return -1;
         }  // switch
      }
      finally {
         this._popContext();
      }
   },

   /*
   A variation of the evaluate() function that returns a boolean.
   When true, the condition evaluates as success or cannot evaluate.
   When false, it evaluates as failed.
   */
   isValid : function () {
      return this.evaluate() != 0;
   },

   /* ABSTRACT METHOD
   Subclasses must implement to evaluate according to the rule
   the Condition implements. Return an integer with one of these values:
    1 = success, 0 = failed, -1 = cannot evaluate.
   This should not use the not or lastEvaluateResult properties.
   They are applied by the caller (evaluate()).
   */
   _evaluateRule : function () {
      this.AM();
   },

   /*
   Subclass to add a Connection object to the array passed in. 
   The Connection objects are defaults. The user can modify or replace them.
   Called by the constructor.
      connections - An array to host subclasses of Connections.Base.
   */
   _createConnections : function (connections) {
   },


   /*
   Used by canEvaluate() when [autoDisable] = true to evaluate each connection
   to ensure that they are all enabled.
   Returns true if editable and false if not.
   */
   _connsEditable : function () {
      var conns = this.getConnections();
      if (conns) {
         for (var i = 0; i < conns.length; i++) {
            if (!conns[i].isEditable()) {
               return false;
            }
         }  // for
      }
      return true;
   },

   /*
   Lets the caller retrieve the collection instances into a new list.
   In addition to getting those with getConnections(), subclasses
   can retrieve others which may be elsewhere, such as in a child
   Condition object.
      list (Array) - Add collection objects to this list.
   */
   collectConnections : function(list) {
      var conns = this.getConnections();
      if (conns) {
         for (var i = 0; i < conns.length; i++) {
            var conn = conns[i];
            list.push(conn);
            if (conn.collectConnections)  // connections can optionally have associated connections.
               conn.collectConnections(list);
         }  // for
      }

   },

   /*
   Supports the trim property which is actually used by the Connection object's
   [trim] property. Distributes the parameter value to those properties.
   */
   _applyTrimToConns : function (trim) {
      var conns = this.config.connections;
      for (var i = 0; i < conns.length; i++) {
         var conn = conns[i];
         if (conn.trim !== undefined)
            conn.trim = trim;
      }
   },
   /* 
   Called by the getTypeManager() method of subclasses that require
   a TypeManager. If the [typeManager] property is unassigned,
   it first looks at the first Connection's getTypeManager() method.
   If not found there, it uses TypeManagers.Integer.

   NOTE: A single TypeManager instance is usually shared amongst all
   connections to the same element.
   */
   _checkTypeManager : function () {
      if (!this.config.typeManager) {
         jTAC.require("TypeManagers.Base");
         var conns = this.config.connections;
         if (conns && conns.length) {
            var conn = conns[0];
            var tm = conn.getTypeManager();  // may have a typemanager
            if (tm) {
               this.config.typeManager = tm;
               return tm;
            }
         }
         this.config.typeManager = jTAC.create("TypeManagers.Integer");
      }
      return this.config.typeManager;
   },


   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/


   /* trim property: SET function
   Sets the trim attribute value of an HTML element.
   */
   setTrim : function (trim) {
      this.config.trim = jTAC.checkAsBool(trim);
      this._applyTrimToConns(trim);
   },

   /* typeManager property: SET function
   Sets the TypeManager object. It must be a subclass of TypeManagers.Base.
   Used when the condition needs to convert a string to another type, 
   like number or date. 
   Also supports strings representing a name defined with jTAC.define() and jTAC.defineAlias() 
   such as "Integer", "Float", "Date", "DateTime", "Currency",
   "Percent", "TimeOfDay", and "Duration". (Those are predefined.)
   */
   setTypeManager : function (typeManager) {
      jTAC.require("TypeManagers.Base");
      this.config.typeManager = typeManager ? jTAC.checkAsTypeManager( typeManager, this.config.typeManager ) : null;

   },

   /* datatype property: GET function
   */
   getDatatype : function () {
      return this.config.typeManager ? this.config.typeManager.storageTypeName() : null;
   },

   /* datatype property: SET function
   */
   setDatatype : function (datatype) {
   // The setTypeManager property does all of the work, converting the string to a TypeManager object
   // and throwing exceptions when the type is unknown.
   // This technique effectively makes setDatatype an alias for setTypeManager,
   // allowing the user to specify either a string or typemanager object.
      this.setTypeManager(datatype);
   }

}
jTAC.define("Conditions.Base", jTAC._internal.temp._Conditions_Base);

/* --- jTAC EXTENSIONS ----------------------------------- */
/* STATIC METHOD - EXTENDS jTAC
   Creates or updates a Conditions object.
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
jTAC.checkAsCondition = function ( val, existingObject ) {
   return jTAC.checkAsClass( val, existingObject, jTAC.Conditions.Base );
}
/*
jTAC.checkAsCondition = function ( val ) {
   try
   {
      jTAC._internal.pushContext();

      if ((typeof (val) == "object") && val.jtacClass) { // treat it as a JSon object and convert
         val = jTAC.create(null, val, true);
      }
      if (val instanceof jTAC.Conditions.Base) {
         return val;
      }

      jTAC.error("Requires a Condition object.", this);
   }
   finally {
      jTAC._internal.popContext();
   }

}
*/
jTAC.checkAsConditionOrNull = function ( val ) {
   if (!val) // includes null and ""
      return null;
   return jTAC.checkAsCondition(val);
}


/*
Creates a Condition object and evaluates it through its evaluate() method.
It returns 1 = success; 0 = failed; and -1 = cannot evaluate.

Use this function when you want an instant evaluation without having
to keep a Condition around.

The json parameter describes properties to set on the object, and also 
identifies the class of the initial object. 
While the json parameter works well with a real JavaScript Object Notable object,
you can pass in an ordinary object. That allows you to pass code in as parameters.
For example, you can pass a javascript Date object to the [minimum] and [maximum] 
properties of the Conditions.Range instead of passing a string that gets
converted into a date.

The class of the Condition object is defined by the jtacClass property in the JSon object, 
such as:
{ "jtacClass" : "Conditions.CompareToValue", "elementId" : "TextBox1", "valueToCompare" : 10, "operator" : "<" }
This case creates a Conditions.CompareToValue that compares two integer values.
If you want to compare another type, specify the typeManager property with 
its value being a JSon object with its own jtacClass property defining the appropriate
TypeManager class. For example:
{ "jtacClass" : "Conditions.CompareToValue", "elementId" : "DateTextBox1", "valueToCompare" : "2000-01-01", "operator" : "<",
   "typeManager" : { "jtacClass" : "TypeManagers.Date" } 
}
You can also use non-Json syntax to create the typeManager object in code.
{ "jtacClass" : "Conditions.CompareToValue", "elementId" : "DateTextBox1", "valueToCompare" : "2000-01-01", "operator" : "<",
   "typeManager" : jTAC.create("TypeManagers.Date") } 
}

See \jTAC\TypeManagers\Base.js for more on TypeManagers.

Always ensure that any Connection properties are correctly setup.
Connections point to the form elements or other widgets, usually by setting their [id]
property. Typically you just set the [elementId] and [elementId2] properties on the Condition
and they setup the Connection for you, such as shown above.

You can replace the default Connection object by defining its property in json
and using json for the value. That json must indicate the jsclsas property
to specify the name of the Connection class.
In this example, the Conditions.CompareToValue is comparing dates, and has replaced
the default Connection (which uses elementId : "DateTextBox1") with 
a Connections.Value.
{ "class" : "Conditions.CompareToValue", 
   "connection" : { "jtacClass" : "Connections.Value", "value" : "05/31/1965" },
   "valueToCompare" : "01/01/2000", "operator" : "<",
   "typeManager" : { "jtacClass" : "TypeManagers.Date" } 
}

See \jTAC\Connections\Base.js for more on Connections.

*/
jTAC.evaluate = function (json)
{
   var cond = jTAC.create(null, json);  // will determine the name from json.jtacClass. May throw an exception
   return cond.evaluate();
}

/*
A variation of the jTAC.evaluate() function that returns a boolean.
When true, the condition evaluates as success or cannot evaluate.
When false, it evaluates as failed.
See jTAC.evaluate for details on the json parameter.
*/
jTAC.isValid = function (json)
{
   var cond = jTAC.create(null, json);  // will determine the name from json.jtacClass. May throw an exception
   return cond.isValid();
}
﻿// jTAC/Conditions/BaseOneConnection.js
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
Module: Condition objects
Class : Conditions.BaseOneConnection     ABSTRACT CLASS
Extends: Conditions.Base

Purpose:
Abstract base class that supports one Connection to an element
on the page.

See \jTAC\Conditions\Base.js for an overview of Conditions.

Properties introduced by this class:
   connection (Connection object) - The Connection object
      used to get a value. It defaults to a Connections.FormElement.

   elementId (string) - exposes the [id] property within the Connection
      because it is often get and set.
      Use only when the Connection inherits from Connections.BaseElement.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Conditions.Base
Connections.Base
Connections.BaseElement
Connections.FormElement
USUALLY LOAD \jTAC\TypeManagers\Base.js and other TypeManager classes

----------------------------------------------------------- */
jTAC._internal.temp._Conditions_BaseOneConnection = {
   extend: "Conditions.Base",
   "abstract": true,

   require: ["Connections.FormElement"],


   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      connection: null,
      elementId: null
   },

   /*
   Adds a Connections.FormElement object to the array passed in. 
   */
   _createConnections : function (connections) {
      connections[0] = jTAC.create("Connections.FormElement");
   },


   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

   /* connection property: GET function
   Returns the Connection object.
   */
   getConnection : function ()
   {
      return this.config.connections[0];
   },

   /* connection property: SET function
   Replaces the Connection object. User can also pass a string
   that is a name defined by jTAC.define() or jTAC.defineAlias() and that object
   will be created.
   User can also pass a JSon object with the jtacClass property assigned to the class name of the Connection.
   */
   setConnection : function (conn)
   {
         this.config.connections[0] = jTAC.checkAsConnection(conn, this.config.connections[0]);
   },

   /* elementId property: GET function
   Returns the [id] from current the Connection object
   or null if not available.
   */
   getElementId : function () {
      var conn = this.config.connections[0];
      return conn && conn.getId ? conn.getId() : null;
   },

   /* elementId property: SET function
   Replaces the Connection object in [connection] with this value 
   as the [id] property.
   Uses jTAC.connectionResolver to replace the existing
   Connection object if the id needs it.
   */
   setElementId : function (id) {
      var conns = this.config.connections;
      var conn = jTAC.connectionResolver.create(id, conns[0]);   // may create a replacement connection
      if (conn) {
         conns[0] = conn;
      }
      else {
         conns[0].id = id;
      }
      
   }

}
jTAC.define("Conditions.BaseOneConnection", jTAC._internal.temp._Conditions_BaseOneConnection);

﻿// jTAC/Conditions/BaseTwoConnections.js
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
Module: Condition objects
Class : Conditions.BaseTwoConnections     ABSTRACT CLASS
Extends: Conditions.BaseOneConnection

Purpose:
Abstract base class that supports two Connection objects to elements on the page.

See \jTAC\Conditions\Base.js for an overview of Conditions.

Properties introduced by this class:
   connection2 (Connection object) - The Connection object used to get the 
      second value. It defaults to a Connection.FormElement.
   elementId2 (string) - Exposes the [id] property within the second Connection
      because it is often get and set.
      Use only when the second Connection inherits from Connections.BaseElement.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Conditions.Base
Conditions.BaseOneConnection
Connections.Base
Connections.BaseElement
Connections.FormElement
USUALLY LOAD \jTAC\TypeManagers\Base.js and other TypeManager classes

----------------------------------------------------------- */
jTAC._internal.temp._Conditions_BaseTwoConnections = {
   extend: "Conditions.BaseOneConnection",
   "abstract": true,

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      connection2: null,
      elementId2: null
   },


   /*
   Adds a Connections.FormElement object to the array passed in. 
   */
   _createConnections : function (connections)
   {
      this.callParent([connections]);

      connections[1] = jTAC.create("Connections.FormElement");
   },


   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/
   /* connection2 property: GET function
   Returns the Connection object.
   */
   getConnection2 : function ()
   {
      return this.config.connections[1];
   },

   /* connection2 property: SET function
   Replaces the Connection object. User can also pass a string
   that is a name defined by jTAC.define() or jTAC.defineAlias() and that object
   will be created.
   User can also pass a JSon object with the jtacClass property assigned to the class name of the Connection.
   */
   setConnection2 : function (conn)
   {
      this.config.connections[1] = jTAC.checkAsConnection(conn, this.config.connections[1]);
   },

   /* elementId2 property: GET function
   Returns the [id] from current the Connection object
   or null if not available.
   */
   getElementId2 : function () {
      var conn = this.config.connections[1];
      return conn && conn.getId ? conn.getId() : null;
   },

   /* elementId2 property: SET function
   Replaces the Connection object in [connection2] with this value 
   as the [id] property.
   Uses jTAC.connectionResolver to replace the existing
   Connection object if the id needs it.
   */
   setElementId2 : function (id) {
      var conns = this.config.connections;
      var conn = jTAC.connectionResolver.create(id, conns[1]);   // may create a replacement connection
      if (conn) {
         conns[1] = conn;
      }
      else {
         conns[1].id = id;
      }
      
   }
}
jTAC.define("Conditions.BaseTwoConnections", jTAC._internal.temp._Conditions_BaseTwoConnections);

﻿// jTAC/Conditions/BaseOneOrMoreConnections.js
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
Module: Condition objects
Class : Conditions.BaseOneOrMoreConnections     ABSTRACT CLASS
Extends: Conditions.BaseOneConnection

Purpose:
Abstract base class that supports one or more Connections to elements
on the page. If you only have one Connection, it can use the [elementId]
or [connection] property. For any more, add an array of connections to the
[moreConnections] property.

See \jTAC\Conditions\Base.js for an overview of Conditions.

Properties introduced by this class:
   moreConnections (array) - 
      Use when there are more than one Connection. The first connection always
      goes in the 'connection' property. The rest in moreConnections.
      Create the Connection.BaseElement subclass that works with the widget
      and use the push() method on the array to add it to the end of the array.

   ignoreNotEditable (boolean) -
      When there are two or more connections used, this determines
      if elements that are not editable are counted.
      For example, when Mode = All and there is one non-editable connection,
      "All" means one less than the total connections.
      When true, not editable connections are not counted.
      When false, they are.
      It defaults to false.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Conditions.Base
Conditions.BaseOneConnection
Connections.Base
Connections.BaseElement
Connections.FormElement

----------------------------------------------------------- */
jTAC._internal.temp._Conditions_BaseOneOrMoreConnections = {
   extend: "Conditions.BaseOneConnection",
   "abstract": true,

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

      this._internal.allMustBeEditable = true;  // managed by subclasses, not as a user editable property
   },

   config: {
      moreConnections: [],
      ignoreNotEditable: true
   },

   /*
   Used by canEvaluate when [autoDisable] = true to evaluate each connection
   to ensure that they are all enabled.
   Returns true if editable and false if not.
   Use the field [_internal.allMustBeEditable] to determine if all or just one connection must be
   editable to return true. [_internal.allMustBeEditable] defaults to true.
   */
   _connsEditable : function () {
      if (this._internal.allMustBeEditable) {
         return this.callParent();
      }

      var conns = this.getConnections();
      if (conns) {
         for (var i = 0; i < conns.length; i++) {
            if (conns[i].isEditable()) {
               return true;
            }
         }  // for
      }
      return false;
   },

   /*
   Returns an array holding the available connections.
   It merges the value in connection with [moreConnections].
   It also updates [moreConnections] where it hosts a string, replacing
   the string with a DOM element.
   The array is a new instance.
   */
   getConnections : function () {
      var conns = [];
      if (this.config.connections)
         conns = this.config.connections.concat(conns);
      var m = this.getMoreConnections();
      for (var i = 0; i < m.length; i++) {
         conns.push(m[i]);
      }
      return conns;
   },

   /*
   Returns an array of connections, combined from the [connection] and [moreConnections] properties.
   It eliminates those that are not editable when [ignoreNotEditable] is true.
   May return an empty array.
   */
   _cleanupConnections : function () {
      var nc = [];
      var conns = this.getConnections();
      if (conns) {
         for (var i = 0; i < conns.length; i++) {
            if (!this.getIgnoreNotEditable() || conns[i].isEditable()) {
               nc.push(conns[i]);
            }
         }  // for
      }
      return nc;
   },

   /*
   Looks through the [moreConnections] collection. If any are JSON objects, they are converted
   to Connection objects. If there are any strings, they represent and element ID
   and those are resolved. If any are illegal entries, an exception is thrown.
   */
   _resolveMoreConnections : function () {
      var conns = this.config.moreConnections;  // do not call getMoreConnections() since this is called within that call
      for (var i = 0; i < conns.length; i++) { 
         var conn = conns[i];
         if (typeof conn == "string") {
            var id = conn;
            var def = jTAC.create("Connections.FormElement", {id: id});
            conn = jTAC.connectionResolver.create(id, def);
            conns[i] = conn ? conn : def;
         }
         else if (!(conn instanceof jTAC.Connections.Base) && (typeof (conn) == "object")) { // see if its a json object.
            if (!conn.jtacClass)
               this._error("Must define the Connection's class in the 'jtacClass' property of the object that describes a Connection.");
            conn = jTAC.create(null, conn);
            conns[i] = conn;
         }
         else if (!(conn instanceof jTAC.Connections.Base))
            this._error("The moreConnections property must only contain Connection objects and JSon objects that generate Connection objects.");

      }  // for
   },


   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

   /* moreConnections property: GET function
   Use when there are more than one Connection object. The first Connection always
   goes in the [connection] property. The rest in [moreConnections].
   Create the Connections.Base subclass that works with the element
   and use the push() method on the array to add it to the end of the array.
   */
   getMoreConnections : function () {
      if (this.config.moreConnections)
         this._resolveMoreConnections();
      return this.config.moreConnections;
   }

}
jTAC.define("Conditions.BaseOneOrMoreConnections", jTAC._internal.temp._Conditions_BaseOneOrMoreConnections);

﻿// jTAC/Conditions/BaseOperator.js
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
Module: Condition objects
Class : Conditions.BaseOperator     ABSTRACT CLASS
Extends: Conditions.BaseTwoConnections

Purpose:
Abstract base class that compares two values based on the rule
in the [operator] property.

See \jTAC\Conditions\Base.js for an overview of Conditions.

Properties introduced by this class:
   operator (string) - Supports these values:
      "=", "<>", "<", ">", "<=", ">="

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Conditions.Base
Conditions.BaseOneConnection
Conditions.BaseTwoConnections
Connections.Base
Connections.BaseElement
Connections.FormElement
USUALLY LOAD \jTAC\TypeManagers\Base.js and other TypeManager classes

----------------------------------------------------------- */
jTAC._internal.temp._Conditions_BaseOperator = {
   extend: "Conditions.BaseTwoConnections",
   "abstract": true,

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      operator: "="
   },

   configrules: {
      operator:["=", "<>", ">", "<", ">=", "<="]
   },

   /*
   Utility to compare two values to be used by subclasses. 
   Both values can be native or string types.
   TypeManager.compare() is used for the evaluation and operator applied against the result.
   Returns true if the values match the operator's rule and false when they do not.
   */
   _compare : function(value1, value2) {
      var result = this.getTypeManager().compare(value1, value2);
      switch (this.getOperator()) {
         case "=":
            return result == 0;
         case "<>":
            return result != 0;
         case ">":
            return result == 1;
         case "<":
            return result == -1;
         case ">=":
            return result > -1;
         case "<=":
            return result < 1;
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
jTAC.define("Conditions.BaseOperator", jTAC._internal.temp._Conditions_BaseOperator);

﻿// jTAC/Conditions/BaseCounter.js
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
Module: Condition objects
Class : Conditions.BaseCounter      ABSTRACT CLASS
Extends: Conditions.BaseOneOrMoreConnections

Purpose:
One or more Connections are evaluated to total something about the value
of each, such as number of characters, words, or selected items. That total is compared
to a range defined by minimum and maximum.

Subclass overriding the _connCount() function. It should evaluate the connection passed in
to return a number that is added to the total by the caller.

Set up:
   For the first Connection, set the widget's id in the [elementId] property or modify
   the Connection object in its [connection] property.
   For additional connections, create Connection objects like Connection.FormElement.
   Add them to [moreConnections] property, which is an array
   by using the array's push() method.


See \jTAC\Conditions\Base.js for an overview of Conditions.

Properties introduced by this class:
   minimum (integer)  -
      Determines the minimum of the count to report "success".
      If null, it is not used. Otherwise it must be a positive integer.
   
   maximum (integer)
      Determines the maximum of the count to report "success".
      If null, it is not used. Otherwise it must be a positive integer.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Conditions.Base
Conditions.BaseOneConnection
Conditions.BaseOneOrMoreConnections
Connections.Base
Connections.BaseElement
Connections.FormElement

----------------------------------------------------------- */
jTAC._internal.temp._Conditions_BaseCounter = {
   extend: "Conditions.BaseOneOrMoreConnections",
   "abstract": true,

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      minimum: null,
      maximum: null
   },

   configrules: {
      minimum: jTAC.checkAsIntOrNull,
      maximum: jTAC.checkAsIntOrNull
   },

   /*
   Call to determine if the Condition can be evaluated.
   If it returns true, you can call evaluate().
   Returns false when both [minimum] and [maximum] have not been assigned (are both null).
   */
   canEvaluate : function () {
      if ((this.getMinimum() == null) && (this.getMaximum() == null)) {
         return false;
      }
   
      return this.callParent();
   },


   /*
   Counts each connection using the overridden _connCount() function.
   If the total is between the range (minimum/maximum), returns 1. Otherwise returns 0.
   Returns -1 (cannot evaluate) if none of the connections are editable (when ignoreNotEditable = true).
   */
   _evaluateRule : function () {
      var conns = this._cleanupConnections();   // list will omit non-editable connections if ignoreNotEditable=true
      var ttl = conns.length;   // total connections
      if (!ttl) {
         return -1;  // cannot evaluate
      }

      var cnt = 0;
      for (var i = 0; i < conns.length; i++) {
         cnt += this._connCount(conns[i]);
      }

      this.count = cnt;
      var min = this.getMinimum();
      var max = this.getMaximum();
      if ((min != null) && (cnt < min)) {
         return 0;
      }
      if ((max != null) && (cnt > max)) {
         return 0;
      }
      return 1;
   },

   /* ABSTRACT METHOD
   Returns an integer representing the count determined for the connection passed in.
   Must return at least a value of 0.
      conn (Connection object)
   */
   _connCount : function (conn) {
      this._AM();
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("Conditions.BaseCounter", jTAC._internal.temp._Conditions_BaseCounter);

﻿// jTAC/Conditions/Required.js
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
Module: Condition objects
Class : Conditions.Required
Extends: Conditions.BaseOneOrMoreConnections

Purpose:
One or more elements are evaluated to see if its value is not unassigned, empty, or null. 
You can evaluate the value of it to any widget: textbox, list, checkbox, radio, calendar widget, etc.

Evaluation rules:
   Uses the Connection class’ isNullValue() method to determine if the element has data or not.
   With just one Connection, it returns “success” when the element’s value 
   has been assigned and “failed” and it is unassigned.
   With more than one Connection, it uses the [mode] property to count the number of elements 
   that have their values assigned. It returns “success” if the number of elements matches 
   the mode property rule and “failed” when it does not.

Set up:
   For the first element, set the widget's id in the [elementId] property.

   For additional elements, add their ids to the [moreConnections] property, 
   which is an array. Use either its push() method or assign an array of ids. 
   Then assign the [mode] property to determine how to evaluate multiple elements. 
   mode has these values: “All”, “OneOrMore”, “AllOrNone”, “One”, and “Range”. 
   If using “Range”, also set the [minimum] and [maximum] properties.

   When working with textual or list widgets, a value of the empty string is 
   normally considered unassigned. However, when a textbox has a watermark or 
   a list has its first item as "No Selection", specify the text of the watermark or 
   value of the first item in the Connection's [unassigned] property.
   For example, a list has an option with the label "No selection" and value of "NONE".
      var cond = jTAC.create("Required", {elementId: "ListBox1"});
      cond.connection.unassigned = "NONE";

See \jTAC\Conditions\Base.js for an overview of Conditions.

Properties introduced by this class:
   mode (string) -
      When there are multiple connections, this is used to determine how many
      must be not null to report "success". Here are the mode values:
         "All" - All must have text
         "OneOrMore" - At least one must have text. This is the default.
         "AllOrNone" - All or none must have text
         "One" - Only one must have text
         "Range" - Specify the minimum and maximum number of widgets in this Condition's
            [minimum] and [maximum] properties.

   minimum (integer) and maximum (integer) -
      When [mode] = "Range", use these to determine the number of connections
      with values that are not null to report "success".


Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Conditions.Base
Conditions.BaseOneConnection
Conditions.BaseOneOrMoreConnections
Connections.Base
Connections.BaseElement
Connections.FormElement

----------------------------------------------------------- */
jTAC._internal.temp._Conditions_Required = {
   extend: "Conditions.BaseOneOrMoreConnections",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

      this._internal.allMustBeEditable = false;
   },

   config: {
      mode: "OneOrMore",
      minimum: 0,
      maximum: 999
   },

   configrules: {
      mode: ["All", "OneOrMore", "AllOrNone", "One", "Range"]
   },

   /*
   If there is one connection, success when not null and failed otherwise.
   With multiple connections, depends on the mode property.
   Sets a field called count with the number of non-null connections.
   Cannot evaluate if none of the connections are editable (when ignoreNotEditable = true).
   */
   _evaluateRule : function () {
      var m = this.getMoreConnections();
      if (m.length == 0) {   // no mode property
         var conn = this.getConnection();
         if (!conn.isEditable()) { // ignoreNotEditable does not apply.
            return -1;  // cannot evaluate
         }
         // isNullValue uses a true parameter to make unchecked checkboxes and radiobuttons act as null
         return this.count = (conn.isNullValue(true) ? 0 : 1);   // assigns to this.count then returns it. Should be =, not ==.
      }
      var conns = this._cleanupConnections();   // list will omit non-editable connections if ignoreNotEditable=true
      var ttl = conns.length;   // total connections
      if (!ttl) {
         return -1;  // cannot evaluate
      }
      var cnt = 0;
      for (var i = 0; i < conns.length; i++) {
         if (!conns[i].isNullValue(true)) {
            cnt++;
         }
      }

      this.count = cnt;
      switch (this.getMode()) {
         case "All":
            return cnt == ttl ? 1 : 0;
         case "OneOrMore":
            return (cnt > 0) ? 1 : 0;
         case "AllOrNone":
            return ((cnt == 0) || (cnt == ttl)) ? 1 : 0;
         case "One":
            return (cnt == 1) ? 1 : 0;
         case "Range":
            return ((this.getMinimum() <= cnt) && (cnt <= this.getMaximum())) ? 1 : 0;
         default:
            this._error("Unknown mode name.");
      }  // switch
   }


   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("Conditions.Required", jTAC._internal.temp._Conditions_Required);
jTAC.defineAlias("Required", "Conditions.Required");

﻿// jTAC/Conditions/DataTypeCheck.js
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
Module: Condition objects
Class : Conditions.DataTypeCheck
Extends: Conditions.BaseOneConnection

Purpose:
Ensures the text can be converted to the native type as defined by a TypeManager.

Evaluation rules:
   Returns “success” when the text can be converted.
   Returns “failed” when the text cannot be converted.
   Returns “cannot evaluate” when the text is the empty string or represents null.

Set up:
   Assign the [elementId] property to the element whose text 
   value will be evaluated.

   The TypeManager is normally identified by adding either [data-jtac-datatype] or [data-jtac-typemanager] 
   attributes to the element. If that is not done, you can use the [datatype] or [typeManager] property 
   to define the TypeManager.

See \jTAC\Conditions\Base.js for an overview of Conditions.

Properties introduced by this class:
None

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Conditions.Base
Connections.Base
Connections.BaseElement
Connections.FormElement
ALWAYS LOAD \jTAC\TypeManagers\Base.js and any TypeManager classes you need

----------------------------------------------------------- */
jTAC._internal.temp._Conditions_DataTypeCheck = {
   extend: "Conditions.BaseOneConnection",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   /* 
   Returns:
      1 - Text converted to value.
      0 - Text could not convert.
      -1 - Text was an empty string or represents null. Cannot evaluate.
   */
   _evaluateRule : function () {
      var conn = this.getConnection();
      if (conn.isNullValue()) {
         return -1;
      }
      try {
         var result = this.getTypeManager().toValueFromConnection(conn);

         return result != null ? 1 : -1;
      }
      catch (e) {
         return 0;   // could not convert. Illegal value.
      }
   },

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/
   getTypeManager : function () {
      return this._checkTypeManager();
   }


}
jTAC.define("Conditions.DataTypeCheck", jTAC._internal.temp._Conditions_DataTypeCheck);
jTAC.defineAlias("DataTypeCheck", "Conditions.DataTypeCheck");

﻿// jTAC/Conditions/Range.js
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
Module: Condition objects
Class : Conditions.Range
Extends: Conditions.BaseOneConnection

Purpose:
Compares the value from an element on the page
to a range established by the properties.

Evaluation rules:
   Returns “success” when the value is within the range.
   Returns “failed” when the value is outside the range.
   Returns “cannot evaluate” when the element’s value cannot be converted into the native type.

Set up:
   Assign the element’s id to the [elementId] property. 

   Assign the range with the [minimum] and [maximum] properties. 
   This property can take native types, like a number or Date object. 
   It also can take strings that it converts to the native type, 
   so long as you use the culture neutral format for that data type.

   The TypeManager is normally identified by adding either [data-jtac-datatype] or 
   [data-jtac-typemanager] attributes to the element. If that is not done, 
   you can use the [datatype] or [typeManager] property to define the TypeManager.

   The TypeManager also has [minValue] and [maxValue] properties when you include 
   the jquery-ui widgets\Command extensions.js file or Merged\TypeManagers\datatypeeditor.js file.
    
   The Conditions.Range object will use those properties if its own minimum and maximum are null.

See \jTAC\Conditions\Base.js for an overview of Conditions.

Properties introduced by this class:
   minimum - The minimum value. If null, not evaluated.
      A string or any value that is compatible with the TypeManager.
      If it is a string, its format must be culture neutral.
      Integers: [-]digits
      Float, Currency, Percent: [-]digits.digits  (always has at least one decimal place)
      Date: yyyy-MM-dd
      TimeOfDay and Duration: H:mm:ss
      DateTime: yyyy-MM-dd H:mm:ss
      DayMonth: MM-dd
      MonthYear: yyyy-MM

   maximum - The maximum value. If null, not evaluated.
      A string or any value that is compatible with the TypeManager.
      If it is a string, its format must be culture neutral.

   lessThanMax (boolean) - When true, evaluate less than the maximum.
      When false, evaluate less than or equals the maximum.
      Defaults to false.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Conditions.Base
Conditions.BaseOneConnection
Connections.Base
Connections.BaseElement
Connections.FormElement
TypeManagers.Base
Other TypeManager classes as needed

----------------------------------------------------------- */
jTAC._internal.temp._Conditions_Range = {
   extend: "Conditions.BaseOneConnection",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      minimum: null,
      maximum: null,
      lessThanMax: false
   },

   /*
   Requires at least one of minimum or maximum to be assigned.
   */
   canEvaluate : function () {
      return this.callParent() && 
         ((this.config.minimum != null) || (this.config.maximum != null));
   },

   /* 
   Returns:
      1 - The two values compared according to the operator.
      0 - The two values did not compare.
      -1 - At least one value was null/empty string. Cannot evaluate.
   */
   _evaluateRule : function () {
      var conn = this.getConnection();
      if (conn.isNullValue()) {
         return -1;
      }

      var tm = this.getTypeManager();
      var min, max;
      var p = "minimum";
      try {
      // The typemanager may have its own min/maxValue. Use it if the RangeCondition does not have it.
      // This allows the user to change typemanager's value and have it impact the RangeCondition.
         min = tm.toValueNeutral(this.getMinimum());
         if ((min == null) && tm.getMinValue) {
            min = tm.getMinValue;
         }
            
         p = "maximum"
         max = tm.toValueNeutral(this.getMaximum());
         if ((max == null) && tm.getMaxValue) {
            max = tm.getMaxValue;
         }
      }
      catch (e) {
         var msg = p + " property must be in the culture neutral format for " + tm.storageTypeName() + " on element id " + conn.getId() + ". " + e.message;
         this._error(msg);
      }

      try {
         var value = tm.toValueFromConnection(conn);
         if (value == null) {
            return -1;
         }
      }
      catch (e) {
         return -1;   // could not convert. Illegal value.
      }
      if (min != null) {
         if (tm.compare(value, min) < 0) {
//         if (value < min) {
            return 0;
         }
      }
      if (max != null) {
         if (this.getLessThanMax()) {
            if (tm.compare(value, max) >= 0) {
//            if (value >= max) {
               return 0;
            }
         }
         else
         {
            if (tm.compare(value, max) > 0) {
//            if (value > max) {
               return 0;
            }
         }
      }
      return 1;
   },


   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

   getTypeManager : function ()
   {
      return this._checkTypeManager();
   }
}
jTAC.define("Conditions.Range", jTAC._internal.temp._Conditions_Range);
jTAC.defineAlias("Range", "Conditions.Range");

﻿// jTAC/Conditions/CompareToValue.js
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
Module: Condition objects
Class : Conditions.CompareToValue
Extends: Conditions.BaseOperator

Purpose:
Compares the value from a form element or widget
to a fixed value declared in the [valueToCompare] property. 
Use the [operator] property to define the comparison.

Evaluation rules:
   Returns “success” when the values compare according to the operator.
   Returns “failed” when the values do not compare correctly.
   Returns “cannot evaluate” when the element’s value cannot be converted into the native type.

Set up:
   Assign the id of the element to the [elementId] property.

   Assign the value to compare to the [valueToCompare] property. This property can take native types, 
   like a number or Date object. It also can take strings that it converts to the native type, 
   so long as you use the culture neutral format for that data type.

   Use the [operator] property to define the comparison with one of these strings: 
   “=”, “<>”, “<”, “>”, “<=”, “>=”.

   The TypeManager is normally identified by adding either [data-jtac-datatype] or 
   [data-jtac-typemanager] attributes to the element. If that is not done, 
   you can use the [datatype] or [typeManager] property to define the TypeManager.


See \jTAC\Conditions\Base.js for an overview of Conditions.

Properties introduced by this class:
   valueToCompare - The value to compare on the right side of the 
      operator. (connection operator valueToCompare) 
      A string or any value that is compatible with the TypeManager.
      If it is a string, its format must be culture neutral.
      Integers: [-]digits
      Float, Currency, Percent: [-]digits.digits  (always has at least one decimal place)
      Date: yyyy-MM-dd
      TimeOfDay and Duration: H:mm:ss
      DateTime: yyyy-MM-dd H:mm:ss
      DayMonth: MM-dd
      MonthYear: yyyy-MM

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Conditions.Base
Conditions.BaseOneConnection
Conditions.BaseTwoConnections
Conditions.BaseOperator
Connections.Base
Connections.BaseElement
Connections.FormElement
TypeManagers.Base
other TypeManager classes as needed

----------------------------------------------------------- */
jTAC._internal.temp._Conditions_CompareToValue = {
   extend: "Conditions.BaseOperator",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      valueToCompare: null
   },

   /*
   The second connection is not used. Disable it by using allowNone=true.
   */
   _createConnections : function (connections) {
      this.callParent([connections]);

      connections[1].setAllowNone(true);
   },


   /*
   Requires valueToCompare to be assigned.
   */
   canEvaluate : function () {
      return this.callParent() && (this.config.valueToCompare != null);
   },

   /* 
   Returns:
      1 - The two values compared according to the operator.
      0 - The two values did not compare.
      -1 - At least one value was null/empty string. Cannot evaluate.
   */
   _evaluateRule : function () {
      var conn = this.getConnection();
      if (conn.isNullValue() || (this.getValueToCompare() == null)) {
         return -1;
      }

      var tm = this.getTypeManager();
      var value2 = null;
      try {
         value2 = tm.toValueNeutral(this.getValueToCompare());
      }
      catch (e) {
         var msg = "valueToCompare property must be in the culture neutral format for " + tm.storageTypeName() + " on element id " + conn.getId() + ". " + e.message;
         this._error(msg);
      }
      try {
         var value1 = tm.toValueFromConnection(conn);
         if ((value1 == null) || (value2 == null)) {
            return -1;
         }
         return this._compare(value1, value2) ? 1 : 0;
      }
      catch (e) {
         return -1;   // could not convert. Illegal value.
      }
   },

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/
   getTypeManager : function () {
      return this._checkTypeManager();
   }
}
jTAC.define("Conditions.CompareToValue", jTAC._internal.temp._Conditions_CompareToValue);

jTAC.defineAlias("CompareToValue", "Conditions.CompareToValue");
﻿// jTAC/Conditions/CompareTwoElements.js
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
Module: Condition objects
Class : Conditions.CompareTwoElements
Extends: Conditions.BaseOperator

Purpose:
Compares the values of two elements.
Provides the [operator] property to define the comparison.

Evaluation rules:
   Returns “success” when the values compare according to the operator.
   Returns “failed” when the values do not compare correctly.
   Returns “cannot evaluate” when either of the element’s values cannot be converted into the native type.

Set up:
   Assign one element’s id to the [elementId] property and the other to the [elementId2] property.

   Use the [operator] property to define the comparison with one of these strings: 
   “=”, “<>”, “<”, “>”, “<=”, “>=”.

   The TypeManager is normally identified by adding either [data-jtac-datatype] or [data-jtac-typemanager] 
   attributes to the element. If that is not done, you can use the [datatype] or [typeManager] property 
   to define the TypeManager.

See \jTAC\Conditions\Base.js for an overview of Conditions.

Properties introduced by this class:
None

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Conditions.Base
Conditions.BaseOneConnection
Conditions.BaseTwoConnections
Conditions.BaseOperator
Connections.Base
Connections.BaseElement
Connections.FormElement
TypeManagers.Base
other TypeManager classes as needed

----------------------------------------------------------- */
jTAC._internal.temp._Conditions_CompareTwoElements = {
   extend: "Conditions.BaseOperator",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   /* 
   Returns:
      1 - The two values compared according to the operator.
      0 - The two values did not compare.
      -1 - At least one value was null/empty string. Cannot evaluate.
   */
   _evaluateRule : function () {
      var conn = this.getConnection();
      var conn2 = this.getConnection2();
      if (conn.isNullValue() || conn2.isNullValue()) {
         return -1;
      }

      try {
         var tm = this.getTypeManager();
         var value1 = tm.toValueFromConnection(conn);
         var value2 = tm.toValueFromConnection(conn2);
         if ((value1 == null) || (value2 == null)) {
            return -1;
         }
         return this._compare(value1, value2) ? 1 : 0;
      }
      catch (e) {
         return -1;   // could not convert. Illegal value.
      }
   },


   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/
   getTypeManager : function () {
      return this._checkTypeManager();
   }

}
jTAC.define("Conditions.CompareTwoElements", jTAC._internal.temp._Conditions_CompareTwoElements);
jTAC.defineAlias("CompareTwoElements", "Conditions.CompareTwoElements");

﻿// jTAC/Conditions/BaseRegExp.js
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
Module: Condition objects
Class : Conditions.BaseRegExp
Extends: Conditions.BaseOneConnection

Purpose:
A base class for developing Conditions using a regular expression 
to evaluate the text in the connection property.
Subclasses must override _getExpression() to supply the expression. 
Optionally override _getCaseIns() and _getGlobal() to supply those regex flags.

This base class provides a framework for creating many expression generator
Conditions. This lets the user avoid trying to create the appropriate
expression for some common cases because those child Conditions
will let the user set rules (as properties) and the Condition's
_getExpression() method will generate the correct expression.
These child conditions make it easier to identify the business rule being
described. You don't have to analyze the regular expression, just 
look at the name of the condition class and its properties.

RECOMMENDATION: Create a TypeManager instead of a Condition when the regular
expression is always used to represent a specific data type.
TypeManagers are the preferred way to evaluate data types. The user
can then use the Condition.DataTypeCheck with it.
They can also use the TypeManager with the jquery-ui dataTypeEditor widget.
Result: Handles more cases and eliminates creating a validation rule for the new condition.

Evaluation rules:
When the text is matched by the regular expression, it evaluates as "success".
Otherwise it evaluates as "failed".
When the text is the empty string, evaluates as "cannot evaluate"
so long as [ignoreBlankText] is true.
If you want to reverse this logic, set the not property to true.

See \jTAC\Conditions\Base.js for an overview of Conditions.

Properties introduced by this class:
   ignoreBlankText (boolean) -
      Determines how blank text is evaluated. 
      When true, the condition cannot be evaluated.
      When false, the condition evaluates as failed (reports an error). 
      It defaults to true.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Conditions.Base
Conditions.BaseOneConnection
Connections.Base
Connections.BaseElement
Connections.FormElement
----------------------------------------------------------- */
jTAC._internal.temp._Conditions_BaseRegExp = {
   extend: "Conditions.BaseOneConnection",
   "abstract": true,

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      ignoreBlankText: true
   },

   /*
   Cannot evaluate when the expression is "".
   */
   canEvaluate : function () {
      if (!this.getExpression()) {
         return false;
      }
      return this.callParent();
   },

   /* 
   When the text is matched by the regular expression, it evaluates as "success".
   Otherwise it evaluates as "failed".
   When the text is the empty string, evaluates as "cannot evaluate"
   so long as IgnoreBlankText is true.
   If you want to reverse this logic, set the not property to true.
   */
   _evaluateRule : function () {
      var re = this._internal.regex;
      if (!re) {
         var exp = this._getExpression();
         if (!exp) {
            return -1;
         }
         var opts = "";
         if (this._getCaseIns()) {
            opts += "i";
         }
         if (this._getGlobal()) {
            opts += "g";
         }
         if (this._getMultiline()) {
            opts += "m";
         }
         re = this._internal.regex = new RegExp(exp, opts);
      }
      var s = this.connection.getTextValue();
      if (!s) {
         return this.getIgnoreBlankText() ? -1 : 0;
      }

      return re.test(s) ? 1 : 0;
   },

   /* ABSTRACT METHOD
   Returns the regular expression string that is passed to the first parameter
   of the RegExp object. It must be a legal expression or it will throw
   an exception.
   If it returns "", the Condition will return false from canEvaluate() and -1 from evaluate().
   */
   _getExpression : function () {
      this._AM();
   },

   /*
   Determines if the regular expression will use the case insensitive option.
   This class always returns false.
   */
   _getCaseIns : function () {
      return false;
   },

   /*
   Determines if the regular expression will use the global search option.
   This class always returns false.
   */
   _getGlobal : function () {
      return false;
   },

   /*
   Determines if the regular expression will use the multiline option.
   This class always returns false.
   */
   _getMultiline : function () {
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
jTAC.define("Conditions.BaseRegExp", jTAC._internal.temp._Conditions_BaseRegExp);

﻿// jTAC/Conditions/RegExp.js
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
Module: Condition objects
Class : Conditions.RegExp
Extends: Conditions.BaseRegExp

Purpose:
Use a regular expression to evaluate the text in the [connection] property.
This class allows the user to define the expression explicitly
in its [expression] property. There may be other Conditions that also 
generate the correct expression for a given business rule. Consider
using them as they better document the rule and are often an easier 
way to define the correct expression.

Evaluation rules:
   When the text is matched by the regular expression, it evaluates as "success".
   Otherwise it evaluates as "failed".
   When the text is the empty string, evaluates as "cannot evaluate"
   so long as [ignoreBlankText] is true.
   If you want to reverse this logic, set the not property to true.

Set up:
   Assign the element’s id to the [elementId] property. 

   Develop a regular expression and assign it to the [expression] property.

   Regular expressions have options which you can set with the 
   [caseIns], [global], and [multiline] properties.

See \jTAC\Conditions\Base.js for an overview of Conditions.

Properties introduced by this class:
   expression (string) -
      A valid regular expression pattern. 
      Hint: If you intend to evaluate the entire string, be sure to use the ^ and $ symbols.
      Regex Resources:
         Special characters: https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/RegExp#Special_characters_in_regular_expressions
         Find and test expressions: http://www.regexlib.com
   caseIns (boolean)
      When true, letters are matched case insensitively.
      Defaults to true.
   global (boolean)
      When true, use the global search option of regular expressions.
      Defaults to false.
   multiline (boolean)
      When true, use the multiline option of regular expressions.
      Defaults to false.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Conditions.Base
Conditions.BaseOneConnection
Conditions.BaseRegExp
Connections.Base
Connections.BaseElement
Connections.FormElement
----------------------------------------------------------- */
jTAC._internal.temp._Conditions_RegExp = {
   extend: "Conditions.BaseRegExp",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      expression: "",
      caseIns: true,
      global: false,
      multiline: false
   },

   /* 
   Returns the regular expression string that is passed to the first parameter
   of the RegExp object. It must be a legal expression or it will throw
   an exception.
   If it returns "", the Condition will return false from canEvaluate() and -1 from evaluate().
   */
   _getExpression : function ()
   {
      return this.getExpression();
   },

   /*
   Determines if the regular expression will use the case insensitive option.
   This class always returns false.
   */
   _getCaseIns : function ()
   {
      return this.getCaseIns();
   },

   /*
   Determines if the regular expression will use the global search option.
   This class always returns false.
   */
   _getGlobal : function ()
   {
      return this.getGlobal();
   },

   /*
   Determines if the regular expression will use the multiline option.
   This class always returns false.
   */
   _getMultiline : function ()
   {
      return this.getMultiline();
   }


   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("Conditions.RegExp", jTAC._internal.temp._Conditions_RegExp);
jTAC.defineAlias("RegExp", "Conditions.RegExp");

﻿// jTAC/Conditions/Difference.js
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
Module: Condition objects
Class : Conditions.Difference
Extends: Conditions.BaseOperator

Purpose:
Compares the difference between two values to another number
in the [differenceValue] property.
The [operator] property defines the comparison rule. 

Evaluation rules:
   Returns “success” when the values compare according to the operator.
   Returns “failed” when the values do not compare correctly.
   Returns “cannot evaluate” when either of the element’s values cannot be converted into the native type.

Set up:
   Assign one element’s id to the [elementId] property and the other to the [elementId2] property. 
   These two will have their values calculated as Math.abs(elementId – elementId2). 
   The result is compared to the value of [differenceValue]. Assign a number to [differenceValue]
   and an [operator] to determine how the elements are compared to [differenceValue].

   The TypeManager is normally identified by adding either [data-jtac-datatype] or [data-jtac-typemanager] 
   attributes to the element. If that is not done, you can use the [datatype] or [typeManager] property 
   to define the TypeManager.

See \jTAC\Conditions\Base.js for an overview of Conditions.

Properties introduced by this class:
   differenceValue - The value to compare on the right side of the 
      operator. ((connection - connection2) operator differenceValue) 
      Must be a number. Can be integer or float.
      How this is used depends on the TypeManager's toNumber() method.
      For example, DateTypeManager expects this to be a number of days.
      Defaults to 1.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Conditions.Base
Conditions.BaseOneConnection
Conditions.BaseTwoConnection
Conditions.BaseOperator
Connections.Base
Connections.BaseElement
Connections.FormElement
TypeManagers.Base
other TypeManager classes as needed

----------------------------------------------------------- */
jTAC._internal.temp._Conditions_Difference = {
   extend: "Conditions.BaseOperator",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      differenceValue: 1
   },

   configrules: {
      differenceValue: function(val) { if (typeof val == "number") return val; jTAC.error("Requires a number"); }
   },

   /* 
   Returns:
      1 - The two values compared according to the operator.
      0 - The two values did not compare.
      -1 - At least one value was null/empty string. Cannot evaluate.
   */
   _evaluateRule : function () {
      var conn = this.getConnection();
      if (conn.isNullValue()) {
         return -1;
      }

      try {
         var tm = this.getTypeManager();
         var value1 = tm.toValueFromConnection(conn);
         var value2 = tm.toValueFromConnection(this.getConnection2());
         if ((value1 == null) || (value2 == null)) {
            return -1;
         }
      // if not numbers already, make them numbers
         value1 = tm.toNumber(value1);
         value2 = tm.toNumber(value2);
         if ((value1 == null) || (value2 == null)) { // null means they could not be represented as numbers (for example string types)
            return -1;
         }
         return this._compare(Math.abs(value1 - value2), this.getDifferenceValue()) ? 1 : 0;
      }
      catch (e) {
         return -1;   // could not convert. Illegal value.
      }
   },

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/
   getTypeManager : function () {
      return this._checkTypeManager();
   }


}
jTAC.define("Conditions.Difference", jTAC._internal.temp._Conditions_Difference);
jTAC.defineAlias("Difference", "Conditions.Difference");

﻿// jTAC/Conditions/RequiredIndex.js
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
Module: Condition objects
Class : Conditions.RequiredIndex
Extends: Conditions.BaseOneConnection

Purpose:
Ensures that there is a selected item in a list type widget by evaluating the 
state of its [unassignedIndex] property.

While often lists have a value="" representing no selection, many developers 
prefer to add a "---NO SELECTION--" item. As a result, sometimes "no selection" 
means selectedIndex = 0 and other times it means selectedIndex = -1. 
Therefore, the user can specify which they are using in the unassignedIndex property.

Note: The Conditions.Required class can also be used to evaluate a list, 
but evaluates the textual value, not the selected index.

Evaluation rules:
   When the index specified in [unassignedIndex] matches the selected index, it means "failed".
   Any other index means "success".
   If you want to reverse this logic, set the not property to true.

Set up:
   Assign the list element’s id to the [elementId] property.

   The [unassignedIndex] property defaults to 0, so it is correctly setup 
   if you have a “no selection” item first in the list. If you do not, 
   assign the [unassignedIndex] property. Set it to -1 if it is unassigned by having no selection.


See \jTAC\Conditions\Base.js for an overview of Conditions.

Properties introduced by this class:
   unassignedIndex (int) -
      The index value that when selected, indicates that the list has no selection.
      It is typically 0 (when the first item is for "no selection") or -1
      (when any selected index indicates a selection.)
      It defaults to 0.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Conditions.Base
Connections.Base
Connections.BaseElement
Connections.FormElement
USUALLY LOAD \jTAC\TypeManagers\Base.js and other TypeManager classes

----------------------------------------------------------- */
jTAC._internal.temp._Conditions_RequiredIndex = {
   extend: "Conditions.BaseOneConnection",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      unassignedIndex: 0
   },

   /* 
   Evaluation rules. When the index specified in unassignedIndex
   matches the selected index, it means "failed".
   Any other index means "success".
   If you want to reverse this logic, set the not property to true.
   Returns 1 for "success" and 0 for "failed".
   */
   _evaluateRule : function () {
      var conn = this.getConnection();
      if (conn.typeSupported("index")) {
         var sel = conn.getTypedValue("index");
         return (sel != this.getUnassignedIndex()) ? 1 : 0;
      }
      else // if you have a custom list, create a Connection.BaseElement subclass that supports "index" in its typeSupported method
         this._error("The element [" + this.getElementId() + "] does not support list lookup functions.");
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("Conditions.RequiredIndex", jTAC._internal.temp._Conditions_RequiredIndex);
jTAC.defineAlias("RequiredIndex", "Conditions.RequiredIndex");

﻿// jTAC/Conditions/SelectedIndex.js
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
Module: Condition objects
Class : Conditions.SelectedIndex
Extends: Conditions.BaseOneConnection

Purpose:
Compares an index specified in the [index] property with 
the actual selected index. The [index] property can also
supply an array of indices to match, including
ranges, like this: [1, 2, [10, 20]]
Each item in the array is an integer of an index to match.
If a range is needed, the item should be an array with to items,
a start and end index.

Supports both single selection and multiselection lists.

Evaluation rules:
When the index specified in [index] matches a selected index, it means "success".
Any other index means "failed".
If you want to reverse this logic, set the "not" property to true.


See \jTAC\Conditions\Base.js for an overview of Conditions.

Properties introduced by this class:
   index (integer or array) -
      The index value to match against the selected indices of the list.
      The value can either be an integer or an array.
      When it is an array, each item either an index number
      or an array representing a range. A range's array
      has two elements, start index and end index.
      It defaults to null.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Conditions.Base
Conditions.BaseOneConnection
Connections.Base
Connections.BaseElement
Connections.FormElement

----------------------------------------------------------- */
jTAC._internal.temp._Conditions_SelectedIndex = {
   extend: "Conditions.BaseOneConnection",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      index: null
   },

   /*
   Cannot evaluate when the index property is null.
   */
   canEvaluate : function () {
      if (this.getIndex() == null)
         return false;
      return this.callParent();
   },


   /* 
   Evaluation rules. When the index specified in index
   matches the selected index, it means "failed".
   Any other index means "success".
   If you want to reverse this logic, set the not property to true.
   Returns 1 for "success" and 0 for "failed".
   */
   _evaluateRule : function () {
      // Looks for itf (the index to find) in the array, ia. That array
      // contains integers to match, and child arrays that define a range to match.
      function inIdxArray(itf, ia) {
         for (var i = 0; i < ia.length; i++) {
            var item = ia[i];
            if (item instanceof Array) { 
             // array must have two integers, start and end to compare
               if (item.length != 2)
                  this._error("Invalid range. Must be array of 2 integers.");
               if ((item[0] <= itf) && (itf <= item[1])) {
                  return true;
               }
            }
            else {
               if (itf == item) {
                  return true;
               }
            }
         }  // for
         return false;
      }
      var idx = this.getIndex();
      var conn = this.getConnection();
      if (conn.typeSupported("indices")) {
         var sel = conn.getTypedValue("indices");
         if (typeof idx == "number") {
            if (idx == -1) {
               return sel.length == 0 ? 1 : 0;
            }
            idx = [idx];
         }
         for (var i = 0; i < sel.length; i++) {
            if (inIdxArray(sel[i], idx)) {
               return 1;
            }
         }
         return 0;
      }
      else if (conn.typeSupported("index")) {
         var sel = conn.getTypedValue("index");
         if (idx instanceof Array) {
            return inIdxArray(sel, idx) ? 1 : 0;
         }
         return (sel == idx) ? 1 : 0;
      }
      else // if you have a custom list, create a Connection subclass that supports "index" in its typeSupported method
         this._error("The element [" + this.getElementId() + "] does not support list lookup functions.");
   },

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/
   setIndex : function (val)
   {  
      if (val instanceof Array)
         this.config.index = val;
      else
         this.config.index = jTAC.checkAsIntOrNull(val);
   }

}
jTAC.define("Conditions.SelectedIndex", jTAC._internal.temp._Conditions_SelectedIndex);
jTAC.defineAlias("SelectedIndex", "Conditions.SelectedIndex");

﻿// jTAC/Conditions/BooleanLogic.js
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
Module: Condition objects
Class : Conditions.BooleanLogic
Extends: Conditions.Base

Purpose:
Defines an AND or OR expression using other Conditions.
For example, RequiredCondition on TextBox1 OR CompareToValueCondition on DecimalTextBox1.
You create Condition objects and add them to the [conditions] property.
Then set the [operator] property to "AND" or "OR".
You can use any type of Condition object including Conditions.BooleanLogic,
which means you can have child boolean expressions.

Evaluation rules:
   If using an AND operator, all child Conditions must evaluate as "success" for this condition to return "success".
   If using an OR operator, at least one child Condition must evaluate as "success" for this condition to return "success".
   If not, it returns "failed".
   If a child Condition returns false from canEvaluate() or returns "cannot evaluate" from evaluate(),
   it is excluded from evaluation. If all child Conditions are excluded, Conditions.BooleanLogic
   returns "cannot evaluate".

Set up:
   Create Condition objects and add them to the [conditions] property. 
   Then set the [operator] property to "AND" or "OR".

   If you want to switch operators, add a Conditions.BooleanLogic with its operator 
   set differently and populate its own [conditions] property to apply against its operator.

   Use the [not] property if you want to reverse the result.

Example to evaluate the following expression:
TextBox1 is required AND (((TextBox2 holds integer) AND (TextBox2 is in range 1 to 10)) OR ((TextBox3 holds integer) AND (TextBox3 is in range 1 to 10)))

Conditions.BooleanLogic  operator="AND" with these child conditions:
   Conditions.Required elementId="TextBox1"
   Conditions.BooleanLogic operator="OR" with these child conditions:
      Conditions.BooleanLogic operator="AND" with these child conditions:
         Conditions.DataTypeCheck elementId="TextBox2" datatype="Integer"
         Conditions.Range elementId="TextBox2" datatype="Integer" minimum=1 maximum=10
      Conditions.BooleanLogic operator="AND" with these child conditions:
         Conditions.DataTypeCheck elementId="TextBox3" datatype="Integer"
         Conditions.Range elementId="TextBox3" datatype="Integer" minimum=1 maximum=10

Here is the above logic represented in JSon:
{"jtacClass" : "BooleanLogic", "operator": "AND", 
  "conditions": [
    {"jtacClass": "Required", "elementId" : "TextBox1" },
    {"jtacClass" : "BooleanLogic", "operator": "OR", 
     "conditions": [
      { "jtacClass" : "BooleanLogic", "operator": "AND", 
        "conditions": [
         {"jtacClass" : "DataTypeCheck", "elementId" : "TextBox2" },
         {"jtacClass" : "Range", "elementId" : "TextBox2", "minimum" : 1, "maximum": 10 }
        ] },
      {"jtacClass" : "BooleanLogic", "operator": "AND", 
        "conditions": [
         {"jtacClass" : "DataTypeCheck", "elementId" : "TextBox3" },
         {"jtacClass" : "Range", "elementId" : "TextBox3", "minimum" : 1, "maximum": 10 }
        ] }
      ] }
 ] }


See \jTAC\Conditions\Base.js for an overview of Conditions.

Properties introduced by this class:
   operator (string) -
      Determines the boolean operator. Only allows "AND", "OR".
      Defaults to "OR".

   conditions (array of Condition objects) - 
      Add any Condition object that defines elements of the logic
      between each AND or OR operator. If you want to switch
      operators, add a Conditions.BooleanLogic with its operator set
      differently and its child Condition classes to apply against its own operator.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Conditions.Base

----------------------------------------------------------- */
jTAC._internal.temp._Conditions_BooleanLogic = {
   extend: "Conditions.Base",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      operator: "OR",
      conditions: []
   },

   configrules: {
      operator: ["OR", "AND"]
   },

   /*
   Requires at least one condition to return true.
   */
   canEvaluate : function () {
      if (!this.getConditions().length)
         return false;
   
      return this.callParent();
   },

   /*
   If using an AND operator, all child Conditions must evaluate as "success" for this condition to return "success".
   If using an OR operator, at least one child Condition must evaluate as "success" for this condition to return "success".
   If not, it returns "failed".
   If a child Condition returns false from canEvaluate() or returns "cannot evaluate" from evaluate(),
   it is excluded from evaluation. If all child Conditions are excluded, Condition.BooleanLogic
   returns "cannot evaluate".
   */
   _evaluateRule : function () {
      var ho; // "has one". Set to true if there is a condition to evaluate
      this._cleanupConditions();

      var conds = this.getConditions();
      var and = this.getOperator() == "AND";
      for (var i = 0; i < conds.length; i++) {
         var cond = conds[i];

         if (cond.canEvaluate()) {
            var r = cond.evaluate();
            if (r != -1) {
               ho = true;
               if (r) {  // success
                  if (!and) // at least one is success for "OR" operator
                     return 1;
               }
               else { // failed
                  if (and)
                     return 0;
               }
            }  // if r != -1
         }  // if canEvaluate
      }  // for

      if (!ho) // no conditions were found to report "success" or "failed" means "cannot evaluate"
         return -1;
      return and ? 1 : 0;  // when "and", all were found "success". So return "success". When "or", all were found "failed", so return "failed"
   },

   /*
   Looks through the conditions collection. If any are JSON objects, they are converted
   to Conditions. If any are illegal entries, an exception is thrown.
   */
   _cleanupConditions : function () {
      try
      {
         this._pushContext();

         var conds = this.getConditions();
         for (var i = 0; i < conds.length; i++) {
            var cond = conds[i];
            if (!(cond instanceof jTAC.Conditions.Base) && (typeof (cond) == "object")) {  // see if its a json object.
               if (!cond.jtacClass)
                  this._error("Must define the Condition's class in the 'jtacClass' property of the object that describes a condition.");
               cond = jTAC.create(null, cond);
               conds[i] = cond;
            }
            else if (!(cond instanceof jTAC.Conditions.Base))
               this._error("The conditions property must only contain Condition objects and JSon objects that generate Condition objects.");

         }  // for
      }
      finally {
         this._popContext();
      }

   },

   /*
   Let's the caller retrieve the collection instances into a new list.
   In addition to getting those in the connections property, 
   it returns the connections from child Condition classes.
      list (Array) - Add collection objects to this list.
   */
   collectConnections : function (list) {
      this.callParent([list]);
      this._cleanupConditions();
      var conds = this.getConditions();
      if (conds) {
         for (var i = 0; i < conds.length; i++) {
            conds[i].collectConnections(list);
         }  // for
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
jTAC.define("Conditions.BooleanLogic", jTAC._internal.temp._Conditions_BooleanLogic);
jTAC.defineAlias("BooleanLogic", "Conditions.BooleanLogic");

﻿// jTAC/Conditions/DuplicateEntry.js
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
Module: Condition objects
Class : Conditions.DuplicateEntry
Extends: Conditions.BaseOneOrMoreConnections

Purpose:
Ensures that the list of elements on the page have different values.

If you are comparing list type widgets, it compares their textual values, 
not their index or the text shown the user.

Evaluation rules:
   If a pair is found to have the same string value, it evaluates as "failed".
   Otherwise it evaluates as "success".

Set up:
   For the first Connection, set the widget's id in the [elementId] property.

   For additional Connections, add their ids to the [moreConnections] property, 
   which is an array. Use either its push() method or assign an array of ids.

   Determine if comparisons are case insensitive with [caseIns] and if unassigned 
   fields are included with [ignoreUnassigned].


See \jTAC\Conditions\Base.js for an overview of Conditions.

Properties introduced by this class:
   caseIns (boolean) -
      When true, strings are compared using a case insensitive match.
      It defaults to true.

   ignoreUnassigned (boolean) - 
      When true, if the element's value is unassigned, it is never matched. 
      When false, the element's value is always used, even when blank. 
      It defaults to true.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Conditions.Base
Conditions.BaseOneConnection
Conditions.BaseOneOrMoreConnections
Connections.Base
Connections.BaseElement
Connections.FormElement

----------------------------------------------------------- */
jTAC._internal.temp._Conditions_DuplicateEntry = {
   extend: "Conditions.BaseOneOrMoreConnections",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      caseIns: true,
      ignoreUnassigned: true
   },
   /*
   Compares all of the string values from the connections. If any
   pair matches, it returns 0 ("failed". It will also retains references
   to the two connections that had the match in the fields _errconn1 and _errconn2.
   */
   _evaluateRule : function () {
      this._errconn1 = null;
      this._errconn2 = null;
      var conns = this._cleanupConnections();   // list will omit non-editable connections if ignoreNotEditable=true
      var ttl = conns.length;   // total connections
      if (!ttl) {
         return -1;  // cannot evaluate
      }

      var vals = []; // collects values in the same order as conns
      for (var i = 0; i < conns.length; i++) {
         var s = conns[i].getTextValue();
         if ((s.length == 0) && this.getIgnoreUnassigned())
            continue;

         if (this.getCaseIns()) {
            s = s.toUpperCase();
         }

         var exist = vals[s];
         if (exist != null) {   // error
            this._errconn1 = exist;
            this._errconn2 = conns[i];
            return 0;
         }

         vals[s] = conns[i];
      }
      return 1;
   },

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("Conditions.DuplicateEntry", jTAC._internal.temp._Conditions_DuplicateEntry);
jTAC.defineAlias("DuplicateEntry", "Conditions.DuplicateEntry");

﻿// jTAC/Conditions/CharacterCount.js
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
Module: Condition objects
Class : Conditions.CharacterCount
Extends: Conditions.BaseCounter

Purpose:
Use to ensure the number of characters in a string are within a range.

Totals the number of characters in each connection and compares it to a
range. Although its typical to use a single connection, specified by
the [elementId] or [connection] property, you can total multiple
connections by specifying others in the [moreConnections] property.

Set up:
   For the first Connection, set the widget's id in the [elementId] property or modify
   the Connection object in its [connection] property.
   For additional connections, create Connection objects like Connections.FormElement.
   Add them to [moreConnections] property, which is an array
   by using the array's push() method.

See \jTAC\Conditions\Base.js for an overview of Conditions.

Properties introduced by this class:
None

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Conditions.Base
Conditions.BaseOneConnection
Conditions.BaseOneOrMoreConnections
Conditions.BaseCounter
Connections.Base
Connections.BaseElement
Connections.FormElement

----------------------------------------------------------- */
jTAC._internal.temp._Conditions_CharacterCount = {
   extend: "Conditions.BaseCounter",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   /*
   Returns the number of characters. Applies the trim property rule if setup.
      conn (Connection object)
   */
   _connCount : function (conn) {
   //NOTE: Some elements return a string length that differs from the
   // intended number of characters to post back. <TextArea> does this
   // when there are ENTER characters. textLength() ensures the connection
   // resolves this difference. As a result, this does not use getTextValue() 
   // and check the string length.
      return conn.textLength();  // will trim if conn has its trim property set.
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("Conditions.CharacterCount", jTAC._internal.temp._Conditions_CharacterCount);
jTAC.defineAlias("CharacterCount", "Conditions.CharacterCount");

﻿// jTAC/Conditions/WordCount.js
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
Module: Condition objects
Class : Conditions.WordCount
Extends: Conditions.BaseCounter

Purpose:
Use to ensure the number of Words in a string are within a range.

Totals the number of Words in each connection and compares it to a
range. Although its typical to use a single connection, specified by
the [elementId] or [connection] property, you can total multiple
connections by specifying others in the [moreConnections] property.

Set up:
   For the first Connection, set the widget's id in the [elementId] property or modify
   the Connection object in its [connection] property.
   For additional connections, create Connection objects like Connections.FormElement.
   Add them to [moreConnections] property, which is an array
   by using the array's push() method.

See \jTAC\Conditions\Base.js for an overview of Conditions.

Properties introduced by this class:
None

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Conditions.Base
Conditions.BaseOneConnection
Conditions.BaseOneOrMoreConnections
Conditions.BaseCounter
Connections.Base
Connections.BaseElement
Connections.FormElement

----------------------------------------------------------- */
jTAC._internal.temp._Conditions_WordCount = {
   extend: "Conditions.BaseCounter",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   /*
   Returns the number of Words. Applies the trim property rule if setup.
      conn (Connection object)
   */
   _connCount : function (conn) {
      var s = conn.getTextValue();  // will trim if conn has its trim property set.
      if (s.length == 0) {
         return 0;
      }
      
      // use a regex to find the words. The \w and \W tokens handle most of what
      // we want. \w = any of these chars: A-Z,a-z,0-9,_
      // We also want the single quote (possessive nouns and contractions) in there
      s = s.replace(new RegExp("'", "gi"), "");  // remove single quotes

      var re = new RegExp(this._wordREPattern, "ig");
   // unfortunately, this loop will have to do even though its slower than letting the underlying JS engine
   // find all copies internally. JS simply doesn't have that capability
      var cnt = 0;
      while (re.exec(s) != null) {
        cnt++;
      }
      return cnt;
   },

/*
The regular expression used to identify words. Its separated
here so you can replace it by setting this field.
*/
   _wordREPattern : "(\\b|^)(\\w+?)(\\b|$)"

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("Conditions.WordCount", jTAC._internal.temp._Conditions_WordCount);
jTAC.defineAlias("WordCount", "Conditions.WordCount");

﻿// jTAC/Conditions/CountSelections.js
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
Module: Condition objects
Class : Conditions.CountSelections
Extends: Conditions.BaseCounter

Purpose:
Evaluates list-style elements that support multiple selections.
It counts the number of selections and compares the value to a range.

Although its typical to use a single Connection, specified by
the [elementId] or [connection] property, you can total multiple
connections by specifying others in the [moreConnections] property.

Set up:
   For the first Connection, set the widget's id in the [elementId] property or modify
   the Connection object in its [connection] property.
   For additional connections, create Connection objects like Connections.FormElement.
   Add them to [moreConnections] property, which is an array
   by using the array's push() method.

See \jTAC\Conditions\Base.js for an overview of Conditions.

Properties introduced by this class:
None

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Conditions.Base
Conditions.BaseOneConnection
Conditions.BaseOneOrMoreConnections
Conditions.BaseCounter
Connections.Base
Connections.BaseElement
Connections.FormElement

----------------------------------------------------------- */
jTAC._internal.temp._Conditions_CountSelections = {
   extend: "Conditions.BaseCounter",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   /*
   Returns the number of selected items. Applies the trim property rule if setup.
      conn (Connection object)
   */
   _connCount : function (conn) {
      if (conn.typeSupported("indices")) {
         return conn.getTypedValue("indices").length;
      }
      else
         this._error("Connection does not specify a multiple selection list.");
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("Conditions.CountSelections", jTAC._internal.temp._Conditions_CountSelections);
jTAC.defineAlias("CountSelections", "Conditions.CountSelections");

﻿// jTAC/Conditions/UserFunction.js
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
Module: Condition objects
Class : Conditions.UserFunction
Extends: Conditions.BaseOneOrMoreConnections

Purpose:
Lets the user assign a function to do the work of the _evaluateRule() method.
Your function will be passed the instance of the Condition so it can
access all of its Connections and any properties assigned by the user.
It returns a value of 1 ("success"), 0 ("failed"), and -1 ("cannot evaluate").

Examples:
function IsVisible(cond) {
   // check if the first Connection is a visible DOM element
   var conn = cond.connection;
   if (!conn || !conn.getElement(true))   // nothing to evaluate
      return -1; // cannot evaluate
   return conn.isVisible() ? 1 : 0;

}

function MatchClassName(cond) {
   // check if the first Connection's class name is the value of 
   // cond.options.ClassName which is a custom property you defined.
   if (cond.options.ClassName === undefined)
      return -1;  // cannot evaluate
   var conn = cond.connection;
   if (!conn || !conn.getElement(true))   // nothing to evaluate
      return -1; // cannot evaluate
   return conn.getClass() == cond.options.ClassName ? 1 : 0;
}

Set up:
   Assign the element’s id to the [elementId] property and any additional
   elements to the [moreConnections] property. You can also omit
   these values and let your function acquire the elements it needs.

   Assign the [fnc] property to your function. 

   If you want to pass in values, create an object with properties hosting
   the desired values and assign that object to the [options] property.
   Your function can access them as cond.options.propertyname.

See \jTAC\Conditions\Base.js for an overview of Conditions.

Properties introduced by this class:
   fnc (function) -
      Reference to the function that is evaluated.
      You can pass a string name of the function so long
      as that function is defined on the window object.

   options (object) -
      An option where you can define property names 
      and values for those properties. This object is passed along
      with the condition object passed to your function giving
      you a way to pass along data that your function can use.
      One way to assign it is to use javascript's object notation:

      cond.options = {propertyName: value, propertyName2: value};

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Conditions.Base
Conditions.BaseOneConnection
Connections.Base
Connections.BaseElement
TypeManagers.Base
Other TypeManager classes as needed

----------------------------------------------------------- */
jTAC._internal.temp._Conditions_UserFunction = {
   extend: "Conditions.BaseOneOrMoreConnections",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      fnc: null,
      options: null,
      autoDisable : false  // overrides default because this is often used with non-editable connections
   },

   configrules: {
      fnc: jTAC.checkAsFunction
   },

   /*
   Requires the function is assigned.
   */
   canEvaluate : function () {
      return this.callParent() && this.fnc;
   },
   _evaluateRule : function () {
      return this.fnc(this);
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("Conditions.UserFunction", jTAC._internal.temp._Conditions_UserFunction);
// while valid, there are other object heirarchies with the same name. jTAC.defineAlias("UserFunction", "Conditions.UserFunction");

﻿// jTAC/Connections/Value.js
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
