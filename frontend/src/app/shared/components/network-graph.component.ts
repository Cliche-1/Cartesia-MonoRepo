import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';

@Component({
  selector: 'app-network-graph',
  standalone: true,
  template: `
    <div class="network-bg" aria-hidden="true">
      <canvas #canvas class="canvas"></canvas>
    </div>
  `,
  styles: [
    `
      :host { display:block; }
      .network-bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
      .canvas { width: 100%; height: 100%; display: block; }
    `
  ]
})
export class NetworkGraphComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx?: CanvasRenderingContext2D | null;
  private animationId?: number;
  private nodes: Array<{ x: number; y: number; vx: number; vy: number; radius: number; color: string }> = [];
  private resizeHandler = () => this.updateSize();

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d');
    if (!this.ctx) return;
    this.updateSize();
    window.addEventListener('resize', this.resizeHandler);

    const rect = canvas.getBoundingClientRect();
    const nodeCount = 80;
    const colors = [
      'rgba(168, 85, 247, 0.8)',
      'rgba(192, 132, 252, 0.8)',
      'rgba(147, 51, 234, 0.8)'
    ];
    this.nodes = Array.from({ length: nodeCount }).map(() => ({
      x: Math.random() * rect.width,
      y: Math.random() * rect.height,
      vx: (Math.random() - 0.5) * 1,
      vy: (Math.random() - 0.5) * 1,
      radius: Math.random() * 3 + 2,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));

    const animate = () => {
      if (!this.ctx) return;
      const rect = canvas.getBoundingClientRect();
      this.ctx.clearRect(0, 0, rect.width, rect.height);

      for (const node of this.nodes) {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > rect.width) node.vx *= -1;
        if (node.y < 0 || node.y > rect.height) node.vy *= -1;

        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = node.color;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = node.color;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
      }

      for (let i = 0; i < this.nodes.length; i++) {
        const node = this.nodes[i];
        for (let j = i + 1; j < this.nodes.length; j++) {
          const other = this.nodes[j];
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 180) {
            const opacity = (1 - distance / 180) * 0.4;
            this.ctx.beginPath();
            this.ctx.moveTo(node.x, node.y);
            this.ctx.lineTo(other.x, other.y);
            this.ctx.strokeStyle = `rgba(168, 85, 247, ${opacity})`;
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
          }
        }
      }

      this.animationId = requestAnimationFrame(animate);
    };

    animate();
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.resizeHandler);
    if (this.animationId) cancelAnimationFrame(this.animationId);
  }

  private updateSize() {
    const canvas = this.canvasRef.nativeElement;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
  }
}
