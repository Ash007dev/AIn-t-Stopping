// app/orders/[id]/page.tsx - Order detail page
'use client';
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { getProductImage, getProductEmoji, getProductTint } from '@/lib/productImage';
import {
  formatOrderDate,
  getOrderSubtotal,
  normalizeUnitPrice,
  hasOrderPrice,
} from '@/lib/order-utils';
import { getReturnLabel, getReturnResolution } from '@/lib/returns';
import { CheckCircle2, RotateCcw, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const purchaseHistory = useAppStore(s => s.purchaseHistory);
  const [returnStarted, setReturnStarted] = useState(false);

  const order = purchaseHistory.find(o => o.orderId === orderId);

  if (!order) {
    return (
      <main className="bg-[#F0F2F2] min-h-screen">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-8 text-center">
          <p className="text-[16px] text-[#565959] mb-4">Order not found</p>
          <button
            onClick={() => router.push('/orders')}
            className="bg-[#F0F2F2] hover:bg-[#E3E6E6] text-[#0F1111] font-bold
                       px-6 py-2.5 rounded-lg border border-[#D5D9D9] transition-colors"
          >
            View all orders
          </button>
        </div>
      </main>
    );
  }

  const subtotal = getOrderSubtotal(order);
  const tax = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + tax;
  const pricedOrder = hasOrderPrice(order);
  const returnableCount = order.items.filter(item => getReturnResolution(item) === 'returnable').length;

  return (
    <main className="bg-[#F0F2F2] min-h-screen">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button onClick={() => router.back()} className="text-[#007185] text-[14px] font-medium flex-shrink-0">
                &larr; Back
              </button>
            </div>
            <h1 className="text-[20px] font-bold text-[#0F1111]">Order Details</h1>
            <p className="text-[13px] text-[#565959] mt-0.5">
              {order.orderId} &middot; {formatOrderDate(order, true)}
            </p>
          </div>
          <div className="bg-[#F0FFF0] border border-[#B7DFB7] rounded px-3 py-1.5">
            <p className="text-[13px] text-[#007600] font-bold">Delivered</p>
          </div>
        </div>

        {/* Order summary card */}
        <div className="bg-white border border-[#D5D9D9] rounded-lg p-5 mb-4">
          <h2 className="text-[16px] font-bold text-[#0F1111] mb-3 border-b border-[#D5D9D9] pb-2">
            {order.occasionTitle || 'Your Order'}
          </h2>

          {/* Items list */}
          {order.items && order.items.length > 0 ? (
            <div className="space-y-3 mb-4">
              {order.items.map((item, i) => (
                <div key={item.id || i} className="flex gap-3 items-start">
                  <div className="w-14 h-14 rounded border border-[#D5D9D9] flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: getProductTint(item) }}>
                    {getProductImage(item) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={getProductImage(item) as string}
                        alt={item.name}
                        className="w-12 h-12 object-contain"
                      />
                    ) : (
                      <span className="text-[26px] leading-none" role="img" aria-label={item.name}>{getProductEmoji(item)}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-[#0F1111] truncate">{item.name}</p>
                    <p className="text-[12px] text-[#565959]">Qty: {item.quantity}</p>
                    <p className="text-[11px] text-[#007185] mt-0.5">{getReturnLabel(item)}</p>
                  </div>
                  <p className="text-[14px] font-bold text-[#0F1111] flex-shrink-0">
                    &#8377;{Math.round(normalizeUnitPrice(item.price) * Math.max(1, item.quantity || 1))}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[14px] text-[#565959] mb-4">
              {order.itemCount || 0} items in this order
            </p>
          )}

          {/* Totals */}
          <div className="border-t border-[#D5D9D9] pt-3 space-y-1.5">
            <div className="flex justify-between text-[14px] text-[#565959]">
              <span>Subtotal:</span>
              <span>{pricedOrder ? <>&#8377;{Math.round(subtotal)}</> : 'Unavailable'}</span>
            </div>
            <div className="flex justify-between text-[14px] text-[#565959]">
              <span>Delivery:</span>
              <span className="text-[#007600] font-medium">FREE</span>
            </div>
            <div className="flex justify-between text-[14px] text-[#565959]">
              <span>Tax (5%):</span>
              <span>{pricedOrder ? <>&#8377;{tax}</> : 'Unavailable'}</span>
            </div>
            <div className="flex justify-between text-[16px] font-bold text-[#0F1111] border-t border-[#D5D9D9] pt-2 mt-2">
              <span>Total:</span>
              <span className="text-[#CC0C39]">
                {pricedOrder ? <>&#8377;{grandTotal}</> : 'Price unavailable'}
              </span>
            </div>
          </div>
        </div>

        <section className="bg-white border border-[#D5D9D9] rounded-lg p-5 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EAF5FF] flex items-center justify-center flex-shrink-0">
              <RotateCcw size={19} className="text-[#007185]" />
            </div>
            <div className="flex-1">
              <h2 className="text-[15px] font-bold text-[#0F1111]">Returns and issue resolution</h2>
              <p className="text-[12px] text-[#565959] mt-1 leading-5">
                {returnableCount} packaged item{returnableCount === 1 ? '' : 's'} eligible for a 7-day return.
                Fresh items use photo-based quality refund or replacement without a physical return.
              </p>
              <div className="mt-3 flex items-center gap-2 text-[11px] text-[#007600]">
                <ShieldCheck size={14} />
                Source hub and item condition are retained for traceability.
              </div>

              {returnStarted ? (
                <div className="mt-4 flex items-start gap-2 rounded-lg border border-[#B7DFB7] bg-[#F0FFF0] p-3">
                  <CheckCircle2 size={17} className="text-[#007600] flex-shrink-0 mt-0.5" />
                  <p className="text-[12px] text-[#0F5F0F]">
                    Return flow ready. In production this opens item selection, photo upload, and pickup or instant-refund options.
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => setReturnStarted(true)}
                  className="mt-4 rounded-lg border border-[#D5D9D9] bg-white px-4 py-2 text-[12px] font-bold text-[#0F1111] hover:border-[#FF9900]"
                >
                  Return or report an issue
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => router.push('/orders')}
            className="flex-1 bg-[#F0F2F2] hover:bg-[#E3E6E6] text-[#0F1111] font-bold
                       py-2.5 rounded-lg border border-[#D5D9D9] transition-colors text-[14px]"
          >
            Back to Orders
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex-1 bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-bold
                       py-2.5 rounded-lg border border-[#FCD200] transition-colors text-[14px]"
          >
            Reorder
          </button>
        </div>
      </div>
    </main>
  );
}
