// jTAC/TypeManagers/Base.js
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
Class: TypeManagers.Base   ABSTRACT CLASS
Extends: nothing

Purpose:
A TypeManager object understands data types, like integers, dates, currencies, 
and email addresses. Unique TypeManager classes are defined for each data type.

TypeManagers do a lot of things specific to each data type:
•	Convert between string and native type with the toValue() and toString() methods. 
   If you have a Connection object, its toValueFromConnection() simplifies 
   retrieving the value from the connection before conversion.
•	Check for validity of a string with the isValid() method.
•	Test a character to see if its supported by the type 
   (something used by the datatypeeditor widget) with the isValidChar() method.
•	Handles both culture specific and culture neutral formats. 
   Its toValueNeutral() and toStringNeutral() are used to get and 
   set the value of the hidden field used by the datatypeditor widget.
   Culture specific rules are implemented in the TypeManagers.BaseCulture subclass.
•	Compares two values with its compare() function, converting each value from a string if needed.

Many Conditions classes use TypeManagers. If their evaluation function requires one, 
its _evaluateRule() method gets the TypeManager in use from the Condition’s typeManager property.

TypeManagers.Base is the root base class for developing all TypeManagers.

Essential methods:
  toString(value) - 
      Conversion from native value to a string. Formatting rules are customized
      by properties introduced on the subclasses, such as ShowCurrencySymbol to add
      the currency character.

  toValue(string) - 
      Conversion from string to native value. Throws exceptions if conversion is not supported.
      Validation rules are also applied, based on properties introduced on the subclasses.

  toValueFromConnection(connection) - 
      Conversion from the value in a Connection.Base subclass,
      which may provide the actual type (no conversion needed) or a string (conversion needed).
      ONLY use when Connection scripts have been loaded.

  toValueNeutral(string) -
     Conversion from string to native value. The string should be culture neutral,
     not following the conventions of the current culture.
     For example, numbers should be using period for decimal separator
     and dates should be in yyyy-MM-dd format.

  toStringNeutral (value) -
      Conversion from native value to culture neutral string.

  isValid(text) - 
      Validate a string as correctly formatted to become the native type.
      Returns true if valid.

  compare(val1, val2) - 
      Compare two values, whether in a native type or string. 
      This comparison allows validation to have a generic way to compare values.
      Returns -1, 0, or 1 depending on if val1 is
      less than, equal, or greater than val2.

  isValidChar(chr) - 
      Assist the user interface by determining if a character is legal for it. 
      Textboxes will use this in their keypress event. 
      Returns true if the character is legal.

  toNumber(value) - 
      Converts the value into a number (float or int).
      Used to allow calculations even when the value is not a number.
      Especially useful for dates and times. 
      When the value is a number, its value is returned.
      When the value is a date, its value is the number of days since midnight Jan 01, 1970.
      When the value is a time, its value is the total seconds.
      When the value is a date time, its value is the number of seconds
      since midnight Jan 01, 1970.
      Other classes may define a differ result.
      If the TypeManager cannot convert to a number, return null.

  dataTypeName () - 
      Gets a string that identifies the real-world data type represented, 
      such as "date", "monthyear", or "currency".

  storageTypeName () - 
      Gets a string that identifies the storage data type (on the server side), 
      such as "integer", "float", and "boolean".

  nativeTypeName() - 
      A string that represents the name returned by the JavaScript typeof keyword
      that is supported by this class.

Properties common to all classes:
  friendlyName (string) -
      Provides a string that can be shown to the user representing this name.
      It can be localized through the jTAC.translations system.
      Classes provide the property lookupID to identify how to access
      the jTAC.translations system. The user can assign that property
      to override the default.
  friendlyLookupKey (string) -
      A lookup Key into the jTAC.translations system that will return
      a localized string for use by the friendlyName property.
      It defaults to the name set by dataTypeName()

See individual classes for their properties.

