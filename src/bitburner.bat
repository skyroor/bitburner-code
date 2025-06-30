@echo off
cd ..
echo Starting npm run watch in %cd%...
start "" cmd /k "npm run watch"

:: Define the game EXE and Steam ID
set GAME_EXE=bitburner.exe
set STEAM_GAME_ID=1812820

:: Check if the game is already running
tasklist /FI "IMAGENAME eq %GAME_EXE%" 2>NUL | find /I "%GAME_EXE%" >NUL
if "%ERRORLEVEL%"=="0" (
    echo Game is already running.
) else (
    echo Launching Bitburner on Stream...

    :: Wait a few seconds to let watch initialize (optional)
    timeout /t 1 /nobreak > NUL

    start "" steam://rungameid/%STEAM_GAME_ID%
)
