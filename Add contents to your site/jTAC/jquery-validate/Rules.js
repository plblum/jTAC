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
(Copyright (c) 2006 - 2011 Jörn Zaefferer)
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




