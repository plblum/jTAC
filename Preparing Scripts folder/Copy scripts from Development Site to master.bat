REM Copy all .js files from the Development Site\jTAC folder to the master folder.
REM Copy all files from the Development Site\jTAC Appearance folder to the master folder.

SET MasterFolder=..\Add contents to your site
SET AppFolder=..\Development Site
XCOPY "%AppFolder%\jTAC\*.js" "%MasterFolder%\jTAC\" /S /F /Y

XCOPY "%AppFolder%\jTAC Appearance\*.*" "%MasterFolder%\jTAC Appearance\" /S /F /Y

pause

