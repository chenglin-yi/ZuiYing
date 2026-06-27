@echo off
cd /d D:\Code\VibeCoding\vsFilm\ZuiYing
echo Running expo prebuild...
npx expo prebuild --platform android
echo.
echo Checking android folder:
dir android
pause