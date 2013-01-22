// jTAC/jquery-ui widgets/ConditionalActions.js
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
Module: jquery-ui widgets

Purpose:
ConditionalActions is a jquery-ui widget that uses a Condition to determine
when to run one or more actions. It implements a classic pattern: the "if" statement
with one or more triggers that invoke it. The Condition is the boolean logic
of the if statement while the actions are the code to run based on the result
of the Condition. Triggers are click, change and keypress, events attached to other HTML 
elements.

Primarily actions change the appearance of HTML elements on the page, such as
visibility or a style.

The triggers are usually HTML elements whose data changes or that are clickable,
like checkboxes being toggled, textboxes whose text has changed, or a tabbed
interface where a tab is a <div> tag whose click event is the trigger.

This pattern is easy to create with jquery without using the ConditionalActions widget.
Here it is changing the visibility of a textbox based on a checkbox being clicked:

$("#CheckBox1").click(function (evt) {
   if ($("#CheckBox1").val() != "") {
      $("#TextBox1").show();
   }
   else {
      $("#TextBox1").hide();
   } 
});

Here it is using the widget. 
$("#TextBox1").ConditionalActions(
   {condition: jTAC.create("CompareToValue", {elementId: "CheckBox1", valueToCompare: true}),
    actions: jTAC.create("jqActions.Show")
});

Let's look through this example:
* Notice that the widget is attached to the element that will be changed (the textbox) 
  and the Condition evaluates the checkbox.

* The widget knows that the elementid value of the Condition is also the trigger and 
  even knows to use a click event because its a checkbox instead of a changed event.
  You can specify other triggers by adding a jquery object that specifies those triggers
  in the [triggers] property.

  This adds triggers for all radiobuttons with the name "Group" where the first is
  evaluated by the Condition.
      $("#TextBox1").ConditionalActions(
         {condition: jTAC.create("CompareToValue", {elementId: "Radio1", valueToCompare: true}),
          actions: jTAC.create("jqActions.Show"),
          triggers: $("input[name='group']:radio")
      });

* The Condition can be setup with a shorthand if you want to evaluate a checkbox,
   radiobutton or textbox for having a value or not, by specifying its element ID
   instead of a Condition object. This is the same as above.
      $("#TextBox1").ConditionalActions(
         {condition: "CheckBox1",
          actions: [jTAC.create("jqActions.Show")]
      });

* The Condition is actually optional. If you don't specify it, another popular
   pattern is created: the click, change, or keypress event handler firing
   some action.
      $("#TextBox1").ConditionalActions(
         {condition: jTAC.create("CompareToValue", {elementId: "Radio1", valueToCompare: true}),
          actions: [ 
            jTAC.create("jqActions.Disabled"), 
            jTAC.create("jqActions.ClassName", {className: "normal", classNameFailed: "dimmed"})
          ]
      });

* Each action is an object that inherits from jqActions.Base.

  jTAC provides a number of action classes.
   > jqActions.Show - Make the element's style visible or hidden, 
      optionally using animations like fade and slide.
   > jqActions.Enable - Set the disabled attribute to true or false where supported.
   > jqActions.ReadOnly - Set the readonly attribute to true or false where supported.
   > jqActions.ClassName - Add, remove, or replace the classname attribute's value.
   > jqActions.FieldValue - Set the value attribute on form fields.
   > jqActions.Href - Set the href or src attribute on img and a tags to a URL.
   > jqActions.Style - Change a style attribute.
   > jqActions.Attribute - Change any attribute on the element by specifying its name and the new value.
   > jqActions.UserFunction - Invoke a function that you attached to its [fnc] property.
   See \jTAC\jquery-ui widgets\jqActions\Base.js for details on Actions.

* A Condition's evaluate() method returns one of three values: "success", "failed",
  or "cannot evaluate". Each Action object runs different code based on the result of the condition.
  For example, jqActions.Show uses $().show() when the condition evaluates as "success"
  and $().hide() when the condition evaluates as "failed".

  When evaluate() returns "cannot evaluate", the actions are not applied normally.
  But you can override this by using the [cannotEvalUses] property.

* Most Action classes have properties to customize their appearance. 
  You can see how the jqActions.ClassName class (shown above) 
  has properties that specify two class names.
  When you see "Failed" in a property name, it means its used when
  the condition evaluates as "failed" (effectively runs the action for the "else" clause).

