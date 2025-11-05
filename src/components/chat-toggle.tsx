"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import { UnifiedChat } from "./unified-chat"
import { useAuth } from "@/contexts/auth-context"

export function ChatToggle() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const { user } = useAuth()
  const pathname = usePathname()

  // Only show chat on specific pages and when user is logged in
  const shouldShowChat = user && (
    pathname === '/find-rooms' || 
    pathname === '/list-property' ||
    pathname === '/my-properties' ||
    pathname === '/properties'
  )

  if (!shouldShowChat) {
    return null
  }

  return (
    <>
      <div className="hidden md:block fixed bottom-6 right-6 z-40">
        {/* Green Chat Button */}
        <Button
          onClick={() => setIsChatOpen(true)}
          className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 shadow-lg transition-all duration-200"
          size="icon"
          title="Open Chat"
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </Button>
      </div>
      
      <UnifiedChat 
        isOpen={isChatOpen} 
        onToggle={() => setIsChatOpen(false)} 
      />
    </>
  )
}
