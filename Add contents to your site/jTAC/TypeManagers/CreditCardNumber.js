// jTAC/TypeManagers/CreditCardNumber.js
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
Class : TypeManger.CreditCardNumber
Extends: TypeManagers.BaseString

Purpose:
Validates a credit card number against Luhn's algorithm.
In addition, it can limit the brand of the credit card supported
and allow optional spaces.
By default it limits brands. If you want to include all possible
credit cards, set the brands property to null or use the alias "CreditCardNumber.AllBrands".

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
   brands (array) -
      Defines the signatures of various brands of credit cards.
      These are checked if defined. To disable this feature,
      assign brands to null.
      This list is prepopulated with populate cards. Add, edit, and delete
      as needed.
      Each item of the array is a javascript object with these properties:
         len (int) - If defined, it is the exact number of digits allowed.
         prefix (string) - A pipe delimited list of digits that
            start the credit card number and are used to identify the brand.
   allowSeps (char) -
      Assign to a single character that is a legal value for the user
      to use while typing, such as space or minus.
      It defaults to "" (which means not allowed).

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseString

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_CreditCardNumber = {
   extend: "TypeManagers.BaseString",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      brands:
         [{len: 16, prefix: '51|52|53|54|55'}, // Mastercard
          {len: 13, prefix: '4'}, // Visa-13char
          {len: 16, prefix: '4'}, // Visa-16char
          {len: 15, prefix: '34|37'}, // American Express
          {len: 14, prefix: '300|301|302|303|305|36|38'}, // Diners Club/Carte Blanche
          {len: 16, prefix: '6011'} // Discover
         ],
      allowSeps: ""

   },

   configrules: {
   },

   dataTypeName : function () {
      return "CreditCardNumber";
   },

/* 
Returns the same string passed in, but reports errors based on
the validation rules.

NOTE: This code is adapted from Peter's Data Entry Suite's CreditCardNumberValidator.
It is used here by permission from the author of that product.
*/
   _reviewValue : function(text) {
      if (text == "")
         return "";
      var as = this.getAllowSeps();
      if (as) {  // allow spaces. Strip out the spaces here to evaluate
         text = jTAC.replaceAll(text, as, "", true);
      }

      var len = text.length;
      if (len < 10)
         this._inputError("Not enough digits");   // under 10 is immediately rejected
      
   // must be all digits
      if (!/^(\d+)$/.test(text))
         this._inputError("Illegal character");

      var brands = this.getBrands();
      if (brands) {
   // match the length to elements in brands
         var fd = 0;  // found
         for (var i = 0; i < brands.length; i++) {
            var brand = brands[i];
         // elements in brands are objects with two properties:
         // len: the number length; prefix: a Regular expression to check the prefixes
            if (brand.len == len) {
               var re = new RegExp("^(" + brand.prefix + ")", "i");
               if (re.test(text)) {
                  fd = 1;
                  break;
               }
            }
         }  // for
         if (!fd)   // length not found
            this._inputError("Brand mismatch");
      }

   // perform Luhn's formula.
   // 1. Double the value of alternating digits starting from the second to last and going backward.
   // 2. Add the digits formed in step one. For example, starting with 7, we'd get 14 and add 1+4 here
   // 3. Add the alternating digits starting from the last. (This never uses the digits from step 1)
   // 4. Add the results of steps 2 and 3. If the result evenly divides by 10, success.
      var t = 0; // total
      var normal = true;   // when true, adding normal. False, adding after doubling.
      for (var i = len - 1; i >= 0; i--) {
         var d = parseInt(text.charAt(i), 10); // convert textual digit into number
         if (normal) {   // step 3
            t += d;
         }
         else {  // step 1 and 2
            d = d * 2;
            if (d > 9)
               t += 1 + (d % 10);   // doubled is between 10 and 19. '1' + the trailing digit
            else
               t += d;
         }
         normal = !normal;
      }  // for

      if (t % 10 != 0)
         this._inputError("Failed Luhns");

      return text;
   },

// Digits and the optional allowSeps value.
   isValidChar : function (chr)
   {
      if (!this.callParent([chr]))
         return false;
      if (this.getAllowSeps() == chr)
         return true;
      return "1234567890".indexOf(chr) > -1;
   },

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/
   /*
   brands property: SET function
   */
   setBrands : function (val)
   {
      if ((val instanceof Array) || (val == null))
         this.config.brands = val;
      else
         this._error("Parameter must be an array or null.");
   },

   /*
   allowSeps property: SET function
      Assign to a single character that is a legal value for the user
      to use while typing, such as space or minus.
      It defaults to "" (which means not allowed).
   */
   setAllowSeps : function (val)
   {
      if ((typeof val == "string") && (val.length <= 1))
         this.config.allowSeps = val;
      else
         this._error("Parameter must be a 1 character string.");
   }

}
jTAC.define("TypeManagers.CreditCardNumber", jTAC._internal.temp._TypeManagers_CreditCardNumber);
jTAC.defineAlias("CreditCardNumber", "TypeManagers.CreditCardNumber");
jTAC.defineAlias("CreditCardNumber.AllBrands", "TypeManagers.CreditCardNumber", {brands: null});
