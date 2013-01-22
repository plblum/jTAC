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
// jTAC/jquery-validate/Alt ReplaceTokens PlugIn.js
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
Associated license:
Some code in this file originates from jQuery Validation Plugin 1.8.0
(Copyright (c) 2006 - 2011 J�rn Zaefferer)
and is here under the MIT License model.
https://github.com/jquery/jquery/blob/master/MIT-LICENSE.txt

jquery-validate info:
* http://bassistance.de/jquery-plugins/jquery-plugin-validation/
* http://docs.jquery.com/Plugins/Validation

-------------------------------------------------------------
Module: Extending jquery-validate to support token replacement

Purpose:
Modify $.validate with functions to replace new token format
with all kinds of values.
This code has been proposed for jquery-validate in a pull request.
Until its added, this script file must be added
before loading /jTAC/jquery-validate/Rules.js

----------------------------------------------------------- */

/*
This object is intended have its properties added to $.validate through $.extend.
It replaces one, formatAndAdd. It adds the rest.
*/
if ($ && $.validator) {
(function ($)
{
   if ($.validator.replaceTokens) // already exists
   {
      return;
   }
   var plugin = {
      /*
      A replacement for the formatAndAdd function on the jquery-validate
      validator object.
      */
      formatAndAdd: function (element, rule)
      {
         var message = this.defaultMessage(element, rule.method),
		      theregex = /\$?\{(\d+)\}/g;
         if (typeof message === "function")
         {
            message = message.call(this, rule.parameters, element);
         }
         /* REPLACED BY replaceTokens system below. This is built into defaultTokenReplacer         
         else if (theregex.test(message)) {
         message = $.validator.format(message.replace(theregex, '{$1}'), rule.parameters);
         }
         */
         // Begin new code
         var rt = $.validator.replaceTokens[rule.method];
         if (!rt)
         {
            rt = $.validator.defaultTokenReplacer;
         }
         message = rt.call($.validator, message, element, rule.parameters, $(element).val());
         // End new code
         this.errorList.push({
            message: message,
            element: element
         });

         this.errorMap[element.name] = message;
         this.submitted[element.name] = message;
      },

      // matches tokens with only digits. They retrieve values from the param object 
      // based on the physical order of properties defined. 
      // Replaces the {VALUE} token with the value parameter's string.
      // Replaces the {LABEL} token with the label associated with the element.
      // If the value parameter is not already a string, it will be converted with toString().
      // If you need better formatting, implement your own replacement of the {VALUE} token.
      defaultTokenReplacer: function (message, element, param, value)
      {
         var regex = /\$?\{(\d+)\}/g;
         if (regex.test(message))
         {
            message = $.validator.format(message.replace(regex, '{$1}'), param);
         }
         if (value == null)
            value = "";
         message = this.tokenReplacer(message, "VALUE", value.toString());   // {VALUE} token
         var lbl = this.elementLabel(element) || "*** Add the data-msglabel attribute to id " + element.id + ". ***";
         message = this.tokenReplacer(message, "LABEL", lbl);   // {LABEL} token
         return message;
      },

      // Utility to replace tokens in the message. 
      // A token is letters enclosed in brackets like {ABC}
      // however, you don't pass in the brackets to the tokentxt parameter.
      // tokentxt is just the letters. Uses a case insensitive match.
      // rpl in the string that replaces the token. 
      // Returns the modified message. 
      tokenReplacer: function (message, tokentxt, rpl)
      {
         var re = new RegExp("\\{" + tokentxt + "\\}", "ig");
         return message.replace(re, rpl.toString());
      },

      // Utility used by replacer functions that provide {MIN} and/or {MAX}
      // tokens. It also supports {LENGTH} and {DIFF} tokens.
      // {MIN} - The value from min identifying the minimum length
      // {MAX} - The value from max identifying the maximum length
      // {LENGTH} - The current length
      // {DIFF} - The difference between the length an the minimum or maximum,
      // but only works when min or max are integers.
      minMaxReplacer: function (message, min, max, length)
      {
         if (min != null)
            message = this.tokenReplacer(message, "MIN", min);
         if (max != null)
            message = this.tokenReplacer(message, "MAX", max);
         if (length != null)
         {
            message = this.tokenReplacer(message, "LENGTH", length);
            // {DIFF} is only supposed to handle integer min/max.
            // This code runs even if min/max are null or not integers.
            // It assumes the DIFF token isn't used in that case, but if it is, the result will be meaningful
            if (typeof min !== "number")
               min = 0;
            if (typeof max !== "number")
               max = 99999999;
            var diff = Math.max(length - max, min - length);
            message = this.tokenReplacer(message, "DIFF", diff);
         }
         return message;
      },

      /* 
      Locates a string that can be displayed as the label for the element
      within a message.
      The element can host this label in its data-msglabel attribute or
      there is another with a for= attribute specifying this element whose
      HTML is the label. If both are present, data-label overrides
      the for= attribute. 
      NOTE: The value "data-msglabel" was chosen over "data-label" to avoid
      conflicts with other systems.
      element (DOM Element) - Accepts null.
      Returns the label string or null if not located.
      The result will not contain HTML tags found in the source.
      */
      elementLabel: function (element)
      {
         if (!element)
         {
            return null;
         }
         var t = element.getAttribute("data-msglabel");
         // Alternative: t = $(element).data('msglabel') || (element.attributes && $(element).attr('data-msglabel'));

         if (t == null)
         {
            var lbl = $("label[for='" + element.id + "'][generated!='true']");  // jquery-validate creates a label to host the error message. 
            // It assigns a custom attribute, 'generated=true' to that label. 
            // We need to avoid it.
            if (lbl)
            {
               t = lbl.html();
               if (t)
               {
                  // strip the HTML tags. Tags are always "<" + 1 or more characters + ">".
                  t = t.replace(/\<(.|\n)+?\>/ig, "");

                  // if it came from a label, strip lead and trail non-alpha numeric text.
                  t = t.replace(/[^\dA-Za-z]+$/, ""); // trail non-alpha numeric
                  t = t.replace(/^[^\dA-Za-z]+/, ""); // lead

                  // update data-label to avoid searching each time
                  element.setAttribute("data-msglabel", t);
               }
            }
         }
         return t;   // may be null
      },


      // Hosts validation function names mapped to token replacement functions.
      // Each function takes these parameters and returns the updated message string:
      //   message (string) - text to modify.
      //   element (DOM Element)
      //   param - same parameters collection used elsewhere. Data is specific to the individual function.
      //   value - The value that was found to be invalid
      // Those functions not explicitly declared use $.validator.defaultTokenReplacer
      replaceTokens: {

         // Supported tokens:
         // {MIN} - The value from param identifying the minimum length
         // {LENGTH} - The current length
         // {DIFF} - The difference between the length and the minimum
         minlength: function (message, element, param, value)
         {
            message = $.validator.minMaxReplacer(message, param, null, value.length);
            return $.validator.defaultTokenReplacer(message, element, param, value);
         },

         // Supported tokens:
         // {MAX} - The value from param identifying the maximum length
         // {LENGTH} - The current length
         // {DIFF} - The difference between the length and the maximum
         maxlength: function (message, element, param, value)
         {
            message = $.validator.minMaxReplacer(message, null, param, value.length);
            return $.validator.defaultTokenReplacer(message, element, param, value);
         },

         // Supported tokens:
         // {MIN} - The value from param identifying the minimum length
         // {MAX} - The value from param identifying the maximum length
         // {LENGTH} - The current length
         // {DIFF} - The difference between the length and the minimum or maximum
         rangelength: function (message, element, param, value)
         {
            message = $.validator.minMaxReplacer(message, param[0], param[1], value.length);
            return $.validator.defaultTokenReplacer(message, element, param, value);
         },

         // Supported tokens:
         // {MIN} - The value from param identifying the minimum value
         min: function (message, element, param, value)
         {
            message = $.validator.minMaxReplacer(message, param, null, null);
            return $.validator.defaultTokenReplacer(message, element, param, value);
         },

         // Supported tokens:
         // {MAX} - The value from param identifying the maximum value
         max: function (message, element, param, value)
         {
            message = $.validator.minMaxReplacer(message, null, param, null);
            return $.validator.defaultTokenReplacer(message, element, param, value);
         },

         // Supported tokens:
         // {MIN} - The value from param identifying the minimum value
         // {MAX} - The value from param identifying the maximum value
         range: function (message, element, param, value)
         {
            message = $.validator.minMaxReplacer(message, param[0], param[1], null);
            return $.validator.defaultTokenReplacer(message, element, param, value);
         }

      }

   }
   
   $.extend($.validator.prototype, plugin);
   $.extend($.validator, plugin);   // for some reason, extend to the prototype has no impact on the default $.validator
} (jQuery));    // function($) ends

}  // if $ && $.validator﻿// jTAC/jquery-validate/Condition Extensions.js
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
Module: Extending jquery-validate with support for Conditions.

Purpose:
Extend the prototypes for each Condition class to support features
used by validation. Includes:
- defining rule names that map to the condition
- default error message
- lookupKey property to get an error message from jTAC.translations
- token replacement function
- dependency support: the 'depend' property

This code works without jquery-validate present. It can be used
to setup alternative validation frameworks.

RULE NAMING
By default, a lowercase version of the condition name (without namespace) 
is used as the rule name. For example, "comparetovalue", "difference",
and "datatypecheck".
Conditions.Range and Conditions.Required conflict with native rule names.
Overwriting the native rules breaks due to some dependencies built into 
jquery-validate that assume you are still using the native rules.

As a result, Range and Required have these as rule names:
"advrange"
"advrequired"


