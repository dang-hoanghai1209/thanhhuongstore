import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getSystemSettings, saveSystemSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const settings = getSystemSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error('Failed to get admin settings:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Không thể lấy cấu hình hệ thống' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json().catch(() => ({}));
    
    // Validate values roughly (Zod schema could be added, but for robustness simple validation is fine)
    if (body.shippingSettings) {
      const { defaultFee, freeThreshold } = body.shippingSettings;
      if (defaultFee !== undefined && (typeof defaultFee !== 'number' || defaultFee < 0)) {
        return NextResponse.json({ success: false, error: 'Phí ship mặc định không hợp lệ' }, { status: 400 });
      }
      if (freeThreshold !== undefined && (typeof freeThreshold !== 'number' || freeThreshold < 0)) {
        return NextResponse.json({ success: false, error: 'Hạn mức miễn phí ship không hợp lệ' }, { status: 400 });
      }
    }

    const success = saveSystemSettings(body);
    
    if (success) {
      return NextResponse.json({ success: true, settings: getSystemSettings() });
    } else {
      throw new Error('Lỗi khi lưu tệp cấu hình');
    }
  } catch (error: any) {
    console.error('Failed to update admin settings:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Không thể cập nhật cấu hình hệ thống' },
      { status: 500 }
    );
  }
}
