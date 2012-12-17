// jTAC/Translations/Culture Neutral.js
/* -----------------------------------------------------------
This file is meant to be edited. It hosts the culture neutral
(default) string values shown throughout jTAC to the user.

The object below defines property names that are used by
jTAC code to retrieve the string assigned to that property.
Preserve the property names. Edit their values.

If you want to provide localized version of these strings,
create another script file in the /Translations folder with the
culture name as the file name (for easy reference).
Then copy this code, rename "jTAC_CultureNeutral" to something else
and edit the values it contains to that language.
Finally, edit the call to jTAC.translations.register() so the first
parameter identifies the culture name of these strings.
------------------------------------------------------------- */
var jTAC_CultureNeutral =
{
   /* ---- VALIDATION ERROR MESSAGES --------- */
   // Used by the \jTAC\jquery validation\Rules.js file
   // Each key for an error message must be the jquery-validate rule name + "EM".
   // Use the lookupKey property on the Condition to specify an alternative key to its default.

   datatypecheckEM: "<span class='{ERRORLABEL}'>{LABEL}</span> must be a valid {DATATYPE}.",

   advrangeEM: "<span class='{ERRORLABEL}'>{LABEL}</span> must be between {MINIMUM} and {MAXIMUM}.",

   comparetovalueEM : "<span class='{ERRORLABEL}'>{LABEL}</span> must be {OPERATOR} {VALUETOCOMPARE}.",
   
   comparetwoelementsEM : "<span class='{ERRORLABEL}'>{LABEL}</span> must be {OPERATOR} <span class={ERRORLABEL}>{LABEL2}</span>.",
   
   differenceEM : "Difference between <span class='{ERRORLABEL}'>{LABEL}</span> and <span class={ERRORLABEL}>{LABEL2}</span> must be {OPERATOR} {DIFFVALUE}.",

   advrequiredEM : "<span class='{ERRORLABEL}'>{LABEL}</span> requires an entry.",

   requiredindexEM : "<span class='{ERRORLABEL}'>{LABEL}</span> requires a selection.",

   selectedindexEM : "<span class='{ERRORLABEL}'>{LABEL}</span> has an invalid selection. Choose another.",

   charactercountEM : "<span class='{ERRORLABEL}'>{LABEL}</span> must have between {MINIMUM} and {MAXIMUM} characters.",

   wordcountEM : "<span class='{ERRORLABEL}'>{LABEL}</span> must have between {MINIMUM} and {MAXIMUM} words.",

   countselectionsEM : "<span class='{ERRORLABEL}'>{LABEL}</span> must have between {MINIMUM} and {MAXIMUM} selections.",

   regexpEM : "<span class='{ERRORLABEL}'>{LABEL}</span> must be a valid {PATTERN}.",

   duplicateentryEM: "<span class='{ERRORLABEL}'>{LABEL1}</span> must be different from <span class='{ERRORLABEL}'>{LABEL2}</span>.",

   // Usually you create a new key with error message and assign that key to the Condition's lookupKey property
   // for jTAC.Conditions.BooleanLogic
   booleanlogicEM: "*** EXPLICITY ASSIGN THIS MESSAGE ***.",

   /* ----- TYPEMANAGER FRIENDLYNAMES ------------------ */
   // Used by \jTAC\TypeManagers to supply the friendlyName with a default value.
   // Override the TypeManager's friendlyLookupKey to change the key used to lookup a value.
   date: "date",
   datetime: "date and time",
   daymonth: "day and month",
   duration : "duration",
   monthyear : "month and year",
   timeofday : "time of day",
   currency: "monetary value",
   "float": "decimal number",
   integer: "integer",
   percent: "percent",
   "boolean": "true or false value",
   "string" : "text value",
   emailaddress: "email address",
   phonenumber: "phone number",
   postalcode: "postal code",
   creditcardnumber: "card number",
   url: "URL",


   /* ---- OPERATOR NAMES -------- */
   // Used by any condition where there is an {OPERATOR} token in the error message
   "=" : "equal to",
   "<>": "not equal to",
   "<" : "less than",
   ">" : "greater than",
   "<=": "less than or equal to",
   ">=": "greater than or equal to"

};

jTAC.translations.register("", jTAC_CultureNeutral);