Comments:
A UI element, like a textbox, can own a single instance of 
a TypeManager to share amongst all classes that interact with that
object.
The Connection.BaseElement.getTypeManager() method provides
this service, looking for the data-jtac-datatype and
data-jtac-typemanager attributes on the element.
When found, it stores the TypeManager instance created
on the element.
To avoid this behavior, you must programmatically assign
a TypeManager instance that you created to the typeManager
property of the object using it.

Required libraries:
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED

Does not require or utilize jquery itself. These classes can be
used outside of jquery, except where jquery globalize demands it
(jquery globalize is designed to work independently of jquery.)

------------------------------------------------------------*/
if (!window.jTAC)
   throw new Error("window.jTAC not created.");

jTAC._internal.temp._TypeManagers_base = {
   "abstract": true,

   constructor: function ( propertyVals ) {
   },

   config: {
      friendlyName: null,  // null or string
      friendlyLookupKey: null  // null or string
   },
   configrule: {
      friendlyName: jTAC.checkAsStrOrNull,
      friendlyLookupKey: jTAC.checkAsStrOrNull
   },

   /*
   ABSTRACT METHOD
   A string that represents the name returned by the JavaScript typeof keyword
   that is supported by this class.
   */
   nativeTypeName : function () {
      this._AM();  // throws exception
   },

   /*
   ABSTRACT METHOD
   A string that represents the real-world data type, such as "float",
   "date", and "currency". This value is not used to evaluate the type passed
   into toValue(). It is used the consumer of this class to ensure the identity of the class.
   The name should be a syntax compatible with property names so it can be used
   in HTML tag's data properties like this: data-validate-range-datatype="date".
   Names should not be capitalized as a guideline to following property naming standards.
   */
   dataTypeName : function () {
      this._AM();  // throws exception
   },

   /*
   ABSTRACT METHOD
   A string that represents the data type stored on the server side, such as "float",
   "date", and "integer". It differs from the dataTypeName property which
   further describes a "float" as "currency", "percent", etc.
   The strings here are also used by Connection classes in their
   typeSupported() method. 
   Here are the the valid strings:
     "integer" - Supports a number value that is an integer. 
     "float" - Supports a number value that is a float.
     "date" - Supports a Date object representing only a date (the time is undefined).
     "datetime" - Supports a Date object representing both date and time.
     "time" - Supports a Date object representing only a time (the date is undefined).
     "boolean" - Supports a boolean value.
     "string" - Supports a string.

   Names should not be capitalized as a guideline to following property naming standards.
   */
   storageTypeName : function () {
      this._AM();  // throws exception  
   },

   /* 
   Convert from a native value to a string.
     value - the native value to convert. Its type must be supported by 
             the subclass implementing this method or it should throw an exception. 
             You can also pass a string. It will be first converted
             to the native type through toValue(). Then converted back to a string
             using the format parameter (or defaultFormat property).
   Returns: string. If the value represents nothing or is null, this will return
   the empty string.
   Exceptions: Throws exceptions when conversion cannot happen
   such as when the format is not appropriate for the data type being converted.
   SUBCLASSING: Override _nativeToString method to do the actual
   conversion.
   */
   toString : function (value) {
      if (value === undefined)   // since toString() is called for non-conversion tools
         return this.$className;

      try
      {
         this._pushContext();
         // if a string is passed, it is converted to native type
         // This lets it get converted to the native type in prep for converting back to a string in the specified format.
         if (typeof value == "string")
            value = this.toValue(value);

         value = this._reviewValue(value);   // may throw exceptions

         return this._nativeToString(value);
      }
      finally {
         this._popContext();
      }
   },

   /* ABSTRACT METHOD. MUST OVERRIDE
    Used by the toString() method to handle actual conversion between
    a native value and string. It can apply formatting rules
    from properties introduced by the subclass. 
    It can also throw exceptions if the value passed is not legal.
      value - The value to convert to a string. Must be the native type expected by the class.
   */
   _nativeToString : function (value) {
      this._AM();  // throws exception
   },

   /*
   Convert from a string to the native type.
     text - the string to convert. It must be compatible with
        the formatting rules or an exception will be thrown. 
   Returns: native value. If the value represents nothing or is null, 
   this will return null.
   Exceptions: Throws exceptions when conversion from strings fails.
   SUBCLASSING: Override _stringToNative method to do the actual
   conversion.
   */
   toValue : function (text) {
      try
      {
         this._pushContext("TypeManagers.Base [" + text + "]");
         if (typeof (text) == this.nativeTypeName())
            return this._reviewValue(text);   // it is already the native type; may throw exception
         if (typeof (text) != "string")
            this._error("Must pass a string in the text parameter.");
         if (this._isNull(text))
            return null;
         var v = this._stringToNative(text);
         return this._reviewValue(v);  // may throw exception
      }
      finally {
         this._popContext();
      }
   },


   /*
   Convert from the value in a Connection.Base subclass. Connections
   support both string and strong typed values. When the supported 
   strong type matches the storageTypeName property of this TypeManager class,
   it is returned. Otherwise, its text value is extracted and passed
   to the toValue() method.
      connection (Connection.Base subclass) - The Connection that supplies the value.
   Returns the native value or null if the value represents null.
   Exceptions: Throws exceptions when conversion from strings fails or the 
      type of value the connection supplies does not match what the TypeManager expects.
   SUBCLASSING: Rare
   ONLY use when Connection scripts have been loaded.
   */
   toValueFromConnection : function (connection) {
      try
      {
         this._pushContext();

         if (!(connection instanceof jTAC.Connections.Base))
            this._error("Must pass a Connection class.");
         if (connection.typeSupported(this.storageTypeName()))
            return this._reviewValue(connection.getTypedValue(this.storageTypeName()));
         return this.toValue(connection.getTextValue());
      }
      finally {
         this._popContext();
      }
   },


   /* ABSTRACT METHOD. MUST OVERRIDE.
   Used by toValue() method to do the actual conversion 
   from a string to the native type.
     text - the string to convert. It must be compatible with
        the formatting rules or an exception will be thrown. 
        If the string has lead or trailing spaces,
        they are ignored by the parser.
   Returns: native value. If the value represents nothing or is null, 
   this will return null.
   Exceptions: Throws exceptions when conversion from strings fails.
   */
   _stringToNative : function (text) {
      this._AM();  // throws exception
   },

   /*
   Returns true if the value represents null.
   This method allows the empty string and null.
   */
   _isNull : function (val) {
      return val == "" || val == null;
   },

   /*
   Evaluates the value. Looks for illegal cases. Throws exceptions when found.
   It may change the value too, if needed, such as to round it.
      value - The value to check. Must be the native type.
   Returns the value, which may have been modified.
   */
   _reviewValue : function (value) {
      if (typeof (value) != this.nativeTypeName())
         this._error("Type not supported");
      return value;
   },

   /* ABSTRACT METHOD. MUST OVERRIDE.
      Conversion from string to native value. The string should be culture neutral,
      not following the conventions of the current culture.
      For example, numbers should be using period for decimal separator
      and dates should be in yyyy-MM-dd format.
         text (string) - The string to parse and convert.
      Returns: The native value or null if the text is the empty string.
      Exceptions: Thrown if the string cannot be converted.
   */
   toValueNeutral : function (text) {
      this._AM();  // throws exception
   },

   /* ABSTRACT METHOD. MUST OVERRIDE.
      Conversion from native value to culture neutral string.
         val - The native value to convert.
      Returns: The native value or null if the text is the empty string.
   */
   toStringNeutral : function (val) {
      this._AM();  // throws exception
   },


   /*
   Checks if the text passed is a valid pattern for the native type.
     text - the string to check. If the string has lead or trailing spaces,
            they are ignored by the parser.
     cannoteval (bool) - When the text is the empty string or null, 
             this is the value returned.
             If the parameter is undefined, it returns false.
   Returns: true when text is a valid pattern and false when it is not.
   If the text parameter is the empty string or null, the result depends
   on the cannoteval parameter.
   SUBCLASSING: Rare
   */
   isValid : function (text, cannoteval) {
      if (cannoteval == undefined)
         cannoteval = false;
      if (text == null)
         return cannoteval;
      if ((typeof (text) == "string") && (jTAC.trimStr(text) == ""))
         return cannoteval;
      try
      {
         return this.toValue(text) != null;
      }
      catch (e)
      {
         return false;
      }
   },



   /* 
   Compare two values that represent the same data type.
   Either or both values can be strings or the native value.
      val1 - the value to compare on the left side of the comparison operator.
         If it is a string, it is passed to toValue() first to get it into a native value.
      val2 - the value to compare on the right side of the comparison operator.
         If it is a string, it is passed to toValue() first to get it into a native value.
   Returns: -1 when val1 < val2; 0 when val1 = val2; 1 when val1 > val2.
   Exceptions: Throws exceptions when conversion from strings fails
   or either of the values is null.
   */
   compare : function (val1, val2) {
      if (typeof (val1) == "string")
         val1 = this.toValue(val1);
      if (typeof (val2) == "string")
         val2 = this.toValue(val2);
      if ((val1 == null) || (val2 == null))
         this._error("Parameter value was null.");
      if (val1 < val2)
         return -1;
      else if (val1 > val2)
         return 1;
      return 0;
   },

   /*
   Evaluates a single character to determine if it is valid in a string
   representing the type. It does not care about the position or quantity
   of this character in the string that is being created.
   For example, if this is a date entry that supports only the short date format,
   it considers digits and the decimal separator to be valid.
      chr - A single character string to evaluate.
   Returns: true when the character is valid and false when invalid.
   */
   isValidChar : function (chr) {
      if ((chr == null) || (typeof (chr) != "string") || (chr.length != 1))
         this._error("Parameter must be a single character.");

      return true;
   },

   /*
   Converts the value into a number (float or int).
   Used to allow calculations even when the value is not a number.
   Especially useful for dates and times. 
   When the value is a number, its value is returned.
   When the value is a date, its value is the number of days since midnight Jan 01, 1970.
   When the value is a time, its value is the total seconds.
   When the value is a date time, its value is the number of seconds
   since midnight Jan 01, 1970.
   Other classes may define a differ result.
   If the TypeManager cannot convert to a number, return null.
   */
   toNumber : function (value) {
      return null;
   },

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

   /*
   friendlyName property: GET function
   */
   getFriendlyName : function () {
      var r = this.config.friendlyName;
      var lu = this.getFriendlyLookupKey();
      if (lu) {
         r = jTAC.translations.lookup(lu, r);   // r may be null
      }
      if (r == null) {
         r = this.dataTypeName();
      }
      return r;
   },

   /*
   friendlyLookupKey property: GET function
   */
   getFriendlyLookupKey : function () {
      if (this.config.friendlyLookupKey == null)
         return this.dataTypeName();
      return this.config.friendlyLookupKey;
   },

   /* --- TYPEMANAGER UTILITY FUNCTIONS --------------------------
   Type related static methods that can be used throughout jTAC.
   Any of these can be called by using 
   jTAC.TypeManagers.Base.prototype.functionname(params)
   ------------------------------------------------------------ */
   /* STATIC METHOD. 
    Rounds a decimal value in numerous ways.
      value (float) - the value to round.
      rm (int) - one of these rounding modes:
         0 = Point5: round to the next number if .5 or higher; round down otherwise
         1 = Currency: Banker's rounding. Like Point5 except when the last digit is 5, round up when the prior digit is odd and round down when even.
         2 = Truncate: drop any decimals after mdp; largest integer less than or equal to a number.
         3 = Ceiling: round to the nearest even number.
         4 = NextWhole: Like ceiling, but negative numbers are rounded lower instead of higher
         Anything else throws an exception if the number of decimal digits exceeds mdp.
      mdp (int) - the number of decimal places to preserve. For example, when 2, it rounds based on
         the digits after the 2nd decimal place. If -1, no rounding. Return value
    Returns the rounded decimal value.
    Acknowledgement: this code is taken from Peter's Data Entry Suite v5 (http://www.peterblum.com/des/home.aspx)
    a product by Peter Blum (the author of jTAC.).
    Peter certifies that it is covered by the jTAC license.
    To use as a static method:
    jTAC.TypeManagers.Base.prototype.round(params);
   */
   round : function (value, rm, mdp) {
      if (mdp == -1)
         return value;
      // if the number of decimal points is lessthan or equal to mdp, do nothing
      // this limits the likelihood of introducing calculation errors in creating sv below
      if (jTAC.TypeManagers.Base.prototype.numDecPlaces(value) <= mdp)   // not enough decimal digits to round
         return value;

      var sf = Math.pow(10.0, mdp);   // ScaleFactor
      var sv = value * sf;   // ScaledValue. Put all significant digits in the integer side
      switch (rm)
      {
         case 0:   // round to the next number if .5 or higher; round down otherwise
            // NOTE: CPU rounding errors on Math.round() cause problems. 
            // Ex: 1.5 x 54.05 = 81.749999999 instead of 81.75. So Math.round() would round down when we expect it to round up
            sv = Math.abs(sv);
            sv = sv.toFixed(1);
            sv = parseFloat(sv).toFixed(0);
            sv = parseFloat(sv);

            if (value < 0)
               sv = -sv;

            return sv / sf; // return the digits to their decimal places

         case 1:  // Banker's rounding. Like Point5 except when the last digit is 5, round up when the prior digit is odd and round down when even.
            var nv = Math.floor(sv); // Math.round(sv);
            var f = sv - nv;
            var nv = (f == 0.5) ? ((nv % 2 == 0) ? nv : nv + 1) : Math.round(sv);

            return nv / sf; // return the digits to their decimal places

         case 2:  // Truncate - largest integer less than or equal to a number.
            sv = Math.floor(Math.abs(sv));
            if (value < 0)
               sv = -sv;
            return sv / sf; // return the digits to their decimal places

         case 3:  // Ceiling - smallest integer greater than or equal to a number.
            sv = Math.ceil(sv);
            return sv / sf; // return the digits to their decimal places

         case 4:  // NextWhole
            sv = Math.ceil(Math.abs(sv));
            if (value < 0)
               sv = -sv;
            return sv / sf; // return the digits to their decimal places
         default: // excess decimal digits. throw exception.
            this._inputError("Too many decimal places.");

      }  // switch
      return 0;   // should never get here
   },

   /* STATIC METHOD. CAN BE CALLED WITHOUT AN INSTANCE OF A TYPEMANAGER
    Utility to identify the number of decimal places are used in the value.
    To use as a static method:
    jTAC.TypeManagers.Base.prototype.numDecimalPlaces(params);
   */
   numDecPlaces : function (value) {
      var text = jTAC.TypeManagers.Base.prototype.floatToString(value);
      var dPos = text.indexOf(".");
      if (dPos < 0) // whole number
         return 0;
      return text.length - (dPos + 1);
   },

   /* STATIC METHOD
   Converts a decimal value to a string with fixed notation.
   Works around javascript decimal's toString function when it 
   returns exponential notation after 6 decimal digits.

      value (number) - the value to convert.

   To use as a static method:
   jTAC.TypeManagers.Base.prototype.floatToString(value);
   */
   floatToString : function (value) {
      var s = value.toString(); // when > 6 decimal digits, it returns exponential notation
      if ((s.indexOf('e-') > -1) && value.toFixed) {
         var m = s.match(/^.e\-(\d*)$/);
         var sz = parseInt(m[1]);
         s = value.toFixed(sz);
      }
      return s;
   },

   /* STATIC METHOD
   Creates a Javascript date object for Year, Month, Day, at 0 minutes in the day,
   using the UTC rules.
      y - Integer. Year
      m - Integer. Month, where 0 is jan and 11 is dec
      d - Integer. Day where 1 is the first of a month
      h - integer. Hours. Can be null.
      mn - integer. Minutes. Can be null.
      s - integer. Seconds. Can be null.
   Alternatively, pass one parameter, a date object in local format. It
   converts both date and time elements to local time.
   Returns a Date object with the UTC date or null if no valid date could be created
   To use as a static method:
   TAC.TypeManagers.Base.prototype.asUTCDate(y,m,d)
   */
   asUTCDate: function (y, m, d, h, mn, s) {
      if ((typeof y == "object") && (y instanceof Date)) {
         var date = y;
         y = date.getFullYear();
         m = date.getMonth();
         d = date.getDate();
         h = date.getHours();
         mn = date.getMinutes();
         s = date.getSeconds();

      }
      // allow null date parameters to return null
      if ((y == null) || (m == null) || (d == null)) { //NOTE: m=0 is a valid value. That's why I'm not using !m
         return null;
      }

      if (h == null)
         h = 0;
      if (mn == null)
         mn = 0;
      if (s == null)
         s = 0;

      var r = new Date(0);
      // Safari 1-1.2.3 has a severe bug that setUTCFullYear(y, m, d) avoids.
      // In most time zones (GMT + 0000 through GMT + 1200 through GTM - 0800)
      // It returns the wrong values. It often returns one month and one day back
      // This doesn't fix Safari but consistently returns better dates of one day back for those
      // time zones without breaking the US timezones
      r.setUTCFullYear(y, m, d);
      r.setUTCHours(h, mn, s, 0);

      return r;
   }

}

