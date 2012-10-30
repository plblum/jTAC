// jTAC/Translations/es.js
/* -----------------------------------------------------------
This file is meant to be edited. It hosts the SPANISH version 
of the strings shown to the user.

WARNING: Translations were created from English to Spanish using Google Translate.
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

   datatypecheckEM: "<span class='{ERRORLABEL}'>{LABEL}</span> debe ser una {DATATYPE} válida.",

   advrangeEM: "<span class='{ERRORLABEL}'>{LABEL}</span> debe estar entre {MINIMUM} y {MAXIMUM}.",

   comparetovalueEM : "<span class='{ERRORLABEL}'>{LABEL}</span> debe ser {OPERATOR} {VALUETOCOMPARE}.",
   
   comparetwoelementsEM : "<span class='{ERRORLABEL}'>{LABEL}</span> debe ser {OPERATOR} <span class={ERRORLABEL}>{LABEL2}</span>.",
   
   differenceEM : "Diferencia entre <span class='{ERRORLABEL}'>{LABEL}</span> y <span class={ERRORLABEL}>{LABEL2}</span> debe ser {OPERATOR} {DIFFVALUE}.",

   advrequiredEM : "<span class='{ERRORLABEL}'>{LABEL}</span> requiere una entrada.",

   requiredindexEM : "<span class='{ERRORLABEL}'>{LABEL}</span> requiere una selección.",

   selectedindexEM : "<span class='{ERRORLABEL}'>{LABEL}</span> tiene una selección válida. Elige otro.",

   charactercountEM : "<span class='{ERRORLABEL}'>{LABEL}</span> debe tener entre {MINIMUM} y {MAXIMUM} caracteres.",

   wordcountEM : "<span class='{ERRORLABEL}'>{LABEL}</span> debe tener entre {MINIMUM} y {MAXIMUM} palabras.",

   countselectionsEM : "<span class='{ERRORLABEL}'>{LABEL}</span> debe tener entre {MINIMUM} y {MAXIMUM} selecciones.",

   regexpEM : "<span class='{ERRORLABEL}'>{LABEL}</span> debe ser un {PATTERN} válido.",

   duplicateentryEM: "<span class='{ERRORLABEL}'>{LABEL1}</span> debe ser diferente de <span class='{ERRORLABEL}'>{LABEL2}</span>.",

   // Usually you create a new key with error message and assign that key to the Condition's lookupKey property
   // for jTAC.Conditions.BooleanLogic
   booleanlogicEM: "*** EXPLICITY ASSIGN THIS MESSAGE ***.",

   /* ----- TYPEMANAGER FRIENDLYNAMES ------------------ */
   // Used by \jTAC\TypeManagers to supply the friendlyName with a default value.
   // Override the TypeManager's friendlyLookupKey to change the key used to lookup a value.
   date: "feche",
   datetime: "fecha y la hora",
   daymonth: "día y mes",
   duration : "duración",
   monthyear : "meses y años",
   timeofday : "tiempo de día",
   currency: "moneda",
   "float": "número decimal",
   integer: "entero",
   percent: "por ciento",
   "boolean": "valor verdadero o falso",
   "string" : "texto",
   emailaddress: "dirección de email",
   phonenumber: "número de teléfono",
   postalcode: "código postal",
   creditcardnumber: "número de la tarjeta",
   url: "URL",

   /* ---- OPERATOR NAMES -------- */
   // Used by any condition where there is an {OPERATOR} token in the error message
   "=" : "igual a",
   "<>" : "no igual a",
   "<" : "menos que",
   ">" : "más que",
   "<=": "inferior o igual a",
   ">=": "superior o igual a"
};

jTAC.translations.register("es", jTAC_CultureES);
