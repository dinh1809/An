import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Copy, Printer, QrCode, Check } from "lucide-react";

interface TherapistConnectionCardProps {
  therapistCode: string | null;
  therapistName?: string;
}

export function TherapistConnectionCard({ therapistCode, therapistName }: TherapistConnectionCardProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const connectionUrl = therapistCode
    ? `${window.location.origin}/connect?code=${therapistCode}`
    : null;

  const handleCopyLink = async () => {
    if (!connectionUrl) return;

    try {
      await navigator.clipboard.writeText(connectionUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Share this link with parents to connect instantly.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to copy",
        description: "Please try again.",
      });
    }
  };

  const handlePrint = () => {
    if (!printRef.current) return;

    const printContent = printRef.current.innerHTML;
    const printWindow = window.open('', '', 'width=400,height=600');

    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Connection Card - ${therapistName || 'Therapist'}</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                background: white;
              }
              .card {
                border: 2px solid #e5e7eb;
                border-radius: 16px;
                padding: 32px;
                text-align: center;
                max-width: 320px;
              }
              .qr-container {
                background: white;
                padding: 16px;
                border-radius: 12px;
                display: inline-block;
                margin-bottom: 16px;
              }
              .title {
                font-size: 20px;
                font-weight: 700;
                margin-bottom: 8px;
                color: #1f2937;
              }
              .code {
                font-family: monospace;
                font-size: 18px;
                font-weight: 600;
                color: #4f46e5;
                background: #eef2ff;
                padding: 8px 16px;
                border-radius: 8px;
                margin: 12px 0;
                display: inline-block;
              }
              .instruction {
                font-size: 14px;
                color: #6b7280;
                margin-top: 12px;
              }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="qr-container">
                ${printRef.current.querySelector('.qr-container')?.innerHTML || ''}
              </div>
              <p class="title">${therapistName || "Therapist"}</p>
              <div class="code">${therapistCode}</div>
              <p class="instruction">Scan QR or visit the link to connect</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  if (!therapistCode) {
    return (
      <Card className="glass-card border border-border/50 mt-6 overflow-hidden">
        <CardHeader className="bg-muted/30">
          <CardTitle className="flex items-center gap-2 text-lg">
            <QrCode className="h-5 w-5 text-muted-foreground" />
            Connection Card
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-8 pb-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-muted/50 text-muted-foreground">
              <QrCode className="h-8 w-8" />
            </div>
            <div className="max-w-[280px] mx-auto">
              <h4 className="font-bold text-slate-900">Chưa có mã kết nối</h4>
              <p className="text-sm text-muted-foreground mt-2">
                Hệ thống chưa tìm thấy mã của bạn. Vui lòng kiểm tra lại thông tin cá nhân hoặc nhấn nút tạo mã ở phía trên.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border border-border/50 mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <QrCode className="h-5 w-5 text-primary" />
          Your Connection Card
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Printable Card */}
        <div
          ref={printRef}
          className="bg-card border-2 border-dashed border-border rounded-2xl p-6 text-center"
        >
          <div className="card">
            <div className="qr-container bg-white p-4 rounded-xl inline-block shadow-sm">
              <QRCodeSVG
                value={connectionUrl || ""}
                size={180}
                level="H"
                includeMargin={false}
              />
            </div>
            <p className="title text-lg font-bold mt-4">
              {therapistName || "Therapist"}
            </p>
            <div className="code bg-primary/10 text-primary px-4 py-2 rounded-lg inline-block font-mono font-semibold text-lg mt-2">
              {therapistCode}
            </div>
            <p className="instruction text-sm text-muted-foreground mt-4">
              Scan QR or visit the link to connect
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleCopyLink}
            variant="outline"
            className="flex-1 gap-2 h-11 rounded-xl"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy Link
              </>
            )}
          </Button>
          <Button
            onClick={handlePrint}
            variant="outline"
            className="flex-1 gap-2 h-11 rounded-xl"
          >
            <Printer className="h-4 w-4" />
            Print Card
          </Button>
        </div>

        {/* Instructions */}
        <div className="bg-muted/50 rounded-xl p-4">
          <p className="text-sm text-muted-foreground text-center">
            📱 Show this QR to parents or send them the link to connect instantly.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
