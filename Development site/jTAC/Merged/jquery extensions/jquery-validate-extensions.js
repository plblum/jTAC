// jTAC/jquery-validate/Alt ReplaceTokens PlugIn.js
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

}  // if $ && $.validatorï»¿// jTAC/jquery-validate/Condition Extensions.js
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
Module: Extending jquery-validate with support for Conditions.

Purpose:
Extend the prototypes for each Condition class to support features
used by validation. Includes:
- defining rule names that map to the condition
- default error message
- lookupKey property to get an error message from jTAC.translations
- token replacement function
- dependency support: the 'depend' property

This code works without jquery-validate present. It can be used
to setup alternative validation frameworks.

RULE NAMING
By default, a lowercase version of the condition name (without namespace) 
is used as the rule name. For example, "comparetovalue", "difference",
and "datatypecheck".
Conditions.Range and Conditions.Required conflict with native rule names.
Overwriting the native rules breaks due to some dependencies built into 
jquery-validate that assume you are still using the native rules.

As a result, Range and Required have these as rule names:
"advrange"
"advrequired"


TOKEN REPLACEMENT
Each Condition provides the replaceToken() method to replace tokens found
in the error message string
jTAC handles tokens in error messages through the jTAC.jqueryValidate.replaceTokens function.
That function calls the replaceToken function added to each Condition class
in the code that follows.
If jquery-validate lacks the validate option "replaceTokens",
expand it to support that feature.


DEPENDENCY SUPPORT
jquery-validate offers the depends parameter to specify 
a rule that enables the validation. This feature has two limitations
that are overcome by the enhancements below:
1. unobtrusive validation has no way to set this up
2. The user has to define a function calling jTAC.isValid()
   with the depends parameter. This could be simplified.

With these extensions all Conditions now have a "depends" property.
If assigned, it hosts a Condition that determines if the validation runs.
The Conditions.Base.canEvaluate() method has been replaced
to run that Condition and stop validation if it returns "failed".
(Both "success" and "cannot evaluate" proceed with validation.)

The "depends" property can also host a jquery selector. If that selector
finds at least one item, the condition is enabled.

The setup for the "depends" property is identical for both
coded and unobtrusive validation. You always define
an object with the properties of the Condition to be defined.
One of those properties can be "depends" and host another
object that defines the condition.
That object must include a 'jtacClass' property and specify
the name of a Condition object to create. 
The remaining properties assign their values to identical
property names on the Condition that is created.
Always specify the elementId property in the dependency condition.



Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
ALWAYS LOAD any Condition scripts BEFORE THIS FILE IS LOADED
----------------------------------------------------------- */

if (!window.jTAC)
   throw new Error("window.jTAC not created.");

jTAC.require("Conditions.Base");

/* ---- EXTENDS Conditions.Base --------------------------------- */

jTAC_Temp = {
   config: {
      depends: null,
      lookupKey :null
   },
   configrule: {
      lookupKey: jTAC.checkAsStrOrNull
   },

   /* 
   Extension to Conditions so they can replace tokens they support
   found in the message passed. This is used by validator error messages.
   This method is subclassed to introduce token support as this
   class returns the original message.
      text (string) - the text to modify. Replace all tokens it supports.
      details (object) - object with these parameters:
         context (string) - identifies the user interface that needs the string.
            Values include:
               "html" (or null) - for the actual page
               "alert" - a javascript alert or confirm box.
               "tooltip" - a javascript tooltip
         element (object) - the object on the page being validated
         value (string) - the value from that object
         validator (validator object) - the current jquery-validate's validator object.
         messagelabel (string) - the style sheet class used for the {ERRORLABEL} token.
            When using jquery-validate, this should be found on validator.settings.messagelabel.
            
      Supported tokens:
         {NEWLINE} - Replaced by the new line symbol based on the context.
               html uses <br />, alert uses \n, tooltip uses \r.
         {ERRORLABEL} - Replaced by the $.validator.setting.messagelabel, which
               is a style sheet class. Use this in messages that
               have {LABEL} tokens. Enclose them in <span class='{ERRORLABEL}'>{LABEL}</span>.
               If details.messagelabel is null, the default 'messagelabel' is used.
      When context is "alert" or "tooltip", all HTML tags are stripped.
   */
   replaceTokens: function (text, details) {
      var t = text;
      switch (details.context) {
         case "alert":
            t = jTAC.replaceAll(t, "{NEWLINE}", "\n", true);
            // falls through to use strip tags code
         case "tooltip":
            t = jTAC.replaceAll(t, "{NEWLINE}", "\r", true);
            t = jTAC.replaceAll(t, "<(.|\n)+?>", "");   // strip the HTML tags. Tags are always "<" + 1 or more characters + ">".
            break;
         default: // html
            t = jTAC.replaceAll(t, "{NEWLINE}", "<br />", true);
            break;
      }
      if (jTAC.contains(t, "{ERRORLABEL}", true)) {
         var rpl = details.messagelabel;
         t = jTAC.replaceAll(t, "{ERRORLABEL}", rpl != null ? rpl : "messagelabel");
      }
      return t;
   },

   /*
   Utility function that reduces the code for replacing a single token.
      text (string) - the string to modify. 
      token (string) - the full token string
   */
   _replaceToken: function (text, token, rpl) {
      if (jTAC.contains(text, token, true)) {
         text = jTAC.replaceAll(text, token, rpl.toString(), true);
      }
      return text;
   },

   /* 
   Utility function for the replaceTokens methods.
   Handles the singular/plural tokens. They have a format of {[tokenname]:singular:plural}
   If this pattern is found, use the text of 'singular' when cnt = 1. Otherwise use 'plural'.
      text (string) - the original string containing tokens
      cnt (int) - Count. When = 1, the singular string is used. Otherwise the plural string is used.
      token (string) - The token name within the brackets.  {[tokenname]:singular:plural}
   Return the updated string or the original if there wasn't a match to the token.
   */
   _spReplaceToken: function (text, cnt, token) {
      var re = new RegExp("\\{" + token + ":([^:}]*):([^:}]*)\\}"); // [^:}] = everything except a colon and }

      var m = re.exec(text);
      if ((m != null) && (m.length == 3)) {
         var orig = new RegExp("{" + token + ":" + m[1] + ":" + m[2] + "}", "gi");  // do not use "m" flag - older browsers fail
         if (cnt == 1) {
            return text.replace(orig, m[1]);
         }
         else {
            return text.replace(orig, m[2]);
         }
      }
      return text;
   },


/*
Replace a token whose string comes from a value that is formatted
through the current TypeManager.
*/
   _tmReplaceToken: function ( text, value, token, details ) {
      if ( jTAC.contains( token ) ) {
         var rpl = value;
         var tm = this.getTypeManager();
         if ( tm ) {
            var sw = jTAC.silentWarnings();
            jTAC.silentWarnings( true );
            try {
               try {

                  if ( typeof ( rpl ) == "string" ) {
                     rpl = tm.toValueNeutral( rpl );
                  }
                  rpl = tm.toString( rpl );
                  if ( details.context == "html" ) {
                     rpl = jTAC.htmlEncode( rpl );
                  }
               }
               catch ( e ) {
                  // could not convert. Show it in its original form
                  rpl = value;
               }
            }
            finally {
               jTAC.silentWarnings( sw );
            }

         }
         text = jTAC.replaceAll( text, token, rpl, true );
      }
      return text;
   },

   /*
   Subclasses provide their default error message with this.
   */
   defaultErrorMessage: function () {
      return "";
   },


   /* depends property: SET function
   If assigned it is a rule to enable the condition.
   It can be either a Condition object, function, or a jquery selector string.
   If a function, it must take one parameter, the element being validated and return true
   for valid and false for invalid. The value of 'this' is the Condition object within your function.
   */
   setDepends: function (val) {
      if (typeof val == "function") {
         this.config.depends = val;
      }
      else if ((typeof val == "string") && (val.indexOf("{") != 0)) {
         this.config.depends = val;
      }
      else {
         this.config.depends = jTAC.checkAsConditionOrNull(val);
      }
   },

   canEvaluate: function () {
   // THIS CODE IS COPIED FROM /Conditions/Base.js
      if (!this.getEnabled())
         return false;
      if (this.getAutoDisable() && !this._connsEditable())
         return false;
   // END OF COPIED CODE

      var dp = this.getDepends();
      if (dp) {
         if (typeof dp == "function") {
            var el = null;
            if (dp.getConnection) {
               el = dp.getConnection().getElement();  // may be null
            }
            return dp.call(this, el);
         }
         else if ((typeof dp == "object") && dp.canEvaluate() && (dp.evaluate() == 0)) {
            return false;
         }
         if (typeof dp == "string") { // when a string, it is a jquery selector.
            return $(dp).length > 0;   // must return at least one to be enabled
         }
      }
      return true;
   },

/*
The name used for the rule name in jquery-validate.
It defaults to the class name of the Condition.
*/
   ruleName: function() {
      return this.$className.toLowerCase();
   }
}

jTAC.addMembers("Conditions.Base", jTAC_Temp);

/* ---- EXTENDS Conditions.BaseOneConnection --------------------------------- */

