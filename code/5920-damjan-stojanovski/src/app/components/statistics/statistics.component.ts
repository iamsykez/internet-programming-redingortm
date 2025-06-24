import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Movie } from '../../models/movie.model';
import { Actor } from '../../models/actor.model';
import { Genre } from '../../models/genre.model';
import { ApiService } from '../../services/api.service';

interface OscarStats {
  type: string;
  count: number;
}

interface GenreStats {
  genre: string;
  count: number;
}

interface DecadeStats {
  decade: string;
  count: number;
}

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.css'
})
export class StatisticsComponent implements OnInit {
  movies: Movie[] = [];
  actors: Actor[] = [];
  genres: Genre[] = [];
  
  loading = true;
  error = '';

  // Statistics
  totalMovies = 0;
  totalActors = 0;
  totalGenres = 0;
  totalOscars = 0;
  
  oscarsPerType: OscarStats[] = [];
  oscarsPerGenre: GenreStats[] = [];
  moviesPerDecade: DecadeStats[] = [];
  moviesPerGenre: GenreStats[] = [];
  
  actorsWithoutDetails = 0;
  moviesWithoutDetails = 0;
  actorsWithoutDetailsList: string[] = [];
  moviesWithoutDetailsList: string[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    
    // Load all data in parallel
    Promise.all([
      this.apiService.getMovies().toPromise(),
      this.apiService.getActors().toPromise(),
      this.apiService.getGenres().toPromise()
    ]).then(([movies, actors, genres]) => {
      this.movies = movies || [];
      this.actors = actors || [];
      this.genres = genres || [];
      
      this.calculateStatistics();
      this.loading = false;
    }).catch(error => {
      this.error = 'Failed to load statistics data';
      this.loading = false;
      console.error('Error loading statistics:', error);
    });
  }

  calculateStatistics(): void {
    this.calculateBasicStats();
    this.calculateOscarStats();
    this.calculateGenreStats();
    this.calculateDecadeStats();
    this.calculateMissingDataStats();
  }

  private calculateBasicStats(): void {
    this.totalMovies = this.movies.length;
    this.totalActors = this.actors.length;
    this.totalGenres = this.genres.length;
    
    // Count total oscars
    this.totalOscars = this.movies.reduce((total, movie) => {
      return total + Object.keys(movie.oscars || {}).length;
    }, 0);
  }

  private calculateOscarStats(): void {
    // Oscars per type
    const oscarTypeCount: { [key: string]: number } = {};
    
    this.movies.forEach(movie => {
      if (movie.oscars) {
        Object.keys(movie.oscars).forEach(type => {
          oscarTypeCount[type] = (oscarTypeCount[type] || 0) + 1;
        });
      }
    });

    this.oscarsPerType = Object.entries(oscarTypeCount)
      .map(([type, count]) => ({
        type: this.formatOscarType(type),
        count
      }))
      .sort((a, b) => b.count - a.count);

    // Oscars per genre
    const oscarGenreCount: { [key: string]: number } = {};
    
    this.movies.forEach(movie => {
      if (movie.oscars && Object.keys(movie.oscars).length > 0) {
        movie.genre?.forEach(genre => {
          oscarGenreCount[genre] = (oscarGenreCount[genre] || 0) + Object.keys(movie.oscars).length;
        });
      }
    });

    this.oscarsPerGenre = Object.entries(oscarGenreCount)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count);
  }

  private calculateGenreStats(): void {
    const genreCount: { [key: string]: number } = {};
    
    this.movies.forEach(movie => {
      movie.genre?.forEach(genre => {
        genreCount[genre] = (genreCount[genre] || 0) + 1;
      });
    });

    this.moviesPerGenre = Object.entries(genreCount)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count);
  }

  private calculateDecadeStats(): void {
    const decadeCount: { [key: string]: number } = {};
    
    this.movies.forEach(movie => {
      const decade = Math.floor(movie.year / 10) * 10;
      const decadeLabel = `${decade}s`;
      decadeCount[decadeLabel] = (decadeCount[decadeLabel] || 0) + 1;
    });

    this.moviesPerDecade = Object.entries(decadeCount)
      .map(([decade, count]) => ({ decade, count }))
      .sort((a, b) => a.decade.localeCompare(b.decade));
  }

  private calculateMissingDataStats(): void {
    // Find actors mentioned in movies but not in actors list
    const movieActors = new Set<string>();
    this.movies.forEach(movie => {
      movie.cast?.forEach(member => {
        movieActors.add(member.actor);
      });
    });

    const actorNames = new Set(this.actors.map(actor => actor.name));
    this.actorsWithoutDetailsList = Array.from(movieActors).filter(actor => !actorNames.has(actor));
    this.actorsWithoutDetails = this.actorsWithoutDetailsList.length;

    // Find movies mentioned in actors but not in movies list
    const actorMovies = new Set<string>();
    this.actors.forEach(actor => {
      actor.notable_works?.forEach(movie => {
        actorMovies.add(movie);
      });
    });

    const movieTitles = new Set(this.movies.map(movie => movie.title));
    this.moviesWithoutDetailsList = Array.from(actorMovies).filter(movie => !movieTitles.has(movie));
    this.moviesWithoutDetails = this.moviesWithoutDetailsList.length;
  }

  private formatOscarType(type: string): string {
    return type
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }
} 