* The [actions] property name is plural for a reason. It can host an array
  of actions allowing you to do multiple things.
      $("#TextBox1").ConditionalActions(
         {condition: jTAC.create("CompareToValue", {elementId: "Radio1", valueToCompare: true}),
          actions: [ 
            jTAC.create("jqActions.Disabled"), 
            jTAC.create("jqActions.ClassName", {className: "normal", classNameFailed: "dimmed"})
          ]
      });

* There are other options. See the Options section below.


Establishing this ui widget:
NOTE: These instructions apply to the non-unobtrusive approach only.
Please see conditionalActions-unobtrusive.js if using the unobtrusive approach.

The SHORT VERSION:
1. Add script files
2. Add $("#elementid").ConditionalActions(options) to the element to change,
   passing in an object with options defined below under "Options".

Step-by-step:

1. Add these scripts:
   jquery.#.#.#.js
   jquery-ui-#.#.#.js
   /JTAC/jTAC.js
   /jTAC/TypeManagers/Base.js
   /jTAC/Connections/Base.js
   /jTAC/Conditions/Base.js
   /jTAC/jquery-ui widgets/conditionalActions.js
   /jTAC/jquery-ui widgets/jqActions/Base.js

2. Create a JavaScript function that will run after all HTML is setup such as through
   $(document).ready(function() { your code });

3. Create the [options] object in your new function. 
   Options can use the class jTAC_ConditionalActionOptions as a template
   or just an ordinary javascript object.
   NOTE: Visual Studio 2010+ users will have intellisense support when setting up
   properties when using jTAC_ConditionalActionOptions.

   var options = new jTAC_ConditionalActionOptions();

4. Identify these HTML elements on the page.
   * The element whose appearance or state will change.
     This is the element that will be attached to the conditionalActions widget.
     If you have additional elements to change based on the same Condition
     and get the same actions, they can be defined in the [elementsToChange] property
     of the [options] object.
   * The elements whose data values are evaluated by the Condition.
   * All elements identified by Conditions will become triggers.
     If there are more elements to use a triggers, they can be defined
     in the [triggers] property of the [options] object.

5. Create the condition and assign it to the [options.conditions] property. 
   It will be a class inheriting from jTAC.Conditions.Base.
   Use this pattern:
   options.condition = new jTAC.create('[classname]', {properties});
   
   Example:
   options.condition = new jTAC.create('Conditions.CompareToValue', {elementId: 'checkBox1', valueToCompare: true});

   There are two shortcut cases:
   * If using a checkbox or radiobutton whose checked state is the only thing evaluated by the Condition,
     just assign [options.condition] to the HTML elementID of the checkbox or radiobutton. 
     It knows to create the Conditions.CompareToValue condition.
     options.condition = "checkBox1";

   * If using a single textbox or list and its value is evaluated as either blank or assigned,
     just assign [options.condition] to the HTML elementID of the textbox or list. 
     It knows to create the Conditions.Required condition.
     options.condition = "textBox1";

   NOTE: The Condition is optional. If omitted, you must setup the [options.triggers] property
   and the actions will only run their "onsuccess" functions.

5b. Add script files that support the Condition you have selected. There are often
   base classes and classes for TypeManagers and Connections needed.

6. Create the actions and assign them to the [options.actions] property. 
   You can have one or more.

   Actions are objects that inherit from jqActions.Base. These classes are defined in the 
   \jTAC\jquery-ui widgets\jqActions\ folder.

   If none of the Action classes suit your needs, you can hookup a function where you do 
   the work to the [options.actionFnc] property.

   Here are several ways to define the action:
   * Create an instance of the object:
     options.actions = new jTAC.create("[classname]", {property:value, property2:value, etc});

     Example:
     options.actions = new jTAC.create("jqActions.Show", {effect: 'fade', reverse: true});

   * If you don't need to assign any properties, you can just define the action
     by using its class name:
     options.actions = "[classname]";
     Example:
     options.actions = "jqActions.Show";

   * If you have a single action, assign its object to the [options.actions] property.
     options.actions = action;

   * If you have several actions, assign an array of Action objects to the [options.actions] property.
     options.actions = [action1, action2];
     
6b. Add script files for each Action class used.

