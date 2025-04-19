import { useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  useEffect(() => {
    // Check if we're in the browser
    if (typeof window !== 'undefined') {
      // Load the original HTML content
      window.location.href = '/index.html';
    }
  }, []);

  return (
    <>
      <Head>
        <title>Zimi - Italian Learning</title>
        <meta name="description" content="Learn Italian with Zimi" />
        <link rel="stylesheet" href="/style.css" />
      </Head>
      <div>Loading...</div>
    </>
  );
} 