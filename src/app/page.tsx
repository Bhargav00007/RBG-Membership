// app/page.tsx
"use client";
import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaCheckCircle } from "react-icons/fa";
import { motion } from "framer-motion";

type FormState = {
  name: string;
  phone: string;
  businessTitle: string;
  area: string;
  town: string;
  rating: number;
};

export default function HomePage() {
  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    businessTitle: "",
    area: "",
    town: "",
    rating: 0,
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function phoneValid(phone: string) {
    return /^\+?\d{7,15}$/.test(phone);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Name is required.");
      return;
    }
    if (!phoneValid(form.phone)) {
      toast.error("Phone must be digits, 7–15 chars (can include leading +).");
      return;
    }
    if (!form.businessTitle.trim()) {
      toast.error("Business title is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          businessTitle: form.businessTitle,
          address: { area: form.area, town: form.town },
          rating: form.rating,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to save.");
      setSubmitted(true);
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-400 to-green-600 text-white">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <FaCheckCircle className="text-7xl mb-6 drop-shadow-lg" />
        </motion.div>

        <motion.h1
          className="text-3xl font-bold mb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.7 }}
        >
          Thanks for submitting!
        </motion.h1>

        <motion.a
          href="/"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="px-6 py-2 bg-white text-green-700 font-semibold rounded-full shadow-lg hover:bg-gray-100 transition"
        >
          Back Home
        </motion.a>
      </div>
    );
  }

  return (
    <div className="max-w-3xl lg:mx-auto my-10 mx-10">
      <ToastContainer />

      {/* Heading + subheadline */}
      <h1 className="text-4xl font-extrabold mb-2 bg-blue-700 bg-clip-text text-transparent">
        RBG Membership
      </h1>
      <p className="text-blue-500 mb-8">
        Helping members launch, grow, and succeed in their business.
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-md text-gray-700 font-medium mb-1">
            Full name
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-md border text-gray-700 px-4 py-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ramesh..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-md text-gray-700 font-medium mb-1">
              Phone
            </label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full rounded-md border  text-gray-700 border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+91900..."
            />
          </div>

          <div>
            <label className="block text-md font-medium mb-1">
              Business title
            </label>
            <input
              name="businessTitle"
              value={form.businessTitle}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 text-gray-700 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Cafe · Salon · Plumbing"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-md font-medium mb-1">Area</label>
            <input
              name="area"
              value={form.area}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 text-gray-700 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Bandra"
            />
          </div>

          <div>
            <label className="block text-md font-medium mb-1">
              Town / City
            </label>
            <input
              name="town"
              value={form.town}
              onChange={handleChange}
              className="w-full rounded-md border  text-gray-700 border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mumbai"
            />
          </div>
        </div>

        {/* Interactive rating */}
        <div>
          <label className="block text-md font-medium mb-2">Rating</label>
          <div className="flex items-center gap-2">
            <Stars
              rating={form.rating}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, rating: value }))
              }
            />
            <span className="text-md text-gray-500">
              ({form.rating.toFixed(1)})
            </span>
          </div>
        </div>

        {/* Centered Submit Button */}
        <div className="mt-6 flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className="px-16 py-3 rounded-full bg-blue-700 text-white font-semibold shadow hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* Interactive Stars Component */
function Stars({
  rating,
  onChange,
}: {
  rating: number;
  onChange: (value: number) => void;
}) {
  const total = 5;
  return (
    <div className="flex items-center">
      {Array.from({ length: total }).map((_, i) => {
        const idx = i + 1;
        const filled = idx <= rating;
        return (
          <svg
            key={i}
            onClick={() => onChange(idx)}
            viewBox="0 0 20 20"
            fill={filled ? "currentColor" : "none"}
            stroke="currentColor"
            className={`w-7 h-7 cursor-pointer ${
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
