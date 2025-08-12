import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { bootstrapApplication } from '@angular/platform-browser';

@Component({
  selector: 'app-tooltip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container" #container>
      <button 
        class="trigger-btn"
        #triggerButton
        (click)="toggleTooltip()"
        [attr.aria-expanded]="isOpen"
        [attr.aria-describedby]="isOpen ? 'tooltip-content' : null"
        (keydown.enter)="toggleTooltip()"
        (keydown.space)="toggleTooltip()"
      >
        1
      </button>

      <div 
        *ngIf="isOpen"
        #tooltipContent
        id="tooltip-content"
        class="tooltip"
        role="dialog"
        [attr.aria-modal]="true"
        aria-labelledby="tooltip-title"
        (keydown.escape)="closeTooltip()"
        [style.top.px]="tooltipPosition.top"
        [style.left.px]="tooltipPosition.left"
      >
        <div class="tooltip-header">
          <h3 id="tooltip-title">2 de novembro, sábado</h3>
          <button 
            class="close-btn"
            #closeButton
            (click)="closeTooltip()"
            aria-label="Fechar tooltip"
          >
            ×
          </button>
        </div>
        <div class="tooltip-content">
          <div class="info-row">
            <span>Limite habilitado utilizado</span>
            <span class="value">R$ 90.488,00</span>
          </div>
          <div class="info-row">
            <span>Utilização acima do limite</span>
            <span class="value">R$ 15.759,38</span>
          </div>
          <div class="info-row">
            <span>Saldo devedor total</span>
            <span class="value">R$ 106.247,38</span>
          </div>
          <hr>
          <div class="info-row">
            <span>Juros limite da conta</span>
            <span class="value">R$ 666,85</span>
          </div>
          <div class="info-row">
            <span>IOF</span>
            <span class="value">R$ 59,77</span>
          </div>
          <div class="info-row">
            <span>Juros de uso acima do limite</span>
            <span class="value">R$ 142,13</span>
          </div>
          <div class="info-row">
            <span>Total de encargos</span>
            <span class="value">R$ 868,75</span>
          </div>
          <div class="update-info">
            Atualizado: 6 de novembro
          </div>
        </div>
      </div>

      <div 
        *ngIf="isOpen" 
        class="overlay" 
        (click)="closeTooltip()"
        aria-hidden="true"
      ></div>
    </div>
  `,
  styles: [`
    .container {
      padding: 100px;
      position: relative;
    }

    .trigger-btn {
      width: 40px;
      height: 40px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 16px;
      font-weight: bold;
      transition: all 0.2s;
      position: relative;
    }

    .trigger-btn:hover {
      background: #0056b3;
    }

    .trigger-btn:focus {
      outline: 2px solid #80bdff;
      outline-offset: 2px;
    }

    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.3);
      z-index: 999;
    }

    .tooltip {
      position: absolute;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      width: 320px;
      animation: fadeIn 0.2s ease-out;
      border: 1px solid #e0e0e0;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    .tooltip-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid #f0f0f0;
    }

    #tooltip-title {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: #999;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: all 0.2s;
    }

    .close-btn:hover {
      background: #f5f5f5;
      color: #333;
    }

    .close-btn:focus {
      outline: 2px solid #007bff;
      outline-offset: 1px;
    }

    .tooltip-content {
      padding: 16px 20px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      font-size: 14px;
    }

    .info-row span:first-child {
      color: #666;
    }

    .value {
      font-weight: 600;
      color: #333;
    }

    hr {
      border: none;
      border-top: 1px solid #f0f0f0;
      margin: 16px 0;
    }

    .update-info {
      font-size: 12px;
      color: #999;
      text-align: center;
      margin-top: 16px;
      padding-top: 12px;
      border-top: 1px solid #f0f0f0;
    }

    /* Responsividade */
    @media (max-width: 768px) {
      .tooltip {
        width: 280px;
        position: fixed !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
      }
      
      .container {
        padding: 20px;
      }
    }
  `]
})
export class TooltipComponent implements AfterViewInit {
  @ViewChild('triggerButton') triggerButton!: ElementRef<HTMLButtonElement>;
  @ViewChild('tooltipContent') tooltipContent!: ElementRef<HTMLDivElement>;
  @ViewChild('container') container!: ElementRef<HTMLDivElement>;
  @ViewChild('closeButton') closeButton!: ElementRef<HTMLButtonElement>;

  isOpen = false;
  tooltipPosition = { top: 0, left: 0 };

  ngAfterViewInit() {
    // Componente inicializado, ViewChild disponível
  }

  toggleTooltip() {
    if (this.isOpen) {
      this.closeTooltip();
    } else {
      this.openTooltip();
    }
  }

  openTooltip() {
    this.isOpen = true;
    
    // Calcula posição do tooltip
    setTimeout(() => {
      this.calculateTooltipPosition();
    });
    
    // Focus management
    setTimeout(() => {
      if (this.closeButton?.nativeElement) {
        this.closeButton.nativeElement.focus();
      }
    }, 100);
    
    // Listener para ESC
    document.addEventListener('keydown', this.handleEscKey);
  }

  closeTooltip() {
    this.isOpen = false;
    
    // Remove listener do ESC
    document.removeEventListener('keydown', this.handleEscKey);
    
    // Retorna focus para o botão
    setTimeout(() => {
      if (this.triggerButton?.nativeElement) {
        this.triggerButton.nativeElement.focus();
      }
    });
  }

  private calculateTooltipPosition() {
    if (!this.triggerButton?.nativeElement || !this.tooltipContent?.nativeElement || !this.container?.nativeElement) {
      return;
    }

    const triggerRect = this.triggerButton.nativeElement.getBoundingClientRect();
    const tooltipRect = this.tooltipContent.nativeElement.getBoundingClientRect();
    const containerRect = this.container.nativeElement.getBoundingClientRect();
    
    // Posição inicial: abaixo e à direita do botão
    let top = triggerRect.bottom - containerRect.top + 8;
    let left = triggerRect.left - containerRect.left;
    
    // Verifica se o tooltip sai da tela à direita
    if (left + tooltipRect.width > window.innerWidth - 20) {
      left = triggerRect.right - containerRect.left - tooltipRect.width;
    }
    
    // Verifica se o tooltip sai da tela embaixo
    if (triggerRect.bottom + tooltipRect.height > window.innerHeight - 20) {
      top = triggerRect.top - containerRect.top - tooltipRect.height - 8;
    }
    
    this.tooltipPosition = { top, left };
  }

  private handleEscKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      this.closeTooltip();
    }
  }
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TooltipComponent],
  template: `
    <div class="app">
      <h1>Tooltip do Bankline</h1>
      <p>Clique no botão "1" para ver o tooltip com as informações:</p>
      <app-tooltip></app-tooltip>
    </div>
  `,
  styles: [`
    .app {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    h1 {
      color: #333;
      margin-bottom: 10px;
    }

    p {
      color: #666;
      margin-bottom: 20px;
    }
  `]
})
export class App {}

bootstrapApplication(App);