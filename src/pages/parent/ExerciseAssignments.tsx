/**
 * ExerciseAssignments - Video upload and therapist annotation page
 * Route: /parent/exercises
 * 
 * Features:
 * - Upload exercise videos for therapist review (Cloudinary)
 * - View therapist annotations/comments on videos
 * - Track assigned exercises from therapist
 */

import { useState, useRef, useCallback } from 'react';
import { ParentLayout } from '@/components/layout/ParentLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Video,
    Upload,
    Play,
    Clock,
    CheckCircle2,
    MessageSquare,
    Calendar,
    ChevronRight,
    Star,
    AlertCircle,
    FileVideo,
    Eye,
    Heart,
    Sparkles,
    Loader2,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { uploadToCloudinary } from '@/services/cloudinaryService';

// Mock data for exercises
const assignedExercises = [
    {
        id: '1',
        title: 'Bài tập giao tiếp mắt',
        description: 'Thực hành duy trì ánh mắt với bé trong 3-5 giây',
        therapist: 'BS. Nguyễn Văn An',
        dueDate: '10/02/2026',
        status: 'pending',
        duration: '5 phút',
        priority: 'high'
    },
    {
        id: '2',
        title: 'Kỹ năng bắt chước động tác',
        description: 'Bé bắt chước các động tác đơn giản như vỗ tay, giơ tay cao',
        therapist: 'BS. Nguyễn Văn An',
        dueDate: '12/02/2026',
        status: 'pending',
        duration: '10 phút',
        priority: 'medium'
    },
    {
        id: '3',
        title: 'Nhận biết màu sắc',
        description: 'Sử dụng flashcard để bé nhận biết 3 màu cơ bản',
        therapist: 'BS. Trần Thanh Bình',
        dueDate: '08/02/2026',
        status: 'completed',
        duration: '7 phút',
        priority: 'low'
    }
];

const uploadedVideos = [
    {
        id: 'v1',
        title: 'Bài tập giao tiếp mắt - Buổi 1',
        uploadedAt: '05/02/2026',
        duration: '4:32',
        status: 'reviewed',
        thumbnail: 'https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=400&h=225&fit=crop',
        annotations: [
            { time: '0:45', text: 'Bé đã bắt đầu có sự chú ý, rất tốt!', type: 'praise' },
            { time: '1:20', text: 'Mẹ nên hạ thấp tầm mắt xuống chút nữa.', type: 'suggestion' },
            { time: '2:10', text: 'Bé duy trì ánh mắt được 3 giây, tiến bộ vượt bậc!', type: 'praise' }
        ],
        therapist: 'BS. Nguyễn Văn An',
        overallFeedback: 'Bé tiến bộ rất tốt! Tiếp tục duy trì 2 buổi/ngày.'
    },
    {
        id: 'v2',
        title: 'Kỹ năng bắt chước - Buổi 3',
        uploadedAt: '03/02/2026',
        duration: '6:15',
        status: 'reviewed',
        thumbnail: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=225&fit=crop',
        annotations: [
            { time: '1:10', text: 'Bé bắt chước động tác vỗ tay rất chính xác.', type: 'praise' },
            { time: '3:45', text: 'Thử thêm động tác giơ 2 tay cao.', type: 'suggestion' }
        ],
        therapist: 'BS. Nguyễn Văn An',
        overallFeedback: 'Khả năng bắt chước đang phát triển tốt.'
    },
    {
        id: 'v3',
        title: 'Nhận biết màu sắc - Buổi 5',
        uploadedAt: '01/02/2026',
        duration: '5:48',
        status: 'pending',
        thumbnail: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&h=225&fit=crop',
        annotations: [],
        therapist: null,
        overallFeedback: null
    }
];

