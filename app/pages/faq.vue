<!--app/pages/faq.vue-->
<script setup>
const faqs = [
  {
    q: 'How long will it take to receive my order?',
    a: 'Since our products are made-to-order, please allow 2-5 business days for production. Shipping within the US usually takes 3-7 business days, while international shipping can take 10-30 business days depending on location.'
  },
  {
    q: 'How can I track my order?',
    a: 'Once your order is shipped, you will receive a tracking link via email. You can also use our Track Order page with your Order Number and Email Address.'
  },
  {
    q: 'Do you accept returns or exchanges?',
    a: 'Because all items are custom-printed upon ordering, we do not accept returns for buyer’s remorse or incorrect size selection. However, if your item is defective, misprinted, or damaged in transit, we will replace it for free within 30 days.'
  },
  {
    q: 'Can I cancel or change my order?',
    a: 'You can cancel or modify your order within 12 hours of placing it. After 12 hours, the order goes into production and changes cannot be guaranteed.'
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We currently accept major credit cards (Visa, MasterCard, Amex) and PayPal via our secure checkout.'
  }
];

const openIndex = ref(0);
</script>

<template>
  <div class="bg-white dark:bg-[#111] pt-20 min-h-screen pb-20">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <h1 class="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h1>
      <p class="text-gray-500 dark:text-gray-400 mb-12">Can't find the answer you're looking for? <NuxtLink to="/contact" class="text-indigo-600 underline">Contact our support team</NuxtLink>.</p>
      
      <div class="space-y-4 text-left">
        <div v-for="(faq, index) in faqs" :key="index" class="border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-[#1a1a1a] overflow-hidden">
          <button @click="openIndex = openIndex === index ? -1 : index" class="w-full text-left px-6 py-5 flex justify-between items-center focus:outline-none">
            <span class="font-bold text-gray-900 dark:text-white text-lg">{{ faq.q }}</span>
            <svg class="w-6 h-6 transform transition-transform text-[#ea6a32]" :class="openIndex === index ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>
          <div v-show="openIndex === index" class="px-6 pb-5 text-gray-600 dark:text-gray-400 leading-relaxed text-[15px]">
            {{ faq.a }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
