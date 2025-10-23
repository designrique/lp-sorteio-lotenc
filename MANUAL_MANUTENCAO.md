# Manual de Manutenção - Loteria Encruzilhada

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Estrutura do Projeto](#estrutura-do-projeto)
3. [Configuração do Ambiente](#configuração-do-ambiente)
4. [Manutenção de Cores](#manutenção-de-cores)
5. [Manutenção de Conteúdo](#manutenção-de-conteúdo)
6. [Manutenção de Funcionalidades](#manutenção-de-funcionalidades)
7. [Integração com NocoDB](#integração-com-nocodb)
8. [Deploy e Publicação](#deploy-e-publicação)
9. [Troubleshooting](#troubleshooting)
10. [Contatos](#contatos)

---

## 🎯 Visão Geral

Este manual contém todas as informações necessárias para manter e atualizar a página da Loteria Encruzilhada. A aplicação é construída com React + TypeScript + Vite e deployada no Netlify.

### Tecnologias Utilizadas:
- **Frontend:** React 18, TypeScript, Tailwind CSS
- **Build:** Vite
- **Deploy:** Netlify
- **Banco de Dados:** NocoDB
- **Ícones:** Font Awesome 6.4.0

---

## 📁 Estrutura do Projeto

```
lp-sorteio-lotenc/
├── src/
│   ├── components/
│   │   ├── Layout.tsx              # Layout principal
│   │   ├── SubscriptionForm.tsx    # Formulário de cadastro
│   │   └── ResultSection.tsx       # Seção de resultado
│   ├── pages/
│   │   └── Index.tsx              # Página principal
│   ├── hooks/
│   │   └── use-scroll-observer.ts # Hook de scroll
│   ├── lib/
│   │   └── utils.ts               # Utilitários
│   └── main.css                   # Estilos globais
├── netlify/
│   └── functions/
│       └── add-lead.js            # Função serverless
├── public/
├── index.html
├── package.json
├── tailwind.config.ts
├── netlify.toml
└── NOCODB_SETUP.md
```

---

## ⚙️ Configuração do Ambiente

### Pré-requisitos:
- Node.js 22.21.0
- pnpm 10.19.0
- Conta Netlify
- Conta NocoDB

### Instalação Local:
```bash
# Clonar repositório
git clone [URL_DO_REPOSITORIO]

# Instalar dependências
pnpm install

# Executar em desenvolvimento
pnpm dev

# Build para produção
pnpm build
```

### Variáveis de Ambiente (Netlify):
Configure no painel do Netlify (Site settings > Environment variables):

```
NOCODB_BASE_URL=https://crm.loteriaencruzilhada.com.br
NOCODB_TOKEN=seu_token_aqui
NOCODB_PROJECT=pgs3stwhbnv3u0u
NOCODB_TABLE=mh713bcf1nlrupa
```

---

## 🎨 Manutenção de Cores

### Paleta Atual:
- **Amarelo Principal:** `#f5db17`
- **Azul Principal:** `#0065b6`
- **Azul Secundário:** `#2ac4ff`
- **Cinza Escuro:** `#333333`
- **Verde WhatsApp:** `#25D366`

### Como Alterar Cores:

#### 1. CSS Global (`src/main.css`):
```css
:root {
  --background: 55 100% 52%; /* #f5db17 */
  --primary: 200 100% 35%;   /* #0065b6 */
  --accent: 200 100% 60%;    /* #2ac4ff */
}
```

#### 2. Componentes (`src/pages/Index.tsx`):
```tsx
// Background principal
className="bg-[#f5db17]"

// Azul principal
className="bg-[#0065b6]"

// Azul secundário
className="bg-[#2ac4ff]"
```

### Checklist de Cores:
- [ ] Header (azul)
- [ ] Background principal (amarelo)
- [ ] Círculo com homem (azul)
- [ ] Moeda flutuante (amarelo)
- [ ] Features (amarelo com ícones azuis)
- [ ] Botão CTA (azul)
- [ ] Seção de informações (amarelo)

---

## 📝 Manutenção de Conteúdo

### Textos Principais:

#### 1. Título Principal (`src/pages/Index.tsx`):
```tsx
<h1 className="text-5xl lg:text-7xl font-bold text-[#333333] leading-tight">
  Aqui todo dia é dia de mudar de vida!
</h1>
```

#### 2. Subtítulo:
```tsx
<p className="text-xl lg:text-2xl text-[#333333] font-medium">
  Aqui Compre agora seu bolão e não perca essa oportunidade de mudar de vida!
</p>
```

#### 3. Botão CTA:
```tsx
<Button className="bg-[#0065b6] hover:bg-[#0065b6]/90 text-white">
  FALE AGORA
</Button>
```

#### 4. Features:
- Números únicos
- Prêmios incríveis
- Dinheiro fácil
- Grandes prêmios

### Como Alterar Conteúdo:
1. Abra `src/pages/Index.tsx`
2. Localize o texto desejado
3. Altere o conteúdo entre as tags
4. Salve e faça commit

---

## 🔧 Manutenção de Funcionalidades

### Formulário de Cadastro:

#### Arquivo: `src/components/SubscriptionForm.tsx`
- **Campos:** Nome, WhatsApp, Email
- **Validação:** Campos obrigatórios
- **Integração:** Netlify Function `add-lead`

#### Como Modificar:
1. Adicionar/remover campos
2. Alterar validações
3. Modificar estilos

### Geração de Números da Sorte:

#### Arquivo: `netlify/functions/add-lead.js`
```javascript
// Lógica atual: ID + 1000
const nextId = await getNextId()
const luckyNumber = nextId + 1000
```

#### Como Alterar:
1. Modificar fórmula de geração
2. Alterar faixa de números
3. Implementar outras regras

### Animações:

#### CSS (`src/main.css`):
```css
.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## 🗄️ Integração com NocoDB

### Configuração:

#### 1. Variáveis de Ambiente:
```
NOCODB_BASE_URL=https://crm.loteriaencruzilhada.com.br
NOCODB_TOKEN=seu_token_aqui
NOCODB_PROJECT=pgs3stwhbnv3u0u
NOCODB_TABLE=mh713bcf1nlrupa
```

#### 2. Estrutura da Tabela:
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `#` | Number | ID automático |
| `usuario` | Text | Nome do usuário |
| `whatsapp` | Text | Número do WhatsApp |
| `email` | Email | Email do usuário |
| `# numero_sorte` | Number | Número da sorte |
| `criado_em` | DateTime | Data de criação |

### Troubleshooting NocoDB:

#### Erro: "Configuração do banco de dados não encontrada"
- Verificar se `NOCODB_BASE_URL` e `NOCODB_TOKEN` estão configurados
- Verificar se o token tem permissões de escrita

#### Erro: "Erro ao salvar no banco de dados"
- Verificar se a URL da API está correta
- Verificar se o projeto e tabela existem
- Verificar permissões do token

#### Dados não aparecem na tabela:
- Verificar logs do Netlify Functions
- Verificar estrutura da tabela
- Testar API do NocoDB diretamente

---

## 🚀 Deploy e Publicação

### Deploy Automático:
- **Trigger:** Push para branch `main`
- **Build:** `pnpm run build`
- **Publish:** `dist/`
- **Functions:** `netlify/functions/`

### Deploy Manual:
```bash
# Build local
pnpm build

# Deploy via Netlify CLI
netlify deploy --prod
```

### Configuração Netlify (`netlify.toml`):
```toml
[build]
  command = "pnpm run build"
  publish = "dist"
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "22.21.0"
  PNPM_VERSION = "10.19.0"

[[plugins]]
  package = "@netlify/plugin-functions-install-core"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 🔍 Troubleshooting

### Problemas Comuns:

#### 1. Erro 502 Bad Gateway:
- **Causa:** Problema na função Netlify
- **Solução:** Verificar logs da função
- **Prevenção:** Testar função localmente

#### 2. CORS Error:
- **Causa:** Política de CORS
- **Solução:** Verificar headers na função
- **Prevenção:** Configurar CORS corretamente

#### 3. Formulário não envia:
- **Causa:** Erro na função ou validação
- **Solução:** Verificar logs e validações
- **Prevenção:** Testar formulário

#### 4. Números duplicados:
- **Causa:** Lógica de geração
- **Solução:** Verificar função `getNextId()`
- **Prevenção:** Implementar verificação de duplicatas

### Logs Importantes:

#### Netlify Functions:
```javascript
console.log('Dados recebidos:', { name, whatsapp, email })
console.log('Número da sorte:', luckyNumber)
console.log('Status NocoDB:', nocodbResponse.status)
```

#### NocoDB:
- Verificar se dados chegam corretamente
- Verificar se API responde
- Verificar permissões

---

## 📞 Contatos

### Desenvolvedor:
- **Email:** [seu-email@exemplo.com]
- **GitHub:** [seu-usuario-github]

### Suporte Técnico:
- **Netlify:** [URL do site]
- **NocoDB:** [URL da instância]

### Documentação:
- **Netlify Functions:** https://docs.netlify.com/functions/
- **NocoDB API:** https://docs.nocodb.com/
- **Tailwind CSS:** https://tailwindcss.com/docs

---

## 📋 Checklist de Manutenção

### Semanal:
- [ ] Verificar se formulário está funcionando
- [ ] Verificar se dados estão sendo salvos no NocoDB
- [ ] Verificar logs de erro
- [ ] Testar geração de números da sorte

### Mensal:
- [ ] Atualizar dependências
- [ ] Verificar performance
- [ ] Backup dos dados
- [ ] Revisar logs de erro

### Trimestral:
- [ ] Auditoria de segurança
- [ ] Otimização de performance
- [ ] Atualização de documentação
- [ ] Teste de backup e restore

---

## 🔄 Processo de Atualização

### 1. Preparação:
```bash
git pull origin main
pnpm install
```

### 2. Desenvolvimento:
```bash
pnpm dev
# Fazer alterações
```

### 3. Teste:
```bash
pnpm build
pnpm preview
```

### 4. Deploy:
```bash
git add .
git commit -m "feat: descrição da alteração"
git push origin main
```

### 5. Verificação:
- Verificar se deploy foi bem-sucedido
- Testar funcionalidades
- Verificar logs

---

**Última atualização:** [Data atual]
**Versão:** 1.0.0
**Responsável:** [Nome do responsável]
