import { redirect } from 'next/navigation';

export default function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams.q || '';
  redirect(`/products?search=${encodeURIComponent(query)}`);
}