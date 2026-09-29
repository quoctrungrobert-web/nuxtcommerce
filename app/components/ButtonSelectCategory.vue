<!--app/components/ButtonSelectCategory.vue-->
<script setup>
const categoriesData = ref([
  { id: 1, name: 'T-shirts', image: { sourceUrl: 'https://picsum.photos/40/40?random=1' } },
  { id: 2, name: 'Blouses & Shirts', image: { sourceUrl: 'https://picsum.photos/40/40?random=2' } },
  { id: 3, name: 'Pants', image: { sourceUrl: 'https://picsum.photos/40/40?random=3' } },
  { id: 4, name: 'Sweatshirts & Hoodies', image: { sourceUrl: 'https://picsum.photos/40/40?random=4' } },
  { id: 5, name: 'Jeans', image: { sourceUrl: 'https://picsum.photos/40/40?random=5' } },
  { id: 6, name: 'Dresses', image: { sourceUrl: 'https://picsum.photos/40/40?random=6' } },
  { id: 7, name: 'Vests', image: { sourceUrl: 'https://picsum.photos/40/40?random=7' } },
  { id: 8, name: 'Shorts', image: { sourceUrl: 'https://picsum.photos/40/40?random=8' } },
  { id: 9, name: 'Tops', image: { sourceUrl: 'https://picsum.photos/40/40?random=9' } },
  { id: 10, name: 'Jackets', image: { sourceUrl: 'https://picsum.photos/40/40?random=10' } },
  { id: 11, name: 'Jumpsuits', image: { sourceUrl: 'https://picsum.photos/40/40?random=11' } },
  { id: 12, name: 'Swimwear', image: { sourceUrl: 'https://picsum.photos/40/40?random=12' } },
  { id: 13, name: 'Skirts', image: { sourceUrl: 'https://picsum.photos/40/40?random=13' } }
]);

const categories = computed(() => categoriesData.value);
</script>

<template>
  <div class="slider-container ml-2 lg:ml-4 gap-2 lg:gap-4" v-if="!categories.length">
    <div class="h-[50px] min-w-36 bg-neutral-200 dark:bg-neutral-800 rounded-full skeleton"></div>
    <div class="h-[50px] relative min-w-36 bg-neutral-200 dark:bg-neutral-800 rounded-full skeleton items-center flex">
      <div class="w-[38px] h-[38px] absolute rounded-full bg-neutral-300/50 dark:bg-neutral-900/40 left-2"></div>
    </div>
    <div class="h-[50px] relative min-w-32 bg-neutral-200 dark:bg-neutral-800 rounded-full skeleton items-center flex">
      <div class="w-[38px] h-[38px] absolute rounded-full bg-neutral-300/50 dark:bg-neutral-900/40 left-2"></div>
    </div>
    <div class="h-[50px] relative min-w-48 bg-neutral-200 dark:bg-neutral-800 rounded-full skeleton items-center flex">
      <div class="w-[38px] h-[38px] absolute rounded-full bg-neutral-300/50 dark:bg-neutral-900/40 left-2"></div>
    </div>
    <div class="h-[50px] relative min-w-32 bg-neutral-200 dark:bg-neutral-800 rounded-full skeleton items-center flex">
      <div class="w-[38px] h-[38px] absolute rounded-full bg-neutral-300/50 dark:bg-neutral-900/40 left-2"></div>
    </div>
    <div class="h-[50px] relative min-w-60 bg-neutral-200 dark:bg-neutral-800 rounded-full skeleton items-center flex">
      <div class="w-[38px] h-[38px] absolute rounded-full bg-neutral-300/50 dark:bg-neutral-900/40 left-2"></div>
    </div>
    <div class="h-[50px] relative min-w-32 bg-neutral-200 dark:bg-neutral-800 rounded-full skeleton items-center flex">
      <div class="w-[38px] h-[38px] absolute rounded-full bg-neutral-300/50 dark:bg-neutral-900/40 left-2"></div>
    </div>
    <div class="h-[50px] relative min-w-36 bg-neutral-200 dark:bg-neutral-800 rounded-full skeleton items-center flex">
      <div class="w-[38px] h-[38px] absolute rounded-full bg-neutral-300/50 dark:bg-neutral-900/40 left-2"></div>
    </div>
    <div class="h-[50px] relative min-w-32 bg-neutral-200 dark:bg-neutral-800 rounded-full skeleton items-center flex">
      <div class="w-[38px] h-[38px] absolute rounded-full bg-neutral-300/50 dark:bg-neutral-900/40 left-2"></div>
    </div>
    <div class="h-[50px] relative min-w-32 bg-neutral-200 dark:bg-neutral-800 rounded-full skeleton items-center flex">
      <div class="w-[38px] h-[38px] absolute rounded-full bg-neutral-300/50 dark:bg-neutral-900/40 left-2"></div>
    </div>
    <div class="h-[50px] relative min-w-28 bg-neutral-200 dark:bg-neutral-800 rounded-full skeleton items-center flex">
      <div class="w-[38px] h-[38px] absolute rounded-full bg-neutral-300/50 dark:bg-neutral-900/40 left-2"></div>
    </div>
    <div class="h-[50px] relative min-w-32 bg-neutral-200 dark:bg-neutral-800 rounded-full skeleton items-center flex">
      <div class="w-[38px] h-[38px] absolute rounded-full bg-neutral-300/50 dark:bg-neutral-900/40 left-2"></div>
    </div>
    <div class="h-[50px] relative min-w-40 bg-neutral-200 dark:bg-neutral-800 rounded-full skeleton items-center flex">
      <div class="w-[38px] h-[38px] absolute rounded-full bg-neutral-300/50 dark:bg-neutral-900/40 left-2"></div>
    </div>
    <div class="h-[50px] relative min-w-32 bg-neutral-200 dark:bg-neutral-800 rounded-full skeleton items-center flex">
      <div class="w-[38px] h-[38px] absolute rounded-full bg-neutral-300/50 dark:bg-neutral-900/40 left-2"></div>
    </div>
    <div class="h-[50px] relative min-w-44 bg-neutral-200 dark:bg-neutral-800 rounded-full skeleton items-center flex">
      <div class="w-[38px] h-[38px] absolute rounded-full bg-neutral-300/50 dark:bg-neutral-900/40 left-2"></div>
    </div>
  </div>
  <CarouselCategories v-else :categories="categories" />
</template>
