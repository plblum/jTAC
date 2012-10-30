// jTAC/jquery-ui widgets/calculator.js
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
Module: Calculation objects

Purpose:
calculator is a jquery-ui widget that runs a calculation
based on the CalcItem objects. 
It is effectively a wrapper around Calculations.Widget (which does not use jquery).
So use the documentation in /jTAC/Calculations/Widget.js for an overview.

Establishing this ui widget:
1. Add a hidden input field. Assign the id and name properties to the same value.
   This element will host the Calculations.Widget object and hold the current value.
   Its value can be used in a postback too.

2. If working in code, use this to attach the calculator jquery-ui object to
   the hidden field.
   $("selector for the hidden field").calculator(options);
   The options reflect the properties shown below and are the same in the Calculations.Widget class.
   This code usually runs as the page loads, such as in $(document).ready.

3. If you want unobstrusive setup, add the [data-jtac-calculator] attribute to 
   the hidden field. Its value is a JSon description of the properties.

4. The jquery-validator library is supported against the hidden field.
   If you like, add unobtrusive validator rules to the hidden field.

Options:
   calcItem (CalcItem object) -
      The expression to calculate using CalcItem objects.
      calcItem hosts a single CalcItem object, which is the base of the calculation.
      Normally you will use a CalcItems.Group object here.
      If you don't assign it explicitly, a CalcItems.Group is created for you.
      You can either supply this as an instance of a CalcItem object,
      a JSon object that converts into a CalcItem (with the [jtacClass] property
      defined to specify the class name), or a shorthand notation
      that creates simple expressions.

   expression (string) -
      Alternative to setting the [calcItem] property by using a string that uses
      javascript syntax to describe the calculation.
      A parser converts the string into CalcItem objects, which then are assigned
      to the calcItem property.
      Requires /jTAC/Parser.js.
      Parsing syntax is described in each CalcItem object file.
      Note that parsing requires more resources, both in script files loaded
      and work to convert strings to CalcItem objects. If you prefer speed,
      use the [calcItem] property directly.

   calcOnInit (boolean) -
      When true, init() will run an initial calculation, updating the [displayConnection]
      for the user's benefit. It defaults to true.

   useChangeEvt (boolean) -
      When true, init() will attach [onchange] event handlers to the textboxes associated with the
      calculation, letting them run the calculation after the field is changed. 

   useKeyEvt (boolean) -
      When true, init() will attach [onkeydown] and [onkeyup] event handlers to the textboxes associated with the
      calculation, letting them run the calculation after the [onkeyup] event. It defaults to false.

   displayElementId (string) - 
      Assigns the ID of the element that will display the calculated value.
      Only setup if you want to display the value. It's common to avoid displaying
      the value, but still use the calculation to drive other calculations
      or be evaluated by a Condition object.

   displayConnection (Connection class) - 
      When [displayElementId] is object, it creates this object, a Connection object
      to the element that displays the calculated value.
      Generally you assign this when you need to define a different object or parameters
      than given you when [displayElementId] is setup.
      This Connection class should be compatible with the type of element it communicates with.
      Typical types: Connections.InnerHtml and Connections.FormElement.
      You can either supply this as an instance of a Connection class,
      or a JSon object that converts into a Connection class (with the [jtacClass] property
      defined to specify the class name).
      Once setup, you can use the members of the Connection class
      to interact with the element that displays the calculated value.

   displayTypeManager (TypeManager object) - 
      Defines how to format the string shown by [displayConnection].
      This value can be set by assigning the [displayDatatype] property too.
      If not assigned, it uses TypeManagers.Float.
      Avoid using TypeManagers that are not intended to handle numbers.

   displayDatatype (string) - 
      Alternative way to set the [displayTypeManager]. 
      Specify the class name or alias of a TypeManager.
      Avoid using TypeManagers that are not intended to handle numbers.
      Supported names include: "integer", "float", "currency", and "percent".

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
      
   preCalc (function) -
      Function is called prior to calculating. This function must be 
      compatible with jquery's bind() method which demands two parameters:
      event and ui. Both of those parameters will be passed as null to your [preCalc] function.
      If it returns false, the remainder of the calculation is skipped.

   postCalc (function) -
      Function is called after calculating, updating the hidden field value, and displaying the result
      with the [displayConnection].
      This function must be compatible with jquery's bind() method which demands two parameters:
      event and ui. Event will be null. ui will be an object with one property, [value],
      which holds the numeric value of the calculation, null, or NaN.
      It ignores the returned value.

   change (function) -
      Function is called after calculating when the calculated value has changed.
      The function result is ignored.
      This function must be compatible with jquery's bind() method which demands two parameters:
      event and ui. Event will be null. ui will be an object with one property, [value],
      which holds the numeric value of the calculation, null, or NaN.
      change = function(event, ui) { your code. ui.value is the value of the calculation. }.

