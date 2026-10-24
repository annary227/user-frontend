<template>
  <div style="min-height: 100vh; background: #0f172a; display: flex; justify-content: center; align-items: center;">
    <div style="background: white; padding: 40px; border-radius: 20px; width: 400px;">
      <h2 style="text-align: center; color: #1e293b;">新規登録</h2>
      <input v-model="username" placeholder="用户名" style="width: 100%; padding: 12px; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 8px;" />
      <input v-model="password" type="password" placeholder="密码" style="width: 100%; padding: 12px; margin-bottom: 20px; border: 1px solid #ccc; border-radius: 8px;" />
      <button @click="register" style="width: 100%; padding: 14px; background: #e83862; color: white; border: none; border-radius: 8px; cursor: pointer;">注册</button>
      <p style="text-align: center; margin-top: 15px;"><a @click="$router.push('/login')" style="color: #e83862; cursor: pointer;">已有账号？去登录</a></p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import request from '../api/request';
import { ElMessage } from 'element-plus';

const username = ref('');
const password = ref('');
const router = useRouter();

const register = async () => {
  if (!username.value || !password.value) return ElMessage.warning('请填写账号密码');
  try {
    const res = await request.post('/user/register', { username: username.value, password: password.value });
    if (res.data.success) {
      ElMessage.success('注册成功，请登录');
      router.push('/login');
    }
  } catch (error) {
    ElMessage.error(error.response?.data?.error || '注册失败');
  }
};
</script>