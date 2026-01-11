<template>
	<form v-if="userName" class="select-game" @submit.prevent="selectGame">
		<input v-model="session" type="text">
		<input type="submit" value="Join">
		<button @click="selectGame">New Game</button>
	</form>
	<form v-else @submit.prevent="setUserName">
		<h2>Please enter your username</h2>
		<input class="username-input" type="text" v-model="newUserName">
		<input type="submit" value="Enter">
	</form>
</template>

<script setup lang="ts">
	const session = ref('')
	const emit = defineEmits(['select'])

	const props = defineProps({
		urlSession: {
			type: String,
			default: ''
		}
	})

	const userName = ref('')
	const newUserName = ref('')

	function setUserName() {
		localStorage.setItem('username', newUserName.value)
		userName.value = newUserName.value
		if (props.urlSession) {
			emit('select', props.urlSession)
		}
	}

	onMounted(() => {
		userName.value = localStorage.getItem('username')
		if (userName.value && props.urlSession) {
			emit('select', props.urlSession)
		}
	})


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