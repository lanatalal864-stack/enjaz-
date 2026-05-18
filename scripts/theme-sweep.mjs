// Sweeps all .tsx files under src/ replacing hardcoded `[#0313bc]` arbitrary
// Tailwind values with `[--theme-primary]` so they pick up the runtime CSS
// variable set by AppContext.
import fs from "node:fs";
import path from "node:path";

const exts = new Set([".tsx", ".ts"]);
const skipDirs = new Set(["node_modules", "dist", "build", ".git", "scripts", "data"]);

function walk(dir, list = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skipDirs.has(ent.name)) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, list);
    else if (exts.has(path.extname(ent.name))) list.push(p);
  }
  return list;
}

const root = path.resolve(process.cwd(), "src");
const files = walk(root).filter((f) => !/[\\\/](AppCore\.tsx|shared[\\\/]constants\.ts)$/.test(f));

let totalReplacements = 0;
let filesChanged = 0;

for (const file of files) {
  const before = fs.readFileSync(file, "utf8");
  let after = before;

  // Tailwind arbitrary values referencing #0313bc, with optional opacity modifier.
  // Examples replaced:
  //   text-[#0313bc]            -> text-[--theme-primary]
  //   bg-[#0313bc]/5            -> bg-[--theme-primary]/5
  //   border-[#0313bc]/10       -> border-[--theme-primary]/10
  //   ring-[#0313bc]/20         -> ring-[--theme-primary]/20
  //   from-[#0313bc]            -> from-[--theme-primary]
  //   shadow-[0_20px_50px_rgba(3,19,188,0.1)] is left alone (different shape).
  after = after.replace(/\[#0313bc\]/g, "[--theme-primary]");

  if (after !== before) {
    fs.writeFileSync(file, after, "utf8");
    const count = (before.match(/\[#0313bc\]/g) || []).length;
    totalReplacements += count;
    filesChanged += 1;
    console.log(`updated ${path.relative(process.cwd(), file)} (${count} replacements)`);
  }
}

console.log(`\nfiles changed: ${filesChanged}`);
console.log(`total replacements: ${totalReplacements}`);
