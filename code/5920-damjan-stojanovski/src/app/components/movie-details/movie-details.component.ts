import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Movie } from '../../models/movie.model';
import { Actor } from '../../models/actor.model';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './movie-details.component.html',
  styleUrl: './movie-details.component.css'
})
export class MovieDetailsComponent implements OnInit {
  movie: Movie | null = null;
  allMovies: Movie[] = [];
  allActors: Actor[] = [];
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
      this.loadMovie(parseInt(id));
    }
  }

  loadMovie(id: number): void {
    this.loading = true;
    
    // Load movie, all movies, and all actors in parallel
    Promise.all([
      this.apiService.getMovie(id).toPromise(),
      this.apiService.getMovies().toPromise(),
      this.apiService.getActors().toPromise()
    ]).then(([movie, movies, actors]) => {
      if (movie) {
        this.movie = movie;
      }
      
      if (movies) {
        this.allMovies = movies;
      }
      
      if (actors) {
        this.allActors = actors;
      }
      
      this.loading = false;
    }).catch(error => {
      this.error = 'Failed to load movie';
      this.loading = false;
      console.error('Error loading movie:', error);
    });
  }

  deleteMovie(): void {
    if (!this.movie) return;
    
    if (confirm('Are you sure you want to delete this movie?')) {
      this.apiService.deleteMovie(this.movie.id).subscribe({
        next: () => {
          this.router.navigate(['/movies']);
        },
        error: (error) => {
          console.error('Error deleting movie:', error);
          alert('Failed to delete movie');
        }
      });
    }
  }

  getOscarEntries(): { type: string; recipient: string }[] {
    if (!this.movie?.oscars) return [];
    
    return Object.entries(this.movie.oscars)
      .map(([type, recipient]) => ({
        type: this.formatOscarType(type),
        recipient
      }))
      .sort((a, b) => a.type.localeCompare(b.type));
  }

  formatOscarType(type: string): string {
    return type
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  getSortedCast(): { actor: string; character: string; hasDetails: boolean; actorId?: number }[] {
    if (!this.movie?.cast) return [];
    
    return this.movie.cast
      .map(member => {
        const actor = this.allActors.find(a => a.name === member.actor);
        return {
          ...member,
          hasDetails: !!actor,
          actorId: actor?.id
        };
      })
      .sort((a, b) => a.actor.localeCompare(b.actor));
  }

  getSimilarMoviesByGenre(): Movie[] {
    if (!this.movie?.genre || !this.allMovies) return [];
    
    return this.allMovies
      .filter(m => 
        m.id !== this.movie!.id && 
        m.genre && 
        m.genre.some(g => this.movie!.genre.includes(g))
      )
      .sort((a, b) => a.title.localeCompare(b.title))
      .slice(0, 5); // Limit to 5 similar movies
  }

  getSimilarMoviesByDirector(): Movie[] {
    if (!this.movie?.director || !this.allMovies) return [];
    
    return this.allMovies
      .filter(m => 
        m.id !== this.movie!.id && 
        m.director === this.movie!.director
      )
      .sort((a, b) => a.title.localeCompare(b.title))
      .slice(0, 5); // Limit to 5 similar movies
  }

  getSimilarMoviesByActor(): Movie[] {
    if (!this.movie?.cast || !this.allMovies) return [];
    
    const actorNames = this.movie.cast.map(member => member.actor);
    
    return this.allMovies
      .filter(m => 
        m.id !== this.movie!.id && 
        m.cast && 
        m.cast.some(member => actorNames.includes(member.actor))
      )
      .sort((a, b) => a.title.localeCompare(b.title))
      .slice(0, 5); // Limit to 5 similar movies
  }
} 