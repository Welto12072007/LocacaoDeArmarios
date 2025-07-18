# Sistema de Gestão de Armários (LockerSys)

Sistema completo para gestão de armários escolares/universitários com interface web moderna e backend robusto.

## 🚀 Tecnologias

### Frontend
- **React 18** com TypeScript
- **Tailwind CSS** para estilização
- **Lucide React** para ícones
- **Vite** como bundler

### Backend
- **Node.js** com Express
- **Supabase (PostgreSQL)** como banco de dados
- **JWT** para autenticação
- **bcryptjs** para hash de senhas

## 📋 Funcionalidades

- ✅ **Autenticação** - Login/logout com JWT
- ✅ **Dashboard** - Estatísticas e visão geral
- ✅ **Gestão de Alunos** - CRUD completo
- ✅ **Gestão de Armários** - CRUD completo
- ✅ **Gestão de Locações** - CRUD completo
- ✅ **Relatórios** - Estatísticas em tempo real

## 🛠️ Configuração

### 1. Pré-requisitos

- Node.js 18+
- Conta no Supabase (gratuita)
- npm ou yarn

### 2. Configuração do Banco de Dados

O projeto usa **Supabase** como backend-as-a-service. Configure as credenciais no arquivo `.env`:

```env
# Supabase Configuration
SUPABASE_URL=sua_url_do_supabase
SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role

# JWT Configuration
JWT_ACCESS_SECRET=sua_chave_secreta_jwt
JWT_REFRESH_SECRET=sua_chave_secreta_refresh

# Application Configuration
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
VITE_API_URL=http://localhost:3001/api
```

### 3. Instalação

```bash
# Instalar dependências
npm install

# Executar o servidor backend
npm run server

# Em outro terminal, executar o frontend
npm run dev
```

### 4. Primeiro Acesso

**Credenciais padrão:**
- Email: `admin@lockers.com`
- Senha: `admin123`

## 📁 Estrutura do Projeto

```
├── src/                    # Frontend React
│   ├── components/         # Componentes React
│   ├── contexts/          # Context API
│   ├── services/          # Serviços de API
│   └── types/             # Tipos TypeScript
├── server/                # Backend Node.js
│   ├── config/            # Configurações
│   ├── controllers/       # Controladores
│   ├── middleware/        # Middlewares
│   ├── models/           # Modelos de dados
│   └── routes/           # Rotas da API
├── database/             # Scripts SQL
└── .env                  # Variáveis de ambiente
```

## 🔧 Scripts Disponíveis

```bash
# Frontend
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build

# Backend
npm run server       # Servidor backend

# Ambos
npm start           # Inicia frontend e backend
```

## 📊 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `GET /api/auth/profile` - Perfil do usuário

### Dashboard
- `GET /api/dashboard/stats` - Estatísticas

### Alunos
- `GET /api/students` - Listar alunos
- `POST /api/students` - Criar aluno
- `GET /api/students/:id` - Buscar aluno
- `PUT /api/students/:id` - Atualizar aluno
- `DELETE /api/students/:id` - Excluir aluno

### Armários
- `GET /api/lockers` - Listar armários
- `POST /api/lockers` - Criar armário
- `GET /api/lockers/:id` - Buscar armário
- `PUT /api/lockers/:id` - Atualizar armário
- `DELETE /api/lockers/:id` - Excluir armário

### Locações
- `GET /api/rentals` - Listar locações
- `POST /api/rentals` - Criar locação
- `GET /api/rentals/:id` - Buscar locação
- `PUT /api/rentals/:id` - Atualizar locação
- `DELETE /api/rentals/:id` - Excluir locação

## 🔒 Segurança

- Autenticação JWT
- Senhas hasheadas com bcrypt
- Validação de dados
- Middleware de autenticação
- CORS configurado

## 🎨 Interface

- Design responsivo
- Tema moderno com Tailwind CSS
- Componentes reutilizáveis
- Feedback visual para ações
- Loading states
- Tratamento de erros

## 📈 Monitoramento

- Logs de erro
- Health check endpoint
- Estatísticas em tempo real
- Validação de dados

## 🚀 Deploy

### Frontend (Netlify/Vercel)
```bash
npm run build
# Upload da pasta dist/
```

### Backend (Railway/Heroku)
```bash
# Configure as variáveis de ambiente
# Deploy do código
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT.