// jTAC/jquery-ui widgets/datatypeditor.js
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
datatypeeditor is a jquery-ui widget that filters keystrokes in a textbox
based on a TypeManager class. jTAC's TypeManager classes have
the isValidChar() method. This widget uses isValidChar().


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

5a. If working in code, use this to attach the datatypeeditor jquery-ui object to
    the input field.
   
   $("selector for the textbox").dataTypeEditor(options);

    The options reflect the properties shown below.

    This code usually runs as the page loads, such as in $(document).ready.

5b. If you want unobtrusive setup, add this attribute to the input field:
   
   data-jtac-datatypeeditor - Activates the datatypeeditor feature.
      This string specifies an object (JSon format recommended)
      with properties reflecting the options shown below. Only
      specify to override a default.
      If no options are needed, use the empty string.

   Also add the script file \jTAC\jquery-ui widgets\datatypeeditor-unobtrusive.js

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

Options
============================
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
   This can be either a function itself or a string that identifies a globally 
   defined function.

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
   This can be either a function itself or a string that identifies a globally 
   defined function.

*  keyErrorClass (string) -
   The style sheet class added to the textbox when jTAC_DefaultKeyResult needs
   to show an error. Defaults to "key-error".

* keyErrorTime (int) -
   Number of milliseconds to show the keyErrorClass on the textbox after
   the user types an illegal key. Defaults to 200.

Required libraries:
jquery.#.#.#.js
jquery-ui-#.#.#.js
jTAC.js
TypeManagers\Base.js and any TypeManager that you will use
Connections\Base.js
Connections\BaseElement.js
Connections\FormElement.js

------------------------------------------------------------*/

