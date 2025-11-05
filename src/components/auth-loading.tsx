interface AuthLoadingProps {
  title?: string
  description?: string
  showSpinner?: boolean
  fullScreen?: boolean
  className?: string
}

export function AuthLoading({ 
  title = "Loading...", 
  description = "Please wait", 
  showSpinner = true,
  fullScreen = false,
  className = ""
}: AuthLoadingProps) {
  const containerClass = fullScreen 
    ? "min-h-screen bg-gradient-to-br from-purple-50 via-emerald-50 to-blue-50 flex items-center justify-center"
    : "flex items-center justify-center w-full py-8"
    
  return (
    <div className={`${containerClass} ${className}`}>
      <div className="text-center">
        {showSpinner && (
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 bg-white rounded-lg animate-spin"></div>
          </div>
        )}
        <p className="text-slate-600 font-medium text-lg">{title}</p>
        <p className="text-slate-500 text-sm mt-2">{description}</p>
      </div>
    </div>
  )
}
