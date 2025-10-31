"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, Calendar } from "lucide-react";

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    consultationType: "general"
  });

  const handleSubmit = () => {
    console.log("Form submitted:", formData);
    alert("Message sent successfully!");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-[var(--background)] mb-24">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 px-4 md:px-24 py-6">
        <div className="container mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] tracking-wide">
            Contact Us
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-24 py-12 md:py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-[var(--foreground)] mb-4 tracking-wide">
            Get in Touch
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-base md:text-lg">
            Have questions? We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Contact Cards */}
          <div className="bg-[var(--background)] p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-[#a3d900] transition-all duration-200">
            <div className="w-12 h-12 bg-[#a3d900]/10 rounded-lg flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-[#a3d900]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">Email</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">support@logaxp.com</p>
          </div>

          <div className="bg-[var(--background)] p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-[#a3d900] transition-all duration-200">
            <div className="w-12 h-12 bg-[#a3d900]/10 rounded-lg flex items-center justify-center mb-4">
              <Phone className="w-6 h-6 text-[#a3d900]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">Phone</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">+1 (555) 123-4567</p>
          </div>

          <div className="bg-[var(--background)] p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-[#a3d900] transition-all duration-200">
            <div className="w-12 h-12 bg-[#a3d900]/10 rounded-lg flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 text-[#a3d900]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">Office</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">123 Business St, Suite 100</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-[var(--background)] p-8 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-[var(--foreground)] mb-6 tracking-wide">
              Send us a Message
            </h3>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[var(--background)] border border-gray-300 dark:border-gray-600 rounded-lg text-[var(--foreground)] focus:ring-2 focus:ring-[#a3d900] focus:border-[#a3d900] outline-none transition-all duration-200"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[var(--background)] border border-gray-300 dark:border-gray-600 rounded-lg text-[var(--foreground)] focus:ring-2 focus:ring-[#a3d900] focus:border-[#a3d900] outline-none transition-all duration-200"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[var(--background)] border border-gray-300 dark:border-gray-600 rounded-lg text-[var(--foreground)] focus:ring-2 focus:ring-[#a3d900] focus:border-[#a3d900] outline-none transition-all duration-200"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[var(--background)] border border-gray-300 dark:border-gray-600 rounded-lg text-[var(--foreground)] focus:ring-2 focus:ring-[#a3d900] focus:border-[#a3d900] outline-none transition-all duration-200"
                  placeholder="How can we help?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-3 bg-[var(--background)] border border-gray-300 dark:border-gray-600 rounded-lg text-[var(--foreground)] focus:ring-2 focus:ring-[#a3d900] focus:border-[#a3d900] resize-none outline-none transition-all duration-200"
                  placeholder="Your message..."
                />
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-[#a3d900] hover:bg-[#89E101] text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Send Message
              </button>
            </div>
          </div>

          {/* Consultation Section */}
          <div className="space-y-6">
            <div className="bg-[var(--background)] p-8 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#a3d900]/10 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-[#a3d900]" />
                </div>
                <h3 className="text-2xl font-bold text-[var(--foreground)] tracking-wide">
                  Book a Consultation
                </h3>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Schedule a personalized consultation with our team to discuss your needs.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Consultation Type
                  </label>
                  <select
                    name="consultationType"
                    value={formData.consultationType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[var(--background)] border border-gray-300 dark:border-gray-600 rounded-lg text-[var(--foreground)] focus:ring-2 focus:ring-[#a3d900] focus:border-[#a3d900] outline-none transition-all duration-200"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="technical">Technical Support</option>
                    <option value="business">Business Partnership</option>
                    <option value="demo">Product Demo</option>
                  </select>
                </div>

                <button className="w-full bg-[#a3d900] hover:bg-[#89E101] text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Schedule Consultation
                </button>
              </div>
            </div>

           
          </div>
        </div>
      </main>

     
    </div>
  );
}