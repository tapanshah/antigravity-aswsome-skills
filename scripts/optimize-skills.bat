@echo off
setlocal enabledelayedexpansion

echo Optimizing Antigravity skills folder to prevent agent overload...

:: Define paths
set "SKILLS_DIR=%USERPROFILE%\.gemini\antigravity\skills"
set "ARCHIVE_DIR=%USERPROFILE%\.gemini\antigravity\skills_archive"

:: 1. Rename the bloated folder so the agent stops looking at it
if exist "%SKILLS_DIR%" (
    echo Archiving existing skills to %ARCHIVE_DIR%...
    if exist "%ARCHIVE_DIR%" (
        echo Archive folder already exists. Appending timestamp...
        set "timestamp=%date:~10,4%%date:~4,2%%date:~7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
        set "timestamp=!timestamp: =0!"
        ren "%SKILLS_DIR%" "skills_archive_!timestamp!"
    ) else (
        ren "%SKILLS_DIR%" "skills_archive"
    )
)

:: 2. Create a fresh, empty global skills folder
echo Creating fresh skills folder...
mkdir "%SKILLS_DIR%"

:: 3. Determine which skills to copy
echo Determining skills to copy...

:: Default list if no arguments and python fails
set "DEFAULT_ESSENTIALS=api-security-best-practices auth-implementation-patterns backend-security-coder frontend-security-coder cc-skill-security-review pci-compliance frontend-design react-best-practices react-patterns nextjs-best-practices tailwind-patterns form-cro seo-audit ui-ux-pro-max 3d-web-experience canvas-design mobile-design scroll-experience senior-fullstack frontend-developer backend-dev-guidelines api-patterns database-design stripe-integration agent-evaluation langgraph mcp-builder prompt-engineering ai-agents-architect rag-engineer llm-app-patterns rag-implementation prompt-caching context-window-management langfuse"

set "ESSENTIALS="
set "QUERIES=Essentials"
if "%~1"=="" goto :process_skills

:: Capture all arguments
set "QUERIES=%*"

:process_skills
:: Try to use the python helper
python --version >nul 2>&1
if errorlevel 1 goto :fallback
echo Using Python helper for bundle expansion...
python "%~dp0..\tools\scripts\get-bundle-skills.py" !QUERIES! > "%TEMP%\skills_list.txt"
if not exist "%TEMP%\skills_list.txt" goto :fallback
set /p ESSENTIALS=<"%TEMP%\skills_list.txt"
del "%TEMP%\skills_list.txt"

:fallback
:: Fallback if python failed or returned empty
if not "!ESSENTIALS!"=="" goto :display_skills
if "!QUERIES!"=="Essentials" (
    echo Using default essentials list (Python unavailable)...
    set "ESSENTIALS=%DEFAULT_ESSENTIALS%"
) else (
    echo Using provided arguments as literal skill names...
    set "ESSENTIALS=!QUERIES!"
)

:display_skills
echo Skills to restore: !ESSENTIALS!
echo.

set "SRC=%ARCHIVE_DIR%"
if not exist "%SRC%" (
    :: Find the most recent archive if we used a timestamp
    for /f "delims=" %%i in ('dir /b /ad /o-n "%USERPROFILE%\.gemini\antigravity\skills_archive*"') do (
        set "SRC=%USERPROFILE%\.gemini\antigravity\%%i"
        goto :found_src
    )
)
:found_src

if not exist "%SRC%" (
    echo ERROR: Could not find source skills directory.
    exit /b 1
)

for %%s in (!ESSENTIALS!) do (
    if exist "!SRC!\%%s" (
        echo   + %%s
        xcopy "!SRC!\%%s" "!SKILLS_DIR!\%%s" /E /I /Y >nul
    ) else (
        echo   - %%s (not found in archive)
    )
)

echo.
echo Done! Context window overload should be resolved.
pause
