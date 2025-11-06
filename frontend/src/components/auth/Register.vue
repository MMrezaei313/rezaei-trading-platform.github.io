<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <img :src="logo" alt="Rezaei Trading" class="logo" />
        <h1 class="title">ثبت‌نام در پلتفرم معاملاتی</h1>
        <p class="subtitle">حساب کاربری جدید ایجاد کنید</p>
      </div>

      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-row">
          <div class="form-group">
            <label for="firstName" class="form-label">نام</label>
            <input
              id="firstName"
              v-model="formData.firstName"
              type="text"
              class="form-input"
              :class="{ 'error': errors.firstName }"
              placeholder="نام خود را وارد کنید"
            />
            <span v-if="errors.firstName" class="error-message">{{ errors.firstName }}</span>
          </div>

          <div class="form-group">
            <label for="lastName" class="form-label">نام خانوادگی</label>
            <input
              id="lastName"
              v-model="formData.lastName"
              type="text"
              class="form-input"
              :class="{ 'error': errors.lastName }"
              placeholder="نام خانوادگی خود را وارد کنید"
            />
            <span v-if="errors.lastName" class="error-message">{{ errors.lastName }}</span>
          </div>
        </div>

        <div class="form-group">
          <label for="email" class="form-label">ایمیل</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            class="form-input"
            :class="{ 'error': errors.email }"
            placeholder="example@email.com"
          />
          <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label for="phone" class="form-label">شماره موبایل</label>
          <input
            id="phone"
            v-model="formData.phone"
            type="tel"
            class="form-input"
            :class="{ 'error': errors.phone }"
            placeholder="0912XXXXXXX"
            dir="ltr"
          />
          <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
        </div>

        <div class="form-group">
          <label for="password" class="form-label">رمز عبور</label>
          <input
            id="password"
            v-model="formData.password"
            :type="showPassword ? 'text' : 'password'"
            class="form-input"
            :class="{ 'error': errors.password }"
            placeholder="حداقل 8 کاراکتر"
          />
          <button
            type="button"
            class="password-toggle"
            @click="showPassword = !showPassword"
          >
            <i :class="showPassword ? 'icon-eye-off' : 'icon-eye'"></i>
          </button>
          <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
        </div>

        <div class="form-group">
          <label for="confirmPassword" class="form-label">تکرار رمز عبور</label>
          <input
            id="confirmPassword"
            v-model="formData.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            class="form-input"
            :class="{ 'error': errors.confirmPassword }"
            placeholder="تکرار رمز عبور"
          />
          <button
            type="button"
            class="password-toggle"
            @click="showConfirmPassword = !showConfirmPassword"
          >
            <i :class="showConfirmPassword ? 'icon-eye-off' : 'icon-eye'"></i>
          </button>
          <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input
              v-model="formData.agreeTerms"
              type="checkbox"
              class="checkbox"
              :class="{ 'error': errors.agreeTerms }"
            />
            <span class="checkmark"></span>
            <span class="checkbox-text">
              <a href="/terms" target="_blank" class="link">قوانین و مقررات</a>
              را خوانده‌ام و موافقم
            </span>
          </label>
          <span v-if="errors.agreeTerms" class="error-message">{{ errors.agreeTerms }}</span>
        </div>

        <button
          type="submit"
          class="submit-button"
          :disabled="loading"
          :class="{ 'loading': loading }"
        >
          <span v-if="loading" class="button-loading">
            <i class="icon-loader"></i>
            در حال ثبت‌نام...
          </span>
          <span v-else>ثبت‌نام</span>
        </button>

        <div class="login-link">
          <span>قبلاً حساب کاربری دارید؟</span>
          <router-link to="/login" class="link">ورود به حساب</router-link>
        </div>
      </form>
    </div>

    <!-- Success Modal -->
    <Modal
      v-if="showSuccessModal"
      @close="showSuccessModal = false"
      title="ثبت‌نام موفق"
    >
      <div class="success-modal">
        <i class="icon-success"></i>
        <h3>حساب کاربری شما با موفقیت ایجاد شد</h3>
        <p>یک ایمیل تأیید به آدرس {{ formData.email }} ارسال شده است.</p>
        <button @click="redirectToLogin" class="btn-primary">
          ورود به حساب کاربری
        </button>
      </div>
    </Modal>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'
import Modal from '@/components/shared/Modal.vue'
import logo from '@/assets/images/logo.png'

