<script setup>
defineProps({
  relatedProducts: {
    type: Array,
    default: () => []
  }
});

const mockSearches = [
  "Realistic Bug Wings Costume Cheap", "Bumble Bee Wings", "Cicada Wings", 
  "The Bee Movie", "Bee Wings", "Bee Wings Adult", 
  "Dark Fairy Wings", "Bug Wings", "Fairy Wings", 
  "Wings", "Womens Bee Costume", "Motorized Wings"
];

const mockTags = [
  "Mswings", "Moth Wings Kids", "Beebwings", "Under the Corset Wings",
  "Kids Bug Wings", "Fairy or Insect Wings", "Bee Wings Women", "Light up Wings Small",
  "Bug Wings for Teddy Bears", "Bee Wings Cute", "Ladybug Wings Women"
];
</script>

<template>
  <div class="mt-12 lg:mt-16 w-full text-[#222] dark:text-[#e1e1e1]">
    
    <!-- Explore related searches with images -->
    <h2 class="text-2xl font-bold font-serif mb-4">Explore related searches</h2>
    
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 mb-8">
      <a 
        href="#" 
        v-for="(text, index) in mockSearches" 
        :key="index"
        class="flex items-center gap-3 border border-gray-300 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-md transition bg-white dark:bg-[#222]"
      >
        <div class="w-14 h-14 flex-shrink-0 bg-gray-200 dark:bg-[#333]">
           <NuxtImg v-if="relatedProducts?.[index]?.img || relatedProducts?.[index]?.image?.sourceUrl" :src="relatedProducts[index].img || relatedProducts[index].image?.sourceUrl" class="w-full h-full object-cover" />
           <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
             <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
           </div>
        </div>
        <span class="text-sm font-semibold pr-2 leading-tight">{{ text }}</span>
      </a>
    </div>

    <!-- Explore more related searches (pill tags) -->
    <h2 class="text-2xl font-bold font-serif mb-4 mt-10">Explore more related searches</h2>
    <div class="flex flex-wrap gap-2.5 mb-8">
      <a 
        href="#" 
        v-for="(tag, index) in mockTags" 
        :key="index"
        class="bg-[#f1f1f1] hover:bg-[#e4e4e4] dark:bg-[#333] dark:hover:bg-[#444] px-4 py-2.5 rounded-full text-sm font-bold text-gray-800 dark:text-gray-200 transition"
      >
        {{ tag }}
      </a>
    </div>

    <!-- Meta Info -->
    <div class="text-sm text-gray-600 dark:text-gray-400 mt-10">
      <span>Listed on Sep 28, 2026</span>
      <span class="mx-2">•</span>
      <a href="#" class="underline hover:no-underline">749 favorites</a>
    </div>

    <!-- Breadcrumbs -->
    <div class="text-sm text-gray-600 dark:text-gray-400 mt-4 mb-8">
      <a href="#" class="underline hover:no-underline">Homepage</a>
      <span class="mx-1">›</span>
      <a href="#" class="underline hover:no-underline">Accessories</a>
      <span class="mx-1">›</span>
      <a href="#" class="underline hover:no-underline">Costume Accessories</a>
      <span class="mx-1">›</span>
      <a href="#" class="underline hover:no-underline font-semibold text-gray-900 dark:text-gray-200">Wings</a>
    </div>

  </div>
</template>
