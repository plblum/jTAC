// jTAC/TypeManagers/Url.js
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
Class : TypeManger.Url
Extends: TypeManagers.BaseStrongPatternString

Purpose:
Validates the pattern of a URL.
Offers numerous options to select the parts of a URL
supported, which uri schemes, and which domain name extensions you allow.

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
   uriScheme (string) -
      A pipe delimited list of valid Uri Schemes.
      These are "http", "https", "ftp", etc.
      It defaults to "http|https".

   domainExt (string) - 
      A pipe delimited list of domain extensions, ignoring the country part.
      For example: "com|co|edu". Do not use "co.uk" as it contains a specific country part.
      To allow all, set to "".
      Defaults to "aero|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|travel|jobs|mobi|pro|co".

   supportsIP (boolean) - 
      When true, allow the domain name part to be an IP address instead of a domain name.
      It defaults to false.

   supportsPort (boolean) - 
      When true, allow the port number to be specified.
      It defaults to false.

   supportsPath (boolean) - 
      When true, allow a path after the domain name.
      It defaults to true.

   requireUriScheme (boolean) - 
      When true, there must be a Uri Scheme.
      It defaults to true.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseString
TypeManagers.BaseStrongPatternString

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_URL = {
   extend: "TypeManagers.BaseStrongPatternString",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      uriScheme: "http|https",
      domainExt: "aero|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|travel|jobs|mobi|pro|co",
      supportsIP: false,
      supportsPort: false,
      supportsPath: true,
      requireUriScheme: true
   },

   configrules: {
   },

   dataTypeName : function () {
      return "Url";
   },

/* 
Builds a pattern from the properties.
*/
   _regExp : function() {
      var re = "^((?:" + this.getUriScheme() + ")\\://)";
      if (!this.getRequireUriScheme())
         re += "?";
      if (this.getSupportsIP()) {
         re += "((";
      }
      re += this._domainRE;
      var de = this.getDomainExt();
      if (!de) {
         de = this._defDomainExt;
      }
      re += this._domainExtRE.replace("{DE}", de);
      if (this.getSupportsIP()) {
         re += ")|(" + this._IPAddressRE + "))";
      }

      if (this.getSupportsPort()) {
         re = re + this._portRE;
      }
      if (this.getSupportsPath()) {
         re += "/?(" + this._filePathRE + ")?";
      }
      else {
         re += "/?";
      }
      re += "$";

      return new RegExp(re, "i");
   },

/* ---------------------------------------------------------------  
The following fields ending in "RE" allows overriding their regular expression pattern.
A good way to override this globally is to add a script that
sets this in the prototype of the class you are modifying:
jTAC.TypeManagers.Url.prototype._domainRE = "pattern";
*/

/*
Regular expression pattern for a domain name.
*/
   _domainRE : "[a-zA-Z0-9\\-\\.]+",

/*
Regular expression pattern for a domain name.
*/
   _IPAddressRE : "(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|0?[1-9]{1}[0-9]{1}|0{0,2}[1-9])\\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|0?[1-9]{1}[0-9]{1}|0{0,2}[1-9]|0)\\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|0?[1-9]{1}[0-9]{1}|0{0,2}[1-9]|0)\\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|0?[1-9]{1}[0-9]{1}|0{0,2}[0-9])",  // see http://www.regexlib.com/REDetails.aspx?regexp_id=32

/*
Regular expression pattern for a domain name extension.
Use the token {DE} to be replaced by the value of the domainExt property.
*/
   _domainExtRE : "(?:\\.[a-z]{2})?\\.(?:{DE})(?:\\.[a-z]{2})?",  // NOTE: {DE} is a token that is replaced by the validDomainExt property.

/*
Used in the {DE} token of the _domainExtRE when _domainExt is "".
*/
   _defDomainExt : "[a-zA-Z]{2,3}",
/*
Regular expression pattern for a port number.
*/
   _portRE : "(?:\\:\\d+)?",

/*
Regular expression pattern for a file path after the domain name.
*/
   _filePathRE : "(?:/[a-zA-Z0-9_/%\\$#~][a-zA-Z0-9\\-\\._\\'/\\+%\\$#~]+[A-Za-z0-9])*" // exclude white space, \, ?, &, and =


   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("TypeManagers.Url", jTAC._internal.temp._TypeManagers_URL);
jTAC.defineAlias("Url", "TypeManagers.Url");
jTAC.defineAlias("Url.FTP", "TypeManagers.Url", {uriScheme:"ftp"});

