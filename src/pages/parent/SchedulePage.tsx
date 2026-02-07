import React, { useState } from 'react';
import { ParentLayout } from '@/components/layout/ParentLayout';
import {
    Star,
    ChevronLeft,
    ChevronRight,
    Sun,
    Cloud,
    Moon,
    ArrowRight,
    Baby,
    Stethoscope,
    Calendar,
    Edit3,
    CheckCircle
} from 'lucide-react';

interface Therapist {
    id: string;
    name: string;
    specialty: string;
    rating: number;
    reviews: number;
    avatar?: string;
}

interface TimeSlot {
    time: string;
    available: boolean;
}

export default function SchedulePage() {
    const [selectedTherapist, setSelectedTherapist] = useState('1');
    const [selectedDate, setSelectedDate] = useState(14);
    const [selectedTime, setSelectedTime] = useState('13:30');
    const [notes, setNotes] = useState('');
    const [currentMonth] = useState('Tháng 01, 2026');

    const therapists: Therapist[] = [
        { id: '1', name: 'Dr. Nguyen Van A', specialty: 'Chuyên gia Ngôn ngữ trị liệu', rating: 4.9, reviews: 120 },
        { id: '2', name: 'Dr. Le Thi B', specialty: 'Chuyên gia Tâm lý lâm sàng', rating: 4.8, reviews: 98 },
        { id: '3', name: 'Dr. Tran Van C', specialty: 'Chuyên gia Hành vi', rating: 5.0, reviews: 45 },
    ];

    const timeSlots = {
        morning: [
            { time: '08:00', available: false },
            { time: '09:00', available: true },
            { time: '10:00', available: false },
            { time: '11:00', available: true },
        ],
        afternoon: [
            { time: '13:30', available: true },
            { time: '14:30', available: true },
            { time: '15:30', available: true },
            { time: '16:30', available: false },
        ],
        evening: [
            { time: '18:00', available: true },
            { time: '19:00', available: false },
        ],
    };

    // Calendar data
    const calendarDays = [
        { day: 25, disabled: true }, { day: 26, disabled: true }, { day: 27, disabled: true },
        { day: 28, disabled: true }, { day: 29, disabled: true }, { day: 30, disabled: true },
        { day: 1, disabled: false }, { day: 2, disabled: false }, { day: 3, disabled: false },
        { day: 4, disabled: false }, { day: 5, disabled: false }, { day: 6, disabled: false },
        { day: 7, disabled: false }, { day: 8, disabled: false }, { day: 9, disabled: false },
        { day: 10, disabled: false }, { day: 11, disabled: false }, { day: 12, disabled: false },
        { day: 13, disabled: false, hasSlot: true }, { day: 14, disabled: false, selected: true },
        { day: 15, disabled: false, hasSlot: true }, { day: 16, disabled: false, hasSlot: true },
        { day: 17, disabled: false },
    ];

    const selectedTherapistData = therapists.find(t => t.id === selectedTherapist);

    return (
        <ParentLayout>
            {/* Page Heading */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
                    Đặt lịch điều trị
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-base">
                    Chọn chuyên gia và thời gian phù hợp nhất cho bé Minh Anh.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Therapist & Calendar Selection */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Therapist Selection */}
                    <section className="bg-white dark:bg-[#1a2e2c] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Chọn chuyên gia</h3>
                            <a href="/parent/map" className="text-sm text-[#00695C] font-medium hover:underline">
                                Xem tất cả
                            </a>
                        </div>
                        <div className="p-4 space-y-3">
                            {therapists.map((therapist) => (
                                <label key={therapist.id} className="relative group cursor-pointer block">
                                    <input
                                        type="radio"
                                        name="therapist"
                                        checked={selectedTherapist === therapist.id}
                                        onChange={() => setSelectedTherapist(therapist.id)}
                                        className="peer sr-only"
                                    />
                                    <div className={`flex items-center gap-4 p-3 rounded-lg border-2 transition-all ${selectedTherapist === therapist.id
                                            ? 'border-[#00695C] bg-[#00695C]/5 dark:bg-[#00695C]/10'
                                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-transparent hover:border-[#00695C]/50 hover:bg-gray-50 dark:hover:bg-[#152523]'
                                        }`}>
                                        <div className="relative">
                                            <div className={`h-14 w-14 rounded-full bg-gradient-to-br from-[#00695C] to-[#004D40] flex items-center justify-center text-white font-bold ${selectedTherapist !== therapist.id ? 'grayscale group-hover:grayscale-0' : ''
                                                } transition-all`}>
                                                {therapist.name.split(' ').slice(-2).map(n => n[0]).join('')}
                                            </div>
                                            {selectedTherapist === therapist.id && (
                                                <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-0.5 shadow-sm">
                                                    <CheckCircle size={18} className="text-[#00695C] fill-[#00695C]/20" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-gray-900 dark:text-white truncate">{therapist.name}</h4>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm truncate">{therapist.specialty}</p>
                                            <div className="flex items-center gap-1 mt-1">
                                                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{therapist.rating}</span>
                                                <span className="text-xs text-gray-400">({therapist.reviews} đánh giá)</span>
                                            </div>
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </section>

                    {/* Calendar */}
                    <section className="bg-white dark:bg-[#1a2e2c] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{currentMonth}</h3>
                            <div className="flex gap-2">
                                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400">
                                    <ChevronLeft size={20} />
                                </button>
                                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400">
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Calendar Header */}
                        <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
                            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => (
                                <span key={day} className="text-gray-400 py-2 text-xs font-medium">{day}</span>
                            ))}
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1 text-sm font-medium">
                            {calendarDays.map((item, idx) => (
                                <button
                                    key={idx}
                                    disabled={item.disabled}
                                    onClick={() => !item.disabled && setSelectedDate(item.day)}
                                    className={`h-10 w-10 mx-auto rounded-full relative transition-all ${item.disabled
                                            ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                            : selectedDate === item.day
                                                ? 'bg-[#00695C] text-white shadow-md shadow-[#00695C]/30'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    {item.day}
                                    {item.hasSlot && selectedDate !== item.day && (
                                        <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full"></span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Legend */}
                        <div className="mt-4 flex items-center gap-4 text-xs text-gray-500 justify-center">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#00695C]"></span> Đang chọn
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span> Còn trống
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-gray-300"></span> Đã kín
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column: Time Slots & Summary */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Time Slots */}
                    <section className="bg-white dark:bg-[#1a2e2c] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                Chọn khung giờ - {selectedDate}/01/2026
                            </h3>
                            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                                Còn 5 chỗ trống
                            </span>
                        </div>

                        <div className="space-y-6">
                            {/* Morning */}
                            <div>
                                <h4 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3 flex items-center gap-2">
                                    <Sun size={16} /> Buổi Sáng
                                </h4>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                    {timeSlots.morning.map((slot) => (
                                        <button
                                            key={slot.time}
                                            disabled={!slot.available}
                                            onClick={() => slot.available && setSelectedTime(slot.time)}
                                            className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${!slot.available
                                                    ? 'border-gray-200 dark:border-gray-700 text-gray-400 bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed'
                                                    : selectedTime === slot.time
                                                        ? 'bg-[#00695C] text-white shadow-md shadow-[#00695C]/20 border-[#00695C] ring-2 ring-[#00695C] ring-offset-2 ring-offset-white dark:ring-offset-gray-900'
                                                        : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[#00695C] hover:text-[#00695C] bg-white dark:bg-transparent'
                                                }`}
                                        >
                                            {slot.time}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Afternoon */}
                            <div>
                                <h4 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3 flex items-center gap-2">
                                    <Cloud size={16} /> Buổi Chiều
                                </h4>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                    {timeSlots.afternoon.map((slot) => (
                                        <button
                                            key={slot.time}
                                            disabled={!slot.available}
                                            onClick={() => slot.available && setSelectedTime(slot.time)}
                                            className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${!slot.available
                                                    ? 'border-gray-200 dark:border-gray-700 text-gray-400 bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed'
                                                    : selectedTime === slot.time
                                                        ? 'bg-[#00695C] text-white shadow-md shadow-[#00695C]/20 border-[#00695C] ring-2 ring-[#00695C] ring-offset-2 ring-offset-white dark:ring-offset-gray-900'
                                                        : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[#00695C] hover:text-[#00695C] bg-white dark:bg-transparent'
                                                }`}
                                        >
                                            {slot.time}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Evening */}
                            <div>
                                <h4 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3 flex items-center gap-2">
                                    <Moon size={16} /> Buổi Tối
                                </h4>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                    {timeSlots.evening.map((slot) => (
                                        <button
                                            key={slot.time}
                                            disabled={!slot.available}
                                            onClick={() => slot.available && setSelectedTime(slot.time)}
                                            className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${!slot.available
                                                    ? 'border-gray-200 dark:border-gray-700 text-gray-400 bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed'
                                                    : selectedTime === slot.time
                                                        ? 'bg-[#00695C] text-white shadow-md shadow-[#00695C]/20 border-[#00695C] ring-2 ring-[#00695C] ring-offset-2 ring-offset-white dark:ring-offset-gray-900'
                                                        : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[#00695C] hover:text-[#00695C] bg-white dark:bg-transparent'
                                                }`}
                                        >
                                            {slot.time}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Booking Summary & Notes */}
                    <section className="bg-white dark:bg-[#1a2e2c] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col md:flex-row">
                        {/* Summary Info */}
                        <div className="p-6 md:w-1/2 space-y-4 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800">
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">Thông tin phiên hẹn</h3>

                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300">
                                    <Baby size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Bệnh nhân nhí</p>
                                    <p className="text-gray-900 dark:text-white font-medium">Bé Nguyễn Minh Anh</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300">
                                    <Stethoscope size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Chuyên gia</p>
                                    <p className="text-gray-900 dark:text-white font-medium">{selectedTherapistData?.name}</p>
                                    <p className="text-gray-500 text-sm">{selectedTherapistData?.specialty}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-[#00695C]/10 text-[#00695C]">
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Thời gian</p>
                                    <p className="text-gray-900 dark:text-white font-medium text-lg">{selectedTime} - {
                                        (() => {
                                            const [hour, min] = selectedTime.split(':').map(Number);
                                            return `${(hour + 1).toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
                                        })()
                                    }</p>
                                    <p className="text-gray-500 text-sm">Thứ 7, {selectedDate} Tháng 01, 2026</p>
                                </div>
                            </div>
                        </div>

                        {/* Notes Form */}
                        <div className="p-6 md:w-1/2 bg-gray-50/50 dark:bg-gray-800/20 flex flex-col">
                            <label className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <Edit3 size={18} className="text-gray-400" />
                                Ghi chú cho chuyên gia
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Nhập ghi chú về tình trạng của bé hoặc những điều cần lưu ý cho buổi trị liệu này..."
                                className="w-full flex-grow rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm p-3 focus:ring-[#00695C] focus:border-[#00695C] min-h-[140px] resize-none"
                            />
                        </div>
                    </section>

                    {/* Action Button */}
                    <div className="flex justify-end pt-2">
                        <button className="w-full sm:w-auto bg-[#00695C] hover:bg-[#004D40] text-white font-bold text-lg py-3.5 px-10 rounded-xl shadow-lg shadow-[#00695C]/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2">
                            Xác nhận đặt lịch
                            <ArrowRight size={20} />
                        </button>
                    </div>
                    <p className="text-center text-xs text-gray-400">
                        Bằng cách xác nhận, bạn đồng ý với{' '}
                        <a href="#" className="underline hover:text-[#00695C]">Điều khoản dịch vụ</a> và{' '}
                        <a href="#" className="underline hover:text-[#00695C]">Chính sách hủy lịch</a> của chúng tôi.
                    </p>
                </div>
            </div>
        </ParentLayout>
    );
}
