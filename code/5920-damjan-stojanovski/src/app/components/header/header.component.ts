import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  routes = [
    { linkName: 'Movies', url: '/movies' },
    { linkName: 'Statistics', url: '/statistics' },
    { linkName: 'About', url: '/about' }
  ];
} 