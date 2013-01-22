function ToValueMain(instance, text, compareval)
{
   var vResult = null;
   try
   {
      vResult = instance.toValue(text);
   }
   catch (e)
   {
      fail(e.message);
   }
   if (compareval != null)
      assertNotNull(vResult);
   assertEquals(typeof (vResult), instance.nativeTypeName());
   assertEquals("The text [" + text + "] does not convert correctly.", compareval, vResult);
}


function ToIllegalValueMain(instance, text)
{
   try
   {
      var vResult = instance.toValue(text);
   }
   catch (e)
   {
      // should always get here
      return;
   }
   fail("Converted [" + text + "].");
}

function ToValueNeutralMain(instance, text, compareval) {
   var vResult = null;
   try {
      vResult = instance.toValueNeutral(text);
   }
   catch (e) {
      fail(e.message);
   }
   if (compareval != null)
      assertNotNull(vResult);
   assertEquals(typeof (vResult), instance.nativeTypeName());
   assertEquals("The text [" + text + "] does not convert correctly.", compareval, vResult);
}


function ToIllegalValueNeutralMain(instance, text)
{
   try
   {
      var vResult = instance.toValueNeutral(text);
   }
   catch (e)
   {
      // should always get here
      return;
   }
   fail("Converted [" + text + "].");
}


function ToStringMain(instance, val, comparestr)
{
   var vResult = null;
   try
   {
      vResult = instance.toString(val);
   }
   catch (e)
   {
      fail(e.message);
   }
   assertNotNull("Conversion to " + comparestr + " failed", vResult);
   assertTrue(typeof (vResult) == "string");
   assertEquals("val did not convert to " + comparestr, comparestr, vResult);
}

function ToIllegalStringMain(instance, val)
{
   try
   {
      var vResult = instance.toString(val);
   }
   catch (e)
   {
      // should always get here
      return;
   }
   fail("Converted [" + val.toString() + "].");
}

function CompareMain(instance, val1, val2, result)
{
   var vR = null;
   try
   {
      vR = instance.compare(val1, val2);
   }
   catch (e)
   {
      fail(e.message);
   }
   assertEquals(vR, result);
}

function DatePatternCheck(instance, dateFormat, compareToPat)
{
   setPropertyValue(instance, "dateFormat", dateFormat);
   var pat = instance._datePattern();
   assertEquals("dateFormat=" + dateFormat, pat, compareToPat);
}

function TimePatternCheck(instance, timeFormat, compareToPat)
{
   setPropertyValue(instance, "timeFormat", timeFormat);
   var pat = instance._timePattern();
   assertEquals("timeFormat=" + timeFormat, pat, compareToPat);
}


/* For date patterns. Applies the d M y and dow from the date object
to the elements of the pattern
   instance (TypeManagers.BaseCulture subclass)
   pat (string) - Date pattern
   date (Javascript Date object)
 */
function UpdatePatternWithDate(instance, pat, date)
{
   function replaceWithDigits(letter, val, text)
   {
      var s = val.toString();

      var re = new RegExp("(?:[^A-Za-z]|^)(" + letter + "{1,2})(?:[^A-Za-z]|$)");
      var m = re.exec(text);
      if (m)
      {
         if ((m.length == 2) && (s.length < 2))
            s = "0" + s;
         text = text.replace(m[1], s);
         
      }
      return text;
   }
   pat = pat.replace("MMMM", "{0}");
   pat = pat.replace("MMM", "{1}");
/* dow not used
   pat = pat.replace("dddd", "{2}");
   pat = pat.replace("ddd", "{3}");
*/
   pat = pat.replace("yyyy", date.getFullYear());

   pat = replaceWithDigits("y", date.getYear(), pat);
   pat = replaceWithDigits("M", date.getMonth() + 1, pat);
   pat = replaceWithDigits("d", date.getDate(), pat);

   pat = pat.replace("{0}", instance.dateTimeFormat("Months")[date.getMonth()]);
   pat = pat.replace("{1}", instance.dateTimeFormat("MonthsAbbr")[date.getMonth()]);
   pat = pat.replace("{2}", instance.dateTimeFormat("Days")[date.getDay()]);
   pat = pat.replace("{3}", instance.dateTimeFormat("DaysAbbr")[date.getDay()]);
   return pat;
}

