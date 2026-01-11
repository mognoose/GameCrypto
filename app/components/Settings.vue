<template>
  <div class="settings">
    <h1>Settings</h1>
    <form @submit.prevent="changeUserName">
      <input type="text" class="username-input" id="username" v-model="userName" autocomplete="none" />
      <input type="submit" value="Change username" />
      <button v-if="session" type="button" @click="leave">Leave session</button>
    </form>

  </div>
</template>

<script setup lang="ts">
import { doc, updateDoc, getDoc } from 'firebase/firestore'
import type { GameData } from '~/types/game';

const userName = ref<string|null>('')
const session = ref<string|null>(localStorage.getItem('session'))
const { $db } = useNuxtApp()

async function changeUserName() {
  if (!userName.value) {
    return
  }

  const oldUserName = localStorage.getItem('username')
  localStorage.setItem('username', userName.value)
  const session = localStorage.getItem('session')
  if (session) {
    const gameRef = doc($db, 'games', session)
    const gameSnap = await getDoc(gameRef)
    if (gameSnap.exists()) {
      const gameData = gameSnap.data() as GameData
      const playerIndex = gameData.players.findIndex(p => p.player === oldUserName)
      if (playerIndex !== -1) {
        gameData.players[playerIndex].player = userName.value
        await updateDoc(gameRef, { players: gameData.players })
      }
    }
  }
}

function leave() {
  localStorage.removeItem('session')
  window.location.reload()
}

onMounted(()=>{
  userName.value = localStorage.getItem('username')
})
</script>
