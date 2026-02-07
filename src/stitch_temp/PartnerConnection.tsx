import React, { useState } from 'react';
import {
    Search, MapPin, Star, Check, Shield, ChevronDown,
    ArrowLeft, ToggleLeft, ToggleRight, X
} from 'lucide-react';
import { colors, typography, borderRadius, shadows } from './designTokens';
import { Card, Button, Badge } from './components/ui';
import { partners } from './mockData';

export interface PartnerConnectionProps {
    readonly onPartnerView?: (partnerId: number) => void;
    readonly onPartnerConnect?: (partnerId: number) => void;
    readonly onSearch?: (query: string) => void;
    readonly onBack?: () => void;
}

type PartnerCategory = 'all' | 'therapist' | 'employer' | 'school';

// Partner Card Component
const PartnerCard: React.FC<{
    partner: typeof partners[0];
    onView?: () => void;
    onConnect?: () => void;
}> = ({ partner, onView, onConnect }) => {
    return (
        <div
            style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${colors.gray[200]}`,
                borderRadius: borderRadius.xl,
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 200ms ease',
            }}
        >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                <img
                    src={partner.avatar}
                    alt={partner.name}
                    style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: borderRadius.full,
                        flexShrink: 0,
                    }}
                />
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h3
                            style={{
                                fontSize: typography.fontSize.base,
                                fontWeight: typography.fontWeight.semibold,
                                color: colors.gray[900],
                                margin: 0,
                            }}
                        >
                            {partner.name}
                        </h3>
                        {partner.verified && (
                            <Check
                                size={16}
                                style={{
                                    color: 'white',
                                    background: colors.secondary[500],
                                    borderRadius: borderRadius.full,
                                    padding: '2px',
                                }}
                            />
                        )}
                    </div>
                    <p
                        style={{
                            fontSize: typography.fontSize.sm,
                            color: colors.gray[600],
                            margin: '0.25rem 0 0 0',
                        }}
                    >
                        {partner.role}
                    </p>
                    <p
                        style={{
                            fontSize: typography.fontSize.sm,
                            color: colors.gray[500],
                            margin: '0.25rem 0 0 0',
                        }}
                    >
                        {partner.company}
                    </p>
                </div>
            </div>

            {/* Location */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: typography.fontSize.sm,
                    color: colors.gray[500],
                    marginBottom: '0.75rem',
                }}
            >
                <MapPin size={14} />
                {partner.location}
            </div>

            {/* Match & Rating */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <Badge variant="primary">
                    {partner.matchPercent}% phù hợp
                </Badge>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: colors.gray[600] }}>
                    <Star size={14} fill={colors.warning} style={{ color: colors.warning }} />
                    <span style={{ fontSize: typography.fontSize.sm, fontFamily: typography.fontFamily.mono }}>
                        {partner.rating}
                    </span>
                    <span style={{ fontSize: typography.fontSize.xs, color: colors.gray[400] }}>
                        ({partner.reviewCount} đánh giá)
                    </span>
                </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Button variant="ghost" size="sm" onClick={onView} fullWidth>
                    Xem hồ sơ
                </Button>
                <Button variant="primary" size="sm" onClick={onConnect} fullWidth>
                    Kết nối
                </Button>
            </div>
        </div>
    );
};

// Connected Partner Mini Card
const ConnectedPartnerCard: React.FC<{ partner: typeof partners[0] }> = ({ partner }) => (
    <div
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem',
            background: colors.gray[50],
            borderRadius: borderRadius.lg,
        }}
    >
        <img
            src={partner.avatar}
            alt={partner.name}
            style={{
                width: '36px',
                height: '36px',
                borderRadius: borderRadius.full,
            }}
        />
        <div style={{ flex: 1 }}>
            <div style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium }}>
                {partner.name}
            </div>
            <div style={{ fontSize: typography.fontSize.xs, color: colors.gray[500] }}>
                {partner.role}
            </div>
        </div>
        <Badge variant="success" size="sm">Đã kết nối</Badge>
    </div>
);

// Connection Modal
const ConnectionModal: React.FC<{
    partner: typeof partners[0];
    onClose: () => void;
    onConfirm: () => void;
}> = ({ partner, onClose, onConfirm }) => (
    <div
        style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
        }}
    >
        <div
            style={{
                background: 'white',
                borderRadius: borderRadius.xl,
                padding: '2rem',
                maxWidth: '400px',
                width: '90%',
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h3
                    style={{
                        fontSize: typography.fontSize.lg,
                        fontWeight: typography.fontWeight.semibold,
                        color: colors.gray[900],
                        margin: 0,
                    }}
                >
                    Xác nhận kết nối
                </h3>
                <button
                    onClick={onClose}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: colors.gray[400],
                    }}
                >
                    <X size={20} />
                </button>
            </div>

            {/* Partner Preview */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    background: colors.gray[50],
                    borderRadius: borderRadius.lg,
                    marginBottom: '1.5rem',
                }}
            >
                <img
                    src={partner.avatar}
                    alt={partner.name}
                    style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: borderRadius.full,
                    }}
                />
                <div>
                    <div style={{ fontWeight: typography.fontWeight.medium }}>{partner.name}</div>
                    <div style={{ fontSize: typography.fontSize.sm, color: colors.gray[500] }}>{partner.role}</div>
                </div>
            </div>

            <p style={{ fontSize: typography.fontSize.sm, color: colors.gray[600], marginBottom: '1rem' }}>
                Bạn có muốn gửi yêu cầu kết nối tới {partner.name}?
            </p>

            {/* Consent Checkbox */}
            <label
                style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '1rem',
                    background: colors.infoBg,
                    borderRadius: borderRadius.lg,
                    marginBottom: '1.5rem',
                    cursor: 'pointer',
                }}
            >
                <input type="checkbox" style={{ marginTop: '2px' }} />
                <span style={{ fontSize: typography.fontSize.sm, color: colors.gray[600] }}>
                    Tôi đồng ý chia sẻ hồ sơ đánh giá với chuyên gia này để được tư vấn phù hợp.
                </span>
            </label>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Button variant="ghost" onClick={onClose} fullWidth>
                    Hủy
                </Button>
                <Button variant="primary" onClick={onConfirm} fullWidth>
                    Xác nhận kết nối
                </Button>
            </div>
        </div>
    </div>
);

export const PartnerConnection: React.FC<PartnerConnectionProps> = ({
    onPartnerView,
    onPartnerConnect,
    onSearch,
    onBack,
}) => {
    const [selectedCategory, setSelectedCategory] = useState<PartnerCategory>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [shareProfile, setShareProfile] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedPartner, setSelectedPartner] = useState<typeof partners[0] | null>(null);

    const categories: { key: PartnerCategory; label: string }[] = [
        { key: 'all', label: 'Tất cả' },
        { key: 'therapist', label: 'Therapist' },
        { key: 'employer', label: 'Nhà tuyển dụng' },
        { key: 'school', label: 'Trường học' },
    ];

    const handleConnect = (partner: typeof partners[0]) => {
        setSelectedPartner(partner);
        setShowModal(true);
    };

    const handleConfirmConnect = () => {
        if (selectedPartner) {
            onPartnerConnect?.(selectedPartner.id);
        }
        setShowModal(false);
        setSelectedPartner(null);
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                background: colors.gray[50],
                fontFamily: typography.fontFamily.primary,
            }}
        >
            {/* Header */}
            <header
                style={{
                    padding: '1.5rem 2rem',
                    background: 'white',
                    borderBottom: `1px solid ${colors.gray[200]}`,
                }}
            >
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <button
                            onClick={onBack}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '0.5rem',
                                display: 'flex',
                                color: colors.gray[600],
                            }}
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h1
                                style={{
                                    fontSize: typography.fontSize['2xl'],
                                    fontWeight: typography.fontWeight.bold,
                                    color: colors.gray[900],
                                    margin: 0,
                                }}
                            >
                                Kết Nối Partner
                            </h1>
                            <p
                                style={{
                                    fontSize: typography.fontSize.base,
                                    color: colors.gray[500],
                                    margin: '0.25rem 0 0 0',
                                }}
                            >
                                Tìm chuyên gia và nhà tuyển dụng phù hợp
                            </p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            background: colors.gray[50],
                            borderRadius: borderRadius.full,
                            padding: '0.75rem 1.25rem',
                            border: `1px solid ${colors.gray[200]}`,
                            maxWidth: '400px',
                        }}
                    >
                        <Search size={20} style={{ color: colors.gray[400] }} />
                        <input
                            type="text"
                            placeholder="Tìm theo tên, vị trí..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                onSearch?.(e.target.value);
                            }}
                            style={{
                                flex: 1,
                                border: 'none',
                                background: 'none',
                                outline: 'none',
                                fontSize: typography.fontSize.base,
                                fontFamily: typography.fontFamily.primary,
                                color: colors.gray[900],
                            }}
                        />
                    </div>
                </div>
            </header>

            {/* Filter Bar */}
            <div
                style={{
                    padding: '1rem 2rem',
                    background: 'white',
                    borderBottom: `1px solid ${colors.gray[200]}`,
                }}
            >
                <div
                    style={{
                        maxWidth: '1200px',
                        margin: '0 auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    {/* Category Pills */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {categories.map((cat) => (
                            <button
                                key={cat.key}
                                onClick={() => setSelectedCategory(cat.key)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: borderRadius.full,
                                    border: 'none',
                                    background: selectedCategory === cat.key ? colors.primary[500] : colors.gray[100],
                                    color: selectedCategory === cat.key ? 'white' : colors.gray[600],
                                    fontFamily: typography.fontFamily.primary,
                                    fontSize: typography.fontSize.sm,
                                    fontWeight: typography.fontWeight.medium,
                                    cursor: 'pointer',
                                    transition: 'all 200ms ease',
                                }}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Dropdowns */}
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                background: 'white',
                                border: `1px solid ${colors.gray[200]}`,
                                borderRadius: borderRadius.md,
                                fontSize: typography.fontSize.sm,
                                color: colors.gray[600],
                                cursor: 'pointer',
                            }}
                        >
                            Thành phố
                            <ChevronDown size={16} />
                        </button>
                        <button
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                background: 'white',
                                border: `1px solid ${colors.gray[200]}`,
                                borderRadius: borderRadius.md,
                                fontSize: typography.fontSize.sm,
                                color: colors.gray[600],
                                cursor: 'pointer',
                            }}
                        >
                            Sắp xếp: Phù hợp nhất
                            <ChevronDown size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main
                style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: '2rem',
                    display: 'grid',
                    gridTemplateColumns: '1fr 320px',
                    gap: '2rem',
                }}
            >
                {/* Partner Grid */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: '1.5rem',
                    }}
                >
                    {partners.map((partner) => (
                        <PartnerCard
                            key={partner.id}
                            partner={partner}
                            onView={() => onPartnerView?.(partner.id)}
                            onConnect={() => handleConnect(partner)}
                        />
                    ))}
                </div>

                {/* Sidebar */}
                <div>
                    {/* Connected Partners */}
                    <Card padding="lg">
                        <h3
                            style={{
                                fontSize: typography.fontSize.base,
                                fontWeight: typography.fontWeight.semibold,
                                color: colors.gray[900],
                                margin: '0 0 1rem 0',
                            }}
                        >
                            Đã kết nối
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {partners.slice(0, 2).map((partner) => (
                                <ConnectedPartnerCard key={partner.id} partner={partner} />
                            ))}
                        </div>
                    </Card>

                    {/* Share Profile Toggle */}
                    <Card padding="lg" className="mt-4" style={{ marginTop: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium }}>
                                Chia sẻ hồ sơ
                            </span>
                            <button
                                onClick={() => setShareProfile(!shareProfile)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: shareProfile ? colors.primary[500] : colors.gray[400],
                                }}
                            >
                                {shareProfile ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                            </button>
                        </div>
                    </Card>

                    {/* Security Note */}
                    <Card padding="md" style={{ marginTop: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Shield size={20} style={{ color: colors.primary[500] }} />
                            <span style={{ fontSize: typography.fontSize.sm, color: colors.gray[600] }}>
                                Dữ liệu được mã hóa AES-256
                            </span>
                        </div>
                    </Card>
                </div>
            </main>

            {/* Connection Modal */}
            {showModal && selectedPartner && (
                <ConnectionModal
                    partner={selectedPartner}
                    onClose={() => setShowModal(false)}
                    onConfirm={handleConfirmConnect}
                />
            )}
        </div>
    );
};

export default PartnerConnection;