jTAC.define("TypeManagers.Base", jTAC._internal.temp._TypeManagers_base);


/* STATIC METHOD - EXTENDS jTAC
   Creates or updates an object of the class identified by classCtor.
   Returns the object. Use in property setters that host objects.
      val - Supports these values:
         Class specific object - If passed, it is returned without change.
         javascript object with jtacClass property -
            Creates an instance of the class named by the jtacClass property
            and assigns the remaining properties to the new object.
         javascript object without jtacClass property - 
            if existingObject is assigned, its properties are updated.
            If existingObject is null, an exception is thrown.
            If illegal properties are found, exceptions are thrown.
         string - Specify the class or alias name of the class to create. 
            That class is created with default properties
            and returned.
         null - return the value of existingObject.
      existingObject - Either null or an object instance. Usage depends on val.
         
*/
jTAC.checkAsTypeManager = function ( val, existingObject ) {
   return jTAC.checkAsClass( val, existingObject, jTAC.TypeManagers.Base );
}
/*
jTAC.checkAsTypeManager = function ( val, defaultValue ) {
   if ( ((val == null) || ( val == "")) && (defaultVal !== undefined) )
      return defaultVal || null;
   try {
      jTAC._internal.pushContext("jTAC.checkAsTypeManager");

      if ( val && (typeof val == "object") && !val.$className) {
         if ( val.jtacClass ) {
            val = jTAC.create(null, val);
         }
         else if ( defaultVal ) {
      // a plain object and just update the properties on defaultVal and return it.
      // Reject it if any property is not legal
            for (var name in val) {
               if (!defaultVal.setProperty(name, val[name]))  // will throw exceptions for illegal values
                  jTAC.error("Could not set the property [" + name + "] on the TypeManager[" + defaultVal.$fullClassName +  "].");
            }
            return defaultVal;
         }
      }
      else if (typeof(val) == "string") {
         val = jTAC.create(val, null, true);
      }
      if (val instanceof jTAC.TypeManagers.Base) {
         return val;
      }

      jTAC.error("Requires a TypeManager object.");
   }
   finally {
      jTAC._internal.popContext();
   }
}
*/
/* STATIC METHOD - EXTENDS jTAC
Same as jTAC.checkAsTypeManager but allows assigning null to the result.
*/
jTAC.checkAsTypeManagerOrNull = function ( val ) {
   return jTAC.checkAsTypeManager(val, null);
}

