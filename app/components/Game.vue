<template>
	<div class="session-id">{{session}}</div>
	<form class="chat" @submit.prevent="submit">
	<pre>{{ session }}</pre>
	<input type="text" v-model="message">
</form>
</template>

<script setup lang="ts">
import { doc, setDoc, arrayUnion } from 'firebase/firestore';

const { $db } = useNuxtApp()

const props = defineProps({
	session: {
		type: String,
		required: true
	}
})

const message = ref('')

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