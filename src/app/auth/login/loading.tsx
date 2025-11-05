import { AuthLoading } from "@/components/auth-loading"

export default function Loading() {
  return (
    <AuthLoading 
      title="Loading login page..." 
      description="Please wait while we prepare the authentication" 
    />
  )
}
