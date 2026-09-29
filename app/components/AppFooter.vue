<!--app/components/AppFooter.vue-->
<script setup>
const config = useRuntimeConfig();
const colorMode = useColorMode();
const { locale, locales, setLocale } = useI18n();

const isOpen = ref(false);
const dropdownRef = ref();

const showCustomer = ref(false);
const showLegal = ref(false);
const showHelp = ref(false);

const currentLocale = computed(() => locales.value.find(l => l.code === locale.value));

const email = ref('');
const isSubscribing = ref(false);
const subscribeMessage = ref('');
const subscribeStatus = ref('');

const handleSubscribe = async () => {
  if (!email.value || !email.value.includes('@')) {
    subscribeMessage.value = 'Please enter a valid email address.';
    subscribeStatus.value = 'error';
    return;
  }
  isSubscribing.value = true;
  subscribeMessage.value = '';
  
  try {
    const res = await $fetch(`${config.public.backendUrl}/api/newsletter/subscribe`, {
      method: 'POST',
      body: { email: email.value }
    });
    subscribeMessage.value = res.message;
    subscribeStatus.value = 'success';
    email.value = '';
  } catch (e) {
    subscribeMessage.value = e.response?._data?.error || 'Subscription failed. Please try again.';
    subscribeStatus.value = 'error';
  } finally {
    isSubscribing.value = false;
  }
};
</script>

