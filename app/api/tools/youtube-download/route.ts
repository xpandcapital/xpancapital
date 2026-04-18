import { NextRequest, NextResponse } from 'next/server'
import { execFile } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'

const execFileAsync = promisify(execFile)

const DOWNLOAD_DIR = path.join(process.cwd(), 'tmp', 'youtube-dl')

function ensureDownloadDir() {
  if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR, { recursive: true })
  }
}

async function findYtDlp(): Promise<string | null> {
  const paths = ['yt-dlp', 'yt-dlp.exe', '/usr/local/bin/yt-dlp', '/usr/bin/yt-dlp']
  for (const cmd of paths) {
    try {
      await execFileAsync(cmd, ['--version'], { timeout: 5000 })
      return cmd
    } catch { continue }
  }
  return null
}

async function findFfmpeg(): Promise<string | null> {
  const paths = ['ffmpeg', 'ffmpeg.exe', '/usr/local/bin/ffmpeg', '/usr/bin/ffmpeg']
  for (const cmd of paths) {
    try {
      await execFileAsync(cmd, ['-version'], { timeout: 5000 })
      return cmd
    } catch { continue }
  }
  return null
}

export async function POST(request: NextRequest) {
  try {
    const { url, quality } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL es requerida' }, { status: 400 })
    }

    const ytDlp = await findYtDlp()

    if (!ytDlp) {
      return NextResponse.json({
        success: false,
        error: 'yt-dlp no está instalado en el servidor. Instálalo con: pip install yt-dlp',
        needsSetup: true,
      }, { status: 501 })
    }

    ensureDownloadDir()

    const formatArg = quality === 'best'
      ? 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best'
      : quality === '720p'
        ? 'bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720]/best'
        : 'bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480]/best'

    const timestamp = Date.now()
    const outputTemplate = path.join(DOWNLOAD_DIR, `%(title).50s_${timestamp}.%(ext)s`)

    const args = [
      '--no-playlist',
      '--no-warnings',
      '--restrict-filenames',
      '-f', formatArg,
      '--merge-output-format', 'mp4',
      '-o', outputTemplate,
      '--print', 'after_move:filepath',
      '--print', 'title',
      url,
    ]

    const { stdout, stderr } = await execFileAsync(ytDlp, args, {
      timeout: 300000,
      maxBuffer: 5 * 1024 * 1024,
    })

    const lines = stdout.trim().split('\n').filter(Boolean)
    const filePath = lines.find(l => fs.existsSync(l)) || ''
    const title = lines.find(l => !fs.existsSync(l)) || `Video ${timestamp}`

    if (!filePath || !fs.existsSync(filePath)) {
      return NextResponse.json({
        success: false,
        error: 'No se pudo descargar el video. Verifica que la URL sea válida.',
      }, { status: 500 })
    }

    const stats = fs.statSync(filePath)
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(1) + ' MB'
    const fileName = path.basename(filePath)

    // Move to public directory for download access
    const publicDir = path.join(process.cwd(), 'public', 'downloads')
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true })
    }

    const publicPath = path.join(publicDir, fileName)
    fs.copyFileSync(filePath, publicPath)

    // Clean up temp file
    try { fs.unlinkSync(filePath) } catch {}

    // Schedule cleanup of public file after 1 hour
    setTimeout(() => {
      try { fs.unlinkSync(publicPath) } catch {}
    }, 3600000)

    return NextResponse.json({
      success: true,
      title,
      size: sizeMB,
      downloadUrl: `/downloads/${encodeURIComponent(fileName)}`,
      fileName,
    })
  } catch (error: any) {
    console.error('[YouTube Download Error]', error)

    if (error.killed) {
      return NextResponse.json({ error: 'La descarga tardó demasiado (timeout)' }, { status: 408 })
    }

    return NextResponse.json({
      success: false,
      error: error.message?.includes('not found')
        ? 'yt-dlp no está instalado en el servidor'
        : `Error: ${error.message?.substring(0, 200) || 'Error desconocido'}`,
    }, { status: 500 })
  }
}