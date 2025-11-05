"use client"

import React, { useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { useChat } from "@/contexts/chat-context"
import { FormAutoSaveIndicator } from "@/components/form-auto-save-indicator"
import { AuthLoading } from "@/components/auth-loading"
import { HostelFormMultiStep } from "@/components/forms/hostel-form-multi-step"
import { MessFormMultiStep } from "@/components/forms/mess-form-multi-step"
import { OwnerDetailsForm } from "@/components/forms/owner-details-form"
import { Logo } from "@/components/logo"
// Removed draft functionality
import {
  Upload,
  Users,
  Wifi,
  Car,
  Utensils,
  AirVent,
  Shield,
  Camera,
  Plus,
  X,
  CheckCircle,
  Phone,
  Mail,
  User,
  Tag,
  LogOut,
  Settings,
  Building,
  Eye,
  MapPin,
  Star,
  MessageCircle,
  Loader2,
  Trash,
  ChefHat,
  Home,
  Search,
} from "lucide-react"
import { UnifiedChat } from "@/components/unified-chat"
import { toast } from "sonner"
import { useImageLoader } from "@/hooks/use-image-loader"
import { UploadLoader, DeleteLoader } from "@/components/ui/image-loader"

const amenityOptions = [
  { id: "wifi", label: "High-Speed Wi-Fi", icon: Wifi },
  { id: "ac", label: "Air Conditioning", icon: AirVent },
  { id: "food", label: "Meals Included", icon: Utensils },
  { id: "parking", label: "Parking Space", icon: Car },
  { id: "gym", label: "Gym/Fitness Center", icon: Users },
  { id: "laundry", label: "Laundry Service", icon: Users },
  { id: "security", label: "24/7 Security", icon: Shield },
  { id: "study", label: "Study Room", icon: Users },
  { id: "cleaning", label: "Cleaning Service", icon: Users },
  { id: "generator", label: "Backup Generator", icon: Users },
  { id: "water", label: "Water Supply", icon: Users },
  { id: "maintenance", label: "Maintenance", icon: Users },
]

function ListPropertyContent() {
  const { user, logout } = useAuth()
  const { isChatOpen, toggleChat } = useChat()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [showProfile, setShowProfile] = useState(false)
  const [activeTab, setActiveTab] = useState("add-property")
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("hostel")
  const [propertySubType, setPropertySubType] = useState<string>("hostel")
  const [currentFormType, setCurrentFormType] = useState<"hostel" | "mess">("hostel")
  
  // Form step states for each property type
  const [hostelFormStep, setHostelFormStep] = useState(1)
  const [houseFormStep, setHouseFormStep] = useState(1)
  const [officeFormStep, setOfficeFormStep] = useState(1)
  const [apartmentFormStep, setApartmentFormStep] = useState(1)
  const [messFormStep, setMessFormStep] = useState(1)
  
  // Initial form data structure
  const initialFormData = {
    // Property Details
    propertyName: "",
    propertyType: "hostel",

    totalRooms: "",
    availableRooms: "",
    pricePerBed: "",
    securityDeposit: "",

    // Location
    address: "",
    country: "",
    province: "",
    city: "",
    area: "",
    mapLink: "",
    postalCode: "",
    nearbyUniversity: "",

    // Description
    description: "",
    rules: "",
    tags: [] as string[],

    // Amenities
    amenities: [] as string[],

    // Owner Details
    ownerName: "",
    ownerEmail: "",
    ownerPhone: "",
    cnicNumber: "",

    // Images
    images: [] as string[],

    // House/Apartment specific fields
    houseTitle: "",
    houseSize: "",
    bathrooms: "",
    furnished: "",
    furnishingStatus: "",
    monthlyRent: "",
    advanceSecurity: "",
    preferredTenant: "",
    parking: "",
    floorLevel: "",
    availableFrom: "",

    // Office specific fields
    officeTitle: "",
    officeType: "",
    officeArea: "",
    officeSize: "",
    washroom: "",
    workingHours: "",
    meetingRoom: false,
    internet: false,
    powerBackup: false,
    security: false,
    airConditioning: false,

    // Mess specific fields
    messName: "",
    messType: "",
    mealsOffered: [] as string[],
    monthlyCharges: "",
    deliveryAvailable: false,
    deliveryCharges: "",
    coverageArea: "",
    sampleMenu: "",
    hygieneCertification: "",
    timings: "",
    trialAvailable: false,
    generalTimings: "",
    paymentOptions: {
      cash: false,
      jazzcash: false,
      easypaisa: false
    },

    // Food Service Details
    foodService: "", // yes/no
    foodTimings: {
      breakfast: { enabled: false, startTime: "07:00", endTime: "09:00" },
      lunch: { enabled: false, startTime: "12:00", endTime: "14:00" },
      dinner: { enabled: false, startTime: "19:00", endTime: "21:00" },
      snacks: { enabled: false, startTime: "16:00", endTime: "17:00" }
    },
    foodOptions: {
      veg: false,
      nonVeg: false,
      halal: false,
      customDiet: false
    },
    foodPricing: {
      included: false,
      monthlyPrice: "",
      perMealPrice: ""
    },
    foodHygiene: "",
    foodStaff: "",
    foodCapacity: "",
    foodMenuRotation: false,
    foodSpecialRequirements: "",
    cnicPicFront: "",
    cnicPicBack: "",
    ownerPic: "",
  }

  // Form state management
  const [formData, setFormData] = useState(initialFormData)
  
  const updateFormData = (field: keyof typeof formData, value: string | string[] | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }
  
  const resetForm = () => {
    setFormData(initialFormData)
    setSelectedCategory("hostel")
    setPropertySubType("hostel")
    setCurrentFormType("hostel")
    setShowCategoryDialog(false)
    setShowMessForm(false)
    setMessFormStep(1) // Reset mess form step
    setHostelFormStep(1) // Reset hostel form step
    setHouseFormStep(1) // Reset house form step
    setOfficeFormStep(1) // Reset office form step
    setEditingProperty(null) // Clear editing state
    setUploadedImages([]) // Clear uploaded images
    setCnicPicFront("") // Clear CNIC front image
    setCnicPicBack("") // Clear CNIC back image
    setOwnerPic("") // Clear owner picture
    setTouched({}) // Clear touched fields
    setCurrentStep(1) // Reset to first step
    // Reset terms acceptance
    setAcceptVerify(false)
    setAcceptTerms(false)
    setAcceptCommission(false)
  }

  // Helper function to check if a field is invalid
  const isFieldInvalid = (field: string, step: number) => {
    switch (step) {
      case 1:
        switch (field) {
          case 'propertyName': return !formData.propertyName || formData.propertyName.length < 3
          case 'propertyType': return !formData.propertyType

          case 'totalRooms': return !formData.totalRooms || Number(formData.totalRooms) < 1
          case 'availableRooms': return !formData.availableRooms || Number(formData.availableRooms) < 0 || Number(formData.availableRooms) > Number(formData.totalRooms || 0)
          case 'pricePerBed': return !formData.pricePerBed || Number(formData.pricePerBed) <= 0
          // Office-specific fields
          case 'officeTitle': return !formData.officeTitle || formData.officeTitle.length < 3
          case 'officeType': return !formData.officeType
          case 'officeArea': return !formData.officeArea || Number(formData.officeArea) <= 0
          case 'monthlyRent': return !formData.monthlyRent || Number(formData.monthlyRent) <= 0
          default: return false
        }
      case 2:
        switch (field) {
          case 'address': return !formData.address || formData.address.length < 5
          case 'country': return !formData.country
          case 'province': return !formData.province
          case 'city': return !formData.city
          case 'area': return !formData.area || formData.area.length < 2
          case 'mapLink': return !formData.mapLink
          case 'description': return !formData.description || formData.description.length < 10
          default: return false
        }
      case 4:
        switch (field) {
          case 'ownerName': {
            if (!formData.ownerName || formData.ownerName.trim().length === 0) return true
            if (formData.ownerName.trim().length < 2 || formData.ownerName.trim().length > 50) return true
            if (!/^[a-zA-Z\s'.,-]*$/.test(formData.ownerName)) return true
            return false
          }
          case 'ownerEmail': {
            if (!formData.ownerEmail || formData.ownerEmail.trim().length === 0) return true
            const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
            if (!emailPattern.test(formData.ownerEmail) || formData.ownerEmail.length > 254) return true
            return false
          }
          case 'ownerPhone': {
            if (!formData.ownerPhone || formData.ownerPhone.trim().length === 0) return true
            const cleanPhone = formData.ownerPhone.replace(/\D/g, '')
            if (cleanPhone.length < 10 || cleanPhone.length > 15) return true
            const pakistaniPatterns = [
              /^(\+92|92|0)?3[0-9]{9}$/, // Mobile numbers
              /^(\+92|92|0)?[2-9][0-9]{7,10}$/, // Landline numbers
            ]
            return !pakistaniPatterns.some(pattern => pattern.test(cleanPhone))
          }
          case 'cnicNumber': {
            if (!formData.cnicNumber || formData.cnicNumber.trim().length === 0) return true
            const cleanCNIC = formData.cnicNumber.replace(/\D/g, '')
            if (cleanCNIC.length !== 13) return true
            if (!/^[1-9][0-9]{12}$/.test(cleanCNIC)) return true
            if (/(\d)\1{6,}/.test(cleanCNIC)) return true
            return false
          }
          default: return false
        }
      default:
        return false
    }
  }

  // Helper function to get field validation class
  const getFieldClass = (field: string, step: number, baseClass = "") => {
    const invalid = isFieldInvalid(field, step)
    return `${baseClass} ${invalid ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-500'}`
  }

  // Helper function to check if form has unsaved changes
  const hasUnsavedChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(initialFormData)
  }

  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [ownerPropertiesData, setOwnerPropertiesData] = useState<any[]>([])
  const [loadingOwnerProperties, setLoadingOwnerProperties] = useState(true)
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({})
  const [editingProperty, setEditingProperty] = useState<any | null>(null)
  const [deletingPropertyId, setDeletingPropertyId] = useState<string | null>(null)
  const [cnicPicFront, setCnicPicFront] = useState<string>("")
  const [cnicPicBack, setCnicPicBack] = useState<string>("")
  const [ownerPic, setOwnerPic] = useState<string>("")
  // Add state for terms acceptance:
  const [acceptVerify, setAcceptVerify] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptCommission, setAcceptCommission] = useState(false);
  // Add state to toggle between forms
  const [showMessForm, setShowMessForm] = useState(false);
  
  // Add ref for file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image loader hooks for property images
  const propertyImageLoader = useImageLoader()
  const messImageLoader = useImageLoader()

  const handleInputChange = (field: keyof typeof formData, value: string | string[] | boolean) => {
    updateFormData(field, value)
    setTouched(prev => ({ ...prev, [field]: true }))
    if (field === "cnicPicFront") setCnicPicFront(value as string)
    if (field === "cnicPicBack") setCnicPicBack(value as string)
    if (field === "ownerPic") setOwnerPic(value as string)
  }

  // Wrapper function for form components
  const handleFormInputChange = (field: string, value: any) => {
    handleInputChange(field as keyof typeof formData, value)
  }



  const updateFoodTiming = (mealType: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      foodTimings: {
        ...prev.foodTimings,
        [mealType]: {
          ...prev.foodTimings[mealType as keyof typeof prev.foodTimings],
          [field]: value
        }
      }
    }))
  }

  const updateFoodOption = (option: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      foodOptions: {
        ...prev.foodOptions,
        [option]: value
      }
    }))
  }

  const updateFoodPricing = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      foodPricing: {
        ...prev.foodPricing,
        [field]: value
      }
    }))
  }

  const handleCategorySelection = (category: string) => {
    // If user is editing a property and switches category, clear the form
    if (editingProperty) {
      resetForm()
    }
    
    setSelectedCategory(category)
    setShowCategoryDialog(false)
    
    if (category === 'hostel-mess') {
      setCurrentFormType("mess")
      setFormData(prev => ({ ...prev, propertyType: 'hostel-mess' }))
      setShowMessForm(true)
    } else {
      // Handle "hostel" category (now renamed to "Property")
      setCurrentFormType("hostel")
      setFormData(prev => ({ ...prev, propertyType: 'hostel' }))
      setShowMessForm(false)
      // Don't auto-select a sub-property type, let user choose from hostel, apartment, house, office
      setPropertySubType("")
    }
  }

  const handleFormTypeChange = (type: "hostel" | "mess") => {
    setCurrentFormType(type)
    if (type === "mess") {
      setPropertySubType("")
    } else {
      setPropertySubType("hostel")
    }
  }

  // Wrapper function to handle property sub-type changes and clear form if editing
  const handlePropertySubTypeChange = (newSubType: string) => {
    // If user is editing a property and switches sub-type, clear the form
    if (editingProperty && propertySubType !== newSubType) {
      resetForm()
      // Re-set the category and form type after reset
      setSelectedCategory("hostel")
      setCurrentFormType("hostel")
      setShowCategoryDialog(false)
      setShowMessForm(false)
      setFormData(prev => ({ ...prev, propertyType: 'hostel' }))
    }
    setPropertySubType(newSubType)
  }

  // Wrapper function to handle tab switching and clear form if editing
  const handleTabSwitch = (tab: string, skipFormClear = false) => {
    // If user is editing a property and switches to add-property tab, clear the form
    // unless skipFormClear is true (used when editing a property)
    if (editingProperty && tab === "add-property" && !skipFormClear) {
      resetForm()
    }
    setActiveTab(tab)
    // No longer show category dialog - default to hostel form
  }

  const handleAmenityChange = (amenityId: string, checked: boolean) => {
    if (checked) {
      updateFormData('amenities', [...formData.amenities, amenityId])
    } else {
      updateFormData('amenities', formData.amenities.filter((id) => id !== amenityId))
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      updateFormData('tags', [...formData.tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    updateFormData('tags', formData.tags.filter((tag) => tag !== tagToRemove))
  }



  const addSampleImage = () => {
    const sampleImages = [
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop",
    ]

    const randomImage = sampleImages[Math.floor(Math.random() * sampleImages.length)]
    if (!uploadedImages.includes(randomImage)) {
      setUploadedImages((prev) => [...prev, randomImage])
    }
  }



  const populateFormForEdit = (property: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('=== POPULATING FORM FOR EDIT ===')
      console.log('Property data received:', property)
      console.log('=== ALL POSSIBLE MESS TYPE FIELDS ===')
      console.log('property.messType:', property.messType)
      console.log('property.propertySubType:', property.propertySubType)
      console.log('property.subType:', property.subType)
      console.log('property.type:', property.type)
      console.log('property.category:', property.category)
      console.log('=== TIMING FIELDS ===')
      console.log('property.timings:', property.timings)
      console.log('property.generalTimings:', property.generalTimings)
    }
    setFormData({
      propertyName: property.title || '',
      propertyType: property.propertySubType || '', // Category/subcategory

      totalRooms: property.totalRooms?.toString() || '',
      availableRooms: property.availableRooms?.toString() || '',
      pricePerBed: property.pricing?.pricePerBed?.toString() || '',
      securityDeposit: property.pricing?.securityDeposit?.toString() || '',
      address: property.address?.street || property.address || '',
      country: property.address?.country || property.country || '',
      province: property.address?.province || property.province || property.address?.state || '',
      city: property.address?.city || property.city || '',
      area: property.address?.area || property.area || '',
      mapLink: property.mapLink || property.address?.mapLink || '',
      postalCode: property.postalCode || property.address?.postalCode || '',
      nearbyUniversity: property.nearbyUniversity || '',
      description: property.description || '',
      rules: property.rules?.[0] || '',
      tags: property.tags || [],
      amenities: property.amenities || [],
      ownerName: property.contactInfo?.name || user?.name || '',
      ownerEmail: property.contactInfo?.email || user?.email || '',
      ownerPhone: property.contactInfo?.phone || '',
      cnicNumber: property.cnicNumber || '',
      images: property.images || [],

      // House/Apartment specific fields
      houseTitle: property.houseTitle || '',
      houseSize: property.houseSize || '',
      bathrooms: property.bathrooms || '',
      furnished: property.furnished || '',
      furnishingStatus: property.furnishingStatus || property.furnished || '',
      monthlyRent: property.monthlyRent || '',
      advanceSecurity: property.advanceSecurity || '',
      preferredTenant: property.preferredTenant || '',
      parking: property.parking || '',
      floorLevel: property.floorLevel || '',
      availableFrom: property.availableFrom || '',

      // Office specific fields
      officeTitle: property.officeTitle || '',
      officeType: property.officeType || '',
      officeArea: property.officeArea || '',
      officeSize: property.officeSize || property.officeArea || '',
      washroom: property.washroom || '',
      workingHours: property.workingHours || '',
      meetingRoom: property.meetingRoom || false,
      internet: property.internet || false,
      powerBackup: property.powerBackup || false,
      security: property.security || false,
      airConditioning: property.airConditioning || false,

      // Mess specific fields
      messName: property.messName || property.title || '',
      messType: (() => {
        // Handle different mess type values that might be stored
        const possibleFields = [
          property.messType,
          property.propertySubType,
          property.subType,
          property.type,
          property.category
        ];

        // Find the first non-empty value
        let rawMessType = possibleFields.find(field => field && field.trim() !== '') || '';

        // If still empty, check if this is a new mess property being created
        if (!rawMessType && property.propertyType === 'hostel-mess') {
          rawMessType = 'both'; // Default to both as most common
        }

        const lowerMessType = rawMessType.toLowerCase().trim();

        console.log('=== MESS TYPE MAPPING ===');
        console.log('Raw mess type from property:', rawMessType);
        console.log('Lowercase mess type:', lowerMessType);

        // Map different possible values to our expected values
        let mappedType = '';

        if (lowerMessType.includes('both') || (lowerMessType.includes('veg') && lowerMessType.includes('non'))) {
          mappedType = 'both';
        } else if (lowerMessType.includes('vegetarian') || lowerMessType === 'veg') {
          mappedType = 'veg';
        } else if (lowerMessType.includes('non-veg') || lowerMessType.includes('nonveg') || lowerMessType.includes('non vegetarian')) {
          mappedType = 'non-veg';
        } else if (['veg', 'non-veg', 'both'].includes(lowerMessType)) {
          mappedType = lowerMessType;
        } else {
          // Default mapping based on common variations
          mappedType = rawMessType;
        }

        console.log('Final mapped mess type:', mappedType);
        console.log('=== END MESS TYPE MAPPING ===');
        return mappedType;
      })(),
      mealsOffered: property.mealsOffered || [],
      monthlyCharges: property.monthlyCharges || property.pricing?.pricePerBed?.toString() || '',
      deliveryAvailable: property.deliveryAvailable || false,
      deliveryCharges: property.deliveryCharges || '',
      coverageArea: property.coverageArea || '',
      sampleMenu: property.sampleMenu || '',
      hygieneCertification: property.hygieneCertification || '',
      timings: property.timings || property.generalTimings || '',
      trialAvailable: property.trialAvailable || false,
      generalTimings: property.generalTimings || property.timings || '',
      paymentOptions: property.paymentOptions || {
        cash: false,
        jazzcash: false,
        easypaisa: false
      },
      foodService: property.foodService || '',
      foodTimings: property.foodTimings || {
        breakfast: { enabled: false, startTime: "07:00", endTime: "09:00" },
        lunch: { enabled: false, startTime: "12:00", endTime: "14:00" },
        dinner: { enabled: false, startTime: "19:00", endTime: "21:00" },
        snacks: { enabled: false, startTime: "16:00", endTime: "17:00" }
      },
      foodOptions: property.foodOptions || {
        veg: false,
        nonVeg: false,
        halal: false,
        customDiet: false
      },
      foodPricing: property.foodPricing || {
        included: false,
        monthlyPrice: "",
        perMealPrice: ""
      },
      foodHygiene: property.foodHygiene || '',
      foodStaff: property.foodStaff || '',
      foodCapacity: property.foodCapacity || '',
      foodMenuRotation: property.foodMenuRotation || false,
      foodSpecialRequirements: property.foodSpecialRequirements || '',
      cnicPicFront: property.cnicPicFront || property.ownerDocuments?.cnicFront || property.documents?.cnicFront || '',
      cnicPicBack: property.cnicPicBack || property.ownerDocuments?.cnicBack || property.documents?.cnicBack || '',
      ownerPic: property.ownerPic || property.ownerDocuments?.ownerPhoto || property.documents?.ownerPhoto || property.contactInfo?.photo || '',
    })
    // Handle images - extract URLs if they're objects
    const imageUrls = property.images ? property.images.map((img: any) => {
      if (typeof img === 'string') return img
      if (typeof img === 'object' && img.url) return img.url
      return ''
    }).filter((url: string) => url && url.trim() !== '') : []
    setUploadedImages(imageUrls)
    
    // Set owner document images
    setCnicPicFront(property.cnicPicFront || property.ownerDocuments?.cnicFront || property.documents?.cnicFront || '')
    setCnicPicBack(property.cnicPicBack || property.ownerDocuments?.cnicBack || property.documents?.cnicBack || '')
    setOwnerPic(property.ownerPic || property.ownerDocuments?.ownerPhoto || property.documents?.ownerPhoto || property.contactInfo?.photo || '')
    setEditingProperty(property)
    setCurrentStep(1)
    setActiveTab('add-property')
    
    // Add a small delay to ensure form data is fully updated before rendering
    setTimeout(() => {
      console.log('=== FORM DATA AFTER POPULATE ===')
      console.log('Final formData.messType:', formData.messType)
      console.log('Final formData.timings:', formData.timings)
    }, 100)
    
    // Set correct form type based on property type
    console.log('Property type:', property.propertyType)
    console.log('Property sub-type:', property.propertySubType || property.subType)
    
    if (property.propertyType === 'hostel-mess') {
      setSelectedCategory('hostel-mess')
      setCurrentFormType('mess')
      setShowMessForm(true)
      setPropertySubType('mess')
      console.log('Set form to mess type')
    } else {
      setSelectedCategory('hostel')
      setCurrentFormType('hostel')
      setShowMessForm(false)
      // Determine main property type from property data
      const mainType = property.propertyType || 'hostel'
      setPropertySubType(mainType)
      console.log('Set form to hostel type, mainType:', mainType)
    }
    setShowCategoryDialog(false)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Check terms acceptance first
      if (!acceptTerms || !acceptCommission) {
        toast.error("Please accept all terms and conditions before submitting")
        setIsSubmitting(false)
        return
      }

      // Debug: Log current form data
      console.log('=== FORM SUBMISSION DEBUG ===')
      console.log('Current form type:', currentFormType)
      console.log('Show mess form:', showMessForm)
      console.log('Property type:', formData.propertyType)
      console.log('Full form data:', formData)

      // Multi-step forms handle their own validation, so we can proceed directly
      //         areaLength: formData.area?.length,
      //         areaValid: formData.area && formData.area.length >= 2,
      //         description: formData.description,
      //         descriptionLength: formData.description?.length,
      //         descriptionValid: formData.description && formData.description.length >= 20
      //       })
      //     }

      //     toast.error(`Please complete all required fields in ${stepName} before submitting`)
      //     setIsSubmitting(false)
      //     setCurrentStep(step)
      //     return
      //   }
      // }

      // Additional validations
      if (formData.totalRooms && formData.availableRooms && 
          Number(formData.availableRooms) > Number(formData.totalRooms)) {
        toast.error('Available rooms cannot be greater than total rooms')
        setIsSubmitting(false)
        setCurrentStep(1)
        return
      }

      // Mess-specific validations
      if (formData.propertyType === 'hostel-mess') {
        const hasEnabledMeal = formData.foodTimings.breakfast.enabled ||
                              formData.foodTimings.lunch.enabled ||
                              formData.foodTimings.dinner.enabled ||
                              formData.foodTimings.snacks.enabled

        if (!hasEnabledMeal) {
          toast.error('Please enable at least one meal timing for your mess')
          setIsSubmitting(false)
          setCurrentStep(1)
          return
        }

        if (uploadedImages.length < 3) {
          toast.error('Please upload at least 3 images for your mess')
          setIsSubmitting(false)
          setCurrentStep(3)
          return
        }
      } else {
        // Regular property validations
        if (uploadedImages.length < 2) {
          toast.error('Please upload at least 2 images of your property')
          setIsSubmitting(false)
          setCurrentStep(3)
          return
        }
      }

      // Prepare property data matching frontend form structure
      const propertyData = {
        title: formData.propertyName,
        description: formData.description,
        propertyType: currentFormType === "mess" ? 'hostel-mess' : propertySubType,
        propertySubType: formData.propertyType,

        
        // Send address as structured object to match display expectations
        address: {
          street: formData.address,
          area: formData.area,
          city: formData.city,
          province: formData.province,
          country: formData.country,
          postalCode: formData.postalCode,
          mapLink: formData.mapLink
        },
        // Also send individual fields for backward compatibility
        country: formData.country,
        province: formData.province,
        city: formData.city,
        area: formData.area,
        mapLink: formData.mapLink,
        postalCode: formData.postalCode,
        
        // Pricing - use pricePerBed for all types as main price field
        pricePerBed: formData.pricePerBed ? parseInt(formData.pricePerBed) : undefined,
        monthlyRent: formData.monthlyRent ? parseInt(formData.monthlyRent) : undefined,
        securityDeposit: formData.securityDeposit ? parseInt(formData.securityDeposit) : undefined,
        
        totalRooms: formData.totalRooms ? parseInt(formData.totalRooms) : undefined,
        availableRooms: formData.availableRooms ? parseInt(formData.availableRooms) : undefined,
        
        amenities: formData.amenities || [],
        images: uploadedImages.map(url => ({
          url,
          publicId: '',
          isActive: true,
          uploadedAt: new Date()
        })),
        rules: formData.rules,
        tags: formData.tags || [],
        nearbyUniversity: formData.nearbyUniversity,
        
        // Owner details
        contactInfo: {
          name: formData.ownerName,
          phone: formData.ownerPhone,
          email: formData.ownerEmail
        },
        ownerName: formData.ownerName,
        ownerEmail: formData.ownerEmail,
        ownerPhone: formData.ownerPhone,
        cnicNumber: "N/A",
        cnicPicFront: "",
        cnicPicBack: "",
        ownerPic: "",
        
        // Property-specific fields
        ...(currentFormType === "mess" ? {
          messName: formData.messName || formData.propertyName,
          messType: formData.messType,
          monthlyCharges: formData.monthlyCharges ? parseInt(formData.monthlyCharges) : undefined,
          deliveryAvailable: formData.deliveryAvailable,
          deliveryCharges: formData.deliveryCharges,
          coverageArea: formData.coverageArea,
          sampleMenu: formData.sampleMenu,
          hygieneCertification: formData.hygieneCertification,
          timings: formData.timings,
          generalTimings: formData.generalTimings,
          trialAvailable: formData.trialAvailable,
          paymentOptions: formData.paymentOptions,
          foodService: formData.foodService,
          foodTimings: formData.foodTimings,
          foodOptions: formData.foodOptions,
          foodPricing: formData.foodPricing,
          foodHygiene: formData.foodHygiene,
          foodStaff: formData.foodStaff,
          foodCapacity: formData.foodCapacity,
          foodMenuRotation: formData.foodMenuRotation,
          foodSpecialRequirements: formData.foodSpecialRequirements,
          mealsOffered: formData.mealsOffered
        } : {
          houseSize: formData.houseSize,
          officeSize: formData.officeSize,
          furnishingStatus: formData.furnishingStatus,
          bathrooms: formData.bathrooms,
          furnished: formData.furnished,
          advanceSecurity: formData.advanceSecurity,
          preferredTenant: formData.preferredTenant,
          parking: formData.parking,
          floorLevel: formData.floorLevel,
          availableFrom: formData.availableFrom,
          workingHours: formData.workingHours,
          meetingRoom: formData.meetingRoom,
          internet: formData.internet,
          powerBackup: formData.powerBackup,
          security: formData.security,
          airConditioning: formData.airConditioning,
          washroom: formData.washroom
        })
      }

      // Sanitized logging
      const logData = { 
        ...propertyData, 
        cnicPicFront: propertyData.cnicPicFront ? '[REDACTED]' : '',
        cnicPicBack: propertyData.cnicPicBack ? '[REDACTED]' : '',
        ownerPic: propertyData.ownerPic ? '[REDACTED]' : ''
      }
      console.log('Property data to send:', logData)
      
      let response
      if (editingProperty && editingProperty._id) {
        // Update existing property
        response = await fetch(`/api/properties/${editingProperty._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(propertyData),
        })
      } else {
        // Create new property
        response = await fetch('/api/properties', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(propertyData),
        })
      }

      if (response.ok) {
        const data = await response.json()
        toast.success(
          editingProperty 
            ? 'Property updated successfully!' 
            : 'Property submitted successfully! It will be reviewed by admin before going live.'
        )
        
        // Reset form and states
        resetForm()
        setUploadedImages([])
        setCurrentStep(1)
        setActiveTab("my-properties")
        setEditingProperty(null)
        setAcceptVerify(false)
        setAcceptTerms(false)
        setAcceptCommission(false)
        
        // Refresh properties list
        loadOwnerProperties()
      } else {
        const errorData = await response.json()
        console.error('Property submission error:', errorData)
        toast.error('Failed to save property: ' + (errorData.error || 'Unknown error occurred'))
      }
    } catch (error) {
      console.error('Error submitting property:', error)
      toast.error('Failed to submit property. Please check your internet connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const loadOwnerProperties = async () => {
    setLoadingOwnerProperties(true)
    try {
      const response = await fetch('/api/properties/owner')
      if (response.ok) {
        const data = await response.json()
        setOwnerPropertiesData(data.properties || [])
      }
    } catch (error) {
      console.error('Error loading properties:', error)
    } finally {
      setLoadingOwnerProperties(false)
    }
  }

  // Load owner properties when component mounts
  React.useEffect(() => {
    if (activeTab === "my-properties") {
      loadOwnerProperties()
    }
  }, [activeTab])

  // Close profile dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.profile-dropdown-container')) {
        setShowProfile(false)
      }
    }

    if (showProfile) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showProfile])

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        // Basic property validation
        const basicValid = !!(formData.propertyName && 
                             formData.propertyType && 
                             formData.totalRooms && 
                             formData.availableRooms && 
                             formData.pricePerBed &&
                             formData.propertyName.length >= 3 &&
                             Number(formData.totalRooms) >= 1 &&
                             Number(formData.availableRooms) >= 0 &&
                             Number(formData.availableRooms) <= Number(formData.totalRooms) &&
                             Number(formData.pricePerBed) > 0)
        

        
        // Additional mess-specific validation
        if (formData.propertyType === 'hostel-mess') {
          const messBasicValid = !!(formData.propertyName &&
                                   formData.propertyType &&
                                   formData.totalRooms &&
                                   formData.availableRooms &&
                                   formData.monthlyCharges &&
                                   formData.propertyName.length >= 3 &&
                                   Number(formData.totalRooms) >= 1 &&
                                   Number(formData.availableRooms) >= 0 &&
                                   Number(formData.availableRooms) <= Number(formData.totalRooms) &&
                                   Number(formData.monthlyCharges) > 0)

          const hasEnabledMeal = formData.foodTimings?.breakfast?.enabled ||
                                formData.foodTimings?.lunch?.enabled ||
                                formData.foodTimings?.dinner?.enabled ||
                                formData.foodTimings?.snacks?.enabled
          const messValid = !!(formData.messType && hasEnabledMeal)
          return messBasicValid && messValid
        }
        
        // Additional office-specific validation
        if (formData.propertyType === 'office') {
          const officeValid = !!(
            formData.officeTitle && 
            formData.officeType && 
            formData.officeArea &&
            formData.officeTitle.length >= 3 &&
            Number(formData.officeArea) > 0
          )
          return officeValid && !!formData.city && !!formData.monthlyRent && Number(formData.monthlyRent) > 0
        }
        
        return basicValid

      case 2:
        if (formData.propertyType === 'hostel-mess') {
          // Step 2 for mess: Rules & Food Info validation (only description is required)
          return !!(formData.description && formData.description.length >= 10)
        } else {
          // Step 2 for other properties: Location & Description validation
          const step2Valid = !!(formData.address &&
                   formData.city &&
                   formData.area &&
                   formData.description &&
                   formData.address.length >= 5 &&
                   formData.area.length >= 2 &&
                   formData.description.length >= 10)
          return step2Valid
        }

      case 3:
        // Images are required - minimum 3 for mess, 2 for others
        const minImages = formData.propertyType === 'hostel-mess' ? 3 : 2
        return uploadedImages.length >= minImages

      case 4:
        // For mess form, step 4 is just images; for other forms, step 4 includes owner details
        if (formData.propertyType === 'hostel-mess') {
          // Step 4 for mess: Images validation
          const minImages = 3
          return uploadedImages.length >= minImages
        } else {
          // Step 4 for other forms: Owner details and terms
          const nameValid = !!(formData.ownerName && 
                           formData.ownerName.trim().length >= 2 && 
                           formData.ownerName.trim().length <= 50 &&
                           /^[a-zA-Z\s'.,-]*$/.test(formData.ownerName))
          
          const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
          const emailValid = !!(formData.ownerEmail && 
                            emailPattern.test(formData.ownerEmail) &&
                            formData.ownerEmail.length <= 254)
          
          const phoneValid = !!(formData.ownerPhone && (() => {
            const cleanPhone = formData.ownerPhone.replace(/\D/g, '')
            if (cleanPhone.length < 10 || cleanPhone.length > 15) return false
            const pakistaniPatterns = [
              /^(\+92|92|0)?3[0-9]{9}$/, // Mobile numbers
              /^(\+92|92|0)?[2-9][0-9]{7,10}$/, // Landline numbers
            ]
            return pakistaniPatterns.some(pattern => pattern.test(cleanPhone))
          })())
          
          const cnicValid = !!(formData.cnicNumber && (() => {
            const cleanCNIC = formData.cnicNumber.replace(/\D/g, '')
            if (cleanCNIC.length !== 13) return false
            if (!/^[1-9][0-9]{12}$/.test(cleanCNIC)) return false
            if (/(\d)\1{6,}/.test(cleanCNIC)) return false
            return true
          })())

          const ownerValid = nameValid && emailValid && phoneValid && cnicValid

          // Check terms acceptance and required documents
          const termsValid = acceptVerify && acceptTerms && acceptCommission
          const documentsValid = !!(cnicPicFront && cnicPicBack && ownerPic)

          return ownerValid && termsValid && documentsValid
        }

      case 5:
        // Step 5 is only for mess form: Owner details and terms
        if (formData.propertyType === 'hostel-mess') {
          const nameValid = !!(formData.ownerName && 
                           formData.ownerName.trim().length >= 2 && 
                           formData.ownerName.trim().length <= 50 &&
                           /^[a-zA-Z\s'.,-]*$/.test(formData.ownerName))
          
          const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
          const emailValid = !!(formData.ownerEmail && 
                            emailPattern.test(formData.ownerEmail) &&
                            formData.ownerEmail.length <= 254)
          
          const phoneValid = !!(formData.ownerPhone && (() => {
            const cleanPhone = formData.ownerPhone.replace(/\D/g, '')
            if (cleanPhone.length < 10 || cleanPhone.length > 15) return false
            const pakistaniPatterns = [
              /^(\+92|92|0)?3[0-9]{9}$/, // Mobile numbers
              /^(\+92|92|0)?[2-9][0-9]{7,10}$/, // Landline numbers
            ]
            return pakistaniPatterns.some(pattern => pattern.test(cleanPhone))
          })())
          
          const cnicValid = !!(formData.cnicNumber && (() => {
            const cleanCNIC = formData.cnicNumber.replace(/\D/g, '')
            if (cleanCNIC.length !== 13) return false
            if (!/^[1-9][0-9]{12}$/.test(cleanCNIC)) return false
            if (/(\d)\1{6,}/.test(cleanCNIC)) return false
            return true
          })())

          const ownerValid = nameValid && emailValid && phoneValid && cnicValid

          // Check terms acceptance and required documents
          const termsValid = acceptVerify && acceptTerms && acceptCommission
          const documentsValid = !!(cnicPicFront && cnicPicBack && ownerPic)

          return ownerValid && termsValid && documentsValid
        }
        return false

      default:
        return false
    }
  }

  const nextStep = () => {
    if (currentStep < 4) {
      if (validateStep(currentStep)) {
        setCurrentStep(currentStep + 1)
      } else {
        let message = ""
        switch (currentStep) {
          case 1:
            if (formData.propertyType === 'hostel-mess') {
              message = "Please fill in all required fields:\n• Property Name (min 3 characters)\n• Mess Type (Veg/Non-Veg/Both)\n• Total Capacity\n• Available Spots\n• Monthly Charges\n• At least one meal timing must be enabled"
            } else if (formData.propertyType === 'office') {
              message = "Please fill in all required fields:\n• Office Title (min 3 characters)\n• Office Type\n• City\n• Monthly Rent (PKR)\n• Area (Sq. ft)\n• Complete Address"
            } else {
              message = "Please fill in all required fields:\n• Property Name (min 3 characters)\n• Property Type\n• Total Rooms (min 1)\n• Available Rooms (must be ≤ total rooms)\n• Price per Bed"
            }
            break
          case 2:
            message = "Please fill in all required fields:\n• Complete Address (min 5 characters)\n• City\n• Area/Locality (min 2 characters)\n• Property Description (min 10 characters)"
            break
          case 3:
            const minImages = formData.propertyType === 'hostel-mess' ? 3 : 2
            message = `Please upload at least ${minImages} images of your ${formData.propertyType === 'hostel-mess' ? 'mess facilities' : 'property'}`
            break
          case 4:
            if (!acceptVerify || !acceptTerms || !acceptCommission) {
              message = "Please accept all terms and conditions before proceeding"
            } else {
              message = "Please fill in all required owner details:\n• Full Name (min 2 characters)\n• Valid Email Address\n• Phone Number (min 10 digits)"
            }
            break
          default:
            message = "Please complete all required fields before proceeding."
        }
        toast.error(message)
      }
    }
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const steps = [
    { number: 1, title: "Property Details", description: "Basic information about your property" },
    { number: 2, title: "Location & Description", description: "Where is your property located" },
    { number: 3, title: "Amenities & Images", description: "What facilities do you offer" },
    { number: 4, title: "Owner Details", description: "Your contact information" },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
      case "active":
        return "bg-green-100 text-green-700"
      case "pending":
        return "bg-yellow-100 text-yellow-700"
      case "rejected":
        return "bg-red-100 text-red-700"
      default:
        return "bg-slate-100 text-slate-700"
    }
  }

  // Delete property handler
  const handleDeleteProperty = async (propertyId: string) => {
    const confirmMessage = `Permanently delete property and all data?`;
    
    if (!window.confirm(confirmMessage)) return;
    
    setDeletingPropertyId(propertyId);
    try {
      console.log(`Starting deletion process for property: ${propertyId}`);
      const res = await fetch(`/api/properties/${propertyId}`, { method: 'DELETE' });
      
      if (res.ok) {
        const data = await res.json();
        console.log('Deletion response:', data);
        
        // Show simple success message
        toast.success('✅ Property and all related records deleted successfully!');
        loadOwnerProperties();
      } else {
        const data = await res.json();
        console.error('Deletion failed:', data);
        toast.error('Failed to delete property: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Deletion error:', err);
      toast.error('Failed to delete property. Please try again.');
    } finally {
      setDeletingPropertyId(null);
    }
  };

  // In the mess form section, always set foodService to 'yes' and remove the food service select.
  React.useEffect(() => {
    if (showMessForm) {
      setFormData(prev => ({
        ...prev,
        foodService: 'yes',
      }));
    }
  }, [showMessForm]);

  // In the Mess form, before handleSubmit is called, ensure propertyType is 'hostel-mess'
  const handleMessSubmit = async () => {
    if (formData.propertyType !== 'hostel-mess') {
      handleInputChange('propertyType', 'hostel-mess');
    }
    await handleSubmit();
  };

  React.useEffect(() => {
    if (showMessForm && formData.propertyType !== 'hostel-mess') {
      handleInputChange('propertyType', 'hostel-mess');
    }
  }, [showMessForm]);

  // Set showMessForm to true when propertyType is 'hostel-mess'
  React.useEffect(() => {
    if (formData.propertyType === 'hostel-mess' && !showMessForm) {
      setShowMessForm(true);
    } else if (formData.propertyType !== 'hostel-mess' && showMessForm) {
      setShowMessForm(false);
    }
  }, [formData.propertyType]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Category Selection Dialog */}
      <Dialog 
        open={showCategoryDialog && activeTab === "add-property"} 
        onOpenChange={(open) => {
          // Allow closing the dialog
          setShowCategoryDialog(open)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-slate-800">
              Choose Property Type
            </DialogTitle>
            <DialogDescription className="text-center text-slate-600">
              Select the type of property you want to list
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 mt-6">
            <button
              onClick={() => handleCategorySelection("hostel")}
              className="flex items-center space-x-4 p-4 border-2 border-slate-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all duration-200 group"
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                <Home className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-slate-800 group-hover:text-emerald-700">Property</h3>
                <p className="text-sm text-slate-600">Hostels, apartments, houses, and offices</p>
              </div>
            </button>
            <button
              onClick={() => handleCategorySelection("hostel-mess")}
              className="flex items-center space-x-4 p-4 border-2 border-slate-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all duration-200 group"
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                <ChefHat className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-slate-800 group-hover:text-emerald-700">Mess</h3>
                <p className="text-sm text-slate-600">Food service and dining facilities</p>
              </div>
            </button>
          </div>
          {selectedCategory && (
            <div className="mt-6 pt-4 border-t border-slate-200">
              <Button 
                onClick={() => setShowCategoryDialog(false)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
              >
                Continue
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Custom Navbar for Property Owners */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="cursor-default select-none">
              <div className="flex items-center space-x-3">
                <Logo size={36} showText={false} />
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-slate-800 transition-colors">
                    RoomMatch PK
                  </span>
                  <span className="text-xs text-slate-500 -mt-1">Property Host</span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="hidden md:flex items-center space-x-1">
              <button
                onClick={() => handleTabSwitch("add-property")}
                className={`relative px-4 py-3 text-sm font-medium transition-all duration-200 cursor-pointer group ${
                  activeTab === "add-property" 
                    ? "text-emerald-700" 
                    : "text-slate-600 hover:text-emerald-600"
                }`}
              >
                Add Property
                <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-px bg-emerald-500 transition-all duration-200 ${
                  activeTab === "add-property" ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`} />
              </button>
              <button
                onClick={() => handleTabSwitch("my-properties")}
                className={`relative px-4 py-3 text-sm font-medium transition-all duration-200 cursor-pointer group ${
                  activeTab === "my-properties" 
                    ? "text-emerald-700" 
                    : "text-slate-600 hover:text-emerald-600"
                }`}
              >
                My Properties
                <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-px bg-emerald-500 transition-all duration-200 ${
                  activeTab === "my-properties" ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`} />
              </button>
            </div>

            {/* Find Properties and User Profile */}
            <div className="flex items-center space-x-2">
              {/* Find Properties Button */}
              <Button
                variant="ghost"
                onClick={() => router.push('/find-rooms')}
                className="px-3 py-2 h-9 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 text-emerald-600 transition-all duration-200 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:block text-sm font-medium ml-2">Find Properties</span>
              </Button>
              {/* Chat Button */}
              <Button
                variant="ghost"
                onClick={toggleChat}
                className="px-3 py-2 h-9 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 text-emerald-600 transition-all duration-200 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:block text-sm font-medium ml-2">Chat</span>
              </Button>

              {/* User Profile */}
              <div className="relative profile-dropdown-container">
                <Button
                  variant="ghost"
                  onClick={() => setShowProfile(!showProfile)}
                  className="px-3 py-2 h-10 rounded-lg hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 hover:shadow-md transition-all duration-200 cursor-pointer border border-transparent hover:border-emerald-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center shadow-sm">
                    <User className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div className="hidden sm:block text-left ml-3">
                    <div className="text-sm font-semibold text-slate-800 truncate max-w-[120px]">{user?.name}</div>
                    <div className="text-xs text-slate-600 capitalize font-medium">{user?.role}</div>
                  </div>
                </Button>

              {/* Profile Dropdown */}
              {showProfile && (
                <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50 animate-in slide-in-from-top-2 duration-200">
                  <div className="px-5 py-4 border-b border-slate-100">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center shadow-md">
                        <User className="w-7 h-7 text-emerald-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900 truncate text-base">{user?.name}</div>
                        <div className="text-sm text-slate-600 truncate">{user?.email}</div>
                        <Badge className="bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 text-xs mt-2 font-medium px-2 py-1">{user?.role}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="py-2">
                    <button
                      onClick={() => {
                        setActiveTab("my-properties")
                        setShowProfile(false)
                      }}
                      className="flex items-center space-x-3 px-5 py-3 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-200 w-full text-left cursor-pointer"
                    >
                      <Building className="w-5 h-5" />
                      <span className="font-medium">My Properties</span>
                    </button>
                  </div>
                  
                  <div className="border-t border-slate-100 pt-2">
                    <button
                      onClick={logout}
                      className="flex items-center space-x-3 px-5 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 w-full text-left cursor-pointer"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Tabs */}
      <div className="md:hidden bg-white border-b border-slate-200">
        <div className="flex">
          <button
            onClick={() => handleTabSwitch("add-property")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === "add-property" ? "text-emerald-600 border-b-2 border-emerald-600" : "text-slate-700"
            }`}
          >
            Add Property
          </button>
          <button
            onClick={() => handleTabSwitch("my-properties")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === "my-properties" ? "text-emerald-600 border-b-2 border-emerald-600" : "text-slate-700"
            }`}
          >
            My Properties
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1">
        {activeTab === "add-property" ? (
          <>
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-emerald-600 to-blue-600 py-12 sm:py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                  <Badge className="bg-white/20 text-white hover:bg-white/30 mb-6">List Your Property</Badge>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
                    Share Your Property with
                    <span className="text-emerald-200"> Students</span>
                  </h1>
                  <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto">
                    Join thousands of hosts helping students find their perfect home. List your property and
                    start earning today!
                  </p>
                </div>
              </div>
            </section>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            {/* Form Type Selector */}
            {selectedCategory && (
              <div className="mb-8">
                <div className="flex justify-center">
                  <div className="bg-white rounded-lg p-1 shadow-lg border">
                    <div className="flex">
                      <button
                        onClick={() => {
                          setCurrentFormType("hostel")
                          setFormData(prev => ({ ...prev, propertyType: 'hostel' }))
                          setShowMessForm(false)
                        }}
                        className={`px-6 py-3 rounded-md font-medium transition-all ${
                          currentFormType === "hostel"
                            ? "bg-emerald-600 text-white shadow-md"
                            : "text-slate-600 hover:text-emerald-600"
                        }`}
                      >
                        <Home className="w-4 h-4 inline mr-2" />
                        Property Details
                      </button>
                      <button
                        onClick={() => {
                          setCurrentFormType("mess")
                          setFormData(prev => ({ ...prev, propertyType: 'hostel-mess' }))
                          setShowMessForm(true)
                        }}
                        className={`px-6 py-3 rounded-md font-medium transition-all ${
                          currentFormType === "mess"
                            ? "bg-emerald-600 text-white shadow-md"
                            : "text-slate-600 hover:text-emerald-600"
                        }`}
                      >
                        <ChefHat className="w-4 h-4 inline mr-2" />
                        Mess Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Dynamic Form Content */}
            <Card className="shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                      {currentFormType === "mess" ? "Mess Details Form" : "Property Details Form"}
                    </h2>
                    <p className="text-slate-600">
                      {currentFormType === "mess" 
                        ? "Fill in your mess/tiffin service details" 
                        : "Fill in your property details"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <FormAutoSaveIndicator
                      hasUnsavedChanges={hasUnsavedChanges()}
                      variant="badge"
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 sm:p-8">
                {/* Dynamic Form Rendering */}
                {currentFormType === "hostel" ? (
                  // Always show HostelFormMultiStep for property selection - it includes all subtypes
                  <HostelFormMultiStep
                    formData={formData}
                    handleInputChange={handleFormInputChange}
                    uploadedImages={uploadedImages}
                    setUploadedImages={setUploadedImages}
                    tagInput={tagInput}
                    setTagInput={setTagInput}
                    touched={touched}
                    setTouched={setTouched}
                    propertySubType={propertySubType}
                    setPropertySubType={handlePropertySubTypeChange}
                    externalLoader={propertyImageLoader}
                    currentStep={hostelFormStep}
                    setCurrentStep={setHostelFormStep}
                    onSubmit={handleSubmit}
                    cnicPicFront={cnicPicFront}
                    setCnicPicFront={setCnicPicFront}
                    cnicPicBack={cnicPicBack}
                    setCnicPicBack={setCnicPicBack}
                    ownerPic={ownerPic}
                    setOwnerPic={setOwnerPic}
                    acceptVerify={acceptVerify}
                    setAcceptVerify={setAcceptVerify}
                    acceptTerms={acceptTerms}
                    setAcceptTerms={setAcceptTerms}
                    acceptCommission={acceptCommission}
                    setAcceptCommission={setAcceptCommission}
                    isSubmitting={isSubmitting}
                    editingProperty={editingProperty}
                  />
                ) : (
                  <MessFormMultiStep
                    formData={formData}
                    handleInputChange={handleFormInputChange}
                    uploadedImages={uploadedImages}
                    setUploadedImages={setUploadedImages}
                    touched={touched}
                    setTouched={setTouched}
                    updateFoodTiming={updateFoodTiming}
                    updateFoodOption={updateFoodOption}
                    updateFoodPricing={updateFoodPricing}
                    tagInput={tagInput}
                    setTagInput={setTagInput}
                    externalLoader={messImageLoader}
                    currentStep={messFormStep}
                    setCurrentStep={setMessFormStep}
                    onSubmit={handleMessSubmit}
                    cnicPicFront={cnicPicFront}
                    setCnicPicFront={setCnicPicFront}
                    cnicPicBack={cnicPicBack}
                    setCnicPicBack={setCnicPicBack}
                    ownerPic={ownerPic}
                    setOwnerPic={setOwnerPic}
                    acceptVerify={acceptVerify}
                    setAcceptVerify={setAcceptVerify}
                    acceptTerms={acceptTerms}
                    setAcceptTerms={setAcceptTerms}
                    acceptCommission={acceptCommission}
                    setAcceptCommission={setAcceptCommission}
                    isSubmitting={isSubmitting}
                    editingProperty={editingProperty}
                  />
                )}

                {/* Owner Details Form - Only show for forms that don't have built-in multi-step (fallback hostel form) */}
                {currentFormType === "hostel" && !["hostel", "house", "office", "apartment"].includes(propertySubType) && (
                  <div className="mt-8 pt-8 border-t border-slate-200">
                    <OwnerDetailsForm
                      formData={formData}
                      handleInputChange={handleFormInputChange}
                      touched={touched}
                      setTouched={setTouched}
                      cnicPicFront={cnicPicFront}
                      setCnicPicFront={setCnicPicFront}
                      cnicPicBack={cnicPicBack}
                      setCnicPicBack={setCnicPicBack}
                      ownerPic={ownerPic}
                      setOwnerPic={setOwnerPic}
                      acceptVerify={acceptVerify}
                      setAcceptVerify={setAcceptVerify}
                      acceptTerms={acceptTerms}
                      setAcceptTerms={setAcceptTerms}
                      acceptCommission={acceptCommission}
                      setAcceptCommission={setAcceptCommission}
                      isSubmitting={isSubmitting}
                      onSubmit={handleSubmit}
                      editingProperty={editingProperty}
                    />
                  </div>
                )}

              </CardContent>
            </Card>
            </div>
          </>
        ) : (
          /* My Properties Tab */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 min-h-[calc(100vh-200px)]">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">My Properties</h1>
            <p className="text-slate-600">Manage your listed properties and track their performance</p>
          </div>
          {/* Properties Grid */}
          {loadingOwnerProperties ? (
            <div className="w-full">
              <div className="min-h-[400px] w-full bg-gradient-to-br from-slate-50 to-emerald-50 rounded-2xl border border-slate-200">
                <AuthLoading
                  title="Loading Properties" 
                  description="Fetching your property data..." 
                  className="min-h-[400px]"
                />
              </div>
            </div>
          ) : ownerPropertiesData.length === 0 ? (

            <div className="flex flex-col items-center justify-center min-h-[200px] bg-white border-2 border-dashed border-slate-200 rounded-xl p-8">
              <span className="text-2xl text-slate-400 mb-2">☹️</span>
              <p className="text-lg text-slate-600 mb-4">You have not listed any properties yet.</p>
              <Button onClick={() => {
                setActiveTab("add-property")
              }} className="bg-emerald-600 hover:bg-emerald-700 cursor-pointer">
                Add Your First Property
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {ownerPropertiesData.map((property) => {
                // Type guard: check if this is an API property (has _id) or a static property (has id only)
                const isApiProperty = typeof (property as any)._id === 'string' || typeof (property as any)._id === 'object'
                // Map fields based on property type, with safe checks
                let name, location, price, rooms, occupancy, rating, monthlyRevenue, image, status, id
                if (isApiProperty) {
                  const apiProp = property as any
                  name = apiProp.title || 'Unnamed Property'
                  location = (() => {
                    // Handle structured address object
                    if (apiProp.address && typeof apiProp.address === 'object') {
                      const area = apiProp.address.area || ''
                      const city = apiProp.address.city || ''
                      if (area && city) return `${area}, ${city}`
                      if (city) return city
                      if (area) return area
                    }
                    // Fallback to individual fields
                    const area = apiProp.area || ''
                    const city = apiProp.city || ''
                    if (area && city) return `${area}, ${city}`
                    if (city) return city
                    if (area) return area
                    return 'Unknown Location'
                  })()

                  price = (apiProp.pricing && typeof apiProp.pricing === 'object' && apiProp.pricing !== null && typeof apiProp.pricing.pricePerBed === 'number')
                    ? apiProp.pricing.pricePerBed
                    : 0
                  rooms = typeof apiProp.totalRooms === 'number' ? apiProp.totalRooms : 0
                  occupancy = typeof apiProp.availableRooms === 'number' && typeof rooms === 'number'
                    ? rooms - apiProp.availableRooms
                    : 0
                  rating = typeof apiProp.rating === 'number' ? apiProp.rating : 0
                  monthlyRevenue = typeof apiProp.monthlyRevenue === 'number'
                    ? apiProp.monthlyRevenue
                    : (typeof occupancy === 'number' && typeof price === 'number' ? occupancy * price : 0)
                  image = (() => {
                    if (Array.isArray(apiProp.images) && apiProp.images.length > 0) {
                      const firstImage = apiProp.images[0]
                      if (typeof firstImage === 'string' && firstImage.trim() !== '') {
                        return firstImage
                      } else if (typeof firstImage === 'object' && firstImage !== null && firstImage.url && typeof firstImage.url === 'string' && firstImage.url.trim() !== '') {
                        return firstImage.url
                      }
                    }
                    return '/placeholder.svg'
                  })()
                  status = apiProp.status || (apiProp.isVerified && apiProp.isActive ? 'approved' : (apiProp.isActive === false ? 'rejected' : 'pending'))
                  id = apiProp._id
                } else {

                  name = property.name
                  location = property.location
                  price = property.price
                  rooms = property.rooms
                  occupancy = property.occupancy
                  rating = property.rating
                  monthlyRevenue = property.monthlyRevenue
                  image = property.image && property.image.trim() !== '' ? property.image : '/placeholder.svg'
                  status = property.status
                  id = property.id
                }
                return (
                  <Card key={id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="relative h-48">
                      {image && image.trim() !== '' ? (
                        <Image
                          src={image}
                          alt={name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-slate-100">
                          <Building className="h-12 w-12 text-slate-400" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <Badge 
                          className={`${
                            status === 'approved' || status === 'active' ? 'bg-green-500' : 
                            status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                          } text-white`}
                        >
                          {status === 'approved' || status === 'active' ? 'Approved' : status === 'pending' ? 'Pending' : 'Rejected'}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg text-slate-800 group-hover:text-emerald-600 transition-colors">
                              {name}
                            </h3>
                            <p className="text-sm text-slate-600 flex items-center mt-1">
                              <MapPin className="w-4 h-4 mr-1" />
                              {location}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-emerald-600">PKR {price?.toLocaleString()}</p>
                            <p className="text-xs text-slate-500">per month</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 py-3 border-t border-slate-100">
                          <div className="text-center">
                            <p className="text-sm font-semibold text-slate-800">{rooms}</p>
                            <p className="text-xs text-slate-500">Rooms</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-semibold text-slate-800">{occupancy}</p>
                            <p className="text-xs text-slate-500">Occupied</p>
                          </div>
                          <div className="text-center flex items-center justify-center">
                            <Star className="w-4 h-4 text-yellow-400 mr-1" />
                            <p className="text-sm font-semibold text-slate-800">{rating}</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingProperty(property)
                                handleTabSwitch("add-property", true) // Skip form clearing when editing
                                populateFormForEdit(property)
                              }}
                              className="text-emerald-600 border-emerald-600 hover:bg-emerald-50 cursor-pointer"
                            >
                              <Settings className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Link href={`/property/${id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-blue-600 border-blue-600 hover:bg-blue-50 cursor-pointer"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </Link>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProperty(id)}
                            disabled={deletingPropertyId === id}
                            className="text-red-600 border-red-600 hover:bg-red-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deletingPropertyId === id ? (
                              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
          </div>
        )}
      </main>

      {/* Image Upload/Delete Loaders */}
      <UploadLoader 
        isLoading={propertyImageLoader.uploadState.isLoading || messImageLoader.uploadState.isLoading}
        success={propertyImageLoader.uploadState.success || messImageLoader.uploadState.success}
        error={propertyImageLoader.uploadState.error || messImageLoader.uploadState.error}
        message={showMessForm ? "Uploading mess images..." : "Uploading property images..."}
      />
      <DeleteLoader 
        isLoading={propertyImageLoader.deleteState.isLoading || messImageLoader.deleteState.isLoading}
        success={propertyImageLoader.deleteState.success || messImageLoader.deleteState.success}
        error={propertyImageLoader.deleteState.error || messImageLoader.deleteState.error}
        message={showMessForm ? "Deleting mess image..." : "Deleting property image..."}
      />
    </div>
  )
}
export default function ListPropertyPage() {
  const { isChatOpen, toggleChat } = useChat()
  
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex flex-col">
        <ListPropertyContent />
        <Footer />
        <UnifiedChat isOpen={isChatOpen} onToggle={toggleChat} />
      </div>
    </ProtectedRoute>
  )
}
 