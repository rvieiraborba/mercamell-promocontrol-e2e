# Fluxo de trabalho

Usar somente a conta pessoal `rvieiraborba`. Nunca operar a conta profissional
`rafael-borba_LGGIT`.

| Branch | Origem | Destino do PR | Uso |
| --- | --- | --- | --- |
| main | — | — | Versão estável da automação |
| develop | main na criação inicial | main | Integração da próxima entrega |
| feature/descricao | develop | develop | Novos cenários e melhorias |
| fix/descricao | develop | develop | Correções dos testes |
| hotfix/descricao | main | main | Correção urgente da suíte estável |

Criar uma branch por mudança real, com nome em minúsculas e hífens.
Não criar branches vazias para correções futuras. Não fazer push direto nas
branches permanentes nem force push. Abrir PR com problema, mudança e validação.

Antes do PR: `npm ci`, `npm run typecheck` e `npm test` em ambiente descartável.
Registrar a referência e o SHA da aplicação usada, resultado, falhas e limitações.
Não ocultar falhas com skips ou aumento de retries sem investigar a causa.

Após validar em develop, promover para main por PR com merge commit.
Após hotfix em main, sincronizar main → develop por outro PR com merge commit.
Squash é opcional para feature/fix, mas não nas promoções e sincronizações.
Excluir somente branches temporárias já integradas; preservar main e develop.

Proteções ainda não ativadas: quando o proprietário decidir configurá-las,
exigir PR, check `e2e` aprovado e conversas resolvidas nas duas branches;
bloquear force push e exclusão. Para trabalho individual, manter zero aprovações
obrigatórias. Não exigir histórico linear, pois usamos merge commits.

Nunca publicar dados reais, bancos, backups, segredos ou relatórios de produção.
Os relatórios deste projeto devem conter somente dados fictícios.
