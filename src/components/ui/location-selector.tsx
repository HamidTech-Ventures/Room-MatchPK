"use client"
import React, { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { getCountries, getProvinces, getCities } from "@/lib/location-data"
import { MapPin, ExternalLink } from "lucide-react"

interface LocationSelectorProps {
  formData: any
  handleInputChange: (field: string, value: any) => void
  touched?: { [key: string]: boolean }
  setTouched?: (touched: { [key: string]: boolean } | ((prev: { [key: string]: boolean }) => { [key: string]: boolean })) => void
  getFieldClassName?: (field: string, baseClass?: string) => string
  getFieldError?: (field: string) => string | null
}

export function LocationSelector({
  formData,
  handleInputChange,
  touched = {},
  setTouched = () => {},
  getFieldClassName = (field: string, baseClass = "") => baseClass,
  getFieldError = () => null
}: LocationSelectorProps) {
  const [countries] = useState(getCountries())
  const [provinces, setProvinces] = useState<Array<{value: string, label: string}>>([])
  const [cities, setCities] = useState<Array<{value: string, label: string}>>([])

  // Update provinces when country changes
  useEffect(() => {
    if (formData.country) {
      const newProvinces = getProvinces(formData.country)
      setProvinces(newProvinces)
      
      // Clear province and city if country changed
      if (formData.province && !newProvinces.find(p => p.value === formData.province)) {
        handleInputChange("province", "")
        handleInputChange("city", "")
      }
    } else {
      setProvinces([])
      setCities([])
    }
  }, [formData.country])

  // Update cities when province changes
  useEffect(() => {
    if (formData.country && formData.province) {
      const newCities = getCities(formData.country, formData.province)
      setCities(newCities)
      
      // Clear city if province changed
      if (formData.city && !newCities.find(c => c.value === formData.city)) {
        handleInputChange("city", "")
      }
    } else {
      setCities([])
    }
  }, [formData.country, formData.province])

  const handleFieldBlur = (field: string) => {
    if (setTouched) {
      setTouched(prev => ({ ...prev, [field]: true }))
    }
  }

  const openMapLink = () => {
    if (formData.mapLink) {
      window.open(formData.mapLink, '_blank')
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Country Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">
            Country <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.country || ""}
            onValueChange={(value) => {
              handleInputChange("country", value)
              handleFieldBlur("country")
            }}
          >
            <SelectTrigger className={getFieldClassName("country", "h-12")}>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country.value} value={country.value}>
                  {country.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {getFieldError('country') && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <span className="text-red-500">●</span>
              {getFieldError('country')}
            </p>
          )}
        </div>

        {/* Province/State Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">
            Province/State <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.province || ""}
            onValueChange={(value) => {
              handleInputChange("province", value)
              handleFieldBlur("province")
            }}
            disabled={!formData.country}
          >
            <SelectTrigger className={getFieldClassName("province", "h-12")}>
              <SelectValue placeholder={formData.country ? "Select province/state" : "Select country first"} />
            </SelectTrigger>
            <SelectContent>
              {provinces.map((province) => (
                <SelectItem key={province.value} value={province.value}>
                  {province.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {getFieldError('province') && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <span className="text-red-500">●</span>
              {getFieldError('province')}
            </p>
          )}
        </div>

        {/* City Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">
            City <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.city || ""}
            onValueChange={(value) => {
              handleInputChange("city", value)
              handleFieldBlur("city")
            }}
            disabled={!formData.province}
          >
            <SelectTrigger className={getFieldClassName("city", "h-12")}>
              <SelectValue placeholder={formData.province ? "Select city" : "Select province first"} />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city.value} value={city.value}>
                  {city.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {getFieldError('city') && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <span className="text-red-500">●</span>
              {getFieldError('city')}
            </p>
          )}
        </div>
      </div>

      {/* Area/Locality */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-slate-700">
          Area/Locality <span className="text-red-500">*</span>
        </Label>
        <Input
          placeholder="e.g., Gulberg, DHA, Johar Town"
          value={formData.area || ""}
          onChange={(e) => handleInputChange("area", e.target.value)}
          onBlur={() => handleFieldBlur("area")}
          className={getFieldClassName("area", "h-12")}
          required
        />
        {getFieldError('area') && (
          <p className="text-red-500 text-sm flex items-center gap-1">
            <span className="text-red-500">●</span>
            {getFieldError('area')}
          </p>
        )}
      </div>

      {/* Map Pin Link */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-slate-700">
          Map Pin Link <span className="text-red-500">*</span>
        </Label>
        <div className="flex gap-2">
          <Input
            placeholder="Paste Google Maps link here"
            value={formData.mapLink || ""}
            onChange={(e) => handleInputChange("mapLink", e.target.value)}
            onBlur={() => handleFieldBlur("mapLink")}
            className={getFieldClassName("mapLink", "h-12 flex-1")}
            required
          />
          {formData.mapLink && (
            <Button
              type="button"
              variant="outline"
              onClick={openMapLink}
              className="h-12 px-3"
              title="Open map in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          )}
        </div>
        {getFieldError('mapLink') && (
          <p className="text-red-500 text-sm flex items-center gap-1">
            <span className="text-red-500">●</span>
            {getFieldError('mapLink')}
          </p>
        )}
        <p className="text-xs text-slate-500">
          💡 Go to Google Maps, find your location, click "Share" and paste the link here
        </p>
      </div>

      {/* Postal/Zip Code (Optional) */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-slate-700">
          Postal/Zip Code (Optional)
        </Label>
        <Input
          placeholder="e.g., 54000, 75500"
          value={formData.postalCode || ""}
          onChange={(e) => handleInputChange("postalCode", e.target.value)}
          className="h-12"
        />
      </div>
    </div>
  )
}