7. Define the conditionalActions widget attached to the element that will be changed
   by the actions. Pass in the [options] object.
   
   Its syntax is:
   $("#elementid").ConditionalActions(options);

   Example:
      var options = new jTAC_ConditionalActionsOptions();
      options.condition = new jTAC.create('Conditions.CompareToValue', {elementId: 'checkBox1', valueToCompare: true});
      options.actions = ['jqActions.Show'];
      $("#textbox1").ConditionalActions(options);

   Feel free to consolidate it all into one statement without defining the jTAC_ConditionalActionsObject:
      $("#textbox1").ConditionalActions(
         {  condition: new jTAC.create('Conditions.CompareToValue', {elementId: 'checkBox1', valueToCompare: true}), 
            actions: ["jqActions.Show"]
         });


8. Sometimes you need several ConditionalActions widgets on a single HTML element
   because there are differences in Conditions and Actions.
   jquery-ui does not permit multiple ui widgets of the same class on a single HTML element.
   Instead, create an array of options and pass them into the widget:

      $("#elementid").ConditionalActions([options, options2]);

      In this example, there are two checkboxes. Each has its own action. Checkbox1 changes the disabled attribute
      while Checkbox2 changes the background-color style between blue and green.

      $("#textbox1").ConditionalActions(
      [
         {condition: new jTAC.create('Conditions.CompareToValue', {elementId: 'checkBox1', valueToCompare: true}), 
          actions: ["jqActions.Enable"]},
         {condition: new jTAC.create('Conditions.CompareToValue', {elementId: 'checkBox2', valueToCompare: true}), 
          actions: [new jTAC.create("jqActions.Style", {attrStyle: 'background-color', value: 'green', valueFailed: 'blue'})]}
      ]);


Options:
   condition (Conditions.Base subclass) -
      The Condition that will be run to determine whether the action
      runs its onsuccess() or onfailed() method.

      Supported values:
      - A Conditions.Base subclass fully setup, including its elementID specifying the element to evaluate.
      - A JSON string with the 'jtacClass' property identifying the class name of the Condition
         and remaining properties are to set same-named properties on the Condition created.
      - A string with the element ID to evaluate. If the element is a checkbox or radiobutton,
         it will create a Conditions.CompareToValue condition with its valueToCompare=true
         (when the control is marked, it evaluates as "success").
         If the element is any other form element (input, textarea, select),
         it will create a Conditions.Required condition. When the element has text,
         it evaluates as "success".
      - A jquery object representing one HTML form element. Used to get the element ID
        and create conditions just like described above.
      - A Connections.BaseElement subclass representing one HTML form element.
        Used to get the element ID and create conditions just like described above.

      You can omit this property. Without a condition, the [triggers] property
      sets up click or change event handlers that always invoke the Action's onsuccess() function
      (or its onfailed() function when Action.reverse is true).

   triggers (jquery object) -
      A jquery object that is used to setup either click or change event handlers
      on the elements it refers to. When those elements invoke their click or changed
      event, it runs the full process: calls condition.evaluate() and then
      calls the run() method of each action with the result of evaluate().
      The HTML type of elements determines if a check or change event handler is setup.
      Those that have an onchange event will have it setup. The rest will have their onclick event setup.
      This list can be populated from elements identified in the Condition when [autotrigger] is true.

      Alternative values:
      - Assign a string that is jquery selector ID. See: http://api.jquery.com/category/selectors/
      - jTAC Connection.
      - Array of any of the supported types.
      If any are assigned, they replace the existing value and are 
      immediately converted to a jquery object.

   autoTrigger (boolean) - 
      When true, populate the [triggers] jquery object by looking through the Condition's Connections.
      If a Connection points to an HTML element, it is added.
      This always appends to [triggers] allowing a mixture of triggers from both those 
      preassigned and the condition.
      When null, it does the same as true if [triggers] is unassigned.
      It defaults to null.

   keypressTriggers (boolean) -
      When true, textbox inputs and textarea elements will include triggers
      using their keyPress event. This will let the action run on each keystroke.
      It defaults to true.

   actions (list of jqAction.Base) -
      An array of jqAction.Base objects. They are called in the order found.

      Alternative values:
      - A single jqAction. An array will be created to contain it when assigned.
      - JSON string describing a single jqAction, 
         with the 'jtacClass' property identifying the class name of the Action
         and remaining properties are to set same-named properties on the Action created.
      - JSON string describing an array of jqActions. It is basically:
         "[{action}, {action2}, ...]" where each action is JSON as described previously.

   actionFnc (function) -
      Adds to the actions list a function where you define how to handle the action.
      This is the same as adding a jqAction.UserFunction to the [actions] property,
      but simplifies the process since it's often used.
      Your function must have these parameters:
      * sender (the widget object)
      * elements - jquery object whose elements should be modified.
      * success (boolean) - when true, the condition evaluated as success.
         When false, the condition evaluated as failed.
      You can also assign a string that is the name of a function
      found on the window object. This simplifies unobtrusive setup.


   elementsToChange (jquery object) - 
      A jquery object describing all elements that will be modified by the Actions.
      This list is passed to the Action's run() method. (Individual actions
      can used a modified version of this list or even replace it based on their
      [selector] and [selectorMode] properties.)

      Alternative values:
      - Assign a string that is jquery selector ID. See: http://api.jquery.com/category/selectors/
      - jTAC Connection.
      - Array of any of the supported types.
      If any are assigned, they replace the existing value and are 
      immediately converted to a jquery object.
   
   autoElementToChange (boolean) -
      Determines if the element to which the widget is attached is 
      added to the elementsToChange collection automatically.
      It defaults to true.

   cannotEvalUses (integer) -
      When the condition.evaluate() method returns "cannot evaluate",
      this value is used to determine what to do. 
      When 1, use "success".
      When 0, use "failed".
      When -1, do nothing.
      It defaults to -1.

   runOnLoad (boolean) -
      When true, trigger/run the process after the widget is installed.
      When false, the elements to change remain unchanged until 
      a trigger is invoked.
      It defaults to true.

   depend (Conditions.Base subclass) - 
      An optional condition that when setup must evaluate as "success"
      before any Action's run() method will be invoked. 
      When its evaluate() method returns "failed" or "cannot evaluate",
      no actions are run.

