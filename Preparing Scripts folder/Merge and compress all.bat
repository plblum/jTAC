REM Actions that prepare the Merged folder in the master jTAC folder
REM and create minified versions all scripts in the master jTAC-min folder.

CALL "Minify Individual Files.BAT"

CALL "Make Merged Files.BAT"

CALL "Minify Merged Files.bat"
