import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private client: SupabaseClient | null = null;

  constructor() {
    const metaUrl = document.querySelector('meta[name="supabase-url"]')?.getAttribute('content') || '';
    const metaAnon = document.querySelector('meta[name="supabase-anon-key"]')?.getAttribute('content') || '';
    if (metaUrl && metaAnon) {
      this.client = createClient(metaUrl, metaAnon);
    }
  }

  ready(): boolean { return !!this.client; }
  get(): SupabaseClient | null { return this.client; }
}
