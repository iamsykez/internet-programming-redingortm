import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Movie, CastMember } from '../../models/movie.model';
import { Genre } from '../../models/genre.model';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-movie-edit',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './movie-edit.component.html',
  styleUrl: './movie-edit.component.css'
})
export class MovieEditComponent implements OnInit {
  movie: Movie | null = null;
  originalMovie: Movie | null = null;
  
  genres: Genre[] = [];
  availableGenres: string[] = [];
  selectedGenres: string[] = [];
  
  newCastMember: { actor: string; character: string } = { actor: '', character: '' };
  newOscar: { type: string; recipient: string } = { type: '', recipient: '' };
  
  loading = true;
  saving = false;
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
    
    // Load movie and genres in parallel
    Promise.all([
      this.apiService.getMovie(id).toPromise(),
      this.apiService.getGenres().toPromise()
    ]).then(([movie, genres]) => {
      if (movie) {
        this.movie = { ...movie };
        this.originalMovie = { ...movie };
        this.selectedGenres = [...(movie.genre || [])];
      }
      
      if (genres) {
        this.genres = genres;
        this.availableGenres = genres.map(g => g.name);
      }
      
      this.loading = false;
    }).catch(error => {
      this.error = 'Failed to load movie data';
      this.loading = false;
      console.error('Error loading movie:', error);
    });
  }

  addGenre(genre: string): void {
    if (genre && !this.selectedGenres.includes(genre)) {
      this.selectedGenres.push(genre);
      if (this.movie) {
        this.movie.genre = [...this.selectedGenres];
      }
    }
  }

  removeGenre(genre: string): void {
    this.selectedGenres = this.selectedGenres.filter(g => g !== genre);
    if (this.movie) {
      this.movie.genre = [...this.selectedGenres];
    }
  }

  addCastMember(): void {
    if (this.newCastMember.actor && this.newCastMember.character && this.movie) {
      this.movie.cast = [...(this.movie.cast || []), { ...this.newCastMember }];
      this.newCastMember = { actor: '', character: '' };
    }
  }

  removeCastMember(index: number): void {
    if (this.movie) {
      this.movie.cast = this.movie.cast?.filter((_, i) => i !== index);
    }
  }

  addOscar(): void {
    if (this.newOscar.type && this.newOscar.recipient && this.movie) {
      this.movie.oscars = { ...this.movie.oscars, [this.newOscar.type]: this.newOscar.recipient };
      this.newOscar = { type: '', recipient: '' };
    }
  }

  removeOscar(type: string): void {
    if (this.movie?.oscars) {
      const { [type]: removed, ...rest } = this.movie.oscars;
      this.movie.oscars = rest;
    }
  }

  getOriginalOscarKey(formattedType: string): string {
    if (!this.movie?.oscars) return '';
    
    return Object.keys(this.movie.oscars).find(key => 
      this.formatOscarType(key) === formattedType
    ) || '';
  }

  formatOscarType(type: string): string {
    return type
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
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

  isFormValid(): boolean {
    return !!(this.movie?.title && this.movie?.year && this.movie?.director);
  }

  hasChanges(): boolean {
    if (!this.movie || !this.originalMovie) return false;
    
    return JSON.stringify(this.movie) !== JSON.stringify(this.originalMovie);
  }

  saveMovie(): void {
    if (!this.movie || !this.isFormValid()) {
      alert('Please fill in all required fields');
      return;
    }

    this.saving = true;
    const movieData = {
      ...this.movie,
      genre: this.selectedGenres
    };

    this.apiService.updateMovie(this.movie.id, movieData).subscribe({
      next: (updatedMovie) => {
        this.saving = false;
        this.router.navigate(['/movies', updatedMovie.id]);
      },
      error: (error) => {
        this.saving = false;
        this.error = 'Failed to update movie';
        console.error('Error updating movie:', error);
      }
    });
  }

  cancel(): void {
    if (this.hasChanges()) {
      if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        this.router.navigate(['/movies', this.movie?.id]);
      }
    } else {
      this.router.navigate(['/movies', this.movie?.id]);
    }
  }
} 