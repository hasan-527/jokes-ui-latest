import { Component } from '@angular/core';
import { JokesService, Joke } from '../services/jokes.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

type Grouped = { short: DisplayJoke[]; medium: DisplayJoke[]; long: DisplayJoke[] };
type DisplayJoke = { id: string; raw: string; highlighted: SafeHtml };

@Component({
  selector: 'app-jokes',
  templateUrl: './jokes.component.html',
  styleUrls: ['./jokes.component.scss']
})
export class JokesComponent {
  randomJoke?: Joke;
  searchTerm = '';
  grouped: Grouped = { short: [], medium: [], long: [] };
  loading = false;
  error?: string;

  constructor(private svc: JokesService, private sanitizer: DomSanitizer) {}

  fetchRandom() {
    this.error = undefined;
    this.randomJoke = undefined;
    this.svc.getRandomJoke().subscribe({
      next: (j: Joke) => this.randomJoke = j,
      error: (err: any) => this.error = 'Failed to fetch random joke.'
    });
  }

  onSearch() {
    const term = this.searchTerm.trim();
    if (!term) { return; }
    this.error = undefined;
    this.loading = true;
    this.grouped = { short: [], medium: [], long: [] };

    this.svc.searchJokes(term).subscribe({
      next: (all: Joke[]) => {
        // take first 30 matches
        const slice = all.slice(0, 30);
        for (const j of slice) {
          const highlighted = this.highlightTerm(j.joke, term);
          const display: DisplayJoke = { id: j.id, raw: j.joke, highlighted };
          const wc = this.wordCount(j.joke);
          if (wc < 10) this.grouped.short.push(display);
          else if (wc < 20) this.grouped.medium.push(display);
          else this.grouped.long.push(display);
        }
        this.loading = false;
      },
      error: (_: any) => {
        this.error = 'Failed to search jokes.';
        this.loading = false;
      }
    });
  }

  private wordCount(text: string) {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  private highlightTerm(text: string, term: string): SafeHtml {
    if (!term) return this.sanitizer.bypassSecurityTrustHtml(this.escapeHtml(text));
    const esc = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(${esc})`, 'gi');
    // wrap matches in <mark> for emphasis
    const replaced = this.escapeHtml(text).replace(re, '<mark>$1</mark>');
    return this.sanitizer.bypassSecurityTrustHtml(replaced);
  }

  private escapeHtml(unsafe: string) {
    return unsafe
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>');
  }
}