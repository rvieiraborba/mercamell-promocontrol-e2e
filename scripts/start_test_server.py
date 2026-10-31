"""Sobe uma cópia descartável da aplicação, nunca a base SQLite do usuário.

Para testar uma cópia local do código, configure MERCAMELL_APP_SOURCE com
um caminho que contenha app.py, index.html e static/.
"""
import os
import runpy
import shutil
import sys
import webbrowser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(os.environ.get('MERCAMELL_APP_SOURCE', ROOT / '_application')).resolve()
DEST = ROOT / '.runtime' / 'app'

for name in ('app.py', 'index.html'):
    if not (SOURCE / name).is_file():
        raise SystemExit(f'Arquivo {name} não encontrado em {SOURCE}. Rode npm run setup:app.')
if not (SOURCE / 'static' / 'app.js').is_file():
    raise SystemExit(f'Sem frontend em {SOURCE}/static. Rode npm run setup:app.')

if DEST.exists():
    shutil.rmtree(DEST)
DEST.mkdir(parents=True)
for name in ('app.py', 'index.html'):
    shutil.copy2(SOURCE / name, DEST / name)
shutil.copytree(SOURCE / 'static', DEST / 'static')

# O servidor só enxerga esta cópia. DB local do produto não é copiado.
webbrowser.open = lambda *args, **kwargs: False
sys.argv = [str(DEST / 'app.py'), '--demo']
print(f'[E2E] Aplicação copiada de {SOURCE} para {DEST}', flush=True)
print('[E2E] Porta exclusiva 8768, banco descartável em .runtime/app/dados', flush=True)
runpy.run_path(str(DEST / 'app.py'), run_name='__main__')