@echo off
setlocal
cd /d "%~dp0"
set "EVERDWELL_NODE=node"
where node >nul 2>nul
if errorlevel 1 set "EVERDWELL_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
echo Open http://127.0.0.1:4173/ in your browser.
echo Keep this window open while previewing. Close it to stop the preview.
"%EVERDWELL_NODE%" work\advisor-preview.mjs
if errorlevel 1 pause
