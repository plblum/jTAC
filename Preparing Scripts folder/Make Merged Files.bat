REM Merges source (unminified) script files into the files that 
REM reside in the Merged and Merged\jquery extensions folder.
REM You are welcome to create entirely different packaging of the merged files.
REM Once they are created, run the "Minify Merged Files.bat" batch file
REM to create minified versions of these files in the \jTAC-min\Merged folder.

SET MasterFolder=..\Add contents to your site
SET RootSource=%MasterFolder%\jTAC
SET Merged=%MasterFolder%\jTAC\Merged
SET jquery=%MasterFolder%\jTAC\Merged\jquery extensions

REM core.js is required any time jCondition is used
COPY "%RootSource%\jTAC.js" /B + "%RootSource%\Connections\Base.js" /B + "%RootSource%\Connections\BaseElement.js" /B + "%RootSource%\Connections\FormElement.js" /B + "%RootSource%\TypeManagers\Base.js" /B + "%RootSource%\TypeManagers\BaseCulture.js" /B  "%Merged%\core.js"

REM conditions-base classes.js contains most of the base classes: Base, BaseOneConnection, BaseTwoConnections, BaseOneOrMoreConnections, BaseOperator, BaseCounter
COPY "%RootSource%\Conditions\Base.js" /B + "%RootSource%\Conditions\BaseOneConnection.js" /B + "%RootSource%\Conditions\BaseTwoConnections.js" /B + "%RootSource%\Conditions\BaseOneOrMoreConnections.js" /B + "%RootSource%\Conditions\BaseOperator.js" /B + "%RootSource%\Conditions\BaseCounter.js" /B "%Merged%\conditions-base classes.js"

REM conditions-basic.js contains these Conditions: Required, DataTypeCheck, Range
COPY "%Merged%\conditions-base classes.js" /B + "%RootSource%\Conditions\Required.js" /B + "%RootSource%\Conditions\DataTypeCheck.js" /B + "%RootSource%\Conditions\Range.js" /B "%Merged%\conditions-basic.js"

REM conditions-typical.js contains conditions-basic.js plus these Conditions: CompareToValue, CompareTwoElements, BaseRegExp, RegExp
COPY "%Merged%\conditions-basic.js" /B + "%RootSource%\Conditions\CompareToValue.js" /B + "%RootSource%\Conditions\CompareTwoElements.js" /B + "%RootSource%\Conditions\BaseRegExp.js" /B + "%RootSource%\Conditions\RegExp.js" /B "%Merged%\conditions-typical.js"

REM conditions-all.js contains all conditions
COPY "%Merged%\conditions-typical.js" /B +  "%RootSource%\Conditions\Difference.js" /B + "%RootSource%\Conditions\RequiredIndex.js" /B + "%RootSource%\Conditions\SelectedIndex.js" /B + "%RootSource%\Conditions\BooleanLogic.js" /B + "%RootSource%\Conditions\DuplicateEntry.js" /B + "%RootSource%\Conditions\CharacterCount.js" /B + "%RootSource%\Conditions\WordCount.js" /B + "%RootSource%\Conditions\CountSelections.js" /B + "%RootSource%\Connections\Value.js" /B "%Merged%\conditions-all.js"

REM TypeManagers. (NOTE: PowerDateParser and PowerTimeParser are not merged here. If you add them, remember that they override the default parsers.)

REM typemanagers-numbers.js contains BaseNumbers and all of its subclasses
COPY "%RootSource%\TypeManagers\BaseNumber.js" /B + "%RootSource%\TypeManagers\BaseFloat.js" /B + "%RootSource%\TypeManagers\Integer.js" /B + "%RootSource%\TypeManagers\Float.js" /B + "%RootSource%\TypeManagers\Currency.js" /B + "%RootSource%\TypeManagers\Percent.js" /B  "%Merged%\typemanagers-numbers.js"

REM typemanagers-date.js contains BaseDatesAndTimes and its subclasses to support TypeManagers.Date, but no time, duration, DayMonth, or MonthYear
COPY "%RootSource%\TypeManagers\BaseDatesAndTimes.js" /B + "%RootSource%\TypeManagers\BaseDate.js" /B + "%RootSource%\TypeManagers\Date.js" /B   "%Merged%\typemanagers-date.js"

REM typemanagers-date-time.js contains typemanagers-date.js, TypeManagers.TimeOfDay, and TypeManagers.DateTime, but no duration, DayMonth, or MonthYear
COPY "%Merged%\typemanagers-date.js" /B + "%RootSource%\TypeManagers\BaseTime.js" /B + "%RootSource%\TypeManagers\TimeOfDay.js" /B + "%RootSource%\TypeManagers\DateTime.js" /B  "%Merged%\typemanagers-date-time.js"

REM typemanagers-date-time-all.js contains typemanagers-date-time.js and duration, DayMonth, and MonthYear.
COPY "%Merged%\typemanagers-date-time.js" /B + "%RootSource%\TypeManagers\Duration.js" /B + "%RootSource%\TypeManagers\MonthYear.js" /B + "%RootSource%\TypeManagers\DayMonth.js" /B   "%Merged%\typemanagers-date-time-all.js"

REM typemanagers-strings-common.js contains TypeManagers\Strings.js, TypeManagers\EmailAddressTypeManager.js, TypeManagers\PhoneNumberTypeManager.js, and TypeManagers\PostalCodeTypeManager.js
COPY "%RootSource%\TypeManagers\BaseString.js" /B + "%RootSource%\TypeManagers\BaseStrongPatternString.js" /B + "%RootSource%\TypeManagers\BaseRegionString.js" /B + "%RootSource%\TypeManagers\String.js" /B + "%RootSource%\TypeManagers\EmailAddress.js" /B + "%RootSource%\TypeManagers\PhoneNumber.js" /B  + "%RootSource%\TypeManagers\PostalCode.js" /B "%Merged%\typemanagers-strings-common.js"

