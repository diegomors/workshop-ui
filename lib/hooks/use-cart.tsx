'use client'

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { CartItem, CartModifier } from '@/types/menu'

type CartState = {
  items: CartItem[]
  restaurantId: string | null
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartState }

const initialState: CartState = {
  items: [],
  restaurantId: null,
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      // If adding to a different restaurant, clear first or block. Here we replace context or allow if matches.
      const currentResId = state.restaurantId || action.payload.restaurantId
      if (currentResId !== action.payload.restaurantId) {
        // Option to clear. PRD assumes a single active transaction.
        return {
          restaurantId: action.payload.restaurantId,
          items: [action.payload]
        }
      }
      
      const existingItemIndex = state.items.findIndex((item) => item.id === action.payload.id)
      if (existingItemIndex >= 0) {
        const updatedItems = [...state.items]
        updatedItems[existingItemIndex].quantity += action.payload.quantity
        return { ...state, items: updatedItems }
      }
      
      return {
        restaurantId: currentResId,
        items: [...state.items, action.payload]
      }
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload.id)
      }
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
        )
      }
    case 'CLEAR_CART':
      return initialState
    case 'LOAD_CART':
      return action.payload
    default:
      return state
  }
}

const CartContext = createContext<{
  state: CartState
  dispatch: React.Dispatch<CartAction>
  totalCount: number
  totalPrice: number
} | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('mizz-cart')
    if (saved) {
      try {
        dispatch({ type: 'LOAD_CART', payload: JSON.parse(saved) })
      } catch (e) {
        console.error('Failed to parse cart', e)
      }
    }
  }, [])

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('mizz-cart', JSON.stringify(state))
  }, [state])

  const totalCount = state.items.reduce((acc, item) => acc + item.quantity, 0)
  
  const totalPrice = state.items.reduce((acc, item) => {
    const modifiersTotal = item.modifiers.reduce((mAcc, m) => mAcc + m.additional_price, 0)
    return acc + (item.price + modifiersTotal) * item.quantity
  }, 0)

  return (
    <CartContext.Provider value={{ state, dispatch, totalCount, totalPrice }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

// Utility to generate unique ID for an item configuration
export function generateCartItemId(itemId: string, modifiers: CartModifier[]) {
  const modsString = modifiers.map((m) => m.id).sort().join('-')
  return `${itemId}_${modsString}`
}
