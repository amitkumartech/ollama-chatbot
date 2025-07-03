import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ChatComponent } from './chat/chat';

@Component({
  selector: 'app-root',
  imports: [ChatComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class App {
  protected title = 'ollama-chatbot';
}
