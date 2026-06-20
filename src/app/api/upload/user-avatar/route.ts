import { NextRequest, NextResponse } from 'next/server'
import { uploadToBlob, makeBlobPath } from '@/lib/blob'

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const file = formData.get('file')

        if (!file || !(file instanceof File)) {
            return NextResponse.json({ error: 'Missing file' }, { status: 400 })
        }

        const url = await uploadToBlob({
            file,
            blobPath: makeBlobPath('users/avatars', file.name),
            contentType: file.type || undefined,
        })

        return NextResponse.json({ url })
    } catch (e) {
        return NextResponse.json(
            { error: e instanceof Error ? e.message : 'Upload failed' },
            { status: 500 }
        )
    }
}

