const fs = require('fs');
const path = require('path');

async function main() {
  const jimpModule = require('jimp');
  const Jimp = jimpModule.Jimp || jimpModule;
  
  const imagesDir = path.join(__dirname, 'src', 'assets', 'images');
  if (!fs.existsSync(imagesDir)) {
    console.error('Diretório de imagens não existe!');
    process.exit(1);
  }
  
  const files = fs.readdirSync(imagesDir);
  const logoFiles = files
    .filter(file => file.startsWith('hud_devs_official_logo_') && file.endsWith('.jpg'))
    .map(file => path.join(imagesDir, file));
  
  if (logoFiles.length === 0) {
    console.error('Nenhum arquivo de logo JPG encontrado!');
    process.exit(1);
  }
  
  // Sort and pick latest
  logoFiles.sort();
  const latestJpg = logoFiles[logoFiles.length - 1];
  console.log('Convertendo imagem:', latestJpg);
  
  const publicDir = path.join(__dirname, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  // Load the image
  const image = await Jimp.read(latestJpg);
  
  // Save as high quality PNG icon.png (original size)
  await image.write(path.join(publicDir, 'icon.png'));
  console.log('Salvo public/icon.png');
  
  // Save 512x512
  const clone512 = image.clone().resize({ w: 512, h: 512 });
  await clone512.write(path.join(publicDir, 'icon-512.png'));
  console.log('Salvo public/icon-512.png');
  
  // Save 192x192
  const clone192 = image.clone().resize({ w: 192, h: 192 });
  await clone192.write(path.join(publicDir, 'icon-192.png'));
  console.log('Salvo public/icon-192.png');
  
  console.log('Todas as imagens PNG criadas com sucesso!');
}

main().catch(err => {
  console.error('Erro na conversão:', err);
  process.exit(1);
});