export default {
  name: 'Register',
  components: {
    Modal
  },
  setup() {
    const router = useRouter()
    const store = useStore()
    const toast = useToast()

    const formData = reactive({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false
    })

    const errors = reactive({})
    const loading = ref(false)
    const showPassword = ref(false)
    const showConfirmPassword = ref(false)
    const showSuccessModal = ref(false)

    const validateForm = () => {
      // Clear previous errors
      Object.keys(errors).forEach(key => delete errors[key])

      let isValid = true

      // First Name
      if (!formData.firstName.trim()) {
        errors.firstName = 'نام الزامی است'
        isValid = false
      }

      // Last Name
      if (!formData.lastName.trim()) {
        errors.lastName = 'نام خانوادگی الزامی است'
        isValid = false
      }

      // Email
      if (!formData.email.trim()) {
        errors.email = 'ایمیل الزامی است'
        isValid = false
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'فرمت ایمیل نامعتبر است'
        isValid = false
      }

      // Phone
      if (!formData.phone.trim()) {
        errors.phone = 'شماره موبایل الزامی است'
        isValid = false
      } else if (!/^09[0-9]{9}$/.test(formData.phone)) {
        errors.phone = 'فرمت شماره موبایل نامعتبر است'
        isValid = false
      }

      // Password
      if (!formData.password) {
        errors.password = 'رمز عبور الزامی است'
        isValid = false
      } else if (formData.password.length < 8) {
        errors.password = 'رمز عبور باید حداقل 8 کاراکتر باشد'
        isValid = false
      }

      // Confirm Password
      if (!formData.confirmPassword) {
        errors.confirmPassword = 'تکرار رمز عبور الزامی است'
        isValid = false
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'رمز عبور و تکرار آن یکسان نیستند'
        isValid = false
      }

      // Terms Agreement
      if (!formData.agreeTerms) {
        errors.agreeTerms = 'پذیرش قوانین و مقررات الزامی است'
        isValid = false
      }

      return isValid
    }

    const handleRegister = async () => {
      if (!validateForm()) {
        toast.error('لطفاً اطلاعات فرم را بررسی کنید')
        return
      }

      loading.value = true

      try {
        const result = await await api.post('/auth/register', formData)

        if (result.success) {
          showSuccessModal.value = true
          toast.success('حساب کاربری با موفقیت ایجاد شد')
        } else {
          toast.error(result.error || 'خطا در ثبت‌نام')
        }
      } catch (error) {
        toast.error('خطا در ارتباط با سرور')
        console.error('Register error:', error)
      } finally {
        loading.value = false
      }
    }

    const redirectToLogin = () => {
      showSuccessModal.value = false
      router.push('/login')
    }

    return {
      logo,
      formData,
      errors,
      loading,
      showPassword,
      showConfirmPassword,
      showSuccessModal,
      handleRegister,
      redirectToLogin
    }
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  padding: var(--space-6);
}

.register-card {
  background: var(--bg-card);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-xl);
  padding: var(--space-8);
  width: 100%;
  max-width: 480px;
  border: 1px solid var(--border-primary);
}

.register-header {
  text-align: center;
  margin-bottom: var(--space-8);
}

.logo {
  height: 60px;
  margin-bottom: var(--space-4);
}

.title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.subtitle {
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

@media (max-width: 480px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

.form-group {
  position: relative;
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  margin-bottom: var(--space-2);
}

.form-input {
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

.error-message {
  color: var(--color-loss);
  font-size: var(--font-size-xs);
  margin-top: var(--space-1);
}

.password-toggle {
  position: absolute;
  left: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: var(--space-1);
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  cursor: pointer;
  font-size: var(--font-size-sm);
}

.checkbox {
  display: none;
}

.checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border-primary);
  border-radius: var(--border-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--transition-fast);
}

.checkbox:checked + .checkmark {
  background: var(--color-secondary);
  border-color: var(--color-secondary);
}

.checkbox:checked + .checkmark::after {
  content: '✓';
  color: white;
  font-size: 12px;
}

.checkbox-text {
  color: var(--text-secondary);
  line-height: var(--line-height-normal);
}

.link {
  color: var(--color-secondary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.link:hover {
  color: var(--color-secondary-light);
}

.submit-button {
  background: var(--color-secondary);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  padding: var(--space-3) var(--space-4);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  margin-top: var(--space-2);
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

.login-link {
  text-align: center;
  margin-top: var(--space-4);
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}

.success-modal {
  text-align: center;
  padding: var(--space-4);
}

.success-modal .icon-success {
  font-size: 48px;
  color: var(--color-secondary);
  margin-bottom: var(--space-4);
}

.success-modal h3 {
  color: var(--text-primary);
  margin-bottom: var(--space-3);
}

.success-modal p {
  color: var(--text-muted);
  margin-bottom: var(--space-6);
}

.btn-primary {
  background: var(--color-secondary);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  padding: var(--space-3) var(--space-6);
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.btn-primary:hover {
  background: var(--color-secondary-light);
}
</style>
