<!--app/pages/product/[id].vue-->
<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Pagination, Thumbs } from 'swiper/modules';
const { isOpenImageSliderModal } = useComponents();
const localePath = useLocalePath();
const runtimeConfig = useRuntimeConfig();
const BACKEND = runtimeConfig.public.backendUrl;

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const thumbsSwiper = ref(null);
const setThumbsSwiper = swiper => {
  thumbsSwiper.value = swiper;
};

const modules = [Navigation, Pagination, Thumbs];

const route = useRoute();
const slug = computed(() => route.params.id);

const productResult = ref({});
const selectedVariation = ref(null);
const relatedProducts = ref([]);
const currentImage = ref(null);

function normalizeProduct(p, related = []) {
  const enabledVariants = p.variants?.filter(v => v.isEnabled !== false) || [];
  const firstVariant = enabledVariants.find(v => v.isAvailable !== false) || enabledVariants[0];
  const priceInDollars = firstVariant ? firstVariant.price : 0;
  return {
    id: p.id,
    databaseId: p.id,
    name: p.title,
    slug: p.slug,
    price: `$${priceInDollars.toFixed(2)} USD`,
    priceNumber: priceInDollars,
    regularPrice: null,
    mainImage: p.images?.[0] || null,
    image: { sourceUrl: p.images?.[0] || null },
    galleryImages: { nodes: (p.images || []).map(url => ({ sourceUrl: url })) },
    stockStatus: enabledVariants.some(v => v.isAvailable !== false) ? 'IN_STOCK' : 'OUT_OF_STOCK',
    description: p.description || `<p>${p.title}</p>`,
    productTags: { nodes: (p.tags || []).map(t => ({ name: t })) },
    productCategories: { nodes: p.category ? [{ name: p.category.name }] : [] },
    attributes: { nodes: [] },
    variants: p.variants || [],
    related: { nodes: related },
  };
}

onMounted(async () => {
  try {
    const p = await $fetch(`${BACKEND}/api/products/${slug.value}`, {
      headers: { 'Bypass-Tunnel-Reminder': 'true' }
    });
    let related = [];
    try {
      const categorySlug = p.category?.slug;
      const params = categorySlug ? `?category=${categorySlug}&limit=8` : `?limit=8`;
      const relatedRes = await $fetch(`${BACKEND}/api/products${params}`, {
        headers: { 'Bypass-Tunnel-Reminder': 'true' }
      });
      const relatedList = Array.isArray(relatedRes) ? relatedRes : (relatedRes?.data || []);
      related = relatedList
        .filter(item => item.id !== p.id)
        .slice(0, 7)
        .map(item => ({
          _id: item.id, id: item.id, slug: item.slug, title: item.title,
          img: item.images?.[0] || null, image: { sourceUrl: item.images?.[0] || null },
          price: item.minPrice || 0,
        }));
    } catch (e) { console.warn('Related fetch failed:', e); }
    relatedProducts.value = related;
    productResult.value = normalizeProduct(p, related);
    if (productResult.value.image?.sourceUrl) {
      currentImage.value = productResult.value.image.sourceUrl;
    }
    const firstAvailable = (p.variants || []).find(v => v.isAvailable !== false && v.isEnabled !== false);
    if (firstAvailable) selectedVariation.value = firstAvailable;
    
    // Fetch reviews and campaigns using the real product ID
    try {
      const r = await $fetch(`${BACKEND}/api/products/${p.id}/reviews`, {
        headers: { 'Bypass-Tunnel-Reminder': 'true' }
      });
      reviews.value = Array.isArray(r) ? r : [];
      
      const c = await $fetch(`${BACKEND}/api/campaigns/active`, {
        headers: { 'Bypass-Tunnel-Reminder': 'true' }
      });
      campaigns.value = Array.isArray(c) ? c : [];
    } catch(e) {
      console.error('Failed to fetch reviews or campaigns:', e);
    }
  } catch (err) {
    console.error('Error loading product:', err);
  }
});

