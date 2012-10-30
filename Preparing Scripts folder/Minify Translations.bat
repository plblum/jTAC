REM Minifies only your \jTAC\Translations folder,
REM placing the results in your \jTAC-min\Translations folder.
REM You must modify this file before running it. 
REM Change the two SET statements to reflect the correct paths
REM into your app.

REM REMOVE THIS EXIT STATEMENT AFTER YOU MODIFY THE TWO SET LINES
pause
exit

SET RootSource=C:\Folder\MyApp\jTAC\Translations
SET RootDest=C:\Folder\MyApps\jTAC-min\Translations

java -jar yuicompressor-2.4.7.jar -o ".js$:.xjs"  "%RootSource%\*.js"

COPY %RootSource%\*.xjs %RootDest%\
DEL %RootDest%\*.js
RENAME %RootDest%\*.xjs *.js
DEL %RootSource%\*.xjs

pause