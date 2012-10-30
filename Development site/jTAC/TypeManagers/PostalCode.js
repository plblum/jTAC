// jTAC/TypeManagers/PostalCode.js
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