const product = computed(() => productResult.value);
const sortedVariations = computed(() => (product.value.variants || []).filter(v => v.isEnabled !== false));
const selectedVariantPrice = computed(() => {
  if (!selectedVariation.value) return product.value.price;
  return `$${(selectedVariation.value.price).toFixed(2)} USD`;
});

const { handleAddToCart, addToCartButtonStatus } = useCart();
const enableAdsModule = ref(true);
const selectedQuantity = ref(1);

const reviews = ref([]);
const averageRating = computed(() => {
  if (!reviews.value || reviews.value.length === 0) return "5.0";
  const sum = reviews.value.reduce((acc, r) => acc + (r.rating || 5), 0);
  return (sum / reviews.value.length).toFixed(1);
});
const campaigns = ref([]);
const showReviewForm = ref(false);
const newReview = ref({ authorName: '', authorEmail: '', rating: 5, content: '' });

const submitReview = async () => {
  if (!newReview.value.authorName || !newReview.value.content) return;
  try {
    await $fetch(`${BACKEND}/api/products/${product.value.id}/reviews`, {
      method: 'POST',
      body: { ...newReview.value }
    });
    alert('Đánh giá của bạn đã được gửi và đang chờ duyệt!');
    showReviewForm.value = false;
    newReview.value = { authorName: '', authorEmail: '', rating: 5, content: '' };
  } catch (e) {
    alert('Có lỗi xảy ra');
  }
};

const showHighlights = ref(true);
const showDescription = ref(true);
</script>


