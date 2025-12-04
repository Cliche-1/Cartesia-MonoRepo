import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';
import { ModuleSelectPage } from './pages/start/module-select.page';

export const routes: Routes = [
  { path: '', component: ModuleSelectPage },
  { path: 'home', loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage) },
  { path: 'roadmaps/oficiales', loadComponent: () => import('./pages/roadmaps/official.page').then(m => m.RoadmapsOfficialPage) },
  { path: 'roadmaps/ia', loadComponent: () => import('./pages/roadmaps/ai.page').then(m => m.RoadmapsAIPage) },
  { path: 'roadmaps/comunidad', loadComponent: () => import('./pages/roadmaps/community.page').then(m => m.RoadmapsCommunityPage) },
  { path: 'roadmaps/comunidad/:id', loadComponent: () => import('./pages/roadmaps/community-detail.page').then(m => m.CommunityRoadmapDetailPage) },
  { path: 'mis-roadmaps', loadComponent: () => import('./pages/roadmaps/my.page').then(m => m.MyRoadmapsPage) },
  { path: 'roadmaps/editor', canActivate: [authGuard], loadComponent: () => import('./pages/editor/roadmap-editor.page').then(m => m.RoadmapEditorPage) },
  { path: 'roadmaps/preview', loadComponent: () => import('./pages/preview/roadmap-preview.page').then(m => m.RoadmapPreviewPage) },
  { path: 'buscar', loadComponent: () => import('./pages/search/search.page').then(m => m.SearchPage) },
  { path: 'login', loadComponent: () => import('./pages/auth/login.page').then(m => m.LoginPage) },
  { path: 'register', loadComponent: () => import('./pages/auth/register.page').then(m => m.RegisterPage) },
  { path: 'tutor/aprende', loadComponent: () => import('./pages/tutor/learn.page').then(m => m.TutorLearnAIPage) },
  { path: 'tutor/aprende/profesores', loadComponent: () => import('./pages/tutor/teachers.page').then(m => m.TutorTeachersPage) },
  { path: 'tutor/aprende/materiales', loadComponent: () => import('./pages/tutor/materials.page').then(m => m.TutorMaterialsPage) },
  { path: 'tutor/aprende/conviertete-en-profesor', loadComponent: () => import('./pages/tutor/become.page').then(m => m.TutorBecomePage) },
  { path: 'tutor/aprende/profesor/aplicar', loadComponent: () => import('./pages/tutor/apply.page').then(m => m.TutorApplyPage) },
  { path: 'tutor/aprende/registro-profesor', loadComponent: () => import('./pages/tutor/register.page').then(m => m.TutorRegisterPage) },
  { path: 'tutor/profesor/perfil', loadComponent: () => import('./pages/tutor/teacher-profile.page').then(m => m.TeacherProfilePage) },
  { path: 'tutor/roadmap-chat', loadComponent: () => import('./pages/tutor/roadmap-chat.page').then(m => m.TutorRoadmapChatPage) },
  { path: 'pro', loadComponent: () => import('./pages/pro/pro.page').then(m => m.ProPlansPage) },
  { path: 'account', loadComponent: () => import('./pages/account/profile.page').then(m => m.ProfilePage) },
  { path: 'amigos', loadComponent: () => import('./pages/social/friends.page').then(m => m.FriendsPage) },
  { path: '**', redirectTo: '' }
];
