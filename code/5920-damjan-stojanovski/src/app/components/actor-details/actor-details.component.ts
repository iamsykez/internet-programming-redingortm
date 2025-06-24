import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Actor } from '../../models/actor.model';
import { Movie } from '../../models/movie.model';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-actor-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './actor-details.component.html',
  styleUrl: './actor-details.component.css'
})
export class ActorDetailsComponent implements OnInit {
  actor: Actor | null = null;
  movies: Movie[] = [];
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadActor(parseInt(id));
    }
  }

  loadActor(id: number): void {
    this.loading = true;
    
    // Load actor and movies in parallel
    Promise.all([
      this.apiService.getActor(id).toPromise(),
      this.apiService.getMovies().toPromise()
    ]).then(([actor, movies]) => {
      if (actor) {
        this.actor = actor;
      }
      
      if (movies) {
        this.movies = movies;
      }
      
      this.loading = false;
    }).catch(error => {
      this.error = 'Failed to load actor data';
      this.loading = false;
      console.error('Error loading actor:', error);
    });
  }

  getNotableWorksWithLinks(): { title: string; hasDetails: boolean; movieId?: number }[] {
    if (!this.actor?.notable_works || !this.movies) return [];
    
    return this.actor.notable_works
      .map(title => {
        const movie = this.movies.find(m => m.title === title);
        return {
          title,
          hasDetails: !!movie,
          movieId: movie?.id
        };
      })
      .sort((a, b) => a.title.localeCompare(b.title));
  }

  formatHeight(height: number): string {
    const meters = Math.floor(height / 100);
    const centimeters = height % 100;
    return `${meters}m ${centimeters}cm`;
  }

  goBack(): void {
    this.router.navigate(['/movies']);
  }
} 