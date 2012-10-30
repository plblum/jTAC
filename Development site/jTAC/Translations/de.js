// jTAC/Translations/es.js
/* -----------------------------------------------------------
This file is meant to be edited. It hosts the GERMAN version 
of the strings shown to the user.

WARNING: Translations were created from English to German using Google Translate.
It is up to you to confirm their correctness.

The object below defines property names that are used by
jTAC code to retrieve the string assigned to that property.
Preserve the property names. Edit their values.
------------------------------------------------------------- */
var jTAC_CultureES =
{
   /* ---- VALIDATION ERROR MESSAGES --------- */
   // Used by the \jTAC\jquery validation\Rules.js file
   // Each key for an error message must be the jquery-validate rule name + "EM".
   // Use the lookupKey property on the Condition to specify an alternative key to its default.

   datatypecheckEM: "<span class='{ERRORLABEL}'>{LABEL}</span> muss eine gültige {DATATYPE}.",

   advrangeEM: "<span class='{ERRORLABEL}'>{LABEL}</span> muss zwischen {MINIMUM} und {MAXIMUM}.",

   comparetovalueEM : "<span class='{ERRORLABEL}'>{LABEL}</span> muss {OPERATOR} {VALUETOCOMPARE}.",
   
   comparetwoelementsEM : "<span class='{ERRORLABEL}'>{LABEL}</span> muss {OPERATOR} <span class={ERRORLABEL}>{LABEL2}</span>.",
   
   differenceEM : "Differenz zwischen <span class='{ERRORLABEL}'>{LABEL}</span> und <span class={ERRORLABEL}>{LABEL2}</span> muss {OPERATOR} {DIFFVALUE}.",

   advrequiredEM : "<span class='{ERRORLABEL}'>{LABEL}</span> erfordert einen Eintrag.",

   requiredindexEM : "<span class='{ERRORLABEL}'>{LABEL}</span> erfordert eine Auswahl.",

   selectedindexEM : "<span class='{ERRORLABEL}'>{LABEL}</span> hat eine ungültige Auswahl. Wähl ein anderes.",

   charactercountEM : "<span class='{ERRORLABEL}'>{LABEL}</span> muss zwischen {MINIMUM} und {maximum} Zeichen haben.",

   wordcountEM : "<span class='{ERRORLABEL}'>{LABEL}</span> muss zwischen {MINIMUM} und {maximum} Worten.",

   countselectionsEM : "<span class='{ERRORLABEL}'>{LABEL}</span> must have between {MINIMUM} and {MAXIMUM} auswahlen.",

   regexpEM : "<span class='{ERRORLABEL}'>{LABEL}</span> muss eine gültige {PATTERN} sein.",

   duplicateentryEM: "<span class='{ERRORLABEL}'>{LABEL1}</span> muss sich von <span class='{ERRORLABEL}'>{LABEL2}</span>.",

   // Usually you create a new key with error message and assign that key to the Condition's lookupKey property
   // for jTAC.Conditions.BooleanLogic
   booleanlogicEM: "*** EXPLICITY ASSIGN THIS MESSAGE ***.",

   /* ----- TYPEMANAGER FRIENDLYNAMES ------------------ */
   // Used by \jTAC\TypeManagers to supply the friendlyName with a default value.
   // Override the TypeManager's friendlyLookupKey to change the key used to lookup a value.
   date: "datum",
   datetime: "datum und uhrzeit",
   monthyear : "monat und jahr",
   daymonth: "tag und monat",
   duration : "dauer",
   timeofday : "uhrzeit",
   currency: "währung",
   "float": "dezimalzahl",
   integer: "ganze Zahl",
   percent: "prozent",
   "boolean": "wahren oder falschen wert",
   "string" : "text",
   emailaddress: "E-Mail-Adresse",
   phonenumber: "telefonnummer",
   postalcode: "postleitzahl",
   creditcardnumber: "Kartennummer",
   url: "URL",

   /* ---- OPERATOR NAMES -------- */
   // Used by any condition where there is an {OPERATOR} token in the error message
   "=" : "gleich",
   "<>": "ungleich",
   "<" : "weniger als",
   ">" : "größer als",
   "<=": "weniger als oder gleich",
   ">=": "größer oder gleich"

};

jTAC.translations.register("es", jTAC_CultureES);
