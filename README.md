# eGerente

Sistema de gerenciamento para empresas de serviços, desenvolvido com Node.js, Express e Supabase.

## Estrutura do projeto

```
.
├── backend/
│   └── gateway/         # API Gateway
├── frontend/           # Interface do usuário
└── README.md
```

## Requisitos

- Node.js 18 ou superior
- Conta no Supabase
- PostgreSQL
- Navegador moderno

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/egerente.git
cd egerente
```

2. Configure o backend:
```bash
cd backend/gateway
npm install
cp .env.example .env
# Edite o arquivo .env com suas credenciais do Supabase
```

3. Configure o frontend:
```bash
cd ../../frontend
# Abra o arquivo js/config/api.js e configure a URL da API
```

## Executando o projeto

1. Inicie o backend:
```bash
cd backend/gateway
npm run dev
```

2. Abra o frontend:
- Abra o arquivo `frontend/index.html` em um servidor local
- Ou use uma extensão como Live Server no VS Code

## Funcionalidades

- Gerenciamento de usuários
- Gerenciamento de colaboradores
- Gerenciamento de clientes
- Gerenciamento de produtos
- Gerenciamento de serviços

## Tecnologias utilizadas

### Backend
- Node.js
- Express
- Supabase
- PostgreSQL

### Frontend
- HTML5
- CSS3
- JavaScript
- Bootstrap 5
- Font Awesome

## Segurança

- CORS habilitado
- Rate limiting
- Helmet para headers de segurança
- Autenticação via Supabase

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para mais detalhes. 