Commands supported by $().conditionalActions("here"):
   "run" -
      Runs the same process as a trigger would: calls the condition's evaluate()
      method and passes its result to each Action.

Required libraries:
ALWAYS LOAD jquery.#.#.#.js
ALWAYS LOAD jquery-ui-#.#.#.js
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
ALWAYS LOAD /jTAC/Conditions/Base.js
ALWAYS LOAD /jTAC/TypeManagers/Base.js
ALWAYS LOAD /jTAC/Connections/Base.js
Load supporting Conditions, TypeManagers, and Connections.

------------------------------------------------------------*/
/* --- jquery-ui extension "ConditionalActions" ------------------------------
See documentation in the file header.
-----------------------------------------------------------------------*/
(function ($) {
   var ca = {
      options: new jTAC_ConditionalActionsOptions(),

      _create: function () {
         if (!window.jTAC)
            throw new Error("window.jTAC not created.");
         jTAC.require(["Conditions.Base", "Connections.Base", "TypeManagers.Base"]);

      },

      _init: function () {
         try {
            jTAC._internal.pushContext("ConditionalActions._init()");

            var that = this;
            var fullOpts = this.options;
            // the options should be an array of jTAC_ConditionalActionsOptions (or equivalents)
            // When passed through $(id).ConditionalActions([options, options2]) is a real array.
            // By jquery-ui converts it to an object with property names of "0", "1", etc.
         // Detect if its that converted object. If not, convert it into an array.
            if (fullOpts["0"] !== undefined) {
               // since its not an array, convert it back to an array
               var fixed = [];
               for (var pos = 0; true; pos++) {
                  var key = pos.toString();
                  var item = fullOpts[key];
                  if (item === undefined)
                     break;   //!done
                  fixed.push(item);
               }

               fullOpts = this.options = fixed;
            }
            else {
               fullOpts = this.options = [fullOpts]; // convert to array
            }
            for (var i = 0; i < fullOpts.length; i++) {
               this._prepOptions(fullOpts[i]);
               this._attachTriggers(fullOpts[i]);
            }
            this._inInit = true; // flag lets jqActions.Base.run() know its called from within _init in case it needs different behaviors.
            try {
               for (var i = 0; i < fullOpts.length; i++) {
                  var o = fullOpts[i]; 
                  if (o.runOnLoad) {
                     this._runOne(o);
                  }
               }
            }
            finally {
               this._inInit = false;
            }
         }
         finally {
            jTAC._internal.popContext();
         }

      },

      _prepOptions: function (o) {
         var that = this;

      // fix defaults for missing non-null properties
         if (o.runOnLoad === undefined) {
            o.runOnLoad = true;
         }
         if (o.autoElementToChange === undefined) {
            o.autoElementToChange = true;
         }
         if (o.cannotEvalUses === undefined) {
            o.cannotEvalUses = -1;
         }
         if (o.autoTrigger === undefined) {
            o.autoTrigger = null;
         }
         if (o.keypressTriggers === undefined) {
            o.keypressTriggers = true;
         }

         if (o.depend === undefined) {
            o.depend = null;
         }
         // Conditions may initially be a string or object identifying the HTML element ID
         // to use with a Conditions.Required or Conditions.ValueToCompare object.

         var cond = o.condition;
         if (cond) {
            var ceid = null;
            if (cond instanceof jTAC.Connections.BaseElement) {
               ceid = cond.getElement(false).id;
            }
            else if (cond instanceof jQuery) {
               if (cond.length)
                  ceid = cond.get()[0].id;
            }
            else if ((typeof cond == "string") && (cond.indexOf("{") == -1)) {   // a string without JSON is considered an ID
               ceid = cond;
            }

            if (ceid) {
               var condel = document.getElementById(ceid);
               if (!condel) {
                  jTAC.error("Option.condition specifies the id of element [" + ceid + "]. This element is not found.");
               }
               if ((condel.tagName == "INPUT") &&
                  /^(checkbox)|(radio)$/.test(condel.type)) {
                  cond = jTAC.create("Conditions.CompareToValue", {elementId: ceid, valueToCompare:true});
               }
               else {
                  cond = jTAC.create("Conditions.Required", {elementId: ceid});
               }

            }
            else { // did not convert an ID. Check for the usual: Condition object or JSON
               cond = jTAC.checkAsConditionOrNull(cond);
            }
         }
         o.condition = cond || null;

         var trig = o.triggers;
         if (trig) {
            trig = jTAC.checkAsJquery(trig);
         }
         if (cond && (o.autoTrigger || ((o.autoTrigger == null) && !trig))) {
            var list = [];
            o.condition.collectConnections(list);
            var t = jTAC.checkAsJquery(list);
            trig = trig ? trig.add(t) : t;
         }
         o.triggers = trig;

         var a = o.actions;
         var la = o.actions = [];
         if (a) {
            if (a instanceof Array) {
               for (var i = 0; i < a.length; i++) {
                  la.push(jTAC.checkAsAction(a[i]));
               }
            }
            else
               la.push(jTAC.checkAsAction(a));
         }
         if (o.actionFnc) {
            var a = jTAC.create("jqActions.UserFunction");
            a.fnc = jTAC.checkAsFunction(o.actionFnc);
            la.push(a);
         }
         var etc = o.elementsToChange;
         if (etc) {
            etc = jTAC.checkAsJquery(etc);
         }
         if (o.autoElementToChange) {
            if (etc) {
               etc = etc.add(this.element);
            }
            else {
               etc = this.element;
            }
         }
         o.elementsToChange = etc;
         
         for (var i = 0; i < la.length; i++) {
            la[i].prep(this, etc);
         }

         if (o.depend) {
            o.depend = jTAC.checkAsConditionOrNull(o.depend);
         }
      },


      _setOption: function (key, value) {
         $.Widget.prototype._setOption.apply(this, arguments);
      },

      /*
      Applies the Options.triggers fire either their onchange or onclick
      event to invoke the run() method.
      */
      _attachTriggers: function (o) {
         // at this point, o.triggers should contain a jquery object
         var that = this;
         o.triggers.each(function (elIdx, el) {
            var click = true;
            switch (el.tagName) {
               case "INPUT":
                  click = /^(checkbox)|(radio)$/.test(el.type);
                  break;
               case "TEXTAREA":
                  click = true;
                  break;
               case "SELECT":
                  click = true;
                  break;
            }
            if (click) {
               $(el).click(function (evt) {
                  that._runOne(o); 
               });
            }
            else {
               $(el).change(function (evt) {
                  that._runOne(o); 
               });
            }
            if (o.keypressTriggers) {
               var use = el.tagName == "TEXTAREA";
               if (!use && (el.tagName == "INPUT"))
                  use = !/^(checkbox)|(radio)|(button)|(submit)|(image)|(reset)|(range)$/.test(el.type);
               if (use) {
                  $(el).keyup( function ( evt ) {
                     that._runOne(o);
               });
               }
            }
         });
      },

   /*
   Calls the condition's evaluate() method and passes its result to each Action.
   This is invoked by the triggers and can be used as the "run" command
   in $(id).conditionalActions("run").
   Takes no action if the condition's canEvaluate() returns false.
   If the condition's evaluate() returns -1 ("cannot evaluate"),
   the action is run only when options.cannotEvalUses is 1 or 0.
   If the options is an array of options, this runs the options
   specified by the index position or the first if index=null.
   */
      run: function (index) {
         if (index == null)
            index = 0;
         this._runOne(this.options[index]);
      },

   /*
      For the "run2" command to run the 2nd options in the array
      through $(id).conditionalActions("run2").
   */
      run2: function () {
         this.run(1);
      },
   /*
      For the "run3" command to run the third options in the array
      through $(id).conditionalActions("run3").
   */
      run3: function () {
         this.run(2);
      },

   /*
      Same as run(), but runs all elements in the options array.
      Supported by the "runAll" command in 
      in $(id).conditionalActions("run").
   */
      runAll: function () {
         var o = this.options;
         for (var i = 0; i < o.length; i++) {
            this._runOne(o[i]);
         }
      },

   /*
   Called by run() to run for the option object passed in.
   */
      _runOne: function (o) {
         var that = this;
         if (o.actions) {
            if (o.depend) { 
               if (!o.depend.canEvaluate())
                  return;
               if (o.depend.evaluate() != 1)
                  return;
            }
            var result = -1;  // success=1, failed=0, cannot eval=-1
            if (o.condition) {
               if (!o.condition.canEvaluate())
                  return;
               result = o.condition.evaluate();
               if (result == -1)
                  result = o.cannotEvalUses;
            }
            else // no condition
               result = 1; //success
            if (result != -1) {
               var acts = o.actions;
               for (var i = 0; i < acts.length; i++) {
                  acts[i].run(this, o.elementsToChange, result != 0);
               }
            }
         }
      }

   }; // ca object
   $.widget("ui.ConditionalActions", ca);
})(jQuery);  



