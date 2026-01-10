<template>
	<form class="select-game" @submit.prevent="selectGame">
		<input v-model="session" type="text">
		<input type="submit" value="Join">
		<button @click="selectGame">New Game</button>
	</form>
</template>

<script setup lang="ts">
	const session = ref('')
	const emit = defineEmits(['select'])

	function selectGame() {
		if(!session.value) session.value = makeid()
		emit('select', session.value)
	}

	function makeid() {
			let result = ''
			const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
			const charactersLength = characters.length
			
			for ( var i = 0; i < 5; i++ ) {
				result += characters.charAt(Math.floor(Math.random() * charactersLength));
			}
			
			return result;
	}

</script>