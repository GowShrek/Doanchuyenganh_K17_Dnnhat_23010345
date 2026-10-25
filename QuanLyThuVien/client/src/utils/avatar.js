// Đường dẫn ảnh đại diện: ảnh Google là URL đầy đủ; ảnh tải lên lưu tên tệp, máy chủ phục vụ tại /uploads/avatars
export const getAvatarSrc = (avatar) => {
    if (!avatar) return null;
    if (avatar.startsWith('http')) return avatar;
    return `${import.meta.env.VITE_API_URL}/uploads/avatars/${avatar}`;
};
