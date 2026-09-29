<!--app/pages/checkout.vue-->
<script setup>
import { loadScript } from '@paypal/paypal-js';
import { push } from 'notivue';

definePageMeta({
  layout: 'default'
});

const { cart, getTotal, clearCart } = useCart();
const router = useRouter();
const runtimeConfig = useRuntimeConfig();
const BACKEND = runtimeConfig.public.backendUrl;

const formData = ref({
  customerEmail: '',
  firstName: '',
  lastName: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  zip: '',
  country: 'US',
  phone: '',
});

const isFormValid = computed(() => {
  const f = formData.value;
  return !!(f.customerEmail && f.firstName && f.lastName && f.address1 && f.city && f.state && f.zip && f.country);
});

const FREE_SHIPPING_THRESHOLD = 75;
const subtotal = computed(() => getTotal.value / 100);
const shipping = computed(() => subtotal.value >= FREE_SHIPPING_THRESHOLD ? 0 : 4.99);
const total = computed(() => subtotal.value + shipping.value);

const paypalContainer = ref(null);
let paypalInstance = null;

const buildOrderPayload = () => {
  const f = formData.value;
  return {
    gatewayName: 'paypal',
    customerEmail: f.customerEmail,
    customerName: `${f.firstName} ${f.lastName}`,
    totalAmount: total.value * 100,
    shippingAmount: shipping.value * 100,
    items: cart.value.map(i => ({
      productId: i.productId,
      variantId: i.variantId,
      providerName: 'printify',
      printProviderId: 0,
      blueprintId: 0,
      quantity: i.quantity,
      price: i.price,
      title: i.title,
      imageUrl: i.image,
    })),
    shippingAddress: {
      firstName: f.firstName,
      lastName: f.lastName,
      address1: f.address1,
      address2: f.address2,
      city: f.city,
      state: f.state,
      zip: f.zip,
      country: f.country,
      phone: f.phone,
    },
  };
};

const initPayPal = async () => {
  if (cart.value.length === 0) return;
  try {
    const configRes = await $fetch(`${BACKEND}/api/public/orders/config`);
    const clientId = configRes?.paypalClientId || 'test';
    
    const paypal = await loadScript({ clientId: clientId, currency: 'USD' });
    
    if (paypal && paypalContainer.value) {
      paypalInstance = paypal.Buttons({
        createOrder: async () => {
          const res = await $fetch(`${BACKEND}/api/public/orders/create`, {
            method: 'POST',
            body: buildOrderPayload()
          });
          return res.gatewayOrderId;
        },
        onApprove: async (data) => {
          try {
            const res = await $fetch(`${BACKEND}/api/public/orders/capture`, {
              method: 'POST',
              body: {
                gatewayOrderId: data.orderID,
                cartData: buildOrderPayload()
              }
            });
            clearCart();
            const displayId = res.orderNumber ? `ORD-${res.orderNumber}` : res.orderId;
            push.success('Order placed successfully!');
            router.push(`/track?id=${displayId}`);
          } catch (err) {
            console.error(err);
            push.error('Payment capture failed. Please contact support.');
          }
        }
      });
      paypalInstance.render(paypalContainer.value);
    }
  } catch (err) {
    console.error('Failed to init PayPal', err);
  }
};

onMounted(() => {
  initPayPal();
});
</script>

