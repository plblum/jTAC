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
