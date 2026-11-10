'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ShieldCheck, Truck, Banknote, CreditCard, Sparkles, AlertCircle, Loader2, ChevronDown } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart';
import { formatCurrency } from '@/lib/utils';
import { processCheckout } from '@/actions/checkout';
import { PaymentMethod, ShippingAddress } from '@/types';
import { US_STATES, US_TERRITORIES, isValidUSState } from '@/lib/constants/us-states';

/**
 * 1. Validation Logic: Strict US ZIP Code regular expression check
 * Validates standard 5-digit (12345) or 9-digit ZIP+4 (12345-6789).
 */
export const validateZipCode = (postalCode: string): boolean => {
  return /^\d{5}(-\d{4})?$/.test((postalCode || '').trim());
};

export function CheckoutForm() {
  const router = useRouter();
  const {
    items,
    getSubtotal,
    getTotalSavings,
    clearCart,
    freeShippingThreshold,
    standardShippingFee,
    isFreeShippingEnabled,
  } = useCartStore();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form field state
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');

  // 2. Specific error state for ZIP code
  const [zipError, setZipError] = useState<string | null>(null);

  // Validation tracking
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const subtotal = getSubtotal();
  const savings = getTotalSavings();
  const isFreeShipping = isFreeShippingEnabled && subtotal >= freeShippingThreshold;
  const shippingFee = isFreeShipping ? 0 : standardShippingFee;
  const grandTotal = subtotal + shippingFee;

  const validateField = (field: string, rawVal?: string): string | null => {
    const val = rawVal !== undefined ? rawVal : getFieldValue(field);
    const trimmed = (val || '').trim();

    switch (field) {
      case 'email':
        if (!trimmed) return 'Email address is required.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) {
          return 'Please enter a valid email address (e.g. name@example.com).';
        }
        return null;

      case 'phone': {
        const digits = (val || '').replace(/\D/g, '');
        if (!digits) return 'Mobile phone number is required for delivery.';
        if (digits.length < 10) return 'Please enter a valid phone number (at least 10 digits).';
        if (digits.length > 15) return 'Phone number cannot exceed 15 digits.';
        return null;
      }

      case 'fullName':
        if (!trimmed) return 'Recipient full name is required.';
        if (trimmed.length < 2) return 'Full name must be at least 2 characters.';
        return null;

      case 'streetAddress':
        if (!trimmed) return 'Street address is required.';
        if (trimmed.length < 5) return 'Please enter a complete street address (at least 5 characters).';
        return null;

      case 'city':
        if (!trimmed) return 'City is required.';
        if (trimmed.length < 2) return 'Please enter a valid city name.';
        return null;

      case 'state':
        if (!trimmed) return 'Please select a US state from the dropdown.';
        if (!isValidUSState(trimmed)) return 'Please select a valid US state.';
        return null;

      case 'postalCode':
        if (!trimmed || !validateZipCode(trimmed)) {
          return 'Please enter a valid 5 or 9-digit US ZIP code';
        }
        return null;

      default:
        return null;
    }
  };

  const getFieldValue = (field: string): string => {
    switch (field) {
      case 'email': return email;
      case 'phone': return phone;
      case 'fullName': return fullName;
      case 'streetAddress': return streetAddress;
      case 'city': return city;
      case 'state': return state;
      case 'postalCode': return postalCode;
      default: return '';
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field);
    setErrors((prev) => {
      const next = { ...prev };
      if (err) next[field] = err;
      else delete next[field];
      return next;
    });

    if (field === 'postalCode') {
      if (!validateZipCode(postalCode)) {
        setZipError('Please enter a valid 5 or 9-digit US ZIP code');
      } else {
        setZipError(null);
      }
    }
  };

  const handleChange = (field: string, value: string) => {
    // Update raw state
    switch (field) {
      case 'email': setEmail(value); break;
      case 'phone': setPhone(value); break;
      case 'fullName': setFullName(value); break;
      case 'streetAddress': setStreetAddress(value); break;
      case 'city': setCity(value); break;
      case 'state': setState(value); break;
      case 'postalCode':
        setPostalCode(value);
        if (zipError || touched.postalCode) {
          if (!validateZipCode(value)) {
            setZipError('Please enter a valid 5 or 9-digit US ZIP code');
          } else {
            setZipError(null);
          }
        }
        break;
    }

    // Re-validate dynamically if field has been touched
    if (touched[field]) {
      const err = validateField(field, value);
      setErrors((prev) => {
        const next = { ...prev };
        if (err) next[field] = err;
        else delete next[field];
        return next;
      });
    }
  };

  const validateAll = (): { isValid: boolean; newErrors: Record<string, string>; firstKey: string | null } => {
    const requiredFields = ['email', 'phone', 'fullName', 'streetAddress', 'city', 'state', 'postalCode'];
    const newErrors: Record<string, string> = {};
    let firstKey: string | null = null;

    for (const f of requiredFields) {
      const err = validateField(f);
      if (err) {
        newErrors[f] = err;
        if (!firstKey) firstKey = f;
      }
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      newErrors,
      firstKey,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (items.length === 0) {
      setErrorMessage('Your bag is currently empty. Explore our catalog to add items.');
      return;
    }

    // 3. Submission Block: Explicit check ensuring ZIP code passes strict US validation
    if (!validateZipCode(postalCode)) {
      const zipErrMsg = 'Please enter a valid 5 or 9-digit US ZIP code';
      setZipError(zipErrMsg);
      setTouched((prev) => ({ ...prev, postalCode: true }));
      setErrors((prev) => ({ ...prev, postalCode: zipErrMsg }));
      setErrorMessage(zipErrMsg);

      const zipEl = document.getElementById('checkout-postalCode');
      if (zipEl) {
        zipEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        zipEl.focus();
      }
      return;
    }

    const { isValid, newErrors, firstKey } = validateAll();

    if (!isValid) {
      // Mark all fields as touched to display inline validation messages
      setTouched({
        email: true,
        phone: true,
        fullName: true,
        streetAddress: true,
        city: true,
        state: true,
        postalCode: true,
      });
      setErrors(newErrors);
      setErrorMessage('Please review and correct the highlighted fields before completing your order.');

      // Smoothly scroll and focus to the first invalid field
      if (firstKey) {
        const el = document.getElementById(`checkout-${firstKey}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus();
        }
      }
      return;
    }

    setZipError(null);
    setIsLoading(true);

    const shippingAddress: ShippingAddress = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      streetAddress: streetAddress.trim(),
      apartment: apartment.trim(),
      city: city.trim(),
      state: state.trim(),
      postalCode: postalCode.trim(),
      country: 'United States',
    };

    try {
      const result = await processCheckout({
        email: email.trim(),
        phone: phone.trim(),
        shippingAddress,
        paymentMethod,
        items,
      });

      if (!result.success || !result.redirectUrl) {
        setErrorMessage(result.error || 'Failed to place order. Please review your details.');
        setIsLoading(false);
        return;
      }

      // Order successfully registered
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
      <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200 p-8 shadow-xs">
        <h2 className="text-xl font-bold text-neutral-900 mb-2">No items to check out</h2>
        <p className="text-sm text-neutral-500 mb-6">
          Your shopping bag is empty. Explore our curated collections to discover items.
        </p>
        <button
          type="button"
          onClick={() => router.push('/')}
          className="bg-neutral-900 text-white font-semibold text-sm px-6 py-3 rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          Return to Storefront
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
      
      {/* Left Column: Guest Details, Shipping & Payment Method */}
      <div className="lg:col-span-7 space-y-8">
        
        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-sm flex items-start gap-2.5 shadow-xs animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Attention required</p>
              <p className="text-xs text-rose-700 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* 1. Contact Info */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/80 shadow-xs space-y-4">
          <h2 className="text-lg font-black text-theme-ink flex items-center justify-between">
            <span>1. Contact Information</span>
            <span className="text-xs font-bold text-theme-primary">Express Guest Checkout</span>
          </h2>
          <p className="text-xs text-neutral-500">
            We will send tracking updates to your email and our delivery carrier will notify your phone.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label htmlFor="checkout-email" className="text-xs font-bold text-neutral-700 block mb-1">
                Email Address <span className="text-theme-primary">*</span>
              </label>
              <input
                id="checkout-email"
                type="email"
                required
                value={email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder="you@example.com"
                aria-invalid={!!(touched.email && errors.email)}
                aria-describedby={touched.email && errors.email ? 'checkout-email-error' : undefined}
                className={`w-full text-sm px-3.5 py-2.5 rounded-xl border focus:outline-hidden transition-colors ${
                  touched.email && errors.email
                    ? 'border-rose-400 bg-rose-50/30 text-theme-ink ring-1 ring-rose-400 focus:border-rose-500'
                    : 'border-neutral-300 focus:border-theme-ink bg-neutral-50/50 text-theme-ink'
                }`}
              />
              {touched.email && errors.email && (
                <p id="checkout-email-error" className="text-xs text-rose-600 mt-1.5 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            <div>
              <label htmlFor="checkout-phone" className="text-xs font-bold text-neutral-700 block mb-1">
                Mobile Phone Number <span className="text-theme-primary">*</span>
              </label>
              <input
                id="checkout-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                onBlur={() => handleBlur('phone')}
                placeholder="(555) 000-0000"
                aria-invalid={!!(touched.phone && errors.phone)}
                aria-describedby={touched.phone && errors.phone ? 'checkout-phone-error' : undefined}
                className={`w-full text-sm px-3.5 py-2.5 rounded-xl border focus:outline-hidden transition-colors ${
                  touched.phone && errors.phone
                    ? 'border-rose-400 bg-rose-50/30 text-theme-ink ring-1 ring-rose-400 focus:border-rose-500'
                    : 'border-neutral-300 focus:border-theme-ink bg-neutral-50/50 text-theme-ink'
                }`}
              />
              {touched.phone && errors.phone && (
                <p id="checkout-phone-error" className="text-xs text-rose-600 mt-1.5 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.phone}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 2. Shipping Address */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/80 shadow-xs space-y-4">
          <h2 className="text-lg font-black text-theme-ink font-sans">
            2. Delivery Address
          </h2>
          <p className="text-xs text-neutral-500">
            Please enter your accurate US delivery destination.
          </p>

          <div className="space-y-4 pt-1">
            {/* Recipient Name */}
            <div>
              <label htmlFor="checkout-fullName" className="text-xs font-bold text-neutral-700 block mb-1">
                Recipient Full Name <span className="text-theme-primary">*</span>
              </label>
              <input
                id="checkout-fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                onBlur={() => handleBlur('fullName')}
                placeholder="Jane Doe"
                aria-invalid={!!(touched.fullName && errors.fullName)}
                aria-describedby={touched.fullName && errors.fullName ? 'checkout-fullName-error' : undefined}
                className={`w-full text-sm px-3.5 py-2.5 rounded-xl border focus:outline-hidden transition-colors ${
                  touched.fullName && errors.fullName
                    ? 'border-rose-400 bg-rose-50/30 text-theme-ink ring-1 ring-rose-400 focus:border-rose-500'
                    : 'border-neutral-300 focus:border-theme-ink bg-neutral-50/50 text-theme-ink'
                }`}
              />
              {touched.fullName && errors.fullName && (
                <p id="checkout-fullName-error" className="text-xs text-rose-600 mt-1.5 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.fullName}</span>
                </p>
              )}
            </div>

            {/* Street Address */}
            <div>
              <label htmlFor="checkout-streetAddress" className="text-xs font-bold text-neutral-700 block mb-1">
                Street Address <span className="text-theme-primary">*</span>
              </label>
              <input
                id="checkout-streetAddress"
                type="text"
                required
                value={streetAddress}
                onChange={(e) => handleChange('streetAddress', e.target.value)}
                onBlur={() => handleBlur('streetAddress')}
                placeholder="123 Luxury Avenue"
                aria-invalid={!!(touched.streetAddress && errors.streetAddress)}
                aria-describedby={touched.streetAddress && errors.streetAddress ? 'checkout-streetAddress-error' : undefined}
                className={`w-full text-sm px-3.5 py-2.5 rounded-xl border focus:outline-hidden transition-colors ${
                  touched.streetAddress && errors.streetAddress
                    ? 'border-rose-400 bg-rose-50/30 text-theme-ink ring-1 ring-rose-400 focus:border-rose-500'
                    : 'border-neutral-300 focus:border-theme-ink bg-neutral-50/50 text-theme-ink'
                }`}
              />
              {touched.streetAddress && errors.streetAddress && (
                <p id="checkout-streetAddress-error" className="text-xs text-rose-600 mt-1.5 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.streetAddress}</span>
                </p>
              )}
            </div>

            {/* Apartment / Suite (Optional) */}
            <div>
              <label htmlFor="checkout-apartment" className="text-xs font-bold text-neutral-700 block mb-1">
                Apartment, Suite, Unit <span className="text-neutral-400 font-normal">(Optional)</span>
              </label>
              <input
                id="checkout-apartment"
                type="text"
                value={apartment}
                onChange={(e) => setApartment(e.target.value)}
                placeholder="Apt 4B"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-theme-ink bg-neutral-50/50 text-theme-ink transition-colors"
              />
            </div>

            {/* City, State Dropdown, ZIP Code Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* City */}
              <div>
                <label htmlFor="checkout-city" className="text-xs font-bold text-neutral-700 block mb-1">
                  City <span className="text-theme-primary">*</span>
                </label>
                <input
                  id="checkout-city"
                  type="text"
                  required
                  value={city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  onBlur={() => handleBlur('city')}
                  placeholder="New York"
                  aria-invalid={!!(touched.city && errors.city)}
                  aria-describedby={touched.city && errors.city ? 'checkout-city-error' : undefined}
                  className={`w-full text-sm px-3.5 py-2.5 rounded-xl border focus:outline-hidden transition-colors ${
                    touched.city && errors.city
                      ? 'border-rose-400 bg-rose-50/30 text-theme-ink ring-1 ring-rose-400 focus:border-rose-500'
                      : 'border-neutral-300 focus:border-theme-ink bg-neutral-50/50 text-theme-ink'
                  }`}
                />
                {touched.city && errors.city && (
                  <p id="checkout-city-error" className="text-xs text-rose-600 mt-1.5 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.city}</span>
                  </p>
                )}
              </div>

              {/* State Dropdown Box */}
              <div>
                <label htmlFor="checkout-state" className="text-xs font-bold text-neutral-700 block mb-1">
                  State <span className="text-theme-primary">*</span>
                </label>
                <div className="relative">
                  <select
                    id="checkout-state"
                    required
                    value={state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    onBlur={() => handleBlur('state')}
                    aria-invalid={!!(touched.state && errors.state)}
                    aria-describedby={touched.state && errors.state ? 'checkout-state-error' : undefined}
                    className={`w-full text-sm px-3.5 py-2.5 rounded-xl border focus:outline-hidden appearance-none cursor-pointer pr-9 transition-colors bg-white ${
                      touched.state && errors.state
                        ? 'border-rose-400 bg-rose-50/30 text-theme-ink ring-1 ring-rose-400 focus:border-rose-500'
                        : !state
                        ? 'border-neutral-300 focus:border-theme-ink text-neutral-400'
                        : 'border-neutral-300 focus:border-theme-ink text-theme-ink'
                    }`}
                  >
                    <option value="" disabled className="text-neutral-400">
                      Select State...
                    </option>
                    <optgroup label="US States & District" className="text-theme-ink font-semibold">
                      {US_STATES.map((s) => (
                        <option key={s.code} value={s.code} className="text-theme-ink font-normal">
                          {s.name} ({s.code})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="US Territories & Armed Forces" className="text-theme-ink font-semibold">
                      {US_TERRITORIES.map((s) => (
                        <option key={s.code} value={s.code} className="text-theme-ink font-normal">
                          {s.name} ({s.code})
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  <ChevronDown className="w-4 h-4 text-neutral-500 absolute right-3 top-3.5 pointer-events-none" />
                </div>
                {touched.state && errors.state && (
                  <p id="checkout-state-error" className="text-xs text-rose-600 mt-1.5 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.state}</span>
                  </p>
                )}
              </div>

              {/* ZIP / Postal Code */}
              <div>
                <label htmlFor="checkout-postalCode" className="text-xs font-bold text-neutral-700 block mb-1">
                  ZIP Code <span className="text-theme-primary">*</span>
                </label>
                <input
                  id="checkout-postalCode"
                  type="text"
                  required
                  maxLength={10}
                  value={postalCode}
                  onChange={(e) => handleChange('postalCode', e.target.value)}
                  onBlur={() => handleBlur('postalCode')}
                  placeholder="10001 or 90210-1234"
                  aria-invalid={!!(zipError || (touched.postalCode && errors.postalCode))}
                  aria-describedby={zipError || errors.postalCode ? 'checkout-postalCode-error' : undefined}
                  className={`w-full text-sm px-3.5 py-2.5 rounded-xl border focus:outline-hidden transition-colors ${
                    zipError || (touched.postalCode && errors.postalCode)
                      ? 'border-rose-400 bg-rose-50/30 text-theme-ink ring-1 ring-rose-400 focus:border-rose-500'
                      : 'border-neutral-300 focus:border-theme-ink bg-neutral-50/50 text-theme-ink'
                  }`}
                />
                {(zipError || (touched.postalCode && errors.postalCode)) && (
                  <p id="checkout-postalCode-error" className="text-xs text-rose-600 mt-1.5 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{zipError || errors.postalCode}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Payment Method */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/80 shadow-xs space-y-4">
          <h2 className="text-lg font-black text-theme-ink font-sans">
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
                  ? 'border-theme-ink bg-neutral-50/80 shadow-xs ring-1 ring-theme-ink'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={paymentMethod === 'cod'}
                onChange={() => setPaymentMethod('cod')}
                className="mt-1 text-theme-ink focus:ring-theme-ink"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold text-sm text-theme-ink">
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
                  ? 'border-theme-ink bg-neutral-50/80 shadow-xs ring-1 ring-theme-ink'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="manual_bank"
                checked={paymentMethod === 'manual_bank'}
                onChange={() => setPaymentMethod('manual_bank')}
                className="mt-1 text-theme-ink focus:ring-theme-ink"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-neutral-700" />
                  <span className="font-bold text-sm text-theme-ink">
                    Direct Wire / Bank Deposit
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  Transfer to our commercial bank account. Package dispatches upon admin verification.
                </p>
              </div>
            </label>

            {/* Stripe / Card */}
            <label
              className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                paymentMethod === 'stripe'
                  ? 'border-theme-ink bg-neutral-50/80 shadow-xs ring-1 ring-theme-ink'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="stripe"
                checked={paymentMethod === 'stripe'}
                onChange={() => setPaymentMethod('stripe')}
                className="mt-1 text-theme-ink focus:ring-theme-ink"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-neutral-700" />
                  <span className="font-bold text-sm text-theme-ink">
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
        <h2 className="text-lg font-black text-theme-ink font-sans">
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
                <p className="text-[10px] font-bold uppercase text-neutral-500">{item.brand}</p>
                <h4 className="text-xs font-semibold text-theme-ink truncate">{item.title}</h4>
                <p className="text-[11px] text-neutral-500">Qty: {item.quantity} {item.variantName ? `• ${item.variantName}` : ''}</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-xs text-theme-ink">
                  {formatCurrency(item.price * item.quantity)}
                </span>
                {item.compareAtPrice && item.compareAtPrice > item.price && (
                  <p className="text-[10px] text-neutral-500 line-through">
                    {formatCurrency(item.compareAtPrice * item.quantity)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Savings banner */}
        {savings > 0 && (
          <div className="bg-theme-secondary/20 border border-theme-secondary/30 p-3 rounded-xl flex items-center gap-2 text-theme-ink text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-theme-primary shrink-0" />
            <span>You are saving {formatCurrency(savings)} on this order!</span>
          </div>
        )}

        {/* Cost Breakdown */}
        <div className="space-y-2 border-t border-neutral-100 pt-4 text-xs">
          <div className="flex justify-between text-neutral-600">
            <span>Subtotal</span>
            <span className="font-semibold text-theme-ink">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-neutral-600">
            <span>Shipping</span>
            <span className="font-semibold">{shippingFee === 0 ? 'FREE' : formatCurrency(shippingFee)}</span>
          </div>
          {savings > 0 && (
            <div className="flex justify-between text-theme-primary font-semibold">
              <span>MSRP Discount</span>
              <span>-{formatCurrency(savings)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-black text-theme-ink pt-3 border-t border-neutral-200">
            <span>Total to Pay</span>
            <span>{formatCurrency(grandTotal)}</span>
          </div>
        </div>

        {/* Place Order Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-theme-primary text-white hover:bg-theme-primary-hover disabled:bg-neutral-300 font-bold py-4 px-6 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer"
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
