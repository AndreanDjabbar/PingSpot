/* eslint-disable @typescript-eslint/no-unused-expressions */
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
