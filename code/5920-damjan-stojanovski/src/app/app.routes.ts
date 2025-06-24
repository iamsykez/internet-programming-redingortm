import { Routes } from '@angular/router';
import { MoviesListComponent } from './components/movies-list/movies-list.component';
import { MovieDetailsComponent } from './components/movie-details/movie-details.component';
import { MovieCreateComponent } from './components/movie-create/movie-create.component';
import { MovieEditComponent } from './components/movie-edit/movie-edit.component';
import { ActorDetailsComponent } from './components/actor-details/actor-details.component';
import { CastCreateComponent } from './components/cast-create/cast-create.component';
import { AboutComponent } from './components/about/about.component';
import { StatisticsComponent } from './components/statistics/statistics.component';

export const routes: Routes = [
  { path: '', redirectTo: '/movies', pathMatch: 'full' },
  { path: 'movies', component: MoviesListComponent },
  { path: 'movies/create', component: MovieCreateComponent },
  { path: 'movies/:id/cast/add', component: CastCreateComponent },
  { path: 'movies/:id/edit', component: MovieEditComponent },
  { path: 'movies/:id', component: MovieDetailsComponent },
  { path: 'actor/:id', component: ActorDetailsComponent },
  { path: 'statistics', component: StatisticsComponent },
  { path: 'about', component: AboutComponent },
  // TODO: Add remaining components as they are created
  // { path: 'movies/:id/edit', component: MovieEditComponent },
  // { path: 'actor/:id', component: ActorDetailsComponent },
];
