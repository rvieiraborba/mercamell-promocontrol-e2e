# Homologação manual da versão 3.1

Executar em cópia separada, com dados fictícios; nunca na instalação real.
Registrar data, SHA da aplicação, versão do navegador e resultado de cada passo.

## Gravação — Chrome e Edge no Windows

1. Criar evento e compradores fictícios, registrar compras e congelar cadastro.
2. Iniciar gravação, selecionar a aba correta e autorizar áudio se disponível.
3. Sortear, recusar um ausente, confirmar ganhadores e exibir resultado final.
4. Finalizar e salvar; reproduzir o arquivo completo, conferir início/fim,
   imagem e áudio, duração e ausência de dados privados.
5. Repetir cancelando a autorização: a aplicação deve continuar utilizável.
6. Repetir encerrando o compartilhamento pelo navegador e conferir o arquivo.

## Exportação e restauração

1. Enviar JPG e PNG reais de objetos, conferir substituição e remoção.
2. Finalizar um sorteio e exportar PNG; conferir visualmente fotos, prêmios,
   nomes, apartamentos e números, sem telefone nem dados de compras.
3. Exportar backup fictício, restaurar em outra cópia temporária e verificar
   imagens, compras e resultados preservados.

## Limites da automação atual

Os testes automatizados verificam upload de PNG sintético, substituição,
remoção, rejeição de arquivo inválido, persistência ao recarregar, inclusão da
foto no backup, apartamentos no resumo HTML e assinatura do PNG exportado.
Não verificam visualmente os pixels do PNG, restauração completa do backup,
migração de bases antigas ou captura real de tela/áudio. Não registrar esses
itens como homologados apenas porque o CI passou.
