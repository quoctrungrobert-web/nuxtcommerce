<script setup>
const collections = [
  { name: 'Halloween', path: '/categories' },
  { name: 'Occasions', path: '/categories' },
  { name: 'Recipients', path: '/categories' },
  { name: 'Hobbies', path: '/categories' },
  { name: 'Clothing & Jewelry', path: '/categories' },
  { name: 'Home & Kitchen', path: '/categories' },
  { name: 'Drinkware & Barware', path: '/categories' },
  { name: 'Accessories', path: '/categories' },
  { name: 'Best Sellers', path: '/categories' },
  { name: 'New Arrivals', path: '/categories' },
];

const navSlider = ref(null);
const isDragging = ref(false);
const dragThreshold = 5;
let startX, scrollLeft;

const initializeDrag = e => {
  isDragging.value = false;
  startX = e.pageX - navSlider.value.getBoundingClientRect().left;
  scrollLeft = navSlider.value.scrollLeft;
  document.addEventListener('mousemove', handleDragging);
  document.addEventListener('mouseup', endDrag);
};

const handleDragging = e => {
  const xPos = e.pageX - navSlider.value.getBoundingClientRect().left;
  const walk = (xPos - startX) * 1.5;
  navSlider.value.scrollLeft = scrollLeft - walk;
  isDragging.value = Math.abs(walk) > dragThreshold;
};

const endDrag = () => {
  document.removeEventListener('mousemove', handleDragging);
  document.removeEventListener('mouseup', endDrag);
};

onMounted(() => {
  navSlider.value.addEventListener('mousedown', initializeDrag);
});

onBeforeUnmount(() => {
  document.removeEventListener('mousemove', handleDragging);
  document.removeEventListener('mouseup', endDrag);
});
</script>

<template>
  <div class="w-full bg-white dark:bg-[#121212] fixed top-[72px] lg:top-20 z-30 h-12 flex items-center px-3 lg:px-5">
    <div
      ref="navSlider"
      class="w-full overflow-x-auto hide-scrollbar cursor-grab active:cursor-grabbing select-none h-full flex items-center"
      style="-ms-overflow-style: none; scrollbar-width: none;"
    >
      <div class="flex items-center gap-6 md:gap-8 lg:mx-auto w-max px-2">
        <NuxtLink
          v-for="col in collections"
          :key="col.name"
          :to="col.path"
          @click.prevent="isDragging ? null : $router.push(col.path)"
          class="text-[14px] md:text-[15px] font-medium text-gray-800 dark:text-gray-200 hover:text-black dark:hover:text-white transition-colors whitespace-nowrap min-w-max py-2">
          {{ col.name }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