TOKEN REPLACEMENT
Each Condition provides the replaceToken() method to replace tokens found
in the error message string
jTAC handles tokens in error messages through the jTAC.jqueryValidate.replaceTokens function.
That function calls the replaceToken function added to each Condition class
in the code that follows.
If jquery-validate lacks the validate option "replaceTokens",
expand it to support that feature.


DEPENDENCY SUPPORT
jquery-validate offers the depends parameter to specify 
a rule that enables the validation. This feature has two limitations
that are overcome by the enhancements below:
1. unobtrusive validation has no way to set this up
2. The user has to define a function calling jTAC.isValid()
   with the depends parameter. This could be simplified.

With these extensions all Conditions now have a "depends" property.
If assigned, it hosts a Condition that determines if the validation runs.
The Conditions.Base.canEvaluate() method has been replaced
to run that Condition and stop validation if it returns "failed".
(Both "success" and "cannot evaluate" proceed with validation.)

The "depends" property can also host a jquery selector. If that selector
finds at least one item, the condition is enabled.

The setup for the "depends" property is identical for both
coded and unobtrusive validation. You always define
an object with the properties of the Condition to be defined.
One of those properties can be "depends" and host another
object that defines the condition.
That object must include a 'jtacClass' property and specify
the name of a Condition object to create. 
The remaining properties assign their values to identical
property names on the Condition that is created.
Always specify the elementId property in the dependency condition.



Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
ALWAYS LOAD any Condition scripts BEFORE THIS FILE IS LOADED
----------------------------------------------------------- */

if (!window.jTAC)
   throw new Error("window.jTAC not created.");

jTAC.require("Conditions.Base");

/* ---- EXTENDS Conditions.Base --------------------------------- */

jTAC_Temp = {
   config: {
      depends: null,
      lookupKey :null
   },
   configrule: {
      lookupKey: jTAC.checkAsStrOrNull
   },

   /* 
   Extension to Conditions so they can replace tokens they support
   found in the message passed. This is used by validator error messages.
   This method is subclassed to introduce token support as this
   class returns the original message.
      text (string) - the text to modify. Replace all tokens it supports.
      details (object) - object with these parameters:
         context (string) - identifies the user interface that needs the string.
            Values include:
               "html" (or null) - for the actual page
               "alert" - a javascript alert or confirm box.
               "tooltip" - a javascript tooltip
         element (object) - the object on the page being validated
         value (string) - the value from that object
         validator (validator object) - the current jquery-validate's validator object.
         messagelabel (string) - the style sheet class used for the {ERRORLABEL} token.
            When using jquery-validate, this should be found on validator.settings.messagelabel.
            
      Supported tokens:
         {NEWLINE} - Replaced by the new line symbol based on the context.
               html uses <br />, alert uses \n, tooltip uses \r.
         {ERRORLABEL} - Replaced by the $.validator.setting.messagelabel, which
               is a style sheet class. Use this in messages that
               have {LABEL} tokens. Enclose them in <span class='{ERRORLABEL}'>{LABEL}</span>.
               If details.messagelabel is null, the default 'messagelabel' is used.
      When context is "alert" or "tooltip", all HTML tags are stripped.
   */
   replaceTokens: function (text, details) {
      var t = text;
      switch (details.context) {
         case "alert":
            t = jTAC.replaceAll(t, "{NEWLINE}", "\n", true);
            // falls through to use strip tags code
         case "tooltip":
            t = jTAC.replaceAll(t, "{NEWLINE}", "\r", true);
            t = jTAC.replaceAll(t, "<(.|\n)+?>", "");   // strip the HTML tags. Tags are always "<" + 1 or more characters + ">".
            break;
         default: // html
            t = jTAC.replaceAll(t, "{NEWLINE}", "<br />", true);
            break;
      }
      if (jTAC.contains(t, "{ERRORLABEL}", true)) {
         var rpl = details.messagelabel;
         t = jTAC.replaceAll(t, "{ERRORLABEL}", rpl != null ? rpl : "messagelabel");
      }
      return t;
   },

   /*
   Utility function that reduces the code for replacing a single token.
      text (string) - the string to modify. 
      token (string) - the full token string
   */
   _replaceToken: function (text, token, rpl) {
      if (jTAC.contains(text, token, true)) {
         text = jTAC.replaceAll(text, token, rpl.toString(), true);
      }
      return text;
   },

   /* 
   Utility function for the replaceTokens methods.
   Handles the singular/plural tokens. They have a format of {[tokenname]:singular:plural}
   If this pattern is found, use the text of 'singular' when cnt = 1. Otherwise use 'plural'.
      text (string) - the original string containing tokens
      cnt (int) - Count. When = 1, the singular string is used. Otherwise the plural string is used.
      token (string) - The token name within the brackets.  {[tokenname]:singular:plural}
   Return the updated string or the original if there wasn't a match to the token.
   */
   _spReplaceToken: function (text, cnt, token) {
      var re = new RegExp("\\{" + token + ":([^:}]*):([^:}]*)\\}"); // [^:}] = everything except a colon and }

      var m = re.exec(text);
      if ((m != null) && (m.length == 3)) {
         var orig = new RegExp("{" + token + ":" + m[1] + ":" + m[2] + "}", "gi");  // do not use "m" flag - older browsers fail
         if (cnt == 1) {
            return text.replace(orig, m[1]);
         }
         else {
            return text.replace(orig, m[2]);
         }
      }
      return text;
   },


/*
Replace a token whose string comes from a value that is formatted
through the current TypeManager.
*/
   _tmReplaceToken: function ( text, value, token, details ) {
      if ( jTAC.contains( token ) ) {
         var rpl = value;
         var tm = this.getTypeManager();
         if ( tm ) {
            var sw = jTAC.silentWarnings();
            jTAC.silentWarnings( true );
            try {
               try {

                  if ( typeof ( rpl ) == "string" ) {
                     rpl = tm.toValueNeutral( rpl );
                  }
                  rpl = tm.toString( rpl );
                  if ( details.context == "html" ) {
                     rpl = jTAC.htmlEncode( rpl );
                  }
               }
               catch ( e ) {
                  // could not convert. Show it in its original form
                  rpl = value;
               }
            }
            finally {
               jTAC.silentWarnings( sw );
            }

         }
         text = jTAC.replaceAll( text, token, rpl, true );
      }
      return text;
   },

   /*
   Subclasses provide their default error message with this.
   */
   defaultErrorMessage: function () {
      return "";
   },


   /* depends property: SET function
   If assigned it is a rule to enable the condition.
   It can be either a Condition object, function, or a jquery selector string.
   If a function, it must take one parameter, the element being validated and return true
   for valid and false for invalid. The value of 'this' is the Condition object within your function.
   */
   setDepends: function (val) {
      if (typeof val == "function") {
         this.config.depends = val;
      }
      else if ((typeof val == "string") && (val.indexOf("{") != 0)) {
         this.config.depends = val;
      }
      else {
         this.config.depends = jTAC.checkAsConditionOrNull(val);
      }
   },

   canEvaluate: function () {
   // THIS CODE IS COPIED FROM /Conditions/Base.js
      if (!this.getEnabled())
         return false;
      if (this.getAutoDisable() && !this._connsEditable())
         return false;
   // END OF COPIED CODE

      var dp = this.getDepends();
      if (dp) {
         if (typeof dp == "function") {
            var el = null;
            if (dp.getConnection) {
               el = dp.getConnection().getElement();  // may be null
            }
            return dp.call(this, el);
         }
         else if ((typeof dp == "object") && dp.canEvaluate() && (dp.evaluate() == 0)) {
            return false;
         }
         if (typeof dp == "string") { // when a string, it is a jquery selector.
            return $(dp).length > 0;   // must return at least one to be enabled
         }
      }
      return true;
   },

/*
The name used for the rule name in jquery-validate.
It defaults to the class name of the Condition.
*/
   ruleName: function() {
      return this.$className.toLowerCase();
   }
}

jTAC.addMembers("Conditions.Base", jTAC_Temp);

/* ---- EXTENDS Conditions.BaseOneConnection --------------------------------- */

if (jTAC.isDefined("Conditions.BaseOneConnection")) {
   jTAC_Temp = {
      /*
      Adds support for these tokens:
      {VALUE} - the connection's actual string value.
      {LABEL} - the label associated with the element
      */
      replaceTokens: function (text, details)
      {
         var t = this.callParent([text, details]);
         var conn = this.getConnection();
         t = this._tmReplaceToken(t, conn.getTextValue(), "{VALUE}", details);
/*
         var rpl = conn.getTextValue();
         if (details.context == "html") {
            rpl = jTAC.htmlEncode(rpl);
         }

         t = jTAC.replaceAll(t, "{VALUE}", rpl, true);
*/
         if (jTAC.contains(t, "{LABEL}", true)) {
            t = jTAC.replaceAll(t, "{LABEL}", conn.getLabel() || 
               "<strong>Warning: No label defined for " + conn.getId() + ". Use &lt;Label for=&gt; or data-msglabel='label' in the element.</strong>", true);
         }
         return t;
      }
   }
   jTAC.addMembers("Conditions.BaseOneConnection", jTAC_Temp);

}

/* ---- EXTENDS Conditions.BaseTwoConnections --------------------------------- */
if (jTAC.isDefined("Conditions.BaseTwoConnections")) {
   jTAC_Temp = {

      /* 
      Adds support for these tokens:
      {VALUE2} - the connection2's actual string value.
      {LABEL2} - the label associated with the element
      */
      replaceTokens: function (text, details) {
         var t = this.callParent([text, details]);
         var conn = this.getConnection2();
         t = this._tmReplaceToken(t, conn.getTextValue(), "{VALUE2}", details);
/*
         var rpl = conn.getTextValue();
         if (details.context == "html") {
            rpl = jTAC.htmlEncode(rpl);
         }
         t = jTAC.replaceAll(t, "{VALUE2}", rpl, true);
*/
         if (jTAC.contains(t, "{LABEL2}", true)) {
            t = jTAC.replaceAll(t, "{LABEL2}", conn.getLabel() || 
               "<strong>Warning: No label defined for " + conn.getId() + ". Use &lt;Label for=&gt; or data-msglabel='label' in the element.</strong>", true);
         }
         return t;
      }
   }
   jTAC.addMembers("Conditions.BaseTwoConnections", jTAC_Temp);

}
/* ---- EXTENDS Conditions.DataTypeCheck --------------------------------- */

