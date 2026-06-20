import { NextRequest, NextResponse } from 'next/server'
import { uploadToBlob, makeBlobPath } from '@/lib/blob'

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const files = formData.getAll('files')

        if (!files?.length) {
            return NextResponse.json({ error: 'Missing files' }, { status: 400 })
        }

        const urls: string[] = []

        for (const f of files) {
            if (!(f instanceof File)) continue

            const url = await uploadToBlob({
                file: f,
                blobPath: makeBlobPath('kegiatan/fotos', f.name),
                contentType: f.type || undefined,
            })

            urls.push(url)
        }

        return NextResponse.json({ urls })
    } catch (e) {
        return NextResponse.json(
            { error: e instanceof Error ? e.message : 'Upload failed' },
            { status: 500 }
        )
    }
}

