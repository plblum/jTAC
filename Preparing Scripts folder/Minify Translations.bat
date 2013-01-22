REM Minifies only your \jTAC\Translations folder,
REM placing the results in your \jTAC-min\Translations folder.
REM You must modify this file before running it. 
REM Change the SET RootSource statement to point to the app root folder in your app
SET YUI=%CD%\yuicompressor-2.4.7.jar

REM REMOVE THIS EXIT STATEMENT AFTER YOU MODIFY THE SET STATEMENT
pause
REM exit

REM UPDATE THIS LINE TO POINT TO YOUR APP ROOT FOLDER. OMIT DRIVE LETTER
SET AppRootFolder=\Folder\MyApp
REM IF YOU NEED TO CHANGE THE DRIVE, UPDATE THE LINE BELOW
C:


PUSHD "%AppRootFolder%\jTAC\Translations\"

FOR %%f IN ("*.js")  DO java -jar "%YUI%" -o "..\..\jTAC-min\Translations\%%f" "%%f"

POPD

pause