export default function ExerciseAssignments() {
    const [selectedVideo, setSelectedVideo] = useState(uploadedVideos[0]);
    const [activeTab, setActiveTab] = useState('assignments');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedExercise, setSelectedExercise] = useState<typeof assignedExercises[0] | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadedVideosList, setUploadedVideosList] = useState(uploadedVideos);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { user } = useAuth();
    const { toast } = useToast();

    const pendingExercises = assignedExercises.filter(e => e.status === 'pending');
    const completedExercises = assignedExercises.filter(e => e.status === 'completed');

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-700 border-red-200';
            case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-green-100 text-green-700 border-green-200';
        }
    };

    const getPriorityLabel = (priority: string) => {
        switch (priority) {
            case 'high': return 'Ưu tiên cao';
            case 'medium': return 'Trung bình';
            default: return 'Bình thường';
        }
    };

    // Handle file selection
    const handleFileSelect = useCallback((file: File) => {
        const validTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo'];
        const maxSize = 500 * 1024 * 1024; // 500MB

        if (!validTypes.includes(file.type)) {
            toast({
                title: "Định dạng không hỗ trợ",
                description: "Vui lòng chọn file video (MP4, MOV, WebM, AVI)",
                variant: "destructive"
            });
            return;
        }

        if (file.size > maxSize) {
            toast({
                title: "File quá lớn",
                description: "Kích thước file tối đa là 500MB",
                variant: "destructive"
            });
            return;
        }

        setSelectedFile(file);
    }, [toast]);

    // Handle drag and drop
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    }, [handleFileSelect]);

    // Handle file input change
    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileSelect(file);
    };

    // Upload video to Cloudinary
    const handleUpload = async () => {
        if (!selectedFile) {
            toast({
                title: "Chưa chọn video",
                description: "Vui lòng chọn video trước khi upload",
                variant: "destructive"
            });
            return;
        }

        setUploadProgress(0);

        try {
            // Simulate progress updates
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return prev;
                    }
                    return prev + 10;
                });
            }, 500);

            // Upload to Cloudinary
            const result = await uploadToCloudinary(selectedFile);

            clearInterval(progressInterval);
            setUploadProgress(100);

            // Create new video entry
            const newVideo = {
                id: `v${Date.now()}`,
                title: selectedExercise
                    ? `${selectedExercise.title} - Upload ${new Date().toLocaleDateString('vi-VN')}`
                    : selectedFile.name.replace(/\.[^/.]+$/, ''),
                uploadedAt: new Date().toLocaleDateString('vi-VN'),
                duration: result.duration ? formatDuration(result.duration) : '0:00',
                status: 'pending' as const,
                thumbnail: result.secure_url.replace(/\.[^/.]+$/, '.jpg'), // Cloudinary auto-generates thumbnail
                annotations: [],
                therapist: null,
                overallFeedback: null,
                cloudinaryUrl: result.secure_url,
                publicId: result.public_id
            };

            // Add to list
            setUploadedVideosList(prev => [newVideo, ...prev]);

            toast({
                title: "Upload thành công! 🎉",
                description: "Video đã được gửi đi. Chuyên gia sẽ nhận xét trong 24-48h.",
            });

            // Reset state
            setTimeout(() => {
                setIsUploading(false);
                setSelectedFile(null);
                setSelectedExercise(null);
                setUploadProgress(0);
                setActiveTab('uploads');
            }, 1000);

        } catch (error: any) {
            console.error('Upload error:', error);
            toast({
                title: "Upload thất bại",
                description: error.message || "Đã xảy ra lỗi khi upload video",
                variant: "destructive"
            });
            setUploadProgress(0);
        }
    };

    // Format duration from seconds
    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Open upload modal for specific exercise
    const openUploadForExercise = (exercise: typeof assignedExercises[0]) => {
        setSelectedExercise(exercise);
        setSelectedFile(null);
        setIsUploading(true);
    };

    // Open general upload modal
    const openGeneralUpload = () => {
        setSelectedExercise(null);
        setSelectedFile(null);
        setIsUploading(true);
    };

    return (
        <ParentLayout>
            <div className="space-y-8 pb-12">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <h1 className="text-3xl font-black text-[#00695C] tracking-tight">Giao Bài Tập</h1>
                        <p className="text-muted-foreground font-medium">
                            Upload video thực hành và nhận phản hồi từ chuyên gia
                        </p>
                    </motion.div>

                    <Button
                        className="bg-[#00695C] hover:bg-[#004D40] text-white font-bold rounded-xl h-12 px-6 shadow-lg shadow-[#00695C]/20 gap-2"
                        onClick={openGeneralUpload}
                    >
                        <Upload className="h-5 w-5" />
                        Upload Video Mới
                    </Button>
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInputChange}
                    accept="video/*"
                    className="hidden"
                />

                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Bài tập được giao', value: pendingExercises.length, icon: FileVideo, color: 'text-blue-500 bg-blue-50' },
                        { label: 'Đã hoàn thành', value: completedExercises.length, icon: CheckCircle2, color: 'text-green-500 bg-green-50' },
                        { label: 'Video đã upload', value: uploadedVideos.length, icon: Video, color: 'text-purple-500 bg-purple-50' },
                        { label: 'Nhận xét mới', value: 5, icon: MessageSquare, color: 'text-amber-500 bg-amber-50' }
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className={cn("p-3 rounded-xl", stat.color)}>
                                        <stat.icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black">{stat.value}</p>
                                        <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Main Content Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="bg-muted/50 p-1 rounded-xl">
                        <TabsTrigger value="assignments" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow">
                            <FileVideo className="h-4 w-4 mr-2" />
                            Bài tập được giao
                        </TabsTrigger>
                        <TabsTrigger value="uploads" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow">
                            <Video className="h-4 w-4 mr-2" />
                            Video đã upload
                        </TabsTrigger>
                        <TabsTrigger value="feedback" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Nhận xét từ chuyên gia
                        </TabsTrigger>
                    </TabsList>

                    {/* Assignments Tab */}
                    <TabsContent value="assignments" className="space-y-6">
                        {/* Pending Exercises */}
                        <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-[#00695C]/5 to-transparent">
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-[#00695C]" />
                                    Bài tập cần hoàn thành ({pendingExercises.length})
                                </CardTitle>
                                <CardDescription>
                                    Quay video thực hành và upload để nhận nhận xét từ chuyên gia
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                {pendingExercises.map((exercise, i) => (
                                    <motion.div
                                        key={exercise.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="group p-4 rounded-2xl bg-white border border-border hover:border-[#00695C]/30 hover:shadow-md transition-all cursor-pointer"
                                        onClick={() => openUploadForExercise(exercise)}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge className={cn("text-[10px] font-bold border", getPriorityColor(exercise.priority))}>
                                                        {getPriorityLabel(exercise.priority)}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        Hạn: {exercise.dueDate}
                                                    </span>
                                                </div>
                                                <h3 className="font-bold text-lg group-hover:text-[#00695C] transition-colors">
                                                    {exercise.title}
                                                </h3>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {exercise.description}
                                                </p>
                                                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {exercise.duration}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Star className="h-3 w-3" />
                                                        {exercise.therapist}
                                                    </span>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                className="border-[#00695C] text-[#00695C] hover:bg-[#00695C] hover:text-white rounded-xl font-bold shrink-0"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openUploadForExercise(exercise);
                                                }}
                                            >
                                                <Upload className="h-4 w-4 mr-2" />
                                                Upload
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Completed Exercises */}
                        {completedExercises.length > 0 && (
                            <Card className="border-none shadow-xl rounded-3xl overflow-hidden opacity-80">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-green-700">
                                        <CheckCircle2 className="h-5 w-5" />
                                        Đã hoàn thành ({completedExercises.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    {completedExercises.map((exercise) => (
                                        <div key={exercise.id} className="flex items-center justify-between p-3 rounded-xl bg-green-50/50">
                                            <div className="flex items-center gap-3">
                                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                <span className="font-medium">{exercise.title}</span>
                                            </div>
                                            <span className="text-sm text-muted-foreground">{exercise.dueDate}</span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Uploads Tab */}
                    <TabsContent value="uploads" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Video List */}
                            <div className="lg:col-span-1 space-y-4">
                                <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground px-1">
                                    Video của bạn
                                </h3>
                                {uploadedVideosList.map((video) => (
                                    <Card
                                        key={video.id}
                                        onClick={() => setSelectedVideo(video)}
                                        className={cn(
                                            "cursor-pointer border-2 transition-all hover:shadow-md overflow-hidden",
                                            selectedVideo.id === video.id
                                                ? "border-[#00695C] shadow-lg"
                                                : "border-transparent"
                                        )}
                                    >
                                        <div className="relative aspect-video">
                                            <img
                                                src={video.thumbnail}
                                                alt={video.title}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                <Play className="h-10 w-10 text-white" />
                                            </div>
                                            <Badge
                                                className={cn(
                                                    "absolute top-2 right-2 text-[10px] font-bold",
                                                    video.status === 'reviewed'
                                                        ? "bg-green-500 text-white"
                                                        : "bg-amber-500 text-white"
                                                )}
                                            >
                                                {video.status === 'reviewed' ? 'Đã nhận xét' : 'Chờ xem xét'}
                                            </Badge>
                                            <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                                                {video.duration}
                                            </span>
                                        </div>
                                        <CardContent className="p-3">
                                            <h4 className="font-bold text-sm line-clamp-1">{video.title}</h4>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Upload: {video.uploadedAt}
                                            </p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Video Player & Annotations */}
                            <div className="lg:col-span-2 space-y-4">
                                <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
                                    {/* Video Player */}
                                    <div className="relative aspect-video bg-black">
                                        <img
                                            src={selectedVideo.thumbnail}
                                            alt={selectedVideo.title}
                                            className="w-full h-full object-cover opacity-80"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <button className="p-4 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors">
                                                <Play className="h-12 w-12 text-white" />
                                            </button>
                                        </div>
                                        {/* Progress bar */}
                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                                            <div className="h-full bg-[#00695C] w-1/3" />
                                        </div>
                                    </div>

                                    <CardContent className="p-6 space-y-6">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h2 className="text-xl font-bold">{selectedVideo.title}</h2>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Upload: {selectedVideo.uploadedAt} • Thời lượng: {selectedVideo.duration}
                                                </p>
                                            </div>
                                            {selectedVideo.status === 'reviewed' && (
                                                <Badge className="bg-green-100 text-green-700 border-green-200">
                                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                                    Đã nhận xét
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Overall Feedback */}
                                        {selectedVideo.overallFeedback && (
                                            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#00695C]/10 to-transparent border border-[#00695C]/20">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Sparkles className="h-4 w-4 text-[#00695C]" />
                                                    <span className="font-bold text-sm text-[#00695C]">Đánh giá tổng quan</span>
                                                </div>
                                                <p className="text-sm font-medium">{selectedVideo.overallFeedback}</p>
                                                <p className="text-xs text-muted-foreground mt-2">— {selectedVideo.therapist}</p>
                                            </div>
                                        )}

                                        {/* Annotations Timeline */}
                                        {selectedVideo.annotations.length > 0 ? (
                                            <div className="space-y-3">
                                                <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                                    <MessageSquare className="h-4 w-4" />
                                                    Nhận xét theo thời gian
                                                </h3>
                                                <div className="space-y-2">
                                                    {selectedVideo.annotations.map((ann, i) => (
                                                        <motion.div
                                                            key={i}
                                                            initial={{ opacity: 0, x: 10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: i * 0.1 }}
                                                            className={cn(
                                                                "p-3 rounded-xl border cursor-pointer transition-all hover:shadow-md",
                                                                ann.type === 'praise'
                                                                    ? "bg-green-50 border-green-200 hover:border-green-400"
                                                                    : "bg-amber-50 border-amber-200 hover:border-amber-400"
                                                            )}
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                <span className={cn(
                                                                    "font-black text-xs tabular-nums px-2 py-1 rounded",
                                                                    ann.type === 'praise' ? "bg-green-200 text-green-800" : "bg-amber-200 text-amber-800"
                                                                )}>
                                                                    {ann.time}
                                                                </span>
                                                                <div className="flex-1">
                                                                    <p className="text-sm font-medium">{ann.text}</p>
                                                                    <span className="text-[10px] text-muted-foreground mt-1 block">
                                                                        {ann.type === 'praise' ? '✨ Khen ngợi' : '💡 Góp ý'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <AlertCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                                                <p className="text-muted-foreground font-medium">Chờ chuyên gia xem xét...</p>
                                                <p className="text-sm text-muted-foreground/70 mt-1">
                                                    Video sẽ được nhận xét trong vòng 24-48 giờ
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Feedback Summary Tab */}
                    <TabsContent value="feedback" className="space-y-6">
                        <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-purple-500/10 to-transparent">
                                <CardTitle className="flex items-center gap-2">
                                    <Heart className="h-5 w-5 text-purple-500" />
                                    Tổng hợp nhận xét từ chuyên gia
                                </CardTitle>
                                <CardDescription>
                                    Những điểm nổi bật và góp ý từ các buổi thực hành
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                {/* Praise Section */}
                                <div className="space-y-3">
                                    <h3 className="font-bold text-sm flex items-center gap-2 text-green-700">
                                        <Sparkles className="h-4 w-4" />
                                        Điểm tích cực (5)
                                    </h3>
                                    <div className="grid gap-2">
                                        {uploadedVideos
                                            .flatMap(v => v.annotations.filter(a => a.type === 'praise').map(a => ({ ...a, video: v.title })))
                                            .map((ann, i) => (
                                                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-green-50 border border-green-100">
                                                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                                                    <div>
                                                        <p className="text-sm font-medium">{ann.text}</p>
                                                        <p className="text-xs text-muted-foreground mt-1">Từ: {ann.video}</p>
                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>

                                {/* Suggestions Section */}
                                <div className="space-y-3">
                                    <h3 className="font-bold text-sm flex items-center gap-2 text-amber-700">
                                        <AlertCircle className="h-4 w-4" />
                                        Góp ý cải thiện (2)
                                    </h3>
                                    <div className="grid gap-2">
                                        {uploadedVideos
                                            .flatMap(v => v.annotations.filter(a => a.type === 'suggestion').map(a => ({ ...a, video: v.title })))
                                            .map((ann, i) => (
                                                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
                                                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                                                    <div>
                                                        <p className="text-sm font-medium">{ann.text}</p>
                                                        <p className="text-xs text-muted-foreground mt-1">Từ: {ann.video}</p>
                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Upload Modal */}
                <AnimatePresence>
                    {isUploading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto"
                            onClick={() => !uploadProgress && setIsUploading(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="bg-white dark:bg-[#1a2e2c] rounded-[32px] p-8 max-w-lg w-full shadow-2xl relative border border-white/20"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    onClick={() => setIsUploading(false)}
                                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                                    disabled={uploadProgress > 0 && uploadProgress < 100}
                                >
                                    <X className="h-5 w-5" />
                                </button>

                                <div className="text-center">
                                    <div className={cn(
                                        "w-20 h-20 mx-auto mb-6 rounded-[24px] flex items-center justify-center transition-all duration-500",
                                        isDragging ? "bg-[#00695C] text-white scale-110" : "bg-[#00695C]/5 text-[#00695C]",
                                        uploadProgress > 0 && "animate-pulse"
                                    )}>
                                        {uploadProgress > 0 ? (
                                            <Loader2 className="h-8 w-8 animate-spin" />
                                        ) : (
                                            <Upload className="h-8 w-8" />
                                        )}
                                    </div>

                                    <h2 className="text-2xl font-black mb-2 tracking-tight">
                                        {selectedExercise ? `Nộp bài: ${selectedExercise.title}` : 'Upload Video Bài Tập'}
                                    </h2>
                                    <p className="text-sm text-muted-foreground mb-8 px-4">
                                        {selectedExercise
                                            ? `Thực hành kĩ năng và gửi cho ${selectedExercise.therapist} để nhận góp ý.`
                                            : 'Kéo thả video vào đây hoặc chọn file để bắt đầu upload lên Cloudinary.'}
                                    </p>

                                    {/* Drop Zone / File Placeholder */}
                                    {!selectedFile ? (
                                        <div
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}
                                            onClick={() => fileInputRef.current?.click()}
                                            className={cn(
                                                "border-2 border-dashed rounded-[24px] p-10 mb-8 cursor-pointer transition-all duration-300",
                                                isDragging
                                                    ? "border-[#00695C] bg-[#00695C]/5"
                                                    : "border-gray-200 dark:border-white/10 hover:border-[#00695C]/40"
                                            )}
                                        >
                                            <Video className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                                            <p className="text-sm font-bold text-muted-foreground">Click hoặc Kéo thả video vào đây</p>
                                            <p className="text-[10px] text-muted-foreground/60 mt-1 uppercase tracking-widest font-black">MP4, MOV, WebM (Max 500MB)</p>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 dark:bg-white/5 rounded-[24px] p-6 mb-8 border border-gray-100 dark:border-white/5">
                                            <div className="flex items-center gap-4 text-left">
                                                <div className="p-3 bg-[#00695C] rounded-xl text-white">
                                                    <FileVideo className="h-6 w-6" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold truncate">{selectedFile.name}</p>
                                                    <p className="text-xs text-muted-foreground">{(selectedFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                                                </div>
                                                {!uploadProgress && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setSelectedFile(null)}
                                                        className="hover:text-red-500"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>

                                            {uploadProgress > 0 && (
                                                <div className="mt-6 space-y-2">
                                                    <div className="flex justify-between text-xs font-black uppercase text-[#00695C]">
                                                        <span>{uploadProgress < 100 ? 'Đang tải lên...' : 'Hoàn thành!'}</span>
                                                        <span>{uploadProgress}%</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                                                        <motion.div
                                                            className="h-full bg-[#00695C]"
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${uploadProgress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <Button
                                            variant="outline"
                                            className="rounded-2xl h-14 font-bold border-gray-200"
                                            onClick={() => setIsUploading(false)}
                                            disabled={uploadProgress > 0 && uploadProgress < 100}
                                        >
                                            Hủy bỏ
                                        </Button>
                                        <Button
                                            className="bg-[#00695C] hover:bg-[#004D40] text-white font-bold rounded-2xl h-14 shadow-lg shadow-[#00695C]/20 disabled:opacity-50"
                                            onClick={handleUpload}
                                            disabled={!selectedFile || (uploadProgress > 0 && uploadProgress < 100)}
                                        >
                                            {uploadProgress > 0 ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    {uploadProgress < 100 ? 'Đang nộp...' : 'Đã xong'}
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="h-4 w-4 mr-2" />
                                                    Tải lên Cloud
                                                </>
                                            )}
                                        </Button>
                                    </div>

                                    <p className="text-[10px] text-muted-foreground mt-6 flex items-center justify-center gap-1 opacity-60">
                                        <Sparkles className="h-3 w-3" />
                                        Powered by Cloudinary & AI Analysis Portal
                                    </p>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </ParentLayout>
    );
}