Required libraries:
ALWAYS LOAD jquery.#.#.#.js
ALWAYS LOAD jquery-ui-#.#.#.js
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
ALWAYS LOAD /jTAC/Calculations/CalcItem classes.js BEFORE THIS FILE IS LOADED
ALWAYS LOAD /jTAC/Calculations/CalcWidget.js BEFORE THIS FILE IS LOADED
ALWAYS LOAD /jTAC/TypeManagers/Base classes.js
ALWAYS LOAD /jTAC/TypeManagers/Numbers.js
When using CalcItems.Conditional, LOAD Conditions.Base AND other Condition classes.

------------------------------------------------------------*/
/* --- jquery-ui extension "calculator" ------------------------------
See documentation in the file header.
-----------------------------------------------------------------------*/
(function($) {  
   var calc = {  
/*
The Calculations.Widget attached to the $element.
*/
      _calcWidget : null,
      options: new jTAC_CalculatorOptions(),

      _create: function() {
         if ( !window.jTAC )
            throw new Error( "window.jTAC not created." );
         jTAC.require(["CalcItems.Base", "Calculations.Widget", "TypeManagers.Float"]);

         var that = this;
         var cw = jTAC.create("Calculations.Widget");
         that._calcWidget = cw;
         cw.elementId = that.element.get()[0].id;  // connects the calcwidget to the hidden field

         cw.attachEvent("preCalc",function () {
            return that._trigger("preCalc", null, { });   // uses options.preCalc if setup
         });
         cw.attachEvent("postCalc",function (val) {
            return that._trigger("postCalc", null, { "value": val  });
         });
         cw.attachEvent("change",function (val) {
            that._trigger("change", null, { "value": val });
            // always returns undefined. This lets CalcWidgets._fireEvent to continue through multiple change events
         });

      },

      _init: function() {  
         try
         {
            jTAC._internal.pushContext("calculator._init()");

            var that = this;
            var o = this.options;

         // convert events that are string names into actual functions
            this._convertEvent("preCalc");
            this._convertEvent("postCalc");
            this._convertEvent("change");

         // populate cw from the options
            var cw = this._calcWidget;

            for (var key in o) {
               var val = o[key];
               if ((val != null) &&  // null indicates to use the default on Calculations.Widget
                   (cw[key] !== undefined) && // property must exist in the destination
                   (typeof (val) != "function")) {  // event handler functions are designed for jquery and not passed into the child
                  cw[key] = val;
               }
            }

            cw.ready();
         }
         finally {
            jTAC._internal.popContext();
         }

      },  

/*
Checks the options for the event name. If it is a string type,
it attempts to convert it into a function.
*/
      _convertEvent: function( evtName ) {
         var evt = this.options[evtName];
         if (evt) {
            if (typeof evt == "string") {
               evt = window[evt];
               if (!evt) {
                  jTAC.warn("Calculator [" + this.element.get()[0].id + "] options include [" + evtName + "]. This must be a globally defined function name to be used.");
                  evt = null;
               }
               this.options[evtName] = evt;
            }

         }
      },

      _setOption: function( key, value ) {
         $.Widget.prototype._setOption.apply( this, arguments );  
         var cw = this._calcWidget;
         switch (key) {
            case "calcItem":
               cw.calcItem = value;
               if (cw.calcOnInit && cw.canEvaluate()) {
                  cw.evaluate();
               }
               break;

            case "calcOnInit":   // a nifty way to invoke calculation on demand. Set calcOnInit to true after init.
               if (value) {
                  if (cw.canEvaluate()) {
                     cw.evaluate();
                  }
               }
               break;
            case "displayErrorClass":
               cw.displayErrorClass = value;
               break;
            case "displayNullClass":
               cw.displayNullClass = value;
               break;
            case "displayErrorText":
               cw.displayErrorText = value;
               break;
            case "displayNullText":
               cw.displayNullText = value;
               break;
            case "preCalc":
            case "postCalc":
            case "change":
               this._convertEvent(key);
               break;

            default:
               // the remaining properties cannot be changed after init.
               // They include displayConnection, displayElementId,
               // displayTypeManager, displayDataType,
               // useChangeEvt, and useKeyEvt.

         }  // switch
      }  // _setOption
   }; // calc object
   $.widget("ui.calculator", calc); 
})(jQuery);  



/* --- CLASS jTAC_CalculatorOptions -------------------------------
Options object definition used by calculator.

NOTE: All properties are set to null initially. If changed
from null, then they override the value in the Calculations.Widget.
-----------------------------------------------------------------------*/

