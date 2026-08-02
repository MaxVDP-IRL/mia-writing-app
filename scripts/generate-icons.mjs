import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

mkdirSync('public', { recursive: true })

const svg = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="96" fill="#ffb84d"/>
  <text x="256" y="330" font-family="Georgia, serif" font-size="300" font-style="italic"
        text-anchor="middle" fill="#fff">m</text>
</svg>
`

for (const size of [192, 512]) {
  await sharp(Buffer.from(svg(size))).resize(size, size).png().toFile(`public/icon-${size}.png`)
  console.log(`Wrote public/icon-${size}.png`)
}
