'use client';
import { useState, useEffect } from 'react';
import { createClient } from './utils/supabase/client';

export default function SupabaseTestPage() {
  const [status, setStatus] = useState('Loading...');
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<string | null>(null);

  useEffect(() => {
    async function testConnection() {
      try {
        // Log the URL we're trying to connect to (without the key)
        console.log(
          'Attempting to connect to:',
          process.env.NEXT_PUBLIC_SUPABASE_URL
        );

        // Create client using the new approach
        const supabase = createClient();

        // Simple query to test connection and get first row
        const firstRowQuery = await supabase
          .from('TestTable')
          .select('id, name, expiry_date, quantity')
          .limit(1);

        if (firstRowQuery.error) throw firstRowQuery.error;

        // Use the count query as you already have
        const countQuery = await supabase
          .from('TestTable')
          .select('count', { count: 'exact' });

        if (countQuery.error) throw countQuery.error;

        // Format success message
        const successMessage = `
          Successfully connected to Supabase!
          Found ${countQuery.count} items.
          First row: ${JSON.stringify(
            firstRowQuery.data?.[0] || 'No data'
          )}
        `;

        setStatus('Connected!');
        setDetails(successMessage);
      } catch (err) {
        console.error('Failed to connect to Supabase:', err);
        setStatus('Failed');
        setError(err instanceof Error ? err.message : String(err));
      }
    }

    testConnection();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Supabase Connection Test
      </h1>

      <div className="mb-4">
        <h2 className="text-xl">
          Status:{' '}
          <span
            className={
              status === 'Connected!'
                ? 'text-green-500'
                : 'text-red-500'
            }
          >
            {status}
          </span>
        </h2>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {details && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <p className="font-bold">Details:</p>
          <pre className="whitespace-pre-wrap">{details}</pre>
        </div>
      )}
    </div>
  );
}
