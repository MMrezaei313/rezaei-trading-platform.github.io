<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h2>ورود به پلتفرم معاملاتی</h2>
        <p>لطفاً اطلاعات حساب خود را وارد کنید</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email" class="form-label">ایمیل یا نام کاربری</label>
          <input
            id="email"
            v-model="form.email"
            type="text"
            class="form-input"
            placeholder="example@email.com"
            required
            :disabled="loading"
          >
        </div>

        <div class="form-group">
          <label for="password" class="form-label">رمز عبور</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            class="form-input"
            placeholder="••••••••"
            required
            :disabled="loading"
          >
        </div>

        <div class="form-options">
          <label class="checkbox-label">
            <input type="checkbox" v-model="form.remember">
            <span>مرا به خاطر بسپار</span>
          </label>
          <router-link to="/forgot-password" class="forgot-link">
            رمز عبور را فراموش کرده‌اید؟
          </router-link>
        </div>

        <button 
          type="submit" 
          class="btn btn-primary login-btn"
          :disabled="loading"
        >
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? 'در حال ورود...' : 'ورود به سیستم' }}
        </button>

        <div class="login-footer">
          <p>حساب کاربری ندارید؟ 
            <router-link to="/register" class="register-link">
              ثبت‌نام کنید
            </router-link>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

export default {
  name: 'Login',
  setup() {
    const store = useStore()
    const router = useRouter()
    const toast = useToast()

    const loading = ref(false)
    const form = ref({
      email: '',
      password: '',
      remember: false
    })

    const handleLogin = async () => {
      if (!form.value.email || !form.value.password) {
        toast.error('لطفاً تمام فیلدها را پر کنید')
        return
      }

      loading.value = true

      try {
        const result = await store.dispatch('auth/login', {
          email: form.value.email,
          password: form.value.password
        })

        if (result.success) {
          toast.success(`خوش آمدید ${result.user.name}!`)
          router.push('/')
        } else {
          toast.error(result.error)
        }
      } catch (error) {
        toast.error('خطا در ارتباط با سرور')
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      loading,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  padding: var(--spacing-md);
}

.login-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: var(--spacing-2xl);
  width: 100%;
  max-width: 400px;
  box-shadow: var(--shadow-lg);
}

.login-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.login-header h2 {
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.login-header p {
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-sm);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  color: var(--text-secondary);
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
}

.forgot-link {
  color: var(--primary-color);
  text-decoration: none;
  transition: color 0.2s ease;
}

.forgot-link:hover {
  color: var(--primary-light);
}

.login-btn {
  height: 48px;
  font-size: var(--font-size-base);
  font-weight: 600;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.login-footer {
  text-align: center;
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
  color: var(--text-muted);
}

.register-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
  margin-right: var(--spacing-xs);
}

.register-link:hover {
  color: var(--primary-light);
}

@media (max-width: 480px) {
  .login-card {
    padding: var(--spacing-xl);
  }
  
  .form-options {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: flex-start;
  }
}
</style>
