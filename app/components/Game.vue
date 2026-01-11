<template>
	<div class="session-id">{{session}}</div>
	<form v-if="selectedTab === 'chat'" class="chat" @submit.prevent="handleChatSubmit">
		<div ref="messagesContainer" class="messages">
			<p v-for="message in gameData?.messages">
				<span class="time">{{ formatTime(message.createdAt) }}</span>
				<span class="user">{{ message.user }}: </span>
				<span class="message">{{ message.message }}</span>
				<button type="button" v-if="message.requestedAmount && message.to === playerData.player" class="pay" @click="payRequest(message)">
					Pay {{ message.requestedAmount }} to {{ message.from }}
				</button>
			</p>
		</div>
		<input id="message" type="text" v-model="message" placeholder="Type message">
		<div class="actions">
			<button type="button" @click="setTab('send')">Send money</button>
			<button type="button" @click="setTab('req')">Request money</button>
		</div>
		<div class="money">
			{{ playerData.money }} €
		</div>
	</form>
	<div v-else-if="selectedTab === 'send'" class="transactions">
		<div class="actions">
			<h1>Send</h1>
			<input type="number" v-model="amount">
			<button @click="sendMoney('bank')">Bank</button>
			<button v-for="player in gameData?.players" @click="sendMoney(player.player)">{{player.player}}</button>
			<button @click="setTab('chat')">Cancel</button>
		</div>
	</div>
	<div v-else-if="selectedTab === 'req'" class="transactions">
		<div class="actions">
			<h1>Request</h1>
			<input type="number" v-model="amount">
			<button @click="requestMoney('bank')">Bank</button>
			<button v-for="player in gameData?.players" @click="requestMoney(player.player)">{{player.player}}</button>
			<button @click="setTab('chat')">Cancel</button>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { onMounted, ref, watch, nextTick } from 'vue';
	import { doc, setDoc, arrayUnion, onSnapshot, type Firestore, getDoc, updateDoc, runTransaction } from 'firebase/firestore';
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

	const playerData = ref({player: '', money: 0})

	const amount = ref(0)
	const messagesContainer = ref<HTMLDivElement | null>(null)

	const scrollToBottom = () => {
		if (messagesContainer.value) {
			messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
		}
	};

	watch(() => gameData.value?.messages, (newMessages, oldMessages) => {
		if (newMessages && (!oldMessages || newMessages.length > oldMessages.length)) {
			nextTick(() => {
				scrollToBottom();
			});
		}
	}, { deep: true });

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
				if (gameData.value && gameData.value.players) {
					const currentPlayer = gameData.value.players.find(p => p.player === userName);
					if (currentPlayer) {
						playerData.value = currentPlayer;
					}
				}
			} else {
				gameData.value = null;
				playerData.value = {player: '', money: 0};
			}
		});
	})

	function setTab(tab: string) {
		selectedTab.value = tab
	}

	async function sendMessage(
		msg: string,
		opts: {
			requestedAmount?: number | null,
			from?: string | null,
			to?: string | null
		} = {}
	) {
		const payload: Message = {
			message: msg,
			user: localStorage.getItem('username'),
			createdAt: Date.now(),
		}

		if (opts.requestedAmount) payload.requestedAmount = opts.requestedAmount;
		if (opts.from) payload.from = opts.from;
		if (opts.to) payload.to = opts.to;
		
		const sessionDocRef = doc(db, 'sessions', props.session);
		await setDoc(
			sessionDocRef,
			{ messages: arrayUnion(payload) },
			{ merge: true },
		);
	}

	function handleChatSubmit() {
		if (message.value) {
			sendMessage(message.value);
			message.value = '';
		}
	}

	async function sendMoney(to: string) {
		const from = playerData.value.player;
		if (from === to) {
			alert("You can't send money to yourself.");
			return;
		}

		if (amount.value <= 0) {
			alert("Please enter a valid amount.");
			return;
		}

		const sessionDocRef = doc(db, 'sessions', props.session);
		try {
			await runTransaction(db, async (transaction) => {
				const sessionDoc = await transaction.get(sessionDocRef);
				if (!sessionDoc.exists()) {
					throw "Document does not exist!";
				}

				const data = sessionDoc.data() as GameData;
				const players = data.players;

				const fromPlayer = players.find(p => p.player === from);

				if (!fromPlayer) {
					throw "Sender not found!";
				}

				if (fromPlayer.money < amount.value) {
					throw "Insufficient funds!";
				}

				if (to !== 'bank' && !players.some(p => p.player === to)) {
					throw "Receiver not found!";
				}

				const updatedPlayers = players.map(p => {
					if (p.player === from) {
						return { ...p, money: p.money - amount.value };
					}
					if (p.player === to) {
						return { ...p, money: p.money + amount.value };
					}
					return p;
				});

				transaction.update(sessionDocRef, { players: updatedPlayers });
			});
			const msg = `sent ${amount.value} € to ${to}`
			sendMessage(msg)
			amount.value = 0;
			setTab('chat');
		} catch (e) {
			console.log("Transaction failed: ", e);
			alert(`Transaction failed: ${e}`);
		}
	}

	async function requestMoney(from: string) {
		if (from !== 'bank') {
			const msg = `requested ${amount.value} € from ${from}`
			sendMessage(msg, { requestedAmount: amount.value, from: playerData.value.player, to: from })
			setTab('chat');
			
			return
		}

		const sessionDocRef = doc(db, 'sessions', props.session);

		try {
			await runTransaction(db, async (transaction) => {
				const sessionDoc = await transaction.get(sessionDocRef);
				if (!sessionDoc.exists()) {
					throw "Document does not exist!";
				}

				const data = sessionDoc.data() as GameData;
				const players = data.players;

				const updatedPlayers = players.map(p => {
					if (p.player === playerData.value.player) {
						return { ...p, money: p.money + amount.value };
					}
					return p;
				});

				transaction.update(sessionDocRef, { players: updatedPlayers });
				const msg = `took ${amount.value} € from bank`
				sendMessage(msg)
				amount.value = 0;
				setTab('chat');
			})
		} catch (e) {
			console.log("Transaction failed: ", e);
			alert(`Transaction failed: ${e}`);
		}
	}

	async function payRequest(message: Message) {
		const from = playerData.value.player;
		const to = message.from;
		const requestedAmount = message.requestedAmount;

		if (!to || !requestedAmount) {
			return;
		}

		if (from === to) {
			alert("You can't pay yourself.");
			return;
		}

		if (requestedAmount <= 0) {
			alert("Invalid amount.");
			return;
		}

		const sessionDocRef = doc(db, 'sessions', props.session);
		try {
			await runTransaction(db, async (transaction) => {
				const sessionDoc = await transaction.get(sessionDocRef);
				if (!sessionDoc.exists()) {
					throw "Document does not exist!";
				}

				const data = sessionDoc.data() as GameData;
				const players = data.players;

				const fromPlayer = players.find(p => p.player === from);
				const toPlayer = players.find(p => p.player === to);

				if (!fromPlayer) {
					throw "Sender not found!";
				}

				if (!toPlayer) {
					throw "Receiver not found!";
				}

				if (fromPlayer.money < requestedAmount) {
					throw "Insufficient funds!";
				}

				const updatedPlayers = players.map(p => {
					if (p.player === from) {
						return { ...p, money: p.money - requestedAmount };
					}
					if (p.player === to) {
						return { ...p, money: p.money + requestedAmount };
					}
					return p;
				});

				transaction.update(sessionDocRef, { players: updatedPlayers });
			});
			const msg = `paid ${requestedAmount} € to ${to}`;
			sendMessage(msg);
		} catch (e) {
			console.log("Transaction failed: ", e);
			alert(`Transaction failed: ${e}`);
		}
	}


</script>