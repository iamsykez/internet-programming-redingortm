import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Movie, CastMember } from '../../models/movie.model';
import { Genre } from '../../models/genre.model';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-movie-create',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './movie-create.component.html',
  styleUrl: './movie-create.component.css'
})
export class MovieCreateComponent implements OnInit {
  movie: Partial<Movie> = {
    title: '',
    year: new Date().getFullYear(),
    director: '',
    genre: [],
    plot: '',
    cast: [],
    oscars: {},
    rating: undefined
  };

  genres: Genre[] = [];
  availableGenres: string[] = [];
  selectedGenres: string[] = [];
  
  newCastMember: { actor: string; character: string } = { actor: '', character: '' };
  newOscar: { type: string; recipient: string } = { type: '', recipient: '' };
  
  loading = false;
  error = '';

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.loadGenres();
  }

  loadGenres(): void {
    this.apiService.getGenres().subscribe({
      next: (genres) => {
        this.genres = genres;
        this.availableGenres = genres.map(g => g.name);
      },
      error: (error) => {
        console.error('Error loading genres:', error);
        this.error = 'Failed to load genres';
      }
    });
  }

  addGenre(genre: string): void {
    if (genre && !this.selectedGenres.includes(genre)) {
      this.selectedGenres.push(genre);
      this.movie.genre = [...this.selectedGenres];
    }
  }

  removeGenre(genre: string): void {
    this.selectedGenres = this.selectedGenres.filter(g => g !== genre);
    this.movie.genre = [...this.selectedGenres];
  }

  addCastMember(): void {
    if (this.newCastMember.actor && this.newCastMember.character) {
      this.movie.cast = [...(this.movie.cast || []), { ...this.newCastMember }];
      this.newCastMember = { actor: '', character: '' };
    }
  }

  removeCastMember(index: number): void {
    this.movie.cast = this.movie.cast?.filter((_, i) => i !== index);
  }

  addOscar(): void {
    if (this.newOscar.type && this.newOscar.recipient) {
      this.movie.oscars = { ...this.movie.oscars, [this.newOscar.type]: this.newOscar.recipient };
      this.newOscar = { type: '', recipient: '' };
    }
  }

  removeOscar(type: string): void {
    if (this.movie.oscars) {
      const { [type]: removed, ...rest } = this.movie.oscars;
      this.movie.oscars = rest;
    }
  }

  getOriginalOscarKey(formattedType: string): string {
    if (!this.movie.oscars) return '';
    
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
    if (!this.movie.oscars) return [];
    
    return Object.entries(this.movie.oscars)
      .map(([type, recipient]) => ({
        type: this.formatOscarType(type),
        recipient
      }))
      .sort((a, b) => a.type.localeCompare(b.type));
  }

  isFormValid(): boolean {
    return !!(this.movie.title && this.movie.year && this.movie.director);
  }

  saveMovie(): void {
    if (!this.isFormValid()) {
      alert('Please fill in all required fields');
      return;
    }

    this.loading = true;
    const movieData = {
      ...this.movie,
      genre: this.selectedGenres,
      cast: this.movie.cast || [],
      oscars: this.movie.oscars || {}
    } as Omit<Movie, 'id'>;

    this.apiService.createMovie(movieData).subscribe({
      next: (createdMovie) => {
        this.loading = false;
        this.router.navigate(['/movies', createdMovie.id]);
      },
      error: (error) => {
        this.loading = false;
        this.error = 'Failed to create movie';
        console.error('Error creating movie:', error);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/movies']);
  }
} 