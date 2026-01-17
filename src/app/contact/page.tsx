"use client"

import React, { useState } from "react"
import Link from "next/link"
import { 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle2, 
  ChevronDown, 
  Send 
} from "lucide-react"

// Import your existing Footer
import { Footer } from "@/components/footer"
// Import UI components if they exist in your project, otherwise standard HTML elements used below are fine
import { Button } from "@/components/ui/button" 
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea" // Assuming you have this, otherwise use standard <textarea>

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* NOTE: 
         If your Navbar is in app/layout.tsx, it will appear automatically.
         If you manually add the Navbar to pages, import and add <Navbar /> here.
      */}

      <main>
        {/* --- Hero / Contact Cards Section --- */}
        <section className="bg-emerald-50/50 dark:bg-gray-900/50 py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Get in Touch
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-12">
              Have questions about a property or hosting in Pakistan? Our team is here to help you find your perfect match.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Phone Card */}
              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Call Us</h3>
                <p className="text-gray-600 dark:text-gray-400">+92 21 3456 7890</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">Mon-Sat, 9am-6pm</p>
              </div>

              {/* Email Card */}
              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Email Support</h3>
                <p className="text-gray-600 dark:text-gray-400">support@roommatchpk.com</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">24/7 Response time</p>
              </div>

              {/* Address Card */}
              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Office Address</h3>
                <p className="text-gray-600 dark:text-gray-400">DHA Phase 6, Karachi</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">Sindh, Pakistan</p>
              </div>
            </div>
          </div>
        </section>

        {/* --- Message Form Section --- */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            
            {/* Left Content */}
            <div className="lg:w-1/2">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Send us a Message
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Fill out the form below and our dedicated representative will get back to you within 24 business hours. Whether you're looking for a student hostel or a luxury apartment, we've got you covered.
              </p>
              
              <div className="space-y-6">
                {[
                  "Verified property listings only",
                  "Safe & secure payment gateway",
                  "Local support team in Karachi"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Form */}
            <div className="lg:w-1/2 w-full">
              <form className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                      placeholder="Ahmed Khan" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                    <input 
                      type="email" 
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                      placeholder="ahmed@example.pk" 
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    placeholder="+92 300 1234567" 
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Message</label>
                  <textarea 
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none"
                    placeholder="How can we help you today?" 
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  Send Inquiry
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* --- FAQ Section --- */}
        <section className="bg-gray-50 dark:bg-gray-900/30 py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h2>
              <p className="text-gray-600 dark:text-gray-400">Everything you need to know about RoomMatchPK.</p>
            </div>
            
            <FAQAccordion />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

// --- Helper Component for FAQs ---
function FAQAccordion() {
  const faqs = [
    {
      question: "How do I book a property on RoomMatchPK?",
      answer: "Booking is simple. Once you find a listing you like, select your dates and number of guests, then click the 'Reserve' button. You'll be guided through our secure payment process. Your booking is confirmed as soon as the host accepts your request."
    },
    {
      question: "Is it safe for students to book hostels here?",
      answer: "Absolutely. We physically verify major student accommodation listings and have a strict identity verification process for all hosts. We also provide a secure messaging system and 24/7 support for student residents."
    },
    {
      question: "How can I list my property?",
      answer: "To become a host, click on the 'RoomMatch your home' button in the footer or navigation. You'll need to provide details about your property, high-quality photos, and your CNIC for identity verification purposes."
    },
    {
      question: "What is the cancellation policy?",
      answer: "Cancellation policies vary by property and are set by the hosts. Most listings offer free cancellation within 48 hours of booking. Please check the specific policy on the listing page before completing your reservation."
    },
    {
      question: "Are prices inclusive of utility bills?",
      answer: "For short-term stays, utilities are usually included. For monthly rentals or student hostels, policies differ. This information is clearly listed under the 'Amenities' or 'Rules' section of each property page."
    }
  ]

  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <div 
          key={index} 
          className={`bg-white dark:bg-gray-800 rounded-2xl border transition-all duration-200 ${
            openIndex === index 
              ? "border-emerald-200 dark:border-emerald-900/50 shadow-md" 
              : "border-gray-200 dark:border-gray-700 shadow-sm"
          }`}
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="flex items-center justify-between w-full p-6 cursor-pointer text-left focus:outline-none"
          >
            <span className="font-semibold text-gray-900 dark:text-white text-lg">
              {faq.question}
            </span>
            <ChevronDown 
              className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${
                openIndex === index ? "rotate-180 text-emerald-600" : ""
              }`} 
            />
          </button>
          
          <div 
            className={`grid transition-all duration-300 ease-in-out ${
              openIndex === index ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div className="px-6 pb-6 text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-700 pt-4">
                {faq.answer}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}