if (jTAC.isDefined("Conditions.DataTypeCheck")) {
   jTAC_Temp = {
   /* 
   Adds support for these tokens:
   {DATATYPE} - the name of the data type, taken from the TypeManager.getFriendlyName() function.
   User can override by assigning either the friendlyName or friendlyLookupKey property
   on the TypeManager. When using friendlyLookupKey, you get localization support.
   */
      replaceTokens: function (text, details) {
         var t = this.callParent([text, details]);
         if (jTAC.contains(t, "{DATATYPE}", true)) {
            var rpl = this.getTypeManager().getFriendlyName();
            t = jTAC.replaceAll(t, "{DATATYPE}", rpl, true);
         }
         return t;
      },

      defaultErrorMessage: function () {
         return "<span class='{ERRORLABEL}'>{LABEL}</span> must be a valid {DATATYPE}.";
      }

   }
   jTAC.addMembers("Conditions.DataTypeCheck", jTAC_Temp);
}
/* ---- EXTENDS Conditions.Range --------------------------------- */

if (jTAC.isDefined("Conditions.Range")) {
   jTAC_Temp = {
/*
There is a conflict with the native range rule name. While using "range"
will replace the native rule, it is not a complete replacement. Side effects
in the validator.normalizeRules() function will assume "range" is the native code
and destroy the Condition object data.
*/
      ruleName: function() {
         return "advrange";
      },

   /* 
   Adds support for these tokens:
   {MINIMUM} - show the value of the minimum property. If that value is not a string,
   it will be converted into a string applying formatting from the TypeManager's rules.
   {MAXIMUM} - show the value of the maximum property. If that value is not a string,
   it will be converted into a string applying formatting from the TypeManager's rules.
   */
      replaceTokens: function (text, details) {
         var t = this.callParent([text, details]);
         t = this._tmReplaceToken(t, this.getMinimum(), "{MINIMUM}", details);
         t = this._tmReplaceToken(t, this.getMaximum(), "{MAXIMUM}", details);

         return t;
      },

      defaultErrorMessage: function () {
         return "<span class='{ERRORLABEL}'>{LABEL}</span> must be between {MINIMUM} and {MAXIMUM}.";
      }
   }
   jTAC.addMembers("Conditions.Range", jTAC_Temp);

}

/* ---- EXTENDS Conditions.BaseOperator --------------------------------- */

if (jTAC.isDefined("Conditions.BaseOperator")) {
   jTAC_Temp = {
   /* 
   Adds support for these tokens:
   {OPERATOR} - Describe the operator. It defaults to the same strings stored 
   in the operator property (such as "=" and "<>").
   User can override by using the jTAC.translations system, and editing the properties
   that are the same as the operator values. ("=", "<=", etc)
   */
      replaceTokens: function (text, details) {
         var t = this.callParent([text, details]);
         var rpl = this.getOperator();
         rpl = jTAC.translations.lookup(rpl, rpl);
         if (details.context == "html") {
            rpl = jTAC.htmlEncode(rpl);
         }
         t = jTAC.replaceAll(t, "{OPERATOR}", rpl, true);
         return t;
      }
   }
   jTAC.addMembers("Conditions.BaseOperator", jTAC_Temp);

}

/* ---- EXTENDS Conditions.CompareToValue --------------------------------- */

if (jTAC.isDefined("Conditions.CompareToValue")) {
   jTAC_Temp = {
   /* 
   Adds support for these tokens:
   {VALUETOCOMPARE} - show the value of the [valueToCompare] property. If that value is not a string,
      it will be converted into a string applying formatting from the TypeManager's rules.
   */
      replaceTokens: function (text, details) {
         var t = this.callParent([text, details]);
         t = this._tmReplaceToken(t, this.getValueToCompare(), "{VALUETOCOMPARE}", details);

         return t;
      },

      /*
      Subclasses provide their default error message with this.
      */
      defaultErrorMessage: function () {
         return "<span class='{ERRORLABEL}'>{LABEL}</span> must be {OPERATOR} {VALUETOCOMPARE}.";
      }
   }
   jTAC.addMembers("Conditions.CompareToValue", jTAC_Temp);

}

/* ---- EXTENDS Conditions.CompareTwoElements --------------------------------- */

if (jTAC.isDefined("Conditions.CompareTwoElements")) {
   jTAC_Temp = {
      defaultErrorMessage: function () {
         return "<span class='{ERRORLABEL}'>{LABEL}</span> must be {OPERATOR} <span class='{ERRORLABEL}'>{LABEL2}</span>.";
      }
   }
   jTAC.addMembers("Conditions.CompareTwoElements", jTAC_Temp);

}

/* ---- EXTENDS Conditions.Difference --------------------------------- */

if (jTAC.isDefined("Conditions.Difference")) {
   jTAC_Temp = {
      /* 
      Adds support for these tokens:
      {DIFFVALUE} - show the value of the differenceValue property. If that value is not a string,
      it will be converted into a string. It will not use the typeManager assigned to the 
      typeManager property because the differenceValue is not usually the same type as the values in elements.
      Instead, it uses a new TypeManagers.Float object that strips all trailing zeros.
      */
      replaceTokens: function (text, details) {
         var t = this.callParent([text, details]);
         if (jTAC.contains(t, "{DIFFVALUE}", true)) {
            var rpl = this.getDifferenceValue();
            if (typeof (rpl) != "string") {
               var tm = jTAC.create("TypeManagers.Float");
               tm.setTrailingZeroDecimalPlaces(0);
               tm.setMaxDecimalPlaces(3);
               rpl = tm.toString(rpl);
            }
            if (details.context == "html") {
               rpl = jTAC.htmlEncode(rpl);
            }
            t = jTAC.replaceAll(t, "{DIFFVALUE}", rpl, true);
         }
         return t;
      },

      defaultErrorMessage: function () {
         return "Difference between <span class='{ERRORLABEL}'>{LABEL}</span> and <span class='{ERRORLABEL}'>{LABEL2}</span> must be {OPERATOR} {DIFFVALUE}.";
      }
   }
   jTAC.addMembers("Conditions.Difference", jTAC_Temp);

}

/* ---- EXTENDS Conditions.Required --------------------------------- */

if (jTAC.isDefined("Conditions.Required")) {
   jTAC_Temp = {
/*
There is a conflict with the native required rule name. While using "required"
will replace the native rule, it is not a complete replacement.
The validator.optional() function will assume "required" is the native code
and fail to operate correctly.
*/
      ruleName: function() {
         return "advrequired";
      },


   /* 
   Adds support for these tokens:
   {COUNT} - show the number of connections that were not null.
   {MINIMUM} - show the value of the minimum property.
   {MAXIMUM} - show the value of the maximum property.
   */

      replaceTokens: function (text, details) {
         var t = this.callParent([text, details]);

         var rpl = this.count;
         if (rpl == null) {
            rpl = 0; // just in case count was not defined
         }
         t = jTAC.replaceAll(t, "{COUNT}", rpl.toString(), true);
            // NOTE: Not htmlEncoding here because these values are unformatted integers, only containing digits.
         t = jTAC.replaceAll(t, "{MINIMUM}", this.getMinimum().toString(), true);

         return jTAC.replaceAll(t, "{MAXIMUM}", this.getMaximum().toString(), true);
      },

      defaultErrorMessage: function () {
         return "<span class='{ERRORLABEL}'>{LABEL}</span> requires an entry.";
      }
   }
   jTAC.addMembers("Conditions.Required", jTAC_Temp);

}

/* ---- EXTENDS Conditions.RequiredIndex --------------------------------- */

if (jTAC.isDefined("Conditions.RequiredIndex")) {
   jTAC_Temp = {
      defaultErrorMessage: function () {
         return "<span class='{ERRORLABEL}'>{LABEL}</span> requires a selection.";
      }
   }
   jTAC.addMembers("Conditions.RequiredIndex", jTAC_Temp);

}

/* ---- EXTENDS Conditions.SelectedIndex --------------------------------- */

if (jTAC.isDefined("Conditions.SelectedIndex")) {
   jTAC_Temp = {
      defaultErrorMessage: function () {
         return "<span class='{ERRORLABEL}'>{LABEL}</span> has an invalid selection. Choose another.";
      }
   }
   jTAC.addMembers("Conditions.SelectedIndex", jTAC_Temp);

}
/* ---- EXTENDS Conditions.BaseCounter --------------------------------- */