<template>
  <footer class="w-full flex flex-col text-sm font-sans mt-16 lg:mt-24">
    <!-- Newsletter Widget -->
    <div class="bg-[#fef6ef] dark:bg-[#1a120b] py-12 px-5 flex flex-col items-center justify-center text-center border-t border-[#ea6a32]/10">
       <h2 class="text-[#ea6a32] text-2xl lg:text-3xl font-bold font-serif uppercase mb-2">Unlock Your 10% Off!</h2>
       <p class="text-gray-700 dark:text-gray-300 mb-6 font-medium">Deals and handpicked gift ideas, made just for you!</p>
       <form @submit.prevent="handleSubscribe" class="flex flex-col sm:flex-row gap-3 w-full max-w-[500px]">
          <input v-model="email" type="email" placeholder="Enter your email address" class="flex-1 px-5 py-3 rounded-full border border-gray-300 dark:border-gray-600 outline-none focus:border-[#ea6a32] dark:bg-black text-black dark:text-white bg-white disabled:opacity-50" :disabled="isSubscribing" />
          <button type="submit" :disabled="isSubscribing" class="bg-[#ea6a32] hover:bg-[#d65f2a] text-white font-bold py-3 px-8 rounded-full transition-colors w-full sm:w-auto flex-shrink-0 text-[15px] flex items-center justify-center disabled:opacity-50">
            <UIcon v-if="isSubscribing" name="i-svg-spinners-bars-rotate-fade" class="mr-2" size="18" />
            Subscribe!
          </button>
       </form>
       <p v-if="subscribeMessage" :class="subscribeStatus === 'success' ? 'text-green-600' : 'text-red-500'" class="mt-3 text-sm font-semibold">
          {{ subscribeMessage }}
       </p>
    </div>

    <!-- Main Footer Widget -->
    <div class="bg-[#0b1c35] text-white py-6 lg:py-12 px-5 lg:px-12 w-full">
       <div class="max-w-[1400px] mx-auto">
          
          <div class="flex flex-col lg:flex-row lg:justify-between gap-0 lg:gap-16 border-b border-white/20 pb-4 lg:pb-10">
             
             <!-- Col 1: Brand & Contact -->
             <div class="flex flex-col gap-4 lg:w-1/4 mb-4 lg:mb-0">
                <h3 class="font-bold text-xl tracking-widest uppercase mb-1">WANDER PRINTS</h3>
                <div class="grid grid-cols-2 gap-4 lg:flex lg:flex-col lg:gap-4">
                   <div class="text-[13px] lg:text-sm text-gray-300 flex flex-col gap-1 leading-relaxed">
                      <p class="font-bold text-white">WANDERX INC.</p>
                      <p>Address: 254 Chapman Rd, Ste 208 #21235, Newark, Delaware 19702, USA</p>
                   </div>
                   <div class="flex flex-col gap-3 items-start text-[13px] lg:text-sm">
                      <p class="font-bold text-white">Get In Touch</p>
                      <NuxtLink to="/contact" class="border border-white hover:bg-white hover:text-[#0b1c35] transition font-semibold rounded-full px-4 py-1.5 w-max">Submit a ticket</NuxtLink>
                      <p class="text-gray-300">Support time: Mon-Sat: 9AM-5PM</p>
                   </div>
                </div>
             </div>
             
             <!-- Customer Service -->
             <div class="border-t border-white/20 lg:border-none py-3 lg:py-0">
                <div @click="showCustomer = !showCustomer" class="flex lg:block justify-between items-center cursor-pointer lg:cursor-auto group">
                   <h4 class="font-bold lg:mb-5 text-base">Customer Service</h4>
                   <svg class="w-5 h-5 lg:hidden transition-transform" :class="showCustomer ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
                <ul class="flex-col gap-3.5 mt-3 lg:flex text-gray-300 text-[15px] hidden lg:flex" :class="{'!flex': showCustomer}">
                   <li><NuxtLink to="/contact" class="hover:text-white hover:underline transition">Contact Us</NuxtLink></li>
                   <li><NuxtLink to="/track-order" class="hover:text-white hover:underline transition">Order Tracking</NuxtLink></li>
                   <li><NuxtLink to="/cancellation" class="hover:text-white hover:underline transition">Cancellation & Modification</NuxtLink></li>
                </ul>
             </div>

             <!-- Legal & Policies -->
             <div class="border-t border-white/20 lg:border-none py-3 lg:py-0">
                <div @click="showLegal = !showLegal" class="flex lg:block justify-between items-center cursor-pointer lg:cursor-auto group">
                   <h4 class="font-bold lg:mb-5 text-base">Legal & Policies</h4>
                   <svg class="w-5 h-5 lg:hidden transition-transform" :class="showLegal ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
                <ul class="flex-col gap-3.5 mt-3 lg:flex text-gray-300 text-[15px] hidden lg:flex" :class="{'!flex': showLegal}">
                   <li><NuxtLink to="/terms" class="hover:text-white hover:underline transition">Terms of Service</NuxtLink></li>
                   <li><NuxtLink to="/returns" class="hover:text-white hover:underline transition">Returns & Refunds</NuxtLink></li>
                   <li><NuxtLink to="/privacy" class="hover:text-white hover:underline transition">Privacy Policy</NuxtLink></li>
                   <li><NuxtLink to="/shipping-policy" class="hover:text-white hover:underline transition">Shipping Policy</NuxtLink></li>
                </ul>
             </div>

             <!-- Help & Connect -->
             <div class="border-t border-white/20 lg:border-none py-3 lg:py-0">
                <div @click="showHelp = !showHelp" class="flex lg:block justify-between items-center cursor-pointer lg:cursor-auto group">
                   <h4 class="font-bold lg:mb-5 text-base">Help & Connect</h4>
                   <svg class="w-5 h-5 lg:hidden transition-transform" :class="showHelp ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
                <ul class="flex-col gap-3.5 mt-3 lg:flex text-gray-300 text-[15px] hidden lg:flex" :class="{'!flex': showHelp}">
                   <li><NuxtLink to="/about" class="hover:text-white hover:underline transition">About Us</NuxtLink></li>
                   <li><NuxtLink to="/reviews" class="hover:text-white hover:underline transition">Reviews</NuxtLink></li>
                   <li><NuxtLink to="/dmca" class="hover:text-white hover:underline transition">DMCA Report</NuxtLink></li>
                </ul>
             </div>
          </div>

          <!-- Bottom Footer -->
          <div class="flex flex-col lg:flex-row items-center lg:justify-between gap-4 pt-4 pb-2">
             <p class="text-[13px] text-gray-400 order-3 lg:order-1 font-medium">&copy; {{ new Date().getFullYear() }} Wander Prints</p>
             
             <!-- Socials -->
             <div class="flex items-center justify-center gap-5 order-2 text-white">
                <a href="#" class="hover:scale-110 transition"><svg class="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24"><path d="M12 2.04c-5.5 0-9.96 4.46-9.96 9.96 0 4.96 3.63 9.08 8.4 9.84v-6.96h-2.53v-2.88h2.53v-2.19c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.88h-2.34v6.96c4.77-.76 8.4-4.88 8.4-9.84 0-5.5-4.46-9.96-9.96-9.96z"/></svg></a>
                <a href="#" class="hover:scale-110 transition"><svg class="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.37.89.41.41.67.81.89 1.37.16.43.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.89 1.37-.41.41-.81.67-1.37.89-.43.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.37-.89-.41-.41-.67-.81-.89-1.37-.16-.43-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.89-1.37.41-.41.81-.67 1.37-.89.43-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07M12 0c-3.26 0-3.67.01-4.95.07-1.28.06-2.15.27-2.91.56-.79.31-1.46.73-2.13 1.4s-1.09 1.34-1.4 2.13c-.29.76-.5 1.63-.56 2.91C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.28.27 2.15.56 2.91.31.79.73 1.46 1.4 2.13.67.67 1.34 1.09 2.13 1.4.76.29 1.63.5 2.91.56 1.28.06 1.69.07 4.95.07s3.67-.01 4.95-.07c1.28-.06 2.15-.27 2.91-.56.79-.31 1.46-.73 2.13-1.4.67-.67 1.09-1.34 1.4-2.13.29-.76.5-1.63.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.28-.27-2.15-.56-2.91-.31-.79-.73-1.46-1.4-2.13-.67-.67-1.34-1.09-2.13-1.4-.76-.29-1.63-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84zM12 16a4 4 0 1 1 4-4 4 4 0 0 1-4 4zm3.84-9.08a1.44 1.44 0 1 0 1.44 1.44 1.44 1.44 0 0 0-1.44-1.44z"/></svg></a>
                <a href="#" class="hover:scale-110 transition"><svg class="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24"><path d="M23.5 6.19a2.95 2.95 0 0 0-2.08-2.09c-1.84-.49-9.2-.49-9.2-.49s-7.37 0-9.2.49A2.95 2.95 0 0 0 .93 6.19C.44 8.04.44 11.89.44 11.89s0 3.86.49 5.71a2.95 2.95 0 0 0 2.08 2.08c1.84.49 9.2.49 9.2.49s7.37 0 9.2-.49a2.95 2.95 0 0 0 2.08-2.08c.49-1.85.49-5.71.49-5.71s0-3.85-.49-5.7zM9.54 15.17V8.63L15.3 11.9z"/></svg></a>
                <a href="#" class="hover:scale-110 transition"><svg class="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.34 2.88 2.88 0 0 1 2.31-4.53 2.66 2.66 0 0 1 1.61.55v-3.4a6.27 6.27 0 0 0-1.61-.2 6.33 6.33 0 0 0 0 12.66 6.33 6.33 0 0 0 6.33-6.33V8.12a8.3 8.3 0 0 0 4.19 1.15V5.82a4.7 4.7 0 0 1-.41.87z"/></svg></a>
                <a href="#" class="hover:scale-110 transition"><svg class="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.168 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.633 0 12.017 0z"/></svg></a>
             </div>
             
             <!-- Country / Locale -->
             <div class="order-1 lg:order-3 border border-gray-600 rounded-[20px] px-3 py-1.5 flex items-center gap-1.5 cursor-pointer hover:border-gray-400 hover:bg-white/5 transition text-sm font-semibold max-w-max mx-auto lg:mx-0">
                <img src="https://flagcdn.com/w20/us.png" alt="US" class="w-[14px] h-[14px] rounded-full object-cover" />
                <span class="text-[12px]">United States | $ USD</span>
                <UIcon name="i-heroicons-chevron-down-20-solid" class="w-3.5 h-3.5 text-gray-400" />
             </div>
          </div>
       </div>
    </div>
  </footer>
</template>
