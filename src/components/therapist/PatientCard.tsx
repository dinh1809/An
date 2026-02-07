/**
 * Patient Card Component
 * Individual patient card for grid/kanban view
 */

import { User, Calendar, AlertTriangle, Video } from 'lucide-react';
import { Patient } from '@/data/patientsMockData';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface PatientCardProps {
    readonly patient: Patient;
}

const levelColors = {
    1: 'bg-[#FFF3E0] text-[#F57C00] border-[#F57C00]',
    2: 'bg-[#FFF9C4] text-[#F9A825] border-[#F9A825]',
    3: 'bg-[#FFEBEE] text-[#D32F2F] border-[#D32F2F]',
};

const statusLabels = {
    intake: 'Tiếp nhận',
    active: 'Đang điều trị',
    maintenance: 'Duy trì',
    discharge: 'Xuất viện',
};

const statusColors = {
    intake: 'bg-[#E3F2FD] text-[#1976D2]',
    active: 'bg-[#E8F5E9] text-[#2E7D32]',
    maintenance: 'bg-[#F3E5F5] text-[#7B1FA2]',
    discharge: 'bg-[#F5F5F5] text-[#616161]',
};

export function PatientCard({ patient }: PatientCardProps) {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/therapist/patient/${patient.id}`);
    };

    return (
        <div
            onClick={handleClick}
            className={cn(
                'bg-white rounded-xl border border-[#E5E7EB] p-6 hover:shadow-lg transition-all cursor-pointer',
                patient.alertLevel === 'high' && 'ring-2 ring-[#D32F2F]'
            )}
        >
            {/* Alert Badge */}
            {patient.alertLevel === 'high' && (
                <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-[#FFEBEE] rounded-lg">
                    <AlertTriangle size={16} className="text-[#D32F2F]" />
                    <span className="text-sm font-medium text-[#D32F2F]">Cần chú ý</span>
                </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-[#E0F2F1] flex items-center justify-center">
                        <User size={24} className="text-[#00695C]" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-[#1F2937]">{patient.name}</h3>
                        <p className="text-sm text-[#4B5563]">{patient.age} tuổi</p>
                    </div>
                </div>

                {/* Level Badge */}
                <span
                    className={cn(
                        'px-2 py-1 rounded-lg text-xs font-semibold border',
                        levelColors[patient.level]
                    )}
                >
                    Level {patient.level}
                </span>
            </div>

            {/* Diagnosis */}
            <p className="text-sm text-[#4B5563] mb-4">{patient.diagnosis}</p>

            {/* Status & Guardian */}
            <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-[#4B5563]">Trạng thái:</span>
                    <span
                        className={cn(
                            'px-3 py-1 rounded-full text-xs font-medium',
                            statusColors[patient.status]
                        )}
                    >
                        {statusLabels[patient.status]}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-xs text-[#4B5563]">Người giám hộ:</span>
                    <span className="text-xs font-medium text-[#1F2937]">
                        {patient.guardian}
                    </span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-[#4B5563]">Tiến độ</span>
                    <span className="text-xs font-bold text-[#00695C]">
                        {patient.progress}%
                    </span>
                </div>
                <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[#00695C] rounded-full transition-all"
                        style={{ width: `${patient.progress}%` }}
                    />
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-[#F3F4F6]">
                <div className="flex items-center gap-2 text-xs text-[#4B5563]">
                    <Calendar size={14} />
                    <span>
                        {patient.nextSession
                            ? `${new Date(patient.nextSession).toLocaleDateString('vi-VN')}`
                            : 'Chưa hẹn'}
                    </span>
                </div>

                {patient.videosPending > 0 && (
                    <div className="flex items-center gap-2 px-2 py-1 bg-[#FFF3E0] rounded-lg">
                        <Video size={14} className="text-[#F57C00]" />
                        <span className="text-xs font-medium text-[#F57C00]">
                            {patient.videosPending} video
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
