import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useUserRole, AppRole } from "@/hooks/useUserRole";
import { Users, Stethoscope } from "lucide-react";
import logo from "@/assets/logo.jfif";

export default function RoleSelection() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateRole } = useUserRole();
  const [loading, setLoading] = useState(false);

  const handleSelectRole = async (role: AppRole) => {
    setLoading(true);
    const { error } = await updateRole(role);

    if (error) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể đặt vai trò. Vui lòng thử lại.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    toast({
      title: "Chào mừng!",
      description: `Bạn đã đăng ký với vai trò ${role === 'therapist' ? 'Chuyên gia trị liệu' : 'Phụ huynh'}.`,
    });

    navigate(role === "therapist" ? "/therapist/dashboard" : "/select-mode");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <img
            src={logo}
            alt="An. Logo"
            className="h-16 w-16 rounded-2xl mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-gradient">Chào mừng đến An.</h1>
          <p className="text-muted-foreground mt-2">
            Vui lòng chọn vai trò của bạn để tiếp tục
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid gap-4">
          <Card
            className="glass-card cursor-pointer hover:ring-2 hover:ring-primary transition-all"
            onClick={() => !loading && handleSelectRole("parent")}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Tôi là Phụ huynh</h3>
                  <p className="text-sm text-muted-foreground">
                    Theo dõi tiến trình của con và kết nối với chuyên gia
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="glass-card cursor-pointer hover:ring-2 hover:ring-primary transition-all"
            onClick={() => !loading && handleSelectRole("therapist")}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-accent/50 flex items-center justify-center">
                  <Stethoscope className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Tôi là Chuyên gia trị liệu</h3>
                  <p className="text-sm text-muted-foreground">
                    Quản lý bệnh nhân và theo dõi phân tích tiến triển
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {loading && (
          <p className="text-center text-muted-foreground animate-pulse">
            Đang thiết lập tài khoản...
          </p>
        )}
      </div>
    </div>
  );
}
