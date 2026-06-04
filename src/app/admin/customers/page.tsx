import prisma from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import StatusBadge from '@/components/ui/StatusBadge';

export const dynamic = 'force-dynamic';

export default async function AdminCustomersPage() {
  // Query all users that are CUSTOMER or WHOLESALE
  const users = await prisma.user.findMany({
    where: {
      role: {
        in: [UserRole.CUSTOMER, UserRole.WHOLESALE]
      }
    },
    include: {
      orders: {
        where: {
          status: 'DELIVERED'
        },
        select: {
          totalAmount: true
        }
      },
      _count: {
        select: {
          orders: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const customers = users.map((u) => {
    const totalSpent = u.orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    return {
      id: u.id,
      name: `${u.lastName || ''} ${u.firstName || ''}`.trim() || u.name || 'Chưa cập nhật',
      email: u.email || 'N/A',
      phone: u.phone || 'N/A',
      role: u.role,
      ordersCount: u._count.orders,
      totalSpent,
      status: u.isActive ? 'active' : 'inactive',
      createdAt: u.createdAt
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Quản Lý Khách Hàng</h1>
          <p className="text-xs text-slate-500 mt-1">
            Danh sách tài khoản mua lẻ (B2C) và mua sỉ (B2B) đã đăng ký thành viên trên hệ thống.
          </p>
        </div>
      </div>

      {customers.length > 0 ? (
        <div className="border border-slate-100 rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Họ và tên</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Liên hệ</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Phân loại</th>
                  <th className="px-6 py-3.5 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Số đơn hàng</th>
                  <th className="px-6 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng chi tiêu</th>
                  <th className="px-6 py-3.5 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Ngày đăng ký</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100 text-xs">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-800">
                      {c.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-500 space-y-0.5">
                      <p className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">mail</span>
                        {c.email}
                      </p>
                      {c.phone !== 'N/A' && (
                        <p className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">phone_iphone</span>
                          {c.phone}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {c.role === 'WHOLESALE' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          MUA SỈ (B2B)
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          MUA LẺ (B2C)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center font-bold text-slate-800">
                      {c.ordersCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-black text-slate-800">
                      {c.totalSpent.toLocaleString('vi-VN')}đ
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-slate-400 font-medium">
                      {new Date(c.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 space-y-2">
          <span className="material-symbols-outlined text-[48px] text-slate-300">group</span>
          <p className="text-xs text-slate-500 font-medium">Chưa có dữ liệu thành viên/khách hàng nào.</p>
        </div>
      )}
    </div>
  );
}
