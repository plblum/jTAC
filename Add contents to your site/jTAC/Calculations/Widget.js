// jTAC/Calculations/Widget.js
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
Class : Calculations.Widget
Extends: None

Purpose:
Calculations.Widget is a UI interface element that runs a calculation
based on the CalcItem objects. It is always assigned to a hidden input field,
which can be defined by the user or created by the Widget. That hidden
field's value contains the current calculation value in neutral number format,
"NaN" if there is an illegal value, or the empty string if no calculation was run.

The Widget can output its value using any Connection object to specify the 
element to display it, and a TypeManager to format the value for that Connection.
Given the flexibility of Connection objects, the output can be to a textbox,
custom data entry widget or even an HTML element whose [innerHTML] property is updated.
(In this last case, use Calculations.WidgetConnection.)

Set up the calculation in the [calcItem] or [expression] property.
[calcItem] will host actual CalcItem objects while [expression] is a 
string with a calculation expression. See \jTAC\CalcItems\Base.js for documentation on both.

Assign the id of the hidden input in the [elementId] property. If this HTML element does not 
exist on the page, it wil be created in the first <form> tag. So if you want to 
locate it elsewhere, explicitly add the hidden input field.
This object will automatically attach itself to the [data-calcWidget] attribute of the hidden field.

Use the Calculations.WidgetConnection class as a Connection object for other jTAC
objects, such as to let a Condition object read its value from a calculation
instead of just an HTML field.

When creating a Calculations.Widget instance, its ready() method needs to run after 
you establish all properties. ready() establishes event handlers to the textboxes
that include values for it to calculation. It also runs an initial calculation
if [calcOnInit] is true.
So call it explicitly. 

