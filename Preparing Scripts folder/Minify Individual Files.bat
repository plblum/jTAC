REM Minifies all .js files in the master jTAC folder,
REM placing the minified versions in the master jTAC-min folder.
REM This batch file only needs modification when a new folder is
REM introduced into jTAC's scripts folder.

SET MasterFolder=..\Add contents to your site\
SET RootSource=%MasterFolder%\jTAC
SET RootDest=..\jTAC-min
SET YUI=..\..\Preparing Scripts Folder\yuicompressor-2.4.7.jar

REM assumes that the batch file is run from \jTAC\Preparing Scripts Folder
PUSHD "%RootSource%"

FOR %%f IN (*.js) DO java -jar "%YUI%" -o "%RootDest%\%%f" "%%f"
FOR %%f IN (.\CalcItems\*.js) DO java -jar "%YUI%" -o "%RootDest%\%%f" "%%f"
FOR %%f IN (.\Calculations\*.js)      DO java -jar "%YUI%" -o "%RootDest%\%%f" "%%f"
FOR %%f IN (.\Conditions\*.js)        DO java -jar "%YUI%" -o "%RootDest%\%%f" "%%f"
FOR %%f IN (.\Connections\*.js)       DO java -jar "%YUI%" -o "%RootDest%\%%f" "%%f"
FOR %%f IN (.\Cultures\*.js)          DO java -jar "%YUI%" -o "%RootDest%\%%f" "%%f"
FOR %%f IN (".\jquery-ui widgets\*.js") DO java -jar "%YUI%" -o "%RootDest%\%%f" "%%f"
REM FOR %%f IN (".\jquery-ui widgets\jqActions\*.js") DO java -jar "%YUI%" -o "%RootDest%\%%f" "%%f"
FOR %%f IN (.\jquery-validate\*.js)   DO java -jar "%YUI%" -o "%RootDest%\%%f" "%%f"
FOR %%f IN (.\Translations\*.js)      DO java -jar "%YUI%" -o "%RootDest%\%%f" "%%f"
FOR %%f IN (.\TypeManagers\*.js)      DO java -jar "%YUI%" -o "%RootDest%\%%f" "%%f"

POPD

pause