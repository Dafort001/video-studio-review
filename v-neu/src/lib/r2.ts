import {
    S3Client,
    HeadObjectCommand,
    GetObjectCommand,
    PutObjectCommand,
    UploadPartCommand,
    CreateMultipartUploadCommand,
    CompleteMultipartUploadCommand,
    CopyObjectCommand,
    DeleteObjectCommand,
    type PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const accountId = (process.env.R2_ACCOUNT_ID || "34f4bae41aa70617a4e346f2794f3fa2").trim();
const endpointUrl = (process.env.R2_ENDPOINT_URL || `https://${accountId}.r2.cloudflarestorage.com`).trim();

export const s3Client = new S3Client({
    region: "auto",
    endpoint: endpointUrl,
    credentials: {
        accessKeyId: (process.env.R2_ACCESS_KEY_ID || "").trim(),
        secretAccessKey: (process.env.R2_SECRET_ACCESS_KEY || "").trim(),
    },
    forcePathStyle: true,
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
});

export const R2_BUCKET = (process.env.R2_BUCKET_NAME || "pix-work").trim();

function getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : String(error);
}

function isMissingObjectError(error: unknown) {
    if (!error || typeof error !== "object") return false;
    const candidate = error as {
        name?: string;
        message?: string;
        $metadata?: { httpStatusCode?: number };
    };
    return candidate.name === "NotFound" ||
        candidate.name === "NoSuchKey" ||
        candidate.name === "UnknownError" ||
        candidate.message?.includes("UnknownError") === true ||
        candidate.$metadata?.httpStatusCode === 404;
}

export async function generatePresignedPutUrl(objectKey: string, expiresInSeconds = 3600, contentType?: string) {
    const params: PutObjectCommandInput = { Bucket: R2_BUCKET, Key: objectKey };
    if (contentType) {
        params.ContentType = contentType;
    }
    const command = new PutObjectCommand(params);
    return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
}

export async function getSignedDownloadUrl(objectKey: string, expiresInSeconds = 3600) {
    const command = new GetObjectCommand({ Bucket: R2_BUCKET, Key: objectKey });
    return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
}

export async function getObjectBuffer(objectKey: string) {
    try {
        const response = await s3Client.send(new GetObjectCommand({
            Bucket: R2_BUCKET,
            Key: objectKey,
        }));
        if (!response.Body) {
            return { ok: false, error: "R2 object has no body." };
        }
        const bytes = await response.Body.transformToByteArray();
        return {
            ok: true,
            buffer: Buffer.from(bytes),
            contentType: response.ContentType,
        };
    } catch (error: unknown) {
        return { ok: false, error: getErrorMessage(error) };
    }
}

export async function headObject(objectKey: string) {
    try {
        const command = new HeadObjectCommand({ Bucket: R2_BUCKET, Key: objectKey });
        const response = await s3Client.send(command);
        return { ok: true, exists: true, size: response.ContentLength, etag: response.ETag, contentType: response.ContentType };
    } catch (error: unknown) {
        // Cloudflare R2 returns a bodiless 404 which AWS SDK parses as UnknownError
        if (isMissingObjectError(error)) {
             return { ok: true, exists: false };
        }
        return { ok: false, error: getErrorMessage(error) };
    }
}

export async function initMultipartUploadSession(objectKey: string, contentType: string) {
    try {
        const command = new CreateMultipartUploadCommand({ Bucket: R2_BUCKET, Key: objectKey, ContentType: contentType });
        const res = await s3Client.send(command);
        return { ok: true, uploadId: res.UploadId };
    } catch (error: unknown) {
        return { ok: false, error: getErrorMessage(error) };
    }
}

export async function generateMultipartPartUploadUrl(objectKey: string, uploadId: string, partNumber: number, expiresInSeconds = 86400) {
    const command = new UploadPartCommand({ Bucket: R2_BUCKET, Key: objectKey, UploadId: uploadId, PartNumber: partNumber });
    return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
}

export async function completeMultipartUploadSession(objectKey: string, uploadId: string, parts: { partNumber: number, etag: string }[]) {
    try {
        const command = new CompleteMultipartUploadCommand({
            Bucket: R2_BUCKET,
            Key: objectKey,
            UploadId: uploadId,
            MultipartUpload: {
                Parts: parts.map(p => ({ PartNumber: p.partNumber, ETag: p.etag }))
            }
        });
        await s3Client.send(command);
        return { ok: true };
    } catch (error: unknown) {
        return { ok: false, error: getErrorMessage(error) };
    }
}

export async function renameFile(sourceKey: string, destinationKey: string) {
    try {
        await s3Client.send(new CopyObjectCommand({
            Bucket: R2_BUCKET,
            CopySource: `${R2_BUCKET}/${sourceKey}`,
            Key: destinationKey
        }));
        await s3Client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: sourceKey }));
        return { ok: true };
    } catch (error: unknown) {
        return { ok: false, error: getErrorMessage(error) };
    }
}

export async function copyFile(sourceKey: string, destinationKey: string) {
    try {
        await s3Client.send(new CopyObjectCommand({
            Bucket: R2_BUCKET,
            CopySource: `${R2_BUCKET}/${sourceKey}`,
            Key: destinationKey,
        }));
        return { ok: true };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return { ok: false, error: message };
    }
}

export async function uploadJsonToR2(objectKey: string, payload: unknown) {
    try {
        const command = new PutObjectCommand({
            Bucket: R2_BUCKET,
            Key: objectKey,
            Body: JSON.stringify(payload),
            ContentType: "application/json"
        });
        await s3Client.send(command);
        return { ok: true };
    } catch (error: unknown) {
        return { ok: false, error: getErrorMessage(error) };
    }
}

export async function deleteFile(objectKey: string) {
    try {
        await s3Client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: objectKey }));
        return { ok: true };
    } catch (error: unknown) {
        return { ok: false, error: getErrorMessage(error) };
    }
}

export async function uploadToR2(objectKey: string, body: Buffer | Uint8Array, contentType: string) {
    try {
        const command = new PutObjectCommand({
            Bucket: R2_BUCKET,
            Key: objectKey,
            Body: body,
            ContentType: contentType,
        });
        await s3Client.send(command);
        return { ok: true };
    } catch (error: unknown) {
        const message = getErrorMessage(error);
        console.error(`[R2] Upload failed for ${objectKey}:`, message);
        return { ok: false, error: message };
    }
}
