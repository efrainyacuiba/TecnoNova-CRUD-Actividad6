@echo off
cd /d "%~dp0"
where dotnet >nul 2>&1
if errorlevel 1 (echo Falta .NET 10 SDK. Descarga: https://dotnet.microsoft.com/download/dotnet/10.0 & pause & exit /b 1)
dotnet run --launch-profile http
pause
