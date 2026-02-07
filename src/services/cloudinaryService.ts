
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const uploadToCloudinary = async (file: File) => {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
        throw new Error("Missing configuration: Check VITE_CLOUDINARY_CLOUD_NAME in .env");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("resource_type", "video");

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`,
            { method: "POST", body: formData }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || "Upload failed");
        }

        return await response.json();
    } catch (err) {
        console.error("Cloudinary Error:", err);
        throw err;
    }
};
