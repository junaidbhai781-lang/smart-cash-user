/* Game ka 3D engine (three.js) app ke andar rakhta hai taaki game internet/CDN ke bina turant load ho.
   npm install ke baad apne aap chalta hai. Fail ho to build nahi rukta (game CDN se chalega). */
const fs = require('fs'), path = require('path');
try {
  const src = path.join(__dirname, 'node_modules', 'three', 'build', 'three.module.min.js');
  fs.mkdirSync(path.join(__dirname, 'www'), { recursive: true });
  fs.copyFileSync(src, path.join(__dirname, 'www', 'three.module.min.js'));
  console.log('three.module.min.js -> www/ (' + fs.statSync(src).size + ' bytes)');
} catch (e) { console.warn('copy-three: skipped -', e.message); }