REM typemanagers-strings-all.js contains typemanagers-strings-common.js, TypeManagers\CreditCardNumberTypeManager.js, and TypeManagers\UrlTypeManager.js
COPY "%Merged%\typemanagers-strings-common.js" /B + "%RootSource%\TypeManagers\CreditCardNumber.js" /B + "%RootSource%\TypeManagers\Url.js" /B  "%Merged%\typemanagers-strings-all.js"

REM typemanagers-all.js contains all TypeManagers
COPY "%Merged%\typemanagers-numbers.js" /B + "%Merged%\typemanagers-date-time-all.js" /B + "%Merged%\typemanagers-strings-all.js" /B + "%RootSource%\TypeManagers\Boolean.js" /B  "%Merged%\typemanagers-all.js"



REM jquery-validate extensions

REM jquery-validate-extensions.js contains all jquery-validate libraries.
COPY "%RootSource%\jquery-validate\ReplaceTokens PlugIn.js" /B + "%RootSource%\jquery-validate\Condition Extensions.js" /B + "%RootSource%\jquery-validate\Rules.js" /B + "%RootSource%\Connections\BaseJQUIElement.js" /B + "%RootSource%\Connections\JQUIDatePicker.js" /B "%jquery%\jquery-validate-extensions.js"

REM validation-basic.js contains the conditions-basic.js and jquery extensions.js.
COPY "%Merged%\conditions-basic.js" /B + "%jquery%\jquery-validate-extensions.js" /B "%jquery%\validation-basic.js"

REM validation-typical.js contains the conditions-typical.js and jquery extensions.js.
COPY "%Merged%\conditions-typical.js" /B + "%jquery%\jquery-validate-extensions.js" /B "%jquery%\validation-typical.js"

REM validation-all.js contains the conditions-all and jquery-validate-extensions
COPY "%Merged%\conditions-all.js" /B + "%jquery%\jquery-validate-extensions.js" /B "%jquery%\validation-all.js"



REM jquery-ui widgets

REM calculations.js contains all CalcItem and CalcWidget items except those specific to jquery
COPY "%RootSource%\Parser.js" /B + "%RootSource%\CalcItems\Base.js" /B + "%RootSource%\CalcItems\Null.js" /B + "%RootSource%\CalcItems\NaN.js" /B + "%RootSource%\CalcItems\Number.js" /B + "%RootSource%\CalcItems\Element.js" /B + "%RootSource%\CalcItems\Group.js" /B + "%RootSource%\CalcItems\Conditional.js" /B + "%RootSource%\CalcItems\BaseFunction.js" /B + "%RootSource%\CalcItems\Abs.js" /B + "%RootSource%\CalcItems\Avg.js" /B + "%RootSource%\CalcItems\Fix.js" /B + "%RootSource%\CalcItems\Max.js" /B + "%RootSource%\CalcItems\Min.js" /B + "%RootSource%\CalcItems\Round.js" /B + "%RootSource%\CalcItems\UserFunction.js" /B +  "%RootSource%\Calculations\Widget.js" /B + "%RootSource%\Calculations\WidgetConnection.js" /B + "%RootSource%\Connections\InnerHtml.js" /B "%Merged%\calculations.js"

REM calculations.js contains the calculations.js, and jquery-ui widgets\calculator.js
REM It does NOT contain Calculations\jquery-ui-calculator-unobstrusive.js because that file needs to be added explicitly to enable the feature
COPY "%Merged%\calculations.js" /B + "%RootSource%\jquery-ui widgets\calculator.js" /B "%jquery%\calculations.js"
 
REM calculations-unobtrusive.js contains the all calculation features, with support for unobtrusive calculations in jquery
COPY "%jquery%\calculations.js" /B + "%RootSource%\jquery-ui widgets\calculator-unobtrusive.js" /B "%jquery%\calculations-unobtrusive.js"
 
REM textbox widgets contains the datatypeeditor and datetextbox widgets without unobtrusive support
COPY "%RootSource%\jquery-ui widgets\datatypeeditor.js" /B + "%RootSource%\jquery-ui widgets\datetextbox.js" /B  + "%RootSource%\TypeManagers\Command Extensions.js" /B "%jquery%\textbox widgets.js"

REM textbox widgets contains the datatypeeditor and datetextbox widgets with unobtrusive support
COPY "%jquery%\textbox widgets.js" /B + "%RootSource%\jquery-ui widgets\datatypeeditor-unobtrusive.js" /B  + "%RootSource%\jquery-ui widgets\datetextbox-unobtrusive.js" /B "%jquery%\textbox widgets-unobtrusive.js"


REM jtac-all: all without jquery
COPY "%Merged%\core.js" /B + "%RootSource%\Connections\UserFunction.js" /B + "%Merged%\typemanagers-all.js" /B + "%Merged%\conditions-all.js" /B  + "%Merged%\calculations.js" /B "%Merged%\jtac-all.js"


REM jtac-all: all with jquery
COPY "%Merged%\core.js" /B + "%RootSource%\Connections\UserFunction.js" /B + "%Merged%\typemanagers-all.js" /B + "%Merged%\validation-all.js" /B  + "%jquery%\calculations-unobtrusive.js" /B + "%jquery%\textbox widgets-unobtrusive.js" /B "%jquery%\jtac-all.js"

pause
