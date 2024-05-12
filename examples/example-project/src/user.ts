export interface Messages {
  timestamp: string;
  message: string;
  submessages?: Messages[];
}

export interface User {
  username: string;
  email: string;
  password?: string;
  birthdate: `${number}-${number}-${number}T`;
  gender: 'male' | 'female' | 'other';
  messages: Messages[];
}
