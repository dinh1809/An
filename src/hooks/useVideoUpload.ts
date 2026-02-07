
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { uploadToCloudinary } from '@/services/cloudinaryService';

export const useVideoUpload = () => {
    const [isUploading, setIsUploading] = useState(false);

    const uploadVideo = async (file: File, userId: string) => {
        setIsUploading(true);
        try {
            // 1. Upload to Cloudinary
            const result = await uploadToCloudinary(file);

            // 2. Save to Supabase
            const { error } = await supabase.from('video_uploads').insert({
                user_id: userId,
                title: file.name,
                file_url: result.secure_url,
                file_path: result.public_id,
                duration_seconds: Math.round(result.duration)
            });

            if (error) throw error;
            return { success: true };
        } catch (error: any) {
            console.error("Upload failed:", error);
            return { success: false, error: error.message };
        } finally {
            setIsUploading(false);
        }
    };

    return { uploadVideo, isUploading };
};