if (jTAC.isDefined("Conditions.BaseOneConnection")) {
   jTAC_Temp = {
      /*
      Adds support for these tokens:
      {VALUE} - the connection's actual string value.
      {LABEL} - the label associated with the element
      */
      replaceTokens: function (text, details)
      {
         var t = this.callParent([text, details]);
         var conn = this.getConnection();
         t = this._tmReplaceToken(t, conn.getTextValue(), "{VALUE}", details);
/*
         var rpl = conn.getTextValue();
         if (details.context == "html") {
            rpl = jTAC.htmlEncode(rpl);
         }

         t = jTAC.replaceAll(t, "{VALUE}", rpl, true);
*/
         if (jTAC.contains(t, "{LABEL}", true)) {
            t = jTAC.replaceAll(t, "{LABEL}", conn.getLabel() || 
               "<strong>Warning: No label defined for " + conn.getId() + ". Use &lt;Label for=&gt; or data-msglabel='label' in the element.</strong>", true);
         }
         return t;
      }
   }
   jTAC.addMembers("Conditions.BaseOneConnection", jTAC_Temp);

}

/* ---- EXTENDS Conditions.BaseTwoConnections --------------------------------- */
if (jTAC.isDefined("Conditions.BaseTwoConnections")) {
   jTAC_Temp = {

      /* 
      Adds support for these tokens:
      {VALUE2} - the connection2's actual string value.
      {LABEL2} - the label associated with the element
      */
      replaceTokens: function (text, details) {
         var t = this.callParent([text, details]);
         var conn = this.getConnection2();
         t = this._tmReplaceToken(t, conn.getTextValue(), "{VALUE2}", details);
/*
         var rpl = conn.getTextValue();
         if (details.context == "html") {
            rpl = jTAC.htmlEncode(rpl);
         }
         t = jTAC.replaceAll(t, "{VALUE2}", rpl, true);
*/
         if (jTAC.contains(t, "{LABEL2}", true)) {
            t = jTAC.replaceAll(t, "{LABEL2}", conn.getLabel() || 
               "<strong>Warning: No label defined for " + conn.getId() + ". Use &lt;Label for=&gt; or data-msglabel='label' in the element.</strong>", true);
         }
         return t;
      }
   }
   jTAC.addMembers("Conditions.BaseTwoConnections", jTAC_Temp);

}
/* ---- EXTENDS Conditions.DataTypeCheck --------------------------------- */

if (jTAC.isDefined("Conditions.DataTypeCheck")) {
   jTAC_Temp = {
   /* 
   Adds support for these tokens:
   {DATATYPE} - the name of the data type, taken from the TypeManager.getFriendlyName() function.
   User can override by assigning either the friendlyName or friendlyLookupKey property
   on the TypeManager. When using friendlyLookupKey, you get localization support.
   */
      replaceTokens: function (text, details) {
         var t = this.callParent([text, details]);
         if (jTAC.contains(t, "{DATATYPE}", true)) {
            var rpl = this.getTypeManager().getFriendlyName();
            t = jTAC.replaceAll(t, "{DATATYPE}", rpl, true);
         }
         return t;
      },

      defaultErrorMessage: function () {
         return "<span class='{ERRORLABEL}'>{LABEL}</span> must be a valid {DATATYPE}.";
      }

   }
   jTAC.addMembers("Conditions.DataTypeCheck", jTAC_Temp);
}
/* ---- EXTENDS Conditions.Range --------------------------------- */

if (jTAC.isDefined("Conditions.Range")) {
   jTAC_Temp = {
/*
There is a conflict with the native range rule name. While using "range"
will replace the native rule, it is not a complete replacement. Side effects
in the validator.normalizeRules() function will assume "range" is the native code
and destroy the Condition object data.
*/
      ruleName: function() {
         return "advrange";
      },

   /* 
   Adds support for these tokens:
   {MINIMUM} - show the value of the minimum property. If that value is not a string,
   it will be converted into a string applying formatting from the TypeManager's rules.
   {MAXIMUM} - show the value of the maximum property. If that value is not a string,
   it will be converted into a string applying formatting from the TypeManager's rules.
   */
      replaceTokens: function (text, details) {
         var t = this.callParent([text, details]);
         t = this._tmReplaceToken(t, this.getMinimum(), "{MINIMUM}", details);
         t = this._tmReplaceToken(t, this.getMaximum(), "{MAXIMUM}", details);

         return t;
      },

      defaultErrorMessage: function () {
         return "<span class='{ERRORLABEL}'>{LABEL}</span> must be between {MINIMUM} and {MAXIMUM}.";
      }
   }
   jTAC.addMembers("Conditions.Range", jTAC_Temp);

}

/* ---- EXTENDS Conditions.BaseOperator --------------------------------- */

if (jTAC.isDefined("Conditions.BaseOperator")) {
   jTAC_Temp = {
   /* 
   Adds support for these tokens:
   {OPERATOR} - Describe the operator. It defaults to the same strings stored 
   in the operator property (such as "=" and "<>").
   User can override by using the jTAC.translations system, and editing the properties
   that are the same as the operator values. ("=", "<=", etc)
   */
      replaceTokens: function (text, details) {
         var t = this.callParent([text, details]);
         var rpl = this.getOperator();
         rpl = jTAC.translations.lookup(rpl, rpl);
         if (details.context == "html") {
            rpl = jTAC.htmlEncode(rpl);
         }
         t = jTAC.replaceAll(t, "{OPERATOR}", rpl, true);
         return t;
      }
   }
   jTAC.addMembers("Conditions.BaseOperator", jTAC_Temp);

}

/* ---- EXTENDS Conditions.CompareToValue --------------------------------- */

if (jTAC.isDefined("Conditions.CompareToValue")) {
   jTAC_Temp = {
   /* 
   Adds support for these tokens:
   {VALUETOCOMPARE} - show the value of the [valueToCompare] property. If that value is not a string,
      it will be converted into a string applying formatting from the TypeManager's rules.
   */
      replaceTokens: function (text, details) {
         var t = this.callParent([text, details]);
         t = this._tmReplaceToken(t, this.getValueToCompare(), "{VALUETOCOMPARE}", details);

         return t;
      },

      /*
      Subclasses provide their default error message with this.
      */
      defaultErrorMessage: function () {
         return "<span class='{ERRORLABEL}'>{LABEL}</span> must be {OPERATOR} {VALUETOCOMPARE}.";
      }
   }
   jTAC.addMembers("Conditions.CompareToValue", jTAC_Temp);

}

/* ---- EXTENDS Conditions.CompareTwoElements --------------------------------- */

if (jTAC.isDefined("Conditions.CompareTwoElements")) {
   jTAC_Temp = {
      defaultErrorMessage: function () {
         return "<span class='{ERRORLABEL}'>{LABEL}</span> must be {OPERATOR} <span class='{ERRORLABEL}'>{LABEL2}</span>.";
      }
   }
   jTAC.addMembers("Conditions.CompareTwoElements", jTAC_Temp);

}

/* ---- EXTENDS Conditions.Difference --------------------------------- */

if (jTAC.isDefined("Conditions.Difference")) {
   jTAC_Temp = {
      /* 
      Adds support for these tokens:
      {DIFFVALUE} - show the value of the differenceValue property. If that value is not a string,
      it will be converted into a string. It will not use the typeManager assigned to the 
      typeManager property because the differenceValue is not usually the same type as the values in elements.
      Instead, it uses a new TypeManagers.Float object that strips all trailing zeros.
      */
      replaceTokens: function (text, details) {
         var t = this.callParent([text, details]);
         if (jTAC.contains(t, "{DIFFVALUE}", true)) {
            var rpl = this.getDifferenceValue();
            if (typeof (rpl) != "string") {
               var tm = jTAC.create("TypeManagers.Float");
               tm.setTrailingZeroDecimalPlaces(0);
               tm.setMaxDecimalPlaces(3);
               rpl = tm.toString(rpl);
            }
            if (details.context == "html") {
               rpl = jTAC.htmlEncode(rpl);
            }
            t = jTAC.replaceAll(t, "{DIFFVALUE}", rpl, true);
         }
         return t;
      },

      defaultErrorMessage: function () {
         return "Difference between <span class='{ERRORLABEL}'>{LABEL}</span> and <span class='{ERRORLABEL}'>{LABEL2}</span> must be {OPERATOR} {DIFFVALUE}.";
      }
   }
   jTAC.addMembers("Conditions.Difference", jTAC_Temp);

}

/* ---- EXTENDS Conditions.Required --------------------------------- */

if (jTAC.isDefined("Conditions.Required")) {
   jTAC_Temp = {
/*
There is a conflict with the native required rule name. While using "required"
will replace the native rule, it is not a complete replacement.
The validator.optional() function will assume "required" is the native code
and fail to operate correctly.
*/
      ruleName: function() {
         return "advrequired";
      },


   /* 
   Adds support for these tokens:
   {COUNT} - show the number of connections that were not null.
   {MINIMUM} - show the value of the minimum property.
   {MAXIMUM} - show the value of the maximum property.
   */

      replaceTokens: function (text, details) {
         var t = this.callParent([text, details]);

         var rpl = this.count;
         if (rpl == null) {
            rpl = 0; // just in case count was not defined
         }
         t = jTAC.replaceAll(t, "{COUNT}", rpl.toString(), true);
            // NOTE: Not htmlEncoding here because these values are unformatted integers, only containing digits.
         t = jTAC.replaceAll(t, "{MINIMUM}", this.getMinimum().toString(), true);

         return jTAC.replaceAll(t, "{MAXIMUM}", this.getMaximum().toString(), true);
      },

      defaultErrorMessage: function () {
         return "<span class='{ERRORLABEL}'>{LABEL}</span> requires an entry.";
      }
   }
   jTAC.addMembers("Conditions.Required", jTAC_Temp);

}

/* ---- EXTENDS Conditions.RequiredIndex --------------------------------- */

