
import React from 'react';
import { cn } from '@/lib/utils';

interface CloudinaryPlayerProps {
    videoUrl: string;
    className?: string;
    autoPlay?: boolean;
    controls?: boolean;
}

export const CloudinaryPlayer: React.FC<CloudinaryPlayerProps> = ({
    videoUrl,
    className,
    autoPlay = false,
    controls = true
}) => {
    return (
        <div className={cn("relative overflow-hidden rounded-xl bg-black aspect-video", className)}>
            <video
                className="w-full h-full object-cover"
                src={videoUrl}
                controls={controls}
                autoPlay={autoPlay}
                playsInline
            >
                Your browser does not support the video tag.
            </video>
        </div>
    );
};
