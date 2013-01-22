// jTAC/jquery-ui widgets/calculator-unobtrusive.js
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
Provides unobtrusive javascript support for the calculator widget.

Establishing this ui widget:
1. Add both calculator.js and calculator-unobtrusive.js
   to the page. The act of adding this file automatically runs code to detect
   hidden fields with the data-jtac-calculator attribute assigned.

2. If you prefer to use the expression property (which parsers javascript-like syntax to build the calculation expression),
   add the /jTAC/Parser.js file.

3. Add a hidden input field for each calculation. Assign the id and name properties to the same value.
   This element will host the Calculations.Widget object and hold the current value.
   Its value can be used in a postback too.

4. Assign the attribute "data-jtac-calculator" to the hidden input.
   Its value should be an object with the same properties
   supported by the options of the calculator.
   At minimum, assign the calcItem property to the calculation rule.

   See jquery-ui-calculator.js for details on the options.

   <input type='hidden' id='calculator1' name='calculator'
      data-jtac-calculator='{"calcItem" : ["TextBox1", "TextBox2"], "displayElementId" : "Result"}' />
   <span id='Result'></span>

   Example when using the expression property:
   <input type='hidden' id='calculator1' name='calculator'
      data-jtac-calculator='{"expression" : '"TextBox1" + "TextBox2"', "displayElementId" : "Result"}' />
   <span id='Result'></span>



Required libraries:
ALWAYS LOAD jquery.#.#.#.js
ALWAYS LOAD jquery-ui-#.#.#.js
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
ALWAYS LOAD /jTAC/Calculations/CalcItem classes.js BEFORE THIS FILE IS LOADED
ALWAYS LOAD /jTAC/Calculations/CalcWidget.js BEFORE THIS FILE IS LOADED
ALWAYS LOAD /jTAC/TypeManagers/Base classes.js
ALWAYS LOAD /jTAC/TypeManagers/Numbers.js
When using CalcItems.Conditional, LOAD Conditions.Base AND other Condition classes.
jquery-ui widgets/calculator.js
------------------------------------------------------------*/


(function ($){
   function applyOne(idx, element) {
      element = $(element);
      var options = element.data("jtac-calculator");
      if (options) {
         element.data("calculator", null);
         try {
            if (typeof options == "string")
               options = window.eval("(" + options +");");
            element.calculator(options);
         }
         catch (e) {
            jTAC.error("Could not parse the data-jtac-calculator attribute of id [" + element.get()[0].id + "] Error info:" + e.toString());
         }
      }
   }

   function apply() {
      try {
         jTAC._internal.pushContext("calculator-unobtrusive.apply()");

         var elements = $("input[type=hidden]");
         elements.each(applyOne);
      }
      finally {
         jTAC._internal.popContext();
      }

   } // apply fnc

   if (!window.jTAC_CalculatorOptions)
      jTAC.error("Requires the calculator scripts.");

   $(document).ready(apply);

})(jQuery);

