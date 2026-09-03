const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "app.js"), "utf8");
const start = source.indexOf("const planItem =");
const end = source.indexOf("const identifyLocations", start);
if (start < 0 || end < 0) throw new Error("Plan catalogue could not be located.");
const catalogue = Function(`${source.slice(start, end)}; return planSystems;`)();
const systemImages = {
  structural:"system-foundation.jpg", exterior:"system-exterior.jpg", insulation:"system-insulation.jpg", roofing:"system-roofing.jpg", windows:"system-windows.jpg", flooring:"system-flooring.jpg", paint:"system-paint.jpg", adhesives:"system-adhesives.jpg", sealants:"system-adhesives.jpg", waterproofing:"system-waterproofing.jpg", plumbing:"system-plumbing.jpg", lighting:"system-lighting.jpg", solar:"system-renewable.jpg"
};
const specialImages = { "insulation|Fibreglass":"fibreglass.jpg", "insulation|Mineral Wool":"mineral-wool.jpg", "insulation|Cellulose":"cellulose.jpg", "insulation|Spray Foam":"spray-foam.jpg" };
const slug = value => value.toLowerCase().replace(/&/g,"and").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const destination = path.join(root, "assets", "materials");
fs.mkdirSync(destination, { recursive: true });
let count = 0;
for (const system of catalogue) {
  for (const item of system.items) {
    const special = specialImages[`${system.id}|${item.en}`];
    const sourceFile = special ? path.join(root, "assets", special) : path.join(root, "assets", "plan", systemImages[system.id]);
    const destinationFile = path.join(destination, `${system.id}-${slug(item.en)}.jpg`);
    if (!fs.existsSync(destinationFile)) fs.copyFileSync(sourceFile, destinationFile);
    count += 1;
  }
}
console.log(`${count} material image files are ready.`);