/* --- CLASS jTAC_ConditionalActionsOptions -------------------------------
Options object definition used by ConditionalActions.
-----------------------------------------------------------------------*/

function jTAC_ConditionalActionsOptions() {
}
jTAC_ConditionalActionsOptions.prototype = {
   /* Type: Conditions.Base object
      The Condition that will be run to determine whether the action
      runs its onsuccess() or onfailed() method.

      Supported values:
      - A Conditions.Base subclass fully setup, including its elementID specifying the element to evaluate.
      - A JSON string with the 'jtacClass' property identifying the class name of the Condition
         and remaining properties are to set same-named properties on the Condition created.
      - A string with the element ID to evaluate. If the element is a checkbox or radiobutton,
         it will create a Conditions.CompareToValue condition with its valueToCompare=true
         (when the control is marked, it evaluates as "success").
         If the element is any other form element (input, textarea, select),
         it will create a Conditions.Required condition. When the element has text,
         it evaluates as "success".
      - A jquery object representing one HTML form element. Used to get the element ID
        and create conditions just like described above.
      - A Connections.BaseElement subclass representing one HTML form element.
        Used to get the element ID and create conditions just like described above.

      You can omit this property. Without a condition, the [triggers] property
      sets up click or change event handlers that always invoke the Action's onsuccess() function
      (or its onfailed() function when Action.reverse is true).

   */
   condition : null,

   /* Type: jquery object
   A jquery object that is used to setup either click or change event handlers
   on the elements it refers to. When those elements invoke their click or changed
   event, it runs the full process: calls condition.Evaluate() and then
   calls the run() method of each action with the result of Evaluate().
   The HTML type of elements determines if a check or change event handler is setup.
   Those that have an onchange event will have it setup. The rest will have their onclick event setup.
   This list can be populated from elements identified in the Condition when [autotrigger] is true.

   Alternative values:
   - Assign a string that is jquery selector ID. See: http://api.jquery.com/category/selectors/
   - jTAC Connection.
   - Array of any of the supported types.
   If any are assigned, they replace the existing value and are 
   immediately be converted to a jquery object.
   */
   triggers : null,

   /* Type: Boolean
   When true, populate the [triggers] jquery object by looking through the Condition's ValueConnections.
   If a ValueConnection points to an HTML element, it is added.
   This always appends to [triggers] allowing a mixture of triggers from both those 
   preassigned and the condition.
   When null, it does the same as true if [triggers] is unassigned.
   It defaults to null.
   */
   autoTrigger: null,

   /* Type: Boolean
      When true, textbox inputs and textarea elements will include triggers
      using their keyPress event. This will let the action run on each keystroke.
      It defaults to true.
   */
   keypressTriggers: true,

   /* Type: array of jqAction.Base objects
   An array of jqAction.Base objects. They are called in the order found.

   Alternative values:
   - Assign to a function. It will create a jqAction.UserFunction action for this function.
   Your function must has these parameters:
   * sender (the widget object)
   * elements - jquery object whose elements should be modified.
   * success (boolean) - when true, the condition evaluated as success.
   When false, the condition evaluated as failed.
   - A single jqAction. An array will be created to contain it when assigned.
   - JSON string describing a single jqAction, 
   with the 'jtacClass' property identifying the class name of the Action
   and remaining properties are to set same-named properties on the Action created.
   - JSON string describing an array of jqActions. It is basically:
   "[{action}, {action2}, ...]" where each action is JSON as described previously.   
   */
   actions: null,


   /* Type: function
      Adds to the actions list a function where you define how to handle the action.
      This is the same as adding a jqAction.UserFunction to the [actions] property,
      but simplifies the process since its often used.
      Your function must has these parameters:
      * sender (the widget object)
      * elements - jquery object whose elements should be modified.
      * success (boolean) - when true, the condition evaluated as success.
         When false, the condition evaluated as failed.
      You can also assign a string that is the name of a function
      found on the window object. This simplifies unobtrusive setup.
   */
   actionFnc: null,

   /* Type: jquery object
   A jquery object describing all elements that will be modified by the Actions.
   This list is passed to the Action's run() method. (Individual actions
   can used a modified version of this list or even replace it based on their
   [selector] and [selectorMode] properties.)

   Alternative values:
   - Assign a string that is jquery selector ID. See: http://api.jquery.com/category/selectors/
   - jTAC Connection.
   - Array of any of the supported types.
   If any are assigned, they replace the existing value and are 
   immediately be converted to a jquery object.
   */
   elementsToChange: null,

   /* Type: Boolean
      Determines if the element to which the widget is attached is 
      added to the elementsToChange collection automatically.
      It defaults to true.
   */
   autoElementToChange: true,

   /* Type: Integer
      When the condition.evaluate() method returns "cannot evaluate",
      this value is used to determine what to do. 
      When 1, use "success".
      When 0, use "failed".
      When -1, do nothing.
      It defaults to -1.
   */
   cannotEvalUses: -1,

   /* Type: boolean
      When true, trigger/run the process after the widget is installed.
      When false, the elements to change remain unchanged until 
      a trigger is invoked.
      It defaults to true.
   */
   runOnLoad: true,

/* Type: Conditions.Base subclass
      An optional condition that when setup must evaluate as "success"
      before any Action's run() method will be invoked. 
      When its evaluate() method returns "failed" or "cannot evaluate",
      no actions are run.
*/
   depend: null

};

/*
Utility to convert a value into a jquery object.
It supports:
- Existing jquery object
- string representing a jquery selector string
- jTAC Connection object
- Array of any of the above
*/
jTAC.checkAsJquery = function(val) {
   if (val instanceof jQuery)
      return val;
   if (val instanceof Array) {
      var result = $();
      for (var i = 0; i < val.length; i++) {
         result = result.add(jTAC.checkAsJquery(val[i]));
      }
      return result;
   }
   if (val instanceof jTAC.Connections.BaseElement) {
      return $(val.getElement(true));
   }
   if (typeof val == "string") {
      return $(val);
   }
   if (val instanceof jTAC.Connections.Base) {
      return $(); // handle Connections are do not include elements
   }
   jTAC.error("Cannot convert to a jquery object");
}

