import fs from "fs";
import path from "path";

const ROOT = path.resolve(process.cwd(), "src");
const DIRS = ["components", "routes", "pages", "lib", "types"];

// fichiers visés
const exts = new Set([".ts", ".tsx", ".js", ".jsx"]);
const files = [];
function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p);
    else if (exts.has(path.extname(p))) files.push(p);
  }
}
walk(ROOT);

// réécriture
const IMPORT_RE = /(from\s+['"])([^'"]+)(['"])/g;

let changed = 0;
for (const file of files) {
  const src = fs.readFileSync(file, "utf8");
  let out = src;
  out = out.replace(IMPORT_RE, (m, a, spec, b) => {
    // on ne touche que les imports relatifs parent (../)
    if (!spec.startsWith("..")) return m;
    // normalise ./../../components/Button -> segments
    const clean = spec.replace(/\\/g, "/");
    for (const d of DIRS) {
      const idx = clean.indexOf(`/${d}/`);
      if (idx !== -1) {
        // on remplace tout ce qu'il y a avant /<dir>/ par @
        const after = clean.slice(idx + 1); // retire le premier "/"
        return `${a}@/${after}${b}`;
      }
    }
    return m;
  });
  if (out !== src) {
    fs.writeFileSync(file, out, "utf8");
    changed++;
  }
}
console.log(`✅ Aliasisation terminée. Fichiers modifiés: ${changed}`);
