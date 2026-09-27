import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, OnDestroy {
  private readonly steps: number[] = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  private currentIndex = 0;
  private intervalId?: ReturnType<typeof setInterval>;

  progressValue = signal<number>(this.steps[0]);

  ngOnInit(): void {
    this.intervalId = setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.steps.length;
      this.progressValue.set(this.steps[this.currentIndex]);
    }, 1500);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
