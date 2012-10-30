REM Minifies the master Scripts\jTAC\Merged folder
REM placing the results in the Scripts\jTAC-min\Merged folder


SET MasterFolder=..\Add contents to your site
SET Source=%MasterFolder%\jTAC\Merged
SET Dest=%MasterFolder%\jTAC-min\Merged
SET jquerySource=%MasterFolder%\jTAC\Merged\jquery extensions
SET jqueryDest=%MasterFolder%\jTAC-min\Merged\jquery extensions

java -jar yuicompressor-2.4.7.jar -o ".js$:.xjs"  "%Source%\*.js"

COPY "%Source%\*.xjs" "%Dest%\"
DEL "%Dest%\*.js"
RENAME "%Dest%\*.xjs" "*.js"
DEL "%Source%\*.xjs"

java -jar yuicompressor-2.4.7.jar -o ".js$:.xjs"  "%jquerySource%\*.js"

COPY "%jquerySource%\*.xjs" "%jqueryDest%\"
DEL "%jqueryDest%\*.js"
RENAME "%jqueryDest%\*.xjs" "*.js"
DEL "%jquerySource%\*.xjs"
pause
