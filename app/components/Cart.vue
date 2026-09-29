<!--app/components/Cart.vue-->
<script setup>
const { cart, increment, decrement } = useCart();
const { order } = useCheckout();
const promoCode = ref('');
const discount = ref(null);
const promoError = ref('');

const applyPromo = async () => {
  promoError.value = '';
  try {
    const res = await fetch('/api/checkout/apply-discount', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: promoCode.value })
    });
    const data = await res.json();
    if (res.ok) {
      discount.value = data;
    } else {
      promoError.value = data.error || 'Invalid code';
      discount.value = null;
    }
  } catch (e) {
    promoError.value = 'Failed to apply';
  }
};

const subtotal = computed(() => cart.value.reduce((s, i) => s + i.price * i.quantity, 0));
const total = computed(() => {
  let t = subtotal.value / 100;
  if (discount.value) {
    if (discount.value.type === 'PERCENTAGE') t = t - (t * (discount.value.value / 100));
    else if (discount.value.type === 'FIXED_AMOUNT') t = t - discount.value.value;
  }
  return Math.max(t, 0).toFixed(2);
});
</script>

<template>
  <div class="fixed inset-0 z-[100] flex justify-end" @click.self="$emit('close')">
    <div class="absolute inset-0 bg-black/40 dark:bg-black/60 transition-opacity" @click="$emit('close')"></div>
    <div class="relative w-full max-w-[420px] bg-white dark:bg-[#121212] h-[100dvh] flex flex-col shadow-2xl z-10 slide-in-right">
      <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Your Cart <span v-if="cart.length">({{ cart.length }})</span></h2>
        <button @click="$emit('close')" class="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
          <UIcon name="i-iconamoon-close-light" size="24" class="text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      <div class="bg-gray-100 dark:bg-white/5 py-2 px-4 text-center border-b border-gray-200 dark:border-white/10">
        <p class="text-[13px] font-medium text-gray-800 dark:text-gray-300">More you spend the more gifts you get.</p>
        <div class="mt-3 relative h-1.5 bg-gray-300 dark:bg-white/10 rounded-full overflow-hidden w-[90%] mx-auto">
          <div class="absolute left-0 top-0 bottom-0 bg-black dark:bg-white w-[60%] rounded-full"></div>
        </div>
        <p class="text-[11px] text-gray-600 dark:text-gray-400 mt-2 font-medium">You're $6.87 away from free shipping! 🚚</p>
      </div>

      <Transition name="fade" mode="out-in">
        <PaymentSuccessful v-if="order?.orderNumber && !cart.length" />
        <div v-else-if="cart.length" class="flex-1 overflow-auto p-4 flex flex-col gap-4">
          <div v-for="product in cart.slice().reverse()" :key="product.key" class="flex gap-4 py-4 border-b border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a1a1a]">
            <NuxtImg :src="product.image || '/placeholder.png'" class="w-20 h-24 object-cover rounded-md border border-gray-100 dark:border-white/5" />
            <div class="flex-1 flex flex-col">
              <div class="flex justify-between items-start gap-2">
                <div class="font-semibold text-sm text-gray-800 dark:text-gray-100 line-clamp-2 leading-snug">{{ product.title }}</div>
                <UIcon @click="decrement(product.key)" name="i-iconamoon-trash-light" size="18" class="text-gray-400 hover:text-red-500 cursor-pointer flex-shrink-0 transition-colors" v-if="product.quantity === 1" />
              </div>
              <div class="text-[12px] text-gray-500 dark:text-gray-400 mt-1">{{ product.variantTitle }}</div>
              
              <div class="mt-auto flex items-end justify-between pt-3">
                <div class="flex items-center border border-gray-300 dark:border-white/20 rounded-md h-8">
                  <button @click="decrement(product.key)" class="w-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-colors">
                    <UIcon size="12" name="i-iconamoon-sign-minus" />
                  </button>
                  <span class="w-6 text-center text-xs font-semibold text-gray-800 dark:text-gray-100">{{ product.quantity }}</span>
                  <button @click="increment(product.key)" class="w-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-colors">
                    <UIcon size="12" name="i-iconamoon-sign-plus" />
                  </button>
                </div>
                <div class="font-bold text-sm text-gray-900 dark:text-gray-100">${{ (product.price / 100).toFixed(2) }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <EmptyCart v-else />
      </Transition>

      <div v-if="cart.length && !order?.orderNumber" class="p-5 bg-white dark:bg-[#121212] border-t border-gray-200 dark:border-white/10 mt-auto">
        <div class="mb-4">
          <div class="text-sm font-semibold mb-2">Discount code ^</div>
          <div class="flex gap-2">
            <input v-model="promoCode" @keyup.enter="applyPromo" type="text" placeholder="Enter code" class="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-sm outline-none focus:border-black dark:focus:border-white transition-colors" />
            <button @click="applyPromo" class="bg-gray-900 dark:bg-white/90 text-white dark:text-black px-5 py-2 rounded-lg text-sm font-semibold hover:opacity-80 transition-opacity">Apply</button>
          </div>
          <div v-if="promoError" class="text-red-500 text-xs mt-1.5">{{ promoError }}</div>
          <div v-if="discount" class="text-green-600 dark:text-green-400 text-xs mt-1.5 font-medium flex items-center gap-1">
            <UIcon name="i-iconamoon-check-circle-1" size="14" />
            Discount applied: {{ discount.type === 'PERCENTAGE' ? discount.value + '%' : '$' + discount.value }} off
          </div>
        </div>

        <div class="flex justify-between items-center mb-1 text-sm text-gray-600 dark:text-gray-400">
          <span>Subtotal</span>
          <span class="font-medium line-through" v-if="discount">${{ (subtotal / 100).toFixed(2) }}</span>
          <span class="font-medium" v-else>${{ (subtotal / 100).toFixed(2) }}</span>
        </div>
        
        <div class="flex justify-between items-end mb-4">
          <span class="font-bold text-gray-900 dark:text-gray-100 text-lg">Total</span>
          <span class="text-xl font-bold text-gray-900 dark:text-white">${{ total }}</span>
        </div>

        <NuxtLink to="/checkout" @click="$emit('close')" class="w-full h-12 bg-black dark:bg-white rounded-lg font-bold text-white dark:text-black text-base flex justify-center items-center hover:scale-[1.02] transition-transform shadow-xl gap-2">
          <UIcon name="i-iconamoon-lock-light" size="18" /> Checkout • ${{ total }}
        </NuxtLink>
        <div class="flex justify-center items-center flex-wrap gap-2 mt-4 opacity-80 text-[11px] text-gray-500 dark:text-gray-400">
           <UIcon name="i-iconamoon-lock-light" size="14" /> Secure payment &nbsp;&nbsp; 🚀 Fast delivery &nbsp;&nbsp; 🕒 90 Day Money Back Guarantee
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="postcss">
.cart-button-bezel {
  box-shadow: inset 0 -1px 1px 0 rgba(0, 0, 0, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.05);
}
.pay-button-bezel {
  box-shadow: 0 0 0 var(--button-outline, 0px) rgba(92, 222, 131, 0.3), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.25), inset 0 1px 0 0 rgba(255, 255, 255, 0.3),
    0 1px 1px 0 rgba(0, 0, 0, 0.3);
  @apply bg-[#23a26d] dark:bg-[#40d195] outline-none tracking-[-0.125px] transition scale-[var(--button-scale,1)] duration-200;
}
.pay-button-bezel:hover {
  @apply brightness-110;
}
.pay-button-bezel:active {
  --button-outline: 4px;
  --button-scale: 0.975;
}
</style>
