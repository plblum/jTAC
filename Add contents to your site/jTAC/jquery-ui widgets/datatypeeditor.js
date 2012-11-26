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
