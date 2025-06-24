import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Movie } from '../../models/movie.model';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-movies-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './movies-list.component.html',
  styleUrl: './movies-list.component.css'
})
export class MoviesListComponent implements OnInit {
  movies: Movie[] = [];
  filteredMovies: Movie[] = [];
  loading = true;
  error = '';

  // Filter properties
  titleFilter = '';
  yearFilter = '';
  genreFilter = '';
  ratingFilter = '';

  // Sort properties
  sortField = '';
  sortDirection = 'asc';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadMovies();
  }

  loadMovies(): void {
    this.loading = true;
    this.apiService.getMovies().subscribe({
      next: (movies) => {
        this.movies = movies;
        this.filteredMovies = [...movies];
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load movies';
        this.loading = false;
        console.error('Error loading movies:', error);
      }
    });
  }

  deleteMovie(id: number): void {
    if (confirm('Are you sure you want to delete this movie?')) {
      this.apiService.deleteMovie(id).subscribe({
        next: () => {
          this.movies = this.movies.filter(movie => movie.id !== id);
          this.applyFilters();
        },
        error: (error) => {
          console.error('Error deleting movie:', error);
          alert('Failed to delete movie');
        }
      });
    }
  }

  applyFilters(): void {
    this.filteredMovies = this.movies.filter(movie => {
      const titleMatch = !this.titleFilter || 
        movie.title.toLowerCase().includes(this.titleFilter.toLowerCase());
      
      const yearMatch = !this.yearFilter || 
        movie.year.toString().includes(this.yearFilter);
      
      const genreMatch = !this.genreFilter || 
        movie.genre.some(g => g.toLowerCase().includes(this.genreFilter.toLowerCase()));
      
      const ratingMatch = !this.ratingFilter || 
        movie.rating >= parseFloat(this.ratingFilter);

      return titleMatch && yearMatch && genreMatch && ratingMatch;
    });

    this.applySorting();
  }

  sort(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applySorting();
  }

  private applySorting(): void {
    if (!this.sortField) return;

    this.filteredMovies.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (this.sortField) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'year':
          aValue = a.year;
          bValue = b.year;
          break;
        case 'director':
          aValue = a.director.toLowerCase();
          bValue = b.director.toLowerCase();
          break;
        case 'genre':
          aValue = a.genre.length;
          bValue = b.genre.length;
          if (aValue === bValue) {
            aValue = a.genre.sort().join(', ');
            bValue = b.genre.sort().join(', ');
          }
          break;
        case 'oscars':
          aValue = Object.keys(a.oscars || {}).length;
          bValue = Object.keys(b.oscars || {}).length;
          break;
        case 'rating':
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  getOscarCount(movie: Movie): number {
    return Object.keys(movie.oscars || {}).length;
  }

  getSortIcon(field: string): string {
    if (this.sortField !== field) return '↕';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }
} 