import React from 'react';
import { Search } from 'lucide-react';

interface AdminUsersTabProps {
  users: any[];
  userSearch: string;
  onSearchChange: (search: string) => void;
}

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({
  users,
  userSearch,
  onSearchChange,
}) => {
  const filteredUsers = users.filter(
    (u) =>
      u.username?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Search & Header Bar */}
      <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-white text-base">Danh Sách Người Dùng</h3>
          <p className="text-xs text-slate-400 mt-0.5">Tổng cộng {users.length} tài khoản thành viên</p>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Tìm người dùng theo tên/email..."
            value={userSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-950 text-slate-200 placeholder-slate-400 text-xs rounded-xl pl-9 pr-4 py-2 border border-slate-800 focus:outline-none focus:border-purple-500 transition shadow-inner"
          />
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
            <tr>
              <th className="px-6 py-3.5">Tên Người Dùng</th>
              <th className="px-6 py-3.5">Email</th>
              <th className="px-6 py-3.5">Vai Trò</th>
              <th className="px-6 py-3.5">Điểm Tích Lũy</th>
              <th className="px-6 py-3.5">Ngày Tạo Tài Khoản</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  Không tìm thấy người dùng nào phù hợp.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-purple-600/80 text-white font-bold flex items-center justify-center text-xs">
                        {u.username?.slice(0, 1).toUpperCase()}
                      </div>
                      <span className="font-bold text-white text-xs">{u.username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400">{u.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        u.role === 'Admin'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-amber-400">{u.points} điểm</td>
                  <td className="px-6 py-4 text-slate-400 text-xs">
                    {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
