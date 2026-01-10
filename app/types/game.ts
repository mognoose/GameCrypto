export interface Message {
  message: string;
  user: string|null;
  createdAt: number;
  requestedAmount?: number;
}

export interface GameData {
  players: [{
    player: string,
    money: number,
  }]
  messages: Message[];
}
