// app/submissions/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

type Row = {
  id: string;
  name: string;
  phone: string;
  businessTitle: string;
  address: {
    district: string;
    mandal: string;
    area: string;
  };
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
    <div className="max-w-5xl mx-auto my-10 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-blue-700">Submitted Members</h2>
        <Link
          href="/"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          + Add new
        </Link>
      </div>

      {/* Status */}
      {loading && <div className="text-gray-500">Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && rows.length === 0 && (
        <div className="text-gray-500">No submissions yet.</div>
      )}

      {/* Submissions List */}
      <div className="grid gap-6">
        {rows.map((row) => (
          <div
            key={row.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
          >
            {/* Top Row */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {row.name}
                </h3>
                <p className="text-sm text-gray-600">{row.businessTitle}</p>
              </div>

              <div className="mt-2 sm:mt-0 flex items-center gap-3">
                <Stars rating={row.rating ?? 0} />
                <span className="text-sm text-gray-500">
                  ({(row.rating ?? 0).toFixed(1)})
                </span>
              </div>
            </div>

            {/* Divider */}
            <hr className="my-4 border-gray-200" />

            {/* Address + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <span className="font-medium">District:</span>{" "}
                {row.address.district || "-"}
              </div>
              <div>
                <span className="font-medium">Mandal:</span>{" "}
                {row.address.mandal || "-"}
              </div>
              <div>
                <span className="font-medium">Area:</span>{" "}
                {row.address.area || "-"}
              </div>
              <div>
                <span className="font-medium">Phone:</span> {row.phone}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-3 text-xs text-gray-400">
              {row.createdAt ? new Date(row.createdAt).toLocaleString() : ""}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Read-only Stars Component */
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
