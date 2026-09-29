<!--app/components/AppHeader.vue-->
<script setup>
const router = useRouter();
const route = useRoute();
const searchQuery = ref((route.query.q || '').toString());
const searchResults = ref([]);
const isLoading = ref(false);
const suggestionMenu = ref(false);
const onClickOutsideRef = ref(null);
const cartModal = ref(false);
const { cart } = useCart();
const localePath = useLocalePath();

const backendUrl = useRuntimeConfig().public.backendUrl || 'http://localhost:4000';
const { data: currenciesData } = await useAsyncData('currencies', () =>
  $fetch(`${backendUrl}/api/currencies`).catch(() => ({ data: [{ code: 'USD', symbol: '$', icon: 'i-circle-flags:us' }] }))
);
const currenciesList = computed(() => currenciesData.value?.data || [{ code: 'USD', symbol: '$', icon: 'i-circle-flags:us' }]);
const currentCurrencyCode = useCookie('currency', { default: () => 'USD' });
const currentCurrency = computed(() => currenciesList.value.find(c => c.code === currentCurrencyCode.value) || currenciesList.value[0]);
const isCurrencyMenuOpen = ref(false);

const search = () => {
  router.push({ path: localePath('/'), query: { ...route.query, q: searchQuery.value || undefined } });
  suggestionMenu.value = false;
};

async function fetch() {
  try {
    const config = useRuntimeConfig();
    const response = await $fetch(`${config.public.backendUrl}/api/products`, {
      query: { q: searchQuery.value },
    });
    searchResults.value = response.data || [];
  } finally {
    isLoading.value = false;
  }
}

onMounted(fetch);

const throttledFetch = useDebounceFn(async () => {
  await fetch();
}, 300);

watch(
  () => searchQuery.value,
  () => {
    isLoading.value = true;
    throttledFetch();
  }
);

watch(
  () => route.path,
  () => {
    cartModal.value = false;
    suggestionMenu.value = false;
  }
);

const clearSearch = () => {
  suggestionMenu.value = false;
  searchQuery.value = '';
  router.push({ query: { ...route.query, q: undefined } });
};

onClickOutside(onClickOutsideRef, event => {
  suggestionMenu.value = false;
  cartModal.value = false;
});

const totalQuantity = computed(() => cart.value.reduce((s, i) => s + (i.quantity || 0), 0));
</script>

