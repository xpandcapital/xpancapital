import * as fs from 'fs'
import * as path from 'path'

const REPO_BASE = 'https://raw.githubusercontent.com/glincker/thesvg/main/public/icons'

const SVG_VARIANTS = [
  (brand: string) => `${brand}/default.svg`,
  (brand: string) => `${brand}/wordmark.svg`,
  (brand: string) => `${brand}/mono.svg`,
  (brand: string) => `${brand}/icon.svg`,
  (brand: string) => `${brand}/color.svg`,
]

const BRANDS_DIR = path.resolve(__dirname, '..', 'public', 'icons', 'brands')

const BATCH = [
  // Google
  'google', 'gmail', 'google-drive', 'google-docs', 'google-sheets', 'google-slides',
  'google-meet', 'google-calendar', 'google-maps', 'google-chrome', 'google-analytics',
  'google-play', 'google-cloud', 'google-gemini',
  // Microsoft
  'microsoft', 'microsoft-word', 'microsoft-excel', 'microsoft-powerpoint', 'microsoft-outlook',
  'microsoft-onedrive', 'microsoft-teams', 'microsoft-edge', 'github', 'hotmail',
  // Cripto
  'bitcoin', 'ethereum', 'solana', 'tether', 'usdc', 'binance', 'polygon', 'cardano',
  'chainlink', 'litecoin',
  // Proveedores
  'supabase', 'vercel', 'aws', 'cloudflare', 'digitalocean', 'netlify', 'heroku', 'render',
  // Dev tools
  'nextdotjs', 'tailwindcss', 'framer', 'react', 'typescript', 'node-dot-js', 'python',
  'docker', 'kubernetes', 'git', 'vscode', 'npm',
  // Redes / Auth
  'facebook', 'instagram', 'x', 'linkedin', 'tiktok', 'youtube', 'pinterest', 'reddit',
  'snapchat', 'telegram', 'discord', 'apple', 'signal', 'auth0',
  // Pagos
  'stripe', 'paypal', 'mercadopago', 'visa', 'mastercard', 'amex', 'yape',
  // BD
  'postgresql', 'mysql', 'mongodb', 'redis', 'firebase', 'sqlite',
  // Diseño
  'figma', 'canva', 'adobe', 'adobe-photoshop', 'adobe-illustrator', 'adobe-premiere-pro',
  'sketch', 'webflow', 'blender', 'affinity', 'unsplash',
  // Entretenimiento
  'spotify', 'netflix', 'twitch', 'steam', 'kick', 'youtube-music', 'youtube-studio',
  'disney-plus', 'hbo-max', 'amazon-prime-video', 'crunchyroll',
  // Tiendas
  'hotmart',
  // Otros
  'notion', 'slack', 'zoom', 'openai', 'linear', 'perplexity-ai', 'claude', 'calendly',
  'loom', 'typeform', 'zendesk', 'trello', 'airtable', 'dropbox',
]

async function downloadIcon(brand: string): Promise<boolean> {
  const cleanBrand = brand.toLowerCase().replace(/[^a-z0-9-]/g, '')
  const destFile = path.join(BRANDS_DIR, `${cleanBrand}.svg`)

  if (fs.existsSync(destFile)) {
    console.log(`  ✔ ${brand} (ya existe)`)
    return true
  }

  for (const variant of SVG_VARIANTS) {
    const urlPath = variant(cleanBrand)
    const url = `${REPO_BASE}/${urlPath}`

    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
      if (!res.ok) continue

      const svg = await res.text()
      if (!svg.trim().startsWith('<svg') && !svg.trim().startsWith('<?xml')) {
        continue
      }

      fs.writeFileSync(destFile, svg.trim(), 'utf-8')
      console.log(`  ✔ ${brand} ← ${urlPath.split('/').pop()}`)
      return true
    } catch {
      continue
    }
  }

  console.log(`  ✖ ${brand} (no encontrado)`)
  return false
}

async function main() {
  const arg = process.argv[2]

  if (!arg) {
    console.log('Uso: npx tsx scripts/download-brand-icon.ts <brand>')
    console.log('     npx tsx scripts/download-brand-icon.ts --batch')
    process.exit(1)
  }

  if (!fs.existsSync(BRANDS_DIR)) {
    fs.mkdirSync(BRANDS_DIR, { recursive: true })
  }

  if (arg === '--batch') {
    console.log(`Descargando lote de ${BATCH.length} íconos...\n`)
    let ok = 0
    for (const brand of BATCH) {
      const success = await downloadIcon(brand)
      if (success) ok++
    }
    console.log(`\nCompletado: ${ok}/${BATCH.length} descargados`)
  } else {
    const success = await downloadIcon(arg)
    process.exit(success ? 0 : 1)
  }
}

main().catch(console.error)
