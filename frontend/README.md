# eGerente Frontend

Interface do usuário para o sistema eGerente, desenvolvida com HTML, CSS e JavaScript.

## Requisitos

- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Backend rodando em `http://localhost:3000`

## Estrutura de arquivos

```
frontend/
├── Paginas_HTML/         # Páginas HTML
├── Paginas_JS/          # Scripts JavaScript
├── css/                 # Arquivos CSS
└── js/
    └── config/         # Configurações
```

## Páginas

- `index.html` - Página inicial
- `usuarios.html` - Gerenciamento de usuários
- `colaboradores.html` - Gerenciamento de colaboradores
- `clientes.html` - Gerenciamento de clientes
- `produtos.html` - Gerenciamento de produtos
- `locais.html` - Gerenciamento de locais

## Funcionalidades

- Listagem de registros
- Criação de novos registros
- Edição de registros existentes
- Exclusão de registros
- Filtros e busca
- Paginação

## Integração com o backend

O frontend se comunica com o backend através de uma API REST, utilizando o arquivo `js/config/api.js` para gerenciar as requisições.

## Estilização

- Bootstrap 5 para layout e componentes
- Font Awesome para ícones
- CSS personalizado para ajustes específicos

## Desenvolvimento

1. Clone o repositório
2. Abra o arquivo `index.html` em um servidor local
3. Certifique-se de que o backend está rodando em `http://localhost:3000`

## Produção

Para deploy em produção:

1. Configure a URL da API no arquivo `js/config/api.js`
2. Faça upload dos arquivos para seu servidor web
3. Certifique-se de que o backend está acessível 