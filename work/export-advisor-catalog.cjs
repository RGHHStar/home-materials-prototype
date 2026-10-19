// Export only the local data declarations; never execute browser application code.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const start = source.indexOf('const materials = [');
const end = source.indexOf('const identifyLocations = [');
if (start < 0 || end <= start) throw new Error('Cannot locate material declarations');
const data = JSON.parse(vm.runInNewContext(source.slice(start, end) + '\nJSON.stringify({insulation:materials,systems:planSystems})', Object.create(null), {timeout:2500}));
if (data.insulation.length !== 4 || data.systems.length < 10) throw new Error('Unexpected catalogue');
const output = '// Generated from app.js by node work/export-advisor-catalog.cjs.\nexport default ' + JSON.stringify(data, null, 2) + ';\n';
const target = path.join(root, 'functions', '_advisor', 'catalog.mjs');
if (process.argv.includes('--check')) {
  if (fs.readFileSync(target, 'utf8').replace(/\r\n/g,'\n') !== output) throw new Error('Advisor catalogue needs regeneration');
} else fs.writeFileSync(target, output);
console.log(`${data.systems.length} systems, ${data.systems.reduce((n,s)=>n+s.items.length,0)} options, ${data.insulation.length} detailed references`);