if (jTAC.isDefined("Conditions.BaseCounter")) {
   jTAC_Temp = {

   /* 
   Adds support for these tokens:
   {COUNT} - show the count returned by the _connCount() function.
   {COUNT:singular:plural} - Show one of the two strings in singular or plural positions,
      depending on the count. If 1, show the singular form.
   {MINIMUM} - show the value of the minimum property.
   {MAXIMUM} - show the value of the maximum property.
   {DIFF} - the number the count exceeds the max or is below the minimum.
   {DIFF:singular:plural} - Show one of the two strings in singular or plural positions,
      depending on the value of {DIFF}. If 1, show the singular form.

   */
      replaceTokens: function (text, details) {
         var t = this.callParent([text, details]);

         var cnt = this.count;
         if (cnt == null) {
            cnt = 0; // just in case count was not defined
         }
         t = jTAC.replaceAll(t, "{COUNT}", cnt.toString(), true);
         t = this._spReplaceToken(t, cnt, "COUNT");   // supports {COUNT:singular:plural}

         var min = this.getMinimum();
         if (min == null) {
            min = 0;
         }
            // NOTE: Not htmlEncoding here because these values are unformatted integers, only containing digits.
         t = jTAC.replaceAll(t, "{MINIMUM}", min.toString(), true);

         var max = this.getMaximum();
         if (max == null) {
            max = 9999999;
         }
         t = jTAC.replaceAll(t, "{MAXIMUM}", max.toString(), true);

         var exc = Math.max(min - cnt, cnt - max);
         t = jTAC.replaceAll(t, "{DIFF}", exc.toString(), true);
         t = this._spReplaceToken(t, exc, "DIFF");   // supports {DIFF:singular:plural}

         return t;
      }
   }
   jTAC.addMembers("Conditions.BaseCounter", jTAC_Temp);

}

/* ---- EXTENDS Conditions.CharacterCount --------------------------------- */

if (jTAC.isDefined("Conditions.CharacterCount")) {
   jTAC_Temp = {
      defaultErrorMessage: function () {
         return "<span class='{ERRORLABEL}'>{LABEL}</span> must have between {MINIMUM} and {MAXIMUM} characters.";
      }
   }
   jTAC.addMembers("Conditions.CharacterCount", jTAC_Temp);

}

/* ---- EXTENDS Conditions.WordCount --------------------------------- */

if (jTAC.isDefined("Conditions.WordCount")) {
   jTAC_Temp = {
      defaultErrorMessage: function () {
         return "<span class='{ERRORLABEL}'>{LABEL}</span> must have between {MINIMUM} and {MAXIMUM} words.";
      }
   }
   jTAC.addMembers("Conditions.WordCount", jTAC_Temp);

}

/* ---- EXTENDS Conditions.CountSelections --------------------------------- */

if (jTAC.isDefined("Conditions.CountSelections")) {
   jTAC_Temp = {
      defaultErrorMessage: function () {
         return "<span class='{ERRORLABEL}'>{LABEL}</span> must have between {MINIMUM} and {MAXIMUM} selections.";
      }
   }
   jTAC.addMembers("Conditions.CountSelections", jTAC_Temp);

}

/* ---- EXTENDS Conditions.RegExp --------------------------------- */

if (jTAC.isDefined("Conditions.RegExp")) {
   jTAC_Temp = {
      config: { 
         patternLabel: "format", 
         patternLookupKey: null
      },
      configrule: {
         patternLookupKey :jTAC.checkAsStrOrNull
      },

   /* 
   Adds support for these tokens:
   {PATTERN} - shows the patternLabel token which is often used to define
   the type of data, like "Phone number" or "Street Address".
   Use the patternLookupKey property to use the jTAC.translations system
   allowing for localization.
   */

      replaceTokens: function (text, details) {
         var t = this.callParent([text, details]);

         var rpl = jTAC.translations.lookup(this.getPatternLookupKey(), this.getPatternLabel());
         if (details.context == "html") {
            rpl = jTAC.htmlEncode(rpl);
         }
         return jTAC.replaceAll(t, "{PATTERN}", rpl, true);
      },

      defaultErrorMessage: function () {
         return "<span class='{ERRORLABEL}'>{LABEL}</span> must be a valid {PATTERN}.";
      }

   }
   jTAC.addMembers("Conditions.RegExp", jTAC_Temp);

}

/* ---- EXTENDS Conditions.DuplicateEntry --------------------------------- */

if (jTAC.isDefined("Conditions.DuplicateEntry")) {
   jTAC_Temp = {
      /* 
      Adds support for these tokens:
      {LABEL1} - The label associated with the first field with a matching value.
      {LABEL2} - The label associated with the second field with a matching value.
      */
      replaceTokens: function (text, details) {
         var t = this.callParent([text, details]);
         if (jTAC.contains(t, "{LABEL", true)) {
         // the condition has setup references to the two connections that are matching
         // in _errconn1 and _errconn2.

            var rpl = "field 1";
            if (this._errconn1) {
               rpl = this._errconn1.getLabel();
            }
            t = jTAC.replaceAll(t, "{LABEL1}", rpl, true);
            rpl = "field 2";
            if (this._errconn2) {
               rpl = this._errconn2.getLabel();
            }
            t = jTAC.replaceAll(t, "{LABEL2}", rpl, true);
         }
         return t;
      },

      defaultErrorMessage: function () {
         return "<span class='{ERRORLABEL}'>{LABEL1}</span> must be different from <span class='{ERRORLABEL}'>{LABEL2}</span>.";
      }
   }
   jTAC.addMembers("Conditions.DuplicateEntry", jTAC_Temp);

}

/* ---- EXTENDS Conditions.BooleanLogic --------------------------------- */

if (jTAC.isDefined("Conditions.BooleanLogic")) {
   jTAC_Temp = {
      defaultErrorMessage: function () {
         return "*** EXPLICITY ASSIGN THIS MESSAGE ***";
      }
   }
   jTAC.addMembers("Conditions.BooleanLogic", jTAC_Temp);
}

/* ---- EXTENDS Conditions.UserFunction --------------------------------- */

if (jTAC.isDefined("Conditions.UserFunction")) {
   jTAC_Temp = {
      defaultErrorMessage: function () {
         return "*** EXPLICITY ASSIGN THIS MESSAGE ***";
      }
   }
   jTAC.addMembers("Conditions.UserFunction", jTAC_Temp);
}
// jTAC/jquery-validate/Rules.js
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
Associated license:
Some code in this file originates from jQuery Validation Plugin 1.8.0
(Copyright (c) 2006 - 2011 J�rn Zaefferer)
and is here under the MIT License model.
https://github.com/jquery/jquery/blob/master/MIT-LICENSE.txt

jquery-validate info:
* http://bassistance.de/jquery-plugins/jquery-plugin-validation/
* http://docs.jquery.com/Plugins/Validation

-------------------------------------------------------------
Module: Extending jquery-validate with support for Conditions.

Purpose:
Add and replace rules within jquery-validate, using the Condition
objects defined within jTAC.

Every Condition class that defined within the jTAC global will
become a rule in jquery-validate. The rule name will be a lowercase 
version of the class name of the Condition.

It also supports unobtrusive validation when jquery-validate-unobtrusive.js is loaded.

Each rule in jquery-validate has optional parameters, which are 
designed to tell the rule how to behave. For example, a range rule
needs a value for minimum and maximum.

jTAC always has you define a javascript object to customize its rules.
The object's properties are assigned to properties on the actual Condition object.
For example, when using the Conditions.Range class, this defines
its minimum and maximum property values:
{minimum: [value], maximum: [value]}

Example:
$("DateTextBox1").rules("add", {
  required: true,
  datatypecheck : { "typeManager" : { "jtacClass" : "Date" } }
  range : { "typeManager" : { "jtacClass" : "Date" }, 
                 "minimum" : "2012-01-01", 
                 "maximum" : "2012-12-31" }
});


When using unobtrusive validation, the javascript object should 
be defined in JSon format and appear in an attribute with this pattern:
data-val-rulename-json="{'property':value, 'property2':value}"

Example:
<input type='text' id='textbox1' name='textbox1'
   data-val="true"
   data-val-required=""
   data-val-datatypecheck=""
   data-val-datatypecheck-json="{'datatype': 'Date'}"
   data-val-range=""
   data-val-range-json="{'minimum': '2012-01-01', 'maximum': '2012-12-31'}" />

Rules for the syntax of the parameters object
---------------------------------------------
1) Parameter names require a case sensitive match to the actual property name
   on the Condition object. When using JSON, enclose the name in quotes.

2) String values representing numbers, dates, and times should always be 
   in a culture neutral format.
   Integers - digits only plus optional lead minus character. 
         Valid: 1000   -1000
         Invalid: 1,000   1000.0   1000-
   Float - digits and optionally a period followed by at least one more digit.
      Optional lead minus character.
         Valid: 1000   -1000   1000.0  -1000.0  1.23400
         Invalid: 1,000   1,000.0  1000.   1000.0-
   Currency and Percent : Same as Float
   Date - yyyy-MM-dd
         Valid: 2012-01-31
         Invalid: 01/31/2012
   Time - HH:mm:ss  uses 24 hour format 00-24. Always includes seconds.
         Valid: 14:00:00  00:00:00
         Invalid: 09:00:00 AM     09:00
   DateTime - yyyy-MM-dd HH:mm:ss
         Combines date and time with a space separator.

3) Conditions that use a TypeManager have several ways to define the TypeManager. 
   - The recommended approach is to add the [data-jtac-datatype] attribute to
      the element's markup. Assign its value to one of the TypeManager class names or aliases.

   - Use the "datatype" property as parameter, with the TypeManager class name or alias.
     datatypecheck : { "datatype" : "Date" }

   - Use the "typeManager" property as a parameter when you want to create a typeManager object with optional
     properties to customize it.
     datatypecheck : { "typeManager" : { "jtacClass" : "TypeManagers.Date" } }
     datatypecheck : { "typeManager" : { "jtacClass" : "Date", "dateFormat" : "1", fallbackDateFormats="[0, 10]" } }

   - If nothing else defines the TypeManager, it will use the TypeManagers.Integer class.

