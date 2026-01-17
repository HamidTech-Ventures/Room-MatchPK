"use client"

import React from "react"
import Link from "next/link"
import { 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  Printer, 
  Download 
} from "lucide-react"

// Import your existing Footer
import { Footer } from "@/components/footer"
// Import standard UI components (or use HTML buttons if these don't exist)
import { Button } from "@/components/ui/button"

export default function PrivacyPolicyPage() {
  
  // Helper for smooth scrolling to sections
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar will be included via layout.tsx automatically */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Header Section */}
        <div className="max-w-4xl mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
            Your privacy is important to us. This policy outlines how RoomMatchPK collects, uses, and protects your information when you use our platform.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" /> Last Updated: November 24, 2023
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> Effective Date: January 01, 2024
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Sidebar Navigation (Desktop Only) */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-28 space-y-6">
              <nav className="space-y-1 border-l-2 border-gray-100 pl-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">On this page</p>
                {[
                  { id: "introduction", label: "Introduction" },
                  { id: "data-collection", label: "Data Collection" },
                  { id: "how-we-use-data", label: "How We Use Data" },
                  { id: "cookies", label: "Cookies & Tracking" },
                  { id: "user-rights", label: "Your Rights" },
                  { id: "security", label: "Security Measures" },
                  { id: "contact", label: "Contact Us" },
                ].map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={(e) => scrollToSection(e, item.id)}
                    className="block py-1.5 text-sm text-gray-600 hover:text-emerald-600 hover:font-medium transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>

              {/* Support Card */}
              <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100">
                <h4 className="font-bold text-gray-900 mb-2">Need help?</h4>
                <p className="text-sm text-gray-600 mb-4">
                  If you have any questions about our privacy practices, please contact our legal team.
                </p>
                <a 
                  href="mailto:privacy@roommatchpk.com" 
                  className="text-emerald-600 font-semibold text-sm hover:underline flex items-center gap-1"
                >
                  Email Support <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            <div className="bg-white dark:bg-gray-900 p-8 lg:p-12 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm prose prose-emerald max-w-none">
              
              <section id="introduction" className="mb-12 scroll-mt-28">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
                <p className="text-gray-600 mb-4">
                  Welcome to RoomMatchPK. We are committed to protecting your personal data and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us at privacy@roommatchpk.com.
                </p>
                <p className="text-gray-600">
                  When you visit our website and use our services, you trust us with your personal information. We take your privacy very seriously. In this privacy notice, we describe our privacy policy. We seek to explain to you in the clearest way possible what information we collect, how we use it and what rights you have in relation to it.
                </p>
              </section>

              <section id="data-collection" className="mb-12 scroll-mt-28">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Data Collection</h2>
                <p className="text-gray-600 mb-4">
                  We collect personal information that you voluntarily provide to us when registering at the Services, expressing an interest in obtaining information about us or our products and services, when participating in activities on the Services or otherwise contacting us.
                </p>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Information we collect includes:</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                  <li><strong>Personal Identifiers:</strong> Name, email address, phone number, and mailing address.</li>
                  <li><strong>Credentials:</strong> Passwords, password hints, and similar security information used for authentication and account access.</li>
                  <li><strong>Profile Data:</strong> Your interests, favorites, and preferences saved within your user dashboard.</li>
                  <li><strong>Payment Data:</strong> We collect data necessary to process your payment if you make purchases, such as your payment instrument number (e.g., credit card), and the security code associated with your payment instrument.</li>
                </ul>
              </section>

              <section id="how-we-use-data" className="mb-12 scroll-mt-28">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Data</h2>
                <p className="text-gray-600 mb-4">
                  We use personal information collected via our Services for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
                </p>
                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                  <li>To facilitate account creation and logon process.</li>
                  <li>To send you marketing and promotional communications.</li>
                  <li>To send administrative information to you.</li>
                  <li>Fulfill and manage your orders and bookings.</li>
                  <li>To post testimonials with your prior consent.</li>
                  <li>Request feedback and improve our services.</li>
                </ul>
              </section>

              <section id="cookies" className="mb-12 scroll-mt-28">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Cookies & Tracking</h2>
                <p className="text-gray-600 mb-4">
                  We may use cookies and similar tracking technologies (like web beacons and pixels) to access or store information. Specific information about how we use such technologies and how you can refuse certain cookies is set out in our Cookie Notice.
                </p>
                <p className="text-gray-600">
                  Most Web browsers are set to accept cookies by default. If you prefer, you can usually choose to set your browser to remove cookies and to reject cookies. If you choose to remove cookies or reject cookies, this could affect certain features or services of our Services.
                </p>
              </section>

              <section id="user-rights" className="mb-12 scroll-mt-28">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Your Rights</h2>
                <p className="text-gray-600 mb-4">Depending on your location, you may have certain rights regarding your personal information. These may include:</p>
                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                  <li><strong>The right to access:</strong> You have the right to request copies of your personal data.</li>
                  <li><strong>The right to rectification:</strong> You have the right to request that we correct any information you believe is inaccurate.</li>
                  <li><strong>The right to erasure:</strong> You have the right to request that we erase your personal data, under certain conditions.</li>
                  <li><strong>The right to data portability:</strong> You have the right to request that we transfer the data that we have collected to another organization.</li>
                </ul>
              </section>

              <section id="security" className="mb-12 scroll-mt-28">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Security Measures</h2>
                <p className="text-gray-600">
                  We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure. Although we will do our best to protect your personal information, transmission of personal information to and from our Services is at your own risk. You should only access the services within a secure environment.
                </p>
              </section>

              <section id="contact" className="scroll-mt-28">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Contact Us</h2>
                <p className="text-gray-600 mb-4">
                  If you have questions or comments about this policy, you may email us at privacy@roommatchpk.com or by post to:
                </p>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-100 dark:border-gray-700 text-sm text-gray-700">
                  <p className="font-semibold">RoomMatchPK Legal Department</p>
                  <p>Floor 12, Executive Tower, Blue Area</p>
                  <p>Islamabad, 44000</p>
                  <p>Pakistan</p>
                </div>
              </section>
            </div>

            {/* Print / Download Actions */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-gray-50 rounded-2xl border border-gray-200">
              <div className="flex items-center gap-3">
                <Printer className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">Need a physical copy?</span>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <Button variant="outline" className="flex-1 sm:flex-none border-gray-300 text-gray-700 hover:bg-white">
                  Download PDF
                </Button>
                <Button 
                  onClick={() => typeof window !== 'undefined' && window.print()}
                  className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Print Policy
                </Button>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}