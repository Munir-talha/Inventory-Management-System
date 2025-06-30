'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('user');

    if (user) {
      router.replace('/dashboard/purchases');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return null;
}
