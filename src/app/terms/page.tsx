"use client"

import React from "react"
import Link from "next/link"
import { 
  ShieldCheck, 
  Scale, 
  Mail 
} from "lucide-react"

// Import your existing Footer
import { Footer } from "@/components/footer"

export default function TermsPage() {
  
  // Helper for smooth scrolling
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar is automatically included via layout.tsx */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <header className="max-w-4xl mx-auto mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            Terms of Service
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Last Updated: October 24, 2023
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Sidebar Navigation (Desktop Only) */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-28 space-y-1 border-l-2 border-gray-100 pl-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">On this page</p>
              {[
                { id: "acceptance", label: "1. Acceptance" },
                { id: "user-responsibilities", label: "2. User Responsibilities" },
                { id: "payment-terms", label: "3. Payment Terms" },
                { id: "cancellation-policy", label: "4. Cancellation Policy" },
                { id: "liability", label: "5. Liability & Indemnity" },
                { id: "governing-law", label: "6. Governing Law" },
                { id: "contact", label: "7. Contact Us" },
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
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            <div className="prose prose-emerald max-w-none bg-white dark:bg-gray-900/50 p-8 md:p-12 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
              
              <section id="acceptance" className="scroll-mt-28 mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-600 mb-4">
                  Welcome to RoomMatchPK. By accessing or using our website, platform, and services, you agree to comply with and be bound by these Terms of Service. These terms constitute a legally binding agreement between you ("User", "Host", or "Renter") and RoomMatchPK, governing your access to and use of our platform in Pakistan.
                </p>
                <p className="text-gray-600">
                  If you do not agree to these terms, please do not use our services. We reserve the right to modify these terms at any time, and your continued use of the platform following any changes indicates your acceptance of the new terms.
                </p>
              </section>

              <section id="user-responsibilities" className="scroll-mt-28 mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. User Responsibilities</h2>
                <p className="text-gray-600 mb-4">
                  Users of RoomMatchPK are expected to maintain the highest standards of integrity and respect within our community. Responsibilities include, but are not limited to:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                  <li><strong>Accuracy of Information:</strong> Providing truthful, accurate, and complete information during registration and property listing.</li>
                  <li><strong>Compliance with Local Laws:</strong> Ensuring all listings and rental agreements comply with Pakistani provincial and federal laws, including property tax regulations.</li>
                  <li><strong>Account Security:</strong> Maintaining the confidentiality of account credentials and notifying us immediately of any unauthorized access.</li>
                  <li><strong>Professional Conduct:</strong> Communicating respectfully with other users and refraining from any form of harassment or discrimination.</li>
                </ul>
              </section>

              <section id="payment-terms" className="scroll-mt-28 mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Payment Terms</h2>
                <p className="text-gray-600 mb-4">
                  RoomMatchPK facilitates secure transactions between Hosts and Renters. Our payment structure is designed to be transparent and reliable:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                  <li><strong>Service Fees:</strong> We charge a nominal service fee for each successful booking, which is clearly displayed before final payment.</li>
                  <li><strong>Currency:</strong> All transactions on the platform are processed in Pakistani Rupees (PKR) unless otherwise specified.</li>
                  <li><strong>Security Deposits:</strong> Hosts may require a security deposit, which will be held according to the specific terms of the listing and provincial rental laws.</li>
                  <li><strong>Payouts:</strong> Host payouts are typically processed 24 hours after the scheduled check-in time to ensure renter satisfaction.</li>
                </ul>
              </section>

              <section id="cancellation-policy" className="scroll-mt-28 mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Cancellation Policy</h2>
                <p className="text-gray-600 mb-6">
                  To ensure fairness for both parties, RoomMatchPK implements standardized cancellation tiers. Hosts must select one of these tiers for their listing:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
                  <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                    <h4 className="font-bold text-emerald-700 dark:text-emerald-400 mb-2">Flexible</h4>
                    <p className="text-sm text-gray-600">Full refund if cancelled up to 24 hours before check-in.</p>
                  </div>
                  <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl border border-yellow-100 dark:border-yellow-800/30">
                    <h4 className="font-bold text-yellow-700 dark:text-yellow-400 mb-2">Moderate</h4>
                    <p className="text-sm text-gray-600">Full refund if cancelled at least 5 days before check-in.</p>
                  </div>
                  <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-800/30">
                    <h4 className="font-bold text-red-700 dark:text-red-400 mb-2">Strict</h4>
                    <p className="text-sm text-gray-600">50% refund if cancelled at least 7 days before check-in.</p>
                  </div>
                </div>
              </section>

              <section id="liability" className="scroll-mt-28 mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Liability and Indemnity</h2>
                <p className="text-gray-600 mb-4">
                  RoomMatchPK acts as an intermediary platform. While we strive to verify all users, we do not own, manage, or control the properties listed on our site.
                </p>
                <p className="text-gray-600 mb-4">
                  Under no circumstances shall RoomMatchPK be liable for any direct, indirect, incidental, or consequential damages resulting from your use of the platform, including but not limited to property damage, personal injury, or financial loss occurring during a stay.
                </p>
                <p className="text-gray-600">
                  Users agree to indemnify and hold RoomMatchPK harmless from any claims, losses, or expenses arising from their breach of these terms or misuse of the platform.
                </p>
              </section>

              <section id="governing-law" className="scroll-mt-28 mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Governing Law</h2>
                <p className="text-gray-600">
                  These terms and conditions are governed by and construed in accordance with the laws of the Islamic Republic of Pakistan. Any disputes arising in relation to these terms shall be subject to the exclusive jurisdiction of the courts in Karachi, Lahore, or Islamabad, depending on the provincial location of the property in question.
                </p>
              </section>

              <section id="contact" className="mt-12 pt-12 border-t border-gray-100 dark:border-gray-800 scroll-mt-28">
                <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-6">
                  <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 text-white shadow-lg shadow-emerald-200">
                    <Scale className="w-8 h-8" />
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Questions about our terms?</h3>
                    <p className="text-gray-600 mb-4">
                      Our legal team is here to help you understand your rights and responsibilities. Reach out to us for any clarifications.
                    </p>
                    <a 
                      href="mailto:legal@roommatch.pk" 
                      className="inline-flex items-center text-emerald-600 font-bold hover:underline gap-2"
                    >
                      <Mail className="w-4 h-4" /> legal@roommatch.pk
                    </a>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}