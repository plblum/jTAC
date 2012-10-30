// jTAC/Translations/es.js
/* -----------------------------------------------------------
This file is meant to be edited. It hosts the ITALIAN version 
of the strings shown to the user.

WARNING: Translations were created from English to Italian using Google Translate.
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

   datatypecheckEM: "<span class='{ERRORLABEL}'>{LABEL}</span> deve essere un {DATATYPE} valido.",

   advrangeEM: "<span class='{ERRORLABEL}'>{LABEL}</span> deve essere compreso tra {MINIMUM} e {MAXIMUM}.",

   comparetovalueEM : "<span class='{ERRORLABEL}'>{LABEL}</span> deve essere {OPERATOR} {VALUETOCOMPARE}.",
   
   comparetwoelementsEM : "<span class='{ERRORLABEL}'>{LABEL}</span> deve essere {OPERATOR} <span class={ERRORLABEL}>{LABEL2}</span>.",
   
   differenceEM : "Differenza tra <span class='{ERRORLABEL}'>{LABEL}</span> e <span class={ERRORLABEL}>{LABEL2}</span> deve essere {OPERATOR} {DIFFVALUE}.",

   advrequiredEM : "<span class='{ERRORLABEL}'>{LABEL}</span> richiede una annotazione.",

   requiredindexEM : "<span class='{ERRORLABEL}'>{LABEL}</span> richiede una selezione.",

   selectedindexEM : "<span class='{ERRORLABEL}'>{LABEL}</span> ha una selezione valida. Scegliere un altro.",

   charactercountEM : "<span class='{ERRORLABEL}'>{LABEL}</span> devono avere tra {MINIMUM} e {MAXIMUM} caratteri.",

   wordcountEM : "<span class='{ERRORLABEL}'>{LABEL}</span> devono avere tra {MINIMUM} e {MAXIMUM} parole.",

   countselectionsEM : "<span class='{ERRORLABEL}'>{LABEL}</span> devono avere tra {MINIMUM} e {MAXIMUM} selezioni.",

   regexpEM : "<span class='{ERRORLABEL}'>{LABEL}</span> deve essere un {PATTERN} valido.",

   duplicateentryEM: "<span class='{ERRORLABEL}'>{LABEL1}</span> deve essere diverso da <span class='{ERRORLABEL}'>{LABEL2}</span>.",

   // Usually you create a new key with error message and assign that key to the Condition's lookupKey property
   // for jTAC.Conditions.BooleanLogic
   booleanlogicEM: "*** EXPLICITY ASSIGN THIS MESSAGE ***.",

   /* ----- TYPEMANAGER FRIENDLYNAMES ------------------ */
   // Used by \jTAC\TypeManagers to supply the friendlyName with a default value.
   // Override the TypeManager's friendlyLookupKey to change the key used to lookup a value.
   date: "data",
   datetime: "data e ora",
   daymonth: "giorno e mese",
   duration : "durata",
   monthyear : "mese e anno",
   timeofday : "ora del giorno",
   currency: "valuta",
   "float": "numero decimale",
   integer: "numero intero",
   percent: "per cento",
   "boolean": "valore vero o falso",
   "string" : "testo",
   emailaddress: "indirizzo e-mail",
   phonenumber: "numero di telefono",
   postalcode: "codice postale",
   creditcardnumber: "Numero carta",
   url: "URL",

   /* ---- OPERATOR NAMES -------- */
   // Used by any condition where there is an {OPERATOR} token in the error message
   "=" : "pari a",
   "<>": "non uguale a",
   "<" : "meno",
   ">" : "maggiore",
   "<=": "minore o uguale a",
   ">=": "maggiore o uguale a"

};

jTAC.translations.register("es", jTAC_CultureES);