/* --- jquery-ui extension "datatypeeditor" ------------------------------
See documentation in the file header.
-----------------------------------------------------------------------*/
(function($) {  
   var datatypeeditor = {  
      options: new jTAC_DataTypeEditorOptions(),

      _create: function () {
         if ( !window.jTAC )
            throw new Error( "window.jTAC not created." );
         jTAC.require( ["Connections.FormElement", "TypeManagers.Base"] );

      },

      _init: function () {
         try
         {
            jTAC._internal.pushContext("datatypeeditor._init()");

            var tm = this._resolveTypeManager();
            if ( !tm )
               return;
            this._tm = tm;

            // if element.id + "_neutral" exists, access it. It hosts the neutral format
            var nElement = $( "#" + this.element[0].id + "_neutral" );
            if ( nElement.length ) {
               this._nElement = nElement; // save reference to the neutral element
               this._initValue( tm, nElement, this.element );
            }

            var o = this.options;
            this._prepCommandKeys( o, tm );
            this._prepDefaultKeyResult( o );

            var passThruKey = false;   // some browsers (FireFox) fire onkeypress even if onkeypress is canceled. When true, keypress immediately returns true.

            var that = this;
            this.element.keypress( function ( evt ) {
               if (passThruKey || (evt.which == 0)) {
                  return true;
               }
               var chr = String.fromCharCode( evt.which );
               var val = tm.isValidChar( chr );
               if ( !val ) {
                  if ( that._cmdKeys.length ) {
                     if ( that._invokeCommand( evt ) ) {
                        if ( o.keyResult )
                           o.keyResult( that.element, evt, "command", o );
                        evt.preventDefault();
                        evt.stopPropagation();
                        return false;
                     }
                  }
                  if ( o.filterkeys || ( o.filterkeys === undefined ) ) {
                     var kc = evt.which || evt.keyCode;  // sometimes which is 0 while keyCode is correct
                     if ( that._validKeyCodes.indexOf( kc ) == -1 ) {   // some key codes are still passed on to the caller

                        if ( o.keyResult ) {
                           o.keyResult( that.element, evt, "invalid", o );
                        }

                        evt.preventDefault();
                        evt.stopPropagation();
                        return false;
                     }
                  }
               }
               if ( o.keyResult ) {
                  o.keyResult( that.element, evt, "valid", o );
               }

               return true;
            } );
            this._validKeyCodes = [13, 27, 9, 8];//[13, 27, 9, 8, 33, 34, 35, 36, 37, 38, 39, 40];

            if ( this._cmdKeys.length ) {
               this.element.keydown( function ( evt ) {
                  passThruKey = false;
                  if ( that._invokeCommand( evt ) ) {
                     if ( o.keyResult ) {
                        o.keyResult( that.element, evt, "command", o );
                     }

                     evt.preventDefault();
                     evt.stopPropagation();
                     passThruKey = true;
                     return false;
                  }
                  else
                     return true;
               } );
            }

            this.element.change( function ( evt ) {
               if ( o.reformat || ( o.reformat === undefined ) ) {
                  that._reformat( tm );
               }
            } );

            if ( o.checkPastes || ( o.checkPastes == undefined ) ) {
               this._installonpaste( tm );
            }
         }
         finally {
            jTAC._internal.popContext();
         }

      },  


/*
   Creates a TypeManager instance from several sources:
   data-jtac-datatype - attribute on the textbox that provides a class name for the typemanager
   data-jtac-typemanager - attribute on the textbox that provides property name and value pairs
      to assign to the typemanager created. If it has a jtacClass property, that is used
      as an alternative to data-jtac-datatype.
   options.datatype - same as data-jtac-datatype but on the options.
   options.typemanager - same as data-jtac-typemanager but on the options.
*/
      _resolveTypeManager: function () {
         try
         {
            jTAC._internal.pushContext("datatypeeditor._resolveTypeManager()");

            var o = this.options;
            var tm = o.typeManager || this.element.data( "jtac-typemanager" );
            if ( tm ) {
               if ( typeof tm == "string" ) {
                  try {
                     tm = eval( "(" + tm + ");" );
                  }
                  catch ( e ) {
                     jTAC.warn( "JSon parsing error. " + e.message );
                  }
               }
               if ( tm.jtacClass ) {
                  tm = jTAC.create( null, tm );
               }

               if ( tm instanceof jTAC.TypeManagers.Base ) {
                  return tm;
               }

            }

            var dt = o.datatype || this.element.data( "jtac-datatype" );
            if ( dt ) {
               if ( o.datatype )
                  this.element.data( "jtac-datatype", o.datatype );   // transfer to the element so validators can use it
               tm = jTAC.create( dt, tm );
               if ( tm instanceof jTAC.TypeManagers.Base )
                  return tm;
            }

            jTAC.warn( "Specify the TypeManager. Use data-jtac-datatype='[name]' in the input field id=[" + this.element[0].id  + "]." );
            return null;
         }
         finally {
            jTAC._internal.popContext();
         }

      },


/*
Invoked by the textbox's onchange event to reformat and update
the neutral element's value with the culture neutral format.
*/
      _reformat : function( tm ) {
         try
         {
            jTAC._internal.pushContext("datatypeeditor._reformat()");

            try {
               var val = tm.toValue(this.element.val());
               this.element.val(tm.toString(val));

               if (this._nElement != null) {
                  this._nElement.val(tm.toStringNeutral(val));
               }
            }
            catch (e) {
               // let validation change the UI for errors.
            }
         }
         finally {
            jTAC._internal.popContext();
         }

      },


/*
Called during Init to transfer the value of the neutral hidden html tag
to the visible textbox value, after reformatting it.
Does nothing if the user has already assigned a value to the element.
*/
      _initValue: function ( tm, neutralElement, visibleElement ) {
         if ( visibleElement.val() == "" ) {
            try {
               var n = tm.toValueNeutral( neutralElement.val() );
               if ( n != null ) {
                  visibleElement.val( tm.toString( n ) );
               }
            }
            catch ( e ) {
               jTAC.warn( "Converting neutral value in " + visibleElement.id + " error: " + e.message );
            }
         }

      },

/*
   Simple paste event handler designed to prevent pasting if 
   a single invalid character is found.
   It only looks at the content considered plain text. If there is HTML or another type,
   paste is prevented.
   Paste prevention is only available on IE, Safari, and Chrome.
   The other browsers do not prevent pasting.
   As a result, always validate the textbox's content.
*/
      _installonpaste: function ( tm ) {
         function notify() {
            jTAC.warn( "Paste was blocked." );
         }
         var el = this.element[0];
         if ( !el || ( el.onpaste === undefined ) ) {
            return;
         }
         el.onpaste = function ( e ) {
            var text = undefined;
            if ( window.clipboardData && window.clipboardData.getData ) { // IE
               text = window.clipboardData.getData( 'Text' );
               if ( text == null ) { // do not allow pasting any other type
                  notify();
                  return false; // Prevent the default handler from running.
               }
            }
            else if ( e.clipboardData && e.clipboardData.getData ) {  // safari and chrome
               text = e.clipboardData.getData( 'text/plain' );
               if ( text == null ) { // do not allow pasting any other type
                  notify();
                  return false; // Prevent the default handler from running.
               }
            }
            if ( text ) {
               for ( var i = 0; i < text.length; i++ ) {
                  if ( !tm.isValidChar( text.charAt( i ) ) ) {
                     notify();
                     return false; // Prevent the default handler from running.
                  }
               }
            }
            return true;
         };

      },


/*
   Creates and populates the _cmdKeys field with command key objects
   from two sources:
   - TypeManager.getCommandKeys() method defines the default collection.
   - options.commandKeys defines modifications to the defaults.
*/
      _prepCommandKeys: function ( opt, tm ) {
         this._cmdKeys = [];

         if ( tm.invoke ) {
            if ( tm.getCommandKeys ) { // initialize
               this._cmdKeys = tm.getCommandKeys();
            }
            if ( opt.commandKeys ) {
               for ( var i = 0; i < opt.commandKeys.length; i++ ) {
                  var ck = opt.commandKeys[i];
                  switch ( ck.action ) {
                     case "clear":
                        this._cmdKeys = [];
                        break;
                     case "remove":
                        // find a match to all properties
                        for ( var j = 0; j < this._cmdKeys.length; j++ ) {
                           var old = this._cmdKeys[j];
                           if ( old.commandName == ck.commandName ) {
                              if ( ( ck.keyCode == "*" ) ||
                                  ( ( old.keyCode === ck.keyCode ) &&
                                   ( old.ctrl == ck.ctrl ) &&
                                   ( old.shift == old.shift ) ) ) {
                                 this._cmdKeys.splice( j, 1 );
                                 break;
                              }
                           }
                        }  // for j
                        break;
                     default: // add
                        this._cmdKeys.push( ck );
                        break;
                  }  // switch
               }  // for i
            }  // if opt.commandKeys
         }  // if tm.invoke

      },


/* 
   Invokes the commands associated with the event keystroke.
   If no command occurred, returns false.
*/
      _invokeCommand: function ( evt ) {
         try
         {
            jTAC._internal.pushContext("datatypeeditor._invokeCommand()");

            var cmdName = null;
            var fnc = this.options.getCommandName;
            if ( fnc ) {
               if (typeof fnc == "string") { // find the function defined in the window object
                  if (window[fnc] == undefined)
                     jTAC.warn( "Could not find the function [" + fnc + "] globally defined." );
                  fnc = this.options.getCommandName =  window[fnc];
               }
               cmdName = fnc.call( this, evt, this._cmdKeys, this._tm );
            }
            if ( cmdName == "" )   // means don't invoke this command
               return false;
            if ( !cmdName ) {
               cmdName = this._getCommandName( this._cmdKeys, evt );
            }
            if ( cmdName ) {
               var conn = this._conn;
               if ( !conn ) {
                  this._conn = conn = jTAC.connectionResolver.create( evt.currentTarget.id );
               }
               var args = { commandName: cmdName, connection: conn };
               this._tm.invoke( args );
               return true;
            }
            return false;
         }
         finally {
            jTAC._internal.popContext();
         }

      },

/*
Used by keydown and keypress events to see if a keystroke is associated
with a command registered in this._cmdKeys. If so, it invokes 
that command and returns true.
If not, it returns false.
   * cmdMap - string. Maps keystrokes to comamndIDs
   * evt - jquery event object

*/
      _getCommandName: function ( cmdMap, evt ) {
         var keyCode = evt.keyCode,
         ctrl = evt.ctrlKey,
         shift = evt.shiftKey;
         if ( ( keyCode == 16 ) || ( keyCode == 17 ) ) { // ctrl and shift keys alone
            return false;
         }

         // try to match by keyCode
         for ( var i = 0; i < cmdMap.length; i++ ) {
            var info = cmdMap[i];
            if ( ( info.keyCode == keyCode ) && ( !!info.ctrl == ctrl ) && ( !!info.shift == shift ) ) {
               return info.commandName;
            }
         }

         if ( ( evt.type != "keydown" ) || ( keyCode < 33 ) || ( ( keyCode < 91 ) && ( keyCode > 47 ) ) ) {
            var keyChar = String.fromCharCode( keyCode );  // only works in keypress event, not keydown
            var keyCharUC = keyChar.toUpperCase();
            var useShift = false;
            if ( ( keyCode < 65 ) || ( keyCode > 90 ) ) { // letters ignore the shift key, as they are matched in upper and lowercase
               useShift = true;
            }

            // try to match by keyCode
            for ( var i = 0; i < cmdMap.length; i++ ) {
               var info = cmdMap[i];
               if ( typeof ( info.keyCode ) == "number" )
                  continue;
               if ( useShift && ( !!info.shift != shift ) )
                  continue;
               if ( !!info.ctrl != ctrl )
                  continue;

               if ( ( info.keyCode == keyChar ) || ( info.keyCode.toUpperCase() == keyCharUC ) )
                  return info.commandName;
            }

         }
         return false;  // not found
      },

/*
Reviews the options to ensure they are setup for the keyResult option
to use the default if it hasn't already been setup.
*/
      _prepDefaultKeyResult: function ( options ) {
         if ( options.keyResult === undefined ) {  // needs the default
            options.keyResult = jTAC_DefaultKeyResult;
         }
         else if ( typeof options.keyResult == "string" ) {
            if ( window[options.keyResult] ) {
               options.keyResult = window[options.keyResult];
            }
            else 
               jTAC.warn( "Could not find the function [" + options.keyResult + "] globally defined." );
         }
         if ( options.keyErrorClass === undefined ) {
            options.keyErrorClass = "key-error";
         }
         if ( options.keyErrorTime == undefined ) {
            options.keyErrorTime = 200;
         }
      },

      _setOption: function ( key, value ) {
         $.Widget.prototype._setOption.apply( this, arguments ); 
      } 
   }; // datatypeeditor object
   $.widget("ui.dataTypeEditor", datatypeeditor); 
})(jQuery);


