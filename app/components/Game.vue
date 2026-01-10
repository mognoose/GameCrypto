<template>
	<div class="session-id">{{session}}</div>
	<form v-if="selectedTab === 'chat'" class="chat" @submit.prevent="submit">
		<div class="messages">
			<p v-for="message in gameData?.messages">
				<span class="time">{{ formatTime(message.createdAt) }}</span>
				<span class="user">{{ message.user }}: </span>
				<span class="message">{{ message.message }}</span>
			</p>
		</div>
		<input id="message" type="text" v-model="message">
		<div class="actions">
			<button type="button" @click="setTab('send')">Send money</button>
			<button type="button" @click="setTab('req')">Request money</button>
		</div>
	</form>
	<div v-else-if="selectedTab === 'send'" class="transactions">
		<div class="actions">
			<button @click="setTab('chat')">Cancel</button>
		</div>
	</div>
	<div v-else-if="selectedTab === 'req'">
		<div class="actions">
			<button @click="setTab('chat')">Cancel</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { doc, setDoc, arrayUnion, onSnapshot, type Firestore, getDoc, updateDoc } from 'firebase/firestore';
import type { Message, GameData } from '~/types/game';
import { formatTime } from '~/composables/time';

const { $db } = useNuxtApp()
const db = $db as Firestore;

const props = defineProps({
	session: {
		type: String,
		required: true
	}
})

const selectedTab = ref('chat')
const message = ref('')
const gameData = ref<GameData | null>(null)

onMounted(async() => {
	const userName = localStorage.getItem('username')
	if (!userName) {
		localStorage.removeItem('session')
		
		return
	}
	const sessionDocRef = doc(db, 'sessions', props.session);
	const docSnap = await getDoc(sessionDocRef);

	if (docSnap.exists()) {
		const data = docSnap.data() as GameData;
		if (!data.players.some(p => p.player === userName)) {
			await updateDoc(sessionDocRef, {
				players: arrayUnion({ player: userName, money: 0 })
			});
		}
	} else {
		await setDoc(sessionDocRef, { players: [{player: userName, money: 0}], messages: [] });
	}

	onSnapshot(sessionDocRef, (doc) => {
		if (doc.exists()) {
			gameData.value = doc.data() as GameData;
		} else {
			gameData.value = null;
		}
	});
})

function setTab(tab: string) {
	selectedTab.value = tab
}

async function submit() {
	const payload: Message = {
		message: message.value,
		user: localStorage.getItem('username'),
		createdAt: Date.now(),
	}

	const sessionDocRef = doc(db, 'sessions', props.session);
	await setDoc(
		sessionDocRef,
		{ messages: arrayUnion(payload) },
		{ merge: true },
	);

	message.value = ''
	
}
</script>