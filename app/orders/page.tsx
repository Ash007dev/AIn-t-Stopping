// app/orders/page.tsx - Order history page
'use client';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { formatOrderDate, getOrderSubtotal } from '@/lib/order-utils';
import Navbar from '@/components/Navbar';

export default function OrdersPage() {
  const router = useRouter();
  const purchaseHistory = useAppStore(s => s.purchaseHistory);

  return (
    <main className="bg-[#F0F2F2] min-h-screen">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => router.back()} className="text-[#007185] text-[14px] font-medium flex-shrink-0">
            &larr; Back
          </button>
          <h1 className="text-[22px] font-bold text-[#0F1111]">Your Orders</h1>
        </div>

        {purchaseHistory.length === 0 ? (
          <div className="bg-white border border-[#D5D9D9] rounded-lg p-8 text-center">
            <p className="text-[16px] text-[#565959] mb-4">No orders yet</p>
            <button
              onClick={() => router.push('/')}
              className="bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-bold
                         px-6 py-2.5 rounded-lg border border-[#FCD200] transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {purchaseHistory.map((order, idx) => (
              <button
                key={order.orderId || idx}
                onClick={() => router.push(`/orders/${order.orderId || idx}`)}
                className="w-full bg-white border border-[#D5D9D9] rounded-lg p-4
                           hover:border-[#FF9900] transition-colors text-left"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-[15px] font-bold text-[#0F1111]">
                      {order.occasionTitle || 'Order'}
                    </p>
                    <p className="text-[12px] text-[#8C9296] mt-0.5">
                      {order.orderId} &middot; {formatOrderDate(order)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[15px] font-bold text-[#0F1111]">
                      &#8377;{Math.round(getOrderSubtotal(order))}
                    </p>
                    <p className="text-[12px] text-[#007600] font-medium">
                      Delivered
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[13px] text-[#565959]">
                  <span>{order.itemCount || order.items?.length || 0} items</span>
                  <span className="text-[#D5D9D9]">&middot;</span>
                  <span className="text-[#007185]">View details &rarr;</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