4) When writing javascript code to create the parameters, you don't need true Javascript Object Notation. 
   Ordinary objects will do. (When embedding parameters in an HTML tag's data property, you must use JSon.)
   When you do this, you can replace parameter values with javascript code that creates objects.
   In this example, typeManager is created from jTAC.create()
   and minimum/maximum use a Date object.

   $("DateTextBox1").rules("add", {
     required: true,
     datatypecheckcondition : { typeManager : jTAC.create("Date") }
     rangecondition : { typeManager : jTAC.create("Date"), 
                    minimum : new Date(2012, 0, 1), 
                    maximum : new Date(2012, 11, 31) }
   });

5) Do not specify the [elementId] property found on Conditions.
   The [elementId] is assigned automatically for you based on the id
   of the element being validated. 


Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
ALWAYS LOAD \jTAC\jquery-validate\ReplaceTokens PlugIn.js BEFORE THIS FILE IS LOADED
Connections.Base
Connections.BaseElement
Connections.FormElement
Conditions.Base and any Condition subclasses for which rules are used on the page
TypeManagers.Base and any TypeManager subclasses for which rules are used on the page

----------------------------------------------------------- */

if (!window.jTAC)
   throw new Error("window.jTAC not created.");

if (!window.jQuery || !$.validator)
   jTAC.error("Must load jquery and jquery-validate script files first.");

if ($.validator.replaceTokens === undefined) // !!replaceTokens is a proposed feature for jquery-validate
   jTAC.error("Must load /jTAC/jquery-validate/ReplaceTokens PlugIn.js script file before Rules.js.");

jTAC.require(["Connections.FormElement", "TypeManagers.Base", "Conditions.Base"]);

