// jTAC/jquery-ui widgets/datetextbox.js
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
datetextbox is a jquery-ui widget that incorporates the features of
two other jquery-ui elements into a textbox:
- datatypeeditor (from jTAC\jquery-ui widgets\datatypeeditor.js)
- jquery-ui-datepicker (from jquery-ui-#.#.#.js)

While you could attach both of these elements to a textbox yourself,
this widget simplifies the setup.
- Modifies the default options of the datepicker widget to make it
  work gracefully with the datatypeeditor. For example, while the datepicker is popped
  up, several keystroke commands of datatypeeditor need to be disabled.
- Defaults to a button to popup instead of focus, because the keyboard
  entry features of datatypeeditor are more often going to be used for fast entry
  than having to work through a calendar. (Focus first suggests that the user
  goes to the calendar for most entry.)
- Applies the localized jquery-globalize rules.


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

5a. If working in code, use this to attach the datetextbox jquery-ui widget to
   the input field.

   $("selector for the hidden field").dateTextBox(options);

   The options reflect the properties shown below.
   This code usually runs as the page loads, such as in $(document).ready.

5b. If you want unobtrusive setup, add this attribute to the input field:
   
   data-jtac-datetextbox - Activates the datetextbox feature.
      This string specifies an object (JSon format recommended)
      with properties reflecting the options shown below. 
      Only specify to override a default.
      If no options are needed, use the empty string.

   Also add the script file \jTAC\jquery-ui widgets\datetextbox-unobtrusive.js

   <input type="text" id="id" name="name" data-jtac-datatype="Date.Abbrev"
      data-jtac-datetextbox="{'checkPastes' : false, 'datepicker': { 'gotoCurrent' : true } }" />
   <input type="text" id="id" name="name" data-jtac-datatype="Date.Abbrev"
      data-jtac-datatextbox="" />

6. You still have to deal with the server side code that gets and sets the value
  of this input. That can be tricky because that code needs to convert
  between strings and native values. To simplify this, you can 
  add hidden input whose id is the dateTextBox's id + "_neutral".
  Use the value attribute of this hidden field to get and set the value.
  ALWAYS work with a string in the culture neutral format of the type
  which is: yyyy-MM-dd

   <input type="text" id="id" name="name" data-jtac-datatype="Date"
      data-jtac-datatypeeditor="" />
   <input type="hidden" id="id_neutral" name="id_neutral" value="2000-05-31" />


Options
=======================
These properties are defined on an object passed to the datetextbox steps 4a or 4b above.
NOTE: Most are the same as those for the datatypeeditor.

* datepicker (object) -
  An object that reflects the same properties as the options passed into the jquery-ui-datepicker.
  This object is passed to the datepicker as it is created.
  See http://docs.jquery.com/UI/Datepicker#options

* datatype (string) -
  Alternative to using the data-jtac-datatype attribute assigned to the textbox.
  Only used when that attribute is missing.

* typeManager (TypeManager object) -
  Used instead of the data-jtac-datatype and data-jtac-typemanager attributes on the textbox
  when assigned. It must host the TypeManager object,
  or a JavaScript object with properties to assign to the TypeManager identified
  by the datatype property.

* reformat (boolean) -
  When true, the onchange event will reformat the contents to match
  the most desirable format. Effectively, it uses the TypeManager's
  toValue then toString methods. Nothing happens if there is a formatting error.
  It defaults to true.

* initFromNeutral (boolean) -
  When true and using the culture neutral hidden field, always
  assign the textbox value by applying formatting from the TypeManager.
  When false and the textbox's value is "", it will also 
  assign the textbox value.
  This option lets external code assign the initial formatted value.
  It defaults to true.

* filterkeys (boolean) -
  When true, keystrokes are evaluated for valid characters.
  Invalid characters are filtered out. 
  This uses the TypeManager's isValidChar() method.
  When false, no keystroke filtering is supported.
  It defaults to true.

* checkPastes (boolean) -
  On browsers that support the onpaste event, this attempts to
  evaluate the text from the clipboard before it is pasted.
  It checks that each character is valid for the TypeManager.
  If any invalid character is found, the entire paste is blocked.
  It will also block pasting non-textual (including HTML) content.
  Supported browsers: IE, Safari, and Chrome.

* commandKeys (array) -
   An array of objects that map a keystroke to a command
   associated with the TypeManager's command feature.
   Requires loading \jTAC\jquery-ui widgets\Command extensions.js.
   When null, it uses the values supplied by the getCommandKeys() method
   on each TypeManager prototype.

   Each object in the array has these properties:
      action (string) - The TypeManager may supply an initial list of commands
         (date, time and numbers already do). As a result,
         this list is considered a way to modify the original list.
         "action" indicates how to use the values of the remaining properties.
         It has these values:
         "add" (or omit the action property) -
            adds the object to the end of the list.
         "clear" - remove the existing list. Use this to abandon
            items added by the TypeManager. Only use this as the first item 
            in commandKeys.
         "remove" - remove an item that exactly matches the remaining properties.
            If you want to replace an existing item, remove that item
            then add a new item.
     commandName (string) - The command name to invoke.
     keyCode - The keyCode to intercept. A keycode is a number
        returned by the DOM event object representing the key typed.
        It can also be a string with a single character.
        Common key codes:
           ENTER = 13, ESC = 27, PAGEUP = 33, PAGEDOWN = 35,
           HOME = 36, END = 35, LEFT = 37, RIGHT = 39,
           UP = 38, DOWN = 40, DELETE = 46
           F1 = 112 .. F10 = 122.
     shift - When true, requires the shift key pressed.
     ctrl - When true, requires the control key pressed.

  Commands are only invoked for keystrokes that are not considered valid by the TypeManager.
  For example, if you define the keycode for a letter and letters are valid characters,
  the command will not fire.
  As a result, map several key combinations to the same commandName.

  Assign to an empty array to avoid using commands.

* getCommandName (function) -
   A function hook used when evaluating a keystroke to see if it should 
   invoke a command. The function has these parameters:
      * evt - the jQuery event object to evaluate
      * cmdKeys - the commandKeys collection, which are described above.
      * tm - the TypeManager object associated with this datetextbox.

   Returns one of these values:
   * null - Continue processing the command.
   * commandName (string) - Use this command name to invoke the command.
   * "" (the empty string) - Stop processing this keystroke

* keyResult (function) -
   A function hook that is called after each keystroke is processed.
   It lets you know the result of the keystroke with one of these three states:
   valid, invalid, command.
   Use it to modify the user interface based on keystrokes. Its primary
   use is to change the UI when there is an invalid keystroke.
   If unassigned, it uses a default UI that changes the border using the style sheet
   class of the keyErrorClass property.
   If null, it is not used.
   This can be assigned as a string that reflects the name of a globally defined
   function too (for the benefit of JSon and unobtrusive setup).
   The function takes these parameters:
      * element - the jquery object for the textbox
      * event (the jquery event object) - Look at its keyCode for the keystroke typed.
      * result (string) - "valid", "invalid", "command"
      * options - the options object with user options.
   Returns nothing.

*  keyErrorClass (string) -
   The style sheet class added to the textbox when jTAC_DefaultKeyResult needs
   to show an error. Defaults to "key-error".

* keyErrorTime (int) -
   Number of milliseconds to show the keyErrorClass on the textbox after
   the user types an illegal key. Defaults to 200.


Options example using code:
$("#TextBox1").datetextbox({datatype : "Date.Abbrev", datepicker : {buttonImageUrl : "/Images/calendar.png"} });

Options example unobtrusive:
<input type="text" id="TextBox1" name="TextBox1" 
   data-jtac-datetextbox='{datatype : "Date.Abbrev", datepicker : {buttonImageUrl : "/Images/calendar.png"} }' />


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

/* --- jquery-ui extension "datetextbox" ------------------------------
See documentation in the file header.
-----------------------------------------------------------------------*/
(function($) {  
   var datetextbox = {  

/*
   Used by the datatypeeditor widget. Allows non-specified properties
   which includes the datepicker property that hosts an object
   passed to the datepicker widget.
*/
      options: new jTAC_DataTypeEditorOptions(),

      _create: function() {
         if ( !window.jTAC )
            throw new Error( "window.jTAC not created." );
         jTAC.require("Connections.FormElement", "TypeManagers.Date");
         if (!window.jTAC_DataTypeEditorOptions)
            jTAC.error("Requires the datatypeeditor scripts.");

      },

      _init: function() {
         try
         {
            jTAC._internal.pushContext("datetextbox._init()");

            var that = this;
            var textbox = this.element[0];
            if (!this.options.datatype && !this.element.data("jtac-datatype")) {
               this.options.datatype = "TypeManagers.Date"; // default TypeManagers.Date using DateFormat=0 (Short). This is overridden if the textbox has a data-jtac-datatype attribute.
            }

            // share the datatype on data-jtac-datatype if that attribute has not been setup
            if (!$.data(textbox, "jtac-datatype")) {
               textbox.setAttribute("data-jtac-datatype", this.options.datatype);   // not using $.data because this must become a real attribute of the element
            }

            if (!this.options.getCommandName) {
               this.options.getCommandName = function( evt, opt, tm ) {
                  if ($.datepicker._datepickerShowing)
                  {
                     return that._getCommandName(evt, opt, tm);
                  }
                  return null;
               };
            }


            this.element.dataTypeEditor(this.options);
            var dte = $.data(textbox, "dataTypeEditor");
            if (!dte) {
               return;
            }
            var tm = dte._tm;
            if (!tm || (tm.dataTypeName() != "date")) {
               return;  // don't setup the datepicker if we are not using a date object.
            }

            this._dte = dte;
            this._tm = tm;

            if (tm.installCmd) {
               tm.installCmd({commandName : "Calendar", func : function( args ) {
                  return that._popup.call(that, args);
               }, ignoreCurrent : true});
            }
         // create the options to be used by datepicker
            var dpopt = this.options.datepicker || {};
        //    if (!dpopt.buttonImage)
            dpopt.constrainInput = false; // because our datatypeeditor handles that
            if (!dpopt.dateFormat) {
               dpopt.dateFormat = this._convertDatePattern(tm._datePattern());
            }

            // applies culture specific rules
            dpopt.dayNames = tm.dateTimeFormat("Days");
            dpopt.dayNamesMin = tm.dateTimeFormat("DaysShort");
            dpopt.dayNamesShort = tm.dateTimeFormat("DaysAbbr");
            dpopt.monthNames = tm.dateTimeFormat("Months");  // note globalize's array has 13 items, not 12 like monthNames expects. But the last is just ignored
            dpopt.monthNamesShort = tm.dateTimeFormat("MonthsAbbr");


         // transfer the min and max values assigned to tm when using command extensions.
            if (!dpopt.minDate && tm.getMinValue && tm.getMinValue()) {  // getMinValue requires \TypeManagers\Command Extensions.js
               dpopt.minDate = tm.getMinValue;
            }
            if (!dpopt.maxDate && tm.getMaxValue && tm.getMaxValue()) {
               dpopt.maxDate = tm.getMaxValue;
            }

         // override the default of focus because we are favoring keyboard entry
            if (!dpopt.showOn) {
               dpopt.showOn = "button";
            }

            this._prepAutoButton(this.options);

            this.element.datepicker(dpopt);

            var dp = $.data(textbox, "datepicker");

            this._finishAutoButton(dp, this.options);

            // when the button is added, jquery-validate gets confused. It tries to validate
            // the button tag, but because datepicker does not assign an id or name attribute to
            // it, jquery-validate has a javascript exception.
            // Use $.validator's options to fix.
            $(document).ready(function() {
               if ($.validator) {
                  var validator = $.data(textbox.form, "validator");
                  if (validator && validator.settings) {
   //                  validator.settings.ignore.push(".ui-datepicker-trigger");

            //NOTE: ignore may be a function or $element. These are not modified.
                     var ignore = validator.settings.ignore || "";
                     if (ignore instanceof Array) {
                        if (ignore.length)
                           validator.settings.ignore.push(".ui-datepicker-trigger");
                        else
                           ignore = "";
                     }
                     if (typeof ignore == "string") {
                        validator.settings.ignore = (ignore ? ignore + "," : "") + ".ui-datepicker-trigger";
                     }

                  }
               }
            });
         }
         finally {
            jTAC._internal.popContext();
         }

      },  

/*
The datepicker.options.dateFormat property is assigned automatically
by using the pattern defined by the TypeManagers.Date class. However,
the format must be converted to work.
DateTypeManager is using the traditional .net pattern while
datepicker uses the format described here:
http://docs.jquery.com/UI/Datepicker/formatDate
*/
      _convertDatePattern : function( ptn ) {
         // month pattern conversion:
         // MMMM -> MM
         // MMM -> M
         // MM -> mm
         // M -> m

         if (ptn.indexOf("MMMM") > -1) {
            ptn = ptn.replace("MMMM", "MM");
         }
         else if (ptn.indexOf("MMM") > -1) {
            ptn = ptn.replace("MMM", "M");
         }
         else if (ptn.indexOf("MM") > -1) {
            ptn = ptn.replace("MM", "mm");
         }
         else if (ptn.indexOf("M") > -1) {
            ptn = ptn.replace("M", "m");
         }

         // year pattern conversion:
         // yyyy -> yy
         // yy -> y
         if (ptn.indexOf("yyyy") > -1) {
            ptn = ptn.replace("yyyy", "yy");
         }
         else if (ptn.indexOf("yy") > -1) {
            ptn = ptn.replace("yy", "yy");
         }
         
         return ptn;

      },

/*
   Implements the jTAC_DataTypeEditorOptions.getCommandName event
   to intercept keystrokes managed by the datepicker while it is popped up.
   This avoids having one keystroke modify both the textbox and datepicker.
   Only called when popped up.
   These keystrokes are owned by a popped up datePicker:
   ctrl + up, ctrl + left, ctrl + right, ctrl + down,
   page up, page down, ctrl+home, ctrl+end,
   enter, esc
   (For reference: http://docs.jquery.com/UI/Datepicker#overview) 
*/
      _getCommandName : function( evt, cmdKeys, tm ) {
         switch (evt.keyCode) {
            case 37: // left
            case 38: // up
            case 39: // right
            case 40: // down
            case 35: // end
            case 36: // home
               return evt.ctrlKey ? "" : null;
            case 27: // esc
            case 13: // enter
            case 33: // page up
            case 34: // page down
               return !evt.ctrlKey ? "" : null;
         }
         return null;
      },


/*
   If the buttonImage option is defined with "spacer.gif", it is a trigger to use
   this feature. It ensures the button is an image (it will set buttonImageOnly to true
   if you haven't explicitly set it to false). 
   It expects the .ui-datepicker-trigger style sheet to be defined using the image URL in its
   background-image style. 

   If you want mouse over effects, it should have
   .ui-datepicker-trigger:hover style also defined with another image
   in the background-image style.

   If you want mouse pressed effects, it should have
   .ui-datepicker-trigger-pressed style also defined with another
   image in the background-image style.

   All of these are defined if you load the /jTAC Appearance/jquery.ui.datetextbox.css.
   The spacer.gif file itself is important as it will be shown by the <img> tag.
   Since we really want to just show the background-image style, spacer.gif
   is actually a tranparent 1x1 pixel image.
   NOTE: The reason we use buttonImage="path/spacer.gif" instead of assigning it internally
   is because the path depends on the location of the html file in the app's hierarchy.
*/
      _prepAutoButton : function(dtbopts) {
         // see if datepicker options is already configured
         var opts = dtbopts.datepicker;
         if (!opts.buttonImage || opts.buttonImage.toLowerCase().indexOf("spacer.gif") == -1)
            return;
         if (opts.showOn == "focus")
            return;
         dtbopts.autoButton = true; // indicate that it needs further setup
         if (opts.buttonImageOnly == null) {
            opts.buttonImageOnly = true;
         }
         if (opts.buttonText == null) {
            opts.buttonText = "Open";
         }
      },
      
      _finishAutoButton : function( dp, dtbopts ) {
         if (!dtbopts.autoButton)
            return;
         // see if we need to add an animation to when the mouse is pressed
         var ss = window.document.styleSheets;
         if (!ss)
            return;
         var pcss = "ui-datepicker-trigger-pressed";

         for (var si = 0; si < ss.length; si++) {
            var ss2 = ss[si];
            var rules = ss2.cssRules ? ss2.cssRules : ss2.rules;
            for (var i = 0; i < rules.length; i++) {
               if (rules[i].selectorText && rules[i].selectorText.toLowerCase() == "." + pcss) {
               // found the style. Now build some events around the button using it.
                  dp.trigger.mousedown(function ( evt ) {
                     dp.trigger.addClass(pcss);
                  });
                  dp.trigger.mouseup(function ( evt ) {
                     dp.trigger.removeClass(pcss);
                  });
                  dp.trigger.mouseout(function ( evt ) {
                     dp.trigger.removeClass(pcss);
                  });
                  return;
               }  // if
            }  // for
         }  // for
      },

/*
This is a command compatible with TypeManager.installCmd() that
pops up the calendar.
The command is installed by _init() and has the commandName = "Calendar".
To use it, add a keyboard mapping entry to the dateTextBox.options.commandKeys.
Avoid using keystrokes that are normally allowed in the textbox.
*/
      _popup : function(args) {
         this.element.datepicker("show");
         return false;
      },

      _setOption: function( key, value ) {
         $.Widget.prototype._setOption.apply( this, arguments ); 
      }
   }; // datetextbox object
   $.widget("ui.dateTextBox", datetextbox); 
})(jQuery);  


// Need to add commands to popup the calendar to the existing command list of the DateTypeManager.
if (jTAC.isDefined("TypeManagers.BaseDate"))
{
// merge existing commandkeys with the new items
   var jTAC_DateCmds = jTAC.TypeManagers.BaseDate.prototype.getCommandKeys();
   jTAC_DateCmds.push({commandName: "Calendar", keyCode : 13, ctrl : true }); // Ctrl+Enter

   jTAC.TypeManagers.BaseDate.prototype.getCommandKeys = function()   // replace the function
      {
         return jTAC_DateCmds;
      };
}


