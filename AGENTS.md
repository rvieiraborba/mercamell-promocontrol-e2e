# Orientações para agentes

- Usar exclusivamente a conta pessoal rvieiraborba e este repositório E2E.
- Seguir CONTRIBUTING.md: feature/fix a partir de develop; hotfix a partir de main.
- Criar branch por mudança concreta e propor PR. Nunca criar branches vazias,
  fazer push direto em main/develop ou reescrever histórico compartilhado.
- Não alterar o código do produto para fazer os testes passarem sem autorização.
- Executar somente a cópia temporária iniciada por scripts/start_test_server.py;
  nunca reutilizar servidor existente, banco real ou demo habitual do usuário.
- Não versionar relatórios, bancos, backups reais ou segredos.
- Distinguir testes executados, cenários planejados e validação manual pendente.
