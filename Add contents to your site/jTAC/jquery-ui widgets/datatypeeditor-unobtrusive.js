// jTAC/jquery-ui widgets/datatypeeditor-unobtrusive.js
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
Module: TypeManager objects

Purpose:
Extension for jquery-ui-datatypeeditor to support unobtrusive setup.


Establishing this ui widget:
1. Add an input field of type="text". Assign the id and name properties to the same value.

2. Add this attribute to the input field:
  
   data-jtac-datatype - Specifies TypeManager class to use.
      Its value must match a class name or alias.
      Usually the actual class name is registered, along with shorthands like:
      "Integer", "Float", "Currency", "Date", and "TimeOfDay". (There are many more.)

   <input type="text" id="id" name="name" data-jtac-datatype="Float" />

3. When using date or time TypeManagers, consider using a more powerful parser.
   The default parsers handle limited cases and are not very flexible with 
   the variety of user inputs that come to it.
   Use the TypeManagers.PowerDateParser and TypeManagers.PowerTimeParser classes
   to have a much richer data entry experience just by adding <script > tags
   to their script files:
   <script type='javascript/text' src='../jTAC/TypeManagers/PowerDateParser.js' ></script>
   <script type='javascript/text' src='../jTAC/TypeManagers/PowerTimeParser.js' ></script>

4. A TypeManager object has numerous properties to customize it. For example,
   TypeManagers.Date has a [dateFormat] property to adjust the format between short, abbrev and full.
   If you need to set any of these properties, add this attribute to the input field:
   
   data-jtac-typeManager - Specifies an object (JSon format recommended)
      whose properties override the defaults on the TypeManager created by data-jtac-datatype.

   TypeManagers have many useful properties. Here are some of the most useful:
   * cultureName (string) - sets the culture for formatting and parsing.
   * minValue and maxValue - When \jTAC\jquery-ui widgets\Command extensions.js are supported,
      these properties are available to define the limits of values commands can reach.
      When specified as strings, these must use the culture neutral format based on the datatype.
   * dateFormat and timeFormat - On date and time to adjust the parsing and formatting patterns.
   See the \jTAC\TypeManagers\ folder for details on individual classes.

   <input type="text" id="id" name="name" data-jtac-datatype="Float" 
      data-jtac-typeManager="{'cultureName': 'en-US', 'allowNegatives': false}" />

5. Add the script file \jTAC\jquery-ui widgets\datatypeeditor-unobtrusive.js in addition 
   to those listed below.

6. Add this attribute to the input field:
   
   data-jtac-datatypeeditor - Activates the datatypeeditor feature.
      This string specifies an object (JSon format recommended)
      with properties reflecting the options shown below. Only
      specify to override a default.
      If no options are needed, use the empty string.

   <input type="text" id="id" name="name" data-jtac-datatype="Date"
      data-jtac-datatypeeditor="{'checkPastes' : false}" />
   <input type="text" id="id" name="name" data-jtac-datatype="Float"
      data-jtac-datatypeeditor="" />


6. You still have to deal with the server side code that gets and sets the value
  of this input. That can be tricky because that code needs to convert
  between strings and native values. To simplify this, you can 
  add hidden input whose id is the dataTypeEditor's id + "_neutral".
  Use the value attribute of this hidden field to get and set the value.
  ALWAYS work with a string in the culture neutral format of the type.
  Formats include:
      Integers: [-]digits
      Float, Currency, Percent: [-]digits.digits  (always has at least one decimal place)
      Date: yyyy-MM-dd
      TimeOfDay and Duration: H:mm:ss
      DateTime: yyyy-MM-dd H:mm:ss
      DayMonth: MM-dd
      MonthYear: yyyy-MM

   <input type="text" id="id" name="name" data-jtac-datatype="Date"
      data-jtac-datatypeeditor="" />
   <input type="hidden" id="id_neutral" name="id_neutral" value="2000-05-31" />



Required libraries:
jquery.#.#.#.js
jquery-ui-#.#.#.js
jTAC.js
TypeManagers\Base.js and any TypeManager that you will use
Connections\Base.js
Connections\BaseElement.js
Connections\FormElement.js
jquery-ui widgets\datatypeeditor.js

------------------------------------------------------------*/

(function ($){
   function applyOne(idx, element) {
      element = $(element);
      var options = element.data("jtac-datatypeeditor");
      if (options != null) {
         element.data("datatypeeditor", null);
         try {
            if (options) {
               if (typeof options == "string")
                  options = window.eval("(" + options + ");");
               element.dataTypeEditor(options);
            }
            else
               element.dataTypeEditor();
         }
         catch (e) {
            jTAC.error("Could not parse the data-jtac-datatypeeditor attribute of id [" + element.get()[0].id + "] Error info:" + e.toString());
         }
      }
   }

   function apply() {
      try {
         jTAC._internal.pushContext("datatypeeditor-unobtrusive.apply()");

         var elements = $("input[type=text]");
         elements.each(applyOne);
      }
      finally {
         jTAC._internal.popContext();
      }

   } // apply fnc

   if (!window.jTAC_DataTypeEditorOptions)
      jTAC.error("Requires the datatypeeditor scripts.");

   $(document).ready(apply);

})(jQuery);
