"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Target, Eye, Lightbulb, Shield,  Zap, Globe, Award } from "lucide-react";

export default function AboutSection() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const values = [
    { icon: <Zap className="w-8 h-8" />, title: "Speed", desc: "Lightning-fast solutions that keep pace with your business" },
    { icon: <Shield className="w-8 h-8" />, title: "Security", desc: "Enterprise-grade protection for your data and operations" },
    { icon: <Globe className="w-8 h-8" />, title: "Scale", desc: "Built to grow with your business needs" },
    { icon: <Award className="w-8 h-8" />, title: "Excellence", desc: "Committed to delivering world-class quality" }
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
    
      {/* Story Section */}
      <div className="container mx-auto px-4 md:px-24 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block px-4 py-2 bg-[#a3d900]/10 text-[#a3d900] rounded-full text-sm font-semibold mb-4">
              Our Story
            </div>
            <h2 className="text-4xl font-bold text-[var(--foreground)] mb-6 tracking-wide">
              Building The Future of Business Technology
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
              Since 2021, LogaXP has been on a mission to revolutionize how businesses operate. We recognized the challenges organizations face in managing operations, optimizing workflows, and staying competitive in a rapidly evolving digital landscape.
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              What started as an innovative idea has evolved into a comprehensive platform trusted by businesses worldwide. We empower organizations to streamline operations, boost productivity, and achieve their goals with technology that works as hard as they do.
            </p>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#a3d900] rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">Innovation First</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#a3d900] rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">Customer Focused</span>
              </div>
            </div>
          </div>
          <div className="relative">
           
            <div className="relative bg-[var(--background)] rounded-3xl p-8 border border-gray-200 dark:border-gray-700 shadow-xl">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#a3d900]/10 flex items-center justify-center flex-shrink-0">
                    <Target className="w-6 h-6 text-[#a3d900]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--foreground)] mb-1">Mission</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Empower businesses with intelligent tools that simplify complex operations</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#a3d900]/10 flex items-center justify-center flex-shrink-0">
                    <Eye className="w-6 h-6 text-[#a3d900]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--foreground)] mb-1">Vision</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Be the trusted partner for businesses seeking to thrive in the digital age</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#a3d900]/10 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-6 h-6 text-[#a3d900]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--foreground)] mb-1">Innovation</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Cutting-edge solutions that solve real-world business challenges</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-[var(--background)] border-y border-gray-200 dark:border-gray-700 py-12">
        <div className="container mx-auto px-4 md:px-24">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-[var(--foreground)] mb-4 tracking-wide">Our Core Values</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              The principles that guide everything we do at LogaXP
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setHoveredCard(idx)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`p-6 rounded-2xl border transition-all duration-300 ${
                  hoveredCard === idx
                    ? "bg-[#a3d900] border-[#a3d900] text-white transform -translate-y-2 shadow-xl"
                    : "bg-[var(--background)] border-gray-200 dark:border-gray-700 hover:border-[#a3d900]"
                }`}
              >
                <div className={`mb-4 ${hoveredCard === idx ? "text-white" : "text-[#a3d900]"}`}>
                  {value.icon}
                </div>
                <h3 className={`text-xl font-bold mb-2 ${hoveredCard === idx ? "text-white" : "text-[var(--foreground)]"}`}>
                  {value.title}
                </h3>
                <p className={`text-sm ${hoveredCard === idx ? "text-white/90" : "text-gray-600 dark:text-gray-400"}`}>
                  {value.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="container mx-auto px-4 md:px-24 py-12 mb-24">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-[var(--foreground)] mb-4 tracking-wide">Meet Our Leadership</h2>
          <p className="text-gray-600 dark:text-gray-400">The visionaries driving innovation at LogaXP</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="group">
            <div className="relative mb-6 overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-[#a3d900] transition-all duration-200">
              <Image 
                src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&h=500&fit=crop" 
                alt="Christopher Adebajo"
                width={500}
                height={500}
                unoptimized
                className="aspect-square object-cover w-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-1">Christopher Adebajo</h3>
            <p className="text-[#a3d900] font-semibold mb-2">Founder & CEO</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Seasoned IT expert specializing in DevOps and software development, driving innovation in the tech industry.
            </p>
          </div>

          <div className="group">
            <div className="relative mb-6 overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-[#a3d900] transition-all duration-200">
              <Image 
                src="https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=500&h=500&fit=crop" 
                alt="Gerald Emeka"
                width={500}
                height={500}
                unoptimized
                className="aspect-square object-cover w-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-1">Gerald Emeka</h3>
            <p className="text-[#a3d900] font-semibold mb-2">Co-Founder & CSO</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Expert in cybersecurity and business analysis, shaping our security strategies and operational excellence.
            </p>
          </div>

          <div className="group">
            <div className="relative mb-6 overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-[#a3d900] transition-all duration-200">
              <Image 
                src="https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=500&h=500&fit=crop" 
                alt="Ndaisah Umar Rabi"
                width={500}
                height={500}
                unoptimized
                className="aspect-square object-cover w-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-1">Ndaisah Umar Rabi</h3>
            <p className="text-[#a3d900] font-semibold mb-2">Executive Director</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Expert in designing scalable solutions across web, mobile, and standalone platforms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}