import imageCompression from 'browser-image-compression';

export const compressImage = (file) => {
    return new Promise((resolve, reject) => {
        const options = {
            maxSizeMB: 0.5, 
            maxWidthOrHeight: 1920, 
            useWebWorker: true,
        };

        imageCompression(file, options)
            .then((compressedFile) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64String = reader.result.split(',')[1]; 
                    const mimeType = compressedFile.type;
                    const base64DataURL = `data:${mimeType};base64,${base64String}`;
                    resolve(base64DataURL);
                    
                };
                reader.onerror = (error) => reject(error);
                reader.readAsDataURL(compressedFile);
            })
            .catch((error) => {
                // console.error('Error compressing image:', error);
                reject(error);
            });
    });
};
