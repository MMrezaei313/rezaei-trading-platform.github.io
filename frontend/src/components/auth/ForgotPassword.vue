<template>
  <div class="forgot-password-container">
    <div class="forgot-password-card">
      <div class="forgot-password-header">
        <router-link to="/login" class="back-button">
          <i class="icon-arrow-right"></i>
          بازگشت
        </router-link>
        <img :src="logo" alt="Rezaei Trading" class="logo" />
        <h1 class="title">بازیابی رمز عبور</h1>
        <p class="subtitle">ایمیل خود را وارد کنید</p>
      </div>

      <form @submit.prevent="handleSubmit" class="forgot-password-form">
        <div class="form-group">
          <label for="email" class="form-label">ایمیل</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            class="form-input"
            :class="{ 'error': errors.email }"
            placeholder="example@email.com"
            :disabled="loading"
          />
          <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
        </div>

        <button
          type="submit"
          class="submit-button"
          :disabled="loading"
          :class="{ 'loading': loading }"
        >
          <span v-if="loading" class="button-loading">
            <i class="icon-loader"></i>
            در حال ارسال...
          </span>
          <span v-else>ارسال لینک بازیابی</span>
        </button>

        <div class="help-text">
          <p>لینک بازیابی رمز عبور به ایمیل شما ارسال خواهد شد.</p>
        </div>
      </form>

      <div v-if="showSuccess" class="success-message">
        <i class="icon-success"></i>
        <h3>ایمیل بازیابی ارسال شد</h3>
        <p>لینک بازیابی رمز عبور به آدرس <strong>{{ formData.email }}</strong> ارسال شد.</p>
        <p>لطفاً صندوق ایمیل خود را بررسی کنید.</p>
        <div class="success-actions">
          <button @click="handleResend" class="btn-secondary" :disabled="resendLoading">
            {{ resendLoading ? 'در حال ارسال...' : 'ارسال مجدد' }}
          </button>
          <router-link to="/login" class="btn-primary">ورود به حساب</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'
import logo from '@/assets/images/logo.png'

export default {
  name: 'ForgotPassword',
  setup() {
    const router = useRouter()
    const store = useStore()
    const toast = useToast()

    const formData = reactive({
      email: ''
    })

    const errors = reactive({})
    const loading = ref(false)
    const resendLoading = ref(false)
    const showSuccess = ref(false)

    const validateForm = () => {
      Object.keys(errors).forEach(key => delete errors[key])

      let isValid = true

      if (!formData.email.trim()) {
        errors.email = 'ایمیل الزامی است'
        isValid = false
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'فرمت ایمیل نامعتبر است'
        isValid = false
      }

      return isValid
    }

    const handleSubmit = async () => {
      if (!validateForm()) {
        toast.error('لطفاً ایمیل خود را به درستی وارد کنید')
        return
      }

      loading.value = true

      try {
        // Simulate API call
        await api.post('/auth/forgot-password', {email})
        
        // In real app, call: await store.dispatch('auth/forgotPassword', formData.email)
        showSuccess.value = true
        toast.success('ایمیل بازیابی با موفقیت ارسال شد')
      } catch (error) {
        toast.error('خطا در ارسال ایمیل بازیابی')
        console.error('Forgot password error:', error)
      } finally {
        loading.value = false
      }
    }

    const handleResend = async () => {
      resendLoading.value = true

      try {
        await new Promise(resolve => setTimeout(resolve, 2000))
        toast.success('ایمیل بازیابی مجدداً ارسال شد')
      } catch (error) {
        toast.error('خطا در ارسال مجدد ایمیل')
      } finally {
        resendLoading.value = false
      }
    }

    return {
      logo,
      formData,
      errors,
      loading,
      resendLoading,
      showSuccess,
      handleSubmit,
      handleResend
    }
  }
}
</script>

<style scoped>
.forgot-password-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  padding: var(--space-6);
}

.forgot-password-card {
  background: var(--bg-card);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-xl);
  padding: var(--space-8);
  width: 100%;
  max-width: 440px;
  border: 1px solid var(--border-primary);
}

.forgot-password-header {
  text-align: center;
  margin-bottom: var(--space-8);
  position: relative;
}

.back-button {
  position: absolute;
  right: 0;
  top: 0;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--text-muted);
  text-decoration: none;
  font-size: var(--font-size-sm);
  transition: color var(--transition-fast);
}

.back-button:hover {
  color: var(--color-secondary);
}

.logo {
  height: 50px;
  margin-bottom: var(--space-4);
}

.title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.subtitle {
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}

.forgot-password-form {
  margin-bottom: var(--space-8);
}

.form-group {
  margin-bottom: var(--space-6);
}

.form-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  margin-bottom: var(--space-2);
  display: block;
}

.form-input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--border-primary);
  border-radius: var(--border-radius);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: var(--font-size-base);
  transition: all var(--transition-fast);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-secondary);
  box-shadow: 0 0 0 3px rgba(0, 200, 150, 0.1);
}

.form-input.error {
  border-color: var(--color-loss);
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: var(--color-loss);
  font-size: var(--font-size-xs);
  margin-top: var(--space-1);
  display: block;
}

.submit-button {
  width: 100%;
  background: var(--color-secondary);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  padding: var(--space-3) var(--space-4);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  margin-bottom: var(--space-4);
}

.submit-button:hover:not(:disabled) {
  background: var(--color-secondary-light);
  transform: translateY(-1px);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.submit-button.loading {
  pointer-events: none;
}

.button-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
}

.help-text {
  text-align: center;
  color: var(--text-muted);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
}

.success-message {
  text-align: center;
  padding: var(--space-4);
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  border: 1px solid var(--color-secondary);
}

.success-message .icon-success {
  font-size: 48px;
  color: var(--color-secondary);
  margin-bottom: var(--space-4);
}

.success-message h3 {
  color: var(--text-primary);
  margin-bottom: var(--space-3);
  font-size: var(--font-size-lg);
}

.success-message p {
  color: var(--text-muted);
  margin-bottom: var(--space-2);
  line-height: var(--line-height-relaxed);
}

.success-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: center;
  margin-top: var(--space-6);
  flex-wrap: wrap;
}

.btn-primary, .btn-secondary {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--border-radius);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background: var(--color-secondary);
  color: white;
  border: none;
}

.btn-primary:hover {
  background: var(--color-secondary-light);
}

.btn-secondary {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-primary);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--bg-tertiary);
  border-color: var(--border-secondary);
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .forgot-password-container {
    padding: var(--space-4);
  }
  
  .forgot-password-card {
    padding: var(--space-6);
  }
  
  .success-actions {
    flex-direction: column;
  }
  
  .btn-primary, .btn-secondary {
    width: 100%;
    text-align: center;
  }
}
</style>
