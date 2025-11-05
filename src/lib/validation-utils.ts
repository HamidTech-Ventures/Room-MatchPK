import { getDatabase } from '@/lib/mongodb'

// Disable validation by default on any admin operation
export async function ensureValidationDisabled() {
  try {
    const db = await getDatabase()
    
    await db.command({
      collMod: 'properties',
      validator: {},
      validationLevel: 'off'
    })
    
    console.log('Collection validation ensured disabled')
    return true
  } catch (error: any) {
    // If collection doesn't exist yet or no validator, that's fine
    if (error.message.includes('no validator') || error.message.includes('not found')) {
      console.log('No validation rules to disable')
      return true
    }
    console.error('Error ensuring validation disabled:', error)
    return false
  }
}
