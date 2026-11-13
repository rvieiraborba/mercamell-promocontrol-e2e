import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const base = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const target = resolve(base, '_application');
const repo = 'https://github.com/rvieiraborba/mercamell-promocontrol.git';
const ref = process.env.MERCAMELL_APP_REF || 'main';
if (!/^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(ref)) throw new Error('MERCAMELL_APP_REF inválida.');

function git(args) {
  execFileSync('git', args, { cwd: base, stdio: 'inherit' });
}

if (!existsSync(resolve(target, '.git'))) {
  mkdirSync(base, { recursive: true });
  console.log('Baixando uma cópia do código do produto para testes...');
  git(['clone', '--no-checkout', repo, target]);
} else {
  const actual = execFileSync('git', ['-C', target, 'remote', 'get-url', 'origin'], { encoding: 'utf8' }).trim();
  if (actual !== repo) throw new Error('A cópia _application pertence a outro repositório; atualização recusada.');
  const dirty = execFileSync('git', ['-C', target, 'status', '--porcelain'], { encoding: 'utf8' }).trim();
  if (dirty) throw new Error('Há alterações locais em _application. Preserve-as antes de atualizar.');
}
console.log('Preparando referência da aplicação:', ref);
git(['-C', target, 'fetch', 'origin', ref]);
git(['-C', target, 'checkout', '--detach', 'FETCH_HEAD']);
git(['-C', target, 'rev-parse', 'HEAD']);
console.log('Produto disponível em:', target);
