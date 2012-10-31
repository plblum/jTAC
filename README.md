#jTAC: JavaScript Types and Conditions
<p>
   jTAC is a JavaScript library for enhancing data entry user interfaces. It expands
   <a href="http://bassistance.de/jquery-plugins/jquery-plugin-validation/" target="_blank">
      jquery-validate</a>, adding new rules and features. It also includes several
   jquery-ui widgets, including the DataTypeEditor, DateTextBox, and Calculator. 
   jTAC is <em>not</em> <a href="http://jquery.com" target="_blank">jquery</a> specific. You can use it in all of your JavaScript libraries.</p>
<p>
   Underlying validation are three tools that you will want to use in other situations:
   TypeManagers, Conditions, and Connections.</p>
<ul>
   <li><strong>TypeManagers</strong> understand data types, like integers, dates, currencies, and email
      addresses. They provide parsers to convert strings into the native type and report
      errors when conversion fails. As a result, validation delegates significant work
      to TypeManagers.</li>
   <li><strong>Conditions</strong> are the actual validation rules, like “compare to value”, “range”, and
      “text length”.</li>
   <li><strong>Connections</strong> are used to access data from elements on the page or other sources.
      They work with HTML form elements, custom widgets that are composed of several form
      elements (like a checkbox list) or use API calls to get a value, and even your custom
      calculations that return a value. Conditions use Connections for all their data
      retrieval.</li>
</ul>
<p>
   While jQuery is obviously supported, the jTAC core does not use jQuery, making its
   classes useable in other JavaScript frameworks. The jQuery tools are merely fully
   realized uses of these classes. It’s these classes that will contribute most to
   your application.</p>
<ul>
   <li><a href="#gettingStarted">Getting started</a></li>
   <li><a href="#jqvRules">Improving jquery-validate's rules</a></li>
   <li><a href="#jqueryImprovements">Other improvements to jquery-validate</a></li>
   <li><a href="#moreBenefits">More benefits of using jTAC</a></li>
</ul>

<h3><a name="gettingStarted">Getting started</a></h3>
<ul>
<li>Download jTAC using the <a href="https://github.com/plblum/jTAC/downloads" target="_blank">Downloads</a> button on the jTAC home page.</li>
<li>Add the contents of the <strong>Add contents to your site</strong> folder, perhaps in its own script folder.</li>
<li>Open the <strong>Users Guide.pdf</strong> and dig in. Read the overviews for TypeManagers, Conditions, and Connections
because you will be using them to setup your validation rules.</li>
<li>If you want to customize the jTAC library, use the Development Site. It hosts jsunit test files.</li>
</ul>
<p>The remaining text is an overview. If you want to dig into the details, grab the User's Guide now.</p>

<h3>
   <a name="jqvRules">Improving jquery-validate's rules</a></h3>
<p>jTAC was created when two key things collided: the author of a popular validation framework attempted to use <a href="http://bassistance.de/jquery-plugins/jquery-plugin-validation/">
   jquery-validate</a> v1.8. He was quickly frustrated by how inflexible the rules were. His existing solution already used the concepts of TypeManagers, Conditions, and Connections to build powerful validation rules. jTAC is his remedy. Let’s take a look at how jquery-validate’s rules are designed…</p>
<p>
   The rules within 
   <a href="http://bassistance.de/jquery-plugins/jquery-plugin-validation/">
   jquery-validate</a> are limited to handling single cases. Take the Range rule that comes 
   with query-validate.
</p>
<pre>
range: <span style="color:blue">function</span>( value, element, param ) {
<span style="color:blue">&nbsp;&nbsp;return</span> <span style="color:blue">this</span>.optional(element) || ( value &gt;= param[0] &amp;&amp; value &lt;= param[1] );
}
</pre>

<p>
   It evaluates a number against a minimum and maximum value. If you want the range 
   to work with dates, you must create a new rule.
</p>
<pre>
dateRange: <span style="color:blue">function</span>( value, element, param ) {
&nbsp;&nbsp;<span style="color:blue">var</span> min = convertTextToDate(param[0]);<span style="color:green">&nbsp;&nbsp;// expected: &quot;yyyy-MM-dd&quot;</span>
&nbsp;&nbsp;<span style="color:blue">var</span> max = convertTextToDate(param[1]);
&nbsp;&nbsp;<span style="color:blue">var</span> val = convertTextToDate(value);
  <span style="color:blue">return</span> <span style="color:blue">this</span>.optional(element) || ( val &gt;= min &amp;&amp; val &lt;= min );
}
</pre>
<p>
   That convertTextToDate() function is a big deal, as it’s a parser that you have to write. You can write a simple date 
   parser, but if you are dealing with localization or real-world user input, parsers can get pretty fancy.</p>
