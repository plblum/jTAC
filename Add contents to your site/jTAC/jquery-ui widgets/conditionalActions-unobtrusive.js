// jTAC/jquery-ui widgets/conditionalActions-unobtrusive.js
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
Provides unobtrusive javascript support for the conditionalActions widget.

Establishing this ui widget:
1. Use the instructions in /jTAC/jquery-ui widgets/conditionalActions.js as guide.
   This section will describe the changes to make.

2. Add both /jTAC/jquery-ui widgets/conditionalActions.js and 
   /jTAC/jquery-ui widgets/conditionalActions-unobtrusive.js   
   to the page.

3. Assign the attribute "data-jtac-conditionalActions" to an HTML element that 
   will have its appearance or state modified by the widget.
   Its value should be JSON describing the object with the same properties
   supported by the options of the conditionalActions.
   See jquery-ui-conditionalActions.js for details on the options.

   When defining a Condition or Action class in JavaScript, you have
   been instructed to use this syntax:
   value = jTAC.create("classname", {options});
   where {options} is a JavaScript object whose properties
   assign values to the same-named properties on the object created.

   Here we need to use JSON and JSON does not support calling functions
   like "jTAC.create". Instead, we create an object with a
   property called 'jtacClass' whose value is the class name.
   The remaining properties assign values to the same-named properties
   of the object created.

   For example:
   <input type='text' id='textbox1' name='textbox1'
      data-jtac-conditionalActions=
      '{
         "condition" : {"jtacClass": "Conditions.CompareToValue", "elementId": "checkBox1", "valueToCompare": true }, 
         "actions" : {"jtacClass": "jqActions.Visible", "effect" : "fade", "reverse": true}
      }' />

4. If you need to add more conditionalActions to the same HTML element,
   convert the string passed into data-jta-conditionalActions into an array
   of the options objects.

   data-jtac-conditionalActions=
      '[
         {"condition": {value}, "actions"=[{value}] }, 
         {"condition": {value}, "actions"=[{value}] }
      ]'

Required libraries:
ALWAYS LOAD jquery.#.#.#.js
ALWAYS LOAD jquery-ui-#.#.#.js
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
ALWAYS LOAD /jTAC/Conditions/Base.js
ALWAYS LOAD /jTAC/TypeManagers/Base.js
ALWAYS LOAD /jTAC/Connections/Base.js
ALWAYS LOAD /jTAC/jquery-ui widgets/conditionalActions.js
ALWAYS LOAD /jTAC/jquery-ui widgets/conditionalActions-unobtrusive.js
Load supporting Conditions, TypeManagers, and Connections.
------------------------------------------------------------*/

if (!window.jTAC_ConditionalActionsOptions)
   jTAC.error("Must load conditionalActions.js script file first.");
// NOTE: This if statement is to avoid javascript getting confused by
// the first ( character in (function($) below. If you precede it with
// a } character, javascript gets confused, thinking the below code is part
// of the same block. To avoid that, there is no } before it. Put some
// code in like above, or add a ; after the }.


(function ($){
   function applyOne(idx, element) {
      element = $(element);
      var options = element.data("jtac-conditionalActions");
      if (options) {
         try {
            if (typeof options == "string")
               options = window.eval("(" + options +");");
            element.ConditionalActions(options);   // attach to the widget
         }
         catch (e) {
            jTAC.error("Could not parse a data-jtac-conditionalActions attribute of id [" + element.get()[0].id + "] Error info:" + e.toString());
         }
      }
   }

   function apply() {
      try {
         jTAC._internal.pushContext("conditionalActions-unobtrusive.apply()");

         var elements = $("[data-jtac-conditionalActions]");
         elements.each(applyOne);
      }
      finally {
         jTAC._internal.popContext();
      }

   } // apply fnc

   if (!window.jTAC_ConditionalActionsOptions)
      jTAC.error("Requires the conditionalActions scripts.");

   $(document).ready(apply);

})(jQuery);

