import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface AuthResponse { token: string }
export interface UserInfo { id: number; email: string; username: string }
export interface DiagramData { nodes: any[]; edges: any[] }
export interface LearningPath { id: number; title: string; description?: string; visibility?: 'public'|'private'; createdAt?: string; stepsCount?: number; resourcesCount?: number; thumbnail?: string; provider?: string }
export interface ResourceUploadResponse { type: string; title?: string; url: string; mimeType?: string; size?: number; storagePath?: string }
export interface SearchRoadmapsResponse { items: LearningPath[]; page: number; pageSize: number; total: number; sortBy: string; sortDir: 'ASC'|'DESC' }

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/api/v1';
  private tokenKey = 'cartesia.token';
  authState = signal<boolean>(!!localStorage.getItem('cartesia.token'));

  get token(): string | null { return localStorage.getItem(this.tokenKey); }
  set token(v: string | null) {
    if (v) localStorage.setItem(this.tokenKey, v);
    else localStorage.removeItem(this.tokenKey);
    this.authState.set(!!v);
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


  // Eliminado soporte de Supabase: intercambio de token descontinuado

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

  async listPublicLearningPaths(): Promise<LearningPath[]> {
    const url = `${this.baseUrl}/public-learning-paths`;
    return await firstValueFrom(this.http.get<LearningPath[]>(url));
  }

  async listMyLearningPaths(): Promise<LearningPath[]> {
    const url = `${this.baseUrl}/learning-paths/mine`;
    return await firstValueFrom(this.http.get<LearningPath[]>(url, { headers: this.authHeaders() }));
  }

  async createLearningPath(payload: { title: string; description?: string; visibility?: 'public'|'private' }): Promise<LearningPath> {
    const url = `${this.baseUrl}/learning-paths`;
    return await firstValueFrom(this.http.post<LearningPath>(url, payload, { headers: this.authHeaders() }));
  }

  async updateLearningPath(id: number, data: { title?: string; description?: string; visibility?: 'public'|'private' }): Promise<LearningPath> {
    const url = `${this.baseUrl}/learning-paths/${id}`;
    return await firstValueFrom(this.http.put<LearningPath>(url, data, { headers: this.authHeaders() }));
  }

  async deleteLearningPath(id: number): Promise<{ ok: boolean }> {
    const url = `${this.baseUrl}/learning-paths/${id}`;
    return await firstValueFrom(this.http.delete<{ ok: boolean }>(url, { headers: this.authHeaders() }));
  }

  async lockLearningPath(id: number): Promise<{ ok: boolean }> {
    const url = `${this.baseUrl}/learning-paths/${id}/lock`;
    return await firstValueFrom(this.http.post(url, {}, { headers: this.authHeaders() })) as any;
  }

  async unlockLearningPath(id: number): Promise<{ ok: boolean }> {
    const url = `${this.baseUrl}/learning-paths/${id}/unlock`;
    return await firstValueFrom(this.http.post(url, {}, { headers: this.authHeaders() })) as any;
  }

  async listCollaborators(id: number): Promise<{ items: { userId:number; role:string }[] }> {
    const url = `${this.baseUrl}/learning-paths/${id}/collaborators`;
    return await firstValueFrom(this.http.get<{ items: { userId:number; role:string }[] }>(url, { headers: this.authHeaders() }));
  }

  async inviteCollaborator(id: number, email: string, role: 'editor'|'collaborator'|'reader' = 'collaborator'): Promise<{ token: string }> {
    const url = `${this.baseUrl}/learning-paths/${id}/invite`;
    return await firstValueFrom(this.http.post<{ token: string }>(url, { email, role }, { headers: this.authHeaders() }));
  }

  async acceptInvitation(token: string): Promise<{ ok: boolean }> {
    const url = `${this.baseUrl}/learning-paths/invitations/${encodeURIComponent(token)}/accept`;
    return await firstValueFrom(this.http.post<{ ok: boolean }>(url, {}, { headers: this.authHeaders() }));
  }

  // RF-006: Búsqueda avanzada de roadmaps
  async searchRoadmaps(params: { q?: string; authorId?: number; hasResources?: boolean; resourceType?: string; minSteps?: number; maxSteps?: number; sortBy?: 'created_at'|'title'|'steps_count'; sortDir?: 'ASC'|'DESC'; page?: number; pageSize?: number }): Promise<SearchRoadmapsResponse> {
    const url = `${this.baseUrl}/search/roadmaps`;
    const query: any = {};
    if (params.q) query.q = params.q;
    if (params.authorId != null) query.authorId = String(params.authorId);
    if (params.hasResources != null) query.hasResources = String(params.hasResources);
    if (params.resourceType) query.resourceType = params.resourceType;
    if (params.minSteps != null) query.minSteps = String(params.minSteps);
    if (params.maxSteps != null) query.maxSteps = String(params.maxSteps);
    if (params.sortBy) query.sortBy = params.sortBy;
    if (params.sortDir) query.sortDir = params.sortDir;
    if (params.page) query.page = String(params.page);
    if (params.pageSize) query.pageSize = String(params.pageSize);
    const qs = new URLSearchParams(query).toString();
    return await firstValueFrom(this.http.get<SearchRoadmapsResponse>(`${url}?${qs}`, { headers: this.authHeaders() }));
  }

  async getLearningPathSummary(id: number): Promise<LearningPath & { author?: { id:number; username?: string } }> {
    const url = `${this.baseUrl}/learning-paths/${id}/summary`;
    return await firstValueFrom(this.http.get<LearningPath & { author?: { id:number; username?: string } }>(url, { headers: this.authHeaders() }));
  }

  async getLearningPathDiagram(id: number): Promise<{ diagramJSON: string }> {
    const url = `${this.baseUrl}/learning-paths/${id}/diagram`;
    return await firstValueFrom(this.http.get<{ diagramJSON: string }>(url, { headers: this.authHeaders() }));
  }

  async getLearningPathComments(id: number): Promise<{ items: { id:number; content:string; createdAt:string; username:string }[] }> {
    const url = `${this.baseUrl}/learning-paths/${id}/comments`;
    return await firstValueFrom(this.http.get<{ items: { id:number; content:string; createdAt:string; username:string }[] }>(url, { headers: this.authHeaders() }));
  }

  async postRoadmapComment(id: number, content: string): Promise<{ id: number }> {
    const url = `${this.baseUrl}/learning-paths/${id}/comments`;
    return await firstValueFrom(this.http.post<{ id: number }>(url, { content }, { headers: this.authHeaders() }));
  }

  async rateLearningPath(id: number, score: number): Promise<{ ok: boolean }> {
    const url = `${this.baseUrl}/learning-paths/${id}/rate`;
    return await firstValueFrom(this.http.post<{ ok: boolean }>(url, { score }, { headers: this.authHeaders() }));
  }

  async getLearningPathRatings(id: number): Promise<{ avg: number; breakdown: { score: number; count: number }[] }> {
    const url = `${this.baseUrl}/learning-paths/${id}/ratings`;
    return await firstValueFrom(this.http.get<{ avg: number; breakdown: { score: number; count: number }[] }>(url, { headers: this.authHeaders() }));
  }

  async listVersions(id: number): Promise<{ items: { id:number; createdAt:string; authorId:number }[] }> {
    const url = `${this.baseUrl}/learning-paths/${id}/versions`;
    return await firstValueFrom(this.http.get<{ items: { id:number; createdAt:string; authorId:number }[] }>(url, { headers: this.authHeaders() }));
  }

  async getVersionDiagram(id: number, versionId: number): Promise<{ diagramJSON: string }> {
    const url = `${this.baseUrl}/learning-paths/${id}/versions/${versionId}`;
    return await firstValueFrom(this.http.get<{ diagramJSON: string }>(url, { headers: this.authHeaders() }));
  }

  async logExport(id: number, options: { includeResources: boolean; includeComments: boolean; versionId?: number; pageSize: string; orientation: string }): Promise<{ ok: boolean }> {
    const url = `${this.baseUrl}/learning-paths/${id}/export/log`;
    return await firstValueFrom(this.http.post<{ ok: boolean }>(url, options, { headers: this.authHeaders() }));
  }

  async postPathStepComment(id: number, content: string): Promise<{ id: number }> {
    const url = `${this.baseUrl}/path-steps/${id}/comments`;
    return await firstValueFrom(this.http.post<{ id: number }>(url, { content }, { headers: this.authHeaders() }));
  }

  async rateResource(id: number, score: number): Promise<{ ok: boolean }> {
    const url = `${this.baseUrl}/resources/${id}/rate`;
    return await firstValueFrom(this.http.post<{ ok: boolean }>(url, { score }, { headers: this.authHeaders() }));
  }

  async getResourceRatings(id: number): Promise<{ avg: number; breakdown: { score: number; count: number }[] }> {
    const url = `${this.baseUrl}/resources/${id}/ratings`;
    return await firstValueFrom(this.http.get<{ avg: number; breakdown: { score: number; count: number }[] }>(url, { headers: this.authHeaders() }));
  }

  // RF-006: Sugerencias/autocompletar
  async searchSuggestions(q: string): Promise<{ learningPaths: { id:number; title:string }[]; pathSteps: { id:number; title:string; learningPathId:number }[] }> {
    const url = `${this.baseUrl}/search/suggestions?q=${encodeURIComponent(q)}`;
    return await firstValueFrom(this.http.get<{ learningPaths: { id:number; title:string }[]; pathSteps: { id:number; title:string; learningPathId:number }[] }>(url, { headers: this.authHeaders() }));
  }

  // RF-005: Subir archivo
  async uploadResourceFile(file: File, title?: string): Promise<ResourceUploadResponse> {
    const url = `${this.baseUrl}/resources/upload`;
    const form = new FormData();
    form.append('file', file);
    if (title) form.append('title', title);
    const res = await firstValueFrom(this.http.post<ResourceUploadResponse>(url, form, { headers: this.authHeaders() }));
    const origin = this.baseUrl.replace('/api/v1', '');
    if (res?.url && !res.url.startsWith('http')) {
      res.url = origin + res.url;
    }
    return res;
  }

  // RF-005: Metadatos de enlace
  async fetchResourceMetadata(resourceUrl: string): Promise<{ title?: string; description?: string; thumbnail?: string; provider?: string; type?: string; embedHtml?: string; url?: string }> {
    const url = `${this.baseUrl}/resources/metadata`;
    const payload = { url: resourceUrl };
    return await firstValueFrom(this.http.post(url, payload, { headers: this.authHeaders() }));
  }

  // Teacher application API
  async getMyTeacherApplication(): Promise<{ status?: string; id?: number } | any> {
    const url = `${this.baseUrl}/teacher/applications/me`;
    return await firstValueFrom(this.http.get<{ status?: string; id?: number } | any>(url, { headers: this.authHeaders() }));
  }

  async saveTeacherApplication(data: { publicName?: string; legalName?: string; email?: string; phone?: string; location?: string; referral?: string; topics?: string; ages?: string; expertise?: string; years?: string; bio?: string }): Promise<{ ok: boolean }> {
    const url = `${this.baseUrl}/teacher/applications`;
    return await firstValueFrom(this.http.post<{ ok: boolean }>(url, data, { headers: this.authHeaders() }));
  }

  async saveTeacherVideo(videoUrl: string): Promise<{ ok: boolean }> {
    const url = `${this.baseUrl}/teacher/applications/video`;
    return await firstValueFrom(this.http.post<{ ok: boolean }>(url, { videoUrl }, { headers: this.authHeaders() }));
  }

  async submitTeacherApplication(agree: boolean): Promise<{ ok: boolean }> {
    const url = `${this.baseUrl}/teacher/applications/submit`;
    return await firstValueFrom(this.http.post<{ ok: boolean }>(url, { agree }, { headers: this.authHeaders() }));
  }

  async saveTeacherCV(cvUrl: string): Promise<{ ok: boolean }> {
    const url = `${this.baseUrl}/teacher/applications/cv`;
    return await firstValueFrom(this.http.post<{ ok: boolean }>(url, { cvUrl }, { headers: this.authHeaders() }));
  }
}
