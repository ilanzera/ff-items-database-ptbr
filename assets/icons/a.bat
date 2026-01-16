@echo off
:: Muda para o diretório onde o script está
cd /d "%~dp0"

:: Loop para encontrar arquivos PNG que NÃO tenham "_rgb" no nome
for /f "delims=" %%f in ('dir /b /a-d *.png ^| findstr /v /i "_rgb"') do (
    ren "%%f" "%%~nf_rgb%%~xf"
)

echo Feito! Todos os arquivos foram renomeados.
pause