/*
Default function for the options.keyResult property.
Called after each keystroke is processed.
This function adds the style sheet class defined in options.keyErrorClass to the textbox
for a period of options.keyErrorTime.
The function takes these parameters:
   * element - the jquery object for the textbox
   * event (the jquery event object) - Look at its keyCode for the keystroke typed.
   * result (string) - "valid", "invalid", "command"
   * options - the options object with user options.
Returns nothing.
The value of 'this' is the datatypeeditor object.
*/
function jTAC_DefaultKeyResult( element, evt, result, options ) {
   function Clear() {
      if ( options.keyErrorIntervalID ) {
         element.removeClass( options.keyErrorClass );
         window.clearInterval( options.keyErrorIntervalID );
         options.keyErrorIntervalID = null;
      }
   }
   if ( !options.keyErrorClass )
      return;

   Clear();
   if ( result == "invalid" ) {
      element.addClass( options.keyErrorClass );
      options.keyErrorIntervalID = window.setTimeout( Clear, options.keyErrorTime );
   }
}

/* --- CLASS jTAC_DataTypeEditorOptions -------------------------------
Options object definition used by jquery-ui-datatypeeditor.

NOTE: All properties are set to null initially.
-----------------------------------------------------------------------*/

function jTAC_DataTypeEditorOptions() {
}
jTAC_DataTypeEditorOptions.prototype = {
/*
  Alternative to using the data-jtac-datatype attribute assigned to the textbox.
  Only used when that attribute is missing.
*/
   datatype : null,

/*
  Used instead of the data-jtac-datatype and data-jtac-typemanager attributes on the textbox
  when assigned. It must host the TypeManager.
  (The data-jtac-typemanager attribute's values will not be used to revise its properties.)
*/
   typeManager : null,

/*
When true, the onchange event will reformat the contents to match
the most desirable format. Effectively, it uses the TypeManager's
toValue then toString methods. Nothing happens if there is a formatting error.
*/
   reformat : true,

/*
When true, keystrokes are evaluated for valid characters.
Invalid characters are filtered out. 
This uses the TypeManager.IsValidChar() method.
When false, no keystroke filtering is supported.
*/
   filterkeys : true,

/*
On browsers that support the onpaste event, this attempts to
evaluate the text from the clipboard before it is pasted.
It checks that each character is valid for the TypeManager.
If any invalid character is found, the entire paste is blocked.
It will also block pasting non-textual (including HTML) content.
Supported browsers: IE, Safari, and Chrome.
*/
   checkPastes : true,

/*
An array of objects that map a keystroke to a command
associated with the TypeManager's command feature.
Requires loading \jTAC\TypeManagers\Command extensions.js.
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
         then add a new item. If you want to remove all instances of 
         a commandName, set keyCode to "*".
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
*/
   commandKeys : null,


/*
A function hook used when evaluating a keystroke to see if it should 
invoke a command. The function has these parameters:
   * evt - the jQuery event object to evaluate
   * cmdKeys - the commandKeys collection, which are described above.
   * tm - the TypeManager object associated with this datetextbox.

Returns one of these values:
* null - Continue processing the command.
* commandName (string) - Use this command name to invoke the command.
* "" (the empty string) - Stop processing this keystroke
This can be either a function itself or a string that identifies a globally 
defined function.

*/
   getCommandName : null,


/*
A function hook that is called after each keystroke is processed.
It lets you know the result of the keystroke with one of these three states:
valid, invalid, command.
Use it to modify the user interface based on keystrokes. Its primary
use is to change the UI when there is an invalid keystroke.
If null, it uses a default UI that changes the border using the style sheet
class of the keyErrorClass property.
This can be assigned as a string that reflects the name of a globally defined
function too (for the benefit of JSon and unobtrusive setup).
The function takes these parameters:
   * element - the jquery object for the textbox
   * event (the jquery event object) - Look at its keyCode for the keystroke typed.
   * result (string) - "valid", "invalid", "command"
   * options - the options object with user options.
Returns nothing.
This can be either a function itself or a string that identifies a globally 
defined function.
*/
   keyResult : jTAC_DefaultKeyResult,

/*
The style sheet class added to the textbox when jTAC_DefaultKeyResult needs
to show an error.
*/
   keyErrorClass : "key-error",

/*
Number of milliseconds to show the keyErrorClass on the textbox after
the user types an illegal key.
*/
   keyErrorTime : 200
};

/*
   Utility that adds command objects to the command keys list for dates.
   Call from getCommandKeys functions.
      cmdKeys (array) - Array of existing objects. Items will be appended.
      today (boolean) - When true, add the Today command.
*/
function jTAC_StdDateCmds(cmdKeys, today) {
   if (today) {
      cmdKeys.push(
            {commandName: "Today", keyCode: "t" },
            {commandName: "Today", keyCode: "t", ctrl : true });
   }
   cmdKeys.push(
            {commandName: "NextDay", keyCode: 38 }, // up arrow
            {commandName: "PrevDay", keyCode: 40 }, // down arrow
            {commandName: "NextMonth", keyCode: 33 }, // Page up
            {commandName: "PrevMonth", keyCode: 34 }, // Page down
            {commandName: "NextMonth", keyCode: 38, ctrl : true }, // Ctrl+ up
            {commandName: "PrevMonth", keyCode: 40, ctrl : true }, // Ctrl +down
            {commandName: "NextYear", keyCode: 36 }, // Home
            {commandName: "PrevYear", keyCode: 35 }); // End
   return cmdKeys;
}

/*
   Utility that adds command objects to the command keys list for times.
   Call from getCommandKeys functions.
      cmdKeys (array) - Array of existing objects. Items will be appended.
      now (boolean) - When true, add the Now command.
*/
function jTAC_StdTimeCmds(cmdKeys, now) {
   if (now) {
      cmdKeys.push(
            {commandName: "Now", keyCode: "N", ctrl: true });
   }
   cmdKeys.push(
            {commandName: "NextMinutes", keyCode: 38 }, // up arrow
            {commandName: "PrevMinutes", keyCode: 40 }, // down arrow
            {commandName: "NextHours", keyCode: 33 }, // Page up
            {commandName: "PrevHours", keyCode: 34 }, // Page down
            {commandName: "NextHours", keyCode: 38, ctrl: true }, // Ctrl+ up
            {commandName: "PrevHours", keyCode: 40, ctrl: true}); // Ctrl +down; // End
   return cmdKeys;
}

if (jTAC.isDefined("TypeManagers.BaseDate")) {
   jTAC_Temp = {
      getCommandKeys : function() {
         return jTAC_StdDateCmds([], true);
      }
   } 
   jTAC.addMembers("TypeManagers.Base", jTAC_Temp);
}

if ( jTAC.isDefined( "TypeManagers.TimeOfDay" ) ) {
   jTAC_Temp =
   {
      getCommandKeys: function () {
         return jTAC_StdTimeCmds([], true);
      }
   } 
   jTAC.addMembers( "TypeManagers.TimeOfDay", jTAC_Temp );
}

if ( jTAC.isDefined( "TypeManagers.Duration" ) ) {
   jTAC_Temp =
   {
      getCommandKeys: function () {
         return jTAC_StdTimeCmds([], false);
      }
   }
   jTAC.addMembers( "TypeManagers.Duration", jTAC_Temp );
}

if ( jTAC.isDefined( "TypeManagers.DateTime" ) ) {
   jTAC_Temp =
   {
      getCommandKeys: function () {
         var cmdKeys = [{commandName: "Now", keyCode: "N", ctrl: true }];
         return jTAC_StdDateCmds(cmdKeys, true);
      }
   }
   jTAC.addMembers( "TypeManagers.DateTime", jTAC_Temp );
}

