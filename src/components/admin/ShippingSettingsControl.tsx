'use client';

import { useState } from 'react';
import { 
  Truck, 
  Sparkles, 
  Check, 
  RotateCcw, 
  Loader2, 
  DollarSign, 
  ShieldCheck, 
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { StoreSettings, DEFAULT_SETTINGS } from '@/types/settings';
import { updateStoreSettingsAction } from '@/actions/admin-settings';
import { formatCurrency } from '@/lib/utils';
import { useCartStore } from '@/lib/store/cart';

interface ShippingSettingsControlProps {
  initialSettings: StoreSettings;
}

export function ShippingSettingsControl({ initialSettings }: ShippingSettingsControlProps) {
  const [settings, setSettings] = useState<StoreSettings>(initialSettings);
  const [thresholdInput, setThresholdInput] = useState<string>(
    initialSettings.freeShippingThreshold.toString()
  );
  const [standardFeeInput, setStandardFeeInput] = useState<string>(
    initialSettings.standardShippingFee.toString()
  );
  const [isEnabled, setIsEnabled] = useState<boolean>(
    initialSettings.isFreeShippingEnabled
  );

  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { setShippingSettings } = useCartStore();

  const presets = [35, 50, 75, 100, 150];

  const handlePresetClick = (amount: number) => {
    setThresholdInput(amount.toString());
    setFeedback(null);
  };

  const handleResetDefaults = () => {
    setThresholdInput(DEFAULT_SETTINGS.freeShippingThreshold.toString());
    setStandardFeeInput(DEFAULT_SETTINGS.standardShippingFee.toString());
    setIsEnabled(DEFAULT_SETTINGS.isFreeShippingEnabled);
    setFeedback(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const parsedThreshold = parseFloat(thresholdInput);
    if (isNaN(parsedThreshold) || parsedThreshold < 0) {
      setFeedback({
        type: 'error',
        message: 'Please enter a valid non-negative number for the free shipping threshold.',
      });
      return;
    }

    const parsedStandardFee = parseFloat(standardFeeInput);
    if (isNaN(parsedStandardFee) || parsedStandardFee < 0) {
      setFeedback({
        type: 'error',
        message: 'Please enter a valid non-negative number for the standard shipping fee.',
      });
      return;
    }

    setIsSaving(true);

    try {
      const result = await updateStoreSettingsAction({
        freeShippingThreshold: parsedThreshold,
        standardShippingFee: parsedStandardFee,
        isFreeShippingEnabled: isEnabled,
      });

      if (!result.success || !result.settings) {
        setFeedback({
          type: 'error',
          message: result.error || 'Failed to update shipping settings.',
        });
        setIsSaving(false);
        return;
      }

      setSettings(result.settings);
      setThresholdInput(result.settings.freeShippingThreshold.toString());
      setStandardFeeInput(result.settings.standardShippingFee.toString());
      setIsEnabled(result.settings.isFreeShippingEnabled);

      // Synchronize in-memory cart store immediately
      setShippingSettings(result.settings);

      setFeedback({
        type: 'success',
        message: `Free shipping threshold updated to ${formatCurrency(result.settings.freeShippingThreshold)}! Storefront announcement and checkout rates updated.`,
      });

      setTimeout(() => {
        setFeedback((prev) => (prev?.type === 'success' ? null : prev));
      }, 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unexpected error saving settings.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setIsSaving(false);
    }
  };

  const currentPreviewThreshold = parseFloat(thresholdInput) || settings.freeShippingThreshold;
  const currentPreviewFee = parseFloat(standardFeeInput) || settings.standardShippingFee;

  const hasUnsavedChanges =
    parseFloat(thresholdInput) !== settings.freeShippingThreshold ||
    parseFloat(standardFeeInput) !== settings.standardShippingFee ||
    isEnabled !== settings.isFreeShippingEnabled;

  return (
    <div className="space-y-6">
      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-start gap-3 transition-all animate-in fade-in duration-200 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className="font-bold">{feedback.type === 'success' ? 'Settings Saved' : 'Update Failed'}</p>
            <p className="mt-0.5">{feedback.message}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Controls Column */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Free Shipping Threshold Card */}
            <div className="bg-neutral-50/70 p-5 sm:p-6 rounded-2xl border border-neutral-200/80 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <label htmlFor="shipping-threshold" className="text-sm font-bold text-theme-ink flex items-center gap-1.5">
                    <span>Free Shipping Minimum Amount</span>
                    <span className="text-theme-primary">*</span>
                  </label>
                  <p className="text-xs text-neutral-500 mt-1">
                    Orders with a subtotal at or above this dollar value will qualify for 100% free delivery.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Live Setting
                  </span>
                </div>
              </div>

              {/* Threshold Currency Input */}
              <div className="space-y-3">
                <div className="relative max-w-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400 font-bold text-sm">
                    $
                  </div>
                  <input
                    id="shipping-threshold"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={thresholdInput}
                    onChange={(e) => {
                      setThresholdInput(e.target.value);
                      setFeedback(null);
                    }}
                    placeholder="75.00"
                    className="w-full pl-8 pr-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-base font-bold text-theme-ink focus:outline-hidden focus:border-theme-ink transition-colors shadow-2xs"
                  />
                </div>

                {/* Quick Presets */}
                <div>
                  <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">
                    Quick Threshold Presets:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {presets.map((preset) => {
                      const isSelected = parseFloat(thresholdInput) === preset;
                      return (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => handlePresetClick(preset)}
                          className={`text-xs px-3 py-1.5 rounded-lg font-bold border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-theme-ink text-white border-theme-ink shadow-xs'
                              : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50'
                          }`}
                        >
                          ${preset}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Standard Shipping Fee Card */}
            <div className="bg-neutral-50/70 p-5 sm:p-6 rounded-2xl border border-neutral-200/80 space-y-4">
              <div>
                <label htmlFor="standard-fee" className="text-sm font-bold text-theme-ink flex items-center gap-1.5">
                  <span>Standard Flat-Rate Delivery Fee</span>
                  <span className="text-theme-primary">*</span>
                </label>
                <p className="text-xs text-neutral-500 mt-1">
                  Charged to customers whose orders do not reach the free shipping threshold.
                </p>
              </div>

              <div className="relative max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400 font-bold text-sm">
                  $
                </div>
                <input
                  id="standard-fee"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={standardFeeInput}
                  onChange={(e) => {
                    setStandardFeeInput(e.target.value);
                    setFeedback(null);
                  }}
                  placeholder="5.99"
                  className="w-full pl-8 pr-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-base font-bold text-theme-ink focus:outline-hidden focus:border-theme-ink transition-colors shadow-2xs"
                />
              </div>
            </div>

            {/* Free Shipping Switch Toggle */}
            <div className="bg-neutral-50/70 p-5 sm:p-6 rounded-2xl border border-neutral-200/80 flex items-center justify-between gap-4">
              <div>
                <span className="text-sm font-bold text-theme-ink block">
                  Free Shipping Promotion Status
                </span>
                <p className="text-xs text-neutral-500 mt-0.5">
                  When enabled, storefront banners and cart progress bar actively guide customers to unlock free shipping.
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={isEnabled}
                onClick={() => {
                  setIsEnabled(!isEnabled);
                  setFeedback(null);
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  isEnabled ? 'bg-emerald-600' : 'bg-neutral-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    isEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Right Column: Real-Time Storefront Impact Preview */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-neutral-900 text-white p-6 rounded-2xl shadow-sm space-y-5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
                <Sparkles className="w-4 h-4 text-theme-primary" />
                <span>Live Customer Experience Preview</span>
              </div>

              {/* 1. Header Banner Preview */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-neutral-400 uppercase">
                  1. Top Announcement Bar
                </span>
                <div className="bg-black/40 border border-neutral-800 p-3 rounded-xl text-center text-xs font-medium text-theme-canvas">
                  {isEnabled ? (
                    <span>FREE U.S. SHIPPING OVER ${currentPreviewThreshold}</span>
                  ) : (
                    <span>FLAT-RATE U.S. DELIVERY ({formatCurrency(currentPreviewFee)})</span>
                  )}
                </div>
              </div>

              {/* 2. Cart Drawer Progress Preview */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-neutral-400 uppercase">
                  2. Cart Drawer Progress Meter
                </span>
                <div className="bg-neutral-800/90 border border-neutral-700/60 p-3.5 rounded-xl space-y-2">
                  {isEnabled ? (
                    <>
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-300">Add $15.00 more for</span>
                        <span className="text-emerald-400 font-bold">FREE SHIPPING</span>
                      </div>
                      <div className="w-full bg-neutral-700 rounded-full h-1.5">
                        <div className="bg-emerald-400 h-1.5 rounded-full w-3/4" />
                      </div>
                      <p className="text-[10px] text-neutral-400">
                        Target goal: {formatCurrency(currentPreviewThreshold)}
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-neutral-400 italic">
                      Progress meter hidden while promotion is disabled.
                    </p>
                  )}
                </div>
              </div>

              {/* 3. Checkout Summary Preview */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-neutral-400 uppercase">
                  3. Order Review Line Item
                </span>
                <div className="bg-neutral-800/90 border border-neutral-700/60 p-3.5 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-300">Shipping (&ge; {formatCurrency(currentPreviewThreshold)})</span>
                    <span className="text-emerald-400 font-bold">
                      {isEnabled ? 'FREE' : formatCurrency(currentPreviewFee)}
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-400 text-[11px]">
                    <span>Shipping (&lt; {formatCurrency(currentPreviewThreshold)})</span>
                    <span>{formatCurrency(currentPreviewFee)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-800 flex items-center gap-2 text-[11px] text-neutral-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Enforced atomically on server checkout</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-neutral-200">
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            {hasUnsavedChanges ? (
              <span className="flex items-center gap-1.5 text-amber-600 font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Unsaved modifications detected
              </span>
            ) : (
              <span className="text-neutral-400">
                Last updated: {new Date(settings.updatedAt || Date.now()).toLocaleTimeString()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleResetDefaults}
              disabled={isSaving}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-xs font-bold text-neutral-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5 text-neutral-500" />
              <span>Reset ($75)</span>
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-theme-primary hover:bg-theme-primary-hover disabled:bg-neutral-300 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Rates...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Shipping Settings</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
