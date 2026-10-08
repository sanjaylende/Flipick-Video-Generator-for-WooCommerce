#!/usr/bin/env node
// Builds dist/flipick-video-generator.zip with a top-level "flipick-video-generator/" folder, as WordPress expects.
// Pure Node (no zip binary, no dependencies) so it behaves the same on Windows, macOS and Linux CI.
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const root = path.resolve(__dirname, "..");
const EXCLUDE = new Set(["README.md", "dist", ".git", "bin", ".gitignore", ".gitattributes", "node_modules", ".DS_Store"]);
const TOP = "flipick-video-generator";

function walk(dir, rel = "") {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (EXCLUDE.has(e.name) && rel === "") return [];
    if (e.name === ".DS_Store") return [];
    const full = path.join(dir, e.name);
    const r = rel ? `${rel}/${e.name}` : e.name;
    return e.isDirectory() ? walk(full, r) : [{ full, name: `${TOP}/${r}` }];
  });
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

const files = walk(root).sort((a, b) => a.name.localeCompare(b.name));
const DOS_TIME = 0, DOS_DATE = (2024 - 1980) << 9 | 1 << 5 | 1; // fixed stamp: the same input gives the same zip
const parts = [];
const central = [];
let offset = 0;
for (const f of files) {
  const data = fs.readFileSync(f.full);
  const comp = zlib.deflateRawSync(data, { level: 9 });
  const name = Buffer.from(f.name, "utf8");
  const crc = crc32(data);
  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0x0800, 6); local.writeUInt16LE(8, 8);
  local.writeUInt16LE(DOS_TIME, 10); local.writeUInt16LE(DOS_DATE, 12); local.writeUInt32LE(crc, 14);
  local.writeUInt32LE(comp.length, 18); local.writeUInt32LE(data.length, 22); local.writeUInt16LE(name.length, 26);
  parts.push(local, name, comp);
  const cen = Buffer.alloc(46);
  cen.writeUInt32LE(0x02014b50, 0); cen.writeUInt16LE(20, 4); cen.writeUInt16LE(20, 6); cen.writeUInt16LE(0x0800, 8); cen.writeUInt16LE(8, 10);
  cen.writeUInt16LE(DOS_TIME, 12); cen.writeUInt16LE(DOS_DATE, 14); cen.writeUInt32LE(crc, 16);
  cen.writeUInt32LE(comp.length, 20); cen.writeUInt32LE(data.length, 24); cen.writeUInt16LE(name.length, 28); cen.writeUInt32LE(offset, 42);
  central.push(cen, name);
  offset += local.length + name.length + comp.length;
}
const centralBuf = Buffer.concat(central);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10);
end.writeUInt32LE(centralBuf.length, 12); end.writeUInt32LE(offset, 16);

fs.mkdirSync(path.join(root, "dist"), { recursive: true });
const out = path.join(root, "dist", `${TOP}.zip`);
fs.writeFileSync(out, Buffer.concat([...parts, centralBuf, end]));
console.log(`Built ${path.relative(process.cwd(), out) || out} (${files.length} files)`);
