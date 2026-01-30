/**
 * Patient Management Page
 * Main page for managing patient caseload
 * Route: /therapist/patients
 */

import { useState } from 'react';
import { MasterTopbar } from '@/components/layout/MasterTopbar';
import { PatientCard } from '@/components/therapist/PatientCard';
import { mockPatients, Patient } from '@/data/patientsMockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LayoutGrid, List, Search, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

type ViewMode = 'grid' | 'list';
type FilterStatus = 'all' | Patient['status'];
type FilterLevel = 'all' | Patient['level'];

export default function PatientManagement() {
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
    const [filterLevel, setFilterLevel] = useState<FilterLevel>('all');

    // Filter logic
    const filteredPatients = mockPatients.filter((patient) => {
        const matchesSearch =
            patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            patient.guardian.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
            filterStatus === 'all' || patient.status === filterStatus;
        const matchesLevel =
            filterLevel === 'all' || patient.level === filterLevel;

        return matchesSearch && matchesStatus && matchesLevel;
    });

    // Count by status
    const statusCounts = {
        all: mockPatients.length,
        intake: mockPatients.filter((p) => p.status === 'intake').length,
        active: mockPatients.filter((p) => p.status === 'active').length,
        maintenance: mockPatients.filter((p) => p.status === 'maintenance').length,
        discharge: mockPatients.filter((p) => p.status === 'discharge').length,
    };

    return (
        <div className="min-h-screen">
            <MasterTopbar title="Quản lý bệnh nhân" showSearch={false} />

            <div className="pt-24 px-8 pb-8">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
                        <p className="text-sm text-[#4B5563] mb-1">Tổng bệnh nhân</p>
                        <p className="text-3xl font-bold text-[#1F2937]">{statusCounts.all}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
                        <p className="text-sm text-[#4B5563] mb-1">Đang điều trị</p>
                        <p className="text-3xl font-bold text-[#00695C]">{statusCounts.active}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
                        <p className="text-sm text-[#4B5563] mb-1">Tiếp nhận mới</p>
                        <p className="text-3xl font-bold text-[#1976D2]">{statusCounts.intake}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
                        <p className="text-sm text-[#4B5563] mb-1">Duy trì</p>
                        <p className="text-3xl font-bold text-[#7B1FA2]">{statusCounts.maintenance}</p>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        {/* Search */}
                        <div className="flex-1">
                            <label className="text-sm font-medium text-[#1F2937] mb-2 block">
                                Tìm kiếm
                            </label>
                            <div className="relative">
                                <Search
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]"
                                />
                                <Input
                                    type="search"
                                    placeholder="Tên bệnh nhân hoặc người giám hộ..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="w-full md:w-48">
                            <label className="text-sm font-medium text-[#1F2937] mb-2 block">
                                Trạng thái
                            </label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                                className="w-full h-10 px-3 rounded-lg border border-[#E5E7EB] bg-white text-sm"
                            >
                                <option value="all">Tất cả ({statusCounts.all})</option>
                                <option value="intake">Tiếp nhận ({statusCounts.intake})</option>
                                <option value="active">Đang điều trị ({statusCounts.active})</option>
                                <option value="maintenance">Duy trì ({statusCounts.maintenance})</option>
                                <option value="discharge">Xuất viện ({statusCounts.discharge})</option>
                            </select>
                        </div>

                        {/* Level Filter */}
                        <div className="w-full md:w-40">
                            <label className="text-sm font-medium text-[#1F2937] mb-2 block">
                                Mức độ
                            </label>
                            <select
                                value={filterLevel}
                                onChange={(e) =>
                                    setFilterLevel(
                                        e.target.value === 'all' ? 'all' : parseInt(e.target.value) as FilterLevel
                                    )
                                }
                                className="w-full h-10 px-3 rounded-lg border border-[#E5E7EB] bg-white text-sm"
                            >
                                <option value="all">Tất cả</option>
                                <option value="1">Level 1</option>
                                <option value="2">Level 2</option>
                                <option value="3">Level 3</option>
                            </select>
                        </div>

                        {/* View Toggle */}
                        <div className="flex gap-2">
                            <Button
                                variant={viewMode === 'grid' ? 'default' : 'outline'}
                                size="icon"
                                onClick={() => setViewMode('grid')}
                                className={cn(
                                    viewMode === 'grid' && 'bg-[#00695C] hover:bg-[#004D40]'
                                )}
                            >
                                <LayoutGrid size={18} />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'default' : 'outline'}
                                size="icon"
                                onClick={() => setViewMode('list')}
                                className={cn(
                                    viewMode === 'list' && 'bg-[#00695C] hover:bg-[#004D40]'
                                )}
                            >
                                <List size={18} />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Results Count */}
                <div className="mb-4">
                    <p className="text-sm text-[#4B5563]">
                        Hiển thị <span className="font-bold text-[#1F2937]">{filteredPatients.length}</span> bệnh nhân
                    </p>
                </div>

                {/* Patient Grid */}
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPatients.map((patient) => (
                            <PatientCard key={patient.id} patient={patient} />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredPatients.map((patient) => (
                            <PatientCard key={patient.id} patient={patient} />
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {filteredPatients.length === 0 && (
                    <div className="text-center py-12">
                        <Filter size={48} className="mx-auto text-[#9CA3AF] mb-4" />
                        <h3 className="text-lg font-bold text-[#1F2937] mb-2">
                            Không tìm thấy bệnh nhân
                        </h3>
                        <p className="text-sm text-[#4B5563]">
                            Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
