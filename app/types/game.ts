export interface Message {
  message: string;
  user: string;
  createdAt: number;
}

export interface GameData {
  messages: Message[];
}
