@echo off
set "PATH=C:\Users\DELL\AppData\Local\Programs\node;%PATH%"
cd /d "%~dp0"
npx --yes http-server . -p 3002 -c-1
