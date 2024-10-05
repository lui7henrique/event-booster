### Geral

- [x] **Configuração do `.env`**

  - [x] Ajustar o arquivo `.env.test` para apontar para um banco de dados de teste, separado do ambiente de desenvolvimento (DEV).
  - [x] Adicionar um arquivo `.env.example` para facilitar o setup do projeto.

- [x] **Redis**
  - [x] Substituir a imagem atual do Redis no Docker Compose pela imagem da Bitnami, que permite a configuração de senha.

### Rotas / HTTP

- [ ] **Melhorar a Tipagem**

  - [ ] Usar o pacote `fastify-type-provider-zod` para facilitar a validação de entrada e saída nas rotas, reduzindo a necessidade de escrever manualmente as propriedades para o Swagger.

- [ ] **Refatorar Funções**

  - [x] Alterar o padrão `await login({ body })` para que os parâmetros sejam passados individualmente, melhorando a legibilidade e compreensão do código.

- [ ] **JWT Tipagem**

  - [ ] Criar o arquivo `src/@types/fastify.d.ts` e adicionar a tipagem personalizada para o Fastify JWT:
    ```typescript
    import "@fastify/jwt";
    declare module "@fastify/jwt" {
      export interface FastifyJWT {
        user: {
          host_id: string;
        };
      }
    }
    ```

- [ ] **Renomear Rota**

  - [ ] Renomear a rota `incrementReferralLinkCountRoute` para algo mais claro, como `incrementReferralLinkClickCountRoute`, já que o propósito é registrar cliques no link, não aumentar contagens de indicação.

- [ ] **Redis na Camada Correta**

  - [ ] Mover a lógica de acesso ao Redis da camada HTTP para as funções, como é feito com o banco de dados. Isso ajuda a manter a coesão e clareza no código.

- [ ] **Correção no Retorno**
  - [ ] Na rota `getEventRankings`, revisar o retorno, pois atualmente está salvando e retornando `referralLinks`, mas a função deveria retornar rankings.

### Funções

- [ ] **Correções de Nome de Variáveis**

  - [ ] Substituir `const [_]` por `const [host]`, para maior clareza no código.

- [ ] **Tratamento de Erros**

  - [ ] Refatorar o `catch` global da função `register-host` para capturar erros específicos, como erros de hash ou Postgres, evitando capturar todos os erros como `HostEmailAlreadyRegisteredError`.

- [ ] **Renomear Variável**

  - [ ] Na função `register-event`, renomear `isInvalidRangeDate` para algo mais descritivo, que indique a comparação de início e fim de datas.

- [ ] **Manipulação de Datas**

  - [ ] Mover a conversão de strings para datas para a camada de rotas, e passar as datas diretamente como objetos nas funções.

- [ ] **Evitar `catch` Global**

  - [ ] Não usar `ServerError` como um `catch` global. O handler global já captura erros desconhecidos. Trate os erros conhecidos com `makeLeft`.

- [ ] **Otimização da Query de Login**

  - [ ] Remover o uso de `.limit(1)` na função de login, já que o e-mail é único.

- [ ] **Melhorar Testes**

  - [ ] No login, evite retornar o mesmo erro para e-mail e senha. Isso prejudica os testes ao dificultar a validação se o erro é realmente o esperado.

- [ ] **Consistência de Variáveis**

  - [ ] Manter um padrão de nomeação de variáveis internas (camelCase, kebab-case, etc.), independente de como os dados são enviados/recebidos pelo front-end.

- [ ] **Uso de `count` no Drizzle**

  - [ ] Na função `get-event-ranking`, usar o método `count` do Drizzle para calcular `subscription_count`:
    ```typescript
    subscription_count: count(schema.subscriptions.id);
    ```

- [ ] **Remover `execute()` Desnecessário**

  - [ ] Verificar se o uso de `.execute()` no final da query é realmente necessário e remover se não for.

- [ ] **Uso do `mapWith` no Drizzle**

  - [ ] Evitar o uso de `Number(link.subscription_count)` e usar o `.mapWith` do Drizzle para a conversão de valores:
    ```typescript
    subscription_count: sql < number > "COUNT()".mapWith(Number);
    ```

- [ ] **Otimizar Filtro no SQL**

  - [ ] Mover o filtro de datas feito em JavaScript para o SQL, na função `get-event-ranking`, para melhorar a performance.

- [ ] **Unir Queries na Função `register-subscription`**

  - [ ] Na função `register-subscription`, unificar a lógica de verificação da `subscription` e obtenção do evento em uma única query usando `leftJoin`.

- [ ] **Evitar Ifs Aninhados**

  - [ ] Refatorar o código aninhado na função `register-subscription`. Retornar erro imediatamente quando `isValidDate` for falso.

- [ ] **Relacionamento entre `referral` e `subscription`**

  - [ ] Considerar adicionar um campo `subscription_id` na tabela `referral`, pois a criação de um referral geralmente está associada a uma subscription.

- [ ] **Eliminar Redundâncias**

  - [ ] Unificar a inserção da `subscription`, movendo a lógica de inserção de `referral_link_id` para uma única variável, eliminando a repetição de código.

- [ ] **Otimizar a Função `updateSubscriptionCount`**

  - [ ] Simplificar a função `updateSubscriptionCount` para uma única query:
    ```typescript
    await db
      .update(schema.referral)
      .set({ subscription_count: sql`${subscriptionCount.count} + 1` })
      .where(eq(schema.referral.id, referralLinkId));
    ```

- [ ] **Centralizar Funções**

  - [ ] Revisar a motivação de separar a função `updateSubscriptionCount` em um arquivo à parte, especialmente se ela não é utilizada em vários lugares.

- [ ] **Melhorar `COALESCE` no Banco**

  - [ ] Inicializar o valor da coluna `click_count` como 0 no banco, para evitar o uso desnecessário de `COALESCE`.

- [ ] **Verificação Desnecessária de `event_id`**

  - [ ] Na função `increment-referral-link-click-count`, remover o check desnecessário de `event_id`, já que o token deveria ser único.

- [ ] **Adicionar Índice no Token**
  - [ ] Adicionar um índice (ou `unique`) ao campo `token` para otimizar as queries.

### Desafio

- [ ] **Solução Alternativa para Tracking de Referrals**
  - [ ] Considerar uma solução alternativa para contabilizar referrals sem modificar a landing page do cliente, caso o sistema não tenha acesso a ela.
