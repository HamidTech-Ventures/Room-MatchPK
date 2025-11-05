"use client"

import { useEffect, useState } from "react"

export function DebugImages() {
  const [imageData, setImageData] = useState<any>(null)

  useEffect(() => {
    fetch('/api/properties/verified?limit=1')
      .then(res => res.json())
      .then(data => {
        console.log('Debug - API Response:', data)
        if (data.success && data.properties?.[0]) {
          const property = data.properties[0]
          console.log('Debug - First property images:', property.images)
          console.log('Debug - First image URL:', property.images?.[0]?.url)
          setImageData(property)
        }
      })
      .catch(err => console.error('Debug - API Error:', err))
  }, [])

  if (!imageData) return <div>Loading debug info...</div>

  return (
    <div className="p-4 bg-gray-100 m-4 rounded">
      <h3 className="font-bold">Image Debug Info:</h3>
      <p>Property: {imageData.title}</p>
      <p>Images count: {imageData.images?.length || 0}</p>
      <p>First image URL: {imageData.images?.[0]?.url || 'No URL'}</p>
      {imageData.images?.[0]?.url && (
        <div className="mt-2">
          <p>Testing image load:</p>
          <img 
            src={imageData.images[0].url} 
            alt="Test" 
            className="w-32 h-32 object-cover border"
            onLoad={() => console.log('Debug - Image loaded successfully')}
            onError={() => console.log('Debug - Image failed to load')}
          />
        </div>
      )}
    </div>
  )
}
