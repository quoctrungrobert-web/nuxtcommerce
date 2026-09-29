<!--app/pages/track.vue-->
<script setup>
import { push } from 'notivue';

const route = useRoute();
const initialOrderId = route.query.id || '';

const orderIdInput = ref(initialOrderId);
const loading = ref(false);
const error = ref('');
const trackingData = ref(null);

const runtimeConfig = useRuntimeConfig();
const BACKEND = runtimeConfig.public.backendUrl;

const handleTrackOrder = async (idToTrack) => {
  if (!idToTrack.trim()) {
    error.value = 'Please enter an Order Number.';
    return;
  }
  
  loading.value = true;
  error.value = '';
  trackingData.value = null;
  
  try {
    const trimmedId = idToTrack.trim();
    const res = await $fetch(`${BACKEND}/api/orders/${trimmedId}/tracking`);
    trackingData.value = res;
  } catch (err) {
    if (err.response?.status === 404) {
      error.value = 'Order not found. Please check your Order Number.';
    } else if (err.response?._data?.error) {
      error.value = err.response._data.error;
    } else {
      error.value = err.message || 'Failed to fetch tracking information.';
    }
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (initialOrderId) {
    handleTrackOrder(initialOrderId);
  }
});

const activeFulfillment = computed(() => trackingData.value?.fulfillments?.[0]);

const getStatusText = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending': return 'Order Placed';
    case 'paid': return 'Payment Confirmed';
    case 'processing': return 'In Production';
    case 'pod_submit_failed': return 'Processing Error';
    case 'shipped': return 'Shipped';
    case 'delivered': return 'Delivered';
    case 'cancelled': return 'Cancelled';
    case 'refunded': return 'Refunded';
    default: return status;
  }
};

const getDisplayOrderId = () => {
  if (!trackingData.value) return '';
  return trackingData.value.orderNumber
    ? `#ORD-${trackingData.value.orderNumber}`
    : `#${trackingData.value.id.split('-')[0]}`;
};
</script>

<template>
  <div class="container max-w-4xl py-12 px-4 mx-auto pt-24 min-h-screen">
    <div class="text-center mb-10">
      <h1 class="text-4xl font-extrabold tracking-tight mb-4 dark:text-white">Track Your Order</h1>
      <p class="text-gray-500 dark:text-gray-400 text-lg">
        Enter your Order Number below to get the latest status and tracking information.
      </p>
    </div>

    <div class="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto mb-12">
      <input 
        type="text" 
        placeholder="e.g., ORD-1001 or 1001" 
        v-model="orderIdInput"
        @keydown.enter="handleTrackOrder(orderIdInput)"
        class="flex h-12 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] dark:text-white px-4 py-2 text-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      />
      <button 
        @click="handleTrackOrder(orderIdInput)"
        :disabled="loading"
        class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-12 px-8 flex-shrink-0 shadow-sm"
      >
        {{ loading ? 'Tracking...' : 'Track' }}
      </button>
    </div>

    <div v-if="error" class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-md text-center mb-8 border border-red-100 dark:border-red-800">
      {{ error }}
    </div>

    <div v-if="trackingData" class="space-y-8 animate-in fade-in duration-500">
      <!-- Status Timeline Card -->
      <div class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] text-gray-950 dark:text-white shadow-md border-t-4 border-t-black dark:border-t-white overflow-hidden">
        <div class="flex flex-col space-y-1.5 p-6 bg-gray-50/50 dark:bg-black/20 border-b border-gray-100 dark:border-gray-800">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-semibold leading-none tracking-tight text-xl">Order {{ getDisplayOrderId() }}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1.5">Placed on {{ new Date(trackingData.createdAt).toLocaleDateString() }}</p>
            </div>
            <div class="text-right">
              <span class="font-semibold text-lg">{{ trackingData.currency }} ${{ (trackingData.totalAmount / 100).toFixed(2) }}</span>
            </div>
          </div>
        </div>
        <div class="p-6 pt-8">
          <div class="flex flex-col md:flex-row items-center justify-center gap-6">
            <div class="flex flex-col items-center p-4 bg-gray-50 dark:bg-black/40 rounded-xl border border-gray-100 dark:border-gray-800">
              <span class="mt-3 font-semibold text-lg text-center">{{ getStatusText(trackingData.status) }}</span>
              <span class="text-sm text-gray-500 dark:text-gray-400 mt-1">Current Status</span>
            </div>
            
            <div v-if="activeFulfillment?.trackingNumber" class="hidden md:flex h-px w-16 bg-gray-200 dark:bg-gray-700"></div>
            
            <div v-if="activeFulfillment?.trackingNumber" class="flex flex-col justify-center items-start bg-gray-50 dark:bg-black/40 p-5 rounded-xl border border-gray-100 dark:border-gray-800 w-full md:w-auto">
              <h3 class="font-medium text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Shipping Details</h3>
              <p v-if="activeFulfillment.carrier" class="mb-1"><span class="font-medium">Carrier:</span> {{ activeFulfillment.carrier }}</p>
              <p class="mb-3"><span class="font-medium">Tracking Number:</span> {{ activeFulfillment.trackingNumber }}</p>
              <a 
                v-if="activeFulfillment.trackingUrl"
                :href="activeFulfillment.trackingUrl" 
                target="_blank" 
                class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 h-9 px-3 w-full shadow-sm"
              >
                Track on {{ activeFulfillment.carrier || 'Carrier' }} Website
              </a>
              <p v-else class="text-sm text-gray-500 italic">Tracking link not yet available.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Items Card -->
      <div class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] shadow-sm overflow-hidden mt-8">
        <div class="flex flex-col space-y-1.5 p-6">
          <h3 class="font-semibold leading-none tracking-tight text-lg dark:text-white">Items in your order</h3>
        </div>
        <div class="p-6 pt-0">
          <div class="divide-y divide-gray-100 dark:divide-gray-800">
            <div v-for="(item, index) in trackingData.items" :key="index" class="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
              <NuxtImg v-if="item.imageUrl" :src="item.imageUrl" :alt="item.title" class="relative w-16 h-16 rounded-md object-cover bg-gray-100 dark:bg-gray-800 flex-shrink-0 border dark:border-gray-700" />
              <div class="flex-grow">
                <h4 class="font-medium line-clamp-2 dark:text-white">{{ item.title }}</h4>
                <p class="text-sm text-gray-500 dark:text-gray-400">Qty: {{ item.quantity }}</p>
              </div>
              <div class="font-semibold text-right flex-shrink-0 dark:text-white">
                {{ trackingData.currency }} ${{ (item.price / 100).toFixed(2) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
