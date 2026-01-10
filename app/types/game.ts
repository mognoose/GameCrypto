export interface Message {
  message: string;
  user: string|null;
  createdAt: number;
}

export interface GameData {
  players: [{
    player: string,
    money: number,
  }]
  messages: Message[];
}
