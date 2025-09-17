// app/page.tsx
"use client";
import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaCheckCircle } from "react-icons/fa";
import { motion } from "framer-motion";
import Image from "next/image";

type FormState = {
  name: string;
  phone: string;
  businessTitle: string;
  district: string;
  mandal: string;
  area: string;
  rating: number;
};

export default function HomePage() {
  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    businessTitle: "",
    district: "",
    mandal: "",
    area: "",
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
          address: {
            district: form.district,
            mandal: form.mandal,
            area: form.area,
          },
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
          className="w-full max-w-xs text-center py-3 bg-white text-green-700 font-semibold rounded-full shadow-lg hover:bg-gray-100 transition"
        >
          Back Home
        </motion.a>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 max-w-3xl lg:mx-auto my-5 mx-4">
        <ToastContainer />

        {/* Heading + Logo */}
        <div className="flex flex-col items-center mb-4">
          <Image
            src="/logo.jpeg"
            alt="RBG Logo"
            width={150}
            height={150}
            className="rounded-full mb-0 w-[150px] h-[150px]"
          />
          <h1 className="text-4xl pb-1 sm:text-4xl lg:text-4xl font-extrabold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent text-center">
            Digital attendance registration
          </h1>
        </div>

        <p className="text-gray-600 mb-8 text-center lg:text-center">
          Unity • Business • Success – The RBG Way
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Details */}
          <Section title="Personal Details">
            <Input
              label="Full name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Ramesh..."
            />
            <Input
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+91900..."
            />
          </Section>

          {/* Business */}
          <Section title="Profession">
            <Input
              label="Business title"
              name="businessTitle"
              value={form.businessTitle}
              onChange={handleChange}
              placeholder="Business, Job"
            />
          </Section>

          {/* Address */}
          <Section title="Address">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="District"
                name="district"
                value={form.district}
                onChange={handleChange}
                placeholder="Hyderabad"
              />
              <Input
                label="Mandal"
                name="mandal"
                value={form.mandal}
                onChange={handleChange}
                placeholder="Shaikpet"
              />
              <Input
                label="Area"
                name="area"
                value={form.area}
                onChange={handleChange}
                placeholder="Banjara Hills"
              />
            </div>
          </Section>

          {/* Rating */}
          <Section title="Rating">
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
          </Section>

          {/* Full-width Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-blue-700 text-white font-semibold shadow hover:bg-blue-800 transition disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>

      {/* Footer (always bottom center) */}
      <footer className="py-6 text-center text-xs text-gray-500">
        © 2025 FestGo Events Pvt Ltd. All rights reserved.
        <br />
      </footer>
    </div>
  );
}

/* Section Wrapper */
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>
      {children}
    </div>
  );
}

/* Input Component */
function Input({
  label,
  name,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

/* Stars Component */
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
            className={`w-7 h-7 cursor-pointer transition ${
              filled ? "text-yellow-400" : "text-gray-300 hover:text-yellow-200"
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
