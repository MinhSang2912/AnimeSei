export const formatAnimeStatus = (status?: string): string => {
  if (!status) return 'Chưa rõ';
  switch (status.toUpperCase()) {
    case 'FINISHED':
      return 'Hoàn thành';
    case 'RELEASING':
      return 'Đang phát sóng';
    case 'NOT_YET_RELEASED':
      return 'Chưa phát sóng';
    case 'CANCELLED':
      return 'Đã hủy';
    case 'HIATUS':
      return 'Tạm ngưng';
    default:
      return status;
  }
};
