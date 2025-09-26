// src/pages/index.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  // Redirect to dashboard
  useEffect(() => {
    router.push('/dashboard');
  }, [router]);

  return null;
}
