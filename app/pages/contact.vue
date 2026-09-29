<!--app/pages/contact.vue-->
<script setup>
const submitted = ref(false);
const form = ref({ name: '', email: '', subject: '', message: '' });

const config = useRuntimeConfig();
const isSubmitting = ref(false);

const handleSubmit = async () => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;
  try {
    await $fetch(`${config.public.backendUrl}/api/contact/submit`, {
      method: 'POST',
      body: form.value
    });
    submitted.value = true;
  } catch (error) {
    alert(error.response?._data?.error || 'Failed to send message. Please try again later.');
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="bg-white dark:bg-[#111] pt-20 min-h-screen">
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <h1 class="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">Contact Us</h1>
      <p class="text-gray-500 dark:text-gray-400 mb-2">We typically respond within 1 business day.</p>
      <a href="mailto:support@caros.services" class="text-black dark:text-white font-semibold text-sm underline">
        support@caros.services
      </a>

      <div class="mt-10">
        <div v-if="submitted" class="rounded-xl bg-green-50 border border-green-200 p-8 text-center">
          <p class="text-2xl font-bold text-green-800 mb-2">Message Sent!</p>
          <p class="text-green-700 text-sm">Thank you for reaching out. We will get back to you within 1 business day.</p>
        </div>
        <form v-else @submit.prevent="handleSubmit" class="space-y-5">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input type="text" v-model="form.name" required class="block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-black focus:border-black sm:text-sm py-3 px-4 outline-none transition dark:bg-[#222] dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
              <input type="email" v-model="form.email" required class="block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-black focus:border-black sm:text-sm py-3 px-4 outline-none transition dark:bg-[#222] dark:border-gray-600 dark:text-white" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Subject</label>
            <select v-model="form.subject" class="block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-black focus:border-black sm:text-sm py-3 px-4 outline-none transition dark:bg-[#222] dark:border-gray-600 dark:text-white">
              <option value="">Select a topic...</option>
              <option value="order">Order Status</option>
              <option value="return">Return / Refund</option>
              <option value="product">Product Question</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Message</label>
            <textarea v-model="form.message" rows="5" required placeholder="Describe your issue or question in detail..." class="block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-black focus:border-black sm:text-sm py-3 px-4 outline-none transition dark:bg-[#222] dark:border-gray-600 dark:text-white resize-none"></textarea>
          </div>
          <button type="submit" class="w-full py-4 mt-2 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-base hover:scale-[1.02] transition shadow-md flex items-center justify-center gap-2">
            Send Message
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
