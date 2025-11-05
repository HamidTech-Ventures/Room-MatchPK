import { AuthLoading } from "@/components/auth-loading"

export default function Loading() {
  return (
    <AuthLoading 
      title="Processing authentication..." 
      description="Please wait while we complete your sign-in" 
    />
  )
}