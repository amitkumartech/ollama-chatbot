import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { marked } from 'marked';

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

  // sendMessage(prompt: string): void {
  //   const text = prompt.trim();
  //   if (!text) return;

  //   this.messages.push({ from: 'user', text });
  //   this.isLoading = true;
  //   const loaderIndex = this.messages.push({ from: 'bot', loading: true }) - 1;

  //   this.http.post<{ response: string }>(
  //     'http://localhost:11434/api/generate',
  //     { model: 'llama3', prompt: text, stream: false }
  //   ).subscribe({
  //     next: res => this.messages[loaderIndex] = { from: 'bot', text: res.response },
  //     error: err => this.messages.push({ from: 'bot', text: '⚠️ ' + err.message }),
  //     complete: () => this.isLoading = false,
  //   });
  // }

  // ollama-api.service.ts  (add this beside the existing generate() method)



  // ollama-api.service.ts  (add this beside the existing generate() method)



  streamGenerate(prompt: string, model = 'gemma:2b'): Observable<string> {
    // Returns an Observable that pushes **each token / chunk** as it arrives.
    return new Observable<string>((observer) => {
      fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt, stream: true }),
      })
        .then(async (res) => {
          const reader = res.body!.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            // Ollama sends newline‑delimited JSON
            let idx: number;
            while ((idx = buffer.indexOf('\n')) >= 0) {
              const line = buffer.slice(0, idx).trim();
              buffer = buffer.slice(idx + 1);
              if (!line) continue;

              const chunk = JSON.parse(line);        // { response: "...", done: false/true }
              observer.next(chunk.response);         // emit the new fragment
              if (chunk.done) {
                observer.complete();
                return;
              }
            }
          }
          observer.complete();
        })
        .catch((err) => observer.error(err));
    });
  }

  // chat.component.ts  (only changed parts shown)

  sendMessage(prompt: string): void {
    const text = prompt.trim();
    if (!text) return;

    // 1. user bubble
    this.messages.push({ from: 'user', text });

    // 2. bot “stream” bubble (starts empty, will fill up)
    const botIndex = this.messages.push({ from: 'bot', text: '' }) - 1;

    // 3. subscribe to the stream
    this
      .streamGenerate(text)                 // <—— new call
      .subscribe({
        next: (chunk) => {
          // append incoming tokens
          this.messages[botIndex].text += chunk;
        },
        error: (err) => {
          this.messages[botIndex].text = '⚠️ ' + err.message;
        },
      });
  }

  getItFormatted(llmResponse: any) {
    const html = marked(llmResponse);
    return html;

  }

  getItFormattedCheck(llmResponse: any) {
    const html = marked(llmResponse);
    console.log("temp log added");

    return html.toString();

  }





}

