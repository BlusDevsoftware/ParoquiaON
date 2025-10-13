import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: 'src',
  base: './',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    esbuild: {
      target: 'es2015'
    },
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        comunidades: resolve(__dirname, 'src/comunidades.html'),
        pastorais: resolve(__dirname, 'src/pastorais.html'),
        pilares: resolve(__dirname, 'src/pilares.html'),
        locais: resolve(__dirname, 'src/locais.html'),
        acoes: resolve(__dirname, 'src/acoes.html'),
        pessoas: resolve(__dirname, 'src/pessoas.html'),
        usuarios: resolve(__dirname, 'src/usuarios.html'),
        perfil: resolve(__dirname, 'src/perfil.html'),
        agenda: resolve(__dirname, 'src/agenda.html'),
        recebimento: resolve(__dirname, 'src/recebimento.html'),
        conferencia: resolve(__dirname, 'src/conferencia.html'),
        dinamico: resolve(__dirname, 'src/dinamico.html'),
        manutencaoBd: resolve(__dirname, 'src/manutencao-bd.html'),
        sincronizar: resolve(__dirname, 'src/sincronizar.html'),
        login: resolve(__dirname, 'src/login.html')
      }
    }
  },
  assetsInclude: ['**/*.js'],
  optimizeDeps: {
    exclude: ['**/scripts/**']
  },
  server: {
    port: 3000,
    open: true
  },
  preview: {
    port: 4173,
    open: true
  }
})