/*
   Utility that adds command objects to the command keys list for numbers.
   Call from getCommandKeys functions.
      cmdKeys (array) - Array of existing objects. Items will be appended.
      fp (boolean) - "floating point" When true, add the NextByPt1/PrevByPt1 commands.
*/
function jTAC_StdNumberCmds(cmdKeys, fp) {
   cmdKeys.push(
      {commandName: "NextBy1", keyCode: 38 }, // up arrow
      {commandName: "PrevBy1", keyCode: 40 }); // down arrow
   if (fp) {
      cmdKeys.push(
      {commandName: "NextByPt1", keyCode: 38, ctrl: true }, // Page up
      {commandName: "PrevByPt1", keyCode: 40, ctrl: true}) // Page down
   }
   return cmdKeys;
}
if ( jTAC.isDefined( "TypeManagers.BaseFloat" ) ) {
   jTAC_Temp =
   {
      getCommandKeys: function () {
         return jTAC_StdNumberCmds([], true);
      }
   }
   jTAC.addMembers( "TypeManagers.BaseFloat", jTAC_Temp );
}

if ( jTAC.isDefined( "TypeManagers.Integer" ) ) {
   jTAC_Temp =
   {
      getCommandKeys: function () {
         return jTAC_StdNumberCmds([], false);
      }
   }
   jTAC.addMembers( "TypeManagers.Integer", jTAC_Temp );
}
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
Module: TypeManager objects

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


﻿// jTAC/TypeManagers/Command extensions.js
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
Extends existing TypeManager objects to offer a command handler
that will allow users to modify the value of the textbox by
a keystroke or menu command.

The TypeManagers.Base class is expanded with these new members:

* invoke(args) - 
   Invokes a command. It is passed an object to reflect
   the arguments. They are:
   - command name (string) - A unique string associated with a command.
      This will run a specific function that is passed this same object.
      Most of the functions will be defined on the TypeManager subclass,
      although the user can provide functions written for external purposes,
      such as "popup" to popup a Calendar.
   - connection (Connection class) - 
      Identifies the element whose value is modified. It's used to 
      retrieve the current value, either as text or native type,
      and set the updated value.
   - caretPos (integer) - The location of the caret in the textbox. If
      there is a range, this is the starting location. 0 is the first position.
      If there is no caret, leave it null.
      This is used with commands that are position sensitive.
   - changed (boolean) - When true, the caller knows the value was updated.
   - error (boolean) - When true, the caller knows there was an error preventing change.
   - value - The native value as a result of running the function.
      This does not need to be set by the caller. It can be used when invoke() returns.

* installCmd(args) - 
   Called by the TypeManager's initCmds() function
   to install a single command name and associated function to call.
   Each function supports a single parameter, the same args as passed into invoke().
   installCmd() can also be called by the page developer to add custom commands.
   A custom command's function can be located on the TypeManager's own
   prototype or elsewhere. When its called, the value of 'this' is the TypeManager instance.
   Each function returns a boolean value. When true, it means update the connection's
   current value with the value from args.value. When false, no update occurs.

   The args is an object with the following properties:
   - commandName (string) - The unique string that identifies the command.
   - func (function) - Reference to a function that is invoked by the command.
   - ignoreCurrent (boolean) - When true, the function does not need to 
      know the current value. The invoke() args will have its 'value' property set to null.
      For example, the command "Today" doesn't need to read the current value.
   - ignoreError (boolean) - When true and the function uses the current value,
      it will still be called even if the current value could not be determined due to an error.
      When null or false, the function is not called if the current value cannot be determined.

* installValueCmd(commandname, value) - 
   Allows a command to set an explicit value.
   Only used by the page developer to add special values.
   Typically used to add dates. The value must be the native type supported
   by the TypeManager. 

* initCmds() -
   Called by the constructor when this script file is loaded.
   Subclasses should override this to call installCmd() for the command list.

* minValue, maxValue -
   These properties are used when there are range limits.
   They are used by some commands, especially those that increment or decrement the value.
   The values must be the correct data type for the TypeManager.
   You can also set them with a culture neutral formatted string represented the value.

* clearCmd(args) - 
   Function to assign to the "Clear" command. It always sets the args.value to null
   and clears the connection's value.
   Subclasses still must attach this function using installCmd().



Predefined commands on each class:
- All Date classes:
   * "NextDay", "PrevDay" - increase or decrease by one day. Will update month at the day borders
   * "NextMonth", "PrevMonth" - increase or decrease by one month. Will update year at the month borders
   * "NextYear", "PrevYear" - increase or decrease by one year
   * "Today" - Assign today's date
   * "Clear" - Clear the date. Empty textbox.

- Time and duration classes:
   * "NextSec", "PrevSec" - increases or decreases by one second.
   * "NextMin", "PrevMin" - increases or decreases by one minute.
   * "NextHr", "PrevHr" - increases or decreases by one hour.
   * "Now" - assign the current time of day.
   * "Clear" - Clear the date. Empty textbox.

- Number classes:
   * "NextBy1", "PrevBy1" - increases or decrease by 1
   * "NextBy10", "PrevBy10" - increases or decrease by 10
   * "NextBy100", "PrevBy100" - increases or decrease by 100
   * "NextBy1000", "PrevBy1000" - increases or decrease by 1000
   * "NextByPt1", "PrevByPt1" - increases or decrease by 0.1
   * "NextByPt01", "PrevByPt01" - increases or decrease by 0.01
   * "Clear" - Clear the date. Empty textbox.
     
  
Required libraries:
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
ALWAYS LOAD \jTAC\TypeManagers\Base.js BEFORE THIS FILE IS LOADED
ALWAYS LOAD any other TypeManager classes BEFORE THIS FILE IS LOADED

------------------------------------------------------------*/

