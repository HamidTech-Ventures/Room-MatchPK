export interface LocationData {
  countries: {
    [key: string]: {
      name: string
      provinces: {
        [key: string]: {
          name: string
          cities: string[]
        }
      }
    }
  }
}

export const locationData: LocationData = {
  countries: {
    pakistan: {
      name: "Pakistan",
      provinces: {
        punjab: {
          name: "Punjab",
          cities: [
            "Lahore",
            "Faisalabad", 
            "Rawalpindi",
            "Multan",
            "Gujranwala",
            "Sialkot",
            "Bahawalpur",
            "Sargodha",
            "Sheikhupura",
            "Jhang",
            "Gujrat",
            "Kasur",
            "Rahim Yar Khan",
            "Sahiwal",
            "Okara",
            "Wah Cantonment",
            "Dera Ghazi Khan",
            "Mirpur Mathelo",
            "Kamoke",
            "Sadiqabad",
            "Burewala",
            "Kohat",
            "Jacobabad",
            "Muzaffargarh",
            "Khanpur"
          ]
        },
        sindh: {
          name: "Sindh",
          cities: [
            "Karachi",
            "Hyderabad",
            "Sukkur",
            "Larkana",
            "Nawabshah",
            "Mirpurkhas",
            "Jacobabad",
            "Shikarpur",
            "Khairpur",
            "Dadu",
            "Ghotki",
            "Sanghar",
            "Badin",
            "Tando Allahyar",
            "Tando Muhammad Khan",
            "Thatta",
            "Matiari",
            "Umerkot",
            "Tharparkar",
            "Jamshoro"
          ]
        },
        kpk: {
          name: "Khyber Pakhtunkhwa",
          cities: [
            "Peshawar",
            "Mardan",
            "Mingora",
            "Kohat",
            "Dera Ismail Khan",
            "Bannu",
            "Swabi",
            "Charsadda",
            "Nowshera",
            "Mansehra",
            "Abbottabad",
            "Karak",
            "Hangu",
            "Haripur",
            "Lakki Marwat",
            "Tank",
            "Wazirabad",
            "Chitral",
            "Parachinar",
            "Kurram"
          ]
        },
        balochistan: {
          name: "Balochistan",
          cities: [
            "Quetta",
            "Gwadar",
            "Turbat",
            "Khuzdar",
            "Hub",
            "Chaman",
            "Zhob",
            "Sibi",
            "Loralai",
            "Mastung",
            "Kalat",
            "Pishin",
            "Killa Abdullah",
            "Nasirabad",
            "Jaffarabad",
            "Dera Bugti",
            "Kohlu",
            "Barkhan",
            "Musakhel",
            "Sherani"
          ]
        },
        gilgit_baltistan: {
          name: "Gilgit-Baltistan",
          cities: [
            "Gilgit",
            "Skardu",
            "Hunza",
            "Ghanche",
            "Shigar",
            "Nagar",
            "Gahkuch",
            "Khaplu",
            "Astore",
            "Diamer"
          ]
        },
        azad_kashmir: {
          name: "Azad Jammu & Kashmir",
          cities: [
            "Muzaffarabad",
            "Mirpur",
            "Rawalakot",
            "Palandri",
            "Kotli",
            "Bhimber",
            "Bagh",
            "Neelum",
            "Haveli",
            "Poonch"
          ]
        },
        islamabad: {
          name: "Islamabad Capital Territory",
          cities: [
            "Islamabad"
          ]
        }
      }
    },
    india: {
      name: "India",
      provinces: {
        punjab: {
          name: "Punjab",
          cities: [
            "Chandigarh",
            "Ludhiana",
            "Amritsar",
            "Jalandhar",
            "Patiala",
            "Bathinda",
            "Mohali",
            "Hoshiarpur",
            "Batala",
            "Pathankot",
            "Moga",
            "Abohar",
            "Malerkotla",
            "Khanna",
            "Phagwara"
          ]
        },
        maharashtra: {
          name: "Maharashtra", 
          cities: [
            "Mumbai",
            "Pune",
            "Nagpur",
            "Thane",
            "Nashik",
            "Aurangabad",
            "Solapur",
            "Bhiwandi",
            "Amravati",
            "Nanded",
            "Kolhapur",
            "Ulhasnagar",
            "Sangli",
            "Malegaon",
            "Jalgaon"
          ]
        },
        delhi: {
          name: "Delhi",
          cities: [
            "New Delhi",
            "Delhi"
          ]
        },
        uttar_pradesh: {
          name: "Uttar Pradesh",
          cities: [
            "Lucknow",
            "Kanpur",
            "Ghaziabad",
            "Agra",
            "Varanasi",
            "Meerut",
            "Allahabad",
            "Bareilly",
            "Aligarh",
            "Moradabad",
            "Saharanpur",
            "Gorakhpur",
            "Noida",
            "Firozabad",
            "Jhansi"
          ]
        }
      }
    },
    bangladesh: {
      name: "Bangladesh",
      provinces: {
        dhaka: {
          name: "Dhaka Division",
          cities: [
            "Dhaka",
            "Gazipur",
            "Narayanganj",
            "Tangail",
            "Manikganj",
            "Munshiganj",
            "Narsingdi",
            "Faridpur",
            "Rajbari",
            "Madaripur",
            "Shariatpur",
            "Gopalganj",
            "Kishoreganj"
          ]
        },
        chittagong: {
          name: "Chittagong Division",
          cities: [
            "Chittagong",
            "Cox's Bazar",
            "Comilla",
            "Feni",
            "Brahmanbaria",
            "Rangamati",
            "Noakhali",
            "Chandpur",
            "Lakshmipur",
            "Khagrachhari",
            "Bandarban"
          ]
        },
        rajshahi: {
          name: "Rajshahi Division", 
          cities: [
            "Rajshahi",
            "Rangpur",
            "Bogra",
            "Pabna",
            "Sirajganj",
            "Ishwardi",
            "Kushtia",
            "Chuadanga",
            "Meherpur",
            "Jhenaidah",
            "Magura",
            "Narail"
          ]
        },
        khulna: {
          name: "Khulna Division",
          cities: [
            "Khulna",
            "Jessore",
            "Benapole",
            "Satkhira",
            "Bagerhat",
            "Jhalokati",
            "Pirojpur",
            "Barguna",
            "Patuakhali",
            "Bhola"
          ]
        }
      }
    }
  }
}

export const getCountries = () => {
  return Object.entries(locationData.countries).map(([key, country]) => ({
    value: key,
    label: country.name
  }))
}

export const getProvinces = (countryKey: string) => {
  const country = locationData.countries[countryKey]
  if (!country) return []
  
  return Object.entries(country.provinces).map(([key, province]) => ({
    value: key,
    label: province.name
  }))
}

export const getCities = (countryKey: string, provinceKey: string) => {
  const country = locationData.countries[countryKey]
  if (!country) return []
  
  const province = country.provinces[provinceKey]
  if (!province) return []
  
  return province.cities.map(city => ({
    value: city.toLowerCase().replace(/\s+/g, '_'),
    label: city
  }))
}