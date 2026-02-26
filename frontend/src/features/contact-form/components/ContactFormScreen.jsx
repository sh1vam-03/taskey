"use client";
import React from "react"
import { useContactForm } from "../useContactForm"
import Spinner from "@/components/ui/Spinner"

export default function ContactFormScreen() {
    const {
        values,
        errors,
        isSubmitting,
        result,
        handleChange,
        handleSubmit
    } = useContactForm()

    return (
        <div className="max-w-xl mx-auto py-12 px-6">
            <h1 className="text-3xl font-bold mb-6 text-center">Contact Us</h1>

            {result && (
                <div
                    className={`p-4 mb-6 rounded ${result.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                >
                    {result.message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                        name="name"
                        value={values.name}
                        onChange={handleChange}
                        className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-black"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                        name="email"
                        type="email"
                        value={values.email}
                        onChange={handleChange}
                        className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-black"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Message</label>
                    <textarea
                        name="message"
                        value={values.message}
                        onChange={handleChange}
                        rows={5}
                        className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-black"
                    />
                    {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
                </div>

                <button
                    disabled={isSubmitting}
                    className="w-full bg-black text-white py-3 rounded-lg font-bold disabled:opacity-50"
                >
                    {isSubmitting ? <Spinner size="sm" className="text-white" /> : "Send Message"}
                </button>
            </form>
        </div>
    )
}
