// jTAC/Translations/fr.js
/* -----------------------------------------------------------
This file is meant to be edited. It hosts the FRENCH version 
of the strings shown to the user.

WARNING: Translations were created from English to French using Google Translate.
It is up to you to confirm their correctness.

The object below defines property names that are used by
jTAC code to retrieve the string assigned to that property.
Preserve the property names. Edit their values.
------------------------------------------------------------- */
var jTAC_CultureFR =
{
   /* ---- VALIDATION ERROR MESSAGES --------- */
   // Used by the \jTAC\jquery validation\Rules.js file
   // Each key for an error message must be the jquery-validate rule name + "EM".
   // Use the lookupKey property on the Condition to specify an alternative key to its default.

   datatypecheckEM: "<span class='{ERRORLABEL}'>{LABEL}</span> doit être un {DATATYPE} valide.",

   advrangeEM: "<span class='{ERRORLABEL}'>{LABEL}</span> doit être comprise entre {MINIMUM} et {MAXIMUM}.",

   comparetovalueEM : "<span class='{ERRORLABEL}'>{LABEL}</span> doit être {OPERATOR} {VALUETOCOMPARE}.",
   
   comparetwoelementsEM : "<span class='{ERRORLABEL}'>{LABEL}</span> doit être {OPERATOR} <span class={ERRORLABEL}>{LABEL2}</span>.",
   
   differenceEM : "Différence entre <span class='{ERRORLABEL}'>{LABEL}</span> et <span class={ERRORLABEL}>{LABEL2}</span> doit être {OPERATOR} {DIFFVALUE}.",

   advrequiredEM : "<span class='{ERRORLABEL}'>{LABEL}</span> nécessite une entrée.",

   requiredindexEM : "<span class='{ERRORLABEL}'>{LABEL}</span> nécessite une sélection.",

   selectedindexEM : "<span class='{ERRORLABEL}'>{LABEL}</span> présente une sélection valide. choisir une autre.",

   charactercountEM : "<span class='{ERRORLABEL}'>{LABEL}</span> doit avoir entre {MINIMUM} et {MAXIMUM} caractères.",

   wordcountEM : "<span class='{ERRORLABEL}'>{LABEL}</span> doit avoir entre {MINIMUM} et {MAXIMUM} mots.",

   countselectionsEM : "<span class='{ERRORLABEL}'>{LABEL}</span> doit avoir entre {MINIMUM} et {MAXIMUM} sélections.",

   regexpEM : "<span class='{ERRORLABEL}'>{LABEL}</span> doit être un {PATTERN} valide.",

   duplicateentryEM: "<span class='{ERRORLABEL}'>{LABEL1}</span> doit être différent de <span class='{ERRORLABEL}'>{LABEL2}</span>.",

   // Usually you create a new key with error message and assign that key to the Condition's lookupKey property
   // for jTAC.Conditions.BooleanLogic
   booleanlogicEM: "*** EXPLICITY ASSIGN THIS MESSAGE ***.",

   /* ----- TYPEMANAGER FRIENDLYNAMES ------------------ */
   // Used by \jTAC\TypeManagers to supply the friendlyName with a default value.
   // Override the TypeManager's friendlyLookupKey to change the key used to lookup a value.
   date: "date",
   datetime: "date et l'heure",
   daymonth: "jour et le mois",
   duration : "durée",
   monthyear : "mois et l'année",
   timeofday : "heure du jour",
   currency: "monnaie",
   "float": "nombre décimal",
   integer: "entier",
   percent: "pour cent",
   "boolean": "valeur vraie ou fausse",
   "string" : "texte",
   emailaddress: "adresse e-mail",
   phonenumber: "numéro de téléphone",
   postalcode: "code postal",
   creditcardnumber: "numéro de la carte",
   url: "URL",

   /* ---- OPERATOR NAMES -------- */
   // Used by any condition where there is an {OPERATOR} token in the error message
   "=" : "égal à",
   "<>": "pas égal à",
   "<" : "moins que",
   ">" : "supérieure à",
   "<=": "inférieur ou égal à",
   ">=": "supérieur ou égal à"

};

jTAC.translations.register("fr", jTAC_CultureFR);
