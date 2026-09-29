<script setup>
const backendUrl = useRuntimeConfig().public.backendUrl || 'http://localhost:4000';
const token = useCookie('token');
const user = ref(null);
const isLoading = ref(true);

const isLoginMode = ref(true);
const email = ref('');
const password = ref('');
const name = ref('');
const errorMsg = ref('');

const orders = ref([]);

const fetchUser = async () => {
  if (!token.value) {
    isLoading.value = false;
    return;
  }
  try {
    const res = await $fetch(`${backendUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token.value}` }
    });
    if (res.success) {
      user.value = res.data;
      await fetchOrders();
    } else {
      token.value = null;
    }
  } catch (e) {
    token.value = null;
  } finally {
    isLoading.value = false;
  }
};

const fetchOrders = async () => {
  if (!user.value) return;
  try {
    const res = await $fetch(`${backendUrl}/api/orders/user/${user.value.email}`);
    if (res.success) {
      orders.value = res.data;
    }
  } catch (e) {
    console.error(e);
  }
};

onMounted(() => {
  fetchUser();
});

const submitAuth = async () => {
  errorMsg.value = '';
  const endpoint = isLoginMode.value ? '/api/auth/login' : '/api/auth/register';
  const body = isLoginMode.value ? { email: email.value, password: password.value } : { email: email.value, password: password.value, name: name.value };
  
  try {
    const res = await $fetch(`${backendUrl}${endpoint}`, { method: 'POST', body });
    if (res.success) {
      token.value = res.data.token;
      user.value = res.data.user;
      await fetchOrders();
    } else {
      errorMsg.value = res.message;
    }
  } catch (e) {
    errorMsg.value = e.response?._data?.message || 'Authentication failed';
  }
};

const logout = () => {
  token.value = null;
  user.value = null;
};
</script>

<template>
  <div class="min-h-[70vh] bg-[#f9f9f9] dark:bg-[#121212] pt-8 pb-16">
    <div class="max-w-4xl mx-auto px-4">
      
      <div v-if="isLoading" class="flex justify-center pt-20">
        <UIcon name="i-svg-spinners-bars-rotate-fade" class="text-orange-500" size="40" />
      </div>

      <!-- Auth Form -->
      <div v-else-if="!user" class="max-w-md mx-auto bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm p-6 lg:p-10">
        <h1 class="text-2xl font-bold text-center mb-2 text-black dark:text-white">{{ isLoginMode ? 'Welcome Back' : 'Create Account' }}</h1>
        <p class="text-center text-gray-500 mb-8">{{ isLoginMode ? 'Login to view your orders' : 'Join us to track orders easily' }}</p>
        
        <form @submit.prevent="submitAuth" class="space-y-4">
          <div v-if="!isLoginMode">
            <label class="block text-sm font-semibold mb-2">Name</label>
            <input v-model="name" type="text" required class="w-full h-12 px-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent outline-none focus:border-orange-500" />
          </div>
          <div>
            <label class="block text-sm font-semibold mb-2">Email</label>
            <input v-model="email" type="email" required class="w-full h-12 px-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent outline-none focus:border-orange-500" />
          </div>
          <div>
            <label class="block text-sm font-semibold mb-2">Password</label>
            <input v-model="password" type="password" required class="w-full h-12 px-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent outline-none focus:border-orange-500" />
          </div>
          
          <div v-if="errorMsg" class="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{{ errorMsg }}</div>
          
          <button type="submit" class="w-full h-12 mt-4 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold flex items-center justify-center hover:opacity-80 transition">
            {{ isLoginMode ? 'LOGIN' : 'REGISTER' }}
          </button>
        </form>
        
        <div class="mt-6 text-center">
          <button @click="isLoginMode = !isLoginMode" class="text-sm text-gray-500 hover:text-orange-500 transition font-medium">
            {{ isLoginMode ? "Don't have an account? Sign up" : 'Already have an account? Login' }}
          </button>
        </div>
      </div>

      <!-- User Dashboard -->
      <div v-else class="account-dashboard-wrapper">
        <!-- Dashboard Header / Banner -->
        <div class="dashboard-banner">
          <div class="banner-pattern"></div>
          
          <div class="banner-content flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
            <div class="flex items-center gap-6">
              <div class="avatar-container">
                <div class="avatar-inner">
                  {{ user.name.charAt(0).toUpperCase() }}
                </div>
              </div>
              <div class="user-info">
                <h1 class="user-name">{{ user.name }}</h1>
                <p class="user-email flex items-center gap-2">
                  <UIcon name="i-heroicons-envelope" class="w-4 h-4" />
                  {{ user.email }}
                </p>
              </div>
            </div>
            
            <div class="flex gap-3 w-full md:w-auto">
              <NuxtLink to="/track-order" class="btn-banner">
                <UIcon name="i-heroicons-magnifying-glass" class="w-4 h-4" />
                Track Guest Order
              </NuxtLink>
              <button @click="logout" class="btn-banner btn-logout">
                <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
        
        <!-- Dashboard Content -->
        <div class="dashboard-grid">
          <!-- Sidebar Stats -->
          <div class="sidebar-stats">
            <div class="stat-card">
              <h3 class="stat-title">Account Summary</h3>
              <div class="stat-items">
                <div class="stat-item">
                  <div class="stat-icon bg-blue">
                    <UIcon name="i-heroicons-shopping-bag" class="w-5 h-5" />
                  </div>
                  <div>
                    <p class="stat-value">{{ orders.length }}</p>
                    <p class="stat-label">Total Orders</p>
                  </div>
                </div>
                <div class="stat-item">
                  <div class="stat-icon bg-green">
                    <UIcon name="i-heroicons-currency-dollar" class="w-5 h-5" />
                  </div>
                  <div>
                    <p class="stat-value">${{ orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0) / 100 }}</p>
                    <p class="stat-label">Total Spent</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Orders List -->
          <div class="orders-list-section">
            <div class="flex items-center justify-between mb-6">
              <h2 class="section-title">Order History</h2>
            </div>
            
            <div v-if="orders.length === 0" class="empty-orders">
              <div class="empty-icon-wrapper">
                <UIcon name="i-iconamoon-shopping-bag-light" size="48" class="text-gray-400" />
              </div>
              <h3 class="empty-title">No orders yet</h3>
              <p class="empty-desc">Looks like you haven't made your first purchase. Explore our collection and find something you love!</p>
              <NuxtLink to="/" class="btn-primary">
                Start Shopping
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
              </NuxtLink>
            </div>
            
            <div v-else class="orders-list">
              <div v-for="order in orders" :key="order.id" class="order-card group">
                <div class="order-accent"></div>
                
                <div class="order-details">
                  <div class="flex items-center gap-3 mb-2">
                    <span class="order-id">#{{ order.id }}</span>
                    <span :class="['order-status-badge', 'status-' + order.status]">{{ order.status }}</span>
                  </div>
                  <p class="order-product line-clamp-1">{{ order.product }}</p>
                  <div class="order-date flex items-center gap-1 mt-3">
                    <UIcon name="i-heroicons-calendar" class="w-3.5 h-3.5" />
                    {{ new Date(order.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) }}
                  </div>
                </div>
                
                <div class="order-actions text-left sm:text-right">
                  <p class="order-price">${{ (order.totalAmount / 100).toFixed(2) }}</p>
                  <NuxtLink :to="`/track-order?id=${order.id}&email=${user.email}`" class="btn-track">
                    Track Order
                    <UIcon name="i-heroicons-chevron-right" class="w-4 h-4" />
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  </div>
</template>

