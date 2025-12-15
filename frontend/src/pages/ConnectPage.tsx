import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../api/client';

export default function ConnectPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [authUrl, setAuthUrl] = useState<string>('');

  useEffect(() => {
    apiGet('/auth/me').then((data) => setEmail(data.email || null));
    apiGet('/auth/url').then((data) => setAuthUrl(data.url));
  }, []);

  const disconnect = async () => {
    await apiPost('/auth/disconnect');
    setEmail(null);
  };

  return (
    <div className="space-y-4 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold">Connect Gmail</h2>
      {email ? (
        <div className="flex items-center justify-between">
          <p className="text-gray-700">Connected as {email}</p>
          <button className="px-3 py-2 bg-red-500 text-white rounded" onClick={disconnect}>
            Disconnect
          </button>
        </div>
      ) : (
        <a
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded"
          href={authUrl}
        >
          Connect with Google
        </a>
      )}
      <p className="text-sm text-gray-600">
        Uses Gmail API (no SMTP) with permission-based recipients only.
      </p>
    </div>
  );
}
