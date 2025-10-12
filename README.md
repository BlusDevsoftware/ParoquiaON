# ParóquiaON

Sistema de gestão paroquial desenvolvido para gerenciar comunidades, pastorais, eventos e relatórios.

## 🚀 Tecnologias

### Frontend
- HTML5, CSS3, JavaScript
- Vite (build tool)
- Font Awesome (ícones)
- Supabase (autenticação)

### Backend
- Node.js/Express.js
- PostgreSQL
- Supabase

### Infraestrutura
- Vercel (deploy frontend)
- GitHub (controle de versão)

## 📋 Funcionalidades

- ✅ Gestão de Comunidades
- ✅ Gestão de Pastorais
- ✅ Gestão de Pilares
- ✅ Gestão de Locais
- ✅ Gestão de Ações
- ✅ Gestão de Pessoas
- ✅ Gestão de Usuários
- ✅ Gestão de Perfis
- ✅ Agenda de Eventos (Dia, Semana, Mês, Ano)
- ✅ Relatórios Dinâmicos
- ✅ Sistema de Autenticação
- ✅ Interface Responsiva

## 🛠️ Instalação

### Pré-requisitos
- Node.js 18+
- Python 3.9+
- PostgreSQL 14+
- Git

### Desenvolvimento Local

1. Clone o repositório:
```bash
git clone https://github.com/BlusDevsoftware/ParoquiaON.git
cd ParoquiaON
```

2. Configure o ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

3. Instale dependências do frontend:
```bash
cd frontend
npm install
```

4. Execute o projeto:
```bash
npm run dev
```

## 🚀 Deploy

### Deploy Automático na Vercel

O projeto está configurado para deploy automático na Vercel:

1. **Conecte o repositório à Vercel**:
   - Acesse https://vercel.com
   - Conecte sua conta GitHub
   - Importe o repositório `BlusDevsoftware/ParoquiaON`

2. **Configure as variáveis de ambiente**:
   - `VITE_SUPABASE_URL`: URL do seu projeto Supabase
   - `VITE_SUPABASE_ANON_KEY`: Chave anônima do Supabase
   - `VITE_API_URL`: URL da sua API

3. **Deploy**:
   - O deploy acontece automaticamente a cada push
   - Acesse a URL fornecida pela Vercel

### Deploy Manual

```bash
# Instalar Vercel CLI
npm install -g vercel

# Fazer login
vercel login

# Deploy
vercel --prod
```

## 📁 Estrutura do Projeto

```
ParoquiaON/
├── frontend/              # Interface do usuário
│   ├── src/
│   │   ├── *.html         # Páginas do sistema
│   │   ├── styles/        # Arquivos CSS
│   │   ├── scripts/       # Arquivos JavaScript
│   │   └── assets/        # Imagens e recursos
│   ├── package.json
│   └── vite.config.js
├── backend/               # APIs do sistema
│   ├── api-paroquiaon/   # API principal
│   └── gateway/          # Gateway (legado)
├── database/              # Scripts de banco de dados
├── docs/                  # Documentação
├── vercel.json            # Configuração da Vercel
├── package.json           # Configuração do projeto
└── README.md              # Este arquivo
```

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
VITE_API_URL=url_da_sua_api
```

### Banco de Dados

Execute os scripts SQL na pasta `database/` para criar as tabelas necessárias.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Equipe

- **Desenvolvimento**: BlueDev
- **Cliente**: Paróquia

## 📞 Suporte

Para suporte, entre em contato através de:
- Email: suporte@bluedev.com.br
- GitHub Issues: [Criar uma issue](https://github.com/BlusDevsoftware/ParoquiaON/issues)

## 🔗 Links Úteis

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [GitHub Repository](https://github.com/BlusDevsoftware/ParoquiaON)

---

**ParóquiaON** - Sistema de gestão paroquial moderno e eficiente.