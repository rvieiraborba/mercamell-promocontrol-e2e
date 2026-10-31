import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const base = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const target = resolve(base, '_application');
const repo = 'https://github.com/rvieiraborba/mercamell-promocontrol.git';

function git(args) {
  execFileSync('git', args, { cwd: base, stdio: 'inherit' });
}

if (!existsSync(resolve(target, '.git'))) {
  mkdirSync(base, { recursive: true });
  console.log('Baixando uma cópia do código do produto para testes...');
  git(['clone', '--depth', '1', '--branch', 'main', repo, target]);
} else {
  console.log('Atualizando a cópia local do produto para a branch main...');
  git(['-C', target, 'fetch', '--depth', '1', 'origin', 'main']);
  git(['-C', target, 'checkout', 'main']);
  git(['-C', target, 'reset', '--hard', 'FETCH_HEAD']);
}
console.log('Produto disponível em:', target);