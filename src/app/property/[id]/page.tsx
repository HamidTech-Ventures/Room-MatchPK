"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AuthLoading } from "@/components/auth-loading";
import { useAuth } from "@/contexts/auth-context";
import { useChat } from "@/contexts/chat-context";
import {
  MapPin,
  Star,
  Heart,
  Share,
  User,
  Wifi,
  Car,
  Utensils,
  Wind,
  ShieldCheck,
  CheckCircle,
  ArrowLeft,
  LayoutGrid,
  Trophy,
  DoorOpen,
  Calendar,
  Flag,
  Tv,
  MessageCircle,
  Phone,
  Bed,
  Bath,
  Maximize,
  Info,
  X, // Added X for the Modal Close button
} from "lucide-react";

// --- Map Component ---
function PropertyMap({ address, mapLink }: { address: any; mapLink?: string }) {
  let src = "";
  if (mapLink) {
    if (mapLink.includes("google.com/maps")) {
      if (mapLink.includes("/place/") || mapLink.includes("/@")) {
        const embedUrl = mapLink
          .replace("/maps/", "/maps/embed?pb=")
          .replace("?", "&");
        src = embedUrl;
      } else {
        src = mapLink.includes("output=embed")
          ? mapLink
          : `${mapLink}&output=embed`;
      }
    } else {
      src = mapLink;
    }
  } else if (address) {
    const searchQuery = `${address.street || ""} ${address.area || ""} ${
      address.city || ""
    } Pakistan`.trim();
    const encodedQuery = encodeURIComponent(searchQuery);
    src = `https://maps.google.com/maps?q=${encodedQuery}&output=embed`;
  }

  if (!src) return null;

  return (
    <div
      className="w-full rounded-2xl overflow-hidden border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow relative z-0 h-[200px] md:h-[400px]"
      onClick={() => window.open(src, "_blank")}
      title="Click to open in Google Maps"
    >
      <iframe
        title="Property Location Map"
        src={src}
        width="100%"
        height="100%"
        style={{ border: 0, pointerEvents: "none" }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

export default function PropertyDetailPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAllImages, setShowAllImages] = useState(false);
  const [showAmenities, setShowAmenities] = useState(false); // New State for Amenities Modal
  const [propertyData, setPropertyData] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const { user } = useAuth();
  const { toggleChat } = useChat();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Ref for mobile scroll tracking
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const params = useParams();
  const router = useRouter();
  const propertyId = params?.id;

  // Track scroll position for mobile image counter
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const newIndex = Math.round(scrollLeft / clientWidth);
      setCurrentImageIndex(newIndex);
    }
  };

  // Protected contact function
  const handleProtectedContact = (contactAction: () => void) => {
    if (!user) {
      router.push(
        `/auth/login?returnUrl=${encodeURIComponent(window.location.pathname)}`
      );
      return;
    }
    contactAction();
  };

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/properties/${propertyId}`);
        if (res.ok) {
          const data = await res.json();
          setPropertyData(data.property);
        } else {
          setPropertyData(null);
        }
      } catch (error) {
        console.error("Property fetch error:", error);
        setPropertyData(null);
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/properties/${propertyId}/reviews`);
        if (res.ok) {
          const data = await res.json();
          setReviews(data.reviews || []);
        }
      } catch (error) {
        setReviews([]);
      }
    };

    if (propertyId) {
      fetchProperty();
      fetchReviews();
    }
  }, [propertyId]);

  // Helpers
  const getImageUrl = (image: any) => {
    if (typeof image === "string") return image;
    if (typeof image === "object" && image.url) return image.url;
    return "/placeholder.svg";
  };

  const getImageUrls = () => {
    if (!propertyData?.images) return [];
    return propertyData.images
      .map((img: any) => getImageUrl(img))
      .filter((url: string) => url && url.trim() !== "");
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const openWhatsApp = (phoneNumber: string, customMessage?: string) => {
    if (!phoneNumber) return;
    const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, "");
    let whatsappNumber = cleanPhone;
    if (!cleanPhone.startsWith("92")) {
      if (cleanPhone.startsWith("0")) {
        whatsappNumber = "92" + cleanPhone.substring(1);
      } else {
        whatsappNumber = "92" + cleanPhone;
      }
    }
    const defaultMessage = `Hi! I'm interested in your property "${propertyData?.title}" at ${propertyData?.address?.area}, ${propertyData?.address?.city}. Can you provide more details?`;
    const finalMessage = customMessage || defaultMessage;
    const encodedMessage = encodeURIComponent(finalMessage);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  const submitReview = async () => {
    if (!session?.user || session.user.role !== "student")
      return alert("Only students can submit reviews");
    if (reviewRating === 0 || !reviewComment.trim())
      return alert("Please provide a rating and comment");

    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });
      if (res.ok) {
        alert("Review submitted successfully!");
        setReviewRating(0);
        setReviewComment("");
        setShowReviewForm(false);
        const reviewsRes = await fetch(`/api/properties/${propertyId}/reviews`);
        if (reviewsRes.ok) {
          const rData = await reviewsRes.json();
          setReviews(rData.reviews || []);
        }
      } else {
        alert("Failed to submit review");
      }
    } catch (e) {
      alert("Error submitting review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading)
    return (
      <AuthLoading
        title="Loading Property"
        description="Opening the doors..."
        fullScreen={true}
      />
    );

  if (!propertyData)
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Property Not Found
          </h1>
          <Button asChild className="bg-emerald-600 rounded-xl px-8">
            <Link href="/find-rooms">Back to Search</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );

  const images = getImageUrls();
  const displayRating = propertyData.rating || "New";
  const displayReviewCount =
    reviews.length > 0 ? `${reviews.length} reviews` : "No reviews yet";
  const locationString = propertyData.address
    ? `${propertyData.address.area}, ${propertyData.address.city}`
    : "Pakistan";

  const price =
    propertyData.pricing?.pricePerBed || propertyData.pricing?.price || 0;

  return (
    // Added pb-24 to body to prevent sticky bottom bar from covering content on mobile
    <div className="min-h-screen bg-white text-gray-800 font-sans pb-24 lg:pb-0 relative">
      <Navbar />

      {/* --- MOBILE: Top Image with Floating Details Card --- */}
      <div className="md:hidden relative w-full">
        {/* Main Image Slider */}
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="relative w-full h-[300px] bg-gray-100 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        >
          {images.length > 0 ? (
            images.map((img, idx) => (
              <div key={idx} className="relative w-full h-full flex-shrink-0 snap-center">
                 <Image
                  src={img || "/placeholder.svg"}
                  alt={`View ${idx + 1}`}
                  fill
                  className="object-cover"
                  priority={idx === 0}
                />
              </div>
            ))
          ) : (
            <div className="relative w-full h-full flex-shrink-0 snap-center">
              <Image
                src="/placeholder.svg"
                alt="Main View"
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Mobile Action Buttons (Share/Save) Overlay */}
          <div className="absolute top-4 right-4 flex gap-3 z-10 sticky-action-buttons">
            <button
              onClick={handleShare}
              className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-700 shadow-sm active:scale-95 transition"
            >
              <Share className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsSaved(!isSaved)}
              className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm active:scale-95 transition"
            >
              <Heart
                className={`w-4 h-4 ${
                  isSaved ? "fill-red-500 text-red-500" : "text-gray-700"
                }`}
              />
            </button>
          </div>

          {/* Mobile Image Counter */}
          <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs font-medium px-3 py-1.5 rounded-full z-10 flex items-center gap-1 sticky-counter">
            <Image
              src="/placeholder.svg"
              alt="gallery"
              width={12}
              height={12}
              className="w-3 h-3 invert"
            />
            {images.length > 0 ? currentImageIndex + 1 : 0} / {images.length}
          </div>
        </div>

        {/* Floating Details Card */}
        <div className="relative mx-4 -mt-16 z-10 p-5 bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-1">
                {propertyData.propertyType || "Apartment"}
              </div>
              <h1 className="text-xl font-bold text-gray-900 capitalize leading-tight mb-2">
                {propertyData.title}
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span className="truncate">{locationString}</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-blue-600">
                  Rs{" "}
                  {price >= 1000 ? `${(price / 1000).toFixed(0)}k` : price}
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  / month
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-bold text-gray-900">{displayRating}</span>
              <span className="text-gray-400">
                ({reviews.length} reviews)
              </span>
            </div>
            {/* REMOVED: Bed/Bath/Sqft stats section from here */}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* --- DESKTOP: Header Section --- */}
        <div className="hidden md:flex flex-col md:flex-row md:justify-between md:items-end mb-6 gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-gray-900 capitalize">
              {propertyData.title}
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-600 font-medium flex-wrap">
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-gray-900 text-gray-900" />
                {displayRating}
              </span>
              <span>•</span>
              <span className="underline decoration-gray-400 underline-offset-2 cursor-pointer">
                {displayReviewCount}
              </span>
              <span>•</span>
              <span className="underline decoration-gray-400 underline-offset-2 capitalize">
                {locationString}
              </span>
              {/* REMOVED: Bed/Bath/Sqft stats section from here */}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition border border-gray-200"
            >
              <Share className="w-4 h-4" />
              {shareCopied ? "Copied!" : "Share"}
            </button>
            <button
              onClick={() => setIsSaved(!isSaved)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition border border-gray-200 ${
                isSaved
                  ? "text-red-500 bg-red-50 border-red-200"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Heart className={`w-4 h-4 ${isSaved ? "fill-red-500" : ""}`} />
              {isSaved ? "Saved" : "Save"}
            </button>
          </div>
        </div>

        {/* --- DESKTOP: Masonry Grid --- */}
        <div className="hidden md:grid grid-cols-4 gap-2 h-[500px] mb-12 rounded-3xl overflow-hidden relative shadow-sm">
          {/* Main Large Image (Left) */}
          <div
            className="col-span-2 h-full relative group cursor-pointer"
            onClick={() => setShowAllImages(true)}
          >
            <Image
              src={images[0] || "/placeholder.svg"}
              alt="Main View"
              fill
              className="object-cover group-hover:brightness-95 transition duration-500"
            />
          </div>

          {/* Middle Column */}
          <div className="flex flex-col gap-2 col-span-1">
            <div
              className="h-1/2 relative group cursor-pointer"
              onClick={() => setShowAllImages(true)}
            >
              <Image
                src={images[1] || "/placeholder.svg"}
                alt="Detail 1"
                fill
                className="object-cover group-hover:brightness-95 transition duration-500"
              />
            </div>
            <div
              className="h-1/2 relative group cursor-pointer"
              onClick={() => setShowAllImages(true)}
            >
              <Image
                src={images[2] || "/placeholder.svg"}
                alt="Detail 2"
                fill
                className="object-cover group-hover:brightness-95 transition duration-500"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-2 col-span-1 relative">
            <div
              className="h-1/2 relative group cursor-pointer"
              onClick={() => setShowAllImages(true)}
            >
              <Image
                src={images[3] || "/placeholder.svg"}
                alt="Detail 3"
                fill
                className="object-cover group-hover:brightness-95 transition duration-500"
              />
            </div>
            <div
              className="h-1/2 relative group cursor-pointer"
              onClick={() => setShowAllImages(true)}
            >
              <Image
                src={images[4] || "/placeholder.svg"}
                alt="Detail 4"
                fill
                className="object-cover group-hover:brightness-95 transition duration-500"
              />
              <div className="absolute bottom-4 right-4 z-10">
                <button className="bg-white/90 backdrop-blur-sm text-gray-900 text-sm font-medium px-4 py-2 rounded-lg border border-gray-200 shadow-sm flex items-center gap-2 hover:scale-105 transition">
                  <LayoutGrid className="w-4 h-4" /> Show all photos
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 relative mt-6 md:mt-0">
          {/* LEFT COLUMN: Details */}
          <div className="lg:col-span-2 space-y-8 md:space-y-10">
            
            {/* Shared Icon Bar (Visible on both Mobile and Desktop) */}
            {/* Dynamic Amenities Section - Shows ONLY what Admin added */}
            {propertyData.amenities && propertyData.amenities.length > 0 && (
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-6">
                  What this place offers
                </h3>

                <div className="grid grid-cols-5 gap-y-6 gap-x-2 md:gap-x-4">
                  {propertyData.amenities.map((amenityName: string, index: number) => {
                    
                    // --- Icon Selection Logic based on Keyword ---
                    const lowerName = amenityName.toLowerCase();
                    let SelectedIcon = CheckCircle; // Default Icon

                    if (lowerName.includes("wifi") || lowerName.includes("internet") || lowerName.includes("net")) SelectedIcon = Wifi;
                    else if (lowerName.includes("ac") || lowerName.includes("air") || lowerName.includes("cool")) SelectedIcon = Wind;
                    else if (lowerName.includes("parking") || lowerName.includes("car") || lowerName.includes("garage")) SelectedIcon = Car;
                    else if (lowerName.includes("security") || lowerName.includes("guard") || lowerName.includes("cctv") || lowerName.includes("camera")) SelectedIcon = ShieldCheck;
                    else if (lowerName.includes("food") || lowerName.includes("kitchen") || lowerName.includes("meal") || lowerName.includes("mess")) SelectedIcon = Utensils;
                    else if (lowerName.includes("tv") || lowerName.includes("cable") || lowerName.includes("netflix")) SelectedIcon = Tv;
                    else if (lowerName.includes("bath") || lowerName.includes("washroom") || lowerName.includes("geyser")) SelectedIcon = Bath;
                    else if (lowerName.includes("bed") || lowerName.includes("room")) SelectedIcon = Bed;
                    else if (lowerName.includes("clean") || lowerName.includes("laundry") || lowerName.includes("iron")) SelectedIcon = CheckCircle;
                    else if (lowerName.includes("open") || lowerName.includes("terrace") || lowerName.includes("view")) SelectedIcon = Maximize;

                    return (
                      <div
                        key={index}
                        className="flex flex-col items-center gap-2 group cursor-default"
                      >
                        <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-blue-50 flex items-center justify-center transition-colors duration-300">
                          <SelectedIcon className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <span className="text-[10px] md:text-xs text-gray-600 font-medium text-center leading-tight group-hover:text-blue-600 transition-colors capitalize">
                          {amenityName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Mobile Only Price Breakdown */}
            <div className="lg:hidden p-5 bg-blue-50 rounded-2xl border border-blue-100 space-y-3">
                 <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-600"/> Price Details
                 </h3>
                 <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                        <span>Monthly Rent</span>
                        <span>Rs {price.toLocaleString()}</span>
                    </div>
                    {propertyData.pricing?.securityDeposit && (
                    <div className="flex justify-between">
                        <span>Security Deposit</span>
                        <span>Rs {propertyData.pricing.securityDeposit.toLocaleString()}</span>
                    </div>
                    )}
                    <div className="border-t border-blue-200 pt-2 flex justify-between font-bold text-gray-900">
                        <span>Total to Start</span>
                         <span>
                          Rs{" "}
                          {(
                            price +
                            (propertyData.pricing?.securityDeposit || 0)
                          ).toLocaleString()}
                        </span>
                    </div>
                 </div>
                 <div className="pt-2 flex justify-start gap-2 text-gray-400 text-xs items-center cursor-pointer">
                    <Flag className="w-3 h-3" />
                    <span>Report this listing</span>
                 </div>
            </div>

            {/* Description */}
            <div className="border-b border-gray-200 pb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Description
              </h2>
              <div className="prose text-gray-600 leading-relaxed max-w-none text-sm md:text-base">
                <p>
                  {propertyData.description || "No description provided."}
                </p>
                
              </div>
            </div>

            {/* Map Section */}
            <div className="border-b border-gray-200 pb-8 relative">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                  Location
                </h2>
                <button className="text-orange-500 font-semibold text-sm">
                  Open in Maps
                </button>
              </div>
              <PropertyMap
                address={propertyData.address}
                mapLink={propertyData.mapLink}
              />
              <p className="text-gray-500 mt-4 text-sm md:text-base">
                Distance: 2.5km from University Campus
              </p>
            </div>

            {/* Host Section */}
            <div className="p-5 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Meet the Owner
                </h2>
                <span className="bg-green-100 text-green-600 text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                  Responsive
                </span>
              </div>
              <div className="flex items-center gap-4 mb-6">
                {propertyData.owner?.avatar ? (
                  <Image
                    src={propertyData.owner.avatar}
                    alt="Host"
                    width={64}
                    height={64}
                    className="rounded-full object-cover w-14 h-14 md:w-16 md:h-16 border-2 border-green-500 p-0.5"
                  />
                ) : (
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-200 rounded-full flex items-center justify-center border-2 border-green-500 p-0.5">
                    <User className="w-6 h-6 md:w-8 md:h-8 text-gray-500" />
                  </div>
                )}
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                    {propertyData.owner?.name || "Member"}
                    <span className="flex items-center text-sm text-gray-600 font-normal">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />{" "}
                      4.9
                    </span>
                  </h2>
                  <p className="text-gray-500 text-xs md:text-sm">
                    Joined {new Date(propertyData.createdAt).getFullYear()} • 15
                    Listings
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <Button
                  onClick={() => toggleChat()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl h-12 shadow-md flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" /> Message
                </Button>
                <Button
                  onClick={() =>
                    handleProtectedContact(() =>
                      openWhatsApp(propertyData.contactInfo?.phone)
                    )
                  }
                  variant="outline"
                  className="flex-1 border-gray-200 text-gray-700 font-bold rounded-xl h-12 shadow-sm flex items-center justify-center gap-2 hover:bg-gray-50"
                >
                  <Phone className="w-5 h-5" /> contact Owner
                </Button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Desktop Sticky Booking Card (Hidden on Mobile) */}
          <div className="hidden lg:block lg:col-span-1 relative">
            <div className="sticky top-28">
              <div className="bg-white rounded-2xl shadow-[0_6px_24px_rgba(0,0,0,0.12)] border border-gray-200 p-6 ring-1 ring-black/5">
                {/* Header */}
                <div className="flex justify-between items-end mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-900">
                      Rs {price.toLocaleString()}
                    </span>
                    <span className="text-base text-gray-500"> / month</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                    <Star className="w-3.5 h-3.5 fill-gray-900 text-gray-900" />
                    {displayRating}
                    <span className="text-gray-400 font-normal underline ml-1">
                      {reviews.length} reviews
                    </span>
                  </div>
                </div>

                {/* Main Action Button */}
                <Button
                  onClick={() =>
                    handleProtectedContact(() =>
                      openWhatsApp(
                        propertyData.contactInfo?.phone,
                        `Hi! I am interested in your property "${propertyData?.title}". Please call me back.`
                      )
                    )
                  }
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 mb-4 active:scale-[0.98]"
                >
                  Request a CallBack
                </Button>

                <div className="text-center mb-6">
                  <span className="text-sm text-gray-500">
                    You won't be charged yet
                  </span>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 text-gray-600 text-sm">
                  <div className="flex justify-between">
                    <span className="underline decoration-gray-300 cursor-help">
                      Monthly Rent
                    </span>
                    <span>Rs {price.toLocaleString()}</span>
                  </div>
                  {propertyData.pricing?.securityDeposit && (
                    <div className="flex justify-between">
                      <span className="underline decoration-gray-300 cursor-help">
                        Security Deposit
                      </span>
                      <span>
                        Rs{" "}
                        {propertyData.pricing.securityDeposit.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-gray-900 text-base">
                    <span>Total</span>
                    <span>
                      Rs{" "}
                      {(
                        price +
                        (propertyData.pricing?.securityDeposit || 0)
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Report Flag */}
                <div className="mt-6 flex justify-center gap-2 text-gray-500 text-sm items-center cursor-pointer hover:underline">
                  <Flag className="w-4 h-4" />
                  <span>Report this listing</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Reviews Section */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                Ratings & Reviews
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900">
                  {displayRating}
                </span>
                <div className="flex flex-col">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, starIdx) => (
                      <Star
                        key={starIdx}
                        className={`w-3 h-3 ${
                          starIdx < Math.round(Number(displayRating))
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    {reviews.length} Reviews
                  </span>
                </div>
              </div>
            </div>
            <button className="text-orange-500 font-semibold text-sm">
              See All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {reviews.length > 0 ? (
              reviews.map((review: any, i: number) => (
                <div
                  key={i}
                  className="space-y-4 p-4 bg-gray-50 rounded-2xl border border-gray-100"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                        {review.studentName
                          ? review.studentName.charAt(0).toUpperCase()
                          : "S"}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm md:text-base">
                          {review.studentName || "Student"}
                        </h4>
                        <p className="text-xs md:text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, starIdx) => (
                        <Star
                          key={starIdx}
                          className={`w-3 h-3 ${
                            starIdx < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-sm md:text-base line-clamp-3">
                    {review.comment}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">
                No reviews yet. Be the first to leave one!
              </p>
            )}
          </div>

          {session?.user?.role === "student" && (
            <div className="mt-10 mb-8">
              <Button
                variant="outline"
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="border-gray-900 text-gray-900"
              >
                Write a review
              </Button>

              {showReviewForm && (
                <div className="mt-6 max-w-lg p-6 bg-gray-50 rounded-xl border border-gray-200">
                  <h4 className="font-bold mb-4">Share your experience</h4>
                  <div className="flex gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-6 h-6 cursor-pointer ${
                          star <= reviewRating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                        onClick={() => setReviewRating(star)}
                      />
                    ))}
                  </div>
                  <Textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Tell us about your stay..."
                    className="bg-white mb-4"
                  />
                  <Button
                    onClick={submitReview}
                    disabled={submittingReview}
                    className="bg-gray-900 text-white hover:bg-black"
                  >
                    {submittingReview ? "Submitting..." : "Post Review"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Related Properties Placeholder */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
            Related Properties
          </h2>
          <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="min-w-[250px] md:min-w-[300px] bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
              >
                <div className="relative h-40 bg-gray-200">
                  <Image
                    src="/placeholder.svg"
                    alt="related"
                    fill
                    className="object-cover"
                  />
                  <span className="absolute top-2 left-2 bg-gray-900/70 text-white text-xs font-bold px-2 py-1 rounded-md">
                    Apartment
                  </span>
                  <button className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm">
                    <Heart className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 truncate">
                      Clifton View Appt
                    </h3>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />{" "}
                      4.5
                    </div>
                  </div>
                  <p className="text-gray-500 text-xs mb-3 truncate">
                    Block 4, Clifton, Karachi
                  </p>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-lg font-bold text-blue-600">
                        Rs 38k
                      </span>
                      <span className="text-xs text-gray-500">/mo</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Bed className="w-3 h-3" /> 2
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="w-3 h-3" /> 1
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* --- MOBILE: Sticky Bottom Bar --- */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-5 py-4 z-50 lg:hidden flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-safe">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 font-medium mb-0.5">
            Total Price
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-blue-600">
              Rs {price.toLocaleString()}
            </span>
          </div>
        </div>
        <Button
          onClick={() =>
            handleProtectedContact(() =>
              openWhatsApp(
                propertyData.contactInfo?.phone,
                `Hi! I am interested in your property "${propertyData?.title}".`
              )
            )
          }
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-8 h-12 shadow-lg shadow-blue-500/20 active:scale-95 transition-transform w-1/2"
        >
          Request a CallBack <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
        </Button>
      </div>

      <Footer />

      {/* Image Modal (Desktop) */}
      {showAllImages && (
        <div className="fixed inset-0 bg-black z-[100] overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <button
              onClick={() => setShowAllImages(false)}
              className="fixed top-8 left-8 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition z-50"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
              {images.map((url, i) => (
                <div
                  key={i}
                  className={`relative ${
                    i % 3 === 0
                      ? "md:col-span-2 aspect-[2/1]"
                      : "aspect-square"
                  }`}
                >
                  <Image
                    src={url}
                    alt={`Gallery ${i}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Amenities Modal */}
      {showAmenities && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">What this place offers</h3>
              <button
                onClick={() => setShowAmenities(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {/* If propertyData.amenities is available, map it. Otherwise show default list */}
              {(propertyData.amenities || [
                 "High-Speed Wifi", "Air Conditioning", "Free Parking",
                 "24/7 Security", "Power Backup / Generator", "Daily Housekeeping",
                 "Attached Bathroom", "Geyser / Warm Water", "Laundry Service"
              ]).map((item: string, idx: number) => (
                <div key={idx} className="flex items-center gap-3 p-3 border-b border-gray-100 last:border-0">
                   <CheckCircle className="w-5 h-5 text-emerald-500" />
                   <span className="text-gray-700 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}