if (jTAC.isDefined("Conditions.RequiredIndex")) {
   jTAC_Temp = {
      defaultErrorMessage: function () {
         return "<span class='{ERRORLABEL}'>{LABEL}</span> requires a selection.";
      }
   }
   jTAC.addMembers("Conditions.RequiredIndex", jTAC_Temp);

}

/* ---- EXTENDS Conditions.SelectedIndex --------------------------------- */

if (jTAC.isDefined("Conditions.SelectedIndex")) {
   jTAC_Temp = {
      defaultErrorMessage: function () {
         return "<span class='{ERRORLABEL}'>{LABEL}</span> has an invalid selection. Choose another.";
      }
   }
   jTAC.addMembers("Conditions.SelectedIndex", jTAC_Temp);

}
/* ---- EXTENDS Conditions.BaseCounter --------------------------------- */

if (jTAC.isDefined("Conditions.BaseCounter")) {
   jTAC_Temp = {

   /* 
   Adds support for these tokens:
   {COUNT} - show the count returned by the _connCount() function.
   {COUNT:singular:plural} - Show one of the two strings in singular or plural positions,
      depending on the count. If 1, show the singular form.
   {MINIMUM} - show the value of the minimum property.
   {MAXIMUM} - show the value of the maximum property.
   {DIFF} - the number the count exceeds the max or is below the minimum.
   {DIFF:singular:plural} - Show one of the two strings in singular or plural positions,
      depending on the value of {DIFF}. If 1, show the singular form.

   */
      replaceTokens: function (text, details) {
         var t = this.callParent([text, details]);

         var cnt = this.count;
         if (cnt == null) {
            cnt = 0; // just in case count was not defined
         }
         t = jTAC.replaceAll(t, "{COUNT}", cnt.toString(), true);
         t = this._spReplaceToken(t, cnt, "COUNT");   // supports {COUNT:singular:plural}

         var min = this.getMinimum();
         if (min == null) {
            min = 0;
         }
            // NOTE: Not htmlEncoding here because these values are unformatted integers, only containing digits.
         t = jTAC.replaceAll(t, "{MINIMUM}", min.toString(), true);

         var max = this.getMaximum();
         if (max == null) {
            max = 9999999;
         }
         t = jTAC.replaceAll(t, "{MAXIMUM}", max.toString(), true);

         var exc = Math.max(min - cnt, cnt - max);
         t = jTAC.replaceAll(t, "{DIFF}", exc.toString(), true);
         t = this._spReplaceToken(t, exc, "DIFF");   // supports {DIFF:singular:plural}

         return t;
      }
   }
   jTAC.addMembers("Conditions.BaseCounter", jTAC_Temp);

}

/* ---- EXTENDS Conditions.CharacterCount --------------------------------- */

if (jTAC.isDefined("Conditions.CharacterCount")) {
   jTAC_Temp = {
      defaultErrorMessage: function () {
         return "<span class='{ERRORLABEL}'>{LABEL}</span> must have between {MINIMUM} and {MAXIMUM} characters.";
      }
   }
   jTAC.addMembers("Conditions.CharacterCount", jTAC_Temp);

}

/* ---- EXTENDS Conditions.WordCount --------------------------------- */

if (jTAC.isDefined("Conditions.WordCount")) {
   jTAC_Temp = {
      defaultErrorMessage: function () {
         return "<span class='{ERRORLABEL}'>{LABEL}</span> must have between {MINIMUM} and {MAXIMUM} words.";
      }
   }
   jTAC.addMembers("Conditions.WordCount", jTAC_Temp);

}

/* ---- EXTENDS Conditions.CountSelections --------------------------------- */

if (jTAC.isDefined("Conditions.CountSelections")) {
   jTAC_Temp = {
      defaultErrorMessage: function () {
         return "<span class='{ERRORLABEL}'>{LABEL}</span> must have between {MINIMUM} and {MAXIMUM} selections.";
      }
   }
   jTAC.addMembers("Conditions.CountSelections", jTAC_Temp);

}

/* ---- EXTENDS Conditions.RegExp --------------------------------- */

if (jTAC.isDefined("Conditions.RegExp")) {
   jTAC_Temp = {
      config: { 
         patternLabel: "format", 
         patternLookupKey: null
      },
      configrule: {
         patternLookupKey :jTAC.checkAsStrOrNull
      },

   /* 
   Adds support for these tokens:
   {PATTERN} - shows the patternLabel token which is often used to define
   the type of data, like "Phone number" or "Street Address".
   Use the patternLookupKey property to use the jTAC.translations system
   allowing for localization.
   */

      replaceTokens: function (text, details) {
         var t = this.callParent([text, details]);

         var rpl = jTAC.translations.lookup(this.getPatternLookupKey(), this.getPatternLabel());
         if (details.context == "html") {
            rpl = jTAC.htmlEncode(rpl);
         }
         return jTAC.replaceAll(t, "{PATTERN}", rpl, true);
      },

      defaultErrorMessage: function () {
         return "<span class='{ERRORLABEL}'>{LABEL}</span> must be a valid {PATTERN}.";
      }

   }
   jTAC.addMembers("Conditions.RegExp", jTAC_Temp);

}

/* ---- EXTENDS Conditions.DuplicateEntry --------------------------------- */

if (jTAC.isDefined("Conditions.DuplicateEntry")) {
   jTAC_Temp = {
      /* 
      Adds support for these tokens:
      {LABEL1} - The label associated with the first field with a matching value.
      {LABEL2} - The label associated with the second field with a matching value.
      */
      replaceTokens: function (text, details) {
         var t = this.callParent([text, details]);
         if (jTAC.contains(t, "{LABEL", true)) {
         // the condition has setup references to the two connections that are matching
         // in _errconn1 and _errconn2.

            var rpl = "field 1";
            if (this._errconn1) {
               rpl = this._errconn1.getLabel();
            }
            t = jTAC.replaceAll(t, "{LABEL1}", rpl, true);
            rpl = "field 2";
            if (this._errconn2) {
               rpl = this._errconn2.getLabel();
            }
            t = jTAC.replaceAll(t, "{LABEL2}", rpl, true);
         }
         return t;
      },

      defaultErrorMessage: function () {
         return "<span class='{ERRORLABEL}'>{LABEL1}</span> must be different from <span class='{ERRORLABEL}'>{LABEL2}</span>.";
      }
   }
   jTAC.addMembers("Conditions.DuplicateEntry", jTAC_Temp);

}

/* ---- EXTENDS Conditions.BooleanLogic --------------------------------- */

if (jTAC.isDefined("Conditions.BooleanLogic")) {
   jTAC_Temp = {
      defaultErrorMessage: function () {
         return "*** EXPLICITY ASSIGN THIS MESSAGE ***";
      }
   }
   jTAC.addMembers("Conditions.BooleanLogic", jTAC_Temp);
}

/* ---- EXTENDS Conditions.UserFunction --------------------------------- */

if (jTAC.isDefined("Conditions.UserFunction")) {
   jTAC_Temp = {
      defaultErrorMessage: function () {
         return "*** EXPLICITY ASSIGN THIS MESSAGE ***";
      }
   }
   jTAC.addMembers("Conditions.UserFunction", jTAC_Temp);
}
// jTAC/jquery-validate/Rules.js
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
Module: Extending jquery-validate with support for Conditions.

Purpose:
Add and replace rules within jquery-validate, using the Condition
objects defined within jTAC.

Every Condition class that defined within the jTAC global will
become a rule in jquery-validate. The rule name will be a lowercase 
version of the class name of the Condition.

It also supports unobtrusive validation when jquery-validate-unobtrusive.js is loaded.

Each rule in jquery-validate has optional parameters, which are 
designed to tell the rule how to behave. For example, a range rule
needs a value for minimum and maximum.

jTAC always has you define a javascript object to customize its rules.
The object's properties are assigned to properties on the actual Condition object.
For example, when using the Conditions.Range class, this defines
its minimum and maximum property values:
{minimum: [value], maximum: [value]}

Example:
$("DateTextBox1").rules("add", {
  required: true,
  datatypecheck : { "typeManager" : { "jtacClass" : "Date" } }
  range : { "typeManager" : { "jtacClass" : "Date" }, 
                 "minimum" : "2012-01-01", 
                 "maximum" : "2012-12-31" }
});


When using unobtrusive validation, the javascript object should 
be defined in JSon format and appear in an attribute with this pattern:
data-val-rulename-json="{'property':value, 'property2':value}"

Example:
<input type='text' id='textbox1' name='textbox1'
   data-val="true"
   data-val-required=""
   data-val-datatypecheck=""
   data-val-datatypecheck-json="{'datatype': 'Date'}"
   data-val-range=""
   data-val-range-json="{'minimum': '2012-01-01', 'maximum': '2012-12-31'}" />

Rules for the syntax of the parameters object
---------------------------------------------
1) Parameter names require a case sensitive match to the actual property name
   on the Condition object. When using JSON, enclose the name in quotes.

2) String values representing numbers, dates, and times should always be 
   in a culture neutral format.
   Integers - digits only plus optional lead minus character. 
         Valid: 1000   -1000
         Invalid: 1,000   1000.0   1000-
   Float - digits and optionally a period followed by at least one more digit.
      Optional lead minus character.
         Valid: 1000   -1000   1000.0  -1000.0  1.23400
         Invalid: 1,000   1,000.0  1000.   1000.0-
   Currency and Percent : Same as Float
   Date - yyyy-MM-dd
         Valid: 2012-01-31
         Invalid: 01/31/2012
   Time - HH:mm:ss  uses 24 hour format 00-24. Always includes seconds.
         Valid: 14:00:00  00:00:00
         Invalid: 09:00:00 AM     09:00
   DateTime - yyyy-MM-dd HH:mm:ss
         Combines date and time with a space separator.

