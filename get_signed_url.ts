
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function getSignedUrl() {
  const { data, error } = await supabase
    .storage
    .from('backups-private')
    .createSignedUrl('backup_completo.zip', 60 * 60 * 24) // 24 hours

  if (error) {
    console.error('Error generating signed URL:', error)
    process.exit(1)
  }

  console.log('SIGNED_URL:', data.signedUrl)
}

getSignedUrl()