/* ---- TypeManagers.Base extensions --------------- */
jTAC_Temp = {
   config : {
      minValue: null,
      maxValue: null
   },

   /*
   Holds the objects defined by the installCmds() method
   in the order they are added. (Duplicate commands are allowed
   but only the first is invoked.)
   _internal.cmds: [],  // this is defined when initCmds is called to avoid it here on the prototype
   */

   /*
   Invokes a command. 
   The args parameter is an object with these properties:
   * commandName (string) - A unique string associated with a command.
      This will run a specific function that is passed this same object.
      Most of the functions will be defined on the TypeManager subclass,
      although the user can provide functions written for external purposes,
      such as "popup" to popup a Calendar.
   * connection (Connection object) - 
      Identifies the element whose value is modified. It's used to 
      retrieve the current value, either as text or native type,
      and set the updated value.
   * caretPos (integer) - The location of the caret in the textbox. If
      there is a range, this is the starting location. 0 is the first position.
      If there is no caret, leave it null.
      This is used with commands that are position sensitive.
   * changed (boolean) - When true, the caller knows the value was updated.
   * error (boolean) - When true, the caller knows there was an error preventing change.
   * value - The native value as a result of running the function.
      This does not need to be set by the caller. It can be used when invoke() returns.
   * precmd (function) - Optional user function that is called prior to calling the normal function.
      Allows changing the initial value (in args.value), detecting a special error (set args.error=true),
      or just stopping the command.
      Function returns false to stop further processing, true to continue.
   * postcmd (function) - Optional user function that is called after to calling the normal function.
      It is only called if the normal function returns true, indicating the value had been changed (args.changed=true).
      Allows changing the resulting value (in args.value), detecting a special error (set args.error=true),
      and updating the interface directly.
      Function returns false to prevent updating the textbox's value (probably because 
      your function did that itself), and true to let invoke() update the textbox's value.
   */
   invoke: function ( args ) {
      var intnl = this._internal;
      var cmds = intnl.cmds;

      if (!cmds) {
         intnl.cmds = cmds = [];
         this._initCmds();
      }
      else if (intnl.needsCmds) {
         this._initCmds();
         intnl.needsCmds = false;
      }

   // init return results
      args.changed = false;
      args.error = false;
      args.value = null;
      for (var i = 0; i < cmds.length; i++) {
         var obj = cmds[i];
         if (obj.commandName == args.commandName) {
            if (!obj.ignoreCurrent) {
               try {
                  args.value = this.toValueFromConnection(args.connection);
               }
               catch (e) {
                  if (!obj.ignoreError) {
                     args.error = true;
                     return;
                  }
               }
            }

            if (args.precmd) {
         // function takes the args. If it sets error or returns false, it stops
         // Usually return false when the data is valid, but there is no need to continue
         // and args.error = true when there is really an error.
               if (!args.precmd(args) || args.error)
                  return;
            }

            if (!args.settings) {  // precmd function may have set it to override defaults
               args.settings = obj;
            }
            if (obj.func.call(this, args)) {
               args.changed = true;
               if (args.postcmd) {
            // function takes the args. If it sets error or returns false, it stops before setting the textbox's value.
            // Usually return false when the data was assigned to an element in the function
            // and args.error = true when there is really an error.
                  if (!args.postcmd(args) || args.error)
                     return;
               }

               args.connection.setTextValue(this.toString(args.value));
            }
            return;   // done
         }
      }
   },

   /* 
   Utility used by subclasses in their initCmds() function
   to install a single command name and associated function to call.

   Each function supports a single parameter, the same args as passed into invoke().
   installCmd() can also be called by the page developer to add custom commands.

   Each function returns a boolean value. When true, it means update the connection's
   current value with the value from args.value. When false, no update occurs.

   The args parameter is an object with the following properties:
   * commandName (string) - The unique string that identifies the command.
   * func (function) - Reference to a function that is invoked by the command.
   * ignoreCurrent (boolean) - When true, the function does not need to 
   know the current value. The invoke() args will have its 'value' property set to null.
   For example, the command "Today" doesn't need to read the current value.
   * ignoreError (boolean) - When true and the function uses the current value,
   it will still be called even if the current value could not be determined due to an error.
   When null or false, the function is not called if the current value cannot be determined.
   
   You can add other properties to this object which are used by your function
   by looking at its args.settings property.

   A custom command's function can be located on the TypeManager's own
   prototype or elsewhere. When its called, the value of 'this' is the TypeManager instance.

      args (object) - see above
      replace (boolean) - When true, search for the same named command already here and replace it.
         When false (or null), your command will be appended. If it is a duplicate,
         it will effectively be ignored by the invoke() command.

   */
   installCmd: function ( args, replace ) {
      var intnl = this._internal;
      var cmds = intnl.cmds;
      if (!cmds) {
         intnl.cmds = cmds = [];
         intnl.needsCmds = true; // don't call initCmds here because this is often called from within initCmds.
      }
      if (!args.func)
         this._error("args.func not assigned.");
      if (replace) {
         for (var i = 0; i < cmds.length; i++) {
            if (cmds[i].commandName == args.commandName) {
               cmds[i] = args;
               return;
            }
         }
      }
      cmds.push(args);  // does not check for duplicate names
   },

   /* 
   Allows a command to set an explicit value.
   Only used by the page developer to add special values.
   Typically used to add dates.
      * commandName (string) - the command to add
      * value - The value that will be assigned to the textbox. The value must be the native type supported
          by the TypeManager. 
      * replace (boolean) - When true, search for the same named command already here and replace it.
         When false (or null), your command will be appended. If it is a duplicate,
         it will effectively be ignored by the invoke() command.
   */
   installValueCmd: function (commandname, value, replace) {
      this.installCmd({commandName : commandname, func : this.setValueCmd, value : value, ignoreCurrent : true}, replace);
   },

/*
Access an existing command's arguments so you can modify
its supporting properties, such as keepSec, roundBy, and nextMin
that are used by the addSeconds() function.
*/
   getCmd: function ( commandName ) {
      var intnl = this._internal;
      var cmds = intnl.cmds;
      if (!cmds) {
         intnl.cmds = cmds = [];
         this._initCmds();
      }
      else if (intnl.needsCmds) {
         this._initCmds();
         intnl.needsCmds = false;
      }

      for (var i = 0; i < cmds.length; i++) {
         if (cmds[i].commandName == commandName) {
            return cmds[i];
         }
      }
      return null;
   },



   /* 
   Called by the constructor when this script file is loaded.
   Subclasses should override this to call installCmd() for the command list.
   */
   _initCmds: function () {
      // does nothing in this class. Subclass to support it.
   },


   /* 
   Function to assign to the "Clear" command. It always sets the args.value to null
   and clears the connection's value.
   Subclasses still must attach this function using installCmd().
   */
   clearCmd: function (args) {
      args.value = null;
      return true;
   },
   

/*
Commands created by installValueCmd use this to assign the value
they've stored in the command's object.value property.
*/
   setValueCmd: function (args) {
      var cmds = this._internal.cmds;
      for (var i = 0; i < cmds.length; i++) {
         var obj = cmds[i];
         if (obj.commandName == args.commandName) {
            args.value = obj.value;
            return true;
         }
      }
      return false;
   },

/*
Utility to test if the value is inside the range established by minValue and maxValue.
It returns true if it is or the range does not apply.
*/
   _inRange : function(value) {
      var mv = this.getMinValue();
      if ((mv != null) && (this.compare(value, mv) < 0)) {
         return false;
      }
      mv = this.getMaxValue();
      if ((mv != null) && (this.compare(value, mv) > 0)) {
         return false;
      }
      return true;
   },

/*
Utility to ensure the value is within the range. If it in the range,
the value is returned. If it outside the range, the range limit is returned.
*/
   _adjustForRange : function(value) {
      var mv = this.getMinValue();
      if ((mv != null) && (this.compare(value, mv) < 0)) {
         return mv;
      }
      mv = this.getMaxValue();
      if ((mv != null) && (this.compare(value, mv) > 0)) {
         return mv;
      }
      return value;
   },

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

   /*
   minValue property: SET function
   Used when there are range limits with this being the lower limit.
   Used by some commands, especially those that decrement the value.
   The values must be the correct data type for the TypeManager.
   You can also set them with a culture neutral formatted string represented the value.
   */
   setMinValue: function (val)
   {
      this.config.minValue = (typeof val == "string") ? this.toValueNeutral(val) : this.toValue(val);
   },

   /*
   maxValue property: SET function
   Used when there are range limits with this being the upper limit.
   Used by some commands, especially those that increment the value.
   The values must be the correct data type for the TypeManager.
   You can also set them with a culture neutral formatted string represented the value.
   */
   setMaxValue: function (val)
   {
      this.config.maxValue = (typeof val == "string") ? this.toValueNeutral(val) : this.toValue(val);
   }

} 
jTAC.addMembers("TypeManagers.Base", jTAC_Temp);

