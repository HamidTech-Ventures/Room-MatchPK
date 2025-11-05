import { redirect } from 'next/navigation'

export default function Page() {
  // Redirect root to the find-rooms page so users land directly on the search experience.
  redirect('/find-rooms')
}
