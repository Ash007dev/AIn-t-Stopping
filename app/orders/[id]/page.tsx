// app/orders/[id]/page.tsx — Order detail page
'use client';
import { useRouter, useParams } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import Navbar from '@/components/Navbar';

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const purchaseHistory = useAppStore(s => s.purchaseHistory);

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

  const tax = Math.round(order.total * 0.05);
  const grandTotal = order.total + tax;

  return (
    <main className="bg-[#F0F2F2] min-h-screen">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button onClick={() => router.back()} className="text-[#007185] text-[14px] font-medium flex-shrink-0">
                ← Back
              </button>
            </div>
            <h1 className="text-[20px] font-bold text-[#0F1111]">Order Details</h1>
            <p className="text-[13px] text-[#565959] mt-0.5">
              {order.orderId} · {new Date(order.date).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
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
                  <div className="w-14 h-14 bg-[#F0F2F2] rounded border border-[#D5D9D9] flex-shrink-0 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image_url?.startsWith('http') || item.image_url?.startsWith('/placeholder')
                        ? item.image_url : '/placeholder-product.png'}
                      alt={item.name}
                      className="w-12 h-12 object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.png'; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-[#0F1111] truncate">{item.name}</p>
                    <p className="text-[12px] text-[#565959]">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-[14px] font-bold text-[#0F1111] flex-shrink-0">
                    ₹{Math.round((item.price < 1000 ? item.price : item.price / 100) * item.quantity)}
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
              <span>₹{Math.round(order.total / 100)}</span>
            </div>
            <div className="flex justify-between text-[14px] text-[#565959]">
              <span>Delivery:</span>
              <span className="text-[#007600] font-medium">FREE</span>
            </div>
            <div className="flex justify-between text-[14px] text-[#565959]">
              <span>Tax (5%):</span>
              <span>₹{Math.round(tax / 100)}</span>
            </div>
            <div className="flex justify-between text-[16px] font-bold text-[#0F1111] border-t border-[#D5D9D9] pt-2 mt-2">
              <span>Total:</span>
              <span className="text-[#CC0C39]">₹{Math.round(grandTotal / 100)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
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