3) Conditions that use a TypeManager have several ways to define the TypeManager. 
   - The recommended approach is to add the [data-jtac-datatype] attribute to
      the element's markup. Assign its value to one of the TypeManager class names or aliases.

   - Use the "datatype" property as parameter, with the TypeManager class name or alias.
     datatypecheck : { "datatype" : "Date" }

   - Use the "typeManager" property as a parameter when you want to create a typeManager object with optional
     properties to customize it.
     datatypecheck : { "typeManager" : { "jtacClass" : "TypeManagers.Date" } }
     datatypecheck : { "typeManager" : { "jtacClass" : "Date", "dateFormat" : "1", fallbackDateFormats="[0, 10]" } }

   - If nothing else defines the TypeManager, it will use the TypeManagers.Integer class.

4) When writing javascript code to create the parameters, you don't need true Javascript Object Notation. 
   Ordinary objects will do. (When embedding parameters in an HTML tag's data property, you must use JSon.)
   When you do this, you can replace parameter values with javascript code that creates objects.
   In this example, typeManager is created from jTAC.create()
   and minimum/maximum use a Date object.

   $("DateTextBox1").rules("add", {
     required: true,
     datatypecheckcondition : { typeManager : jTAC.create("Date") }
     rangecondition : { typeManager : jTAC.create("Date"), 
                    minimum : new Date(2012, 0, 1), 
                    maximum : new Date(2012, 11, 31) }
   });

5) Do not specify the [elementId] property found on Conditions.
   The [elementId] is assigned automatically for you based on the id
   of the element being validated. 


Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
ALWAYS LOAD \jTAC\jquery-validate\ReplaceTokens PlugIn.js BEFORE THIS FILE IS LOADED
Connections.Base
Connections.BaseElement
Connections.FormElement
Conditions.Base and any Condition subclasses for which rules are used on the page
TypeManagers.Base and any TypeManager subclasses for which rules are used on the page

----------------------------------------------------------- */

if (!window.jTAC)
   throw new Error("window.jTAC not created.");

if (!window.jQuery || !$.validator)
   jTAC.error("Must load jquery and jquery-validate script files first.");

if ($.validator.replaceTokens === undefined) // !!replaceTokens is a proposed feature for jquery-validate
   jTAC.error("Must load /jTAC/jquery-validate/ReplaceTokens PlugIn.js script file before Rules.js.");

jTAC.require(["Connections.FormElement", "TypeManagers.Base", "Conditions.Base"]);

