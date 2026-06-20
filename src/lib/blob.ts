import { put } from '@vercel/blob'

const DEFAULT_MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

function getEnvToken(): string {
    const token = process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL_BLOB_READ_WRITE_TOKEN
    if (!token) {
        throw new Error(
            'Missing Vercel Blob token. Set BLOB_READ_WRITE_TOKEN (or VERCEL_BLOB_READ_WRITE_TOKEN) in environment.'
        )
    }
    return token
}

export async function uploadToBlob(params: {
    file: File
    blobPath: string
    contentType?: string
    maxSizeBytes?: number
}): Promise<string> {
    const { file, blobPath, contentType, maxSizeBytes } = params

    if (!file) throw new Error('File is required')

    const sizeLimit = maxSizeBytes ?? DEFAULT_MAX_SIZE_BYTES
    if (file.size > sizeLimit) {
        throw new Error(`File too large. Max ${Math.floor(sizeLimit / 1024 / 1024)}MB`)
    }

    // Upload via Vercel Blob
    const token = getEnvToken()
    const { url } = await put(blobPath, file, {
        access: 'public',
        contentType,
        token,
    })

    return url
}

export function makeBlobPath(prefix: string, originalName: string): string {
    const safeName = (originalName || 'file')
        .replace(/[^a-zA-Z0-9._-]/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 120)

    return `${prefix}/${Date.now()}-${Math.random().toString(16).slice(2)}-${safeName}`
}

