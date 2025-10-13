const fs = require('fs');
const path = require('path');

// Criar diretório dist se não existir
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copiar arquivos HTML
const srcDir = path.join(__dirname, 'src');
const htmlFiles = fs.readdirSync(srcDir).filter(file => file.endsWith('.html'));

htmlFiles.forEach(file => {
  const srcPath = path.join(srcDir, file);
  const destPath = path.join(distDir, file);
  fs.copyFileSync(srcPath, destPath);
  console.log(`Copiado: ${file}`);
});

// Copiar diretórios
const dirsToCopy = ['assets', 'styles', 'scripts'];
dirsToCopy.forEach(dir => {
  const srcPath = path.join(srcDir, dir);
  const destPath = path.join(distDir, dir);
  
  if (fs.existsSync(srcPath)) {
    copyDir(srcPath, destPath);
    console.log(`Copiado diretório: ${dir}`);
  }
});

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const files = fs.readdirSync(src);
  files.forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

console.log('Build concluído!');
