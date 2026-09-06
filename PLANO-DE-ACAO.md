# Plano de ação — concluído

Os itens que este documento listava como em aberto foram entregues. O mapa
item da rubrica → arquivo está em `RESULTADO.md`, e o que falar na banca está em
`ROTEIRO-APRESENTACAO.md`.

Resumo do que entrou depois da primeira sprint:

| Item da rubrica | Nota | Onde |
|---|---|---|
| Stored Procedures com busca, filtro e paginação | 1,00 | `banco/07_procedures.sql` |
| Função no banco para reutilização de scripts | 0,50 | `banco/05_funcoes.sql` |
| View centralizando várias tabelas | 0,50 | `banco/06_view_ficha_peca.sql` |
| Template para diminuir o número de arquivos | 0,30 | `public/partes/` |
| Estrutura do projeto bem definida | 0,30 | `README.md`, seção 5 |
| 3 CRUDs completos | 1,30 | `api/*_salvar.php`, `api/*_excluir.php`, `src/cadastro.ts` |
| Regras de exclusão com mensagem clara | 0,50 | `api/*_excluir.php` |
| Modelagem de Dados e Contratos (TypeScript) | 0,50 | `src/tipos.ts` |
| Segmentação e Filtros de Negócio (filter) | 0,50 | `src/analises.ts` |
| Ranking e Frequência | 0,50 | `src/analises.ts` |
| Transformação e Formatação (map) | 0,50 | `src/analises.ts` |

---

## O que ficou de fora de propósito

Nada disso é exigido pela rubrica. Fica registrado como próximo passo honesto,
caso a banca pergunte "o que faltou".

- **Controle de concorrência.** Dois usuários salvando a mesma peça: o último
  vence. A coluna `atualizado_em` já existe e serviria de base.
- **Autenticação.** A dashboard é interna e não tem login.
- **`detalhe` na resposta de erro.** As rotas devolvem a mensagem crua do PDO no
  campo `detalhe`, o que ajuda muito a depurar mas expõe estrutura do banco. Em
  produção o certo é remover.
- **Bootstrap por CDN.** Sem internet a tela perde o acabamento visual, embora
  continue funcionando. Baixar o Bootstrap para dentro do projeto resolveria.
- **Tela de movimentação de estoque.** A procedure `sp_movimentar_estoque` já
  existe e está testada, mas ainda não tem botão na interface — a entrada e a
  baixa são feitas pelo campo de quantidade no cadastro da peça.
