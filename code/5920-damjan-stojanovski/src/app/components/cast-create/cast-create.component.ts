import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Movie, CastMember } from '../../models/movie.model';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-cast-create',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cast-create.component.html',
  styleUrl: './cast-create.component.css'
})
export class CastCreateComponent implements OnInit {
  movie: Movie | null = null;
  newCastMember: { actor: string; character: string } = { actor: '', character: '' };
  
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
    this.apiService.getMovie(id).subscribe({
      next: (movie) => {
        this.movie = movie;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load movie data';
        this.loading = false;
        console.error('Error loading movie:', error);
      }
    });
  }

  isFormValid(): boolean {
    return !!(this.newCastMember.actor && this.newCastMember.character);
  }

  saveCastMember(): void {
    if (!this.movie || !this.isFormValid()) {
      alert('Please fill in all required fields');
      return;
    }

    this.saving = true;
    
    // Create updated movie with new cast member
    const updatedMovie = {
      ...this.movie,
      cast: [...(this.movie.cast || []), { ...this.newCastMember }]
    };

    this.apiService.updateMovie(this.movie.id, updatedMovie).subscribe({
      next: (updatedMovie) => {
        this.saving = false;
        this.router.navigate(['/movies', this.movie!.id]);
      },
      error: (error) => {
        this.saving = false;
        this.error = 'Failed to add cast member';
        console.error('Error adding cast member:', error);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/movies', this.movie?.id]);
  }
} 