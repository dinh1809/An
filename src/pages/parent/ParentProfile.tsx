import React, { useState } from 'react';
import { ParentLayout } from '@/components/layout/ParentLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import {
  UserCog,
  Bell,
  Lock,
  Globe,
  LogOut,
  Shield,
  Smartphone,
  UserPlus,
  Mail,
  BarChart3,
  Dumbbell,
  MessageSquare,
  Trash2,
  RefreshCw,
  Camera,
  Check
} from 'lucide-react';

interface Caregiver {
  id: string;
  name: string;
  role: string;
  email: string;
  status: 'active' | 'pending';
  avatar?: string;
  permissions: {
    viewReports: boolean;
    practiceExercises: boolean;
    accessForum: boolean;
  };
  invitedAt?: string;
}

export default function ParentProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('account');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('family');

  // Form state
  const [fullName, setFullName] = useState('Nguyen Thi Huong');
  const [email] = useState(user?.email || 'nguyen.huong@email.com');

  // Notification settings
  const [notifications, setNotifications] = useState({
    dailyQuests: true,
    therapySessions: true,
    communityUpdates: false
  });

  // Mock caregivers data
  const [caregivers, setCaregivers] = useState<Caregiver[]>([
    {
      id: '1',
      name: 'Bà Nội (Phạm Thị Mai)',
      role: 'Người thân',
      email: 'mai.pham@email.com',
      status: 'active',
      permissions: {
        viewReports: true,
        practiceExercises: true,
        accessForum: false
      }
    },
    {
      id: '2',
      name: 'Cô Lan (Giáo viên)',
      role: 'Giáo viên hỗ trợ',
      email: 'lan.teacher@email.com',
      status: 'pending',
      permissions: {
        viewReports: false,
        practiceExercises: true,
        accessForum: false
      },
      invitedAt: '2 giờ trước'
    }
  ]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const toggleCaregiverPermission = (caregiverId: string, permission: keyof Caregiver['permissions']) => {
    setCaregivers(caregivers.map(c =>
      c.id === caregiverId
        ? { ...c, permissions: { ...c.permissions, [permission]: !c.permissions[permission] } }
        : c
    ));
  };

  const sidebarItems = [
    { id: 'account', icon: UserCog, label: 'Tài khoản & Bảo mật', active: true },
    { id: 'notifications', icon: Bell, label: 'Cài đặt thông báo' },
    { id: 'privacy', icon: Lock, label: 'Quyền riêng tư & Truy cập' },
    { id: 'language', icon: Globe, label: 'Ngôn ngữ' },
  ];

  return (
    <ParentLayout>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="sticky top-24">
            <h1 className="text-gray-900 dark:text-white text-xl font-bold mb-6 px-2">
              Cài đặt hệ thống
            </h1>
            <nav className="flex flex-col gap-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${activeTab === item.id
                      ? 'bg-[#00695C]/10 text-[#00695C] border-l-4 border-[#00695C]'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-[#E0F2F1] dark:hover:bg-[#1a2e2c] hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  <item.icon size={20} className={activeTab === item.id ? 'text-[#00695C]' : ''} />
                  <span className={`text-sm ${activeTab === item.id ? 'font-bold' : 'font-medium'}`}>
                    {item.label}
                  </span>
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 mt-4 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-left"
              >
                <LogOut size={20} />
                <span className="text-sm font-medium">Đăng xuất</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 space-y-8">
          {/* Account & Security Section */}
          <section className="bg-white dark:bg-[#1a2e2c] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Tài khoản & Bảo mật</h2>
              <Shield size={20} className="text-gray-300" />
            </div>
            <div className="p-6">
              {/* Profile Header */}
              <div className="flex flex-col md:flex-row gap-6 items-center md:items-start mb-8">
                <div className="relative group cursor-pointer">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#00695C] to-[#004D40] flex items-center justify-center text-white text-2xl font-bold shadow-md">
                    {fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={24} className="text-white" />
                  </div>
                </div>
                <div className="flex-1 w-full text-center md:text-left">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{fullName}</h3>
                      <p className="text-[#00695C]">{email}</p>
                    </div>
                    <button className="px-4 py-2 bg-[#E0F2F1] dark:bg-[#00695C]/20 hover:bg-[#00695C]/20 text-gray-900 dark:text-white text-sm font-semibold rounded-lg transition-colors">
                      Đổi ảnh đại diện
                    </button>
                  </div>
                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <label className="block">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-200">Họ và tên</span>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="mt-1 block w-full rounded-lg border-gray-200 dark:border-gray-700 bg-[#F8FAFB] dark:bg-[#152523] focus:border-[#00695C] focus:ring focus:ring-[#00695C]/20 text-sm py-2.5 text-gray-900 dark:text-white"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-200">Email đăng nhập</span>
                      <input
                        type="email"
                        value={email}
                        disabled
                        className="mt-1 block w-full rounded-lg border-gray-200 dark:border-gray-700 bg-[#F8FAFB] dark:bg-[#152523] text-sm py-2.5 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="h-px bg-gray-100 dark:bg-gray-800 my-6"></div>

              {/* Password & 2FA */}
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Đổi mật khẩu</h4>
                    <p className="text-xs text-gray-500 mt-1">Lần thay đổi cuối: 3 tháng trước</p>
                  </div>
                  <button className="px-4 py-2 border border-gray-200 dark:border-gray-700 hover:border-[#00695C] text-gray-600 dark:text-gray-400 hover:text-[#00695C] text-sm font-medium rounded-lg transition-colors">
                    Cập nhật mật khẩu
                  </button>
                </div>

                <div className="flex justify-between items-center p-4 bg-[#F8FAFB] dark:bg-[#152523] rounded-lg border border-gray-100 dark:border-gray-800">
                  <div className="flex gap-3 items-start">
                    <div className="p-2 bg-white dark:bg-[#1a2e2c] rounded-md shadow-sm text-[#00695C]">
                      <Smartphone size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">Xác thực 2 yếu tố (2FA)</h4>
                      <p className="text-xs text-gray-500 mt-1 max-w-[300px]">
                        Tăng cường bảo mật bằng cách yêu cầu mã xác nhận khi đăng nhập trên thiết bị lạ.
                      </p>
                    </div>
                  </div>
                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={twoFactorEnabled}
                      onChange={() => setTwoFactorEnabled(!twoFactorEnabled)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#00695C]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00695C]"></div>
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Caregiver Permissions Section */}
          <section className="bg-white dark:bg-[#1a2e2c] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-white dark:from-[#1a2e2c] to-[#F8FAFB] dark:to-[#152523]">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Phân quyền người chăm sóc</h2>
                <p className="text-sm text-gray-500 mt-1">Mời thành viên gia đình hoặc chuyên gia cùng hỗ trợ bé.</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#00695C] text-white text-sm font-bold rounded-lg shadow-sm hover:bg-[#004D40] transition-colors">
                <UserPlus size={18} />
                <span>Mời thành viên</span>
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Invite Card */}
              <div className="bg-[#E0F2F1]/50 dark:bg-[#00695C]/10 rounded-xl p-4 border border-[#00695C]/20 flex flex-col sm:flex-row gap-3 items-center">
                <div className="flex-1 w-full">
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-2.5 text-[#00695C]" />
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="Nhập email người thân hoặc giáo viên..."
                      className="w-full pl-10 pr-4 py-2 rounded-lg border-0 ring-1 ring-[#00695C]/30 focus:ring-2 focus:ring-[#00695C] text-sm bg-white dark:bg-[#1a2e2c] text-gray-900 dark:text-white placeholder:text-gray-400"
                    />
                  </div>
                </div>
                <div className="w-full sm:w-auto">
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full py-2 pl-3 pr-8 rounded-lg border-0 ring-1 ring-[#00695C]/30 focus:ring-2 focus:ring-[#00695C] text-sm bg-white dark:bg-[#1a2e2c] text-gray-700 dark:text-gray-300"
                  >
                    <option value="family">Vai trò: Người thân</option>
                    <option value="teacher">Vai trò: Giáo viên</option>
                    <option value="doctor">Vai trò: Bác sĩ</option>
                  </select>
                </div>
                <button className="w-full sm:w-auto px-5 py-2 bg-white dark:bg-[#1a2e2c] text-[#00695C] border border-[#00695C] font-semibold rounded-lg text-sm hover:bg-[#00695C] hover:text-white transition-colors">
                  Gửi lời mời
                </button>
              </div>

              {/* Caregivers List */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {caregivers.map((caregiver) => (
                  <div key={caregiver.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow bg-white dark:bg-[#1a2e2c]">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00695C] to-[#004D40] flex items-center justify-center text-white font-bold text-sm">
                          {caregiver.name.split('(')[0].trim().split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white">{caregiver.name}</h4>
                          <p className="text-xs text-gray-500">Vai trò: {caregiver.role}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${caregiver.status === 'active'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                        {caregiver.status === 'active' ? 'Đang hoạt động' : 'Chờ xác nhận'}
                      </span>
                    </div>

                    <div className={`space-y-3 bg-[#F8FAFB] dark:bg-[#152523] p-3 rounded-lg ${caregiver.status === 'pending' ? 'opacity-80' : ''}`}>
                      {[
                        { key: 'viewReports' as const, icon: BarChart3, label: 'Xem báo cáo' },
                        { key: 'practiceExercises' as const, icon: Dumbbell, label: 'Thực hành bài tập' },
                        { key: 'accessForum' as const, icon: MessageSquare, label: 'Truy cập Forum' }
                      ].map((perm) => (
                        <div key={perm.key} className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <perm.icon size={14} />
                            {perm.label}
                          </span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={caregiver.permissions[perm.key]}
                              onChange={() => toggleCaregiverPermission(caregiver.id, perm.key)}
                            />
                            <div className="w-8 h-4 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[0px] after:left-[0px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00695C]"></div>
                          </label>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 flex justify-between items-center">
                      {caregiver.status === 'pending' ? (
                        <>
                          <span className="text-[10px] italic text-gray-400">
                            Đã gửi lời mời {caregiver.invitedAt}
                          </span>
                          <button className="text-xs text-[#00695C] hover:text-[#004D40] font-medium flex items-center gap-1">
                            <RefreshCw size={12} />
                            Gửi lại
                          </button>
                        </>
                      ) : (
                        <>
                          <span></span>
                          <button className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1">
                            <Trash2 size={12} />
                            Xoá quyền truy cập
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Notification Settings */}
          <section className="bg-white dark:bg-[#1a2e2c] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Cài đặt thông báo</h2>
              <Bell size={20} className="text-gray-300" />
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[
                  { key: 'dailyQuests' as const, title: 'Nhiệm vụ hàng ngày (Daily Quests)', desc: 'Nhận nhắc nhở lúc 8:00 sáng mỗi ngày để hoàn thành bài tập.' },
                  { key: 'therapySessions' as const, title: 'Lịch hẹn trị liệu (Therapy Sessions)', desc: 'Thông báo trước 1 giờ khi có buổi hẹn với chuyên gia.' },
                  { key: 'communityUpdates' as const, title: 'Cập nhật cộng đồng', desc: 'Khi có phản hồi mới trong các bài viết bạn theo dõi.' }
                ].map((item) => (
                  <label key={item.key} className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#F8FAFB] dark:hover:bg-[#152523] transition-colors cursor-pointer">
                    <div className="flex items-center h-5 mt-1">
                      <input
                        type="checkbox"
                        checked={notifications[item.key]}
                        onChange={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                        className="w-5 h-5 text-[#00695C] bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-[#00695C] focus:ring-2"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{item.title}</span>
                      <span className="text-xs text-gray-500">{item.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pb-8">
            <button className="px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Huỷ thay đổi
            </button>
            <button className="px-6 py-2.5 rounded-lg bg-[#00695C] text-white font-bold text-sm shadow-md hover:bg-[#004D40] hover:shadow-lg transition-all transform hover:-translate-y-0.5">
              Lưu cài đặt
            </button>
          </div>
        </main>
      </div>
    </ParentLayout>
  );
}