/* ---- TypeManagers.BaseDatesAndTimes prototype extensions --------------- 
Built-in commands:
   * "NextDay", "PrevDay" - increase or decrease by one day. Will update month at the day borders
   * "NextMonth", "PrevMonth" - increase or decrease by one month. Will update year at the month borders
   * "NextYear", "PrevYear" - increase or decrease by one year
   * "NextSec", "PrevSec" - increases or decreases by one second.
   * "NextMin", "PrevMin" - increases or decreases by one minute.
   * "NextHr", "PrevHr" - increases or decreases by one hour.
   * "NextAtCaret", "PrevAtCaret" - increase or decrease the element located at the caret.
      There are three elements: year, month, and day in Date and hours, minutes, seconds in Time.
   * "Today" - Assign today's date
   * "Now" - Assign the current time of day.
   * "Clear" - Clear the value. Empty textbox.

NOTE: Date commands only work when the TypeManager supports dates. 
Time commands only work when when the Typemanager supports time.

Additional properties:
   blankStartsAt -
      When a command is based on the current value (such as increment/decrement commands)
      and the value is unassigned, this determines the starting value to assign.
      Here are the legal values:
      null or "" - Determines by these rules:
      If decrementing, use maxValue if assigned.
      If incrementing, use minValue if assigned.
      If it supports dates is used, today's date.
      If it supports time but not date, 0.
      "Now" - If it supports dates is used, today's date.
      If it supports time is used, the current time.
      Date object - This value is used directly.
      Culture neutral format string of a date - Converts to a Date object with this date.
      integer - Only if it supports time and the value is a number.
      String containing an integer - Converts to an integer. Supports time and the value is a number.

--------------------------------------------------------------------------*/

