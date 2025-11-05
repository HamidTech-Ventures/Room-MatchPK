import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: "student" | "owner" | "admin"
      image?: string
      isNewUser?: boolean
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: "student" | "owner" | "admin"
    avatar?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: "student" | "owner" | "admin"
    isNewUser?: boolean
  }
}