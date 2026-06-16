import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Hoàng Hải Sneaker - Sỉ tất, vớ, bao tay giá tốt',
  description: 'Hoàng Hải Sneaker chuyên cung cấp tất, vớ, bao tay và phụ kiện thời trang giá sỉ. Phù hợp cho cửa hàng, đại lý, xưởng và khách mua số lượng lớn.',
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