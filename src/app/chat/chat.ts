import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// chat.component.ts
interface Message {
  from: 'user' | 'bot';
  text?: string;      // present on normal messages
  loading?: boolean;  // true only on the placeholder bubble
}

@Component({
  standalone: true,
  selector: 'app-chat',
  templateUrl: './chat.html',
  styleUrl: './chat.scss',   // keep empty or omit if you like
  imports: [CommonModule, FormsModule]
})
export class ChatComponent {
  messages: Message[] = [];
  isLoading = false;
  constructor(private http: HttpClient) { }

  sendMessage(prompt: string): void {
    const text = prompt.trim();
    if (!text) return;

    this.messages.push({ from: 'user', text });
    this.isLoading = true;
    const loaderIndex = this.messages.push({ from: 'bot', loading: true }) - 1;

    this.http.post<{ response: string }>(
      'http://localhost:11434/api/generate',
      { model: 'llama3', prompt: text, stream: false }
    ).subscribe({
      next: res => this.messages[loaderIndex] = { from: 'bot', text: res.response },
      error: err => this.messages.push({ from: 'bot', text: '⚠️ ' + err.message }),
      complete: () => this.isLoading = false,
    });
  }

}

