/* eslint-disable @typescript-eslint/no-unused-expressions */
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


export const getImageURL = (path: string, type: string) => {
    let pathFile = path;
    if (!path || path === "") {
        type === "user" 
            ? pathFile = "default.png"
            : pathFile = "default-image.png";
    }

    const baseURL = type === "user"
        ? process.env.NEXT_PUBLIC_USER_STATIC_URL
        : process.env.NEXT_PUBLIC_MAIN_STATIC_URL;

    const fullURL = `${baseURL}/${pathFile}`;

    if (process.env.NODE_ENV === "development" && fullURL.includes("localhost")) {
        return `/api/image-proxy?url=${encodeURIComponent(fullURL)}`;
    }

    return fullURL;
};