jTAC.jqueryValidate = ( function () {
   var unobtrusive = $.validator ? $.validator.unobtrusive : null;

   /*
   Creates a Condition object and prepares it with the connection
   property pointing to the element.
      element (DOM) - DOM element that is being validated
      condname (string) - if assigned, it is the name of the condition class
         or its short hand, as registerd with jTAC.define() or jTAC.defineAlias().
         If null, the param object must have a jtacClass property
         with this name.
      param (object) - json or native javascript object that identifies
         properties and associated values to update on the Condition object
         that is created. This is usually a jquery-validate Rules object
         like $(val).rules("add", { valuetocomparecondition : { this is param } })
         Also can specify true or null to indicate no additional json needed.
   Returns: the Condition object created.
   May thrown exceptions.
   */
   function createCondition(element, condname, param) {
      try
      {
         jTAC._internal.pushContext("jqueryValidate.createCondition()", condname);
         delete param["Condition"];   // a previously stored object
         var cond;
         if (typeof(param) == "function") {
            cond = param();
         }
         else if (typeof(param) == "object") {
            cond = jTAC.create(condname, param);
         }
         else if ((param === true) || (param == null)) {
            cond = jTAC.create(condname, null);
         }
         else 
            jTAC.error("Value for a condition function must be an object.");
         if (element && (cond.connection instanceof jTAC.Connections.BaseElement)) {
            cond.connection = jTAC.connectionResolver.create(element, cond.connection);
         }
         return cond;
      }
      finally {
         jTAC._internal.popContext();
      }

   }

   /*
   Used by individual jquery-validation methods.
      element (object) - the DOM element. Used by the condition's connection property.
      condname (string) - Name of the Condition class or an alias. 
      params (object) - json or traditional object where each property
            is the name of a property on the Condition object to be updated
            and its value is the value to assign to that property
            on the condition object. Names are case sensitive.
            When the condition uses a TypeManager, the user can specify
            the TypeManager's name or alias in the [datatype] property.
            Preregistered names: "Integer", "Float", "Currency", "Percent",
               "Date", "TimeOfDay", "DateTime", "Duration"
      The value of [this] is current jquery-validator object that invokes this call.
      The caller should have the correct object in its "this" variable.

   NOTE: This validation function does not use $.validate.optional(element) 
   which is common in jquery-validate functions.
   Conditions must determine if they include or exclude an unassigned value.
   The condition function also does not use the value parameter,
   electing to get the value through the connection objects. That allows
   getting the value in a native form (like a Date object) or at least
   cleaned up (such as a watermark removed).

   */
   function evaluate(element, condname, params) {
      try
      {
         jTAC._internal.pushContext("jqueryValidate.evaluate()", condname);

         if (params == null)
            jTAC.error("Params must be assigned.");
         if (!condname && params["jtacClass"]) {
            condname = params["jtacClass"];
         }
         delete params["jtacClass"]; // just in case it was added.

         var cond = params["Condition"];
         if (!cond) {
            cond = createCondition(element, condname, params);
            params["Condition"] = cond;   // share with other functions that will use it later (like getting error messages and replacing tokens)
         }
         if (!cond.canEvaluate.call(cond)) {
            return "dependency-mismatch";
         }

         var r = cond.evaluate.call(cond);
         if (r == -1) {
            return "dependency-mismatch";
         }
         return !!r; // r is either 1 or 0. Convert to boolean.
      }
      finally {
         jTAC._internal.popContext();
      }
   }


/*
Used by the onchange event of elements that are not directly validated
by jquery-validate's own event handlers to have them validate and update error messages.
*/
   function validate(validator, id)
   {
      try
      {
         jTAC._internal.pushContext("jqueryValidate.validate('" + id + "')");
         var el = $("#" + id);
         if (el.valid())   // since valid does not remove a resolve error, force it
            validator.defaultShowErrors();
      }
      finally {
         jTAC._internal.popContext();
      }
   }

   // ---- SETTING UP --------------------------------------------------
/*
The $(element).validate method is passed the options object
before it is used. This is the item to update those options with new defaults
where the user has not explicitly assigned a value.
This code replaces $(element).validate to assign new defaults and calls
the original value.
*/
   function defaultOptions() {
      var orig = $.prototype.validate;
      $.prototype.validate = function( options ) {
         if (this.length && options) {
         
            if (options.messagelabel === undefined) {
               options.messagelabel = "message-label";
            }
            if (options.labelErrorClass === undefined) {
               options.labelErrorClass = "label-validation-error";
            }
            if (options.containerErrorClass === undefined) {
               options.containerErrorClass = "container-validation-error";
            }
            if (options.messageErrorClass === undefined) {
               options.messageErrorClass = "message-validation-error"; 
            }
            if (options.messageValidClass === undefined) {
               options.messageValidClass = "message-validation-valid"; 
            }
            if (options.inputErrorClass === undefined) {
               options.inputErrorClass = options.errorClass ? options.errorClass : "input-validation-error";
            }
      // errorClass is used internally by jquery-validate to track which element is the error label
      // (in addition to being the class for the input element).
      // We've separated error label and input element through messageErrorClass and inputErrorClass.
      // Our highlight input code ignores options.errorClass.
      // However, we must still use it for the message's label because once that label is created,
      // each time its shown, $.validator.showLabel clears the class attribute before assigning errorClass.
      // We cannot control that. So options.errorClass must set the same value as in msesageErrorClass.
            options.errorClass = options.messageErrorClass;

            if (options.inputValidClass === undefined) {
               options.inputValidClass = options.validClass ? options.validClass : "input-validation-valid";
            }
            options.validClass = options.messageValidClass;  // same idea as setting errorClass to "errorowner"

            // when unobtrusive is installed, it always assigns errorPlacement. We are overriding its default.
            // If the user assigned options.errorPlacement, that value is reassigned to options.errorPlacementFallback
            if (unobtrusive || (options.errorPlacement === undefined)) {
               if (!unobtrusive && options.errorPlacement && !options.errorPlacementFallback) {
                  options.errorPlacementFallback = options.errorPlacement;
               }
               options.errorPlacement = $.proxy(onError, this[0]);   // this[0] is the form element
            }
            // when unobtrusive is installed, it always assigns success. We are overriding its default.
            // If the user assigned options.success, that value is reassigned to options.successFallback
            if (unobtrusive || (options.success === undefined)) {
               if (!unobtrusive && options.success && !options.successFallback) {
                  options.successFallback = options.success;
               }
               options.success = $.proxy(onSuccess, this[0]);   // this[0] is the form element
            }
   /* !!PENDING
            if (options.summaryErrorClass === undefined) {
               options.summaryErrorClass = "validation-summary-errors";
            }
            if (options.summaryValidClass === undefined) {
               options.summaryValidClass = "validation-summary-valid";
            }
            // when unobtrusive is installed, it always assigns success. We are overriding its default.
            // If the user assigned options.success, that value is reassigned to options.successFallback
            if (unobtrusive || (options.invalidHandler === undefined)) {
               if (!unobtrusive && options.invalidHandler && !options.invalidHandlerFallback) {
                  options.invalidHandlerFallback = options.invalidHandler;
               }
               options.invalidHandler = $.proxy(onErrors, this[0]);   // this[0] is the form element
            }
   */
         }

	      return orig.call(this, options);
      };
   }

   defaultOptions();

   /*
      Lets you modify options already defined on the form element.
      Usually used with unobtrusive validation, which has its own
      predefined list of options.

      See http://docs.jquery.com/Plugins/Validation/validate#toptions for options.

         formElement (jquery element) - a <form> element.
            If it does not have options assigned the newOptions will be
            used to define it and $.validate(options) will be called.
         newOptions (object) - properties to change in the options
            on the form. Each property name must match those 
            supported by validation options.
            Any property that should take a function reference can
            also take a string that is the name of a global function 
            (it is defined on the window object).
            That string will be converted to the function reference.
      Returns the combined options.

   */
   function mergeOptions(formElement, newOptions) {
   // properties that are actually functions.
   // NOTE: "success" can be either a string or function. If found on the window object, it is a function.
      var funcProps = ["submitHandler", "invalidHandler", "invalidHandlerFallback", "showErrors", "errorPlacement", "errorPlacementFallback", "success", "successFallback", "highlight", "unhighlight", "highlight1", "unhighlight1"];

      var validator = $.data(formElement[0], "validator");
      var options;
      if (validator && validator.settings) {
         options = validator.settings;
      }
      else {
         validator = formElement.validate({});    // initialize settings with empty object
         options = validator.settings;
      }

   // preprocess the newOptions collection
      var val = newOptions["success"] || newOptions["successFallback"];
      if (val) { // can be a function (as a string with a function name) or a string value (that isn't a function)
         // see if its a function on the window object. If not, remove it from funcProps so its not converted
         if (window[val] === undefined) {
            funcProps.splice(funcProps.indexOf("success"), 1);
         }
      }

      // transfer newOptions properties to options, converting function names to functions
      for (var propName in newOptions) {
         if (!propName)
            continue;
         var val = newOptions[propName];
         if ((funcProps.indexOf(propName) > -1) && (typeof val == "string")) { // it is a function name
            options[propName] = window[val]; // may return undefined
            if ((options[propName] == null) && window.console) {
               jTAC.warn("Validator options include the property [" + propName +
                  " = '" + val + "']. This value must match a globally declared function.", null, "jqueryValidate.MergeOptions");
            }
         }
         else {
            options[propName] = val;
         }
      }

      return options;
   }


   /*
   Adds the ability to let additional Connections fire the 
   jquery-validate valid() method on the original element
   after an onchange or onclick event. It does not try to handle
   onfocus, onblur, or onkeyup to avoid making things more complex.

      formselector - Anything that you can pass to $() to return
         an individual form element, such as "#Form1" or the DOM object.
   */
   function attachMultiConnections(formselector)
   {
      try
      {
         jTAC._internal.pushContext("jqueryValidate.attachMultiConnections()");

         var form = $(formselector);
         if (!form || !form.length)
            return;
         var validator = $.data(form[0], "validator");
         var rules = validator.settings.rules;

         $.each(rules, function (key, value) {
            if (!key) return;
            var el = document.getElementById(key); // see if exists in DOM
            if (!el) {
               el = document.getElementsByName(key);
               if (!el || !el.length) return;
               el = el[0];
            }
            $.each(value, function (childkey, paramcont) {
               if (childkey == "messages")
                  return;
               var condname = ruleNameMap[childkey];
               if (condname == null)
                  return;
               var srcId = el.id;
               var func = function (e) { validate(validator, srcId); };
               try {
                  var cond = createCondition(el, condname, 
                     paramcont.param ? paramcont.param : paramcont); // paramcont has 'param' property when not in unobtrusive mode. Its missing in unobtrusive mode.
                  if (paramcont.param)
                     paramcont.param["Condition"] = cond;   // save for later requests to avoid creating this object
                  // all connections are in a collection

                  var conns = [];
                  cond.collectConnections(conns);
                  for (var j = 0; j < conns.length; j++) { // skip the first as its already handled
                     if (conns[j] instanceof jTAC.Connections.BaseElement) {
                        if (j > 0) {  // j=0 is setup with the onchange event by jquery-validate
                           conns[j].addEventListener("onchange", func, "qvc" + el.id);
                        }
                        conns[j].addSupportEventListeners("onchange", func, "qvc" + el.id);  // allows the connection with a list of checkboxes/radios to be connected
                     }
                  }  // for j

               }
               catch (e) {  // in case there is no conversion
                  jTAC.warn("Exception occurred when checking element " + srcId
						       + ", check the '" + condname + "' method. Exception message: " + e.message);
               }
            });
         });
      }
      finally {
         jTAC._internal.popContext();
      }

   }


   /*
   Installs features for unobtrusive validation. This is called automatically
   on $(document).ready. It assumes jquery-validate-#.#.#.js has been loaded
   prior to this script file.
   It calls mergeOptions with the object from the form's
   data-val-options property.
   It also calls attachMultiConnections.
   If the order of loading has this run too late, call it explicitly prior to code that depends on it.
   */
   function installUnobtrusive() {
      if (runInstall)
         return;
      runInstall = true;
      try
      {
         jTAC._internal.pushContext("jqueryValidate.installUnobtrusive()");

         var forms = $("form");
         $.each(forms, function (key, form)  { 
               // override default validator options by defining data-val-options on the <form> element.
               form = $(form);
               var newOptions = form.data("val-options");
               if (newOptions) {
                  try {
                     if (typeof newOptions == "string")
                        newOptions = window.eval("(" + newOptions + ");");
                     mergeOptions(form, newOptions);
                  }
                  catch (e) {
                     jTAC.error("Could not parse the data-val-options attribute of form id [" + form.get()[0].id + "] Error info:" + e.toString());
                  }
               }
               attachMultiConnections(form); 
            }
         );
      }
      finally {
         jTAC._internal.popContext();
      }

   }
   var runInstall = false;
   if (unobtrusive) {
   // this array should hold function that will be invoked after unobtrusive validation has been setup.
   // For example, running jsunit tests.
   // To add, use jTAC.jqueryValidate.postInit.push(function)
      var postInit = [];
      
      unobtrusive.nativeParse = unobtrusive.parse;
      unobtrusive.parse = function(selector) {

         unobtrusive.nativeParse(selector);
         installUnobtrusive();
         for (var i = 0; i < postInit.length; i++) {
            postInit[i]();
         }
      }
/*
      $(document).ready(installUnobtrusive);
*/
   }




   /* --- CONVERTING CONDITIONS INTO VALIDATION RULES ------- */
   /*
   Master function to register rules based on available Condiiton classes.
   It locates all Condition classes that are defined in jTAC (and are not abstract).
   It calls useConditionAsRule for each, giving the rule name the class name.
   This will overwrite existing rules (required and range, specifically).
   This is called automatically as jTAC.jqueryValidate is initializing.
   */
   function registerConditionsAsRules() {
      try
      {
         jTAC._internal.pushContext("jqueryValidate.registerConditionsAsRules()");

         var defs = jTAC._internal.definitions;
         for (var fullClassName in defs) {
            var def = jTAC.getDefinition(fullClassName);
            if (def.inst instanceof jTAC.Conditions.Base) {
               if (!def.inst.$abstract) {
                  useConditionAsRule(def.inst.ruleName(), fullClassName);
               }
            }
         }  // for
      }
      finally {
         jTAC._internal.popContext();
      }

   }


   /* 
   The default error messages that will be registered with $.validator.addMethod.
   These values are normally populated by using the Condition's errorMessage property
   and the jTAC.translations system to localize them.
   */
   var defaultMessages = {};

   /* An array populated by useConditionAsRule that associates
   the rule name to the fulll class name used by the jTAC.createByClassName().
   Each element has a key with the rule name and value with the class lookup. */
   var ruleNameMap = [];


   /*
   Call to register any condition as a jquery-validate rule.
   It calls $.validator.addMethod.
   It also sets up the unobtrusive validation adapter for the function.
      ruleName (string) - the rule name, which becomes a property
         on $.validator. This is passed as the first param
         of addMessage().
      fullClassName (string) - The Condition's full class name.
      tokenfunc (function) - A function compatible with jquery-validate's
         replaceTokens functions. It takes 4 parameters (message, element, param, value) 
         and returns the updated message.
         If null, $.validator.defaultTokenReplacer is used.
   */
   function useConditionAsRule(ruleName, fullClassName)
   {
      ruleNameMap[ruleName] = fullClassName;

      var ruleFnc = function(value, element, params) {
         return evaluate.call(this, element, fullClassName, params);
      };

      var emFnc = function (ruleparms, element) {
         return retrieveErrorMessage(ruleName, ruleparms);
      }

      $.validator.addMethod(ruleName, ruleFnc, emFnc);
      if ($.validator.replaceTokens) {  
         $.validator.replaceTokens[ruleName] = replaceTokens;
      }
   // unobtrusive Adapter function that supports jquery-validate.
   // See http://bradwilson.typepad.com/blog/2010/10/mvc3-unobtrusive-validation.html
   //    options (object) - contains properties described in the above blog post
      if ($.validator.unobtrusive) {
         $.validator.unobtrusive.adapters.add(ruleName, ['json'],
            function (options) {
               try {
                  var obj = options.params.json ? eval("(" + options.params.json + ")") : {};   // convert from a string to actual json
//   The param node is important here. It is an object and therefore can be
//   expanded to host the Condition instance, which is needed by jTAC.
                  options.rules[ruleName] = {param: obj};

/*
                  options.rules[ruleName] = obj;
*/
               }
               catch (e) {
					   jTAC.error("Syntax error in data-val-" + ruleName + "-json attribute of the HTML element " + 
                     options.element.id + ". Error reported: " + e + " Attribute value: " + options.params.json.toString());
               }
               if (options.message) {
                  options.messages[ruleName] = options.message;
               }

            });
      } // if 
   }

/*
Function called from the error message function defined with 
the rule. That function takes different parameters from this one.
So the caller should use the parameters required by jquery-validate
and call this.
*/
   function retrieveErrorMessage(ruleName, param) {
      var cond = param["Condition"];
   // the user can overide the default condition by specifying a key
   // in the condition's lookupID property.
      var defmsg = defaultMessages[ruleName];
      if ( !defmsg ) {
         // if using localized strings, the current culture's strings are the defaults
         defmsg = defaultMessages[ruleName] = jTAC.translations.lookup(ruleName + "EM",  cond.defaultErrorMessage());
      }
      if (cond && cond.getLookupKey) {
         var key = cond.getLookupKey();
         if (key)
            defmsg = jTAC.translations.lookup(key, defmsg);
      }
      return defmsg;
   }

   /*
   Function that supports $.validator.replaceTokens. Used by
   useConditionAsRule for each Condition registered.
   param["Condition"] must contain the Condition object.
   */
   function replaceTokens(message, element, param, value) {
      try {
         var cond = param["Condition"]; // added by evaluate
         if (cond && cond.replaceTokens) {
		      var validator = $.data(element.form, 'validator');

            message = cond.replaceTokens.call(cond, message,
               { 
                  element: element, 
                  value: value, 
                  validator: validator, 
                  context: "html", 
                  messagelabel: validator.settings.messagelabel 
               });
         }
      }
      catch (e) {
         // usually means the methodname was not mapped to a Condition
	      jTAC.warn("Exception occurred replacing tokens in message \"" + message + "\" of element " + 
            (element ? element.id : "[unknown]") + " Exception: " + e.message, 
            null, "jqueryValidate.replaceTokens()");

      }
      return message;
   }

   registerConditionsAsRules();

/* ---- DISPLAY ERRORS ------------------------------------
These methods are extracted from jquery-validate-unobtrusive.js
for these reasons:
1. Give them to non-unobtrusive situations.
2. Enhance them 
--------------------------------------------------------- */

   /*
   Unobtrusive validation simplifies setting the placing the error message
   by setting options.errorPlacement to onError, which locates
   a container element with the [data-valmsg-for] attribute specifying
   the name of the input element.
   Users typically do this:
   <input type='text' id="textBox1" name="textBox1" 
   data-val="true" data-val-rulename="" />
   <span data-valmsg-for="textBox1" ></span>
   This feature is now available to non-unobtrusive validation
   and uses options properties to identify the style sheet:
   options.messageErrorClass
   options.messageValidClass
   Users can override these on individual error message containers
   with the data-jtac-errorclass attribute.
   <span data-valmsg-for="textBox1" data-jtac-errorclass="myclass" ></span>

   If there is no container element with data-valmsg-for, it falls back using
   either options.errorPlacementFallback (a function that is the same
   as options.errorPlacement) or inserting the label after the inputElement.
   */
   function onError(error, inputElement) {  // 'this' is the form element
      var validator = $.data(this, "validator");
      var options = validator.settings;
      var name = inputElement[0].name || inputElement[0].id;
      var container = $(this).find("[data-valmsg-for='" + name + "']");
      if (!container || !container.length) {
         error.removeClass(options.messageValidClass).addClass(options.messageErrorClass); // jquery-validate uses options.errorClass. We use that for the input only.

         if (options.errorPlacementFallback) {
            options.errorPlacementFallback.call(validator, error, inputElement);
         }
         else {
            error.insertAfter(inputElement);   // default rule
         }
         return;
      }

      // Adapted from jquery-validate.unobtrusive's onError function

      // Continue to use the error element as what is shown and hidden
      // The container is always present and has fixed style sheet class names as used here. 
      // Normally these class names do not have any styles and are used to 
      // prevent other styles that apply to SPAN tags from impacting the container.
      // However, these class names can be populated with styles with good reason.
      container.removeClass("field-validation-valid").addClass("field-validation-error");

      error.data("unobtrusiveContainer", container);

      var ec = $(container).data("jtac-errorclass");
      if (ec == null) { // ec == "" is used
         ec = options.messageErrorClass;
      }
      var vc = $(container).data("jtac-validclass");
      if (vc == null) { // vc == "" is used
         vc = options.messageValidClass;
      }

      error.removeClass(vc).addClass(ec);

      var replace = $.parseJSON(container.attr("data-valmsg-replace")) !== false;
      if (replace) {
         container.empty();
         error.appendTo(container);
      }
      else {
         error.hide();
      }
   }

   /*
   The reverse of onError. Based on the same-named method in jquery-validate-unobtrusive,
   this is called when the error is removed. It cleans up the error message label
   (which has already had its innerHTML set to "") by cleaning up the class on the label.
   This feature is now available to non-unobtrusive validation
   and uses options properties to identify the style sheet:
   options.messageErrorClass
   options.messageValidClass
   Users can override these on individual error message containers
   with the data-jtac-validclass attribute.
   <span data-valmsg-for="textBox1" data-jtac-validclass="myclass" ></span>

   If there is no container element with data-valmsg-for, it falls back using
   either options.successFallback (a property that is the same
   as options.success). It can be either a class name (string) or a function.
   */
   function onSuccess(error) {  // 'this' is the form element
      var validator = $.data(this, "validator");
      var options = validator.settings;

      var container = error.data("unobtrusiveContainer");
      if (!container || !container.length) {
         error.removeClass(options.messageErrorClass).addClass(options.messageValidClass);

         var fb = options.successFallback;
         if (fb != null) {
            if (typeof fb == "string") {
               label.addClass(fb)
            }
            else {
               fb.call(validator, error);
            }
         }
         return;
      }

      if (container) {
         var ec = $(container).data("jtac-errorclass");
         if (ec == null) { // ec == "" is used
            ec = options.messageErrorClass;
         }
         var vc = $(container).data("jtac-validclass");
         if (vc == null) { // vc == "" is used
            vc = options.messageValidClass;
         }

         container.removeClass("field-validation-error").addClass("field-validation-valid");

         error.removeData("unobtrusiveContainer");
         error.removeClass(ec).addClass(vc);

         var replace = $.parseJSON(container.attr("data-valmsg-replace"));
         if (replace) {
            container.empty();
         }
      }
   }
/* !!!PENDING
function onErrors(form, validator) {  // 'this' is the form element
   var validator = $.data(this, "validator");
   var options = validator.settings;
   var container = $(this).find("[data-valmsg-summary=true]");
   if (!container || !container.length) {
      if (options.invalidHandlertFallback) {
         options.invalidHandlerFallback.call(validator, form, validator);
      }
      return;
   }
   var list = container.find("ul");

   if (list && list.length && validator.errorList.length) {

      list.empty();
      var ec = $(container).data("jtac-errorclass") || options.summaryErrorClass;
      var vc = $(container).data("jtac-validclass") || options.summaryValidClass;
      container.addClass(ec).removeClass(vc);

      $.each(validator.errorList, function () {
            $("<li />").html(this.message).appendTo(list);
      });
   }
}
*/

/* ----- HILIGHT AND UNHILIGHT FIELD REPLACEMENT --------
jquery-validate provides highlight and unhighlight properties
on the options to the validate() method.
http://docs.jquery.com/Plugins/Validation/validate

The default method cannot handle some of the features introduced
by jTAC including:
- Supporting multiple input elements to highlight.
- Switching from the actual element to another element to highlight
   (important when validating the Calculations.Widget, which uses
   a hidden field, but could display the error case in
   its displayConnection element.)
- Updating the style of non-input fields nearby, such as a label
   or a div containing the element.

------------------------------------------------------ */


   /*
   Replacement for the $.validate.defaultShowErrors function
   that supports the alternative highlight features.
   The original is kept in the variable origDefaultShowErrors
   and is called to maintain the original behavior.
   */
   function defaultShowErrors() {
      function captureH(el, ec, vc) {
         if (!el || !el.id) {
            return;
         }
         if (elementsFound[el.id] == undefined) {
            elementsFound[el.id] = { valid: false, element: el };
         }
      }
      function captureU(el, ec, vc) {
         if (!el || !el.id) {
            return;
         }
         if ((elementsFound[el.id] == undefined) || elementsFound[el.id]) {  // invalid overrides valid.
            elementsFound[el.id] = { valid: true, element: el };
         }
      }
      try
      {
         jTAC._internal.pushContext("jqueryValidate.defaultShowErrors()");

      // this object will be populated with each id of an element found as the property name
      // and an object as the value of the property. That child object has these properties:
      //   valid (boolean) - the validity state
      //   element (object) - reference to the element whose state is changed.
      // After all elements are identified and validation is determined, each property
      // will be used to apply highlight or unhighlight to the element.
      // This object is populated by the captureH and captureU functions.
      // NOTE: This design allows rules that are native (non-jTAC) to identify themselves.

         var elementsFound = {};

         var options = this.settings;

         var svH = options.highlight;
         var svUH = options.unhighlight;
         try {
            options.highlight = captureH;
            options.unhighlight = captureU;

            origDefaultShowErrors.call(this);
         }
         finally {
            options.highlight = svH;
            options.unhighlight = svUH;
         }

         if (svH || svUH || options.labelErrorClass || options.containerErrorClass) {
            gatherElements(this, elementsFound); 
            if (svH || svUH) {
               hilightInputs(this, elementsFound);
            }
            hilightNearby(this, elementsFound);
         }
      }
      finally {
         jTAC._internal.popContext();
      }

   };


   var origDefaultShowErrors = $.validator.prototype.defaultShowErrors;
   $.validator.prototype.defaultShowErrors = defaultShowErrors;

   /*
   Populates elementsFound with any elements that are not already in the object,
   but are involved in validation. The validation rules here must use
   a Condition to have their elements added. Normally the first connection
   from the Condition is already in elementsFound. Any additional connections
   are collected here.

      validator - the jquery-validator object associated with a form.
      elementsFound - this object will be populated with each id of an element found as the property name
          and an object as the value of the property. That child object has these properties:
            valid (boolean) - the validity state
            element (object) - reference to the element whose state is changed.
   */
   function gatherElements(validator, elementsFound) {
      var rules = validator.settings.rules;

   // look for elements on Conditions that have not been included.
   // The Condition's [connections] list helps find them.
   // Any element not already in elementsFound is added using the validity
   // from the condition's [lastEvaluateResult].
      $.each(rules, function (key, value) {
         if (!key) {
            return;
         }

         $.each(value, function (childkey, paramcont) {
            if (childkey == "messages") {
               return;
            }
            var holder = paramcont.param || paramcont.params || paramcont;
            var cond = holder["Condition"]; // paramcont.params ? paramcont.params["Condition"] : (paramcont.param["Condition"] ? paramcont.param["Condition"] : paramcont["Condition"]);
            if (!cond) {
               return;
            }
            var last = cond.getLastEvaluateResult();
            if ((last == -1) || (last == null)) { // cannot evaluate or has yet to be evaluated can be skipped
               return;
            }

            try {
               var conns = [];
               cond.collectConnections(conns);
               for (var j = 0; j < conns.length; j++) {
                  var conn = conns[j];
                  if (conn instanceof jTAC.Connections.BaseElement) {
                     var el = conn.getElement();
                     if (!el || !el.id)
                        continue;
                     if ((elementsFound[el.id] === undefined) || elementsFound[el.id].valid)  // only change those that are unassigned or are still valid
                        elementsFound[el.id] = {valid: last == 1, element : el};
                  }
               }  // for j

            }
            catch (e) {  // in case there is no conversion
               jTAC.warn("Exception occurred when checking elements for the "
						    + key + "' rule. Exception: " + e.message, null, "jqueryValidate.gatherElements()");
            }
         });   // $.each
      });   // $.each
   }

   /*
   Highlights and unhighlights all elements within the elementsFound object.
   This is designed to account for overlapping validators on a field, where one is valid
   and another is not. It does this by having ALL elements that are validated
   in the elementsFound collection. That collection knows the validity of each element.
   This works together with the defaultShowErrors() function.

   Errors are shown by style sheets in options.inputErrorClass. The element can override
   this value by specifying the new class in its data-jtac-errorclass.

      validator - the jquery-validator object associated with a form.
      elementsFound - Collection already populated with properties hosting
         objects that contain each element and its validity.
   */
   function hilightInputs(validator, elementsFound) {
      var options = validator.settings;

      for (var propName in elementsFound) {
         var r = elementsFound[propName];
         var fnc = r.valid ? options.unhighlight : options.highlight;

         if (fnc) {
            var ec = $(r.element).data("jtac-errorclass");
            if (ec == null) { // ec == "" is used
               ec = options.inputErrorClass;
            }
            var vc = $(r.element).data("jtac-validclass");
            if (vc == null) { // vc == "" is used
               vc = options.inputValidClass;
            }

            fnc.call(validator, r.element, ec, vc);
         }
      }  // for
   }

   /*
   Highlights and unhighlights all elements nearby the elements that were validated.
   It adds the class identified by the options.labelErrorClass to
   label or span elements associated with an invalid input.
   It adds the class identified by the options.containerErrorClass to
   any other element that has an innerHTML, such as div and table cell.
   Alternatively, any element with the data-jtac-errorclass attribute
   defines its own class to add, overriding the option value.
   options.labelErrorClass defaults to "label-validation-error".
   options.containerErrorClass defaults to "container-validation-error".

   HTML label elements automatically include themselves in the list to highlight.
   Any thing else needs the data-jtac-valinputs attribute to specify
   a list of inputs they support or if assigned to the empty string,
   those inputs it contains in its innerHTML.

      validator - the jquery-validator object associated with a form.
      elementsFound - Collection already populated with properties hosting
         objects that contain each element and its validity.
   */
   function hilightNearby(validator, elementsFound) {
      var options = validator.settings;
      if (options.labelErrorClass === undefined) {
         options.labelErrorClass = "label-validation-error";
      }
      if (options.containerErrorClass === undefined) {
         options.containerErrorClass = "container-validation-error";
      }
      if (!options.labelErrorClass && !options.containerErrorClass)
         return;

      if (!options.cssNearby) {
         options.cssNearby = defaultCssNearby;
      }

      var labels = $("Label");
      $.each(labels, function(key, value) {
         var id = value.htmlFor;
         if (id && elementsFound[id] && !value.getAttribute("generated")) {
            options.cssNearby.call(this, value, options.labelErrorClass, elementsFound[id].valid);
         }
      });

      var containers = $("[data-jtac-valinputs]");
      $.each(containers, function (key, value) {
         var ids = $(value).data("jtac-valinputs");
         if (ids == null)
            return;
         if (ids == "") {  
            // search up the HTML tree from each input to this container.
            // If found, apply its style.
            for (var propName in elementsFound) {
               var r = elementsFound[propName];
               var p = r.element.parentNode;
               while (p && (p.tagName != "FORM")) {
                  if (p == value) {   // found it
                     options.cssNearby.call(this, value, options.containerErrorClass, r.valid);
                     break;
                  }
                  p = p.parentNode;
               }  // while
            }  // for
         } 
         else { 
         // a pipe delimited list of ids to inputs that have validators
            ids = ids.split("|");
            for (var i = 0; i < ids.length; i++) {
               var id = ids[i];
               if (id && elementsFound[id]) {
                  options.cssNearby.call(this, value, options.containerErrorClass, elementsFound[id].valid);
               }
            }
         }
      });

   }

   /*
   Default function to update the css of elements nearby
   inputs that have been validated.
   Override by using options.cssNearby = function with the same parameters.
   */
   function defaultCssNearby(elToUpdate, css, isValid) {
      var elToUpdate = $(elToUpdate);
      var local = elToUpdate.data("jtac-errorclass");
      if (local) {
         css = local;
      }
      if (css == null)
         return;

      if (isValid) {
         elToUpdate.removeClass(css);
      }
      else {
         elToUpdate.addClass(css);
      }

   }


/* ---- MAKE PUBLIC MEMBERS ------------------------------------- */

   var publics = {
      createCondition: createCondition,
      evaluate: evaluate,
      validate: validate,
      attachMultiConnections: attachMultiConnections,
      installUnobtrusive: installUnobtrusive,
      mergeOptions : mergeOptions,
      postInit : postInit
   };

//   staticMethods.extend( staticMethods, publics );

   // slightly expose privates mostly for the benefit of unit testing.
   // However, these values are usable elsewhere if needed.
   publics._internal = {
      useConditionAsRule: useConditionAsRule
   };

   return publics;

} () );




