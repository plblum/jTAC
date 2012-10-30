/* ----------------------------------------
This file is a template that is used to start
creating a new culture file. It reflects
the same culture data as jTAC defaults to, which is the en-US
(United States) culture. Copy the content below into
a new javascript file in the \Cultures folder and
modify it as needed.
---------------------------------------- */

/* -----------------------------------------------------------
This file hosts culture specific rules for [Country] in [language]([culture code]).
Load it if you are using this culture and have NOT loaded another 
culture engine, like jquery-globalize.
------------------------------------------------------------- */
jTAC_Temp =
{
   numNegPattern: "-n", 
   numDecimals: 2,      
   numGroupSep: ",",    
   numDecimalSep: ".",  
   numGroupSizes: [3],  
   numNegSymbol: "-",   
   curNegPattern: "$(n)", 
   curPosPattern: "$n",  
   curSymbol: "$",      
   curDecimals: 2, 
   curGroupSep: ",", 
   curDecimalSep: ".", 
   curGroupSizes: [3], 
   curNegSymbol: "-",
   pctNegPattern: "-%n",  
   pctPosPattern: "%n", 
   pctSymbol: "%",      
   pctDecimals: 2, 
   pctGroupSep: ",",  
   pctDecimalSep: ".",  
   pctGroupSizes: [3],  
   pctNegSymbol: "-", 
   dtShortDateSep: "/", 
   dtTimeSep: ":",
   dtFirstDay: 0, 
   dtDays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
   dtDaysAbbr: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], 
   dtDaysShort: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"], 
   dtMonths: [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December", "" ],
   dtMonthsAbbr: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", ""],
   dtAM: "AM",
   dtPM: "PM",
   dtTwoDigitYearMax : 2029, 
   dtShortDatePattern: "M/d/yyyy",  
   dtShortDatePatternMN: "MMM/d/yyyy", 
   dtAbbrDatePattern : "MMM dd, yyyy", 
   dtLongDatePattern : "MMMM dd, yyyy",
   dtShortTimePattern: "h:mm tt",  
   dtLongTimePattern : "h:mm:ss tt", 
   dtShortDurationPattern: "h:mm",  
   dtLongDurationPattern: "h:mm:ss", 
   dtShortDateShortTimePattern: "M/d/yyyy h:mm tt",  
   dtShortDateLongTimePattern: "M/d/yyyy h:mm:ss tt",  
   dtAbbrDateShortTimePattern: "MMM dd, yyyy h:mm tt",  
   dtAbbrDateLongTimePattern : "MMM dd, yyyy h:mm:ss tt", 
   dtLongDateShortTimePattern: "MMMM dd, yyyy h:mm tt",  
   dtLongDateLongTimePattern : "MMMM dd, yyyy h:mm:ss tt",
   dtShortMonthDayPattern: "M/dd",   
   dtShortMonthDayPatternMN: "MMM/dd",
   dtAbbrMonthDayPattern : "MMM dd",  
   dtLongMonthDayPattern: "MMMM dd",  
   dtShortMonthDayPattern: "M/yyyy", 
   dtShortMonthDayPattern: "MMM/yyyy",
   dtAbbrMonthYearPattern: "MMM yyyy",
   dtLongMonthYearPattern: "MMMM yyyy"
}

jTAC.cultureInfo = jTAC.create("TypeManagers.CultureInfo", jTAC_Temp);
