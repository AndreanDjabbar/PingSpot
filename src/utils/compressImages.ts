import imageCompression from 'browser-image-compression';

interface ImageCompressionOptions {
    maxSizeMB?: number;          
    maxWidthOrHeight?: number;
    maxIteration?: number;
    useWebWorker?: boolean;
    fileType?: string;
    initialQuality?: number;
}

export const compressImages = async (files: File, options?: ImageCompressionOptions): Promise<File> => {
    const defaultOptions: ImageCompressionOptions = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1280,
        useWebWorker: true,
        maxIteration: 10,
        initialQuality: 0.85,
    };

    const finalOptions = { ...defaultOptions, ...options };

    const compressedFile = await imageCompression(files, finalOptions);

    const renamedFile = new File([compressedFile], files.name, {
        type: compressedFile.type || files.type,
        lastModified: Date.now(),
    });

    return renamedFile;
};
