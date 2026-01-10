<template>
	<div class="session-id">{{session}}</div>
	<form class="chat" @submit.prevent="submit">
	<pre>{{ gameData }}</pre>
	<input type="text" v-model="message">
</form>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { doc, setDoc, arrayUnion, onSnapshot } from 'firebase/firestore';

const { $db } = useNuxtApp()

const props = defineProps({
	session: {
		type: String,
		required: true
	}
})

const message = ref('')
const gameData = ref(null)

onMounted(() => {
	const sessionDocRef = doc($db, 'sessions', props.session);
	onSnapshot(sessionDocRef, (doc) => {
		if (doc.exists()) {
			gameData.value = doc.data();
		} else {
			gameData.value = { messages: [] };
		}
	});
})

async function submit() {
	const payload = {
		message: message.value,
		user: 'sapatti',
		createdAt: Date.now(),
	}

	const sessionDocRef = doc($db, 'sessions', props.session);
	await setDoc(
		sessionDocRef,
		{ messages: arrayUnion(payload) },
		{ merge: true },
	);

	message.value = ''
	
}
</script>