function jTAC_CalculatorOptions() {
}
jTAC_CalculatorOptions.prototype = {
/* Type: function
   The expression to calculate.
   calcItem hosts a single CalcItem object, which is the base of the calculation.
   Normally you will use a CalcItems.Group here.
   If you don't assign it explicitly, a CalcItems.Group is created for you.
   You can either supply this as an instance of a CalcItem object,
   a JSon object that converts into a CalcItem object (with the [jtacClass] property
   defined to specify the class name), or a shorthand notation
   that creates simple expressions.
*/
   calcItem : null, // null indicates to use the default on Calculations.Widget

/*
   Type: string
      Alternative to setting the [calcItem] property by using a string that uses
      javascript syntax to describe the calculation.
      A parser converts the string into CalcItem objects, which then are assigned
      to the calcItem property.
      Requires /jTAC/Parser.js.
      Parsing syntax is described in each CalcItem object file.
      Note that parsing requires more resources, both in script files loaded
      and work to convert strings to CalcItem objects. If you prefer speed,
      use the [calcItem] property directly.
*/

   expression : null, // null indicates to use the default on Calculations.Widget


/* Type: boolean
   When true, init() will run an initial calculation, updating the [displayConnection]
   for the user's benefit. It defaults to true.
*/
   calcOnInit: null, // null indicates to use the default on Calculations.Widget

/* Type: boolean
   When true, init() will attach [onchange] event handlers to the textboxes associated with the
   calculation, letting them run the calculation after the field is changed. 
*/
   useChangeEvt: null, // null indicates to use the default on Calculations.Widget

/* Type: boolean
   When true, init() will attach [onkeydown] and [onkeyup] event handlers 
   to the textboxes associated with the calculation, 
   letting them run the calculation after the onkeyup event. 
   It defaults to false.
*/
   useKeyEvt: null, // null indicates to use the default on Calculations.Widget

/* Type: Connection object
   When [displayElementId] is assigned, it creates this object, a Connection object
   to the element that displays the calculated value.
   Generally you assign this when you need to define a different object or parameters
   than given you when [displayElementId] is setup.
   This Connection class should be compatible with the type of element it communicates with.
   Typical types: Connections.InnerHtml and Connections.FormElement.
   You can either supply this as an instance of a Connection object,
   or a JSon object that converts into a Connection class (with the [jtacClass] property
   defined to specify the class name).
   Once setup, you can use the members of the Connection class
   to interact with the element that displays the calculated value.
*/
   displayConnection : null, // null indicates to use the default on Calculations.Widget

/* Type: string
   Assigns the ID of the element that will display the calculated value.
   Only setup if you want to display the value. It's common to avoid displaying
   the value, but still use the calculation to drive other calculations
   or be evaluated by a Condition object.
*/
   displayElementId: null, // null indicates to use the default on Calculations.Widget

/* Type: TypeManager class
   Defines how to format the string shown by [displayConnection].
   This value can be set by assigning the [displayDatatype] property too.
   If not assigned, it uses TypeManagers.Float.
   Avoid using TypeManagers that are not intended to handle numbers.
*/
   displayTypeManager : null, // null indicates to use the default on Calculations.Widget

/* Type: string
   Alternative way to set the [displayTypeManager]. 
   Specify the class name or alias of a TypeManager class.
   Avoid using TypeManagers that are not intended to handle numbers.
   Supported names include: "integer", "float", "currency", and "percent".
*/
   displayDatatype: null, // null indicates to use the default on Calculations.Widget

/* Type: string
   When the calculation reports an error, this style sheet class is assigned
   to the [displayConnection] element.
   It defaults to "calcwidget-error".
*/
   displayErrorClass: null, // null indicates to use the default on Calculations.Widget

/* Type: string
   When the calculation has nothing to show, this style sheet class 
   is assigned to the [displayConnection] element.
   It defaults to "calcwidget-null".
*/
   displayNullClass: null, // null indicates to use the default on Calculations.Widget

/* Type: string
   When the calculation reports an error, this string is assigned
   to the [displayConnection] element.
   It defaults to "***".
*/
   displayErrorText: null, // null indicates to use the default on Calculations.Widget

/* Type: string
   When the calculation has nothing to show, this string is assigned
   to the [displayConnection] element.
   It defaults to "".
*/
   displayNullText: null, // null indicates to use the default on Calculations.Widget

/* Type: function
   Function is called prior to calculating. This function must be 
   compatible with jquery's bind() method which demands two parameters:
   event and ui. Both of those parameters will be passed as null to your [preCalc] function.
   If it returns false, the remainder of the calculation is skipped.
   preCalc = function(event, ui) { your code }.
*/
   preCalc : null,

/* Type: function
      Function is called after calculating, updating the hidden field value, 
      and displaying the result with the [displayConnection].
      This function must be compatible with jquery's bind() method which demands two parameters:
      event and ui. Event will be null. ui will be an object with one property, [value],
      which holds the numeric value of the calculation, null, or NaN.
      It ignores the returned value.
   postCalc = function(event, ui) { your code. ui.value is the value of the calculation. }.
*/
   postCalc : null,

/* Type: function
      Function is called after calculating when the calculated value has changed.
      The function result is ignored.
      This function must be compatible with jquery's bind() method which demands two parameters:
      event and ui. Event will be null. ui will be an object with one property, [value],
      which holds the numeric value of the calculation, null, or NaN.
      change = function(event, ui) { your code. ui.value is the value of the calculation. }.
*/
   change : null

};

