'use server'

import { createClient } from '@/lib/supabase/server'
import { v4 as uuidv4 } from 'uuid'

export async function uploadMenuImage(formData: FormData) {
  const file = formData.get('file') as File
  if (!file) return { error: 'Nenhuma imagem foi recebida' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Não autorizado' }

  const ext = file.name.split('.').pop()
  const fileName = `${uuidv4()}.${ext}`

  const { data, error } = await supabase
    .storage
    .from('menu-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    return { error: error.message }
  }

  const { data: publicUrlData } = supabase
    .storage
    .from('menu-images')
    .getPublicUrl(data.path)

  return {
    data: {
      url: publicUrlData.publicUrl
    }
  }
}
