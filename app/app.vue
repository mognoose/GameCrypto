<template>
  <div>
    <NuxtRouteAnnouncer />
    <header>
      <h1>GameCrypto</h1>
      <Icon name="material-symbols:menu-rounded" size="3rem" @click="toggleSettings" />
    </header>
    <Settings v-if="settingsOpen" />
    <SelectGame v-if="!settingsOpen && !session" @select="setSession" />
    <Game v-else-if="!settingsOpen" :session />
  </div>
</template>

<script lang="ts" setup>
  import { onMounted } from 'vue';
  const session = ref<string>('')
  const settingsOpen = ref<boolean>(false)

	function toggleSettings() {
		settingsOpen.value = !settingsOpen.value
		console.log(settingsOpen.value);
	}

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