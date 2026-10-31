# Mercamell PromoControl — Automação E2E

Automação **separada do repositório da aplicação**, desenvolvida com **Playwright + TypeScript**.

- **Aplicação:** https://github.com/rvieiraborba/mercamell-promocontrol
- **Testes:** `mercamell-promocontrol-e2e` (este repositório)

## Segurança dos dados

**Os testes não usam a base real de compradores** nem a base de demonstração do usuário.

Ao iniciar, `scripts/start_test_server.py` **copia apenas** `app.py`, `index.html` e `static/` da aplicação para a pasta temporária `.runtime/app`, ignorando totalmente `dados/`. Em seguida, inicia essa cópia com `--demo` em `127.0.0.1:8768` e gera um banco descartável em `.runtime/app/dados`.

A porta 8768 deve estar livre. Se o modo de demonstração estiver aberto, feche-o antes de executar os testes. O Playwright **não reutiliza servidores já abertos** para evitar atingir a base de demonstração do usuário.

## Requisitos

- Windows 10/11, Linux ou macOS;
- Python 3.9+ no PATH (`py -3` no Windows ou `python3` no Linux/macOS);
- Node.js 20+ e NPM;
- Git.

## Instalação (primeira vez)

```bash
npm install
npm run setup:app
npx playwright install chromium
```

> `npm run setup:app` baixa ou atualiza o código da aplicação pública para `_application/`, sem dados de compradores. Por padrão os testes usam a branch `main`.

## Executando os testes

```bash
npm test
npm run test:headed
npm run test:ui
npm run test:report
npm run typecheck
```

No Windows, `npm run test:headed` abre o navegador; `npm run test:ui` mostra o painel visual do Playwright.

Se Python não estiver localizado automaticamente, defina a variável `PYTHON_CMD` para o executável correto.

Para testar outra cópia de código já disponível, defina `MERCAMELL_APP_SOURCE` com o caminho da pasta que contém `app.py`. **Somente código é copiado, não o conteúdo de `dados/`.**

## Cenários incluídos

| Cenário | Descrição |
|---|---|
| CT01 | Criar evento com faixas personalizadas |
| CT02 | Regras independentes entre eventos |
| CT03 | Cadastrar morador, apartamento e observações |
| CT04 | ID de transação com mais de 8 caracteres e zeros à esquerda |
| CT05 | Impedir duplicidade de ID da transação |
| CT06 | Acumular compras por pessoa |
| CT07–CT09 | Faixas de compra, bônus de degustação e limite de números |
| CT10–CT11/CT13 | Congelar, selecionar elegível, confirmar e impedir prêmios duplicados |
| CT12 | Resortear por ausência sem repetir morador recusado |
| CT14 | Cancelar apuração preservando compradores e compras |
| CT15 | Exportar imagem PNG dos três vencedores |

Os testes validam **regras e invariantes**, nunca um número pré-definido. O sorteio é aleatório, e a suíte verifica se o sorteado pertence ao conjunto elegível e está corretamente vinculado ao participante.

## GitHub Actions

O workflow `.github/workflows/playwright.yml` faz checkout **dos dois repositórios**, instala Node/Python/Chromium, executa TypeScript e Playwright e anexa relatórios para download. A aplicação precisa permanecer acessível ao workflow (atualmente é pública). Para deixá-la privada futuramente, o workflow precisará de credencial de leitura com permissões mínimas.

Os testes E2E rodam após commits neste repositório e manualmente por `workflow_dispatch`. **Alterar a aplicação não dispara automaticamente este workflow** — isso exigiria um gatilho explícito, que pode ser configurado depois.

## Observação

Este repositório contém testes de qualidade de software. Não certifica a aleatoriedade estatística nem a conformidade legal do método promocional; a apuração deve seguir as regras aprovadas da campanha.