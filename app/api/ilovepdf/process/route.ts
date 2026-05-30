import { NextRequest, NextResponse } from 'next/server'
import { getApiKeyForRequest } from '@/lib/api-keys'

export async function POST(request: NextRequest) {
  try {
    const publicKey = await getApiKeyForRequest(request, 'ilovepdf_public_key')
    if (!publicKey) {
      return NextResponse.json(
        { error: 'Clave de procesamiento no configurada.' },
        { status: 400 }
      )
    }

    const formData = await request.formData()
    const mode = formData.get('mode') as string
    const files = formData.getAll('files') as File[]
    const compressionLevel = formData.get('compression_level') as string || 'recommended'
    const splitMode = formData.get('split_mode') as string
    const splitRanges = formData.get('ranges') as string
    const splitFixedRange = formData.get('fixed_range') as string
    const splitRemovePages = formData.get('remove_pages') as string
    const pdfjpgMode = formData.get('pdfjpg_mode') as string
    const orientation = formData.get('orientation') as string
    const pagesize = formData.get('pagesize') as string
    const margin = formData.get('margin') as string

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No se recibieron archivos' }, { status: 400 })
    }

    if (!mode) {
      return NextResponse.json({ error: 'Modo no especificado' }, { status: 400 })
    }

    // 1. Auth
    const authRes = await fetch('https://api.ilovepdf.com/v1/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ public_key: publicKey }),
    })
    const authData = await authRes.json()
    if (!authData.token) {
      return NextResponse.json(
        { error: authData.message || `Auth falló (${authRes.status})` },
        { status: 502 }
      )
    }
    const token = authData.token

    // 2. Start
    const startRes = await fetch(`https://api.ilovepdf.com/v1/start/${mode}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    const startData = await startRes.json()
    if (!startData.server || !startData.task) {
      return NextResponse.json(
        { error: startData.message || `Start falló (${startRes.status})` },
        { status: 502 }
      )
    }
    const { server, task } = startData

    // 3. Upload files
    const serverFilenames: string[] = []
    const originalNames: string[] = []

    for (const file of files) {
      const uploadForm = new FormData()
      uploadForm.append('task', task)
      uploadForm.append('file', file, file.name)

      const uploadRes = await fetch(`https://${server}/v1/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: uploadForm,
      })
      const uploadData = await uploadRes.json()
      if (!uploadData.server_filename) {
        return NextResponse.json(
          { error: `Upload falló para ${file.name}` },
          { status: 502 }
        )
      }
      serverFilenames.push(uploadData.server_filename)
      originalNames.push(file.name)
    }

    // 4. Process
    const filesPayload = serverFilenames.map((sfn, i) => ({
      server_filename: sfn,
      filename: originalNames[i],
    }))

    const processBody: Record<string, unknown> = {
      task,
      tool: mode,
      files: filesPayload,
    }

    // Extra params
    if (mode === 'compress') {
      processBody.compression_level = compressionLevel
    } else if (mode === 'split') {
      if (splitMode === 'ranges') {
        processBody.split_mode = 'ranges'
        processBody.ranges = splitRanges || '1'
      } else if (splitMode === 'fixed_range') {
        processBody.split_mode = 'fixed_range'
        processBody.fixed_range = parseInt(splitFixedRange) || 1
      } else if (splitMode === 'remove_pages') {
        processBody.split_mode = 'remove_pages'
        processBody.remove_pages = splitRemovePages || ''
      }
    } else if (mode === 'pdfjpg') {
      processBody.pdfjpg_mode = pdfjpgMode || 'pages'
    } else if (mode === 'imagepdf') {
      processBody.orientation = orientation || 'portrait'
      processBody.margin = margin || '0'
      processBody.pagesize = pagesize || 'fit'
      processBody.merge_after = true
    }

    const processRes = await fetch(`https://${server}/v1/process`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(processBody),
    })
    const processData = await processRes.json()

    if (processData.status === 'TaskError' || !processRes.ok) {
      return NextResponse.json(
        { error: 'Error al procesar: ' + (processData.message || `HTTP ${processRes.status}`) },
        { status: 502 }
      )
    }

    // 5. Download result
    const downloadRes = await fetch(`https://${server}/v1/download/${task}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    const resultBlob = await downloadRes.blob()
    const disposition = downloadRes.headers.get('content-disposition') || ''
    const match = disposition.match(/filename="?([^"]+)"?/)
    const filename = match ? match[1] : 'resultado.pdf'

    return new NextResponse(resultBlob, {
      headers: {
        'Content-Type': downloadRes.headers.get('content-type') || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err) {
    console.error('[ilovepdf/process]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error interno' },
      { status: 500 }
    )
  }
}
