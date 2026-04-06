# ParóquiaON API

API principal para o sistema ParóquiaON, voltada à gestão paroquial.

## 🚀 Tecnologias

- Node.js
- Express.js
- Supabase
- JWT (JSON Web Tokens)
- bcryptjs (hash de senhas)
- CORS
- Helmet (segurança)

## 📋 Funcionalidades

- ✅ Autenticação e autorização
- ✅ Gestão de usuários
- ✅ Gestão de perfis e permissões
- ✅ Gestão de pessoas
- ✅ Gestão de comunidades
- ✅ Gestão de pastorais
- ✅ Gestão de pilares
- ✅ Gestão de locais
- ✅ Gestão de ações
- ✅ Agenda de eventos
- ✅ Relatórios

## 🛠️ Instalação

### Pré-requisitos
- Node.js 18+
- Supabase account
- Git

### Configuração

1. Clone o repositório:
```bash
git clone https://github.com/BlusDevsoftware/ParoquiaON.git
cd ParoquiaON/backend/api-paroquiaon
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. Execute o projeto:
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 🔧 Configuração

### Variáveis de Ambiente

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key

# API
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# CORS (separadas por vírgula)
CORS_ORIGINS=https://paroquiaon.vercel.app,http://localhost:3000,http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
```

### Banco de Dados

Execute o script SQL na pasta `database/init.sql` para criar as tabelas necessárias.

## 📚 Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/verify` - Verificar token
- `POST /api/auth/change-password` - Alterar senha
- `POST /api/auth/reset-password/:id` - Resetar senha
- `POST /api/auth/logout` - Logout

### Cadastros Genéricos
- `GET /api/cadastros/:tabela` - Listar registros
- `GET /api/cadastros/:tabela/:id` - Buscar registro
- `POST /api/cadastros/:tabela` - Criar registro
- `PUT /api/cadastros/:tabela/:id` - Atualizar registro
- `DELETE /api/cadastros/:tabela/:id` - Excluir registro

### Tabelas Disponíveis
- `usuarios` - Usuários do sistema
- `perfis` - Perfis de acesso
- `pessoas` - Pessoas da paróquia
- `comunidades` - Comunidades paroquiais
- `pastorais` - Pastorais
- `pilares` - Pilares da paróquia
- `locais` - Locais e espaços
- `acoes` - Ações e atividades
- `eventos` - Eventos da agenda

## 🔐 Autenticação

A API usa JWT (JSON Web Tokens) para autenticação. Inclua o token no header:

```
Authorization: Bearer <token>
```

## 📊 Exemplos de Uso

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@paroquia.com", "senha": "senha123"}'
```

### Listar Comunidades
```bash
curl -X GET http://localhost:3000/api/cadastros/comunidades \
  -H "Authorization: Bearer <token>"
```

### Criar Usuário
```bash
curl -X POST http://localhost:3000/api/cadastros/usuarios \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@paroquia.com", "login": "user", "senha": "senha123", "perfil_id": 1, "pessoa_id": 1}'
```

## 🚀 Deploy

### Vercel
```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Heroku
```bash
# Instalar Heroku CLI
# Criar app
heroku create paroquiaon-api

# Configurar variáveis
heroku config:set SUPABASE_URL=your-url
heroku config:set SUPABASE_KEY=your-key

# Deploy
git push heroku main
```

## 🔍 Monitoramento

### Health Check
```bash
curl http://localhost:3000/health
```

### API Info
```bash
curl http://localhost:3000/api/info
```

## 🛡️ Segurança

- Rate limiting (1000 req/15min)
- CORS configurado para domínios ParoquiaON
- Helmet para headers de segurança
- Validação de senhas com requisitos de força
- Hash de senhas com bcrypt (12 rounds)
- JWT com expiração (24h)
- Middleware de validação de dados
- Sanitização automática de dados
- Tratamento de erros padronizado

## 📝 Logs

A API registra todas as requisições e erros no console. Em produção, configure um sistema de logs adequado.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 📞 Suporte

Para suporte, entre em contato através de:
- Email: suporte@bluedev.com.br
- GitHub Issues: [Criar uma issue](https://github.com/BlusDevsoftware/ParoquiaON/issues)

---

**ParóquiaON API** - Sistema de gestão paroquial moderno e seguro.
