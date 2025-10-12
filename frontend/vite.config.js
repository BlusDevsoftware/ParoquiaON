import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        usuarios: resolve(__dirname, 'src/usuarios.html'),
        colaboradores: resolve(__dirname, 'src/colaboradores.html'),
        clientes: resolve(__dirname, 'src/clientes.html'),
        produtos: resolve(__dirname, 'src/produtos.html'),
        locais: resolve(__dirname, 'src/locais.html'),
        acoes: resolve(__dirname, 'src/acoes.html'),
        pessoas: resolve(__dirname, 'src/pessoas.html'),
        usuarios: resolve(__dirname, 'src/usuarios.html'),
        perfil: resolve(__dirname, 'src/perfil.html'),
        comissoes: resolve(__dirname, 'src/comissoes.html'),
        recebimento: resolve(__dirname, 'src/recebimento.html'),
        conferencia: resolve(__dirname, 'src/conferencia.html'),
        dinamico: resolve(__dirname, 'src/dinamico.html'),
        manutencaoBd: resolve(__dirname, 'src/manutencao-bd.html'),
        sincronizar: resolve(__dirname, 'src/sincronizar.html')
      }
    }
  },
  server: {
    port: 3000,
    open: true
  },
  css: {
    devSourcemap: true
  }
}); 