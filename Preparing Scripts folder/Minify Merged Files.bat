REM Minifies the master Scripts\jTAC\Merged folder
REM placing the results in the Scripts\jTAC-min\Merged folder

SET MasterFolder=..\Add contents to your site\
SET Source=%MasterFolder%\jTAC
SET Dest=..\jTAC-min
SET YUI=..\..\Preparing Scripts Folder\yuicompressor-2.4.7.jar

REM assumes that the batch file is run from \jTAC\Preparing Scripts Folder
PUSHD "%Source%"

FOR %%f IN (".\Merged\*.js") DO java -jar "%YUI%" -o "%Dest%\%%f" "%%f"
FOR %%f IN (".\Merged\jquery extensions\*.js") DO java -jar "%YUI%" -o "%Dest%\%%f" "%%f"

POPD

pause