<template>
  <div class="bg-gray-50 dark:bg-[#111] min-h-screen pt-20">
    <div class="max-w-5xl mx-auto pt-12 pb-24 px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">Checkout</h1>

      <div v-if="cart.length === 0" class="p-12 text-center text-xl text-gray-500">
        Your cart is empty.
        <NuxtLink to="/" class="text-indigo-600 underline">Browse products &rarr;</NuxtLink>
      </div>

      <div v-else class="lg:grid lg:grid-cols-2 lg:gap-10 items-start">
        <!-- Left: Form -->
        <div class="space-y-8">
          
          <!-- Contact -->
          <div class="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
            <h2 class="text-base font-bold text-gray-900 dark:text-white mb-4">Contact Information</h2>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address *</label>
            <input type="email" v-model="formData.customerEmail" required class="block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-black focus:border-black sm:text-sm py-3 px-4 outline-none transition dark:bg-[#222] dark:border-gray-600 dark:text-white" placeholder="you@example.com" />
          </div>

          <!-- Shipping -->
          <div class="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
            <h2 class="text-base font-bold text-gray-900 dark:text-white mb-4">Shipping Address</h2>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name *</label>
                <input type="text" v-model="formData.firstName" required class="block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-black focus:border-black sm:text-sm py-3 px-4 outline-none transition dark:bg-[#222] dark:border-gray-600 dark:text-white" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name *</label>
                <input type="text" v-model="formData.lastName" required class="block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-black focus:border-black sm:text-sm py-3 px-4 outline-none transition dark:bg-[#222] dark:border-gray-600 dark:text-white" />
              </div>
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Street Address *</label>
                <input type="text" v-model="formData.address1" required class="block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-black focus:border-black sm:text-sm py-3 px-4 outline-none transition dark:bg-[#222] dark:border-gray-600 dark:text-white" placeholder="123 Main St" />
              </div>
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Apt, suite, unit, etc. (optional)</label>
                <input type="text" v-model="formData.address2" class="block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-black focus:border-black sm:text-sm py-3 px-4 outline-none transition dark:bg-[#222] dark:border-gray-600 dark:text-white" placeholder="Apt 4B" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City *</label>
                <input type="text" v-model="formData.city" required class="block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-black focus:border-black sm:text-sm py-3 px-4 outline-none transition dark:bg-[#222] dark:border-gray-600 dark:text-white" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State *</label>
                <input type="text" v-model="formData.state" required class="block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-black focus:border-black sm:text-sm py-3 px-4 outline-none transition dark:bg-[#222] dark:border-gray-600 dark:text-white" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ZIP Code *</label>
                <input type="text" v-model="formData.zip" required class="block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-black focus:border-black sm:text-sm py-3 px-4 outline-none transition dark:bg-[#222] dark:border-gray-600 dark:text-white" placeholder="10001" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
                <select v-model="formData.country" class="block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-black focus:border-black sm:text-sm py-3 px-4 outline-none transition dark:bg-[#222] dark:border-gray-600 dark:text-white">
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                </select>
              </div>
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Phone (optional)</label>
                <input type="tel" v-model="formData.phone" class="block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-black focus:border-black sm:text-sm py-3 px-4 outline-none transition dark:bg-[#222] dark:border-gray-600 dark:text-white" placeholder="(555) 000-0000" />
              </div>
            </div>
          </div>

          <!-- Payment -->
          <div class="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
            <h2 class="text-base font-bold text-gray-900 dark:text-white mb-4">Payment</h2>
            <div v-if="!isFormValid" class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 text-sm text-amber-700">
              Please fill out all required fields above to unlock payment.
            </div>
            
            <div :class="{'opacity-40 pointer-events-none': !isFormValid, 'transition-opacity duration-300 relative z-0': true}">
              <div ref="paypalContainer"></div>
            </div>
          </div>
        </div>

        <!-- Right: Order Summary -->
        <div class="mt-8 lg:mt-0">
          <div class="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 sticky top-28">
            <h2 class="text-base font-bold text-gray-900 dark:text-white mb-4">Order Summary</h2>
            <ul class="divide-y divide-gray-50 dark:divide-gray-800 mb-4">
              <li v-for="item in cart" :key="item.key" class="flex gap-3 py-3">
                <NuxtImg :src="item.image || '/placeholder.png'" :alt="item.title" class="w-14 h-14 rounded-lg object-cover bg-gray-100 dark:bg-gray-800 flex-shrink-0" />
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{{ item.title }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ item.variantTitle }}</p>
                  <p class="text-xs text-gray-400 mt-0.5">Qty {{ item.quantity }}</p>
                </div>
                <p class="text-sm font-semibold text-gray-900 dark:text-white flex-shrink-0">
                  ${{ ((item.price / 100) * item.quantity).toFixed(2) }}
                </p>
              </li>
            </ul>
            <dl class="space-y-2 text-sm border-t border-gray-100 dark:border-gray-800 pt-4">
              <div class="flex justify-between text-gray-600 dark:text-gray-400">
                <dt>Subtotal</dt>
                <dd class="font-medium">${{ subtotal.toFixed(2) }}</dd>
              </div>
              <div class="flex justify-between text-gray-600 dark:text-gray-400">
                <dt>Shipping</dt>
                <dd :class="{'text-green-600': shipping === 0, 'font-medium': true}">
                  {{ shipping === 0 ? 'FREE' : '$' + shipping.toFixed(2) }}
                </dd>
              </div>
              <div class="border-t border-gray-100 dark:border-gray-800 pt-2 flex justify-between text-base font-bold text-gray-900 dark:text-white">
                <dt>Total</dt>
                <dd>${{ total.toFixed(2) }} USD</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
