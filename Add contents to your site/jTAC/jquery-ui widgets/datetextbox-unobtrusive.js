// jTAC/jquery-ui widgets/datetextbox-unobtrusive.js
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
Extension for datetextbox to support unobtrusive setup.


Establishing this ui widget
==============================
1. Add an input field of type="text". Assign the id and name properties to the same value.

   <input type="text" id="id" name="name" />

2. Add this attribute to the input field:

   data-jtac-datatype - Specifies TypeManager class to use. 
      Its value must be a class name or alias to a TypeManager class.
      Here are the recommended values:
         "Date" - Uses TypeManagers.Date in its default settings.
         "Date.Short" - Uses TypeManagers.Date in Short date format
         "Date.Abbrev" - Uses TypeManagers.Date in Abbreviated date format (dateFormat = 10)
         "Date.Long" - Uses TypeManagers.Date in Long date format (dateFormat = 20)

      You can create other names and register them with jTAC.define() or jTAC.defineAlias(), 
      so long as their TypeManager.getDataTypeName() == "date".

   <input type="text" id="id" name="name" data-jtac-datatype="Date.Abbrev" />

3. Consider using a more powerful parser.
   The default parser handles only the short date pattern and is not very flexible with 
   the variety of user inputs that come to it.
   Use the TypeManagers.PowerDateParser class to have a much richer data entry 
   experience just by adding <script> tags to its script file:
   <script type='javascript/text' src='../jTAC/TypeManagers/PowerDateParser.js' ></script>


4. A TypeManager object has numerous properties to customize it. For example,
   TypeManagers.Date has a DateFormat property to adjust the format between short, abbrev and full.
   If you need to set any of these properties, add this attribute to the input field:

   data-jtac-typeManager - Specifies an object (JSon format recommended)
      whose properties override the defaults on the TypeManager created by data-jtac-datatype.

   TypeManagers have many useful properties. Here are some of the most useful:
   * cultureName (string) - sets the culture for formatting and parsing.
   * minValue and maxValue - When \jTAC\jquery-ui widgets\command extensions.js are supported,
      these properties are available to define the limits of values commands can reach.
      When specified as strings, these must use the culture neutral format of "yyyy-MM-dd".
   See the \jTAC\TypeManagers\ folder for details on individual classes.

   <input type="text" id="id" name="name" data-jtac-datatype="Date.Abbrev" 
      data-jtac-typeManager="{'cultureName' : 'en-US', 'minValue' : "2012-01-01"}" />

5. Add the script file \jTAC\jquery-ui widgets\datetextbox-unobtrusive.js in addition 
   to those listed below.

6. Add this attribute to the input field:
   
   data-jtac-datetextbox - Activates the datetextbox feature.
      This string specifies an object (JSon format recommended)
      with properties reflecting the options shown below. Only
      specify to override a default.
      If no options are needed, use the empty string.

   <input type="text" id="id" name="name" data-jtac-datatype="Date.Abbrev"
      data-jtac-datetextbox="{'datepicker': { 'gotoCurrent' : true } }" />
   <input type="text" id="id" name="name" data-jtac-datatype="Date.Abbrev"
      data-jtac-datatextbox="" />

Required libraries:
jquery.#.#.#.js
jquery-ui-#.#.#.js
jTAC.js
TypeManagers\Base.js and any TypeManager that you will use
Connections\Base.js
Connections\BaseElement.js
Connections\FormElement.js
jquery-ui widgets\datatypeeditor.js
jquery-ui widgets\datetextbox.js

------------------------------------------------------------*/

(function ($)
{
   function applyOne(idx, element) {
      element = $(element);
      var options = element.data("jtac-datetextbox");
      if (options != null) {
         element.data("datetextbox", null);
         try {
            if (options) {
               options = window.eval("(" + options + ");");
               element.dateTextBox(options);
            }
            else {
               element.dateTextBox();
            }
         }
         catch (e) {
            jTAC.error("Could not parse the data-jtac-datetextbox attribute of id [" + element.get()[0].id + "] Error info:" + e.toString());
         }
      }
   }

   function apply() {
      try
      {
         jTAC._internal.pushContext("datetextbox-unobtrusive.apply()");

         var elements = $("input[type=text]");
         elements.each(applyOne);
      }
      finally {
         jTAC._internal.popContext();
      }

   } // apply fnc

   if (jTAC.TypeManagers.BaseDate)
   {
      if (!window.jTAC_DataTypeEditorOptions)
         jTAC.error("Requires the datatypeeditor scripts.");

      $(document).ready(apply);
   }
})(jQuery);
