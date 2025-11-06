# R4 Academy - AI Studio App

Plataforma completa de IA com múltiplos agentes (Chat, Geração de Imagens, Análise, Vídeos e Especialista em Prompts), autenticação, sistema de assinaturas e gerenciamento de cursos.

View your app in AI Studio: https://ai.studio/apps/drive/16b5ElGbSprtdan1jbs4RNGAE78kxil0q

## 🚀 Funcionalidades

- **5 Agentes de IA Poderosos**:
  - 💬 Chat com Gemini - Conversação inteligente com IA
  - 🎨 Gerador de Criativos - Criação e edição de imagens
  - 🔍 Analisador de Imagens - Análise visual detalhada
  - 🎬 Gerador de Vídeos - Criação de vídeos com IA
  - ✨ Especialista em Prompts - Otimização de prompts

- **Sistema Completo**:
  - Autenticação segura (JWT + bcrypt)
  - Sistema de assinaturas integrado
  - Gerenciamento de cursos e aulas
  - Rastreamento de progresso do usuário
  - Histórico de chat salvo no banco de dados

## ⚙️ Configuração

### 1. Instalar Dependências

```bash
# Frontend
npm install

# Backend
cd server && npm install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:

```env
# Google AI (Gemini) - Obrigatório
GOOGLE_API_KEY=sua_chave_aqui

# OpenAI (Fallback) - Opcional mas recomendado
OPENAI_API_KEY=sua_chave_aqui

# Pagamentos (Opcional)
CAKTO_PRODUCT_ID=seu_produto_id
CAKTO_WEBHOOK_SECRET=seu_webhook_secret
```

**Como obter as chaves de API:**

- **Google AI (Gemini)**: https://aistudio.google.com/apikey (Gratuito!)
- **OpenAI**: https://platform.openai.com/api-keys

### 3. Iniciar o Projeto

```bash
# Terminal 1: Backend (porta 3000)
cd server && npm run dev

# Terminal 2: Frontend (porta 5000)
npm run dev
```

Acesse: `http://localhost:5000`

## 🛠️ Stack Tecnológico

### Frontend
- React 19.2.0 + TypeScript
- Vite 6.2.0
- TailwindCSS

### Backend
- Node.js + Express
- SQLite (Better-SQLite3)
- Google GenAI (@google/genai v1.28)
- OpenAI (fallback)

### Segurança
- JWT para autenticação
- Bcrypt para senhas
- Chaves de API protegidas no backend
- Webhook signature verification

## 🔐 Segurança

**IMPORTANTE**: 
- As chaves de API nunca são expostas no frontend
- Todas as chamadas de IA passam pelo backend
- Senhas são hasheadas com bcrypt
- JWT tokens para autenticação segura
- Nunca comite o arquivo `.env` no Git (já está no .gitignore)

## 📝 Usuário de Teste

Email: `teste@gmail.com`  
Role: Admin (configurado automaticamente)

## 📚 Documentação Adicional

Veja `replit.md` para detalhes técnicos completos da arquitetura.

---

**Desenvolvido com ❤️ usando React + Google Gemini + OpenAI**