<p>
   Even if you create the new rule, it may not work with all ui-widgets. For 
   example, your new DateRange will work with a textbox, but not a calendar widget, 
   which requires an API call to access its value.</p>
<pre>
calendarDateRange: <span style="color:blue">function</span>( value, element, param ) {
&nbsp;&nbsp; <span style="color:blue">var</span> min = convertTextToDate(param[0]);&nbsp;<span style="color:green">// expected: &quot;yyyy-MM-dd&quot;</span>
&nbsp;&nbsp; <span style="color:blue">var</span> max = convertTextToDate(param[1]);
&nbsp;&nbsp; <span style="color:blue">var</span> val = element.calendar(<span style="color:maroon">&quot;getDate&quot;</span>);&nbsp; <span style="color:green">// value param is ignored</span>
<span style="color:blue">&nbsp;&nbsp; return</span> <span style="color:blue">this</span>.optional(element) || ( val &gt;= min &amp;&amp; val &lt;= min );
}
</pre>
<p>A better way is to create a rule for ranges that handles any data type and source of data using TypeManagers and Connections. <em>The following is pseudocode.</em></p>
<pre>
advrange: <span style="color:blue">function</span>( value, element, param ) {
&nbsp;&nbsp; <span style="color:blue">var</span> tm = jTAC.create(param.datatype); <span style="color:green">// creates a TypeManager</span>
&nbsp;&nbsp; <span style="color:blue">var</span> conn = jTAC.connectionResolver(param.elementId); <span style="color:green">// creates a Connection</span>
&nbsp;&nbsp; value = tm.toValue(value);&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <span style="color:green">// ensure it is in the native type</span>
&nbsp;&nbsp; <span style="color:blue">var</span> min = tm.toValueNeutral(param.minimum);&nbsp;<span style="color:green">// ensure native type</span>
&nbsp;&nbsp; <span style="color:blue">var</span> max = tm.toValueNeutral(param.maximum);
<span style="color:blue">&nbsp;&nbsp; return</span> <span style="color:blue">this</span>.optional(element) ||
&nbsp;&nbsp;&nbsp;&nbsp;((tm.compare(value, min) &gt;= 0) &amp;&amp; (tm.compare(value, max) &lt;= 0));
}
</pre>
<p>The above code is similar to what you will find in jTAC’s Condition object for the Range rule.</p>
<p>Here is a textbox setup using jTAC for its rules using unobtrusive setup:</p>
<pre>
<span style="color:blue">&lt;</span><span style="color:maroon">input</span><span style="color:blue"> </span><span style="color:red">type</span><span style="color:blue">=&#39;text&#39; </span><span style="color:red">id</span><span style="color:blue">=&#39;textbox1&#39; </span><span style="color:red">name</span><span style="color:blue">=&#39;textbox1&#39; </span>
<span style="color:blue">&nbsp;&nbsp; </span><span style="color:red">data-val</span><span style="color:blue">=&quot;true&quot;</span>
<span style="color:red">&nbsp;&nbsp; data-jtac-datatype</span><span style="color:blue">=&quot;date&quot; </span>
<span style="color:red">&nbsp;&nbsp; data-val-datatypecheck</span><span style="color:blue">=&quot;Enter a valid date&quot;</span>
<span style="color:red">&nbsp;&nbsp; data-val-advrange</span><span style="color:blue">=&quot;Value must be between {MINIMUM} and {MAXIMUM}&quot;</span>
<span style="color:red">&nbsp;&nbsp; data-val-advrange-json</span><span style="color:blue">=&quot;{&#39;minimum&#39;: &#39;2000-01-01&#39;, &#39;maximum&#39;=&#39;2009-12-31&#39;}&quot; /&gt;</span>
</pre>
<p style="font-style:italic">
   Note: All data-val properties are defined according to jquery-validate. Any of 
   jTAC’s rules are the Condition name, except “required” and “range” which 
   conflict with the native rules of the same name. Any properties to set on the 
   Condition are assigned using JSON to the data-val-rulename-json attribute, as 
   shown above.</p>
<p>
   You can also see here a second aspect of the enhanced 
   <a href="http://bassistance.de/jquery-plugins/jquery-plugin-validation/">
   jquery-validate</a>
   framework: clear tokens in the error messages. Each validation rule defined by 
   jTAC can define a default error message and convert any tokens you like.</p>

<h3><a name="jqueryImprovements">Other improvements to jquery-validate</a></h3>
<ul>
<li>New rules including one that lets you built other rules into a single Boolean expression</li>
<li>Rules can operate on multiple data types. Includes support for: integer, float, currency, percent, date, time of day, duration, month+year, and day+month. You can expand and customize this.</li>
<li>Rules have properties to let you customize their behavior. For example, the rule for regular expression parsing includes properties to indicate “ignore case sensitive”, “global”, and “multiline” (the 3 options passed into the regular expression parser.)</li>
<li>Support for dependencies while in unobtrusive validation.</li>
<li>Build powerful dependencies without writing your own functions. Define any Condition object on the 
   <strong>depends</strong> property of the <strong>param</strong> property for the validation rule.</li>
<li>Validation can use data from multiple fields. While the Compare Two Elements rule is obvious, also consider the simple Required rule. jTAC’s version allows you to define a list of elements to require, and then require one from the list, all, one or all, etc.</li>
<li>Validation can use data from fields that need to be accessed by API. Take a calendar widget that holds a selected date value. It may not have an &lt;input&gt; to host that value. Instead, it offers an API function like $("#calendar").getDate().</li>
<li>Powerful parsers to convert text into a native type. They support localized formats of dates, times, and numbers.</li>
<li>You don’t have to create a new validation rule for each string-based data type, like Phone Number and Email Address. There are TypeManagers defined to handle data types. So reuse the “DataTypeCheck” validation rule, assigning its 
   <strong>datatype</strong> property to the appropriate TypeManager.</li>
<li>Validation can be done on calculated values, such as the result of adding two TextBoxes containing integers, without creating a new rule.</li>
<li>Can define the form’s <a href="http://docs.jquery.com/Plugins/Validation/validate#toptions" target="_blank">validation options</a> when using unobtrusive validation.</li>
<li>All strings shown to the user can be localized.</li>
<li>Expands how tokens work within error messages. They use clear words like {COUNT} and {MINIMUM} instead of {1} and {2}. </li>
<li>Tokens can be updated at runtime with information calculated during validation, such as {COUNT} can show the current number of characters typed.</li>
<li>The {LABEL} token can display the field’s label. Validators automatically know that &lt;label for="textbox"&gt; tags are the source of error messages. In addition, you can assign the 
   <strong>data-msglabel</strong> attribute to the textbox with the appropriate label.</li>
<li>Highlight fields feature supports validation on multiple elements. For example, when the Compare Two Elements rule reports an error, both textboxes have their style sheet class changed.</li>
<li>Highlight fields feature supports changing the style sheet on the field label or a containing element without you writing code. Labels work automatically. Containing elements only need the 
   <strong>data-jtac-valinputs</strong> attribute.</li>
<li>When using the highlight fields feature, individual inputs, labels, and containing elements can override the default style sheet classes on a case-by-case basis. Just define the alternative style sheet class in the 
   <strong>data-jtac-errorclass</strong> attribute of the element.</li>
</ul>

<h3><a name="moreBenefits">More benefits of using jTAC</a></h3>
<ul>
<li>Localization supported for dates, times, and numbers. In addition to the built-in localization rules, it allows plugging in third party localization libraries. jquery-globalize support is already included as a plug in. </li>
<li>Multilingual support of text shown to the user, such as validation error messages.</li>
<li>TypeManagers convert strings to native types using a parser. Parsers are often very specialized. So jTAC provides plug-in parsers and includes two very powerful powers for date and times. </li>
<li>The entire framework is built for expansion by using classes. You can develop your own classes using inheritance. Extensive documentation is both in this PDF and inline. You may actually appreciate using jTAC’s class building framework for your own classes that are not used with jTAC.</li>
<li>Debugging is made easier by using the browser’s Console view where jTAC writes its error messages.</li>
<li>jTAC is open source and community driven. Submit your ideas and modifications at <a href="https://github.com/plblum/jtac">https://github.com/plblum/jtac</a>.</li>
<li>The author, Peter Blum, is also the author of a successful commercial ASP.NET control suite, “<a href="http://www.peterblum.com/des/home.aspx" target="_blank">Peter’s Data Entry Suite</a>”. That product is similar to jTAC; it handles client-side validation and extends the features of textboxes. He has rolled in much of the knowledge learned from customers over a 10+ year period. Special cases are abound, whether is an option for parsing or dealing with an idiosyncrasy of a browser.</li>
</ul>
