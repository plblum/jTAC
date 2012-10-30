// jTAC/TypeManagers/BaseRegionString.js
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
