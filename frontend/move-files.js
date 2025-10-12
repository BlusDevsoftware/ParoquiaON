const fs = require('fs');
const path = require('path');

// Função para criar diretório se não existir
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Função para copiar arquivo
function copyFile(source, target) {
  try {
    const stats = fs.statSync(source);
    if (stats.isDirectory()) {
      ensureDirectoryExists(target);
      const files = fs.readdirSync(source);
      files.forEach(file => {
        copyFile(
          path.join(source, file),
          path.join(target, file)
        );
      });
    } else {
      fs.copyFileSync(source, target);
    }
  } catch (error) {
    console.error(`Erro ao copiar ${source}: ${error.message}`);
  }
}

// Função para mover arquivos
function moveFiles() {
  // Mover arquivos HTML
  const htmlDir = 'Paginas_HTML';
  if (fs.existsSync(htmlDir)) {
    const htmlFiles = fs.readdirSync(htmlDir);
    htmlFiles.forEach(file => {
      copyFile(
        path.join(htmlDir, file),
        path.join('src', file)
      );
    });
  }

  // Mover arquivos CSS
  const cssDir = 'Paginas_CSS';
  if (fs.existsSync(cssDir)) {
    const cssFiles = fs.readdirSync(cssDir);
    cssFiles.forEach(file => {
      copyFile(
        path.join(cssDir, file),
        path.join('src/styles', file)
      );
    });
  }

  // Mover arquivos JS
  const jsDir = 'Paginas_JS';
  if (fs.existsSync(jsDir)) {
    const jsFiles = fs.readdirSync(jsDir);
    jsFiles.forEach(file => {
      copyFile(
        path.join(jsDir, file),
        path.join('src/scripts', file)
      );
    });
  }

  // Mover imagens
  const imagesDir = 'Imagens';
  if (fs.existsSync(imagesDir)) {
    const imageFiles = fs.readdirSync(imagesDir);
    imageFiles.forEach(file => {
      copyFile(
        path.join(imagesDir, file),
        path.join('src/assets/images', file)
      );
    });
  }

  // Mover ícones
  const iconsDir = 'Icones';
  if (fs.existsSync(iconsDir)) {
    const iconFiles = fs.readdirSync(iconsDir);
    iconFiles.forEach(file => {
      copyFile(
        path.join(iconsDir, file),
        path.join('src/assets/icons', file)
      );
    });
  }
}

// Criar diretórios necessários
ensureDirectoryExists('src');
ensureDirectoryExists('src/assets');
ensureDirectoryExists('src/assets/images');
ensureDirectoryExists('src/assets/icons');
ensureDirectoryExists('src/styles');
ensureDirectoryExists('src/scripts');

// Mover arquivos
moveFiles(); 