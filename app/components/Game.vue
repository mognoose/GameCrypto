<template>
	<div class="session-id">{{session}}</div>
	<form class="chat" @submit.prevent="submit">
	<pre>{{ gameData }}</pre>
	<input type="text" v-model="message">
</form>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { doc, setDoc, arrayUnion, onSnapshot, type Firestore } from 'firebase/firestore';
import type { Message, GameData } from '~/types/game';

const { $db } = useNuxtApp()
const db = $db as Firestore;

const props = defineProps({
	session: {
		type: String,
		required: true
	}
})

const message = ref('')
const gameData = ref<GameData | null>(null)

onMounted(() => {
	const sessionDocRef = doc(db, 'sessions', props.session);
	onSnapshot(sessionDocRef, (doc) => {
		if (doc.exists()) {
			gameData.value = doc.data() as GameData;
		} else {
			gameData.value = { messages: [] };
		}
	});
})

async function submit() {
	const payload: Message = {
		message: message.value,
		user: 'sapatti',
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