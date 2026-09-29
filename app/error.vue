<!--app/error.vue-->
<script setup>
const props = defineProps({
  error: Object
});
const router = useRouter();
const handleError = () => clearError({ redirect: '/' });
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-[#111] flex flex-col items-center justify-center px-4 text-center">
    <div class="max-w-md w-full">
      <h1 class="text-9xl font-black text-[#ea6a32] tracking-tight mb-2">{{ error?.statusCode || 404 }}</h1>
      <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        {{ error?.statusCode === 404 ? 'Page Not Found' : 'An Error Occurred' }}
      </h2>
      <p class="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
        We can't seem to find the page you're looking for. It might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <button @click="handleError" class="py-3 px-8 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold hover:scale-105 transition shadow-lg">
          Back to Home
        </button>
        <button @click="router.back()" class="py-3 px-8 rounded-full border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-[#222] transition">
          Go Back
        </button>
      </div>
      
      <!-- Recommended Products Teaser -->
      <div class="mt-16 pt-8 border-t border-gray-100 dark:border-gray-800">
         <p class="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">While you're here</p>
         <NuxtLink to="/?category=apparel" class="text-[#ea6a32] hover:underline font-bold text-lg block">Browse our latest collection →</NuxtLink>
      </div>
    </div>
  </div>
</template>