/* STATIC METHOD - EXTENDS jTAC
   When you want to use data-jtac-datatype and data-jtac-typemanager attributes
   on an HTML element but are not using HTML 5, use this method.
*/
jTAC.addDataTypeAttributes = function(elementId, datatype, json)
{
   var conn = jTAC.connectionResolver.create(elementId);
   conn.setData("jtac-datatype", datatype);
   conn.setData("jtac-typemanager", json);
}

/* --- jTAC.plugInParser --------------------------------------------
Sets up the plugInParser method on jTAC.

plugInParser is called to connect a custom parser object to a TypeManager class.

1. Create a jTAC class with these three members (and any more you need):
   * parse(text) - The parser. It is is passed the string to parse
     and returns the value expected by the TypeManager class's native _parse() method.
     It throws exceptions via this._inputError() for errors found.
   * valChar(orig) - Called by TypeManagers.isValidChar to assertain
     the characters allowed by the parser. It is passed a string with
     the characters defined natively. valChar should return
     the same list, a replacement or a modified version.
   * owner - A field that will be assigned the owning TypeManager object
     to use your parser.
2. Register that class with jTAC using jTAC.define("TypeManagers.classname", memberobject);

3. Call jTAC.plugInParser("[name of parser class]", "[name of TypeManager class to extend]")

See examples in \TypeManagers\PowerDateParser.js and PowerTimeParser.js.

When finished, users can either use your parser or by setting the new
[nativeParser] property to true, can use the original parser.

The user can assign any properties on the parser object by referencing
them through the [parserOptions] property on the TypeManager.
------------------------------------------------------------------ */

