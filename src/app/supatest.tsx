"use client";
import { useState, useEffect } from "react";
import supabase from "./lib/supabase";

export default function SupabaseTestPage() {
  const [status, setStatus] = useState("Loading...");
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<string | null>(null);

  useEffect(() => {
    async function testConnection() {
      try {
        // Log the URL we're trying to connect to (without the key)
        console.log(
          "Attempting to connect to:",
          process.env.NEXT_PUBLIC_SUPABASE_URL
        );

        // Test if the client was initialized properly
        if (!supabase) {
          throw new Error("Supabase client is undefined");
        }

        // Simple query to test connection and get first row
        const firstRowQuery = await supabase
          .from("TestTable")
          .select("*")
          .limit(1);

        if (firstRowQuery.error) throw firstRowQuery.error;

        // Use the count query as you already have
        const countQuery = await supabase
          .from("TestTable")
          .select("count", { count: "exact" });

        if (countQuery.error) throw countQuery.error;

        setStatus(
          `Connected! Count: ${JSON.stringify(countQuery.data)}, First Row: ${
            firstRowQuery.data && firstRowQuery.data.length > 0
              ? JSON.stringify(firstRowQuery.data[0])
              : "No data found"
          }`
        );
      } catch (err) {
        console.error("Connection test failed:", err);

        // More detailed error reporting
        if (err instanceof Error) {
          setError(err.message);
          setDetails(err.stack || "No stack trace available");
        } else {
          setError("Unknown error type");
          setDetails(JSON.stringify(err));
        }

        setStatus("Failed to connect");
      }
    }

    testConnection();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Supabase Connection Test</h1>
      <div className="p-4 border rounded-md bg-gray-50">
        <p className="font-semibold">Status: {status}</p>
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 font-medium">Error: {error}</p>
            {details && (
              <pre className="mt-2 whitespace-pre-wrap text-xs text-red-600 overflow-auto max-h-40">
                {details}
              </pre>
            )}
          </div>
        )}
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-bold mb-2">Troubleshooting Steps:</h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>
            Check if your Supabase URL and Anon Key are set correctly in
            .env.local
          </li>
          <li>
            {`Verify that the 'fridge_items' table exists in your
            Supabase database`}
          </li>
          <li>
            {`Make sure you've enabled Row Level Security and created
            appropriate policies`}
          </li>
          <li>{`Check browser console for additional error messages`}</li>
          <li>
            {`Restart your Next.js development server after making
            changes to .env files`}
          </li>
        </ol>
      </div>
    </div>
  );
}
