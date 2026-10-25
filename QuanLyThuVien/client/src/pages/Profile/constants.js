import { User, CreditCard, History, Bell } from 'lucide-react';

export const STATUS_CFG = {
    pending:  { label: 'Chờ duyệt', cls: 'bg-orange-100 text-orange-700' },
    approved: { label: 'Đang mượn', cls: 'bg-blue-100 text-blue-700'    },
    returned: { label: 'Đã trả',    cls: 'bg-green-100 text-green-700'  },
    rejected: { label: 'Từ chối',   cls: 'bg-gray-100 text-gray-500'    },
    overdue:  { label: 'Quá hạn',   cls: 'bg-red-100 text-red-700'      },
    lost:     { label: 'Mất sách',  cls: 'bg-purple-100 text-purple-700'},
};

export const FINE_TYPE_LABEL = { overdue: 'Quá hạn', lost: 'Mất sách', damaged: 'Hư hỏng' };

export const FINE_STATUS_CFG = {
    unpaid: { cls: 'bg-red-100 text-red-700',   label: 'Chưa nộp' },
    paid:   { cls: 'bg-green-100 text-green-700', label: 'Đã nộp'  },
    waived: { cls: 'bg-gray-100 text-gray-500',  label: 'Được miễn'},
};

export const NAV_ITEMS = [
    { key: 'profile', icon: User,       label: 'Thông tin cá nhân' },
    { key: 'card',    icon: CreditCard, label: 'Thẻ thư viện'      },
    { key: 'borrows', icon: History,    label: 'Lịch sử mượn'      },
    { key: 'fines',   icon: Bell,       label: 'Tiền phạt'         },
];

export const fmt = (n) => Number(n || 0).toLocaleString('vi-VN') + 'đ';

export { getAvatarSrc } from '../../utils/avatar';
