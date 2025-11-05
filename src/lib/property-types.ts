import {
  Home,
  Building,
  Building2,
  Utensils,
  Briefcase,
  Users,
  House,
  Grid3X3,
  MapPin
} from "lucide-react"

export interface PropertyTypeConfig {
  id: string
  label: string
  icon: any
  description: string
  color: string
  bgColor: string
  hoverColor: string
}

export const PROPERTY_TYPES: PropertyTypeConfig[] = [
  {
    id: "all",
    label: "All Properties",
    icon: Grid3X3,
    description: "View all available properties",
    color: "text-slate-700",
    bgColor: "bg-gradient-to-r from-slate-100 to-slate-200",
    hoverColor: "hover:bg-slate-200"
  },
  {
    id: "hostel",
    label: "Hostel",
    icon: "/Hostel.png",
    description: "Student hostels and dormitories",
    color: "text-emerald-700",
    bgColor: "bg-gradient-to-r from-emerald-100 to-emerald-200",
    hoverColor: "hover:bg-emerald-200"
  },
  {
    id: "apartment",
    label: "Apartment",
    icon: "/apartment.png",
    description: "Furnished apartments for students",
    color: "text-blue-700",
    bgColor: "bg-gradient-to-r from-blue-100 to-blue-200",
    hoverColor: "hover:bg-blue-200"
  },
  {
    id: "house",
    label: "House",
    icon: "/house.png",
    description: "Independent houses and villas",
    color: "text-purple-700",
    bgColor: "bg-gradient-to-r from-purple-100 to-purple-200",
    hoverColor: "hover:bg-purple-200"
  },
  {
    id: "office",
    label: "Office",
    icon: "/office.jpg",
    description: "Office spaces and co-working areas",
    color: "text-orange-700",
    bgColor: "bg-gradient-to-r from-orange-100 to-orange-200",
    hoverColor: "hover:bg-orange-200"
  },
  {
    id: "hostel-mess",
    label: "Mess",
    icon: "/mess.png",
    description: "Hostel with mess facilities",
    color: "text-red-700",
    bgColor: "bg-gradient-to-r from-red-100 to-red-200",
    hoverColor: "hover:bg-red-200"
  },

]

// Helper function to get property type config by id
export const getPropertyTypeConfig = (id: string): PropertyTypeConfig | undefined => {
  return PROPERTY_TYPES.find(type => type.id === id)
}

// Helper function to get all property types except "all"
export const getFilterablePropertyTypes = (): PropertyTypeConfig[] => {
  return PROPERTY_TYPES.filter(type => type.id !== "all")
}

// Helper function to get property type label
export const getPropertyTypeLabel = (id: string): string => {
  const config = getPropertyTypeConfig(id)
  return config?.label || id
}
