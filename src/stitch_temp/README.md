# Stitch Components - An Hướng Nghiệp

Các React components được chuyển đổi từ Stitch project.

## 📁 Cấu trúc thư mục

```
stitch_temp/
├── index.ts              # Main exports
├── designTokens.ts       # Design system tokens từ DESIGN_SYSTEM.md
├── mockData.ts           # Mock data cho components
├── components/
│   └── ui/
│       └── index.tsx     # Core UI components (Card, Button, Badge, etc.)
├── GameSelectionDashboard.tsx  # Trung tâm Huấn luyện
├── AssessmentResult.tsx        # Kết quả đánh giá với Radar Chart
├── ParentGuidance.tsx          # Hướng dẫn phụ huynh
└── PartnerConnection.tsx       # Kết nối Partner
```

## 🎨 Design Tokens

Components sử dụng design tokens từ `DESIGN_SYSTEM.md`:

- **Colors**: Primary Teal (#14B8A6), Secondary Purple (#A855F7)
- **Typography**: Inter (UI), JetBrains Mono (data/numbers)
- **Cards**: Glassmorphism style với backdrop-blur
- **Border Radius**: 16px cho cards, 8px cho buttons

## 📋 Stitch Project Info

| Field | Value |
|-------|-------|
| Project ID | `11490095977847764450` |
| Project Name | An Hướng Nghiệp |
| Model | GEMINI_3_PRO |
| Device | DESKTOP (1440px) |
| Total Screens | 14 |

## 🖥️ Screen IDs

### Màn hình chính
- Assessment Interface: `8fe40ac025ea48ad85c1aef21a1603e0`
- Assessment Result: `9c4ddcb240134a74b78dbd5b9b3198fc`
- Pathway Guidance: `c970df1604324508b7bcab5a4624cf5d`
- Partner Connection: `7955cf9dade642c7851abe09d644398b`
- Game Selection: `356346375eb4434ca2053b2d57bf215e`

### Games cơ bản
- Thợ Săn Chi Tiết: `cb3ea133f56744299ed9c4c2d03f074d`
- Hỗn Loạn Stroop: `1053d1e3c572461f8c47d16553a649ba`
- Bậc Thầy Chuỗi Số: `44d967864cde4c839512c17c77bffb0b`
- Logic Hình Ảnh: `53d72e27a5384574af82069d0ba66ee5`
- Điều Phối Viên: `fccd7db77e874d1d92712180329b1dd9`
- Nhà Soạn Nhạc: `baed9a04716a40e387791bb758a536ba`

### Games nâng cao
- Kho Thời Gian (N-Back): `82de4b903bca42afa3de4f4ef508b743`
- Vượt Qua Lệnh (Stroop): `b6fc6e946ca44a3896028e7746f13d2a`
- Ma Trận Biến Đổi (WCST): `09517881bb9d41829f5ea2901b9b70d9`

## 🚀 Sử dụng

```tsx
import { 
  GameSelectionDashboard,
  AssessmentResult,
  ParentGuidance,
  PartnerConnection 
} from './stitch_temp';

// Hoặc import design tokens
import { colors, typography } from './stitch_temp/designTokens';
```

## 🔗 Xem trên Stitch

[https://stitch.withgoogle.com/projects/11490095977847764450](https://stitch.withgoogle.com/projects/11490095977847764450)

## ⚠️ Lưu ý

Đây là code tạm để kiểm tra. Sau khi approve, cần:

1. Di chuyển components sang `src/components/` phù hợp
2. Kết nối với data thật (Supabase)
3. Thêm routing và navigation
4. Viết tests
