'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ShieldCheck, Truck, Banknote, CreditCard, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart';
import { formatCurrency } from '@/lib/utils';
import { processCheckout } from '@/actions/checkout';
import { PaymentMethod, ShippingAddress } from '@/types';

export function CheckoutForm() {
  const router = useRouter();
  const { items, getSubtotal, getTotalSavings, clearCart } = useCartStore();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form state
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');

  const subtotal = getSubtotal();
  const savings = getTotalSavings();
  const shippingFee = subtotal >= 75 ? 0 : 5.99;
  const grandTotal = subtotal + shippingFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (items.length === 0) {
      setErrorMessage('Your bag is currently empty.');
      return;
    }

    if (!email || !phone || !fullName || !streetAddress || !city || !state || !postalCode) {
      setErrorMessage('Please fill in all required shipping and contact fields.');
      return;
    }

    setIsLoading(true);

    const shippingAddress: ShippingAddress = {
      fullName,
      phone,
      streetAddress,
      apartment,
      city,
      state,
      postalCode,
      country: 'United States',
    };

    try {
      const result = await processCheckout({
        email,
        phone,
        shippingAddress,
        paymentMethod,
        items,
      });

      if (!result.success || !result.redirectUrl) {
        setErrorMessage(result.error || 'Failed to place order. Please review your details.');
        setIsLoading(false);
        return;
      }

      // Order successfully recorded
      clearCart();
      router.push(result.redirectUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setErrorMessage(msg);
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200 p-8">
        <h2 className="text-xl font-bold text-neutral-900 mb-2">No items to check out</h2>
        <p className="text-sm text-neutral-500 mb-6">
          Your shopping bag is empty. Explore our off-price collections to discover items.
        </p>
        <button
          onClick={() => router.push('/')}
          className="bg-neutral-900 text-white font-semibold text-sm px-6 py-3 rounded-xl hover:bg-neutral-800 transition-colors"
        >
          Return to Storefront
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
      
      {/* Left Column: Guest Details, Shipping & Payment Method */}
      <div className="lg:col-span-7 space-y-8">
        
        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. Contact Info */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/80 shadow-xs space-y-4">
          <h2 className="text-lg font-black text-neutral-950 font-serif flex items-center justify-between">
            <span>1. Contact Information</span>
            <span className="text-xs font-normal text-rose-600 font-sans font-bold">Express Guest Checkout</span>
          </h2>
          <p className="text-xs text-neutral-500">
            We will send tracking updates to your email and our delivery agent will contact your phone.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-neutral-900 bg-neutral-50/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">
                Mobile Phone Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 000-0000"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-neutral-900 bg-neutral-50/50"
              />
            </div>
          </div>
        </div>

        {/* 2. Shipping Address */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/80 shadow-xs space-y-4">
          <h2 className="text-lg font-black text-neutral-950 font-serif">
            2. Delivery Address
          </h2>

          <div className="space-y-4 pt-1">
            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">
                Recipient Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-neutral-900 bg-neutral-50/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">
                Street Address *
              </label>
              <input
                type="text"
                required
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                placeholder="123 Luxury Avenue"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-neutral-900 bg-neutral-50/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">
                Apartment, Suite, Unit (Optional)
              </label>
              <input
                type="text"
                value={apartment}
                onChange={(e) => setApartment(e.target.value)}
                placeholder="Apt 4B"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-neutral-900 bg-neutral-50/50"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="New York"
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-neutral-900 bg-neutral-50/50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">State *</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="NY"
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-neutral-900 bg-neutral-50/50"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="text-xs font-bold text-neutral-700 block mb-1">ZIP / Postal *</label>
                <input
                  type="text"
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="10001"
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-neutral-900 bg-neutral-50/50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Payment Method */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/80 shadow-xs space-y-4">
          <h2 className="text-lg font-black text-neutral-950 font-serif">
            3. Payment Method
          </h2>
          <p className="text-xs text-neutral-500">
            Select how you would like to settle this order.
          </p>

          <div className="space-y-3 pt-2">
            {/* COD Option */}
            <label
              className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                paymentMethod === 'cod'
                  ? 'border-neutral-900 bg-neutral-50/80 shadow-xs ring-1 ring-neutral-900'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={paymentMethod === 'cod'}
                onChange={() => setPaymentMethod('cod')}
                className="mt-1 text-neutral-900 focus:ring-neutral-900"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold text-sm text-neutral-900">
                    Cash on Delivery (COD)
                  </span>
                  <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    Popular
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  Pay directly in cash or via mobile contactless when our courier hands over your package. Zero upfront risk.
                </p>
              </div>
            </label>

            {/* Manual Bank Transfer */}
            <label
              className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                paymentMethod === 'manual_bank'
                  ? 'border-neutral-900 bg-neutral-50/80 shadow-xs ring-1 ring-neutral-900'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="manual_bank"
                checked={paymentMethod === 'manual_bank'}
                onChange={() => setPaymentMethod('manual_bank')}
                className="mt-1 text-neutral-900 focus:ring-neutral-900"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-neutral-700" />
                  <span className="font-bold text-sm text-neutral-900">
                    Direct Wire / Bank Deposit
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  Transfer to our commercial bank account. Package dispatches upon admin verification.
                </p>
              </div>
            </label>

            {/* Stripe / Card (Pluggable skeleton) */}
            <label
              className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                paymentMethod === 'stripe'
                  ? 'border-neutral-900 bg-neutral-50/80 shadow-xs ring-1 ring-neutral-900'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="stripe"
                checked={paymentMethod === 'stripe'}
                onChange={() => setPaymentMethod('stripe')}
                className="mt-1 text-neutral-900 focus:ring-neutral-900"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-neutral-700" />
                  <span className="font-bold text-sm text-neutral-900">
                    Credit / Debit Card (Stripe Gateway)
                  </span>
                  <span className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded font-semibold">
                    Optional Toggle
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  Integrated Stripe adapter (Visa, MC, Amex, Apple Pay). Ready when live keys are added to .env.local.
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Right Column: Order Summary & Review */}
      <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/80 shadow-xs space-y-6 sticky top-24">
        <h2 className="text-lg font-black text-neutral-950 font-serif">
          Order Summary ({items.length} items)
        </h2>

        {/* Items List */}
        <div className="divide-y divide-neutral-100 max-h-64 overflow-y-auto pr-1">
          {items.map((item) => (
            <div key={`${item.productId}-${item.variantId || 'def'}`} className="py-3 flex gap-3 items-center">
              <div className="relative w-14 h-16 bg-neutral-100 rounded-lg overflow-hidden shrink-0 border border-neutral-200">
                <Image src={item.image} alt={item.title} fill className="object-cover object-center" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase text-neutral-400">{item.brand}</p>
                <h4 className="text-xs font-semibold text-neutral-900 truncate">{item.title}</h4>
                <p className="text-[11px] text-neutral-500">Qty: {item.quantity} {item.variantName ? `• ${item.variantName}` : ''}</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-xs text-neutral-950">
                  {formatCurrency(item.price * item.quantity)}
                </span>
                {item.compareAtPrice && item.compareAtPrice > item.price && (
                  <p className="text-[10px] text-neutral-400 line-through">
                    {formatCurrency(item.compareAtPrice * item.quantity)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Savings banner */}
        {savings > 0 && (
          <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl flex items-center gap-2 text-rose-800 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-rose-600 shrink-0" />
            <span>You are saving {formatCurrency(savings)} on this order!</span>
          </div>
        )}

        {/* Cost Breakdown */}
        <div className="space-y-2 border-t border-neutral-100 pt-4 text-xs">
          <div className="flex justify-between text-neutral-600">
            <span>Subtotal</span>
            <span className="font-semibold text-neutral-900">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-neutral-600">
            <span>Shipping</span>
            <span className="font-semibold">{shippingFee === 0 ? 'FREE' : formatCurrency(shippingFee)}</span>
          </div>
          {savings > 0 && (
            <div className="flex justify-between text-rose-600 font-semibold">
              <span>MSRP Discount</span>
              <span>-{formatCurrency(savings)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-black text-neutral-950 pt-3 border-t border-neutral-200">
            <span>Total to Pay</span>
            <span>{formatCurrency(grandTotal)}</span>
          </div>
        </div>

        {/* Place Order Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-neutral-950 hover:bg-neutral-800 disabled:bg-neutral-400 text-white font-bold py-4 px-6 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Reserving Stock & Placing Order...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Complete Order ({formatCurrency(grandTotal)})</span>
            </>
          )}
        </button>

        <p className="text-[11px] text-neutral-400 text-center leading-relaxed">
          By clicking Complete Order, you confirm your delivery details. Stock is automatically reserved for you.
        </p>
      </div>
    </form>
  );
}
