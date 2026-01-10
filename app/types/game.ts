export interface Message {
  message: string;
  user: string|null;
  createdAt: number;
  requestedAmount?: number;
  from?: string;
  to?: string;
}

export interface GameData {
  players: [{
    player: string,
    money: number,
  }]
  messages: Message[];
}
