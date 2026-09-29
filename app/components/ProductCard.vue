<script setup>
defineProps({
  products: Object,
});
</script>

<template>
  <article v-for="product in products" :key="product._id || product.id" class="flex flex-col">
    <NuxtLink :to="`/product/${product.slug || product._id}`" class="group select-none flex flex-col h-full">
      <div class="cursor-pointer transition ease-in-out duration-300 flex flex-col h-full">
        <!-- Image Container (Square aspect ratio) -->
        <div class="relative w-full aspect-square rounded-[10px] overflow-hidden">
          <img
            v-if="product.img || product.images?.[0]"
            :alt="product.title"
            loading="lazy"
            :src="product.img || product.images?.[0]"
            class="w-full h-full object-cover block bg-neutral-100 transition-transform duration-300 group-hover:scale-105" />
          <div v-else class="w-full h-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
            <svg class="w-12 h-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          </div>
          
          <!-- Bestseller Badge -->
          <div class="absolute top-2.5 left-2.5 px-3 py-[3px] text-[11px] font-bold rounded-[20px] bg-[#fff3cd] text-[#856404] shadow-sm z-10 leading-normal">
            Bestseller
          </div>
        </div>

        <!-- Product Info -->
        <div class="flex flex-col flex-grow mt-2">
          <div class="text-[15px] lg:text-[16px] font-normal text-[#111] dark:text-[#eee] line-clamp-2 leading-[1.35] pr-2 mb-1.5">
            {{ product.title }}
          </div>
          <div class="flex items-center gap-1 text-[13px] text-gray-600 dark:text-gray-400 mb-1">
            <span class="font-medium text-[#111] dark:text-[#eee]">4.8</span>
            <span class="text-[#ea6a32] flex items-center">
               <svg class="w-[13px] h-[13px] fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
            </span>
            <span class="text-gray-500 opacity-80">(100+)</span>
          </div>
          <div class="text-[18px] font-semibold text-[#111] dark:text-[#fff] tracking-tight mt-1">
            ${{ product.price?.toFixed(2) || '0.00' }} USD
          </div>
        </div>
      </div>
    </NuxtLink>
  </article>
</template>
