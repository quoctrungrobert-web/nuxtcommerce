<script setup>
defineProps({
  products: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: 'Similar items'
  },
  enabled: {
    type: Boolean,
    default: true
  }
});
</script>

<template>
  <div v-if="enabled && products?.length" class="mt-12 w-full text-[#222] dark:text-[#e1e1e1]">
    <!-- Header -->
    <div class="flex justify-between items-end mb-4 px-2">
      <div class="flex items-center gap-2">
        <h2 class="text-xl font-bold font-serif">{{ title }}</h2>
        <span class="text-sm text-gray-500 font-normal flex items-center gap-1">
          Including ads
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </span>
      </div>
      <a href="#" class="text-sm font-semibold hover:underline flex items-center gap-1">
        See more
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
      </a>
    </div>

    <!-- Scrollable Horizontal Grid -->
    <div class="flex overflow-x-auto gap-4 pb-4 px-2 no-scrollbar" style="scrollbar-width: none;">
      <NuxtLink 
        v-for="(product, index) in products.slice(0, 8)" 
        :key="product._id || index"
        :to="`/product/${product._id}`" 
        class="flex flex-col group min-w-[150px] w-[150px] md:min-w-[180px] md:w-[180px] flex-shrink-0 cursor-pointer"
      >
        <!-- Image -->
        <div class="w-full aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 dark:bg-[#333] mb-2 border border-gray-200 dark:border-gray-700 relative">
          <NuxtImg v-if="product.img || product.image?.sourceUrl" :src="product.img || product.image?.sourceUrl" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          </div>
        </div>
        
        <!-- Info -->
        <div class="flex flex-col gap-0.5">
          <h3 class="text-[13px] leading-tight text-gray-700 dark:text-gray-300 truncate">{{ product.title || product.name }}</h3>
          
          <!-- Ad text mock (shows on every 2nd item) -->
          <span v-if="index % 2 === 0" class="text-[11px] text-gray-500">Ad by WanderPrints</span>
          
          <div class="flex items-center gap-1.5 mt-0.5">
            <span class="text-sm font-bold text-[#222] dark:text-[#fff]">${{ product.price?.toFixed(2) }}</span>
            <span v-if="product.oldPrice || product.regularPrice" class="text-[11px] text-gray-500 line-through">
              ${{ (product.oldPrice || product.regularPrice)?.toFixed(2) }}
            </span>
          </div>
          
          <!-- Low stock mock -->
          <span v-if="index === 2" class="text-[11px] text-red-600 dark:text-red-400 mt-0.5 leading-tight">
            Only 2 available and it's in more than 20 people's carts
          </span>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