jTAC.plugInParser = function(parserClass, typeManagerClass) {

   /* --- EXTENDED TypeManagers.BaseTime -------------------------------
   Attaches the PowerTimeParser to the TypeManagers.BaseTime class
   by adding and replacement members of BaseTime's prototype.

   Adds these properties:
      parserOptions -
         Reference to the PowerTimeParser. Access it to update its options.
      nativeParser -
         While PowerTimeParser.js is loaded, all calls to BaseTime._parseTime()
         will use it. If you have a situation where you simulateously 
         need to use the native _parseTime method, set this to true.
         It defaults to false.
   ------------------------------------------------------------------ */

   var members = {
      config: {
         parserOptions: null,
         nativeParser: false
      },

   /*
      Replaces the original method on TypeManagers.BaseDatesAndTimes.prototype.
      Uses nativeParser to select between original and the Parser class.
   */
      _parse: function( text ) {
         return this.getNativeParser() ? 
            this._nativeParse(text) : // this method is created below
            this.getParserOptions().parse(text);
      },

   /*
      Replaces the original method on TypeManagers.BaseDatesAndTimes.prototype.
      Calls the valChars() method on the Parser class.
   */
      _valChars : function () {
         var r = this._nativeValChars(); // this method is created below
         if (!this.getNativeParser()) {
            var p = this.getParserOptions();
            if (p) {
               r = p.valChars(r);
            }
         }
         return r;
      },

/*
   Creates the class if not already supplied.
*/
      getParserOptions: function() {
         var p = this.config.parserOptions;
         if (!this.config.parserOptions) {
            p = this.config.parserOptions = 
               jTAC.create(parserClass);
            p.owner = this;
            this._registerChild(p);
         }
         return p;
      },

   /*
   Can only assign an object whose properties will be copied onto 
   the same named properties of the parser class.
   It can be an actual parser class instance, which will be directly assigned.
   */
      setParserOptions: function (val)
      {
         if ((val == null) || (typeof val != "object"))
            this._error("Must pass an object whose properties match those on the parserOptions property.");
         if (val.instanceOf && val.instanceOf(parserClass)) {
            val.owner = this;
            this.config.parserOptions = val;
         }

         else {
            var parser = this.getParserOptions();
            for (var name in parser.config)
            {
               if (val[name] !== undefined)
                  parser.config[name] = val[name];
            }
         }
      }

   }

   var cl = jTAC.getClass(typeManagerClass);
   var proto = cl.prototype;

   if (proto._parse === undefined)
      jTAC.error("Cannot use jTAC.plugInParser() with [" + typeManagerClass + "].");

   // Preserve the native _parse() method as "_nativeParse" and 
   // _valChars() method as "_nativeValChars" so they remain available.
   proto._nativeParse = proto._parse;
   proto._nativeValChars = proto._valChars;

   jTAC.addMembers(typeManagerClass, members);  // replaces _parse and _valChars

}  // end plugInParser function
