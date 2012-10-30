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

