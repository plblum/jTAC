REM The master batch file (requires Windows command line).
REM Run when source script files in the Development site have been modified.
REM It copies all .js files to the master folder ("Add contents to your site"),
REM merges them in the Merged folder, and minifies them in the \jTAC-min folder.
REM It copies the jTAC-min folder contents to the Development site's jTAC-min folder.

REM It offloads work to other batch files which you can run independently if you like.
REM If you want to modify how the Merge folder is constructed, edit "Make Merged Files.bat"

CALL "Copy scripts from Development Site to master.bat"

CALL "Merge and compress all.bat"

CALL "Copy scripts from master to Development Site.bat"
