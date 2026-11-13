@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ========================================================
echo    MERCAMELL PROMOCONTROL - TESTES E2E
 echo ========================================================
echo.
echo Os testes usam apenas a copia temporaria do banco de dados.
echo Feche o ambiente de demonstracao na porta 8768 antes de iniciar.
echo.
if not exist "node_modules\@playwright\test" (
  echo Dependencias nao instaladas. Execute primeiro:
  echo    npm ci
  echo    npx playwright install chromium
  pause
  exit /b 1
)
if not exist "_application\app.py" (
  echo Aplicacao nao encontrada. Baixando a versao do GitHub...
  call npm run setup:app
  if errorlevel 1 (pause & exit /b 1)
)
call npm test
pause
