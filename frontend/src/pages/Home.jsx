import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // Redirect to the static marketing page
    window.location.href = '/index.html';
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg">Loading...</div>
    </div>
  );
}
