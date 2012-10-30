// jTAC/TypeManagers/BaseString.js
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
Class : TypeManger.BaseString    ABSTRACT CLASS
Extends: TypeManagers.Base

Purpose:
Base class for any types that use a string to host its data.

The toNumber() function always returns null.
Subclasses can override isCaseIns() function to determine if 
compare() uses case sensitive or insensitive matches.

There is no localization built into this class.

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
None

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_BaseString = {
   extend: "TypeManagers.Base",
   "abstract": true,

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   nativeTypeName : function () {
      return "string";
   },

   storageTypeName : function () {
      return "string";
   },

   /*
   Converts non strings to strings first before letting _stringToNative 
   do further processing. Validation occurs last, with _reviewValue.
   */
   toValue : function (text) {
      if (text == null)
         return "";
      if (typeof (text) != "string") {
         text = text.toString();
      }
      var v = this._stringToNative(text);
      return this._reviewValue(v);  // may throw exception
   },


   /* 
   Convert from a native value to a string, applying globalization
   rules for the culture defined in the cultureName property.
     value - the native value to convert. Its type must be supported by 
             the subclass implementing this method or it should throw an exception. 
             You can also pass a string in a format compatible with a default formatting
             rule known to the jquery-globalize. That string will be converted
             first to the native type through toValue(). Then converted back to a string
             using the format parameter (or defaultFormat property).
   Returns: string. If the value represents nothing or is null, this will return
   the empty string.
   Exceptions: Throws exceptions when conversion cannot happen
   such as when the format is not appropriate for the data type being converted.
   SUBCLASSING: Override _nativeToString method to do the actual
   conversion.
   */
   toString : function (value) {

      if (value == null)
         return "";
      if (typeof (value) != "string") {
         value = value.toString();
      }

      value = this._reviewValue(value);   // may throw exceptions

      return this._nativeToString(value);
   },

   /* 
    Returns the same value. If value is not a string, it is converted to a string
    using the javascript toString() method. If the value is null, this returns null.
   */
   _nativeToString : function (value) {
      if (value == null)
         return "";
      return value.toString();
   },


   /*
    Returns the same value passed in.
   */
   _stringToNative : function (text) {
      return text;
   },

   /*
   Returns true if the value represents null.
   This method allows null. if emptyStrFalse is false
   the empty string also means null.
   */
   _isNull : function (val) {
      if (val == "")
         return true;
      return val == null;
   },

   /* 
   Compare two strings, applying case insensitive matching if _isCaseIns() is true.
      val1 - the value to compare on the left side of the comparison operator.
      val2 - the value to compare on the right side of the comparison operator.
   Returns: -1 when val1 < val2; 0 when val1 = val2; 1 when val1 > val2.
   Exceptions: Throws exceptions when either of the values is null.
   */
   compare : function (val1, val2) {
      val1 = this.toValue(val1); // ensures it is a string
      val2 = this.toValue(val2);
      if ((val1 == null) || (val2 == null))
         this._error("Parameter value was null.");
      if (this._isCaseIns()) {
         val1 = val1.toLowerCase();
         val2 = val2.toLowerCase();
      }
      if (val1 < val2)
         return -1;
      else if (val1 > val2)
         return 1;
      return 0;
   },

/*
Tells compare() if it needs to do a case sensitive or insensitive match.
When true, it is case insensitive.
*/
   _isCaseIns : function() {
      return false;
   },


   /* 
      Returns the original text.
   */
   toValueNeutral : function (text) {
      return text;
   },


   /* 
      Returns the original value, converted to string if needed.
   */
   toStringNeutral : function (val) {
      return this.toString(val);
   },


   /*
   Always returns true
   */
   isValidChar : function (chr) {
      return true;
   },

   /*
   Returns null. (not used)
   */
   toNumber : function (value) {
      return null;
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("TypeManagers.BaseString", jTAC._internal.temp._TypeManagers_BaseString);

﻿// jTAC/TypeManagers/BaseStrongPatternString.js
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
Class : TypeManger.BaseStrongPatternString   ABSTRACT CLASS
Extends: TypeManagers.BaseString

Purpose:
Base class for any string that is evaluated against a regular expression
to validate it.

Override these methods:
_regExp() - Returns an instance of the javascript RegExp object used to evaluate
   the string. Always ensure that it evaluates the full string by using the 
   ^ and $ symbols in the regexp pattern.  
dataTypeName() - Return the type name.

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
   altREPattern (string) - 
      Allows overriding the predefined regular expression pattern
      in case you have a different idea of the appropriate regular expression.
      If set, the _regExp() function is not used to create this. Instead,
      this and the _isCaseIns() are used.
      A good way to override this globally is to add a script that
      sets this in the prototype of the class you are modifying:
      TypeManagers.classname.prototype._REPattern = "pattern";


Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseString

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_BaseStrongPatternString = {
   extend: "TypeManagers.BaseString",
   "abstract": true,

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      altREPattern : ""
   },

   configrules: {
   },

/*
Checks the string against the regular expression. Throws
exception if there is no match. Otherwise, it returns the same text
*/
   _reviewValue : function(value) {
      var text = this.callParent([value]);
      if (text == "") {
         return text;
      }
      var re;
      if (this.getAltREPattern()) {
         re = new RegExp(this.getAltREPattern(), this._isCaseIns() ? "i" : "");
      }
      else {
         re = this._regExp();
      }
      if (!re || re.test(text)) {
         return text;
      }
      this._inputError("Invalid " + this.dataTypeName() + " [" + text + "]");
   },

/* ABSTRACT METHOD
Returns an instance of the javascript RegExp object used to evaluate
   the string. Always ensure that it evaluates the full string by using the 
   ^ and $ symbols in the regexp pattern.   
*/
   _regExp : function() {
      this._AM();
   }


   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("TypeManagers.BaseStrongPatternString", jTAC._internal.temp._TypeManagers_BaseStrongPatternString);

﻿// jTAC/TypeManagers/BaseRegionString.js
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
Class : TypeManger.BaseRegionString
Extends: TypeManagers.BaseString

Purpose:
Handles characteristics of a data type that varies by the region of the world,
such as phone numbers, postal codes, etc.

Each subclass defines a "RegionsData" object on the window object and overrides
_defaultRegionsData to supply it.
The RegionsData object defines each region as a property name 
and an object with these properties as the value:
   * name (string) - Same name as the property. Lets consumers of this object
      identify it.
   * pattern (string) - The regular expression pattern used
      to validate the entire string passed into the TypeManager (via toValue).
      Patterns must be created within this structure: (^your pattern$).
      This allows for multiple patterns to be merged when the user
      defined a pipe delimited list of region names in the TypeManager's
      'region' property.

      Alternatively, this can be a function that is passed the text
      and returns true if it is valid.
   * caseIns (boolean) - When case insensitivity is required,
      define this with a value of true. Omit or set to false if not needed.
   * validChars (string) - The regular expression pattern used
      to validate a single character as a legal character of the pattern.
      This is used by the isValidChar() function.
   * toNeutral (function) - If you want to pass back to the server
      a string without some of the formatting, define this function.
      It is passed the text and returns the cleaned up text.
      For example, phone number may have everything except digits stripped.
      This value will be used by the toValueNeutral() function and
      is used by the dataTypeEditor widget when you have setup the hidden field
      that hosts a neutral format.
   * toFormat (function) - If you want to apply formatting to a neutral format
      to display it to the user, define a function here. It is passed
      the text to format and returns the formatted text.
      This value is used by toString(). You may need to make it work with 
      already formatted text, such as running it through the toNeutral()
      function first.

The RegionsData object must always have a "defaultName" property whose value is
the name of another property that will be used if the 'region' property
is left unassigned.

Sometimes a few regions use the same patterns. You can create alias properties.
Define the property name for the region and the value as a string with the 
name of the other property that holds an object.

Example RegionsData object:
var jTAC_PhoneNumberRegionsData = 
{
   defaultName: "UnitedStates",

   UnitedStates:
   {
      pattern : "(^([1])?\\s*(\\([2-9]\\d{2}\\))?\\s*\\d{3}[\\s\\-]?\\d{4}$)",
      validChars : "[0-9 \\(\\)\\-]",
      toNeutral : function(text)
         {  
            // strip digits here
            return r;
         }
      toFormat : function(text)
         {
            var r = jTAC_PhoneNumberRegionData.UnitedStates.toNeutral(text);
            // insert separators here.
            return r;
         }
   }
}

This is designed so the user can expand the list of regions, by adding
new properties to the object, and replace elements of an individual RegionsData node if needed.
To add, you can use this:
object["regionname"] = {pattern: value, more properties};
To replace the pattern property:
object["regionname"].pattern = "pattern";

You can also create your own full RegionsData object and merge its properties
with the existing one like this:
jTAC.extend(your object, existing RegionsData object);

Set up:
Set the 'region' property to the name of the desired region, or to "" to 
select the 'defaultName' property which specifies the default region name.

You can also define the region globally by passing the region name
to window.jTAC.setGlobalRegionName(name).
Then assign 'region' to "GLOBAL" (all caps) to use its values.
This way, you can build a Country field that when changed, impacts all TypeManagers.
Then all validation will be applied to that region.
When doing this, ENSURE that all patterns objects support the names
you will be used in jTAC.regionName.
REMINDER: Server side validation must know to use the same region name.

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
   region (string) -
      One of the region names defined in 'regionsdata'.
      If "", it uses patterns.defaultName's value as the region name.
      You can include a mixture of regions by specifying a pipe delimited list
      of region names.
      It defaults to "".
   regionsData (object) - 
      The RegionData object as described above. Each subclass should
      assign a default here by overriding _defaultRegionsData().

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseString

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_BaseRegionString = {
   extend: "TypeManagers.BaseString",
   "abstract": true,

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      region: "",
      regionsData: null
   },

   configrules: {
   },

   /* 
   Returns the same value. If value is not a string, it is converted to a string
   using the javascript toString() method. If the value is null, this returns null.
   */
   _nativeToString: function (value) {
      if (value == null)
         return "";
      var text = value.toString();
      if (text == "")
         return "";
      var rd = this._getRegionNode(text);
      if (!rd)
         this._inputError("Invalid " + this.dataTypeName());
      if (rd.toFormat) {
         text = rd.toFormat(text);
      }
      return text;
   },



   _reviewValue: function (text)
   {
      text = this.callParent([text]);
      if (text == "")
         return text;
      var obj = this._getRegionNode(text);
      if (!obj)
         this._inputError("Invalid " + this.dataTypeName() + " [" + text + "]");

      return text;
   },

   // Digits and the optional allowSeps value.
   isValidChar: function (chr) {
      if (!this.callParent([chr])) {
         return false;
      }
      var rds = this._selectRegionNodes();
      if (!rds.length) {
         return true;   // no data to validate. So allow all characters
      }
      for (var i = 0; i < rds.length; i++) {
         var rd = rds[i];
         if (!rd.validChar)   // if any have no filtering capability, then all have no filtering capability   
            return true;
         if (typeof rd.validChar == "string") {
            var re = this._cache.validCharRE;
            if (!re)
               re = this._cache = new RegExp(rd.validChar);
            return re.test(chr);
         }
         if (rd.validChar(chr)) {
            return true;
         }
      }  // for
      return false;
   },

   /* 
   Uses the RegionData.toNeutral function if available.
   Otherwise returns the original text.
   Exception: text does not match any validation patterns.
   */
   toValueNeutral: function (text) {
      if (!text) {
         return "";
      }
      try
      {
         this._pushContext();

         var rn = this._getRegionNode(text);
         if (!rn)
            this._inputError("Invalid " + this.dataTypeName() + " [" + text + "]");
         if (rn.toNeutral)
            text = rn.toNeutral(text);
         return text;
      }
      finally {
         this._popContext();
      }
   },



   /*
   Returns an array of 0 or more RegionData objects based on the region property.
   The caller will generally go through this to apply each rule.
   */
   _selectRegionNodes: function () {
      function add(n) {
         var names = n.split('|');
         var rd = this.getRegionsData();
         for (var i = 0; i < names.length; i++)
         {
            var rn = rd[names[i]];
            if (!rn)
               this._error("Region [" + names[i] + "] not defined in the regionsData object.");
            if (typeof rn == "string") {
               add.call(this, rn);   //!RECURSION
               continue;
            }
            if (typeof rn == "object") {
               r.push(rn);
            }
            else
               this._error("Region [" + rn + "] definition invalid.");
         }  // for
      }
      var rds = this._internal.rds;
      if (!rds || (this._internal.rdc != jTAC._globalRegionNameCount))
      {
         var name = this.getRegion();
         if (name == "")
            name = this.getRegionsData().defaultName;
         if (name == "GLOBAL")
            name = jTAC._globalRegionName;
         if (!name)
            this._error("Could not identify a region name from the region property.");
         var r = [];
         add.call(this, name);
         rds = this._internal.rds = r;
         this._internal.rdc = jTAC._globalRegionNameCount;
      }
      return rds;
   },


   /* 
   Gets an object from the patterns based on the region name.
   There can be multiple region names. The text parameter is used
   to match to a region's pattern to identify it as the correct object
   to return. If text is "", the first object from the region name list is returned.
   If the text does not match anything, it returns null.
   */
   _getRegionNode: function (text) {
      var regionNodes = this._selectRegionNodes();
      for (var i = 0; i < regionNodes.length; i++) {
         var regionNode = regionNodes[i];
         if (!text)  // no text, return the first
            return regionNode;
         if (typeof regionNode.pattern == "function") { // alternative way to supply the pattern. Function is passed text and returns true if valid.
            if (regionNode.call(this, text))
               return regionNode;
         }
         else {
            var re = new RegExp(this._resolvePattern.call(this, regionNode), regionNode.caseIns ? "i" : "");
            if (re.test(text))
               return regionNode;
         }
      }
      return null;   // not found
   },

   /*
   Gets the regular expression pattern from the region data object passed.
   This gets it from the pattern property.
      rn (object) - A region node object from the regionData.
   */
   _resolvePattern: function (rn) {
      return rn.pattern;
   },

/* ABSTRACT METHOD
Override to supply the RegionData object. 
*/
   _defaultRegionsData: function() {
      this._AM();
   },

   /* STATIC METHOD
   Utility to format text that has none of its formatting characters.
   It replaces elements of the mask parameter that have the "#" character
   with digits from the text and returns the result.
      text (string) - Neutral text. Should be digits. Any existing formatting
         is ignored.
      mask (string) - Pattern of the mask. Digits replace the "#"
         elements either in forward or reverse direction based on dir.
      dir (boolean) - When true, replace from left to right.
         When false, replace from right to left.
      unused (string) - Text to use when there are remaining "#" symbols
         after all of 'text' has been used.
   Returns: formatted text.
   To call this from anywhere, use:
   jTAC.TypeManagers.BaseRegionString.prototype.applyNumberMask(parameters)
   */
   applyNumberMask: function(text, mask, dir, unused) {
      var t = dir ? 0 : text.length - 1;   // current position in text being extracted
      var m = dir ? 0 : mask.length - 1;  // current position in mask being replaced
      var inc = dir ? 1 : -1; // how to increment t and m
      var lt = dir ? text.length : -1; // last position of text + 1
      var lm = dir ? mask.length - 1 : 0; // last position of mask

      var r = ""; // result
   // go through the mask. Add each char to r that is not a "#"
   // When "#", get the next digit from text.
      for (var i = m; dir ? i <= lm : i >= lm; i = i + inc) {
         var chr = mask.charAt(i);
         if (chr == "#") {
            // get the next digit from text.
            // Skip anything in text that is not a digit.
            // If exceeding the number of available text digits, substitute 'unused'.
            do {
               if (t == lt) {
                  chr = unused;
                  break;
               }
               chr = text.charAt(t);
               t = t + inc;
            } while ((chr < "0") || (chr > "9"));

         }
         if (dir) {
            r = r + chr;
         }
         else {
            r = chr + r;
         }
      }  // for

      if (t != lt) {   // have extra characters in text. They need to be included
         for (var i = t; dir ? i < lt : i > lt; i = i + inc) {
            var chr = text.charAt(i);
            if ((chr >= "0") && (chr <= "9")) {
               if (dir) {
                  r = r + chr;
               }
               else {
                  r = chr + r;
               }
            }  // if
         }  // for
      }  // if

      return r;

   },


   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

   /*
   One of the region names defined in patterns.
   If "", it uses patterns.defaultName's value as the region name.
   You can include a mixture of regions by specifying a pipe delimited list
   of region names.
   If "GLOBAL", it uses the value set by jTAC.setGlobalRegionName().
   It defaults to "".
   */
   setRegion: function (val)
   {
      this.config.region = jTAC.checkAsStr(val);
      this._internal.rds = null; // clear cached region array
   },

   getRegionsData: function()
   {
      var rd = this.config.regionsData;
      if (!rd)
         rd = this.config.regionsData = this._defaultRegionsData();
      return rd;
   },

   setRegionsData: function(val)
   {
      if (typeof(val) != "object")
         this._error("RegionsData must be an object");
      this.config.regionsData = val;
   }
}
jTAC.define("TypeManagers.BaseRegionString", jTAC._internal.temp._TypeManagers_BaseRegionString);



/* --- EXTENSIONS TO jTAC GLOBAL -------------------------- */
/*
The region name to use when a TypeManager's 'region' property is set to "GLOBAL".
Update this value when you are using an editable Country field.
Always assign a region name defined in the RegionsData object
and be sure that all RegionsData objects have that region.
You may have to convert a value stored in the country field into a 
different value for the region name.
*/
jTAC.setGlobalRegionName = function (region)
{
   jTAC._globalRegionName = region;
   jTAC._globalRegionNameCount++;
}
jTAC._globalRegionName = null; // if this is changed, always increment jTAC._globalRegionNameCount. (Hint: Use jTAC.setGlobalRegionName)
// Each time jTAC._globalRegionName is changed, jTAC._globalRegionNameCount must be incremented.
// TypeManagers.BaseRegionString._selectRegionNodes() saves this value locally.
// If a call to _selectRegionNodes finds this to differ from its local copy, it abandons the cached value.
jTAC._globalRegionNameCount = 0;
﻿// jTAC/TypeManagers/String.js
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
Class : TypeManger.String
Extends: TypeManagers.BaseString

Purpose:
For any string. There are other TypeManagers that host strings,
and can look for specific features of that string to ensure it reflects
a specific type of string data, such as phone number or postal code.
Always consider using the most specific TypeManager if available.

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
   caseIns (boolean) - 
      When true, use case insensitive comparison in the compare() method.
      It defaults to false.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseString

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_String = {
   extend: "TypeManagers.BaseString",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      caseIns: false
   },


   dataTypeName : function () {
      return "string";
   },

/*
Tells compare() if it needs to do a case sensitive or insensitive match.
When true, it is case insensitive.
*/
   _isCaseIns : function() {
      return this.config.caseIns;
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("TypeManagers.String", jTAC._internal.temp._TypeManagers_String);
jTAC.defineAlias("String", "TypeManagers.String");
jTAC.defineAlias("String.caseins", "TypeManagers.String", {caseIns: true});

﻿// jTAC/TypeManagers/EmailAddress.js
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
Class : TypeManger.EmailAddress
Extends: TypeManagers.BaseStrongPatternString

Purpose:
Validates the pattern of an Email address.
You can optionally support multiple email addresses, defining
the desired delimiters between them.

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
   multiple (boolean) -
      Determines if multiple email addresses are permitted.
      When true, they are.
      It defaults to false.
   delimiterRE (string) - 
      A regular expression pattern that determines the delimiter
      between multiple email addresses.
      As a regular expression, be sure to escape any character
      that must be a kept as is.
      It defaults to ";[ ]?". It permits an optional space.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseString
TypeManagers.BaseStrongPatternString

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_EmailAddress = {
   extend: "TypeManagers.BaseStrongPatternString",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      multiple: false,
      delimiterRE : ";[ ]?"
   },


   dataTypeName : function () {
      return "EmailAddress";
   },

/* 
Builds a pattern from the properties.
*/
   _regExp : function() {
      var re = "^" + this._addressRE;
      if (this.getMultiple()) {
         re += "(" + this.getDelimiterRE() + this._addressRE + ")*";
      }
      re += "$";

      return new RegExp(re, "i");
   },

/*
Regular expression pattern for an email address.
It lacks ^ and $ to allow its reuse in multiple email addresses.
Those characters will be added by _regExp().

A good way to override this globally is to add a script that
sets this in the prototype of the class you are modifying:
jTAC.TypeManagers.EmailAddress.prototype._addressRE = "pattern";

If you prefer the pattern used by jquery-validate's "email" rule, here it is:
    ((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?

*/
   _addressRE : "([\\w\\.!#\\$%\\-+.'_]+@[A-Za-z0-9\\-]+(\\.[A-Za-z0-9\\-]{2,})+)"


   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("TypeManagers.EmailAddress", jTAC._internal.temp._TypeManagers_EmailAddress);
jTAC.defineAlias("EmailAddress", "TypeManagers.EmailAddress");
jTAC.defineAlias("EmailAddress.Multiple", "TypeManagers.EmailAddress", {multiple: true});

﻿// jTAC/TypeManagers/PhoneNumber.js
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
Class : TypeManger.PhoneNumber
Extends: TypeManagers.BaseRegionString

Purpose:

Validates the pattern of a phone number.
Supports regional patterns of phone numbers, as defined in
window.jTAC_PhoneNumberRegionsData field.
To add, you can use this:
window.jTAC_PhoneNumberRegionsData["regionname"] = {pattern: value, more properties};
To replace the pattern property:
window.jTAC_PhoneNumberRegionsData["regionname"].pattern = "pattern";

You can also create your own full RegionsData object and merge its properties
with the existing one like this:
jTAC.extend(your object, window.jTAC_PhoneNumberRegionsData);

Set the 'region' property to the name of the desired region, or to "" to 
select the 'defaultName' property which specifies the default region name.

Example of multiple regions: "NorthAmerica|CountryCode".

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
   supportsExt (boolean) -
      When true, the string can contain the extension.
      It defaults to false.
      Extensions insert their RegExp pattern into the main pattern before "$)".
      There is a default pattern for most extensions, but a region
      can override it with the 'extensionRE' property in its object.
      That will contain the regular expression pattern for the extension.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseString
TypeManagers.BaseRegionString

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_PhoneNumber = {
   extend: "TypeManagers.BaseRegionString",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      supportsExt: false
   },

   dataTypeName : function () {
      return "PhoneNumber";
   },
/*
   Gets the regular expression pattern from the region data object passed.
   This gets it from the pattern property.
*/
   _resolvePattern: function(regionNode) {
      var r = regionNode.pattern;

      if (this.getSupportsExt())
      {
   // insert the extension's regexp before any "$)" element.
         var ext = regionNode.extensionRE || "(\\s?\\#\\d{1,10})?";

         r = jTAC.replaceAll(r, "\\$\\)", ext + "$)", false);
      }

      return r;
   },

   _defaultRegionsData: function()
   {
      return window.jTAC_PhoneNumberRegionsData;
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("TypeManagers.PhoneNumber", jTAC._internal.temp._TypeManagers_PhoneNumber);
jTAC.defineAlias("PhoneNumber","TypeManagers.PhoneNumber"); 
jTAC.defineAlias("PhoneNumber.NorthAmerica", "TypeManagers.PhoneNumber", {region:"NorthAmerica"}); 
jTAC.defineAlias("PhoneNumber.NorthAmerica.CountryCode", "TypeManagers.PhoneNumber", {region:"NorthAmerica|CountryCode"}); 
jTAC.defineAlias("PhoneNumber.UnitedStates", "TypeManagers.PhoneNumber", {region:"UnitedStates"}); 
jTAC.defineAlias("PhoneNumber.UnitedKingdom", "TypeManagers.PhoneNumber", {region:"UnitedKingdom"}); 
jTAC.defineAlias("PhoneNumber.France", "TypeManagers.PhoneNumber", {region:"France"}); 
jTAC.defineAlias("PhoneNumber.Japan", "TypeManagers.PhoneNumber", {region:"Japan"}); 
jTAC.defineAlias("PhoneNumber.Germany", "TypeManagers.PhoneNumber", {region:"Germany"}); 
jTAC.defineAlias("PhoneNumber.China", "TypeManagers.PhoneNumber", {region:"China"}); 
jTAC.defineAlias("PhoneNumber.Canada", "TypeManagers.PhoneNumber", {region:"Canada"}); 


/*
Used by TypeManagers.PhoneNumber as its default RegionsData.
Defines the regions and their patterns, with the regionname
as the property name and phone number pattern as the value of the property.
Here is a good resource for building these patterns:
http://www.itu.int/oth/T0202.aspx?parent=T0202

To add a region, you can use this:
window.jTAC_PhoneNumberRegionsData["regionname"] = {pattern: value, more properties};
To replace the pattern property in a region:
window.jTAC_PhoneNumberRegionsData["regionname"].pattern = "pattern";

You can also create your own full RegionsData object and merge its properties
with the existing one like this:
jTAC.extend(your object, window.jTAC_PhoneNumberRegionsData);

Finally you can substitute your own RegionsData object by setting it to the
TypeManagere.PhoneNumber.regionsData property.

*/
var jTAC_PhoneNumberRegionsData = {
   // This specifics which of the other properties is used when you don't assign the regionName
   defaultName: "Any",

   
   Any: {
      name: "Any",
      pattern: "(^\\+?\\d([\\-\\.]?\\d){6,19}$)",// optional +, 7 to 20 digits, with optional dash or period between digits
      validChar: "[0-9\\+\\-\\.]"
   },

   // requires a country code preceded by +. http://blog.stevenlevithan.com/archives/validate-phone-number
   CountryCode: {  
      name: "CountryCode",
   // +########. Between 7 and 15 digits, with lead and trailing digit. Single space separators allowed between digits
      pattern: "(^\\+(?:\\d ?){6,14}\\d$)",
      validChar: "[0-9\\+ ]"
   },

  
   NorthAmerica: { 
      name: "NorthAmerica",
   // 1(###) ####-####.  Formatting characters and lead 1 are optional.
      pattern: "(^([1])?[ ]?((\\([2-9]\\d{2}\\))|([2-9]\\d{2}))?[ ]?\\d{3}[ \\-]?\\d{4}$)",
      validChar: "[0-9\\+\\- \\(\\)]",
      toNeutral: function (text) { // keeps only digits
         var r = "";
         for (var i = 0; i < text.length; i++) {
            var chr = text.charAt(i);
            if ((chr >= "0") && (chr <= "9"))
               r += chr;
         }
         return r;
      },
      toFormat: function (text) {
         var that = jTAC_PhoneNumberRegionsData.NorthAmerica;
         var r = that.toNeutral(text);
         return jTAC.TypeManagers.BaseRegionString.prototype.applyNumberMask(r, that.formatMask, false, "");
      },

// Modify this mask if your business prefers a different format.
      formatMask : "#(###) ###-####"
   },

   UnitedStates: "NorthAmerica",
   Canada: "NorthAmerica",

   France: {
      name: "France",
   // 0# ## ### ### or 0# ## ## ## ##  or 0 ### ### ### or 0 ### ## ## ##   lead 2 digits are optional (0#)
      pattern: "(^(0( \\d|\\d ))?\\d\\d \\d\\d(\\d \\d| \\d\\d )\\d\\d$)",
      validChar: "[0-9 ]"
   },

   Japan: {
      name: "Japan",
     // 0#-#-#### or (0#) #-#### or #-####. Any single # can be 1-4 digits
      pattern: "(^(0\\d{1,4}-|\\(0\\d{1,4}\\) ?)?\\d{1,4}-\\d{4}$)",
      validChar: "[0-9\\- \\(\\)]"
   },

   Germany: {
      name: "Germany",
     // (0##) ## ## ## or (0###) # ## ## ## or (0####) # ##-## or (0####) # ##-# or # ## ## ##
      pattern: "(^((\\(0\\d\\d\\) |(\\(0\\d{3}\\) )?\\d )?\\d\\d \\d\\d \\d\\d|\\(0\\d{4}\\) \\d \\d\\d-\\d\\d?)$)",
      validChar: "[0-9\\- \\(\\)]"
   },

   China: {
      name: "China",
      // (###)######## or ###-######## or ########
      pattern: "(^(\\(\\d{3}\\)|\\d{3}-)?\\d{8}$)",
      validChar: "[0-9\\- \\(\\)]"
   },

   UnitedKingdom: {  
      name: "UnitedKingdom",
      // reference: http://en.wikipedia.org/wiki/Telephone_numbers_in_the_United_Kingdom
      // expression source: http://regexlib.com/REDetails.aspx?regexp_id=593
      // +44 #### ### ### or 0#### ### ### or +44 ### ### #### or 0### ### #### or +44 ## #### #### or 0## #### ####
      pattern: "(^(((\\+44\\s?\\d{4}|\\(?0\\d{4}\\)?)\\s?\\d{3}\\s?\\d{3})|((\\+44\\s?\\d{3}|\\(?0\\d{3}\\)?)\\s?\\d{3}\\s?\\d{4})|((\\+44\\s?\\d{2}|\\(?0\\d{2}\\)?)\\s?\\d{4}\\s?\\d{4}))$)",
      validChar: "[0-9\\+ \\(\\)]"
   }
}

﻿// jTAC/TypeManagers/PostalCode.js
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
Class : TypeManger.PostalCode
Extends: TypeManagers.BaseRegionString

Purpose:

Validates the pattern of a postal code.
Supports regional patterns of postal codes, as defined in
window.jTAC_PostalCodeRegionsData field.
To add, you can use this:
window.jTAC_PostalCodeRegionsData["regionname"] = {pattern: value, more properties};
To replace the pattern property:
window.jTAC_PostalCodeRegionsData["regionname"].pattern = "pattern";

You can also create your own full RegionsData object and merge its properties
with the existing one like this:
jTAC.extend(your object, window.jTAC_PostalCodeRegionsData);

Set the 'region' property to the name of the desired region, or to "" to 
select the 'defaultName' property which specifies the default region name.

Example of multiple regions: "America|Canada".

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
None

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseString
TypeManagers.BaseRegionString

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_PostalCode = {
   extend: "TypeManagers.BaseRegionString",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      supportsExt: false
   },

   dataTypeName : function () {
      return "PostalCode";
   },

   _defaultRegionsData: function()
   {
      return window.jTAC_PostalCodeRegionsData;
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("TypeManagers.PostalCode", jTAC._internal.temp._TypeManagers_PostalCode);

jTAC.defineAlias("PostalCode","TypeManagers.PostalCode"); 
jTAC.defineAlias("PostalCode.NorthAmerica", "TypeManagers.PostalCode", {region:"NorthAmerica"}); 
jTAC.defineAlias("PostalCode.UnitedStates", "TypeManagers.PostalCode", {region:"UnitedStates"}); 
jTAC.defineAlias("PostalCode.UnitedKingdom", "TypeManagers.PostalCode", {region:"UnitedKingdom"}); 
jTAC.defineAlias("PostalCode.France", "TypeManagers.PostalCode", {region:"France"}); 
jTAC.defineAlias("PostalCode.Japan", "TypeManagers.PostalCode", {region:"Japan"}); 
jTAC.defineAlias("PostalCode.Germany", "TypeManagers.PostalCode", {region:"Germany"}); 
jTAC.defineAlias("PostalCode.China", "TypeManagers.PostalCode", {region:"China"}); 
jTAC.defineAlias("PostalCode.Canada", "TypeManagers.PostalCode", {region:"Canada"}); 

/*
Used by TypeManagers.PostalCode as its default RegionsData.
Defines the regions and their patterns, with the regionname
as the property name and phone number pattern as the value of the property.
Here is a good resource for building these patterns:
http://www.itu.int/oth/T0202.aspx?parent=T0202

To add a region, you can use this:
window.jTAC_PostalCodeRegionsData["regionname"] = {pattern: value, more properties};
To replace the pattern property in a region:
window.jTAC_PostalCodeRegionsData["regionname"].pattern = "pattern";

You can also create your own full RegionsData object and merge its properties
with the existing one like this:
jTAC.extend(your object, window.jTAC_PostalCodeRegionsData);

Finally you can substitute your own RegionsData object by setting it to the
TypeManagere.PostalCode.regionsData property.

*/
var jTAC_PostalCodeRegionsData = {
   // This specifics which of the other properties is used when you don't assign the regionName
   defaultName: "UnitedStates|Canada",

   UnitedStates:  { 
      name: "UnitedStates",
      pattern: "(^(\\d{5}-\\d{4}|\\d{5})$)",
      validChar : "[0-9\\-]"
   },

   Canada:  {
      name: "Canada",

      // resource: http://www.dreamincode.net/code/snippet3209.htm, http://www.itsalif.info/content/canada-postal-code-us-zip-code-regex
      pattern: "(^[ABCEGHJ-NPRSTVXY]\\d[ABCEGHJ-NPRSTV-Z][ ]?\\d[ABCEGHJ-NPRSTV-Z]\\d$)",
//      pattern: "(^([A-Za-z]\\d[A-Za-z][ ]?\\d[A-Za-z]\\d$)",
      caseIns : true,
      validChar : "[0-9A-Za-z ]"
   },

   NorthAmerica: "UnitedStates|Canada",
/*
   NorthAmerica: {
      name: "NorthAmerica",
      pattern: function() {
         return jTAC_PostalCodeRegionsData.UnitedStates.pattern + "|" + jTAC_PostalCodeRegionsData.Canada.pattern;
      },
      validChar : "[0-9A-Za-z \\-]" // blends US and Canada digits
   },
*/
   UnitedKingdom:  {
      name: "UnitedKingdom",
      // resource: http://en.wikipedia.org/wiki/Postal_codes_in_the_United_Kingdom
      pattern: "(^(GIR 0AA|[A-PR-UWYZ]([0-9][0-9A-HJKPS-UW]?|[A-HK-Y][0-9][0-9ABEHMNPRV-Y]?) [0-9][ABD-HJLNP-UW-Z]{2})$)",
/*
      pattern: function() {
         return (!this.spacesOptional) ?
         //  this pattern demands spaces. 
            "(GIR 0AA|[A-PR-UWYZ]([0-9][0-9A-HJKPS-UW]?|[A-HK-Y][0-9][0-9ABEHMNPRV-Y]?) [0-9][ABD-HJLNP-UW-Z]{2})" :
          // spaces are optional.It can be used by assigning the property "spacesOptional" on the TypeManager
            "(GIR 0AA|[A-PR-UWYZ]([0-9][0-9A-HJKPS-UW]?|[A-HK-Y][0-9][0-9ABEHMNPRV-Y]?)[ ]?[0-9][ABD-HJLNP-UW-Z]{2})"; 
      },
*/
      validChar: "[0-9A-Z ]"
   },


   France: {
      name: "France",
      //#####
      pattern: "(^\\d{5}$)",
      validChar: "[0-9]"
   },

   Japan: {
      name: "Japan",
      //  ### or ###-#### or ###-##
      pattern : "(^\\d{3}(-(\\d{4}|\\d{2}))?$)",
      validChar : "[0-9\\-]"
   },

   Germany: {
      name: "Germany",
      pattern: "(^\\d{5}$)",
      validChar : "[0-9\\-D]"
   },

   China: {
      name: "China",
      pattern : "(^\\d{6}$)",
      validChar: "[0-9]"
   }
}

