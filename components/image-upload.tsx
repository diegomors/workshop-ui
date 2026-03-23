'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import imageCompression from 'browser-image-compression'
import { uploadMenuImage } from '@/lib/actions/upload'

export function ImageUpload({ currentUrl, onUpload }: { currentUrl?: string, onUpload: (url: string) => void }) {
  const [loading, setLoading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem deve ter no máximo 5MB')
      return
    }
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error('Formato não suportado. Use JPEG, PNG ou WebP')
      return
    }

    setLoading(true)
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      }
      const compressedFile = await imageCompression(file, options)

      const formData = new FormData()
      formData.append('file', compressedFile)

      const res = await uploadMenuImage(formData)
      if (res?.error) {
        throw new Error(res.error)
      }

      if (res?.data) {
        onUpload(res.data.url)
      }
    } catch (error) {
      console.error(error)
      toast.error('Erro ao enviar imagem. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {currentUrl ? (
        <div className="relative w-32 h-32">
          <img src={currentUrl} alt="Preview" className="w-full h-full object-cover rounded shadow" />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0"
            onClick={() => onUpload('')}
          >
            ×
          </Button>
        </div>
      ) : (
        <div className="w-32 h-32 bg-neutral-10 flex items-center justify-center rounded border border-dashed border-border">
          <span className="text-neutral-50 text-xs text-center px-2">Sem foto</span>
        </div>
      )}
      <div>
        <input type="file" accept="image/jpeg, image/png, image/webp" onChange={handleFileChange} className="hidden" id="image-upload" />
        <label htmlFor="image-upload" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 cursor-pointer">
          {loading ? 'Enviando...' : 'Escolher Foto'}
        </label>
      </div>
    </div>
  )
}