function ToValueForDates(instance, text, compareval)
{
   var vResult = null;
   try
   {
      vResult = instance.toValue(text);
   }
   catch (e)
   {
      fail(e.message + " Original text: " + text);
   }
   assertNotNull(vResult);
   assertEquals(typeof (vResult),  instance.nativeTypeName());
   assertTrue("The text [" + text + "] does not convert correctly.", compareval.valueOf() == vResult.valueOf());
}

function ToValueForTimes(instance, text, hr, min, sec)
{
   var vResult = null;
   try
   {
      vResult = instance.toValue(text);
   }
   catch (e)
   {
      fail(e.message + " Original text: " + text);
   }
   assertNotNull(vResult);
   assertEquals(typeof (vResult),  instance.nativeTypeName());
   assertTrue("The text [" + text + "] does not convert correctly.", 
      hr == vResult.getHours() && min == vResult.getMinutes() && sec == vResult.getSeconds());
}

function ToValueNeutralForDates(instance, text, compareval)
{
   var vResult = null;
   try
   {
      vResult = instance.toValueNeutral(text);
   }
   catch (e)
   {
      fail(e.message + " Original text: " + text);
   }
   assertNotNull(vResult);
   assertEquals(typeof (vResult),  instance.nativeTypeName());
   assertTrue("The text [" + text + "] does not convert correctly.", compareval.valueOf() == vResult.valueOf());
}

function ToValueNeutralForTimes(instance, text, hr, min, sec)
{
   var vResult = null;
   try
   {
      vResult = instance.toValueNeutral(text);
   }
   catch (e)
   {
      fail(e.message + " Original text: " + text);
   }
   assertNotNull(vResult);
   assertEquals(typeof (vResult),  instance.nativeTypeName());
   assertTrue("The text [" + text + "] does not convert correctly.", 
      hr == vResult.getHours() && min == vResult.getMinutes() && sec == vResult.getSeconds());
}

/* For time patterns. Applies the H, h, m s tt from the date object
to the elements of the pattern. If pattern has no "ss", the date object
will be modified with seconds = 0. */
function UpdatePatternWithTime(instance, pat, date)
{
   function replaceWithDigits(letter, val, text)
   {
      var s = val.toString();
      var two = letter + letter;
      if (text.indexOf(two) > -1) // requires two digits
      {
         if (s.length < 2)
            s = "0" + s;
         text = text.replace(two, s);
      }
      else
         text = text.replace(letter, s);
      return text;
   }
   var h = date.getHours();
   var ham = h % 12; // "hours am"
   if (ham == 0)
      ham = 12;
   pat = replaceWithDigits("h", ham, pat);
   pat = replaceWithDigits("H", h, pat);
   pat = replaceWithDigits("m", date.getMinutes(), pat);
   if (pat.indexOf("s") > -1)
      pat = replaceWithDigits("s", date.getSeconds(), pat);
   else
      date.setSeconds(0);

   var am = instance.dateTimeFormat("AM");
   var pm = instance.dateTimeFormat("PM");
   if (am)
      pat = pat.replace("tt", (h < 12) ? am : pm);
   return pat;
}

/* For date + time patterns. */
function UpdatePatternWithDateTime(instance, pat, date)
{
   pat = pat.replace("tt", "{TT}"); // to prevent that conversion in the next step
   pat = UpdatePatternWithTime(instance, pat, date);   // intentionally ordered first to avoid when dates use letters
   pat = UpdatePatternWithDate(instance, pat, date);  

   var am = instance.dateTimeFormat("AM");
   var pm = instance.dateTimeFormat("PM");
   if (am)
      pat = pat.replace("{TT}", (date.getHours() < 12) ? am : pm);
   return pat;
}


