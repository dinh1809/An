import { Outlet, useNavigate } from "react-router-dom";
import { X, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { GameSoundProvider, useGameSoundContext } from "@/hooks/useGameSound";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function FocusLayoutInner() {
  const navigate = useNavigate();
  const { isMuted, setMuted } = useGameSoundContext();

  const handleExit = () => {
    navigate("/assessment");
  };

  const toggleMute = () => {
    setMuted(!isMuted);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50/50 dark:from-slate-950 dark:to-violet-950/30 relative">
      {/* Top Right Controls */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        {/* Sound Toggle */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="h-10 w-10 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all hover:bg-white dark:hover:bg-slate-800"
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Volume2 className="h-5 w-5 text-muted-foreground" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isMuted ? "Bật âm thanh" : "Tắt âm thanh"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Exit Button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all hover:bg-white dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Thoát khỏi bài đánh giá?</AlertDialogTitle>
              <AlertDialogDescription>
                Tiến trình hiện tại sẽ được lưu lại. Bạn có thể quay lại tiếp tục bất cứ lúc nào.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Tiếp tục</AlertDialogCancel>
              <AlertDialogAction onClick={handleExit}>
                Thoát
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Main Content - Full Screen, No Distractions */}
      <main className="min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}

export function FocusLayout() {
  return (
    <GameSoundProvider>
      <FocusLayoutInner />
    </GameSoundProvider>
  );
}
