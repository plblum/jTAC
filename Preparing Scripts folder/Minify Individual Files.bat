REM Minifies all .js files in the master jTAC folder,
REM placing the minified versions in the master jTAC-min folder.
REM This batch file only needs modification when a new folder is
REM introduced into jTAC's scripts folder.

SET MasterFolder=..\Add contents to your site
SET RootSource=%MasterFolder%\jTAC
SET RootDest=%MasterFolder%\jTAC-min

java -jar yuicompressor-2.4.7.jar -o ".js$:.xjs"  "%RootSource%\*.js"

COPY "%RootSource%\*.xjs" "%RootDest%\"
DEL "%RootDest%\*.js"
RENAME "%RootDest%\*.xjs" "*.js"
DEL "%RootSource%\*.xjs"

java -jar yuicompressor-2.4.7.jar -o ".js$:.xjs"  "%RootSource%\CalcItems\*.js"

COPY "%RootSource%\CalcItems\*.xjs" "%RootDest%\CalcItems\"
DEL "%RootDest%\CalcItems\*.js"
RENAME "%RootDest%\CalcItems\*.xjs" "*.js"
DEL "%RootSource%\CalcItems\*.xjs"

java -jar yuicompressor-2.4.7.jar -o ".js$:.xjs"  "%RootSource%\Calculations\*.js"

COPY "%RootSource%\Calculations\*.xjs" "%RootDest%\Calculations\"
DEL "%RootDest%\Calculations\*.js"
RENAME "%RootDest%\Calculations\*.xjs" "*.js"
DEL "%RootSource%\Calculations\*.xjs"

java -jar yuicompressor-2.4.7.jar -o ".js$:.xjs"  "%RootSource%\Conditions\*.js"

COPY "%RootSource%\Conditions\*.xjs" "%RootDest%\Conditions\"
DEL "%RootDest%\Conditions\*.js"
RENAME "%RootDest%\Conditions\*.xjs" "*.js"
DEL "%RootSource%\Conditions\*.xjs"

java -jar yuicompressor-2.4.7.jar -o ".js$:.xjs"  "%RootSource%\Connections\*.js"

COPY "%RootSource%\Connections\*.xjs" "%RootDest%\Connections\"
DEL "%RootDest%\Connections\*.js"
RENAME "%RootDest%\Connections\*.xjs" "*.js"
DEL "%RootSource%\Connections\*.xjs"

java -jar yuicompressor-2.4.7.jar -o ".js$:.xjs"  "%RootSource%\Cultures\*.js"

COPY "%RootSource%\Cultures\*.xjs" "%RootDest%\Cultures\"
DEL "%RootDest%\Cultures\*.js"
RENAME "%RootDest%\Cultures\*.xjs" "*.js"
DEL "%RootSource%\Cultures\*.xjs"

java -jar yuicompressor-2.4.7.jar -o ".js$:.xjs"  "%RootSource%\jquery-ui widgets\*.js"

COPY "%RootSource%\jquery-ui widgets\*.xjs" "%RootDest%\jquery-ui widgets\"
DEL "%RootDest%\jquery-ui widgets\*.js"
RENAME "%RootDest%\jquery-ui widgets\*.xjs" "*.js"
DEL "%RootSource%\jquery-ui widgets\*.xjs"

java -jar yuicompressor-2.4.7.jar -o ".js$:.xjs"  "%RootSource%\jquery-validate\*.js"

COPY "%RootSource%\jquery-validate\*.xjs" "%RootDest%\jquery-validate\"
DEL "%RootDest%\jquery-validate\*.js"
RENAME "%RootDest%\jquery-validate\*.xjs" "*.js"
DEL "%RootSource%\jquery-validate\*.xjs"

java -jar yuicompressor-2.4.7.jar -o ".js$:.xjs"  "%RootSource%\Translations\*.js"

COPY "%RootSource%\Translations\*.xjs" "%RootDest%\Translations\"
DEL "%RootDest%\Translations\*.js"
RENAME "%RootDest%\Translations\*.xjs" "*.js"
DEL "%RootSource%\Translations\*.xjs"


java -jar yuicompressor-2.4.7.jar -o ".js$:.xjs"  "%RootSource%\TypeManagers\*.js"

COPY "%RootSource%\TypeManagers\*.xjs" "%RootDest%\TypeManagers\"
DEL "%RootDest%\TypeManagers\*.js"
RENAME "%RootDest%\TypeManagers\*.xjs" "*.js"
DEL "%RootSource%\TypeManagers\*.xjs"

pause