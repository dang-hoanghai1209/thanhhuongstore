import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Hoàng Hải Sneaker - Tất, vớ, bao tay và phụ kiện thời trang cao cấp',
  description: 'Hoàng Hải Sneaker chuyên cung cấp các loại tất, vớ, bao tay bảo hộ lao động và phụ kiện thời trang chất lượng cao cho mọi khách hàng.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="flex flex-col min-h-screen bg-[#FAF9F6]">
        <Header />
        <div className="flex-grow">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}