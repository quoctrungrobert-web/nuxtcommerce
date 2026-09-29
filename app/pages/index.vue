<!--app/pages/index.vue-->
<script setup>
const route = useRoute();
const { name } = useAppConfig().site;
const url = useRequestURL();
const runtimeConfig = useRuntimeConfig();
const BACKEND = runtimeConfig.public.backendUrl;

const canonical = computed(() => {
  const base = `${url.origin}${url.pathname}`;
  const params = new URLSearchParams();
  if (typeof route.query.q === 'string' && route.query.q) params.set('q', route.query.q);
  if (typeof route.query.category === 'string' && route.query.category) params.set('category', route.query.category);
  const query = params.toString();
  return query ? `${base}?${query}` : base;
});

useHead(() => {
  const q = typeof route.query.q === 'string' ? route.query.q : undefined;
  const category = typeof route.query.category === 'string' ? route.query.category : undefined;

  let title = '';
  let description = '';
  const keywords = new Set(['ecommerce', name]);

  if (category) {
    title = `${category} Products`;
    description = `Browse ${category} products on ${name}.`;
    keywords.add(category);
  }

  if (q) {
    title = `Search results for "${q}"`;
    description = `Search results for "${q}" on ${name}.`;
    keywords.add(q);
  }

  const canonicalUrl = canonical.value;

  return {
    title,
    ogTitle: title,
    description,
    ogDescription: description,
    ogUrl: canonicalUrl,
    canonical: canonicalUrl,
    keywords: Array.from(keywords).join(', '),
    twitterTitle: title,
    twitterDescription: description,
  };
});

const productsData = ref([]);
const isLoading = ref(false);

// Normalize a product from pod-main backend list DTO (forList shape)
function normalizeProduct(p) {
  return {
    _id: p.id,
    id: p.id,
    slug: p.slug,
    title: p.title,
    img: p.images?.[0] || null,
    images: p.images || [],
    // minPrice is already in dollars from the backend (amount field = dollars, not cents)
    price: p.minPrice || 0,
    type: p.category?.name || 'Uncategorized',
    category: p.category,
    tags: p.tags || [],
  };
}


async function fetchProducts() {
  if (isLoading.value) return;
  isLoading.value = true;
  try {
    const q = typeof route.query.q === 'string' ? route.query.q : '';
    const category = typeof route.query.category === 'string' ? route.query.category : '';
    
    const params = new URLSearchParams({ limit: '60' });
    if (category) params.set('category', category);
    if (q) params.set('q', q);
    
    const response = await $fetch(`${BACKEND}/api/products?${params.toString()}`);
    let list = Array.isArray(response) ? response : (response?.data || []);
    
    productsData.value = list.map(normalizeProduct);
  } catch (error) {
    console.error('Error fetching products:', error);
  } finally {
    isLoading.value = false;
  }
}

onMounted(fetchProducts);
watch(() => route.query, fetchProducts);

const products = computed(() => productsData.value);
const productsEmpty = computed(() => !isLoading.value && productsData.value.length === 0);
</script>

<template>
  <div class="flex items-center pl-3 lg:pl-5 pt-4">
    <ButtonSortBy />
    <ButtonSelectCategory />
  </div>
  <div v-if="isLoading" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-5 px-4 md:px-6 lg:px-8 py-5 w-full">
    <div v-for="i in 12" :key="i" class="flex flex-col gap-2">
      <div class="w-full aspect-square rounded-[10px] bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
      <div class="h-3 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse"></div>
      <div class="h-4 w-1/2 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse"></div>
    </div>
  </div>
  <div v-else-if="!productsEmpty" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-5 px-4 md:px-6 lg:px-8 py-5 w-full">
    <ProductCard :products="products" />
  </div>
  <ProductsEmpty v-else />
</template>