Essential Methods:
   canEvaluate() - Returns true if the Calculation is enabled and ready to evaluate data.
      (Tests CalcItem.canEvaluate() on the calcItem property.
   evaluate() - Evaluates and returns a number or NaN.
   ready() - Call after properties have been established to attach
      eventhandlers to the textboxes and to run an initial calculation.
   attachEvent() - Attach an event handler function for the "change", "preCalc" and "postCalc" events.
      Details are below.

Essential properties:
   elementId (string) - 
      The id to the HTML hidden input field element to which this
      object is assigned. If this HTML element does not 
      exist on the page, it wil be created in the first <form> tag. So if you want to 
      locate it elsewhere, explicitly add the hidden input field.

   calcItem (CalcItem object) -
      The initial CalcItem object of the calculation.
      Normally you will use a CalcItems.Group object here.
      If you don't assign it explicitly, a CalcItems.Group object is created for you.

   expression (string) -
      Alternative to setting the [calcItem] property by using a string that uses
      JavaScript syntax to describe the calculation.
      A parser converts the string into CalcItem objects, which then are assigned
      to the [calcItem] property.
      Parsing syntax is described in each CalcItem script file.

   calcOnInit (boolean) -
      When true, ready() will run an initial calculation, updating the [displayConnection]
      for the user's benefit. It defaults to true.

   useChangeEvt (boolean) -
      When true, ready() will attach onchange event handlers to the textboxes associated with the
      calculation, letting them run the calculation after the field is changed. 

   useKeyEvt (boolean) -
      When true, ready() will attach onkeydown and onkeyup event handlers to the textboxes associated with the
      calculation, letting them run the calculation after the onkeyup event. It defaults to false.

   displayConnection (Connection object) - 
      When you want to display the value of the calculation, set this up, either here or
      with the [displayElementId] property.
      This Connection class should be compatible with the type of element it communicates with.

   displayElementId (string) - 
      Assigns the ID of the element that will display the calculated value.
      If [displayConnection] is not assigned, setting this will also define
      [displayConnection]. Otherwise, it just updates the id from displayConnection.

   displayTypeManager (TypeManager object) - 
      Defines how to format the string shown by [displayConnection].
      This value can be set by assigning the [displayDatatype] property too.
      If not assigned, it first checks the displayConnection for a TypeManager.
      If that doesn't work, it uses TypeManagers.Float.
      displayConnection will look for the [data-jtac.datatype] and [data-jtac.typemanager]
      attributes on the HTML element it points to.
      Avoid using TypeManagers that are not intended to handle numbers.

   displayDatatype (string) - 
      Alternative way to set the [displayTypeManager]. Specify the name of
      a TypeManager that was defined with jTAC.define() or jTAC.defineAlias().
      Avoid using TypeManagers that are not intended to handle numbers.
      Supported names include: "Integer", "Float", "Currency", and "Percent".

   displayErrorClass (string) -
      When the calculation reports an error, this style sheet class is assigned
      to the [displayConnection] element.
      It defaults to "calcwidget-error".

   displayNullClass (string) - 
      When the calculation has nothing to show, this style sheet class 
      is assigned to the [displayConnection] element.
      It defaults to "calcwidget-null".

   displayErrorText (string) - 
      When the calculation reports an error, this string is assigned
      to the [displayConnection] element.
      It defaults to "***".

   displayNullText (string) - 
      When the calculation has nothing to show, this string is assigned
      to the [displayConnection] element.
      It defaults to "".

Events:
   "preCalc" - Use attachEvent("preCalc", fnc) to attach your function.
      Function is called prior to calculating. It is the first action of the evaluate() method.
      The function is passed no parameters, but its [this] value is the Calculations.Widget event object.
      If the function returns false, it prevents the rest of evaluate() from running.
      Otherwise, the function result is ignored.

   "postCalc" - Use attachEvent("postCalc", fnc) to attach your function.
      Function is called after calculating, updating the hidden field value, and displaying the result
      with the [displayConnection]. It is the last action of the evaluate() method.
      The function is passed one parameter, the value returned by the calculation.
      Its [this] value is the Calculations.Widget event object.
      The function result is ignored.

   "change" - Use attachEvent("change", fnc) to attach your function.
      Function is called after calculating when the calculated value has changed.
      The function is passed one parameter, the value returned by the calculation.
      Its [this] value is the Calculations.Widget event object.
      The function result is ignored.
      


Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Connections.Base 
Connections.BaseElement 
Connections.FormElement
TypeManagers.Base 
TypeManagers.BaseGlobalize 
TypeManagers.BaseNumber 
TypeManager.Integer
CalcItems.Base 
CalcItems.Null 
CalcItems.NaN 
CalcItems.Number 
CalcItems.Group

If using the expression property, LOAD \jTAC\Parser.js too

----------------------------------------------------------- */
if (!window.jTAC)
   throw new Error("window.jTAC not created.");


jTAC._internal.temp._Calculations_Widget = {

   require: ["Connections.FormElement", "TypeManagers.Integer",
      "CalcItems.Null", "CalcItems.NaN", "CalcItems.Number", "CalcItems.Group"],

   constructor: function ( propertyVals ) {

      this._internal = {
         events: null,  // will hold an array. Use attachEvent
         readied: false,  // used by ready() method to ensure it runs only once
         eval: false, // Used by evaluate() to prevent recursive calls
         lastValue: null,   // The value from the previous evaluate() call. Used by the "change" event.
         lastDisplayTxt: null   // Used by the _keyDnEvt and keyUpEvt to detect changes after a character was edited.  

      }

   },

   config: {
      elementId: null,
      calcItem: "CalcItems.Group",
      expression: null,
      displayConnection: null,
      displayElementId: null,
      displayTypeManager: null,
      displayDatatype: null,
      displayErrorClass: "calcwidget-error",
      displayNullClass: "calcwidget-null",
      displayErrorText: "***",
      displayNullText: "",
      calcOnInit: true,
      useChangeEvt: true,
      useKeyEvt: false
   },

   configrules: {
      elementId: jTAC.checkAsStr,
      calcItem: jTAC.checkAsCalcItemOrNull,
      expression: jTAC.checkAsStrOrNull,
      displayConnection: jTAC.checkAsConnectionOrNull,
      displayTypeManager: jTAC.checkAsTypeManager
   },

   /* 
   Call after all properties have been setup to run the initial calculation
   and attach textbox's onchange events to the evaluation function.
   This is usually called automatically by document.onload.
   If you create the object after that action (including on an AJAX call),
   call this manually.
   */
   ready: function () {
      if (this._internal.readied)
         return;
      this._internal.readied = true;

      if (this.getCalcOnInit()) {
         if (this.canEvaluate()) {
            this.evaluate();
         }
      }

      if (this._needsEvts()) {
         var conns = [];
         this.getCalcItem().collectConnections(conns);
         for (var i = 0; i < conns.length; i++) {
            this._attachEvents(conns[i]);
         }
      }  // if

   },

   /*
   Call before evaluate() to determine if the calculation can be run.
   Returns true if it can. If false, don't call evaluate().
   */
   canEvaluate: function () {
      return this.getCalcItem().canEvaluate();
   },

   /*
   Runs the calculation. Then updates both the hidden field value
   and the display element, if defined.
   If it was an illegal value, it returns NaN. If there was nothing
   to calculate, it returns null. Otherwise it returns a number.
   Calls the preCalc, change, and postCalc event handlers. If preCalc returns false,
   this function returns null.
   */
   evaluate: function () {
      try
      {
         this._pushContext();

         var intnl = this._internal;
         if (this._fireEvent("preCalc", null) == false) {
            return null;
         }

         if (intnl.eval) {   // prevent recursion
            return null;
         }

         intnl.eval = true;
         try {
         
            var val = this.getCalcItem().evaluate();
            this._storeValue(val);
            this._displayValue(val);

         }
         finally {
            intnl.eval = false;
         }

         if (val != intnl.lastValue) {
            this._fireEvent("change", [val]);
         }
         intnl.lastValue = val;

         this._fireEvent("postCalc", [val]);
         return val;
      }
      finally {
         this._popContext();
      }

   },

   /*
   Writes the value to the hidden field specified by [elementId].
   Creates the hidden field if missing.
      val - The value to set. Must be either a number, NaN, or "".
      The hidden field's value will be a string with one of these values:
         number - using culture neutral formatted float.
         "NaN" - if there is an error to report.
         "" - if no calculated value to show.
   */
   _storeValue: function (val) {
      var hf = this._getHiddenFld();

      if (val == null) {
         val = "";
      }

      // valid values: "NaN", "", and number as a string.
      hf.value = isNaN(val) ? "NaN" : val.toString();
   },

   /*
   If the [displayConnection] is setup, this will update its text and style sheet class
   based on the value passed. If the value is a number, it uses the TypeManager
   to format it as a string.
   */
   _displayValue: function (val)
   {
      var conn = this.getDisplayConnection();
      if (!conn)
         return;

      // undo previous style sheet classes
      conn.removeClass(this.getDisplayNullClass());
      conn.removeClass(this.getDisplayErrorClass());
      if (typeof val == "number") {
         if (isNaN(val)) {
            this._displayError(conn);
         }
         else {
            var tm = this.getDisplayTypeManager();
            this._displayNumber(val, conn, tm);
         }
      }
      else {
         this._displayNull(conn);
      }
   },

   /*
   Used by _displayValue to setup the [displayConnection] to indicate an error.
   It uses the [displayErrorText] and [displayErrorClass] properties.
   */
   _displayError: function (conn) {
      conn.setTextValue(this.getDisplayErrorText());
      conn.addClass(this.getDisplayErrorClass());
   },

   /*
   Used by _displayValue to setup the [displayConnection] to indicate no value.
   It uses the [displayNullText] and [displayNullClass] properties.
   */
   _displayNull: function (conn) {
      conn.setTextValue(this.getDisplayNullText());
      conn.addClass(this.getDisplayNullClass());
   },

   /*
   Used by _displayValue to setup the [displayConnection] with the value
   formatted by the [displayTypeManager].
      val (number) - number to convert to a string and show.
      conn (Connection object) - connected element to update.
      tm (TypeManager object) - TypeManager defined 
         by the displayTypeManager property.
   */
   _displayNumber: function (val, conn, tm) {
      conn.setTextValue(tm.toString(val));
   },

   /*
   Returns the DOM element for the hidden field identified
   by the [elementId] property.
   Creates the hidden field in the first <form> if not found.
   Throws exception if the id is not found.
   */
   _getHiddenFld: function () {
      try
      {
         this._pushContext();

         var id = this.getElementId();
         if (!id)
            this._error("Must assign the elementId property.");
         var hf = document.getElementById(id);
         if (!hf) { // create a hidden field in the first form group
            hf = document.createElement("input");
            hf.id = id;
            hf.name = id;
            hf.type = "hidden";
            if (!document.forms.length)
               this._error("Must have a <form> tag.");
            document.forms[0].appendChild(hf);
         }

         if (!hf.calcWidget) {
            hf.calcWidget = this;
         }
         return hf;
      }
      finally {
         this._popContext();
      }

   },

   // --- EVENT HANDLERS -------------------------------------------------------
  
/*
Adds an event handler function.
   name (string) - the name of the event. Choose from "preCalc" and "postCalc" (case sensitive)
   fnc (function) - the function to call. Parameters and return value are specific
      to the event type.   

Supported event types:
   "preCalc" -
      Function is called prior to calculating. It is the first action of the evaluate() method.
      The function is passed no parameters, but its 'this' value is the Calculations.Widget event object.
      If the function returns false, it prevents the rest of evaluate() from running.
      Otherwise, the function result is ignored.
      If you need to establish stateful data that is shared between preCalc and postCalc,
      you can add a field to the Calculations.Widget object so long as the field name
      doesn't conflict with existing properties.

   "postCalc" -
      Function is called after calculating, updating the hidden field value, and displaying the result
      with the [displayConnection]. It is the last action of the evaluate() method.
      The function is passed one parameter, the value returned by the calculation.
      Its 'this' value is the Calculations.Widget event object.
      The function result is ignored.
      If you need to establish stateful data that is shared between preCalc and postCalc,
      you can add a field to the Calculations.Widget object so long as the field name
      doesn't conflict with existing properties.

   "change" - 
      Function is called after calculating when the calculated value has changed.
      The function is passed one parameter, the value returned by the calculation.
      Its 'this' value is the Calculations.Widget event object.
      The function result is ignored.
*/
   attachEvent: function(name, fnc) {
// an object where each property is 'name'
// and value is an array of functions.
      var e = this._internal.events;
      if (!e) {
         e = {};
         this._internal.events = e;
      }
      var l = e[name];
      if (!l) {
         l = [];
         e[name] = l;
      }
      l.push(fnc);

   },

/*
Removes an event handler function, or all functions for a given name.
   name (string) - The event type. Supported values: "change", "preCalc", "postCalc"
   fnc (function) - Must be the identical object for the function.
      If null, all events for the given name was deleted.
*/
   detachEvent: function(name, fnc) {
      var e = this._internal.events;
      if (!e)
         return;
      var l = e[name];
      if (l) {
         if (!fnc) {
            delete e[name];
         }
         else {
            var i = l.indexOf(fnc);
            if (i > -1)
            {
               l.splice(i, 1);
            }
         }
      }
   },

/*
   Invokes all event handlers for the given event type.
   However, if any event handler function returns a value,
   it stops and returns that value.
      name (string) - Event name to call
      options (array) - Null or an array of parameter values to pass.
*/
   _fireEvent: function(name, options) {
      try
      {
         this._pushContext();

         if (!this._internal.events) {
            return;
         }
         if (typeof options != "object") {
            options = [ options ];
         }
         var l = this._internal.events[name];
         if (l) {
            for (var i = 0; i < l.length; i++) {
               var r = l[i].apply(this, options);
               if (r !== undefined) { // any function that is defined is returned, stopping iterations.
                  return r;
               }
            }
         }
      }
      finally {
         this._popContext();
      }

   },

   /*
   Attached to the connection to handle its onchange event.
   When invoked, it runs evaluate to update the results.
   */
   _changeEvt: function (evt, conn) {
      if (this.canEvaluate())
         this.evaluate();
   },


   /*
   Attached to the connection to handle its onkeyup event.
   When invoked, it runs evaluate to update the results.
   */
   _keyUpEvt: function (evt, conn) {
      if (!conn || (this._internal.lastDisplayTxt == null)) {
         return;
      }
      if ((this._internal.lastDisplayTxt != conn.getTextValue()) && this.canEvaluate()) {
         this.evaluate();
      }
   },

   /*
   Attached to the connection to handle its onkeydown event.
   When invoked, it runs evaluate to update the results.
   */
   _keyDnEvt: function (evt, conn) {
      this._internal.lastDisplayTxt = conn ? conn.getTextValue() : null;
   },


/*
Return true if event handlers need to be setup. This is called to determine
if _attachEvents() should be called.
*/
   _needsEvts : function () {
      return this.getUseChangeEvt() || this.getUseKeyEvt();
   },

/* 
Attach event handlers to the connection object. Called only if
_needsEvts() returns true.
   conn (Connection object) - Call its addEventListener method.
*/
   _attachEvents : function(conn) {
      var that = this;
      if (this.getUseChangeEvt()) {
         conn.addEventListener("onchange", function (evt) { that._changeEvt.call(that, evt, conn);} );
      }
      if (this.getUseKeyEvt()) {
         conn.addEventListener("onkeydown", function (evt) { that._keyDnEvt.call(that, evt, conn);});
         conn.addEventListener("onkeyup", function (evt) { that._keyUpEvt.call(that, evt, conn);});
      }
   },

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/
   setElementId: function (val) {
      this.config.elementId = jTAC.checkAsStr(val);
      if (val) {
        // creates the hidden field if needed. Done here to ensure 
        // its on the page before calculations in case other features need to find it.
         this._getHiddenFld(); 
      }
   },

   setExpression: function (val) {
      try {
         this._pushContext(null, val != null ? val.toString() : "");
      
         var parser = jTAC.parser;
         if (!parser)
            this._error("Must load Parser.js");
         var r = jTAC.CalcItems.Base.prototype.calcexpr(jTAC.checkAsStr(val), parser, this);
         if (!r)
            parser.err(val, "syntax error", this);
         this.setCalcItem(r.ci);
         this.config.expression = val;
      }
      finally {
         this._popContext();
      }
   },

   getDisplayElementId: function () {
      var conn = this.getDisplayConnection();
      return conn && conn.getId ? conn.getId() : null;
   },

   setDisplayElementId: function (id) {
      var def = jTAC.create("Connections.FormElement", {id: id, allowNone: true});  
      var conn = jTAC.connectionResolver.create(id, def);   // may create a replacement connection
      this.config.displayConnection = conn ? conn : def;
   },

   getDisplayTypeManager: function () {
      try
      {
         this._pushContext();

         if (!this.config.displayTypeManager) {
            var tm;
            var conn = this.getDisplayConnection();
            if (conn) {
               tm = conn.getTypeManager();
            }
            if (!tm)
               tm = jTAC.create("TypeManagers.Float");
            this.config.displayTypeManager = tm;
         }
         return this.config.displayTypeManager;
      }
      finally {
         this._popContext();
      }

   },

   getDisplayDatatype: function () {
      return this.config.displayTypeManager ? this.config.displayTypeManager.dataTypeName() : null;
   },

   setDisplayDatatype: function (val) {
      this.setDisplayTypeManager(val);
   }

}
jTAC.define("Calculations.Widget", jTAC._internal.temp._Calculations_Widget);

