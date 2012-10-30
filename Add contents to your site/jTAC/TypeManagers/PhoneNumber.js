// jTAC/TypeManagers/PhoneNumber.js
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

