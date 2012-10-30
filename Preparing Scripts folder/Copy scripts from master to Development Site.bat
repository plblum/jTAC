REM Copy all minified .js files from the master \jTAC-min folder
REM to the Development Site\jTAC-min folder.
REM Copy all merged files from the master \jTAC\Merged folder
REM to the Development Site\jTAC\Merged folder.

SET MasterFolder=..\Add contents to your site
SET AppFolder=..\Development Site
XCOPY "%MasterFolder%\jTAC-min\*.js" "%AppFolder%\jTAC-min\" /S /F /Y
XCOPY "%MasterFolder%\jTAC\Merged\*.js" "%AppFolder%\jTAC\Merged\" /S /F /Y
pause