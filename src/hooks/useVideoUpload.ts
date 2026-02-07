
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { uploadToCloudinary } from '@/services/cloudinaryService';

export const useVideoUpload = () => {
    const [isUploading, setIsUploading] = useState(false);

    const uploadVideo = async (file: File, userId: string) => {
        setIsUploading(true);
        try {
            // 1. Fetch connected therapist (1:1 relationship assumption for MVP)
            const { data: connection } = await (supabase as any)
                .from('connections')
                .select('therapist_id')
                .eq('parent_id', userId)
                .eq('status', 'accepted')
                .maybeSingle();

            const therapistId = connection?.therapist_id || null;
            // Removed alert for cleaner flow but keeping it in console
            console.log("Found Therapist ID:", therapistId);

            // 2. Upload to Cloudinary
            const result = await uploadToCloudinary(file);
            console.log("Cloudinary Result:", result);

            const duration = result.duration ? Math.round(result.duration) : 0;
            const payload = {
                user_id: userId,
                title: file.name,
                file_path: result.public_id || file.name,
                file_url: result.secure_url,
                duration_seconds: duration,
                therapist_id: therapistId
            };

            // alert("DEBUG: Sending to DB for User: " + userId + " \nTherapist: " + therapistId);
            console.log("Saving to Supabase:", payload);

            // 3. Save to Supabase with therapist_id
            const { error, data } = await (supabase as any).from('video_uploads').insert(payload).select();

            if (error) {
                console.error("Supabase Insert Error:", error);
                throw error;
            }

            console.log("Video saved successfully!", data);
            return { success: true };
        } catch (error: any) {
            console.error("Upload failed (Caught):", error);
            return { success: false, error: error.message };
        } finally {
            setIsUploading(false);
        }
    };

    return { uploadVideo, isUploading };
};