if (jTAC.isDefined("TypeManagers.BaseDatesAndTimes"))
{
jTAC_Temp =
{
   config: {
      blankStartsAt : null   // uses default rule
   },

   _initCmds: function () {
      if (this.supportsDates()) {
         this.installCmd({ commandName: "NextDay", func: this.addDays, days: 1 });
         this.installCmd({ commandName: "PrevDay", func: this.addDays, days: -1 });
         this.installCmd({ commandName: "NextMonth", func: this.addMonths, months: 1 });
         this.installCmd({ commandName: "PrevMonth", func: this.addMonths, months: -1 });
         this.installCmd({ commandName: "NextYear", func: this.addMonths, months: 12 });
         this.installCmd({ commandName: "PrevYear", func: this.addMonths, months: -12 });
         this.installCmd({ commandName: "Today", func: this.todayCmd, ignoreCurrent: true });
      }
      if (this.supportsTimes()) {
         this.installCmd({ commandName: "NextSeconds", func: this.addSeconds, seconds: 1, roundBy : 0 });
         this.installCmd({ commandName: "PrevSeconds", func: this.addSeconds, seconds: -1, roundBy : 0 });
         this.installCmd({ commandName: "NextMinutes", func: this.addSeconds, seconds: 60 });
         this.installCmd({ commandName: "PrevMinutes", func: this.addSeconds, seconds: -60 });
         this.installCmd({ commandName: "NextHours", func: this.addSeconds, seconds: 3600 });
         this.installCmd({ commandName: "PrevHours", func: this.addSeconds, seconds: -3600 });
         this.installCmd({ commandName: "Now", func: this.nowCmd, ignoreCurrent: true });
      }
      this.installCmd({ commandName: "Clear", func: this.clearCmd, ignoreCurrent: true });
   },

   /*
   For a command that increments or decrements by days.
   If args.settings.days is assigned, that number is used to increment.
   It can be a positive or negative number.
   If args.settings.days is unassigned, it increments by one day.
   */
   addDays: function (args) {
      var adjust = args.settings.days || 1;

      var orig = args.value;
      var date = orig;
      if (!date) {
         // if blank, assign the initial value when this command is first invoked.
         this._adjustBlank(args, adjust > 0);
         args.value = this._adjustForRange(args.value);
         return true;
      }

      if (!this.getUseUTC()) {  // convert to UTC. UTC dates ignore daylight savings time and are always 24 hours.
         date = this.asUTCDate(date);
      }

      // 86,400,000 is number of millisecs in a day
      var ticks = date.valueOf() + (adjust * 86400000);

      var nDate = new Date(ticks); // UTC date. Convert to standard date
      if (!this.getUseUTC()) {
         nDate = this._asLocalDate(nDate);
      }
      nDate = this._adjustForRange(nDate);
      args.value = nDate;
      return nDate.valueOf() != orig.valueOf();
   },

   /*
   Adds or subtracts a number of months starting at args.value
   Returns a Date object.
   Corrects for date overflow into another month
   If args.settings.months is assigned, that number is used to increment.
   It can be a positive or negative number.
   If args.settings.months is unassigned, it increments by one month.
   */
   addMonths: function (args) {
      var adjust = args.settings.months || 1;

      var orig = args.value;
      var date = orig;
      if (!date) {
         // if blank, assign the initial value when this command is first invoked.
         this._adjustBlank(args, adjust > 0);
         args.value = this._adjustForRange(args.value);
         return true;
      }

      if (!this.getUseUTC()) {
         date = this.asUTCDate(date);
      }
      var m = date.getUTCMonth(),
      y = date.getUTCFullYear(),
      d = date.getUTCDate(),
      nDate = null; // result

      if (adjust > 0) {
         m = m + adjust;
         y = y + Math.round((m / 12) - 0.5);
         m = m % 12;
      }
      else {
         // invert m to 11 - m
         m = 11 - m;
         m = m - adjust;   // double negative gives a positive
         y = y - Math.round((m / 12) - 0.5);
         m = 11 - (m % 12);  // re-invert
      }

      do {
         nDate = this.asUTCDate(y, m, d);
         d--;
      }
      while (nDate.getUTCMonth() != m);

      if (!this.getUseUTC()) {
         nDate = this._asLocalDate(nDate);
      }
      nDate = this._adjustForRange(nDate);
      args.value = nDate;
      return nDate.valueOf() != orig.valueOf();
   },

   _asLocalDate: function (date) {
      return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
            date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
   },


   /*
   Command that returns args.value assigned to today.
   */
   todayCmd: function (args) {
      var nDate = new Date(); // assigned to today in local time

      nDate = this.getUseUTC() ?
         this.asUTCDate(nDate.getFullYear(), nDate.getMonth(), nDate.getDate()) :
         new Date(nDate.getFullYear(), nDate.getMonth(), nDate.getDate(), 0, 0, 0);
      args.value = nDate;
      return true;
   },


   /*
   Call for commands that need an existing value to calculate the next value,
   such as those that increment and decrement.
   Call when args.value is null. This will use the blankStartsAt property
   to assign args.value.
   inc (boolean) - When true, the command is intended to increment.
   When false, decrement.
   */
   _adjustBlank: function (args, inc) {
      var bsa = this.getBlankStartsAt();
      var useD = this.supportsDates();
      var useT = this.supportsTimes();
      if (bsa === "Now") {
         if (useT) {
            this.nowCmd(args);
         }
         else {
            this.todayCmd(args);
         }
      }
      else if ((bsa instanceof Date) || (typeof (bsa) == "number")) {
         args.value = bsa;
      }
      else { // anything else uses a default rule
         var mv = inc ? this.getMinValue() : this.getMaxValue();
         if (mv != null) {
            args.value = mv;
         }
         else if (useT) {
            this.nowCmd(args);
         }
         else {
            this.todayCmd(args);
         }
      }
   },

   /*
   Adds or subtracts args.seconds from the current value.
   If it hits a min or max, it stops at the min/max value.
   If args.settings.seconds is assigned, that number is used to increment.
   It can be a positive or negative number.
   If args.settings.seconds is unassigned, it increments by one second.

   args.settings properties:
   * keepSecs (boolean) - 
      Normally seconds are stripped when changing by minutes or higher.
      Set this to true to keep the seconds.
      Defaults to false.
   * nextMin (intnl) -
      When stripping seconds and decreasing, if the existing value's seconds
      is greater than nextMin, then add one minute.
      This allows 12:59:59 to go to 12:00:00 instead of 11:59:00 when decreasing by 1 hour.
      nextMin defaults to 58 if not assigned.
      If you don't want this feature set nextMin to null.
   * roundBy (intnl) -
      Round up or down to the next increment of this number,
      which is a time in seconds.
      Examples:
      If roundBy=60, it rounds to the next minute
      If roundBy=5 * 60, it rounds to the next 5 minutes
      Does nothing when null or 0. It defaults to null.

   If you need to have a fixed value for "now", assign the desired time
   to args.now.
   */
   addSeconds: function ( args ) {
      function round(val, inc) {
         var rb = set.roundBy;
         if (rb) {
            var isNum = typeof(val) == "number";
            if (!isNum) {
               val = that._dateToSeconds(val, isUTC);
            }
            var s = Math.floor(val % rb);
            if (s) {
               val = val - s + (inc ? rb : 0);
            }
            if (!isNum) {
               val = that._secondsToDate(val, isUTC);
            }
         }
         return val;
      }
      var s;   // holds seconds in various calculations
      var set = args.settings;

      if (set.roundBy === undefined) {
         set.roundBy = 60;
      }
      if (set.nextMin == undefined) {
         set.nextMin = 58;
      }

      var adjust = set.seconds || 1;
      var inc = adjust > 0;   // increase when true
      var isUTC = this.getUseUTC();
      var orig = args.value;
      var time = orig;
      var that = this;  // for use in round() because it changes this to the window object.
      if (time == null) {
         // if blank, assign the initial value when this command is first invoked.
         this._adjustBlank(args, inc);

         if (set.roundBy) {
            args.value = round(args.value, inc);
         }
         args.value = this._adjustForRange(args.value);

/*
         if (!set.keepSecs && (Math.abs(adjust) > 59)) // strip off seconds
            args.value.setSeconds(0);
*/
         return true;
      }

      // works on an integer representation of the number of seconds
      if (time instanceof Date) {  // convert to integer
         time = this._dateToSeconds(time, isUTC);
      }

      var ntime = time; 

      if (!inc && set.nextMin && set.roundBy && (set.roundBy < Math.abs(adjust))) {
      // if decrementing and the seconds are above nextMin,
      // round up to the next minute then adjust.
      // This allows 11:59:59 to be decremented to 11:59:00 (using -60 secs) and 11:00:00 (using -3600)
      // If this did not happen, 11:59:59 would become 11:58:00 (using -60) and 10:59:00 (using -3600)
         s = Math.floor(ntime % 60);
         if (set.nextMin < s) {
            ntime = ntime + (60 - s);
         }
      }


      // if the current time isn't rounded to this value, make that happen INSTEAD of the adjustment
      if (Math.floor(ntime % set.roundBy)) {
         ntime = round(time, inc);
      }
      else { // adjust normally
         ntime = round(ntime + adjust, inc);
      }

      if (ntime < 0) {
         ntime = 0;
      }
/*
      // round up to the next increment of roundBy (in seconds)
      // If roundBy=60, it rounds to the next minute
      // If roundBy=5 * 60, it rounds to the next 5 minutes
      var rb = set.roundBy;
      if (rb)
      {
         s = Math.floor(time % rb);
         if (s)
         {
            ntime = time - s + (inc ? rb : 0);
         }
         else
         {
            s = Math.floor(ntime % rb);
            if (s)
               ntime = ntime - s + (inc ? rb : 0);
         }
      }
*/
/*
      if (!set.keepSecs && (Math.abs(adjust) > 59)) // strip off seconds
      {
         s = Math.floor(ntime % 60);
         if (s)
         {
            ntime = ntime - s;
            // if decreasing, jump to the next minute. 
            // This allows 11:59:59 to be decremented to 11:59:00 (using -60 secs) and 11:00:00 (using -3600)
            // If this did not happen, 11:59:59 would become 11:58:00 (using -60) and 10:59:00 (using -3600)
            var asc = set.nextMin;
            if (asc !== null) // null means do not use. Undefined means set the default
            {
               if (asc === undefined)
                  asc = 58;
               if (!inc && (s > asc))
                  ntime += 60;
            }
         }
      }
*/
      if (orig instanceof Date) { // convert ntime to date
         ntime = this._secondsToDate(ntime, isUTC);
/*
         if (ntime >= 24 * 3600)
            ntime = 24 * 3600 - 1;
         var h = Math.floor(ntime / 3600);
         var m = Math.floor((ntime % 3600) / 60);
         s = Math.floor(ntime % 60);

         ntime = new Date();  // establish today's date
         ntime.setHours(h, m, s, 0);
         if (this.getUseUTC())
            ntime = this.asUTCDate(ntime);
*/
      }

      var ntimeadj = this._adjustForRange(ntime);
      var comp = this.compare(ntime, ntimeadj);
      if (comp < 0) {
         ntime = round(ntimeadj, true);   // below rounds up
      }
      else if (comp > 0) {
         ntime = round(ntimeadj, false);  // above rounds down
      }

/*
      // if adjusted, see if seconds should be stripped
      if (!set.keepSecs && (Math.abs(adjust) > 59)) // strip off seconds
      {
         // unlike above, always rounds down.
         if (ntime instanceof Date)
            ntime.setSeconds(0); // possible that this will set the seconds below minvalue, but we'll live with that
         else
            ntime = ntime - Math.floor(ntime % 60);
      }
*/
      args.value = ntime;

      return this.compare(orig, ntime) != 0;
   },

   /*
   Command that returns args.value assigned to now.
   Override the value of "now" as the args.now property.
   */
   nowCmd: function ( args ) {
      if (args.now != null) {
         args.value = args.now;
         return true;
      }
      var nDate = new Date(); // assigned to today in local time

      if (this._nativeTypeName == "number") {
         nDate = this._dateToSeconds(nDate, false);
      }
      else {
         if (this.getUseUTC()) {
            nDate = this.asUTCDate(nDate);
         }
      }

      args.value = nDate;
      return true;
   },


   /* STATIC METHOD
   Converts a date object's hours, minutes and seconds to a total of seconds.
   time (Date object)
   isUTC (boolean) - When true, time holds a value in UTC time.
   */
   _dateToSeconds: function ( time, isUTC ) {
      if (isUTC) {
         return time.getUTCHours() * 3600 + time.getUTCMinutes() * 60 + time.getUTCSeconds();
      }
      return time.getHours() * 3600 + time.getMinutes() * 60 + time.getSeconds();
   },

/* STATIC METHOD
   Convert a time, in seconds, into a Date object.
   The date part will reflect today's date.
      time (intnl) - Time in seconds.
      isUTC (boolean) - When true, time holds a value in UTC time.
   Returns a Date object.
*/
   _secondsToDate : function ( time, isUTC ) {
      if (time >= 24 * 3600) {
         time = 24 * 3600 - 1;
      }
      else if (time < 0) {
         time = 0;
      }
      
      var h = Math.floor(time / 3600);
      var m = Math.floor((time % 3600) / 60);
      var s = Math.floor(time % 60);

      time = new Date();  // establish today's date
      time.setHours(h, m, s, 0);
      if (isUTC) {
         time = jTAC.TypeManagers.Base.prototype.asUTCDate(time);
      }
      return time;
   },


   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

   /*
   minValue property: GET function
   When null and it supports time, this returns a value representing 12 AM
   either as a Date object or integer.
   */
   getMinValue: function () {
      if (this.config.minValue == null) {
         if (!this.supportsDates() && this.supportsTimes()) {
            if (this.nativeTypeName() == "number")
               return 0;
            var date = new Date();  // current time in local time
            date.setHours(0, 0, 0, 0);
            if (this.getUseUTC()) {
               date = this.asUTCDate(date);
            }
            return date;
         }
      }
      return this.config.minValue;
   },


   /*
   maxValue property: GET function
   When null and using time values, this returns a value representing 11:59:59PM 
   either as a Date object or integer. If a duration, it uses the getMaxHours()
   method to determine the final hour.
   */
   getMaxValue: function () {
      if (this.config.maxValue == null)
         if (!this.supportsDates() && this.supportsTimes()) {
            var mh = 23;
            if (this.getMaxHours && (this.getMaxHours() != null)) {
               mh = this.getMaxHours();
            }
            if (this.nativeTypeName() == "number") {
               return (mh + 1) * 3600 - 1;   // one second less than max hours + 1
            }
            var date = new Date();  // current time in local time
            if (mh > 23) {
               mh = 23;
            }
            date.setHours(mh, 59, 59, 0);
            if (this.getUseUTC()) {
               date = this.asUTCDate(date);
            }
            return date;
         }
      return this.config.maxValue;
   },

/*
   When a string, see if can be converted to a date (culture neutral format)
   or positive integer (only digits).
   If the string is "Now", preserve it.
*/
   setBlankStartsAt: function(val) {
      if ((typeof val == "string") && (val != "Now") && (val != ""))
      {
         if (/^\d*$/.test(val)) {
            val = parseInt(val, 10);
         }
         else {
            var m = /^(\d+)\-(\d+)\-(\d+)( (\d+)\:(\d+)\:(\d+))?$/.exec(val);
            if (!m)
               this._error("Illegal value in BlankStartsAt");
            val = new Date(m[1], parseInt(m[2], 10) - 1, m[3]);
            if (m[4] != null)
               val.setHours(m[5], m[6], m[7]);
            if (!val)
               this._error("Illegal date in BlankStartsAt");
         }
      }
      this.config.blankStartsAt = val;
   }

} 
jTAC.addMembers("TypeManagers.BaseDatesAndTimes", jTAC_Temp);

}  // if jTAC.isDefined("TypeManagers.BaseDatesAndTimes")

