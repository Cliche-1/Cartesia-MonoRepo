import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface AuthResponse { token: string }
export interface UserInfo { id: number; email: string; username: string }
export interface DiagramData { nodes: any[]; edges: any[] }
export interface LearningPath { id: number; title: string; description?: string }

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/api/v1';
  private tokenKey = 'cartesia.token';

  get token(): string | null { return localStorage.getItem(this.tokenKey); }
  set token(v: string | null) {
    if (v) localStorage.setItem(this.tokenKey, v);
    else localStorage.removeItem(this.tokenKey);
  }
  isAuthenticated(): boolean { return !!this.token; }

  private authHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': this.token ? `Bearer ${this.token}` : ''
    });
  }

  async register(payload: { email: string; username: string; password: string }): Promise<AuthResponse> {
    const url = `${this.baseUrl}/auth/register`;
    return await firstValueFrom(this.http.post<AuthResponse>(url, payload));
  }

  async login(payload: { email: string; password: string }): Promise<AuthResponse> {
    const url = `${this.baseUrl}/auth/login`;
    return await firstValueFrom(this.http.post<AuthResponse>(url, payload));
  }

  async me(): Promise<UserInfo> {
    const url = `${this.baseUrl}/me`;
    return await firstValueFrom(this.http.get<UserInfo>(url, { headers: this.authHeaders() }));
  }

  async getDiagram(learningPathId: number): Promise<DiagramData> {
    const url = `${this.baseUrl}/learning-paths/${learningPathId}/diagram`;
    const res = await firstValueFrom(this.http.get<{ diagramJSON: string }>(url));
    try {
      const parsed = JSON.parse(res?.diagramJSON || '{"nodes":[],"edges":[]}');
      return parsed as DiagramData;
    } catch {
      return { nodes: [], edges: [] };
    }
  }

  async updateDiagram(learningPathId: number, diagram: DiagramData): Promise<boolean> {
    const url = `${this.baseUrl}/learning-paths/${learningPathId}/diagram`;
    const payload = { diagramJSON: JSON.stringify(diagram) };
    const res = await firstValueFrom(this.http.put<{ ok: boolean }>(url, payload, { headers: this.authHeaders() }));
    return !!res?.ok;
  }

  async listLearningPaths(): Promise<LearningPath[]> {
    const url = `${this.baseUrl}/learning-paths`;
    return await firstValueFrom(this.http.get<LearningPath[]>(url));
  }

  async listMyLearningPaths(): Promise<LearningPath[]> {
    const url = `${this.baseUrl}/learning-paths/mine`;
    return await firstValueFrom(this.http.get<LearningPath[]>(url, { headers: this.authHeaders() }));
  }

  async createLearningPath(payload: { title: string; description?: string }): Promise<LearningPath> {
    const url = `${this.baseUrl}/learning-paths`;
    return await firstValueFrom(this.http.post<LearningPath>(url, payload, { headers: this.authHeaders() }));
  }
}