ï»¿// jTAC/Connections/BaseJQUIElement.js
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
Module: Connection objects
Class : Connections.BaseJQUIElement    ABSTRACT CLASS
Extends: Connections.BaseElement

Purpose:
A base class for any jquery widget that wants to refer to the "element" object
as a jquery object.

See \jTAC\Connections\Base.js for an overview of Connections.

Properties introduced by this class:
None

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Connections.Base
Connections.BaseElement

----------------------------------------------------------- */
jTAC._internal.temp._Connections_BaseJQUIElement = {
   extend: "Connections.BaseElement",
   "abstract": true,

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   /*
   Retrieves the HTML Element associated with the id.
   Throws exceptions if not found, unless allowNOne is true.
   Also throws exception if the HTML element does not have a value attribute.
   */
   getElement : function () {
      try
      {
         this._pushContext();

         if (this._internal.element != null) {
            return this._internal.element;
         }

         // instead of capturing the HTML element and using that instance each time
         // the value is retrieved with each call. This allows AJAX and other
         // scripts to delete and re-add the element.
         var id = this.getId();
         if (!id)
            this._error("Did not assign the id.");
         var el = $("#" + id);
         if (el) {
            this._checkElement(el);  // may throw an exception
         }
         else if (!el && !this.getAllowNone())
            this._error("HTML Element not found for " + id);
         return el;
      }
      finally {
         this._popContext();
      }

   },

   /*
   Lets you set the jquery object that is returned by getElement.
   Normally you will assign the id and let getElement do the work.
   Use this when you have an instance of the jquery object AND do not expect
   it to be deleted for the life of this Connection.
   This is intended to be a public method.
   The value can be either a jquery object or a DOM element.
   */
   setElement : function (value) {
      if (typeof (value.jquery) != "string") {
         value = $(value);
      }
      this._internal.element = value;

   },

   /*
   Checks the object to confirm its a jquery object.
   */
   _checkElement : function(element) {
      if (typeof(element.jquery) == "string" )
         return true;
      this._error("Element must be a jQuery instance.");
   },

   /* 
   Retrieve the string representation of the value.
   Returns a string.
   If the element is not on the page and allowNone is true,
   it returns null.
   Respects the trim property.
   */
   getTextValue : function () {
      var jq = this.getElement();   // may throw exception
      if (jq) {
         return this._cleanString(jq.val());
      }
      return null;
   },

   /* 
   Set the value passing in a string.
     Text (string) - the value to set.
   */
   setTextValue : function (text) {
      var jq = this.getElement();   // may throw exception
      if (jq) {
         jq.val(text);
      }
   },

   /*
   Attaches a function to an event handler on the element.
      name (string) - Name of the event handler. Strings are case sensitive.
         Typical names: "onchange", "onfocus", "onblur", "onclick", "onkeydown".
         The subclass determines how to use them and may ignore those it doesn't support.
      func (function) - A function that will be called when the event is raised.
         Its parameters should either match those supported by the event, which is usually
         the event object itself, or there should be no parameters.
      funcid (string) - Optional. If you want to only hook up the function
         once to the element, pass a name here. That name will be attached to the element's data.
         Later calls with the same name will not attempt to add the event.
         A good usage is attaching a validation function. That function generally
         handles all validators. So only the first validation rule should attach
         the validation function. When not used, omit the parameter or pass null.
   Returns: When true, the event was attached. When false it was not supported.
   */
   addEventListener : function (name, func, funcid) {
      var js = this.getElement();   // may throw exception
      if (js) {
         // is the function already attached?
         if (funcid) {
            var da = "data-jqueryconnection-" + funcid;
            if (js.data(da) != null) {
               return true;   // already attached
            }
            js.data(da, true);
         }

         js.bind(name.substr(2), func);
      }
      return false;
   },

/*
Attempts to get a value associated with the data collection of the element.
   key (string) - The value key in the data collection.
Returns the value or null if not available.
This class handles DOM using getAttribute("data-" + key).
*/
   getData : function (key) {
      var el = this.getElement(true);
      if (el) {
         return el.data(key);
      }
      return null;
   },


/*
Assigns or replaces the value into the data collection of the element.
   key (string) - The value key in the data collection.
   value - The data to store with the key.
*/
   setData : function (key, value) {
      var el = this.getElement(true);
      if (el) {
         el.data(key, value);
      }
   },


   /*
   Determines if the element is visible.
   Returns true if visible.
   This class looks at the display and visibility styles on the actual HTML element
   and up the DOM tree until it finds one invisible or nothing being invisible.
   Subclasses may have widgets with multiple HTML parts, some of which 
   may be visible and others hidden. Its up to those subclasses to determine
   what "visible" means.
   */
   isVisible : function () {
      var js = this.getElement(true);
      if (!js) {
         return true;
      }
   
      return this._isDOMVisible(js.get(0));
   },

   /*
   Determines if the element is enabled.
   Returns true if enabled.
   This class looks at the disabled attribute of the element. If no attribute
   exists, it returns true.

   Subclasses may have widgets with multiple HTML parts, some of which 
   may be enabled and others disabled. Its up to those subclasses to determine
   what "enabled" means.
   */
   isEnabled : function () {
      var js = this.getElement(true);
      if (!js) {
         return true;
      }
      return this._isDOMEnabled(js.get(0));
   },

   /* 
   Locates a string that can be displayed as the label for the element.
   */
   getLabel : function () {
      var el = this.getElement(true);
      if (el) {
         el = el.get(0);
      }
      return this._locateLabel(el, this.getDefaultLabel());
   },

/*
Returns the current style sheet class name associated with the element
or "" if none.
This class returns the value of the class property on the HTML element.
*/
   getClass : function() {
      var el = this.getElement();
      if (el) {
         return el.css();
      }
      return "";
   },

/*
Sets the current style sheet class name. If the widget has multiple
classes for its various parts, this impacts the part most closely associated
with the data entry, such as the input tag.
*/
   setClass : function(css) {
      var el = this.getElement();
      if (el) {
         el.css(css);
      }
   },

/*
Appends the class name provided to the existing one. 
Effectively it creates the pattern "[old class] [new class]".
   css (string) - The class name to append.
Returns true unless the class already appears. If so, no changes
are made and it returns false.
*/
   addClass : function(css) {
      var el = this.getElement();
      if (el) {
         el.addClass(css);
      }
   },

/*
Removes the style sheet class from the element's current class.
*/
   removeClass : function(css) {
      var el = this.getElement();
      if (el) {
         el.removeClass(css);
      }
   }
   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("Connections.BaseJQUIElement", jTAC._internal.temp._Connections_BaseJQUIElement);

ï»¿// jTAC/Connections/JQUIDatePicker.js
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
Module: Connection objects
Class : Connections.JQUIDatePicker
Extends: Connections.BaseJQUIElement

Purpose:
Supports the jquery-ui datepicker widget.
The id is an HTML input field that has been attached to a datePicker object.
The element object is the jquery-UI object.

See \jTAC\Connections\Base.js for an overview of Connections.

Properties introduced by this class:

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Connections.Base

----------------------------------------------------------- */
jTAC._internal.temp._Connections_JQUIDatePicker = {
   extend: "Connections.BaseJQUIElement",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   /*
   Supports "date"
   */
   typeSupported : function (typeName) {
      return typeName == "date";
   },

   /*
   Supports several input types, including HTML 5 types that return
   Date objects and numbers. See typeSupported() method for more.
      typeName (string) - If null, always get the default type supported.
         Otherwise, it must be a value from the list supported
         by this control as shown in the typeSupported() method description.
   Returns: the typed value.
   Throws exception if the HTML element does not support the requested type.
   Call typeSupported() prior to this to ensure it will return a value
   instead of throwing an exception.
   */
   getTypedValue : function (typeName) {
      var js = this.getElement();   // may throw exception
      if (js) {
         if (typeName && (typeName != "date"))
            this._error("The jquery element " + this.getId() + " does not support the type " + typeName, "getTypedValue");
   //      return js.datepicker("getDate"); // http://docs.jquery.com/UI/Datepicker#method-getDate

   /* While it would be better to use js.datepicker("getDate"),
   that method never looks at the text in the textbox. It gets the value
   from the calendar object.
   So the textbox can contain something different, and something illegal
   while the calendar does not.
   Since we must valid the textbox because it is actually passed to the server,
   this code ensures getting the actual date object based on the textbox.
   It is modeled after code in datepicker._setDateFromField().
   */
         var dp = $.datepicker;
		   var inst = dp._getInst(js[0]);
		   var dateFormat = dp._get(inst, 'dateFormat');
		   var dates = js.val();
		   var settings = dp._getFormatConfig(inst);
		   try  {
			   return dp.parseDate(dateFormat, dates, settings);
		   } 
         catch (event)  {
			   dp.log(event);
            throw event;   // indicate the error to the caller
		   }

      }
      return null;
   },

   /*
   Supports several input types, including HTML 5 types that return
   Date objects and numbers. See typeSupported() method for more.
   Unsupported cases throw an exception.
   */
   setTypedValue : function (value) {
      var js = this.getElement();   // may throw exception
      if (js) {

         if (value instanceof Date)
         {
            js.datepicker("setDate", value);  // http://docs.jquery.com/UI/Datepicker#method-setDate
         }
         else
            this._error("The HTML element " + this.getId() + " does not support the type of the value", "setTypedValue");
      }
   },

   /*
   HTML form elements are null when their value attribute is "".
   Respects the trim property.
      override (boolean) - Ignored here.
   */
   isNullValue : function (override) {
      return this.getTextValue() == "";
   },

   /*
   Checks the HTML element to confirm that it is supported.
   If not, it should throw an exception.
   */
   _checkElement : function(element) {
      this.callParent([element]);
      if (!this.testElement(element))
         this._error("Element must have a datepicker object.");
   },

   /*
   Determines if the id or object passed is supported by this class.
   Returns true if it is.
   Subclasses should implement this as this class always returns false.
   Your implementation can support ids and objects that are not 
   associated with DOM elements. For example, you have a jquery-ui
   class that manages how a textbox works.
      id (string or object) - If its string, evaluate it as a unique id
         used to identify the element. If its an object, see if its
         the correct class, such as DOMElement.
   Returns true when id is supported by this class and false when not.
   */
   testElement : function (id) {
      if (window.$ && $.datepicker) {
         var el = (typeof id == "string") ? document.getElementById(id) : id;
         if (el) {
            if (el.jquery)
               el = el[0];

            return $.data(el, "datepicker") != null;
         }
      }
      return false;
   },

   /*
   Returns TypeManagers.Date. Supports these data attributes on the element:
   data-jtac-typemanager, data-jtac-datatype. See Connections.BaseElement.getTypeManager for details.
   */
   _createTypeManager : function (el) {
      if (!jTAC.isDefined("TypeManagers.Base"))
         this._error("Must load TypeManager scripts.");

      var tm = this.callParent();
      if (!tm)
         return jTAC.create(this._defaultTypeManager);
      return tm;
   },

/*
Specifies the class name or alias to a TypeManager that is created by 
_createTypeManager when data-jtac-datatype is not used.
*/
   _defaultTypeManager : "TypeManagers.Date"

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("Connections.JQUIDatePicker", jTAC._internal.temp._Connections_JQUIDatePicker);

jTAC.connectionResolver.register("Connections.JQUIDatePicker");
