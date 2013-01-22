// jTAC/jquery-validate/ReplaceTokens PlugIn.js
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
Associated license:
Some code in this file originates from jQuery Validation Plugin 1.8.0
(Copyright (c) 2006 - 2011 Jörn Zaefferer)
and is here under the MIT License model.
https://github.com/jquery/jquery/blob/master/MIT-LICENSE.txt

jquery-validate info:
* http://bassistance.de/jquery-plugins/jquery-plugin-validation/
* http://docs.jquery.com/Plugins/Validation

-------------------------------------------------------------
Module: Extending jquery-validate to support token replacement

Purpose:
Modify $.validate with functions to replace new token format
with all kinds of values.
This code has been proposed for jquery-validate in a pull request.
Until its added, this script file must be added
before loading /jTAC/jquery-validate/Rules.js

----------------------------------------------------------- */

/*
This object is intended have its properties added to $.validate through $.extend.
It replaces one, formatAndAdd. It adds the rest.
*/
if ($ && $.validator) {
(function ($)
{
   if ($.validator.replaceTokens) // already exists
   {
      return;
   }
   var plugin = {
      /*
      A replacement for the formatAndAdd function on the jquery-validate
      validator object.
      */
      formatAndAdd: function (element, rule)
      {
         var message = this.defaultMessage(element, rule.method),
		      theregex = /\$?\{(\d+)\}/g;
         if (typeof message === "function")
         {
            message = message.call(this, rule.parameters, element);
         }
         /* REPLACED BY replaceTokens system below. This is built into defaultTokenReplacer         
         else if (theregex.test(message)) {
         message = $.validator.format(message.replace(theregex, '{$1}'), rule.parameters);
         }
         */
         // Begin new code
         var rt = $.validator.replaceTokens[rule.method];
         if (!rt)
         {
            rt = $.validator.defaultTokenReplacer;
         }
         message = rt.call($.validator, message, element, rule.parameters, $(element).val());
         // End new code
         this.errorList.push({
            message: message,
            element: element
         });

         this.errorMap[element.name] = message;
         this.submitted[element.name] = message;
      },

      // matches tokens with only digits. They retrieve values from the param object 
      // based on the physical order of properties defined. 
      // Replaces the {VALUE} token with the value parameter's string.
      // Replaces the {LABEL} token with the label associated with the element.
      // If the value parameter is not already a string, it will be converted with toString().
      // If you need better formatting, implement your own replacement of the {VALUE} token.
      defaultTokenReplacer: function (message, element, param, value)
      {
         var regex = /\$?\{(\d+)\}/g;
         if (regex.test(message))
         {
            message = $.validator.format(message.replace(regex, '{$1}'), param);
         }
         if (value == null)
            value = "";
         message = this.tokenReplacer(message, "VALUE", value.toString());   // {VALUE} token
         var lbl = this.elementLabel(element) || "*** Add the data-msglabel attribute to id " + element.id + ". ***";
         message = this.tokenReplacer(message, "LABEL", lbl);   // {LABEL} token
         return message;
      },

      // Utility to replace tokens in the message. 
      // A token is letters enclosed in brackets like {ABC}
      // however, you don't pass in the brackets to the tokentxt parameter.
      // tokentxt is just the letters. Uses a case insensitive match.
      // rpl in the string that replaces the token. 
      // Returns the modified message. 
      tokenReplacer: function (message, tokentxt, rpl)
      {
         var re = new RegExp("\\{" + tokentxt + "\\}", "ig");
         return message.replace(re, rpl.toString());
      },

      // Utility used by replacer functions that provide {MIN} and/or {MAX}
      // tokens. It also supports {LENGTH} and {DIFF} tokens.
      // {MIN} - The value from min identifying the minimum length
      // {MAX} - The value from max identifying the maximum length
      // {LENGTH} - The current length
      // {DIFF} - The difference between the length an the minimum or maximum,
      // but only works when min or max are integers.
      minMaxReplacer: function (message, min, max, length)
      {
         if (min != null)
            message = this.tokenReplacer(message, "MIN", min);
         if (max != null)
            message = this.tokenReplacer(message, "MAX", max);
         if (length != null)
         {
            message = this.tokenReplacer(message, "LENGTH", length);
            // {DIFF} is only supposed to handle integer min/max.
            // This code runs even if min/max are null or not integers.
            // It assumes the DIFF token isn't used in that case, but if it is, the result will be meaningful
            if (typeof min !== "number")
               min = 0;
            if (typeof max !== "number")
               max = 99999999;
            var diff = Math.max(length - max, min - length);
            message = this.tokenReplacer(message, "DIFF", diff);
         }
         return message;
      },

      /* 
      Locates a string that can be displayed as the label for the element
      within a message.
      The element can host this label in its data-msglabel attribute or
      there is another with a for= attribute specifying this element whose
      HTML is the label. If both are present, data-label overrides
      the for= attribute. 
      NOTE: The value "data-msglabel" was chosen over "data-label" to avoid
      conflicts with other systems.
      element (DOM Element) - Accepts null.
      Returns the label string or null if not located.
      The result will not contain HTML tags found in the source.
      */
      elementLabel: function (element)
      {
         if (!element)
         {
            return null;
         }
         var t = element.getAttribute("data-msglabel");
         // Alternative: t = $(element).data('msglabel') || (element.attributes && $(element).attr('data-msglabel'));

         if (t == null)
         {
            var lbl = $("label[for='" + element.id + "'][generated!='true']");  // jquery-validate creates a label to host the error message. 
            // It assigns a custom attribute, 'generated=true' to that label. 
            // We need to avoid it.
            if (lbl)
            {
               t = lbl.html();
               if (t)
               {
                  // strip the HTML tags. Tags are always "<" + 1 or more characters + ">".
                  t = t.replace(/\<(.|\n)+?\>/ig, "");

                  // if it came from a label, strip lead and trail non-alpha numeric text.
                  t = t.replace(/[^\dA-Za-z]+$/, ""); // trail non-alpha numeric
                  t = t.replace(/^[^\dA-Za-z]+/, ""); // lead

                  // update data-label to avoid searching each time
                  element.setAttribute("data-msglabel", t);
               }
            }
         }
         return t;   // may be null
      },


      // Hosts validation function names mapped to token replacement functions.
      // Each function takes these parameters and returns the updated message string:
      //   message (string) - text to modify.
      //   element (DOM Element)
      //   param - same parameters collection used elsewhere. Data is specific to the individual function.
      //   value - The value that was found to be invalid
      // Those functions not explicitly declared use $.validator.defaultTokenReplacer
      replaceTokens: {

         // Supported tokens:
         // {MIN} - The value from param identifying the minimum length
         // {LENGTH} - The current length
         // {DIFF} - The difference between the length and the minimum
         minlength: function (message, element, param, value)
         {
            message = $.validator.minMaxReplacer(message, param, null, value.length);
            return $.validator.defaultTokenReplacer(message, element, param, value);
         },

         // Supported tokens:
         // {MAX} - The value from param identifying the maximum length
         // {LENGTH} - The current length
         // {DIFF} - The difference between the length and the maximum
         maxlength: function (message, element, param, value)
         {
            message = $.validator.minMaxReplacer(message, null, param, value.length);
            return $.validator.defaultTokenReplacer(message, element, param, value);
         },

         // Supported tokens:
         // {MIN} - The value from param identifying the minimum length
         // {MAX} - The value from param identifying the maximum length
         // {LENGTH} - The current length
         // {DIFF} - The difference between the length and the minimum or maximum
         rangelength: function (message, element, param, value)
         {
            message = $.validator.minMaxReplacer(message, param[0], param[1], value.length);
            return $.validator.defaultTokenReplacer(message, element, param, value);
         },

         // Supported tokens:
         // {MIN} - The value from param identifying the minimum value
         min: function (message, element, param, value)
         {
            message = $.validator.minMaxReplacer(message, param, null, null);
            return $.validator.defaultTokenReplacer(message, element, param, value);
         },

         // Supported tokens:
         // {MAX} - The value from param identifying the maximum value
         max: function (message, element, param, value)
         {
            message = $.validator.minMaxReplacer(message, null, param, null);
            return $.validator.defaultTokenReplacer(message, element, param, value);
         },

         // Supported tokens:
         // {MIN} - The value from param identifying the minimum value
         // {MAX} - The value from param identifying the maximum value
         range: function (message, element, param, value)
         {
            message = $.validator.minMaxReplacer(message, param[0], param[1], null);
            return $.validator.defaultTokenReplacer(message, element, param, value);
         }

      }

   }
   
   $.extend($.validator.prototype, plugin);
   $.extend($.validator, plugin);   // for some reason, extend to the prototype has no impact on the default $.validator
} (jQuery));    // function($) ends

}  // if $ && $.validator