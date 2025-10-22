# Configuração do NocoDB

## Variáveis de Ambiente Necessárias

Configure as seguintes variáveis no painel do Netlify (Site settings > Environment variables):

### Obrigatórias:

- `NOCODB_BASE_URL` - URL base da sua instância NocoDB (ex: `https://seu-dominio.nocodb.com`)
- `NOCODB_TOKEN` - Token de API do NocoDB

### Opcionais (com valores padrão):

- `NOCODB_PROJECT` - Nome do projeto (padrão: `default`)
- `NOCODB_TABLE` - Nome da tabela (padrão: `leads`)

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

## Estrutura da Tabela

Certifique-se de que sua tabela tenha as seguintes colunas:

| Coluna        | Tipo     | Descrição              |
| ------------- | -------- | ---------------------- |
| `name`        | Text     | Nome do usuário        |
| `whatsapp`    | Text     | Número do WhatsApp     |
| `email`       | Email    | Email do usuário       |
| `luckyNumber` | Number   | Número da sorte gerado |
| `createdAt`   | DateTime | Data de criação        |

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
