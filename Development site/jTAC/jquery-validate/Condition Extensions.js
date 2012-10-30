// jTAC/jquery-validate/Condition Extensions.js
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
