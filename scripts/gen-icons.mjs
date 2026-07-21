import { mkdir, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const sharp = require('sharp')

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.resolve(__dirname, '../public/icons')

const gradient = (id) => `
  <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#ff4d9a" />
    <stop offset="50%" stop-color="#ff6a4d" />
    <stop offset="100%" stop-color="#ffb03a" />
  </linearGradient>`

// Rounded-square icon (purpose: any)
const roundedSvg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>${gradient('g')}</defs>
  <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="url(#g)" />
  <text x="50%" y="50%" dy="0.02em" text-anchor="middle" dominant-baseline="central"
    font-family="Arial, Helvetica, sans-serif" font-weight="800"
    font-size="${size * 0.42}" fill="#ffffff">me</text>
</svg>`

// Maskable icon: full-bleed background, glyph inside safe zone (~66%)
const maskableSvg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>${gradient('g')}</defs>
  <rect width="${size}" height="${size}" fill="url(#g)" />
  <text x="50%" y="50%" dy="0.02em" text-anchor="middle" dominant-baseline="central"
    font-family="Arial, Helvetica, sans-serif" font-weight="800"
    font-size="${size * 0.34}" fill="#ffffff">me</text>
</svg>`

const targets = [
  { name: 'icon-192.png', svg: roundedSvg(192) },
  { name: 'icon-512.png', svg: roundedSvg(512) },
  { name: 'icon-maskable-512.png', svg: maskableSvg(512) },
  { name: 'apple-touch-icon.png', svg: roundedSvg(180) },
]

await mkdir(outDir, { recursive: true })
for (const t of targets) {
  const png = await sharp(Buffer.from(t.svg)).png().toBuffer()
  await writeFile(path.join(outDir, t.name), png)
  console.log('wrote', path.join('public/icons', t.name))
}
