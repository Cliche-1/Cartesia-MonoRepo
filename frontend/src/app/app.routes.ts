import { Routes } from '@angular/router';
import { HomePage } from './pages/home/home.page';
import { RoadmapsOfficialPage } from './pages/roadmaps/official.page';
import { RoadmapsAIPage } from './pages/roadmaps/ai.page';
import { RoadmapsCommunityPage } from './pages/roadmaps/community.page';
import { TutorLearnAIPage } from './pages/tutor/learn.page';
import { TutorRoadmapChatPage } from './pages/tutor/roadmap-chat.page';
import { ProPlansPage } from './pages/pro/pro.page';
import { RoadmapEditorPage } from './pages/editor/roadmap-editor.page';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'roadmaps/oficiales', component: RoadmapsOfficialPage },
  { path: 'roadmaps/ia', component: RoadmapsAIPage },
  { path: 'roadmaps/comunidad', component: RoadmapsCommunityPage },
  { path: 'roadmaps/editor', component: RoadmapEditorPage },
  { path: 'tutor/aprende', component: TutorLearnAIPage },
  { path: 'tutor/roadmap-chat', component: TutorRoadmapChatPage },
  { path: 'pro', component: ProPlansPage },
  { path: '**', redirectTo: '' }
];