jTAC.jqueryValidate = ( function () {
   var unobtrusive = $.validator ? $.validator.unobtrusive : null;

   /*
   Creates a Condition object and prepares it with the connection
   property pointing to the element.
      element (DOM) - DOM element that is being validated
      condname (string) - if assigned, it is the name of the condition class
         or its short hand, as registerd with jTAC.define() or jTAC.defineAlias().
         If null, the param object must have a jtacClass property
         with this name.
      param (object) - json or native javascript object that identifies
         properties and associated values to update on the Condition object
         that is created. This is usually a jquery-validate Rules object
         like $(val).rules("add", { valuetocomparecondition : { this is param } })
         Also can specify true or null to indicate no additional json needed.
   Returns: the Condition object created.
   May thrown exceptions.
   */
   function createCondition(element, condname, param) {
      try
      {
         jTAC._internal.pushContext("jqueryValidate.createCondition()", condname);
         delete param["Condition"];   // a previously stored object
         var cond;
         if (typeof(param) == "function") {
            cond = param();
         }
         else if (typeof(param) == "object") {
            cond = jTAC.create(condname, param);
         }
         else if ((param === true) || (param == null)) {
            cond = jTAC.create(condname, null);
         }
         else 
            jTAC.error("Value for a condition function must be an object.");
         if (element && (cond.connection instanceof jTAC.Connections.BaseElement)) {
            cond.connection = jTAC.connectionResolver.create(element, cond.connection);
         }
         return cond;
      }
      finally {
         jTAC._internal.popContext();
      }

   }

   /*
   Used by individual jquery-validation methods.
      element (object) - the DOM element. Used by the condition's connection property.
      condname (string) - Name of the Condition class or an alias. 
      params (object) - json or traditional object where each property
            is the name of a property on the Condition object to be updated
            and its value is the value to assign to that property
            on the condition object. Names are case sensitive.
            When the condition uses a TypeManager, the user can specify
            the TypeManager's name or alias in the [datatype] property.
            Preregistered names: "Integer", "Float", "Currency", "Percent",
               "Date", "TimeOfDay", "DateTime", "Duration"
      The value of [this] is current jquery-validator object that invokes this call.
      The caller should have the correct object in its "this" variable.

   NOTE: This validation function does not use $.validate.optional(element) 
   which is common in jquery-validate functions.
   Conditions must determine if they include or exclude an unassigned value.
   The condition function also does not use the value parameter,
   electing to get the value through the connection objects. That allows
   getting the value in a native form (like a Date object) or at least
   cleaned up (such as a watermark removed).

   */
   function evaluate(element, condname, params) {
      try
      {
         jTAC._internal.pushContext("jqueryValidate.evaluate()", condname);

         if (params == null)
            jTAC.error("Params must be assigned.");
         if (!condname && params["jtacClass"]) {
            condname = params["jtacClass"];
         }
         delete params["jtacClass"]; // just in case it was added.

         var cond = params["Condition"];
         if (!cond) {
            cond = createCondition(element, condname, params);
            params["Condition"] = cond;   // share with other functions that will use it later (like getting error messages and replacing tokens)
         }
         if (!cond.canEvaluate.call(cond)) {
            return "dependency-mismatch";
         }

         var r = cond.evaluate.call(cond);
         if (r == -1) {
            return "dependency-mismatch";
         }
         return !!r; // r is either 1 or 0. Convert to boolean.
      }
      finally {
         jTAC._internal.popContext();
      }
   }


/*
Used by the onchange event of elements that are not directly validated
by jquery-validate's own event handlers to have them validate and update error messages.
*/
   function validate(validator, id)
   {
      try
      {
         jTAC._internal.pushContext("jqueryValidate.validate('" + id + "')");
         var el = $("#" + id);
         if (el.valid())   // since valid does not remove a resolve error, force it
            validator.defaultShowErrors();
      }
      finally {
         jTAC._internal.popContext();
      }
   }

   // ---- SETTING UP --------------------------------------------------
/*
The $(element).validate method is passed the options object
before it is used. This is the item to update those options with new defaults
where the user has not explicitly assigned a value.
This code replaces $(element).validate to assign new defaults and calls
the original value.
*/
   function defaultOptions() {
      var orig = $.prototype.validate;
      $.prototype.validate = function( options ) {
         if (this.length && options) {
         
            if (options.messagelabel === undefined) {
               options.messagelabel = "message-label";
            }
            if (options.labelErrorClass === undefined) {
               options.labelErrorClass = "label-validation-error";
            }
            if (options.containerErrorClass === undefined) {
               options.containerErrorClass = "container-validation-error";
            }
            if (options.messageErrorClass === undefined) {
               options.messageErrorClass = "message-validation-error"; 
            }
            if (options.messageValidClass === undefined) {
               options.messageValidClass = "message-validation-valid"; 
            }
            if (options.inputErrorClass === undefined) {
               options.inputErrorClass = options.errorClass ? options.errorClass : "input-validation-error";
            }
      // errorClass is used internally by jquery-validate to track which element is the error label
      // (in addition to being the class for the input element).
      // We've separated error label and input element through messageErrorClass and inputErrorClass.
      // Our highlight input code ignores options.errorClass.
      // However, we must still use it for the message's label because once that label is created,
      // each time its shown, $.validator.showLabel clears the class attribute before assigning errorClass.
      // We cannot control that. So options.errorClass must set the same value as in msesageErrorClass.
            options.errorClass = options.messageErrorClass;

            if (options.inputValidClass === undefined) {
               options.inputValidClass = options.validClass ? options.validClass : "input-validation-valid";
            }
            options.validClass = options.messageValidClass;  // same idea as setting errorClass to "errorowner"

            // when unobtrusive is installed, it always assigns errorPlacement. We are overriding its default.
            // If the user assigned options.errorPlacement, that value is reassigned to options.errorPlacementFallback
            if (unobtrusive || (options.errorPlacement === undefined)) {
               if (!unobtrusive && options.errorPlacement && !options.errorPlacementFallback) {
                  options.errorPlacementFallback = options.errorPlacement;
               }
               options.errorPlacement = $.proxy(onError, this[0]);   // this[0] is the form element
            }
            // when unobtrusive is installed, it always assigns success. We are overriding its default.
            // If the user assigned options.success, that value is reassigned to options.successFallback
            if (unobtrusive || (options.success === undefined)) {
               if (!unobtrusive && options.success && !options.successFallback) {
                  options.successFallback = options.success;
               }
               options.success = $.proxy(onSuccess, this[0]);   // this[0] is the form element
            }
   /* !!PENDING
            if (options.summaryErrorClass === undefined) {
               options.summaryErrorClass = "validation-summary-errors";
            }
            if (options.summaryValidClass === undefined) {
               options.summaryValidClass = "validation-summary-valid";
            }
            // when unobtrusive is installed, it always assigns success. We are overriding its default.
            // If the user assigned options.success, that value is reassigned to options.successFallback
            if (unobtrusive || (options.invalidHandler === undefined)) {
               if (!unobtrusive && options.invalidHandler && !options.invalidHandlerFallback) {
                  options.invalidHandlerFallback = options.invalidHandler;
               }
               options.invalidHandler = $.proxy(onErrors, this[0]);   // this[0] is the form element
            }
   */
         }

	      return orig.call(this, options);
      };
   }

   defaultOptions();

   /*
      Lets you modify options already defined on the form element.
      Usually used with unobtrusive validation, which has its own
      predefined list of options.

      See http://docs.jquery.com/Plugins/Validation/validate#toptions for options.

         formElement (jquery element) - a <form> element.
            If it does not have options assigned the newOptions will be
            used to define it and $.validate(options) will be called.
         newOptions (object) - properties to change in the options
            on the form. Each property name must match those 
            supported by validation options.
            Any property that should take a function reference can
            also take a string that is the name of a global function 
            (it is defined on the window object).
            That string will be converted to the function reference.
      Returns the combined options.

   */
   function mergeOptions(formElement, newOptions) {
   // properties that are actually functions.
   // NOTE: "success" can be either a string or function. If found on the window object, it is a function.
      var funcProps = ["submitHandler", "invalidHandler", "invalidHandlerFallback", "showErrors", "errorPlacement", "errorPlacementFallback", "success", "successFallback", "highlight", "unhighlight", "highlight1", "unhighlight1"];

      var validator = $.data(formElement[0], "validator");
      var options;
      if (validator && validator.settings) {
         options = validator.settings;
      }
      else {
         validator = formElement.validate({});    // initialize settings with empty object
         options = validator.settings;
      }

   // preprocess the newOptions collection
      var val = newOptions["success"] || newOptions["successFallback"];
      if (val) { // can be a function (as a string with a function name) or a string value (that isn't a function)
         // see if its a function on the window object. If not, remove it from funcProps so its not converted
         if (window[val] === undefined) {
            funcProps.splice(funcProps.indexOf("success"), 1);
         }
      }

      // transfer newOptions properties to options, converting function names to functions
      for (var propName in newOptions) {
         if (!propName)
            continue;
         var val = newOptions[propName];
         if ((funcProps.indexOf(propName) > -1) && (typeof val == "string")) { // it is a function name
            options[propName] = window[val]; // may return undefined
            if ((options[propName] == null) && window.console) {
               jTAC.warn("Validator options include the property [" + propName +
                  " = '" + val + "']. This value must match a globally declared function.", null, "jqueryValidate.MergeOptions");
            }
         }
         else {
            options[propName] = val;
         }
      }

      return options;
   }


   /*
   Adds the ability to let additional Connections fire the 
   jquery-validate valid() method on the original element
   after an onchange or onclick event. It does not try to handle
   onfocus, onblur, or onkeyup to avoid making things more complex.

      formselector - Anything that you can pass to $() to return
         an individual form element, such as "#Form1" or the DOM object.
   */
   function attachMultiConnections(formselector)
   {
      try
      {
         jTAC._internal.pushContext("jqueryValidate.attachMultiConnections()");

         var form = $(formselector);
         if (!form || !form.length)
            return;
         var validator = $.data(form[0], "validator");
         var rules = validator.settings.rules;

         $.each(rules, function (key, value) {
            if (!key) return;
            var el = document.getElementById(key); // see if exists in DOM
            if (!el) {
               el = document.getElementsByName(key);
               if (!el || !el.length) return;
               el = el[0];
            }
            $.each(value, function (childkey, paramcont) {
               if (childkey == "messages")
                  return;
               var condname = ruleNameMap[childkey];
               if (condname == null)
                  return;
               var srcId = el.id;
               var func = function (e) { validate(validator, srcId); };
               try {
                  var cond = createCondition(el, condname, 
                     paramcont.param ? paramcont.param : paramcont); // paramcont has 'param' property when not in unobtrusive mode. Its missing in unobtrusive mode.
                  if (paramcont.param)
                     paramcont.param["Condition"] = cond;   // save for later requests to avoid creating this object
                  // all connections are in a collection

                  var conns = [];
                  cond.collectConnections(conns);
                  for (var j = 0; j < conns.length; j++) { // skip the first as its already handled
                     if (conns[j] instanceof jTAC.Connections.BaseElement) {
                        if (j > 0) {  // j=0 is setup with the onchange event by jquery-validate
                           conns[j].addEventListener("onchange", func, "qvc" + el.id);
                        }
                        conns[j].addSupportEventListeners("onchange", func, "qvc" + el.id);  // allows the connection with a list of checkboxes/radios to be connected
                     }
                  }  // for j

               }
               catch (e) {  // in case there is no conversion
                  jTAC.warn("Exception occurred when checking element " + srcId
						       + ", check the '" + condname + "' method. Exception message: " + e.message);
               }
            });
         });
      }
      finally {
         jTAC._internal.popContext();
      }

   }


   /*
   Installs features for unobtrusive validation. This is called automatically
   on $(document).ready. It assumes jquery-validate-#.#.#.js has been loaded
   prior to this script file.
   It calls mergeOptions with the object from the form's
   data-val-options property.
   It also calls attachMultiConnections.
   If the order of loading has this run too late, call it explicitly prior to code that depends on it.
   */
   function installUnobtrusive() {
      if (runInstall)
         return;
      runInstall = true;
      try
      {
         jTAC._internal.pushContext("jqueryValidate.installUnobtrusive()");

         var forms = $("form");
         $.each(forms, function (key, form)  { 
               // override default validator options by defining data-val-options on the <form> element.
               form = $(form);
               var newOptions = form.data("val-options");
               if (newOptions) {
                  try {
                     if (typeof newOptions == "string")
                        newOptions = window.eval("(" + newOptions + ");");
                     mergeOptions(form, newOptions);
                  }
                  catch (e) {
                     jTAC.error("Could not parse the data-val-options attribute of form id [" + form.get()[0].id + "] Error info:" + e.toString());
                  }
               }
               attachMultiConnections(form); 
            }
         );
      }
      finally {
         jTAC._internal.popContext();
      }

   }
   var runInstall = false;
   if (unobtrusive) {
   // this array should hold function that will be invoked after unobtrusive validation has been setup.
   // For example, running jsunit tests.
   // To add, use jTAC.jqueryValidate.postInit.push(function)
      var postInit = [];
      
      unobtrusive.nativeParse = unobtrusive.parse;
      unobtrusive.parse = function(selector) {

         unobtrusive.nativeParse(selector);
         installUnobtrusive();
         for (var i = 0; i < postInit.length; i++) {
            postInit[i]();
         }
      }
/*
      $(document).ready(installUnobtrusive);
*/
   }




   /* --- CONVERTING CONDITIONS INTO VALIDATION RULES ------- */
   /*
   Master function to register rules based on available Condiiton classes.
   It locates all Condition classes that are defined in jTAC (and are not abstract).
   It calls useConditionAsRule for each, giving the rule name the class name.
   This will overwrite existing rules (required and range, specifically).
   This is called automatically as jTAC.jqueryValidate is initializing.
   */
   function registerConditionsAsRules() {
      try
      {
         jTAC._internal.pushContext("jqueryValidate.registerConditionsAsRules()");

         var defs = jTAC._internal.definitions;
         for (var fullClassName in defs) {
            var def = jTAC.getDefinition(fullClassName);
            if (def.inst instanceof jTAC.Conditions.Base) {
               if (!def.inst.$abstract) {
                  useConditionAsRule(def.inst.ruleName(), fullClassName);
               }
            }
         }  // for
      }
      finally {
         jTAC._internal.popContext();
      }

   }


   /* 
   The default error messages that will be registered with $.validator.addMethod.
   These values are normally populated by using the Condition's errorMessage property
   and the jTAC.translations system to localize them.
   */
   var defaultMessages = {};

   /* An array populated by useConditionAsRule that associates
   the rule name to the fulll class name used by the jTAC.createByClassName().
   Each element has a key with the rule name and value with the class lookup. */
   var ruleNameMap = [];


   /*
   Call to register any condition as a jquery-validate rule.
   It calls $.validator.addMethod.
   It also sets up the unobtrusive validation adapter for the function.
      ruleName (string) - the rule name, which becomes a property
         on $.validator. This is passed as the first param
         of addMessage().
      fullClassName (string) - The Condition's full class name.
      tokenfunc (function) - A function compatible with jquery-validate's
         replaceTokens functions. It takes 4 parameters (message, element, param, value) 
         and returns the updated message.
         If null, $.validator.defaultTokenReplacer is used.
   */
   function useConditionAsRule(ruleName, fullClassName)
   {
      ruleNameMap[ruleName] = fullClassName;

      var ruleFnc = function(value, element, params) {
         return evaluate.call(this, element, fullClassName, params);
      };

      var emFnc = function (ruleparms, element) {
         return retrieveErrorMessage(ruleName, ruleparms);
      }

      $.validator.addMethod(ruleName, ruleFnc, emFnc);
      if ($.validator.replaceTokens) {  
         $.validator.replaceTokens[ruleName] = replaceTokens;
      }
   // unobtrusive Adapter function that supports jquery-validate.
   // See http://bradwilson.typepad.com/blog/2010/10/mvc3-unobtrusive-validation.html
   //    options (object) - contains properties described in the above blog post
      if ($.validator.unobtrusive) {
         $.validator.unobtrusive.adapters.add(ruleName, ['json'],
            function (options) {
               try {
                  var obj = options.params.json ? eval("(" + options.params.json + ")") : {};   // convert from a string to actual json
//   The param node is important here. It is an object and therefore can be
//   expanded to host the Condition instance, which is needed by jTAC.
                  options.rules[ruleName] = {param: obj};

/*
                  options.rules[ruleName] = obj;
*/
               }
               catch (e) {
					   jTAC.error("Syntax error in data-val-" + ruleName + "-json attribute of the HTML element " + 
                     options.element.id + ". Error reported: " + e + " Attribute value: " + options.params.json.toString());
               }
               if (options.message) {
                  options.messages[ruleName] = options.message;
               }

            });
      } // if 
   }

/*
Function called from the error message function defined with 
the rule. That function takes different parameters from this one.
So the caller should use the parameters required by jquery-validate
and call this.
*/
   function retrieveErrorMessage(ruleName, param) {
      var cond = param["Condition"];
   // the user can overide the default condition by specifying a key
   // in the condition's lookupID property.
      var defmsg = defaultMessages[ruleName];
      if ( !defmsg ) {
         // if using localized strings, the current culture's strings are the defaults
         defmsg = defaultMessages[ruleName] = jTAC.translations.lookup(ruleName + "EM",  cond.defaultErrorMessage());
      }
      if (cond && cond.getLookupKey) {
         var key = cond.getLookupKey();
         if (key)
            defmsg = jTAC.translations.lookup(key, defmsg);
      }
      return defmsg;
   }

   /*
   Function that supports $.validator.replaceTokens. Used by
   useConditionAsRule for each Condition registered.
   param["Condition"] must contain the Condition object.
   */
   function replaceTokens(message, element, param, value) {
      try {
         var cond = param["Condition"]; // added by evaluate
         if (cond && cond.replaceTokens) {
		      var validator = $.data(element.form, 'validator');

            message = cond.replaceTokens.call(cond, message,
               { 
                  element: element, 
                  value: value, 
                  validator: validator, 
                  context: "html", 
                  messagelabel: validator.settings.messagelabel 
               });
         }
      }
      catch (e) {
         // usually means the methodname was not mapped to a Condition
	      jTAC.warn("Exception occurred replacing tokens in message \"" + message + "\" of element " + 
            (element ? element.id : "[unknown]") + " Exception: " + e.message, 
            null, "jqueryValidate.replaceTokens()");

      }
      return message;
   }

   registerConditionsAsRules();

/* ---- DISPLAY ERRORS ------------------------------------
These methods are extracted from jquery-validate-unobtrusive.js
for these reasons:
1. Give them to non-unobtrusive situations.
2. Enhance them 
--------------------------------------------------------- */

   /*
   Unobtrusive validation simplifies setting the placing the error message
   by setting options.errorPlacement to onError, which locates
   a container element with the [data-valmsg-for] attribute specifying
   the name of the input element.
   Users typically do this:
   <input type='text' id="textBox1" name="textBox1" 
   data-val="true" data-val-rulename="" />
   <span data-valmsg-for="textBox1" ></span>
   This feature is now available to non-unobtrusive validation
   and uses options properties to identify the style sheet:
   options.messageErrorClass
   options.messageValidClass
   Users can override these on individual error message containers
   with the data-jtac-errorclass attribute.
   <span data-valmsg-for="textBox1" data-jtac-errorclass="myclass" ></span>

   If there is no container element with data-valmsg-for, it falls back using
   either options.errorPlacementFallback (a function that is the same
   as options.errorPlacement) or inserting the label after the inputElement.
   */
   function onError(error, inputElement) {  // 'this' is the form element
      var validator = $.data(this, "validator");
      var options = validator.settings;
      var name = inputElement[0].name || inputElement[0].id;
      var container = $(this).find("[data-valmsg-for='" + name + "']");
      if (!container || !container.length) {
         error.removeClass(options.messageValidClass).addClass(options.messageErrorClass); // jquery-validate uses options.errorClass. We use that for the input only.

         if (options.errorPlacementFallback) {
            options.errorPlacementFallback.call(validator, error, inputElement);
         }
         else {
            error.insertAfter(inputElement);   // default rule
         }
         return;
      }

      // Adapted from jquery-validate.unobtrusive's onError function

      // Continue to use the error element as what is shown and hidden
      // The container is always present and has fixed style sheet class names as used here. 
      // Normally these class names do not have any styles and are used to 
      // prevent other styles that apply to SPAN tags from impacting the container.
      // However, these class names can be populated with styles with good reason.
      container.removeClass("field-validation-valid").addClass("field-validation-error");

      error.data("unobtrusiveContainer", container);

      var ec = $(container).data("jtac-errorclass");
      if (ec == null) { // ec == "" is used
         ec = options.messageErrorClass;
      }
      var vc = $(container).data("jtac-validclass");
      if (vc == null) { // vc == "" is used
         vc = options.messageValidClass;
      }

      error.removeClass(vc).addClass(ec);

      var replace = $.parseJSON(container.attr("data-valmsg-replace")) !== false;
      if (replace) {
         container.empty();
         error.appendTo(container);
      }
      else {
         error.hide();
      }
   }

   /*
   The reverse of onError. Based on the same-named method in jquery-validate-unobtrusive,
   this is called when the error is removed. It cleans up the error message label
   (which has already had its innerHTML set to "") by cleaning up the class on the label.
   This feature is now available to non-unobtrusive validation
   and uses options properties to identify the style sheet:
   options.messageErrorClass
   options.messageValidClass
   Users can override these on individual error message containers
   with the data-jtac-validclass attribute.
   <span data-valmsg-for="textBox1" data-jtac-validclass="myclass" ></span>

   If there is no container element with data-valmsg-for, it falls back using
   either options.successFallback (a property that is the same
   as options.success). It can be either a class name (string) or a function.
   */
   function onSuccess(error) {  // 'this' is the form element
      var validator = $.data(this, "validator");
      var options = validator.settings;

      var container = error.data("unobtrusiveContainer");
      if (!container || !container.length) {
         error.removeClass(options.messageErrorClass).addClass(options.messageValidClass);

         var fb = options.successFallback;
         if (fb != null) {
            if (typeof fb == "string") {
               label.addClass(fb)
            }
            else {
               fb.call(validator, error);
            }
         }
         return;
      }

      if (container) {
         var ec = $(container).data("jtac-errorclass");
         if (ec == null) { // ec == "" is used
            ec = options.messageErrorClass;
         }
         var vc = $(container).data("jtac-validclass");
         if (vc == null) { // vc == "" is used
            vc = options.messageValidClass;
         }

         container.removeClass("field-validation-error").addClass("field-validation-valid");

         error.removeData("unobtrusiveContainer");
         error.removeClass(ec).addClass(vc);

         var replace = $.parseJSON(container.attr("data-valmsg-replace"));
         if (replace) {
            container.empty();
         }
      }
   }
/* !!!PENDING
function onErrors(form, validator) {  // 'this' is the form element
   var validator = $.data(this, "validator");
   var options = validator.settings;
   var container = $(this).find("[data-valmsg-summary=true]");
   if (!container || !container.length) {
      if (options.invalidHandlertFallback) {
         options.invalidHandlerFallback.call(validator, form, validator);
      }
      return;
   }
   var list = container.find("ul");

   if (list && list.length && validator.errorList.length) {

      list.empty();
      var ec = $(container).data("jtac-errorclass") || options.summaryErrorClass;
      var vc = $(container).data("jtac-validclass") || options.summaryValidClass;
      container.addClass(ec).removeClass(vc);

      $.each(validator.errorList, function () {
            $("<li />").html(this.message).appendTo(list);
      });
   }
}
*/

/* ----- HILIGHT AND UNHILIGHT FIELD REPLACEMENT --------
jquery-validate provides highlight and unhighlight properties
on the options to the validate() method.
http://docs.jquery.com/Plugins/Validation/validate

The default method cannot handle some of the features introduced
by jTAC including:
- Supporting multiple input elements to highlight.
- Switching from the actual element to another element to highlight
   (important when validating the Calculations.Widget, which uses
   a hidden field, but could display the error case in
   its displayConnection element.)
- Updating the style of non-input fields nearby, such as a label
   or a div containing the element.

------------------------------------------------------ */


   /*
   Replacement for the $.validate.defaultShowErrors function
   that supports the alternative highlight features.
   The original is kept in the variable origDefaultShowErrors
   and is called to maintain the original behavior.
   */
   function defaultShowErrors() {
      function captureH(el, ec, vc) {
         if (!el || !el.id) {
            return;
         }
         if (elementsFound[el.id] == undefined) {
            elementsFound[el.id] = { valid: false, element: el };
         }
      }
      function captureU(el, ec, vc) {
         if (!el || !el.id) {
            return;
         }
         if ((elementsFound[el.id] == undefined) || elementsFound[el.id]) {  // invalid overrides valid.
            elementsFound[el.id] = { valid: true, element: el };
         }
      }
      try
      {
         jTAC._internal.pushContext("jqueryValidate.defaultShowErrors()");

      // this object will be populated with each id of an element found as the property name
      // and an object as the value of the property. That child object has these properties:
      //   valid (boolean) - the validity state
      //   element (object) - reference to the element whose state is changed.
      // After all elements are identified and validation is determined, each property
      // will be used to apply highlight or unhighlight to the element.
      // This object is populated by the captureH and captureU functions.
      // NOTE: This design allows rules that are native (non-jTAC) to identify themselves.

         var elementsFound = {};

         var options = this.settings;

         var svH = options.highlight;
         var svUH = options.unhighlight;
         try {
            options.highlight = captureH;
            options.unhighlight = captureU;

            origDefaultShowErrors.call(this);
         }
         finally {
            options.highlight = svH;
            options.unhighlight = svUH;
         }

         if (svH || svUH || options.labelErrorClass || options.containerErrorClass) {
            gatherElements(this, elementsFound); 
            if (svH || svUH) {
               hilightInputs(this, elementsFound);
            }
            hilightNearby(this, elementsFound);
         }
      }
      finally {
         jTAC._internal.popContext();
      }

   };


   var origDefaultShowErrors = $.validator.prototype.defaultShowErrors;
   $.validator.prototype.defaultShowErrors = defaultShowErrors;

   /*
   Populates elementsFound with any elements that are not already in the object,
   but are involved in validation. The validation rules here must use
   a Condition to have their elements added. Normally the first connection
   from the Condition is already in elementsFound. Any additional connections
   are collected here.

      validator - the jquery-validator object associated with a form.
      elementsFound - this object will be populated with each id of an element found as the property name
          and an object as the value of the property. That child object has these properties:
            valid (boolean) - the validity state
            element (object) - reference to the element whose state is changed.
   */
   function gatherElements(validator, elementsFound) {
      var rules = validator.settings.rules;

   // look for elements on Conditions that have not been included.
   // The Condition's [connections] list helps find them.
   // Any element not already in elementsFound is added using the validity
   // from the condition's [lastEvaluateResult].
      $.each(rules, function (key, value) {
         if (!key) {
            return;
         }

         $.each(value, function (childkey, paramcont) {
            if (childkey == "messages") {
               return;
            }
            var holder = paramcont.param || paramcont.params || paramcont;
            var cond = holder["Condition"]; // paramcont.params ? paramcont.params["Condition"] : (paramcont.param["Condition"] ? paramcont.param["Condition"] : paramcont["Condition"]);
            if (!cond) {
               return;
            }
            var last = cond.getLastEvaluateResult();
            if ((last == -1) || (last == null)) { // cannot evaluate or has yet to be evaluated can be skipped
               return;
            }

            try {
               var conns = [];
               cond.collectConnections(conns);
               for (var j = 0; j < conns.length; j++) {
                  var conn = conns[j];
                  if (conn instanceof jTAC.Connections.BaseElement) {
                     var el = conn.getElement();
                     if (!el || !el.id)
                        continue;
                     if ((elementsFound[el.id] === undefined) || elementsFound[el.id].valid)  // only change those that are unassigned or are still valid
                        elementsFound[el.id] = {valid: last == 1, element : el};
                  }
               }  // for j

            }
            catch (e) {  // in case there is no conversion
               jTAC.warn("Exception occurred when checking elements for the "
						    + key + "' rule. Exception: " + e.message, null, "jqueryValidate.gatherElements()");
            }
         });   // $.each
      });   // $.each
   }

   /*
   Highlights and unhighlights all elements within the elementsFound object.
   This is designed to account for overlapping validators on a field, where one is valid
   and another is not. It does this by having ALL elements that are validated
   in the elementsFound collection. That collection knows the validity of each element.
   This works together with the defaultShowErrors() function.

   Errors are shown by style sheets in options.inputErrorClass. The element can override
   this value by specifying the new class in its data-jtac-errorclass.

      validator - the jquery-validator object associated with a form.
      elementsFound - Collection already populated with properties hosting
         objects that contain each element and its validity.
   */
   function hilightInputs(validator, elementsFound) {
      var options = validator.settings;

      for (var propName in elementsFound) {
         var r = elementsFound[propName];
         var fnc = r.valid ? options.unhighlight : options.highlight;

         if (fnc) {
            var ec = $(r.element).data("jtac-errorclass");
            if (ec == null) { // ec == "" is used
               ec = options.inputErrorClass;
            }
            var vc = $(r.element).data("jtac-validclass");
            if (vc == null) { // vc == "" is used
               vc = options.inputValidClass;
            }

            fnc.call(validator, r.element, ec, vc);
         }
      }  // for
   }

   /*
   Highlights and unhighlights all elements nearby the elements that were validated.
   It adds the class identified by the options.labelErrorClass to
   label or span elements associated with an invalid input.
   It adds the class identified by the options.containerErrorClass to
   any other element that has an innerHTML, such as div and table cell.
   Alternatively, any element with the data-jtac-errorclass attribute
   defines its own class to add, overriding the option value.
   options.labelErrorClass defaults to "label-validation-error".
   options.containerErrorClass defaults to "container-validation-error".

   HTML label elements automatically include themselves in the list to highlight.
   Any thing else needs the data-jtac-valinputs attribute to specify
   a list of inputs they support or if assigned to the empty string,
   those inputs it contains in its innerHTML.

      validator - the jquery-validator object associated with a form.
      elementsFound - Collection already populated with properties hosting
         objects that contain each element and its validity.
   */
   function hilightNearby(validator, elementsFound) {
      var options = validator.settings;
      if (options.labelErrorClass === undefined) {
         options.labelErrorClass = "label-validation-error";
      }
      if (options.containerErrorClass === undefined) {
         options.containerErrorClass = "container-validation-error";
      }
      if (!options.labelErrorClass && !options.containerErrorClass)
         return;

      if (!options.cssNearby) {
         options.cssNearby = defaultCssNearby;
      }

      var labels = $("Label");
      $.each(labels, function(key, value) {
         var id = value.htmlFor;
         if (id && elementsFound[id] && !value.getAttribute("generated")) {
            options.cssNearby.call(this, value, options.labelErrorClass, elementsFound[id].valid);
         }
      });

      var containers = $("[data-jtac-valinputs]");
      $.each(containers, function (key, value) {
         var ids = $(value).data("jtac-valinputs");
         if (ids == null)
            return;
         if (ids == "") {  
            // search up the HTML tree from each input to this container.
            // If found, apply its style.
            for (var propName in elementsFound) {
               var r = elementsFound[propName];
               var p = r.element.parentNode;
               while (p && (p.tagName != "FORM")) {
                  if (p == value) {   // found it
                     options.cssNearby.call(this, value, options.containerErrorClass, r.valid);
                     break;
                  }
                  p = p.parentNode;
               }  // while
            }  // for
         } 
         else { 
         // a pipe delimited list of ids to inputs that have validators
            ids = ids.split("|");
            for (var i = 0; i < ids.length; i++) {
               var id = ids[i];
               if (id && elementsFound[id]) {
                  options.cssNearby.call(this, value, options.containerErrorClass, elementsFound[id].valid);
               }
            }
         }
      });

   }

   /*
   Default function to update the css of elements nearby
   inputs that have been validated.
   Override by using options.cssNearby = function with the same parameters.
   */
   function defaultCssNearby(elToUpdate, css, isValid) {
      var elToUpdate = $(elToUpdate);
      var local = elToUpdate.data("jtac-errorclass");
      if (local) {
         css = local;
      }
      if (css == null)
         return;

      if (isValid) {
         elToUpdate.removeClass(css);
      }
      else {
         elToUpdate.addClass(css);
      }

   }


/* ---- MAKE PUBLIC MEMBERS ------------------------------------- */

   var publics = {
      createCondition: createCondition,
      evaluate: evaluate,
      validate: validate,
      attachMultiConnections: attachMultiConnections,
      installUnobtrusive: installUnobtrusive,
      mergeOptions : mergeOptions,
      postInit : postInit
   };

//   staticMethods.extend( staticMethods, publics );

   // slightly expose privates mostly for the benefit of unit testing.
   // However, these values are usable elsewhere if needed.
   publics._internal = {
      useConditionAsRule: useConditionAsRule
   };

   return publics;

} () );