/* Use with isValidChar. Pass a string containing all characters to test
that have the same result. That result, true or false, is identified in expectedResult. */
function checkAllChars(instance, chars, expectedResult)
{
   for (var i = 0; i < chars.length; i++)
   {
      var r = instance.isValidChar(chars.charAt(i));
      assertEquals("Character tested: " + chars.charAt(i) + " Should be " + expectedResult.toString(), expectedResult, r);
   }
}

/* 
Used to call the invoke() method added when you use TypeManager\command extensions.js
*/
function InvokeCmd(instance, args, resultText, notchanged, error)
{
   instance.invoke.call(instance, args);
   assertEquals(resultText, args.connection.getTextValue());
   if (notchanged)
      assertFalse(args.changed);
   else
      assertTrue(args.changed);
   if (error)
      assertTrue(args.error);
   else
      assertFalse(args.error);

}

function assertFunction( element ) {
   assertTrue(typeof element == "function");
}

      
/*
// Taken from unobtrusive to support <span> tag placement of error messages on non-unobtrusive cases
// Assign to options.errorPlacement
function onError(error, inputElement) { 
   var form = $("#Form1");
   var container = $(form).find("[data-valmsg-for='" + inputElement[0].name + "']"),
      replace = $.parseJSON(container.attr("data-valmsg-replace")) !== false;

   container.removeClass("field-validation-valid").addClass("field-validation-error");
   error.data("unobtrusiveContainer", container);

   if (replace) {
      container.empty();
      error.removeClass("input-validation-error").appendTo(container);
   }
   else {
      error.hide();
   }
}

// Taken from unobtrusive to support <span> tag placement of error messages on non-unobtrusive cases
// Assign to options.success
function onSuccess(error) {
   var form = $("#Form1");
   var container = error.data("unobtrusiveContainer");
   if (!container)
      return;
   var replace = $.parseJSON(container.attr("data-valmsg-replace"));

   if (container) {
      container.addClass("field-validation-valid").removeClass("field-validation-error");
      error.removeData("unobtrusiveContainer");

      if (replace) {
            container.empty();
      }
   }
}
*/
// Use with jquery-validate setup on form inputs, where the first has rules to be validated
// id-ID of the input control
// text - the value to set on the input control. This will be used by validation
// result - the value returned by jquery-validate's validator.element() function. Usually true, false, or "dependency-mismatch"
// errormessage - the exact error message expected in the <span> tag with id="[id]_Result"
// id2, id3, id4 - If additional inputs supply values to the validation, these are ids of those inputs
// text2, text3, text4 - The values to assign to inputs id2, id3, id4
function runJqueryValidate(id1, text1, result, errormessage, id2, text2, id3, text3, id4, text4, id5, text5)
{
   function setValue(id, value)
   {
      var element = document.getElementById(id);
      element.value = value;
      if (element.tagName == "INPUT")
         if ((element.type == "radio") || (element.type == "checkbox"))
            element.checked = !!value;

      return element;
   }
   var el = setValue(id1, text1);
   if (id2)
      setValue(id2, text2);
   if (id3)        
      setValue(id3, text3);
   if (id4)        
      setValue(id4, text4);
   if (id5)        
      setValue(id5, text5);


   var resultElement = document.getElementById(id1 + "_Result");
   resultElement.innerHTML = "";

   var form = $("#Form1");
   var validator = $.data(form[0], "validator");
   var r = validator.element("#" + id1);  // NOTE: if the condition returns "dependency-mismatch", this returns undefined
   assertEquals(result, r);
   jTAC.jqueryValidate.validate(validator, id1); // to force the message to be drawn
   assertTrue(resultElement.innerHTML.indexOf(errormessage) > -1);
}

function setPropertyValue(instance, propertyName, val) {
   try 
   {
      instance[propertyName] = val;
   }
   catch (e)
   {
      fail("Assign property [" + propertyName + "] with an illegal value.");
   }
   assertEquals(val, instance[propertyName]);
}

function setInvalidPropertyValue(instance, propertyName, val) {
   var success = false;
   try 
   {
      instance[propertyName] = val;
      success = true;
   }
   catch (e)
   {
   }
   if (success)
      fail("Assign property [" + propertyName + "] with a valid value.");
}