import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {
  currentYear = new Date().getFullYear();
  studentName = 'Damjan Stojanovski';
  studentId = '5920';
  githubRepo = 'https://github.com/sweko/internet-programming-redingortm';
} 