<template>
  <ProductSeo v-if="product?.name" :info="{ ...product, ratingValue: averageRating, reviewCount: reviews.length || 1 }" />
  <ProductSkeleton v-if="!product.name" />
  
  <div v-else class="max-w-[1400px] mx-auto px-4 lg:px-8 py-4 text-[#222] dark:text-[#e1e1e1]">
    
    <!-- Top row: More from this shop -->
    <div class="mb-4 max-xl:hidden">
      <div class="flex justify-between items-center mb-2">
        <h2 class="text-sm font-semibold">More from this shop</h2>
        <NuxtLink :to="product.category?.slug ? `/?category=${product.category.slug}` : '/'" class="text-xs underline text-gray-600 dark:text-gray-400">See more</NuxtLink>
      </div>
      <div class="flex gap-2">
        <div v-for="i in 9" :key="i" class="w-[80px] h-[80px] rounded-md overflow-hidden bg-gray-200 dark:bg-[#333]">
           <NuxtImg v-if="product.related?.nodes?.[i-1]?.image?.sourceUrl" :src="product.related.nodes[i-1].image.sourceUrl" class="w-full h-full object-cover" />
           <div v-else class="w-full h-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-500">
              <svg class="w-6 h-6 opacity-30" fill="currentColor" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
           </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-y-8 lg:gap-x-10">
      
      <!-- GALLERY (Order 1 on mobile, Col 1 Row 1 on desktop) -->
      <div class="w-full order-1 lg:col-start-1 lg:row-start-1">
        <div class="flex lg:gap-4 flex-col lg:flex-row lg:sticky lg:top-24">
          <!-- Thumbs -->
          <div class="flex lg:flex-col gap-2 w-full lg:w-16 flex-shrink-0 order-2 lg:order-1 overflow-x-auto py-1">
             <div @click="currentImage = product.image?.sourceUrl" class="w-16 h-16 flex-shrink-0 rounded border-2 overflow-hidden cursor-pointer transition" :class="currentImage === product.image?.sourceUrl ? 'border-black dark:border-white' : 'border-transparent hover:border-gray-400'">
                 <NuxtImg :src="product.image?.sourceUrl || '/placeholder.png'" class="w-full h-full object-cover" />
             </div>
             <div v-for="(node, i) in (product.galleryImages?.nodes || []).slice(1,6)" :key="i" @click="currentImage = node.sourceUrl" class="w-16 h-16 flex-shrink-0 rounded border-2 overflow-hidden cursor-pointer transition" :class="currentImage === node.sourceUrl ? 'border-black dark:border-white' : 'border-transparent hover:border-gray-400'">
                 <NuxtImg :src="node.sourceUrl" class="w-full h-full object-cover" />
             </div>
          </div>

          <!-- Main Image -->
          <div class="relative w-full aspect-square bg-[#f5f5f5] dark:bg-[#222] rounded-xl overflow-hidden cursor-zoom-in group order-1 lg:order-2">
            <div class="absolute top-3 left-3 bg-[#fdedc9] text-black text-xs font-bold px-2 py-1 rounded-sm z-10 shadow-sm transition">Popular</div>
            <div class="absolute top-3 right-3 bg-white dark:bg-[#333] p-2 rounded-full z-10 shadow cursor-pointer hover:scale-110 transition">
              <svg class="w-5 h-5 text-gray-500 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
            </div>
            <NuxtImg :src="currentImage || product.image?.sourceUrl || '/placeholder.png'" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
        </div>
      </div>

      <!-- CHECKOUT PANEL (Order 2 on mobile, Col 2 on desktop) -->
      <div class="w-full order-2 lg:col-start-2 lg:row-start-1 lg:row-span-2">
        <div class="lg:sticky lg:top-24 flex flex-col gap-4">
          
          <div class="flex flex-col gap-2">
             <h1 class="text-[17px] lg:text-[20px] font-normal leading-[1.4] text-[#111] dark:text-[#fff]">{{ product.name }}</h1>
             
             <div class="flex items-center gap-1.5 mb-1 text-[13px] text-gray-600 dark:text-gray-400 cursor-pointer" @click="showReviewForm = !showReviewForm">
                <span class="font-medium text-[#111] dark:text-[#eee]">{{ averageRating }}</span>
                <span class="text-[#ea6a32]">
                  <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                </span>
                <span class="text-gray-500 hover:underline">({{ reviews.length > 0 ? reviews.length : 'Viết đánh giá' }})</span>
             </div>
             
             <div class="flex items-center gap-2">
                <span class="text-2xl lg:text-3xl font-extrabold text-[#002d5b] dark:text-[#4da3ff] tracking-tight">{{ selectedVariantPrice }} USD</span>
             </div>

             <div class="text-[#ea6a32] border border-[#ea6a32]/30 font-semibold text-sm flex items-center gap-1.5 bg-orange-50 dark:bg-[#ea6a32]/10 px-3 py-1.5 rounded-full w-max mt-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"></path></svg> 
                4k+ bought in past month
             </div>
             
             <div v-if="campaigns.length > 0" class="flex flex-col gap-2 mt-2">
               <div v-for="camp in campaigns" :key="camp.id" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                 <div class="font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                   <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                   {{ camp.title }}
                 </div>
                 <div class="text-sm text-red-500 mt-1">
                   Kết thúc vào: {{ new Date(camp.endsAt).toLocaleString() }}
                 </div>
               </div>
             </div>
          </div>
          
             <!-- Delivery Info -->
             <div class="flex flex-col gap-2 text-[15px] text-[#222] dark:text-[#eee] mt-2 mb-2">
                <div>Delivery to: <span class="font-semibold underline cursor-pointer decoration-dotted underline-offset-4">United States</span></div>
                <div>Order today and get it by: <span class="font-semibold underline cursor-pointer decoration-dotted underline-offset-4">Oct 8 - Oct 13</span></div>
             </div>

             <!-- Buy More Save More Widget (Quantity) -->
             <div class="flex flex-col gap-2">
                <label class="text-[17px] font-bold text-[#002d5b] dark:text-[#4da3ff]">Buy More Save More <span class="text-red-500">*</span></label>
                <div class="flex flex-wrap gap-2">
                   <div v-for="qty in [1, 2, 3, 4, 5, 6]" :key="qty"
                        @click="selectedQuantity = qty"
                        class="border rounded-lg py-2 px-3 lg:px-4 w-[calc(33.333%-8px)] sm:w-auto flex flex-col items-center justify-center cursor-pointer transition-all bg-white dark:bg-[#1a1a1a]"
                        :class="selectedQuantity === qty ? 'border-[#002d5b] dark:border-[#4da3ff] ring-1 ring-[#002d5b] dark:ring-[#4da3ff]' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'">
                       <span class="font-bold text-[15px] text-[#002d5b] dark:text-white">{{ qty }} PC{{ qty > 1 ? 'S' : '' }}</span>
                       <span class="text-[12px] lg:text-[13px] text-gray-500 whitespace-nowrap">${{ Math.max((selectedVariation?.price || product?.price || 19.95) - (qty - 1) * 2, 1).toFixed(2) }}/pc</span>
                   </div>
                </div>
             </div>

             <div class="flex flex-col gap-1.5 mt-2">
               <label class="text-[17px] font-bold text-[#222] dark:text-white">Style</label>
               <select v-model="selectedVariation" class="p-3.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#222] text-[#222] dark:text-[#e1e1e1] shadow-sm cursor-pointer outline-none hover:border-black dark:hover:border-white transition">
                  <option v-for="v in sortedVariations" :key="v.id" :value="v">
                     {{ v.title }} - ${{ (v.price).toFixed(2) }}
                  </option>
               </select>
             </div>

             <!-- Tags / Hashtags (Chuẩn SEO) -->
             <div class="flex flex-wrap gap-2 mt-4" v-if="product.productTags?.nodes?.length">
                <NuxtLink v-for="tag in product.productTags.nodes" :key="tag.name" :to="`/?q=${encodeURIComponent(tag.name)}`" class="text-xs font-semibold text-gray-500 hover:text-[#ea6a32] hover:underline transition">
                  #{{ tag.name }}
                </NuxtLink>
             </div>

          <!-- CTA Button & Wishlist -->
          <div class="flex gap-2 w-full mt-2">
            <button 
              @click="handleAddToCart({ id: product.id, title: product.name, images: [product.mainImage || '/placeholder.png'] }, selectedVariation, selectedQuantity, Math.round(Math.max(((selectedVariation?.price || 1995) / 100) - (selectedQuantity - 1) * 2, 1) * 100))"
              :disabled="addToCartButtonStatus === 'loading'"
              class="flex-1 py-4 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold text-base hover:scale-[1.02] transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <template v-if="addToCartButtonStatus === 'loading'">
                <svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                Processing...
              </template>
              <template v-else-if="addToCartButtonStatus === 'added'">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                Added to cart
              </template>
              <template v-else>
                {{ $t('cart.add_to_cart') || 'Add to cart' }}
              </template>
            </button>
            <ButtonWishlist :product="product" />
          </div>
          
          <div class="flex items-center gap-2 justify-center text-sm text-gray-600 dark:text-gray-400 mt-2 bg-purple-50 dark:bg-purple-900/20 py-2 rounded-lg">
             <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
             <strong>Star Seller.</strong> This seller consistently earned 5-star reviews.
          </div>
          
          <!-- Accordions -->
          <div class="mt-4 border-t border-gray-200 dark:border-[#333]">
             <div @click="showHighlights = !showHighlights" class="py-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2a2a2a] px-2 -mx-2 rounded-lg transition">
                <span class="font-bold text-lg">Highlights</span>
                <svg class="w-5 h-5 transition-transform duration-300" :class="{ 'rotate-180': !showHighlights }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>
             </div>
             <div v-show="showHighlights" class="pb-4 px-2 text-sm flex flex-col gap-3 text-gray-700 dark:text-gray-300">
                <div class="flex items-center gap-2"><svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Handmade</div>
                <div class="flex items-center gap-2"><svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Materials: High Quality, Premium Finish</div>
             </div>
          </div>

          <div class="border-t border-gray-200 dark:border-[#333]">
             <div @click="showDescription = !showDescription" class="py-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2a2a2a] px-2 -mx-2 rounded-lg transition">
                <span class="font-bold text-lg">Description</span>
                <svg class="w-5 h-5 transition-transform duration-300" :class="{ 'rotate-180': !showDescription }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>
             </div>
             <div v-show="showDescription" class="pb-4 px-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300" v-html="product.description"></div>
          </div>
          
        </div>
      </div>

      <!-- REVIEWS SECTION (Order 3 on mobile, Col 1 Row 2 on desktop) -->
      <div class="w-full order-3 lg:col-start-1 lg:row-start-2 lg:mt-6 border-t border-gray-200 dark:border-[#333] pt-6 text-[#222] dark:text-[#e1e1e1]">
          <h2 class="text-[28px] font-bold font-serif mb-6">Reviews for this item</h2>
          
          <div class="text-sm font-semibold mb-6 flex items-center gap-2 flex-wrap">
            What buyers say, summarized by AI: 
            <span class="flex items-center font-normal ml-1"><svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Looks great</span>
            <span class="flex items-center font-normal ml-2"><svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Love it</span>
            <span class="flex items-center font-normal ml-2"><svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Well packaged</span>
          </div>

          <div class="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-12 mb-8">
            <div class="flex items-center gap-2">
              <span class="text-[44px] font-light leading-none">{{ averageRating }}</span>
              <div class="flex flex-col justify-center">
                <svg class="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                <div class="text-[13px] font-normal underline cursor-pointer mt-1 hover:no-underline leading-tight">Item average<br><span class="text-gray-500">({{ reviews.length }} reviews)</span></div>
              </div>
            </div>

            <div class="grid grid-cols-2 md:flex md:flex-wrap gap-4">
               <div class="flex items-center gap-2">
                 <div class="w-12 h-12 shrink-0 rounded-full border-2 border-yellow-400 flex items-center justify-center font-bold text-sm">{{ averageRating }}</div>
                 <div class="text-[13px] leading-tight text-gray-600 dark:text-gray-300">Item quality</div>
               </div>
               <div class="flex items-center gap-2">
                 <div class="w-12 h-12 shrink-0 rounded-full border-2 border-yellow-400 flex items-center justify-center font-bold text-sm">4.8</div>
                 <div class="text-[13px] leading-tight text-gray-600 dark:text-gray-300">Shipping</div>
               </div>
               <div class="flex items-center gap-2">
                 <div class="w-12 h-12 shrink-0 rounded-full border-2 border-yellow-400 flex items-center justify-center font-bold text-sm">5.0</div>
                 <div class="text-[13px] leading-tight text-gray-600 dark:text-gray-300">Customer<br>service</div>
               </div>
               <div class="flex items-center gap-2">
                 <div class="w-12 h-12 shrink-0 rounded-full border-2 border-yellow-400 flex items-center justify-center font-bold text-sm">100%</div>
                 <div class="text-[13px] leading-tight text-gray-600 dark:text-gray-300">Buyers<br>recommend</div>
               </div>
            </div>
          </div>

          
          <!-- Real Reviews List -->
          <div class="flex flex-col">
            <div v-for="review in reviews" :key="review.id" class="flex flex-col gap-3 py-6 border-t border-gray-200 dark:border-[#333]">
               <div class="flex justify-between items-start">
                  <div class="flex items-center gap-2">
                     <span class="text-yellow-400 tracking-widest text-lg leading-none">{{ '★'.repeat(review.rating) }}{{ '☆'.repeat(5 - review.rating) }}</span>
                     <span class="font-bold text-lg leading-none">{{ review.rating }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                     <div class="w-6 h-6 rounded-full bg-[#fde1d3] flex items-center justify-center text-xs font-bold text-orange-800">{{ review.authorName.charAt(0).toUpperCase() }}</div>
                     <span class="text-sm font-bold">{{ review.authorName }}</span>
                     <span class="text-sm text-gray-500">{{ new Date(review.createdAt).toLocaleDateString() }}</span>
                  </div>
               </div>
               <p class="text-base text-[#222] dark:text-[#e1e1e1]">{{ review.content }}</p>
            </div>
            
            <div v-if="reviews.length === 0" class="py-4 text-gray-500">
               Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên!
            </div>

            <div class="mt-4 pt-4 border-t border-gray-200 dark:border-[#333]">
               <button v-if="!showReviewForm" @click="showReviewForm = true" class="px-4 py-2 bg-black text-white rounded-lg font-medium text-sm">Viết đánh giá</button>
               <div v-if="showReviewForm" class="flex flex-col gap-3 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                  <h3 class="font-bold">Viết đánh giá của bạn</h3>
                  <div class="flex gap-2">
                    <input v-model="newReview.authorName" placeholder="Tên của bạn" class="p-2 border rounded text-sm w-full outline-none" required />
                    <input v-model="newReview.authorEmail" placeholder="Email" class="p-2 border rounded text-sm w-full outline-none" required />
                  </div>
                  <select v-model="newReview.rating" class="p-2 border rounded text-sm outline-none w-max">
                    <option :value="5">5 Sao - Tuyệt vời</option>
                    <option :value="4">4 Sao - Rất tốt</option>
                    <option :value="3">3 Sao - Tạm được</option>
                    <option :value="2">2 Sao - Kém</option>
                    <option :value="1">1 Sao - Tệ</option>
                  </select>
                  <textarea v-model="newReview.content" placeholder="Nội dung đánh giá" rows="3" class="p-2 border rounded text-sm w-full outline-none" required></textarea>
                  <div class="flex gap-2">
                    <button @click="submitReview" class="px-4 py-2 bg-black text-white rounded-lg font-medium text-sm">Gửi đánh giá</button>
                    <button @click="showReviewForm = false" class="px-4 py-2 bg-gray-300 text-black rounded-lg font-medium text-sm">Hủy</button>
                  </div>
               </div>
            </div>
          </div>
      </div>
    </div>


    <!-- MODULE ADS -->
    <ModuleAds :products="product.related?.nodes" :enabled="enableAdsModule" title="Similar items" />

    <!-- WIDGET RELATED SEARCHES -->
    <WidgetRelatedSearches :relatedProducts="product.related?.nodes" />
  </div>

  <!-- YOU MAY ALSO LIKE -->
  <div class="mt-8 pt-8 border-t border-gray-200 dark:border-[#333] w-full">
     <h2 class="text-2xl font-bold font-serif mb-6 text-[#222] dark:text-white px-4 lg:px-8">You may also like</h2>
     <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 px-3 lg:px-5 xl:px-8">
        <ProductCard :products="product.related?.nodes" />
     </div>
  </div>
</template>

<style lang="postcss">
.product-images-thumbs .swiper-wrapper {
  @apply flex-col gap-3;
}
.product-images-thumbs .swiper-slide-thumb-active {
  @apply border-black dark:border-white;
}
.swiper-button-next,
.swiper-button-prev {
  @apply bg-white/50 hover:bg-white p-3.5 m-2 rounded-full flex items-center justify-center shadow transition backdrop-blur-sm;
}

.swiper-button-prev.swiper-button-disabled,
.swiper-button-next.swiper-button-disabled {
  @apply hidden;
}

.swiper-pagination {
  @apply bg-white/50 shadow-sm rounded-full py-1 backdrop-blur-sm;
}

.selected-varitaion,
.select-varitaion:hover:not(.disabled) {
  @apply border-alizarin-crimson-700 dark:border-alizarin-crimson-700 text-alizarin-crimson-700 bg-red-700/10;
}

.disabled {
  @apply opacity-40 cursor-default;
}

.button-bezel {
  box-shadow: 0 0 0 var(--button-outline, 0px) rgb(222, 92, 92, 0.3), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.25), inset 0 1px 0 0 rgba(255, 255, 255, 0.3),
    0 1px 2px 0 rgba(0, 0, 0, 0.5);
  @apply bg-alizarin-crimson-700 outline-none tracking-[-0.125px] transition scale-[var(--button-scale,1)] duration-200;
  &:hover {
    @apply bg-alizarin-crimson-600;
  }
  &:active {
    --button-outline: 4px;
    --button-scale: 0.975;
  }
}

.description ul li {
  background: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxlbGxpcHNlIHJ5PSIzIiByeD0iMyIgY3k9IjMiIGN4PSIzIiBmaWxsPSIjYzljOWM5Ii8+PC9zdmc+)
    no-repeat 0 0.7rem;
  padding-left: 0.938rem;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease 0s, opacity 0.3s ease 0s;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(-30px) scale(0);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(30px) scale(0);
}
</style>
