const KB = 1024;
const MB = 1024 * KB;
const SAFE_MULTIPART_OVERHEAD_BYTES = 128 * KB;

export const MAX_UPLOAD_IMAGES = 3;
export const MAX_IMAGE_FILE_SIZE_BYTES = 2 * MB;
export const SAFE_TOTAL_IMAGE_BYTES = 4 * MB - SAFE_MULTIPART_OVERHEAD_BYTES;

const MAX_IMAGE_DIMENSION = 1600;
const JPEG_QUALITIES = [0.9, 0.82, 0.74, 0.66, 0.58, 0.5, 0.42, 0.34];

type PreparedImageSelection = {
    files: File[];
    optimized: boolean;
    truncated: boolean;
    error?: string;
};

export async function prepareImageSelection(currentFiles: File[], incomingFiles: File[]): Promise<PreparedImageSelection> {
    if (incomingFiles.length === 0) {
        return {
            files: currentFiles,
            optimized: false,
            truncated: false,
        };
    }

    const availableSlots = Math.max(0, MAX_UPLOAD_IMAGES - currentFiles.length);

    if (availableSlots === 0) {
        return {
            files: currentFiles,
            optimized: false,
            truncated: false,
            error: 'Solo puedes subir hasta 3 imagenes.',
        };
    }

    const nextFiles = incomingFiles.slice(0, availableSlots);
    const candidateFiles = [...currentFiles, ...nextFiles];
    const targetBytesPerFile = Math.min(MAX_IMAGE_FILE_SIZE_BYTES, Math.floor(SAFE_TOTAL_IMAGE_BYTES / candidateFiles.length));

    let optimized = false;
    const preparedFiles: File[] = [];

    for (const file of candidateFiles) {
        if (!file.type.startsWith('image/')) {
            return {
                files: currentFiles,
                optimized: false,
                truncated: false,
                error: `El archivo "${file.name}" no es una imagen valida.`,
            };
        }

        let preparedFile = file;

        if (file.size > targetBytesPerFile) {
            try {
                preparedFile = await optimizeImageForUpload(file, targetBytesPerFile);
            } catch {
                return {
                    files: currentFiles,
                    optimized: false,
                    truncated: false,
                    error: `No se pudo procesar "${file.name}". Intenta con una imagen mas ligera.`,
                };
            }
        }

        if (preparedFile.size > MAX_IMAGE_FILE_SIZE_BYTES) {
            return {
                files: currentFiles,
                optimized: false,
                truncated: false,
                error: `La imagen "${file.name}" supera el maximo de 2MB por archivo.`,
            };
        }

        if (preparedFile !== file) {
            optimized = true;
        }

        preparedFiles.push(preparedFile);
    }

    const totalBytes = preparedFiles.reduce((sum, file) => sum + file.size, 0);

    if (totalBytes > SAFE_TOTAL_IMAGE_BYTES) {
        return {
            files: currentFiles,
            optimized: false,
            truncated: false,
            error: 'Las imagenes seleccionadas siguen siendo demasiado pesadas para subirlas. Prueba con menos fotos o con imagenes mas ligeras.',
        };
    }

    return {
        files: preparedFiles,
        optimized,
        truncated: incomingFiles.length > availableSlots,
    };
}

export async function buildImagePreviews(files: File[]): Promise<string[]> {
    return Promise.all(files.map(readFileAsDataUrl));
}

async function optimizeImageForUpload(file: File, targetBytes: number): Promise<File> {
    if (file.type === 'image/gif') {
        throw new Error('gif-too-large');
    }

    const image = await loadImage(file);
    const dimensions = scaleDimensions(image.width, image.height, MAX_IMAGE_DIMENSION);
    const canvas = document.createElement('canvas');

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    const context = canvas.getContext('2d');

    if (!context) {
        throw new Error('canvas-not-supported');
    }

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, dimensions.width, dimensions.height);
    context.drawImage(image, 0, 0, dimensions.width, dimensions.height);

    let smallestBlob: Blob | null = null;

    for (const quality of JPEG_QUALITIES) {
        const blob = await canvasToBlob(canvas, quality);

        if (!smallestBlob || blob.size < smallestBlob.size) {
            smallestBlob = blob;
        }

        if (blob.size <= targetBytes) {
            return blobToFile(blob, file);
        }
    }

    if (!smallestBlob) {
        throw new Error('compression-failed');
    }

    return blobToFile(smallestBlob, file);
}

function scaleDimensions(width: number, height: number, maxDimension: number) {
    const largestSide = Math.max(width, height);

    if (largestSide <= maxDimension) {
        return { width, height };
    }

    const ratio = maxDimension / largestSide;

    return {
        width: Math.max(1, Math.round(width * ratio)),
        height: Math.max(1, Math.round(height * ratio)),
    };
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    reject(new Error('blob-generation-failed'));
                    return;
                }

                resolve(blob);
            },
            'image/jpeg',
            quality,
        );
    });
}

function blobToFile(blob: Blob, sourceFile: File): File {
    const baseName = sourceFile.name.replace(/\.[^.]+$/, '') || 'imagen';

    return new File([blob], `${baseName}.jpg`, {
        type: 'image/jpeg',
        lastModified: sourceFile.lastModified,
    });
}

function loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        const objectUrl = URL.createObjectURL(file);

        image.onload = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(image);
        };

        image.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('image-load-failed'));
        };

        image.src = objectUrl;
    });
}

function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
                return;
            }

            reject(new Error('preview-generation-failed'));
        };

        reader.onerror = () => reject(new Error('preview-generation-failed'));
        reader.readAsDataURL(file);
    });
}
