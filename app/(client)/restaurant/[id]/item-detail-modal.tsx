'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { MenuItem, CartModifier } from '@/types/menu'
import { useCart, generateCartItemId } from '@/lib/hooks/use-cart'

export function ItemDetailModal({
  item,
  restaurantId,
  onClose
}: {
  item: MenuItem
  restaurantId: string
  onClose: () => void
}) {
  const { dispatch } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [selectedMods, setSelectedMods] = useState<CartModifier[]>([])

  const handleModToggle = (mod: CartModifier, checked: boolean) => {
    if (checked) {
      setSelectedMods([...selectedMods, mod])
    } else {
      setSelectedMods(selectedMods.filter(m => m.id !== mod.id))
    }
  }

  const modsTotal = selectedMods.reduce((acc, m) => acc + m.additional_price, 0)
  const unitPrice = item.price + modsTotal
  const subtotal = unitPrice * quantity

  const handleAddToCart = () => {
    const cartItemId = generateCartItemId(item.id, selectedMods)
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: cartItemId,
        itemId: item.id,
        name: item.name,
        price: item.price,
        image_url: item.image_url,
        quantity,
        modifiers: selectedMods,
        restaurantId
      }
    })
    onClose()
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">{item.name}</DialogTitle>
        <DialogDescription className="sr-only">Detalhes do item {item.name}</DialogDescription>
        
        {item.image_url && (
            <img src={item.image_url} alt={item.name} className="w-full h-48 object-cover rounded-t-md -mt-6 -mx-6 mb-4" style={{ width: 'calc(100% + 48px)' }} />
        )}
        
        <h2 className="text-2xl font-bold">{item.name}</h2>
        {item.description && <p className="text-muted-foreground mt-2">{item.description}</p>}
        <p className="font-bold text-lg text-primary mt-2">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
        </p>

        {item.modifiers && item.modifiers.length > 0 && (
          <div className="mt-6 border-t pt-4">
            <h3 className="font-semibold mb-3">Extras (Opcional)</h3>
            <div className="space-y-3">
              {item.modifiers.map(mod => (
                <label key={mod.id} className="flex items-center justify-between cursor-pointer bg-neutral-10 p-3 rounded border hover:bg-accent">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 text-primary"
                      checked={selectedMods.some(m => m.id === mod.id)}
                      onChange={(e) => handleModToggle(mod, e.target.checked)}
                    />
                    <span>{mod.name}</span>
                  </div>
                  {mod.additional_price > 0 && (
                    <span className="text-muted-foreground">+ {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(mod.additional_price)}</span>
                  )}
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center border rounded-md">
            <button 
              className="px-4 py-2 hover:bg-accent"
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
            >
              -
            </button>
            <span className="px-4 font-semibold">{quantity}</span>
            <button 
              className="px-4 py-2 hover:bg-accent"
              onClick={() => setQuantity(q => Math.min(99, q + 1))}
            >
              +
            </button>
          </div>

          <Button onClick={handleAddToCart} className="w-full sm:w-auto flex-1 h-12 text-lg">
            Adicionar • {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
