# Configuração do NocoDB e N8N

## Variáveis de Ambiente Necessárias

Configure as seguintes variáveis no painel do Netlify (Site settings > Environment variables):

### Obrigatórias:

- `NOCODB_BASE_URL` - URL base da sua instância NocoDB (ex: `https://seu-dominio.nocodb.com`)
- `NOCODB_TOKEN` - Token de API do NocoDB

### Opcionais (com valores padrão):

- `NOCODB_PROJECT` - Nome do projeto (padrão: `default`)
- `NOCODB_TABLE` - Nome da tabela (padrão: `leads`)
- `N8N_WEBHOOK_URL` - URL completa do webhook do N8N para envio de mensagens WhatsApp (opcional)

## Como obter as informações:

### 1. NOCODB_BASE_URL

- Acesse sua instância NocoDB
- Copie a URL base (ex: `https://seu-dominio.nocodb.com`)

### 2. NOCODB_TOKEN

- No NocoDB, vá em **Account Settings > API Tokens**
- Crie um novo token com permissões de escrita
- Copie o token gerado

### 3. NOCODB_PROJECT e NOCODB_TABLE

- Acesse sua tabela no NocoDB
- Na URL, você verá algo como: `/noco/projeto/tabela`
- Use esses valores ou deixe os padrões

### 4. N8N_WEBHOOK_URL

- No N8N, crie um workflow com um nó Webhook
- Configure o webhook para receber requisições POST
- Copie a URL completa do webhook (ex: `https://seu-n8n.com/webhook/abc123xyz`)
- Configure a variável `N8N_WEBHOOK_URL` no Netlify com essa URL
- O webhook receberá um payload JSON com `nome`, `whatsapp`, `email` e `numero_sorte`

## Integração com N8N

### Payload Enviado para N8N

Quando um cadastro é realizado com sucesso, o sistema envia automaticamente os seguintes dados para o webhook do N8N:

```json
{
  "nome": "Nome Completo do Cliente",
  "whatsapp": "81995076463",
  "email": "cliente@exemplo.com",
  "numero_sorte": "1234"
}
```

### Comportamento

- O envio para N8N acontece **apenas após** salvar com sucesso no NocoDB
- Se o N8N não estiver configurado ou falhar, o cadastro ainda será considerado bem-sucedido
- Timeout de 10 segundos para evitar travamento
- Logs detalhados são registrados para facilitar debug

### Configuração do Webhook no N8N

1. Crie um workflow no N8N
2. Adicione um nó **Webhook** como primeiro nó
3. Configure para receber requisições **POST**
4. Copie a URL do webhook gerada
5. Configure a variável `N8N_WEBHOOK_URL` no Netlify com essa URL
6. No workflow do N8N, use os campos `nome`, `whatsapp`, `email` e `numero_sorte` do payload recebido

## Estrutura da Tabela

Certifique-se de que sua tabela tenha as seguintes colunas:

| Coluna           | Tipo     | Descrição              |
| ---------------- | -------- | ---------------------- |
| `#`              | Number   | ID automático          |
| `usuario`        | Text     | Nome do usuário        |
| `whatsapp`       | Text     | Número do WhatsApp     |
| `email`          | Email    | Email do usuário       |
| `# numero_sorte` | Number   | Número da sorte gerado |
| `criado_em`      | DateTime | Data de criação        |

## Teste da Integração

Após configurar as variáveis:

1. Faça o deploy no Netlify
2. Teste o formulário
3. Verifique se os dados aparecem na tabela do NocoDB
4. Verifique os logs do Netlify para debug

## Troubleshooting

### Erro: "Configuração do banco de dados não encontrada"

- Verifique se as variáveis `NOCODB_BASE_URL` e `NOCODB_TOKEN` estão configuradas

### Erro: "Erro ao salvar no banco de dados"

- Verifique se o token tem permissões de escrita
- Verifique se a URL da API está correta
- Verifique se o projeto e tabela existem

### Dados não aparecem na tabela

- Verifique os logs do Netlify Functions
- Verifique se a estrutura da tabela está correta
- Teste a API do NocoDB diretamente