<style scoped>
.account-dashboard-wrapper {
  animation: fadeIn 0.4s ease-out;
  padding-bottom: 40px;
}
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.dashboard-banner {
  position: relative;
  background: linear-gradient(135deg, #111827 0%, #1f2937 100%);
  border-radius: 24px;
  overflow: hidden;
  margin-bottom: 32px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.banner-pattern {
  position: absolute;
  inset: 0;
  opacity: 0.1;
  background-image: url('https://www.transparenttextures.com/patterns/cubes.png');
}

.banner-content {
  position: relative;
  z-index: 10;
  padding: 40px 32px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}
@media (min-width: 768px) {
  .banner-content { flex-direction: row; align-items: flex-end; }
}

.avatar-container {
  width: 96px; height: 96px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fb923c, #ea580c);
  padding: 4px;
  box-shadow: 0 10px 15px -3px rgba(249, 115, 22, 0.3);
}

.avatar-inner {
  width: 100%; height: 100%;
  background-color: white;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 36px; font-weight: 900;
  color: #ea580c;
}
.dark .avatar-inner { background-color: #111827; }

.user-info { display: flex; flex-direction: column; gap: 4px; }
.user-name { font-size: 30px; font-weight: 900; color: white; line-height: 1.1; margin: 0; }
.user-email { color: #d1d5db; font-size: 14px; font-weight: 500; margin: 0; }

.btn-banner {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  padding: 10px 20px;
  border-radius: 12px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  color: white; font-weight: 600; font-size: 14px;
  backdrop-filter: blur(8px);
  transition: all 0.2s;
  cursor: pointer;
}
.btn-banner:hover { background: rgba(255,255,255,0.2); }
.btn-logout { background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.2); color: #f87171; }
.btn-logout:hover { background: rgba(239, 68, 68, 0.2); }

.dashboard-grid {
  display: grid; grid-template-columns: 1fr; gap: 32px;
}
@media (min-width: 768px) {
  .dashboard-grid { grid-template-columns: repeat(4, 1fr); }
}

.sidebar-stats { grid-column: span 1; }
.orders-list-section { grid-column: span 1; }
@media (min-width: 768px) {
  .orders-list-section { grid-column: span 3; }
}

.stat-card {
  background: white; border-radius: 16px; padding: 24px;
  box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);
  border: 1px solid #f3f4f6;
}
.dark .stat-card { background: #1a1a1a; border-color: #262626; }

.stat-title {
  font-size: 12px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 20px; margin-top: 0;
}
.stat-items { display: flex; flex-direction: column; gap: 20px; }
.stat-item { display: flex; align-items: center; gap: 16px; }
.stat-icon {
  width: 40px; height: 40px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
}
.stat-icon.bg-blue { background: #eff6ff; color: #3b82f6; }
.dark .stat-icon.bg-blue { background: rgba(30, 58, 138, 0.2); }
.stat-icon.bg-green { background: #f0fdf4; color: #22c55e; }
.dark .stat-icon.bg-green { background: rgba(20, 83, 45, 0.2); }
.stat-value { font-size: 24px; font-weight: 900; margin: 0; color: #111827; line-height: 1; }
.dark .stat-value { color: white; }
.stat-label { font-size: 12px; font-weight: 500; color: #6b7280; margin: 4px 0 0 0; }

.section-title { font-size: 24px; font-weight: 900; margin: 0; color: #111827; }
.dark .section-title { color: white; }

.empty-orders {
  background: white; border-radius: 24px; padding: 48px; text-align: center;
  border: 1px solid #f3f4f6;
}
.dark .empty-orders { background: #1a1a1a; border-color: #262626; }
.empty-icon-wrapper {
  width: 96px; height: 96px; margin: 0 auto 24px auto; background: #f9fafb; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.dark .empty-icon-wrapper { background: #262626; }
.empty-title { font-size: 20px; font-weight: 700; margin-bottom: 8px; color: #111827; }
.dark .empty-title { color: white; }
.empty-desc { color: #6b7280; margin-bottom: 24px; max-width: 400px; margin-inline: auto; font-size: 14px; }
.btn-primary {
  display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px;
  background: #111827; color: white; font-weight: 700; border-radius: 12px;
  transition: transform 0.2s;
}
.dark .btn-primary { background: white; color: black; }
.btn-primary:hover { transform: scale(1.05); }

.orders-list { display: flex; flex-direction: column; gap: 16px; }
.order-card {
  position: relative; background: white; border-radius: 16px; padding: 24px;
  border: 1px solid #f3f4f6; overflow: hidden;
  display: flex; flex-direction: column; gap: 16px;
  transition: box-shadow 0.2s;
}
.dark .order-card { background: #1a1a1a; border-color: #262626; }
@media (min-width: 640px) {
  .order-card { flex-direction: row; justify-content: space-between; align-items: center; }
}
.order-card:hover { box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
.order-accent {
  position: absolute; left: 0; top: 0; bottom: 0; width: 4px;
  background: #e5e7eb; transition: background-color 0.2s;
}
.dark .order-accent { background: #262626; }
.order-card:hover .order-accent { background: #f97316; }

.order-details { padding-left: 12px; flex: 1; }
.order-id { font-size: 18px; font-weight: 900; color: #111827; }
.dark .order-id { color: white; }
.order-status-badge {
  padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em;
}
.status-shipped { background: #f3e8ff; color: #7e22ce; }
.dark .status-shipped { background: rgba(88, 28, 135, 0.3); color: #c084fc; }
.status-delivered { background: #dcfce7; color: #15803d; }
.dark .status-delivered { background: rgba(20, 83, 45, 0.3); color: #4ade80; }
.status-processing, .status-pending, .status-paid { background: #ffedd5; color: #c2410c; }
.dark .status-processing, .dark .status-pending, .dark .status-paid { background: rgba(124, 45, 18, 0.3); color: #fb923c; }

.order-product { font-size: 14px; font-weight: 500; color: #4b5563; margin: 4px 0 0 0; }
.dark .order-product { color: #d1d5db; }
.order-date { font-size: 12px; color: #9ca3af; font-weight: 500; margin-top: 12px; }

.order-actions { padding-left: 12px; border-top: 1px solid #f3f4f6; padding-top: 16px; width: 100%; }
.dark .order-actions { border-color: #262626; }
@media (min-width: 640px) {
  .order-actions { padding-left: 0; border-top: none; padding-top: 0; width: auto; }
}
.order-price { font-size: 20px; font-weight: 900; color: #111827; margin: 0 0 12px 0; }
.dark .order-price { color: white; }
.btn-track {
  display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px;
  background: #f9fafb; color: #374151; font-weight: 700; font-size: 14px; border-radius: 8px;
  transition: background-color 0.2s;
}
.dark .btn-track { background: #262626; color: #e5e7eb; }
.btn-track:hover { background: #f3f4f6; }
.dark .btn-track:hover { background: #374151; }
</style>