<template>
  <div class="flex w-full flex-row items-center px-3 lg:px-5 h-[72px] lg:h-20 z-40 fixed bg-white dark:bg-[#121212]">
    <div class="flex flex-row w-full flex-nowrap items-center gap-2">


      <div class="flex-1 lg:flex-none flex items-center justify-start">
        <NuxtLink
          aria-label="Home"
          class="flex items-center justify-start hover:opacity-80 transition active:scale-95 lg:pr-4 flex-shrink-0"
          :to="localePath('/')">
          <img class="h-10 md:h-12 w-auto dark:invert dark:brightness-200 dark:contrast-150 -mt-1 md:-mt-1.5 max-w-[160px] sm:max-w-[200px] md:max-w-none object-contain" src="https://wanderprints.com/cdn/shop/files/Logo-SVG-01.svg?v=1787801129" alt="WanderPrints Logo" loading="lazy" title="logo" />
        </NuxtLink>
      </div>

      <div class="flex-shrink-0 flex-col text-sm font-semibold text-[#111] dark:text-[#eee] transition-all flex w-[160px] sm:w-[200px] lg:flex-grow lg:w-auto mx-1 md:mx-6 mt-1 lg:mt-0">
        <div
          class="flex h-[38px] lg:h-[48px] items-center flex-grow rounded-full pl-3 lg:pl-5 pr-1 lg:pr-2 transition-all border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#1a1a1a] focus-within:border-black dark:focus-within:border-white focus-within:shadow-sm">
          <div @click="suggestionMenu = true" class="flex w-full items-center gap-1 lg:gap-2 h-full">
            <input
              id="search-input"
              class="w-full bg-transparent h-full outline-none placeholder:text-gray-500 placeholder:dark:text-gray-400 font-medium text-[13px] lg:text-[15px]"
              type="text"
              v-model="searchQuery"
              @keyup.enter="search"
              placeholder="Search..." />
            
            <div v-if="searchQuery" @click.stop="clearSearch" class="flex items-center justify-center cursor-pointer transition-all p-0.5 lg:p-1">
              <UIcon v-if="!isLoading" class="text-gray-400 hover:text-black dark:hover:text-white" name="i-iconamoon-close-light" size="18" />
              <UIcon v-else name="i-svg-spinners-bars-rotate-fade" size="16" />
            </div>
            
            <button @click="search" class="w-[30px] h-[30px] lg:w-10 lg:h-10 rounded-full bg-[#ea6a32] flex items-center justify-center flex-shrink-0 hover:bg-[#d65d2a] transition-colors text-white">
              <UIcon name="i-iconamoon-search-light" size="16" class="lg:w-[18px] lg:h-[18px]" />
            </button>
          </div>
        </div>
      </div>
      <!-- Currency Dropdown -->
      <div class="relative lg:flex hidden items-center flex-shrink-0 ml-2">
        <button @click.stop="isCurrencyMenuOpen = !isCurrencyMenuOpen" class="font-semibold cursor-pointer px-3 rounded-full hover:bg-black/5 hover:dark:bg-white/10 h-[44px] items-center justify-center text-black dark:text-white transition active:scale-95 flex gap-2 whitespace-nowrap">
          <UIcon :name="currentCurrency.icon" size="20" />
          {{ currentCurrency.symbol }} {{ currentCurrency.code }}
          <UIcon name="i-iconamoon-arrow-down-2-light" size="16" class="text-gray-500" />
        </button>
        <div v-if="isCurrencyMenuOpen" class="absolute top-[calc(100%+8px)] right-0 w-[180px] bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden py-2">
          <div v-for="currency in currenciesList" :key="currency.code"
            @click="currentCurrencyCode = currency.code; isCurrencyMenuOpen = false"
            class="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-black/5 hover:dark:bg-white/10 transition-colors">
            <UIcon :name="currency.icon" size="20" />
            <span class="font-medium text-[15px] text-black dark:text-white">{{ currency.symbol }} {{ currency.code }}</span>
          </div>
        </div>
      </div>
      
      <div class="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <NuxtLink
          aria-label="Track Order"
          class="font-semibold cursor-pointer px-3 rounded-full hover:bg-black/5 hover:dark:bg-white/10 h-[44px] items-center justify-center text-black dark:text-white transition active:scale-95 lg:flex hidden gap-2 whitespace-nowrap"
          :to="localePath('/track-order')">
          <UIcon name="i-iconamoon-delivery-fast-light" size="24" />
          Track Order
        </NuxtLink>
        <NuxtLink
          aria-label="Account"
          class="cursor-pointer w-[36px] sm:w-[44px] h-[36px] sm:h-[44px] flex items-center justify-center rounded-full hover:bg-black/5 hover:dark:bg-white/10 text-black dark:text-white transition active:scale-95 flex"
          :to="localePath('/account')">
          <UIcon name="i-iconamoon-profile-light" size="24" class="sm:w-[26px] sm:h-[26px]" />
        </NuxtLink>
        <NuxtLink
          aria-label="Favorites"
          class="cursor-pointer w-[44px] h-[44px] flex items-center justify-center rounded-full hover:bg-black/5 hover:dark:bg-white/10 text-black dark:text-white transition active:scale-95 hidden sm:flex"
          :to="localePath('/favorites')">
          <UIcon name="i-iconamoon-heart-light" size="26" />
        </NuxtLink>
        <button
          @mouseup="cartModal = !cartModal"
          class="cursor-pointer w-[36px] sm:w-[44px] h-[36px] sm:h-[44px] flex items-center justify-center rounded-full hover:bg-black/5 hover:dark:bg-white/10 text-black dark:text-white transition active:scale-95 relative">
          <UIcon name="i-iconamoon-shopping-bag-light" size="24" class="sm:w-[26px] sm:h-[26px]" />
          <span v-if="totalQuantity" class="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 flex h-[16px] w-[16px] sm:h-[18px] sm:w-[18px]">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-alizarin-crimson-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-[16px] w-[16px] sm:h-[18px] sm:w-[18px] bg-alizarin-crimson-700 text-[9px] sm:text-[10px] items-center justify-center shadow font-semibold text-white">
              {{ totalQuantity }}
            </span>
          </span>
        </button>
      </div>
    </div>
  </div>
  <div
    v-if="suggestionMenu"
    ref="onClickOutsideRef"
    class="fixed top-[72px] lg:top-20 left-0 right-0 z-50 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-lg w-full">
    <div class="max-h-[calc(100vh-72px)] lg:max-h-[calc(100vh-80px)] overflow-auto">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center h-80">
        <div class="bg-black/10 dark:bg-white/20 flex rounded-full w-12 h-12 items-center justify-center skeleton">
          <UIcon class="text-white dark:text-black" name="i-svg-spinners-8-dots-rotate" size="26" />
        </div>
      </div>
      <!-- Empty State -->
      <div v-else-if="!searchResults.length" class="w-full items-center flex flex-col justify-center text-center p-8">
        <div class="w-28 h-28 bg-black/10 dark:bg-white/20 rounded-full items-center justify-center flex">
          <UIcon name="i-iconamoon-search-bold" class="w-16 h-16 dark:text-white" />
        </div>
        <div class="font-semibold text-3xl my-6">
          {{ $t('search.no_results_for_query') }}
          <strong>{{ searchQuery }}</strong>
        </div>
        <div class="text-sm text-center mb-5 max-w-md">
          {{ $t('search.no_results_suggestion') }}
        </div>
      </div>
      <!-- Results State-->
      <div v-else class="mx-auto p-3 lg:p-4 max-w-screen-2xl">
        <h2 v-if="!searchQuery" class="text-2xl font-bold tracking-tight">{{ $t('search.new_products') }}</h2>
        <div class="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 lg:gap-5 mt-3 lg:mt-5">
          <NuxtLink
            @click="suggestionMenu = false"
            :to="localePath(`/product/${product.slug}`)"
            v-for="(product, i) in searchResults"
            :key="i"
            class="group select-none">
            <div class="cursor-pointer transition ease-[ease] duration-300">
              <div class="relative pb-[133%] dark:shadow-[0_8px_24px_rgba(0,0,0,.5)] rounded-2xl overflow-hidden">
                <NuxtImg
                  :alt="product.name"
                  loading="lazy"
                  :title="product.name"
                  :src="product.mainImage || '/placeholder.png'"
                  class="absolute h-full w-full dark:bg-neutral-800 bg-neutral-200 object-cover" />
                <NuxtImg
                  :alt="product.name"
                  loading="lazy"
                  :title="product.name"
                  :src="product.mainImage || '/placeholder.png'"
                  class="absolute h-full w-full dark:bg-neutral-800 bg-neutral-200 object-cover transition-opacity duration-300 group-hover:opacity-0" />
              </div>
              <div class="grid gap-0.5 pt-3 pb-4 px-1.5 text-sm font-semibold">
                <span class="text-green-700 dark:text-[#a1e6b3] font-bold">${{ product.price }}</span>
                <div>{{ product.name }}</div>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
      <div v-if="searchQuery && !isLoading && searchResults.length" class="flex items-center justify-center border-t border-black/10 dark:border-white/20 p-4">
        <button
          @click="search"
          class="bg-black/15 dark:bg-white/15 hover:bg-black/10 hover:dark:bg-white/20 px-4 py-2 rounded-full active:scale-95 tracking-wide text-sm transition">
          {{ $t('search.view_all_results') }}
        </button>
      </div>
    </div>
  </div>
  <div v-if="suggestionMenu || cartModal" :class="['fixed inset-0 ', cartModal ? 'z-40' : 'z-30']">
    <div class="w-full h-full bg-black/30 backdrop-blur-lg"></div>
  </div>
  <Transition name="slide-in-right">
    <Cart v-if="cartModal" ref="onClickOutsideRef" @close="cartModal = false" />
  </Transition>
</template>

<style lang="postcss">
::-webkit-scrollbar {
  @apply w-0 h-0 bg-transparent;
}
::-webkit-scrollbar-track {
  @apply bg-transparent;
}
::-webkit-scrollbar-thumb {
  @apply bg-black/15 dark:bg-white/15 rounded-full border-solid border-white dark:border-black;
  border-width: 5px;
}
</style>
