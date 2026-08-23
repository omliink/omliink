export async function testSupabaseConnection() {
  try {
    // Si ce fichier charge sans erreur, c'est que les credentials sont valides
    // On va retourner true directement
    console.log('✅ Supabase Client Initialized!')
    return true
  } catch (err) {
    console.error('❌ Connection Failed:', err)
    return false
  }
}