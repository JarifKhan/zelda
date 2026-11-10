'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  freeShippingThreshold: number;
  standardShippingFee: number;
  isFreeShippingEnabled: boolean;
  setIsOpen: (open: boolean) => void;
  setShippingSettings: (settings: {
    freeShippingThreshold?: number;
    standardShippingFee?: number;
    isFreeShippingEnabled?: boolean;
  }) => void;
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTotalSavings: () => number;
  getItemCount: () => number;
  getShippingFee: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      freeShippingThreshold: 75,
      standardShippingFee: 5.99,
      isFreeShippingEnabled: true,

      setIsOpen: (isOpen) => set({ isOpen }),

      setShippingSettings: (settings) =>
        set((state) => ({
          freeShippingThreshold:
            settings.freeShippingThreshold !== undefined
              ? settings.freeShippingThreshold
              : state.freeShippingThreshold,
          standardShippingFee:
            settings.standardShippingFee !== undefined
              ? settings.standardShippingFee
              : state.standardShippingFee,
          isFreeShippingEnabled:
            settings.isFreeShippingEnabled !== undefined
              ? settings.isFreeShippingEnabled
              : state.isFreeShippingEnabled,
        })),

      addItem: (newItem) => {
        const { items } = get();
        const quantityToAdd = newItem.quantity || 1;

        const existingIndex = items.findIndex(
          (i) => i.productId === newItem.productId && i.variantId === newItem.variantId
        );

        if (existingIndex > -1) {
          const updatedItems = [...items];
          const existingItem = updatedItems[existingIndex];
          const updatedQuantity = Math.min(
            existingItem.quantity + quantityToAdd,
            existingItem.maxStock || 99
          );
          updatedItems[existingIndex] = {
            ...existingItem,
            quantity: updatedQuantity,
          };
          set({ items: updatedItems, isOpen: true });
        } else {
          set({
            items: [
              ...items,
              {
                ...newItem,
                quantity: Math.min(quantityToAdd, newItem.maxStock || 99),
              },
            ],
            isOpen: true,
          });
        }
      },

      removeItem: (productId, variantId) => {
        set({
          items: get().items.filter(
            (i) => !(i.productId === productId && i.variantId === variantId)
          ),
        });
      },

      updateQuantity: (productId, quantity, variantId) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId);
          return;
        }

        set({
          items: get().items.map((i) => {
            if (i.productId === productId && i.variantId === variantId) {
              return {
                ...i,
                quantity: Math.min(quantity, i.maxStock || 99),
              };
            }
            return i;
          }),
        });
      },

      clearCart: () => set({ items: [] }),

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getTotalSavings: () => {
        return get().items.reduce((sum, item) => {
          if (item.compareAtPrice && item.compareAtPrice > item.price) {
            return sum + (item.compareAtPrice - item.price) * item.quantity;
          }
          return sum;
        }, 0);
      },

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getShippingFee: () => {
        const { isFreeShippingEnabled, freeShippingThreshold, standardShippingFee } = get();
        if (isFreeShippingEnabled && get().getSubtotal() >= freeShippingThreshold) {
          return 0;
        }
        return standardShippingFee;
      },
    }),
    {
      name: 'offprice_cart_v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);
