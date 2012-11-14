// jTAC/TypeManagers/Command extensions.js
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

