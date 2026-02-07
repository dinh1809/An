
import { InviteCodeCard } from '@/components/therapist/InviteCodeCard';

export default function TherapistSettings() {
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold">Cấu hình & Hồ sơ chuyên môn</h2>

            {/* Connection System */}
            <div className="max-w-md">
                <InviteCodeCard />
            </div>

            <div className="p-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center text-slate-400">
                Other Settings & Compliance (Placeholder)
            </div>
        </div>
    );
}
