import React from 'react';
import { Camera, Edit3, Loader2 } from 'lucide-react';
import { getAvatarSrc, fmt } from './constants';

const InfoRow = ({ label, value }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
        <span className="text-sm text-gray-500 w-36 shrink-0">{label}</span>
        <span className="text-sm text-gray-800 font-medium text-right flex-1">{value || '—'}</span>
    </div>
);

const ProfileInfo = ({ user, uploadingAvatar, onAvatarChange, onEditOpen, currentBorrows, overdueBorrows, totalUnpaid }) => (
    <div className="space-y-5">
        {/* Avatar + name card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row items-center gap-5">
            <div className="relative shrink-0">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-red-50 border-4 border-white shadow-md">
                    {getAvatarSrc(user?.avatar)
                        ? <img src={getAvatarSrc(user.avatar)} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center">
                            <span className="text-3xl font-bold" style={{ color: '#a30014' }}>{user?.fullName?.[0]?.toUpperCase() || 'U'}</span>
                          </div>
                    }
                </div>
                <label className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                    {uploadingAvatar
                        ? <Loader2 size={12} className="animate-spin text-gray-400" />
                        : <Camera size={12} className="text-gray-500" />
                    }
                    <input type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
                </label>
            </div>

            <div className="text-center sm:text-left flex-1">
                <h2 className="text-xl font-bold text-gray-900">{user?.fullName}</h2>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <div className="flex items-center gap-2 mt-1 justify-center sm:justify-start">
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-red-100 text-red-700">
                        {user?.role === 'reader' ? 'Độc giả' : user?.role === 'admin' ? 'Quản trị viên' : 'Thủ thư'}
                    </span>
                    {user?.studentId && <span className="text-xs text-gray-400">MSSV: {user.studentId}</span>}
                </div>
            </div>

            <button onClick={onEditOpen}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors shrink-0">
                <Edit3 size={14} /> Chỉnh sửa
            </button>
        </div>

        {/* Detail info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-3">Thông tin chi tiết</h3>
            <InfoRow label="Họ và tên"      value={user?.fullName}   />
            <InfoRow label="Email"           value={user?.email}      />
            <InfoRow label="MSSV"            value={user?.studentId}  />
            <InfoRow label="Số điện thoại"   value={user?.phone}      />
            <InfoRow label="Khoa"            value={user?.department} />
            <InfoRow label="Lớp"             value={user?.className}  />
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3">
            {[
                { label: 'Đang mượn',     value: currentBorrows.length, color: 'text-blue-700',   bg: 'bg-blue-50'   },
                { label: 'Quá hạn',       value: overdueBorrows.length, color: 'text-red-700',    bg: 'bg-red-50'    },
                { label: 'Chưa nộp phạt', value: fmt(totalUnpaid),     color: 'text-orange-700', bg: 'bg-orange-50' },
            ].map(s => (
                <div key={s.label} className={`rounded-2xl p-4 ${s.bg}`}>
                    <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                    <p className={`text-lg font-bold mt-1 ${s.color}`}>{s.value}</p>
                </div>
            ))}
        </div>
    </div>
);

export default ProfileInfo;
