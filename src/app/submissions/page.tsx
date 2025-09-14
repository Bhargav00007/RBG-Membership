// app/submissions/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

type Row = {
  id: string;
  name: string;
  phone: string;
  businessTitle: string;
  address: { area: string; town: string };
  rating: number;
  createdAt?: string | null;
};

export default function SubmissionsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/submit")
      .then((r) => r.json())
      .then((data) => {
        if (!data.ok) throw new Error(data?.error || "Failed");
        setRows(data.rows);
      })
      .catch((e) => setError(e.message || "Error"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Submissions</h2>
        <Link href="/" className="text-sm text-primary underline">
          Add new
        </Link>
      </div>

      <div className="grid gap-4">
        {loading && <div className="text-gray-500">Loading...</div>}
        {error && <div className="text-red-600">{error}</div>}
        {!loading && rows.length === 0 && (
          <div className="text-gray-500">No submissions yet.</div>
        )}

        {rows.map((row) => (
          <div
            key={row.id}
            className="bg-white/80 rounded-xl p-4 shadow border flex flex-col sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="text-lg font-medium">{row.name}</div>
              <div className="text-sm text-gray-600">
                {row.businessTitle} • {row.address.area}
                {row.address.town ? `, ${row.address.town}` : ""}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Phone: {row.phone}
              </div>
            </div>

            <div className="mt-3 sm:mt-0 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Stars rating={row.rating ?? 0} />
                <div className="text-sm text-gray-500">
                  ({(row.rating ?? 0).toFixed(1)})
                </div>
              </div>
              <div className="text-xs text-gray-400">
                {row.createdAt ? new Date(row.createdAt).toLocaleString() : ""}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const total = 5;
  return (
    <div className="flex items-center">
      {Array.from({ length: total }).map((_, i) => {
        const idx = i + 1;
        const filled = idx <= full || (half && idx === full + 1);
        return (
          <svg
            key={i}
            viewBox="0 0 20 20"
            fill={filled ? "currentColor" : "none"}
            stroke="currentColor"
            className={`w-5 h-5 ${
              filled ? "text-yellow-400" : "text-gray-300"
            }`}
          >
            <path
              d="M10 1.5l2.6 5.27 5.84.85-4.22 4.12 1 5.8L10 15.9 4.78 17.54l1-5.8L1.56 7.62l5.84-.85L10 1.5z"
              strokeWidth="0.6"
            />
          </svg>
        );
      })}
    </div>
  );
}
