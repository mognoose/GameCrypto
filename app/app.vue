<template>
  <div>
    <NuxtRouteAnnouncer />
    <h1>GameCrypto</h1>
    <SelectGame v-if="!session" @select="setSession" />
    <Game v-else :session />
  </div>
</template>

<script lang="ts" setup>
  import { onMounted } from 'vue';
  const session = ref<string>('')

  function setSession(sessionId: string) {
    session.value = sessionId.toUpperCase();
    localStorage.setItem('session', sessionId.toUpperCase());
  }

  onMounted(() => {
    const savedSession = localStorage.getItem('session');
    if (savedSession) {
      session.value = savedSession;
    }
  })
</script>