﻿// jTAC/Connections/BaseJQUIElement.js
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

﻿// jTAC/Connections/JQUIDatePicker.js
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
Class : Connections.JQUIDatePicker
Extends: Connections.BaseJQUIElement

Purpose:
Supports the jquery-ui datepicker widget.
The id is an HTML input field that has been attached to a datePicker object.
The element object is the jquery-UI object.

See \jTAC\Connections\Base.js for an overview of Connections.

Properties introduced by this class:

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Connections.Base

----------------------------------------------------------- */
jTAC._internal.temp._Connections_JQUIDatePicker = {
   extend: "Connections.BaseJQUIElement",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   /*
   Supports "date"
   */
   typeSupported : function (typeName) {
      return typeName == "date";
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
      var js = this.getElement();   // may throw exception
      if (js) {
         if (typeName && (typeName != "date"))
            this._error("The jquery element " + this.getId() + " does not support the type " + typeName, "getTypedValue");
   //      return js.datepicker("getDate"); // http://docs.jquery.com/UI/Datepicker#method-getDate

   /* While it would be better to use js.datepicker("getDate"),
   that method never looks at the text in the textbox. It gets the value
   from the calendar object.
   So the textbox can contain something different, and something illegal
   while the calendar does not.
   Since we must valid the textbox because it is actually passed to the server,
   this code ensures getting the actual date object based on the textbox.
   It is modeled after code in datepicker._setDateFromField().
   */
         var dp = $.datepicker;
		   var inst = dp._getInst(js[0]);
		   var dateFormat = dp._get(inst, 'dateFormat');
		   var dates = js.val();
		   var settings = dp._getFormatConfig(inst);
		   try  {
			   return dp.parseDate(dateFormat, dates, settings);
		   } 
         catch (event)  {
			   dp.log(event);
            throw event;   // indicate the error to the caller
		   }

      }
      return null;
   },

   /*
   Supports several input types, including HTML 5 types that return
   Date objects and numbers. See typeSupported() method for more.
   Unsupported cases throw an exception.
   */
   setTypedValue : function (value) {
      var js = this.getElement();   // may throw exception
      if (js) {

         if (value instanceof Date)
         {
            js.datepicker("setDate", value);  // http://docs.jquery.com/UI/Datepicker#method-setDate
         }
         else
            this._error("The HTML element " + this.getId() + " does not support the type of the value", "setTypedValue");
      }
   },

   /*
   HTML form elements are null when their value attribute is "".
   Respects the trim property.
      override (boolean) - Ignored here.
   */
   isNullValue : function (override) {
      return this.getTextValue() == "";
   },

   /*
   Checks the HTML element to confirm that it is supported.
   If not, it should throw an exception.
   */
   _checkElement : function(element) {
      this.callParent([element]);
      if (!this.testElement(element))
         this._error("Element must have a datepicker object.");
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
      if (window.$ && $.datepicker) {
         var el = (typeof id == "string") ? document.getElementById(id) : id;
         if (el) {
            if (el.jquery)
               el = el[0];

            return $.data(el, "datepicker") != null;
         }
      }
      return false;
   },

   /*
   Returns TypeManagers.Date. Supports these data attributes on the element:
   data-jtac-typemanager, data-jtac-datatype. See Connections.BaseElement.getTypeManager for details.
   */
   _createTypeManager : function (el) {
      if (!jTAC.isDefined("TypeManagers.Base"))
         this._error("Must load TypeManager scripts.");

      var tm = this.callParent();
      if (!tm)
         return jTAC.create(this._defaultTypeManager);
      return tm;
   },

/*
Specifies the class name or alias to a TypeManager that is created by 
_createTypeManager when data-jtac-datatype is not used.
*/
   _defaultTypeManager : "TypeManagers.Date"

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("Connections.JQUIDatePicker", jTAC._internal.temp._Connections_JQUIDatePicker);

jTAC.connectionResolver.register("Connections.JQUIDatePicker");
