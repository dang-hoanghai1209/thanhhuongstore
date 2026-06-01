import { z } from 'zod';
import { SizeType, PaymentMethod } from '@prisma/client';

export const registerSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().regex(/^(0[3|5|7|8|9])+([0-9]{8})$/, 'Số điện thoại không hợp lệ').optional().or(z.literal('')),
  password: z.string().min(8, 'Mật khẩu phải tối thiểu 8 ký tự')
    .regex(/[A-Z]/, 'Mật khẩu phải chứa ít nhất 1 chữ hoa')
    .regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất 1 chữ số'),
  firstName: z.string().min(1, 'Họ và đệm không được trống'),
  lastName: z.string().min(1, 'Tên không được trống'),
});

export const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Mật khẩu không được trống'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu phải tối thiểu 8 ký tự')
    .regex(/[A-Z]/, 'Mật khẩu phải chứa ít nhất 1 chữ hoa')
    .regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất 1 chữ số'),
});

export const addressSchema = z.object({
  fullName: z.string().min(2, 'Họ tên quá ngắn'),
  phone: z.string().regex(/^(0[3|5|7|8|9])+([0-9]{8})$/, 'Số điện thoại không hợp lệ'),
  province: z.string().min(1, 'Tỉnh/Thành phố không được trống'),
  district: z.string().min(1, 'Quận/Huyện không được trống'),
  ward: z.string().min(1, 'Phường/Xã không được trống'),
  street: z.string().min(1, 'Số nhà, đường không được trống'),
  isDefault: z.boolean().default(false),
});

export const productVariantSchema = z.object({
  sku: z.string().min(3, 'SKU quá ngắn'),
  size: z.string().min(1, 'Kích thước không được trống'),
  color: z.string().min(1, 'Màu sắc không được trống'),
  colorHex: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Mã màu Hex không hợp lệ'),
  retailPrice: z.number().positive('Giá bán lẻ phải lớn hơn 0'),
  wholesalePrice: z.number().positive('Giá bán sỉ phải lớn hơn 0'),
  stock: z.number().int().nonnegative('Số lượng tồn kho không được âm'),
});

export const productTierSchema = z.object({
  minQty: z.number().int().positive('Số lượng tối thiểu phải lớn hơn 0'),
  discount: z.number().min(1, 'Chiết khấu tối thiểu là 1%').max(99, 'Chiết khấu tối đa là 99%'),
});

export const createProductSchema = z.object({
  name: z.string().min(2, 'Tên sản phẩm quá ngắn'),
  categoryId: z.string().min(1, 'Danh mục không được trống'),
  sizeType: z.nativeEnum(SizeType),
  wholesaleTiers: z.array(productTierSchema).optional(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  variants: z.array(productVariantSchema).min(1, 'Sản phẩm phải có ít nhất 1 phân loại (variant)'),
  images: z.array(z.object({
    url: z.string().url('URL hình ảnh không hợp lệ'),
    isPrimary: z.boolean().default(false),
    sortOrder: z.number().int().default(0),
  })).optional(),
});

export const createOrderSchema = z.object({
  addressId: z.string().min(1, 'Vui lòng chọn địa chỉ giao hàng'),
  paymentMethod: z.nativeEnum(PaymentMethod),
  couponCode: z.string().optional(),
});
