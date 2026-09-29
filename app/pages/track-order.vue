<script setup>
const route = useRoute();
const backendUrl = useRuntimeConfig().public.backendUrl || 'http://localhost:4000';
const orderId = ref(route.query.id || '');
const email = ref(route.query.email || '');
const isLoading = ref(false);
const errorMsg = ref('');
const orderData = ref(null);

onMounted(() => {
  if (orderId.value && email.value) {
    trackOrder();
  }
});

const trackOrder = async () => {
  if (!orderId.value) {
    errorMsg.value = 'Please enter your Order ID.';
    return;
  }
  
  errorMsg.value = '';
  isLoading.value = true;
  orderData.value = null;
  
  try {
    const res = await $fetch(`${backendUrl}/api/orders/${orderId.value}/tracking`);
    
    if (res && res.id) {
      // Validate email if provided, or simply display it if correct
      if (email.value && res.customerEmail && res.customerEmail.toLowerCase() !== email.value.toLowerCase()) {
         errorMsg.value = 'Order found, but the email does not match.';
         isLoading.value = false;
         return;
      }
      
      orderData.value = {
        id: res.orderNumber ? `ORD-${res.orderNumber}` : res.id,
        customer: res.customerName || 'Guest',
        date: res.createdAt,
        product: res.items.map(i => i.title).join(', '),
        variants: res.items.map(i => `${i.quantity}x`).join(', '),
        status: res.status,
        amount: res.totalAmount
      };
    } else {
      errorMsg.value = 'Order not found. Please check your information.';
    }
  } catch (e) {
    errorMsg.value = e.response?._data?.error || 'Cannot connect to server or order not found.';
  } finally {
    isLoading.value = false;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'paid': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
    case 'processing': return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400';
    case 'shipped': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400';
    case 'delivered': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
    default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400';
  }
};
</script>

<template>
  <div class="min-h-[70vh] bg-[#f9f9f9] dark:bg-[#121212] pt-8 pb-16">
    <div class="max-w-2xl mx-auto px-4">
      <div class="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm p-6 lg:p-10">
        <h1 class="text-2xl font-bold text-center mb-2 text-black dark:text-white">Track Your Order</h1>
        <p class="text-center text-gray-500 dark:text-gray-400 mb-8">Enter your order details below to check the current status.</p>
        
        <form @submit.prevent="trackOrder" class="space-y-5">
          <div>
            <label class="block text-sm font-semibold mb-2 text-black dark:text-white">Order ID</label>
            <input v-model="orderId" type="text" placeholder="e.g. ORD-1234" class="w-full h-12 px-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent outline-none focus:border-orange-500 dark:focus:border-orange-500 transition-colors" />
          </div>
          <div>
            <label class="block text-sm font-semibold mb-2 text-black dark:text-white">Email Address</label>
            <input v-model="email" type="email" placeholder="Email used for purchase" class="w-full h-12 px-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent outline-none focus:border-orange-500 dark:focus:border-orange-500 transition-colors" />
          </div>
          
          <div v-if="errorMsg" class="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg">
            {{ errorMsg }}
          </div>
          
          <button type="submit" :disabled="isLoading" class="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold flex items-center justify-center transition-colors disabled:opacity-50">
            <UIcon v-if="isLoading" name="i-svg-spinners-bars-rotate-fade" class="mr-2" size="20" />
            TRACK ORDER
          </button>
        </form>

        <div v-if="orderData" class="mt-10 pt-8 border-t border-gray-200 dark:border-gray-800">
          <h2 class="text-lg font-bold mb-4 text-black dark:text-white">Order Details: #{{ orderData.id }}</h2>
          <div class="bg-gray-50 dark:bg-[#222] rounded-xl p-5 mb-6">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Customer</p>
                <p class="font-semibold text-black dark:text-white">{{ orderData.customer }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Order Date</p>
                <p class="font-semibold text-black dark:text-white">{{ new Date(orderData.date).toLocaleDateString() }}</p>
              </div>
              <div class="col-span-2">
                <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Product</p>
                <p class="font-semibold text-black dark:text-white">{{ orderData.product }}</p>
                <p class="text-sm text-gray-500">{{ orderData.variants }}</p>
              </div>
            </div>
          </div>
          
          <div class="relative pl-6 border-l-2 border-gray-200 dark:border-gray-700 space-y-6">
            <div class="relative">
              <div class="absolute -left-[29px] top-0 w-4 h-4 rounded-full bg-green-500 border-2 border-white dark:border-[#1a1a1a]"></div>
              <p class="font-bold text-black dark:text-white">Order Placed</p>
              <p class="text-sm text-gray-500">We have received your order.</p>
            </div>
            <div class="relative">
              <div :class="['absolute -left-[29px] top-0 w-4 h-4 rounded-full border-2 border-white dark:border-[#1a1a1a]', ['processing', 'shipped', 'delivered'].includes(orderData.status) ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-700']"></div>
              <p class="font-bold text-black dark:text-white">In Production</p>
              <p class="text-sm text-gray-500">Your custom product is being created.</p>
            </div>
            <div class="relative">
              <div :class="['absolute -left-[29px] top-0 w-4 h-4 rounded-full border-2 border-white dark:border-[#1a1a1a]', ['shipped', 'delivered'].includes(orderData.status) ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-700']"></div>
              <p class="font-bold text-black dark:text-white">Shipped</p>
              <p class="text-sm text-gray-500">Your order is on the way.</p>
              <p v-if="orderData.trackingCode" class="text-sm font-semibold mt-1 bg-gray-100 dark:bg-gray-800 inline-block px-2 py-1 rounded">Tracking: {{ orderData.trackingCode }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