/* ---- TypeManagers.BaseNumber prototype extensions --------------- 
   * "NextBy1", "PrevBy1" - increases or decrease by 1
   * "NextBy10", "PrevBy10" - increases or decrease by 10
   * "NextBy100", "PrevBy100" - increases or decrease by 100
   * "NextBy1000", "PrevBy1000" - increases or decrease by 1000
   * "NextByPt1", "PrevByPt1" - increases or decrease by 0.1
   * "NextByPt01", "PrevByPt01" - increases or decrease by 0.01
   * "NextAtCaret", "PrevAtCaret" - increase or decrease the element located at the caret.
      The digit to the right of the caret is incremented/decremented
   * "Clear" - Clear the value. Empty textbox.
--------------------------------------------------------------------------*/

if (jTAC.isDefined("TypeManagers.BaseNumber"))
{
jTAC_Temp =
{

   _initCmds: function () {
      this.installCmd({ commandName: "PrevBy1", func: this.addBy, inc: -1 });
      this.installCmd({ commandName: "NextBy1", func: this.addBy, inc: 1 });
      this.installCmd({ commandName: "PrevBy10", func: this.addBy, inc: -10 });
      this.installCmd({ commandName: "NextBy10", func: this.addBy, inc: 10 });
      this.installCmd({ commandName: "PrevBy100", func: this.addBy, inc: -100 });
      this.installCmd({ commandName: "NextBy100", func: this.addBy, inc: 100 });
      this.installCmd({ commandName: "PrevBy1000", func: this.addBy, inc: -1000 });
      this.installCmd({ commandName: "NextBy1000", func: this.addBy, inc: 1000 });
      if (this.getMaxDecimalPlaces() != 0) { // its an integer type. Cannot use decimal places.
         this.installCmd({ commandName: "PrevByPt1", func: this.addBy, inc: -0.1 });
         this.installCmd({ commandName: "NextByPt1", func: this.addBy, inc: 0.1 });
         this.installCmd({ commandName: "PrevByPt01", func: this.addBy, inc: -0.01 });
         this.installCmd({ commandName: "NextByPt01", func: this.addBy, inc: 0.01 });
      }
      this.installCmd({ commandName: "Clear", func: this.clearCmd, ignoreCurrent: true });
   },

   /*
   For a command that increments or decrements by args.settings.inc.
   If args.settings.inc is assigned, that number is used to increment.
   It can be a positive or negative number.
   If args.settings.inc is unassigned, it increments by 1.
   */
   addBy: function ( args ) {
      var adjust = args.settings.inc || 1;

      var orig = args.value;
      var nval = orig;
      if (nval == null) {
         // if blank, assign the initial value when this command is first invoked.
         this._adjustBlank(args, adjust > 0);
         args.value = this._adjustForRange(args.value);
         return true;
      }


      if (this.numDecPlaces) {
      // clean up math errors with a little rounding.
      // Capture # of dec places in current value
         var vdp = this.numDecPlaces(adjust);  // adjust's decimal places
         var tdp = this.numDecPlaces(nval); // value's decimal places

         nval = this.round(nval + adjust, 0, Math.max(vdp, tdp));
      }
      else {
         nval = nval + adjust;
      }

      nval = this._adjustForRange(nval);
      args.value = nval;
      return nval != orig;
   },

   /*
   Call for commands that need an existing value to calculate the next value,
   such as those that increment and decrement.
   Call when args.value is null.
   inc (boolean) - When true, the command is intended to increment.
   When false, decrement.
   */
   _adjustBlank: function ( args, inc ) {
      var mv = inc ? this.getMinValue() : this.getMaxValue();
      args.value = (mv != null) ? mv : 0;
   },


   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/
   /*
   minValue property: GET function
   When null and allowNegatives = false, return 0.
   */
   getMinValue: function () {
      if (this.config.minValue == null) {
         if (!this.getAllowNegatives()) {
            return 0;
         }
      }
      return this.config.minValue;
   }

} 
jTAC.addMembers("TypeManagers.BaseNumber", jTAC_Temp);

}  // if jTAC.isDefined("TypeManagers.BaseNumber")

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
   function applyOne(idx, element)
   {
      element = $(element);
      var options = element.data("jtac-datatypeeditor");
      if (options != null)
      {
         element.data("datatypeeditor", null);
         try
         {
            if (options)
            {
               options = window.eval("(" + options +");");
               element.dataTypeEditor(options);
            }
            else
               element.dataTypeEditor();
         }
         catch (e)
         {
            jTAC.error("Could not parse the data-jtac-datatypeeditor attribute of id [" + element.get()[0].id + "] Error info:" + e.toString());
         }
      }
   }

   function apply()
   {
      try
      {
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
