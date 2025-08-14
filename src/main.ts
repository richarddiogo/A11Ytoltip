import { Component, ViewChild, ElementRef, AfterViewInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { bootstrapApplication } from '@angular/platform-browser';

interface Day {
  day: number;
  ariaHidden: boolean;
  currentPeriod?: boolean;
  isDayUsed: boolean;
  isToday: boolean;
  usedValue: number | null;
  mes: number;
  dayOfDebit: boolean;
}

@Component({
  selector: 'app-tooltip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container" #container>
      <div class="week-names">
        <div 
          *ngFor="let week of weekNames" 
          class="week-name-div"
          [attr.aria-label]="week.name"
          role="text"
          tabindex="-1"
        >
          <span aria-hidden="true">{{ week.abbreviation }}</span>
        </div>
      </div>

      <div *ngFor="let week of periods; let i = index" class="week-days" 
           [ngStyle]="{'margin-bottom': '8px'}">
        <div *ngFor="let day of week; let j = index" class="week-day-div trigger-btn"
             [class.day-used]="day.isDayUsed"
             [class.day-today]="day.isToday"
             [class.day-debit]="day.dayOfDebit"
             [attr.aria-expanded]="isActiveTooltip(i, j)"
             [attr.aria-describedby]="isActiveTooltip(i, j) ? 'tooltip-content-mes-' + day.mes + '-dia-' + day.day : null"
             [attr.aria-hidden]="day.ariaHidden"
             [attr.aria-label]="dayAriaLabel(day.day)"
             [attr.role]="day.isDayUsed ? 'button' : 'text'"
             [attr.tabindex]="day.isDayUsed ? '0' : '-1'"
             (click)="day.isDayUsed ? toggleTooltip(i, j) : null"
             (keydown.enter)="day.isDayUsed ? toggleTooltip(i, j) : null"
             (keydown.space)="day.isDayUsed ? toggleTooltip(i, j) : null">
          {{ day.day }}
          <div *ngIf="day.isToday" class="today-border"></div>
        </div>
      </div>

      <div 
        *ngIf="activeTooltip.weekIndex !== null && activeTooltip.dayIndex !== null"
        #tooltipContent
        [id]="'tooltip-content-mes-' + getActiveDay()?.mes + '-dia-' + getActiveDay()?.day"
        class="tooltip"
        role="dialog"
        [attr.aria-modal]="true"
        aria-labelledby="tooltip-title"
        (keydown.escape)="closeTooltip()"
        (keydown)="onTooltipKeydown($event)"
        tabindex="-1"
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
            tabindex="0"
          >
            ×
          </button>
        </div>
        <div class="tooltip-content">
          <div class="info-row" tabindex="0" role="text" [attr.aria-label]="'Limite habilitado utilizado: R$ ' + (getActiveDay()?.usedValue?.toLocaleString('pt-BR', {minimumFractionDigits: 2}) || '0,00')">
            <span>Limite habilitado utilizado</span>
            <span class="value">R$ {{ getActiveDay()?.usedValue?.toLocaleString('pt-BR', {minimumFractionDigits: 2}) || '0,00' }}</span>
          </div>
          <div class="info-row" tabindex="0" role="text" [attr.aria-label]="'Utilização acima do limite: R$ 15.759,38'">
            <span>Utilização acima do limite</span>
            <span class="value">R$ 15.759,38</span>
          </div>
          <div class="info-row" tabindex="0" role="text" [attr.aria-label]="'Saldo devedor total: R$ 106.247,38'">
            <span>Saldo devedor total</span>
            <span class="value">R$ 106.247,38</span>
          </div>
          <hr>
          <div class="info-row" tabindex="0" role="text" [attr.aria-label]="'Juros limite da conta: R$ 666,85'">
            <span>Juros limite da conta</span>
            <span class="value">R$ 666,85</span>
          </div>
          <div class="info-row" tabindex="0" role="text" [attr.aria-label]="'IOF: R$ 59,77'">
            <span>IOF</span>
            <span class="value">R$ 59,77</span>
          </div>
          <div class="info-row" tabindex="0" role="text" [attr.aria-label]="'Juros de uso acima do limite: R$ 142,13'">
            <span>Juros de uso acima do limite</span>
            <span class="value">R$ 142,13</span>
          </div>
          <div class="info-row" tabindex="0" role="text" [attr.aria-label]="'Total de encargos: R$ 868,75'">
            <span>Total de encargos</span>
            <span class="value">R$ 868,75</span>
          </div>
          <div class="update-info" tabindex="0" role="text" [attr.aria-label]="'Atualizado: 6 de novembro'">
            Atualizado: 6 de novembro
          </div>
        </div>
      </div>

      <div 
        *ngIf="activeTooltip.weekIndex !== null && activeTooltip.dayIndex !== null" 
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

    .week-names {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    }

    .week-name-div {
      width: 40px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: #666;
      font-weight: 500;
      text-transform: lowercase;
    }

    .week-days {
      display: flex;
      gap: 8px;
      margin-bottom: 8px;
      cursor: pointer;
    }

    .week-day-div {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      color: #666;
      border-radius: 6px;
      font-size: 16px;
      font-weight: bold;
      transition: all 0.2s;
      position: relative;
      cursor: default;
      user-select: none;
    }

    .week-day-div.day-used {
      background: #28a745;
      color: white;
      cursor: pointer;
    }

    .week-day-div.day-used:hover {
      background: #218838;
    }

    .week-day-div.day-today {
      background: #007bff;
      color: white;
      font-weight: bold;
      cursor: pointer;
    }

    .week-day-div.day-today:hover {
      background: #0056b3;
    }

    .week-day-div.day-debit {
      text-decoration: underline;
    }

    .today-border {
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      border: 2px solid #0056b3;
      border-radius: 8px;
      pointer-events: none;
    }

    .week-day-div[aria-expanded="true"] {
      box-shadow: 0 0 0 2px #80bdff;
    }

    .week-day-div[role="button"]:focus {
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

    .info-row:focus {
      outline: 2px solid #007bff;
      outline-offset: 2px;
      border-radius: 4px;
      background-color: #f8f9fa;
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

    .update-info:focus {
      outline: 2px solid #007bff;
      outline-offset: 2px;
      border-radius: 4px;
      background-color: #f8f9fa;
    }

    .tooltip:focus {
      outline: none;
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

  @Input() periods: Day[][] = [];

  weekNames: Array<{ name: string; abbreviation: string }> = [
    { name: 'Domingo', abbreviation: 'dom' },
    { name: 'Segunda-feira', abbreviation: 'seg' },
    { name: 'Terça-feira', abbreviation: 'ter' },
    { name: 'Quarta-feira', abbreviation: 'qua' },
    { name: 'Quinta-feira', abbreviation: 'qui' },
    { name: 'Sexta-feira', abbreviation: 'sex' },
    { name: 'Sábado', abbreviation: 'sáb' }
  ];

  
  activeTooltip = { weekIndex: null as number | null, dayIndex: null as number | null };
  tooltipPosition = { top: 0, left: 0 };
  activeTriggerButton!: ElementRef<HTMLElement>;

  ngAfterViewInit() {
    // Componente inicializado, ViewChild disponível
  }

  public getMarginStyle() {
    return { 'margin-bottom': '8px' };
  }

  public toggleTooltip(weekIndex: number, dayIndex: number) {
    if (this.isActiveTooltip(weekIndex, dayIndex)) {
      this.closeTooltip();
    } else {
      this.openTooltip(weekIndex, dayIndex);
    }
  }

  public isActiveTooltip(weekIndex: number, dayIndex: number): boolean {
    return this.activeTooltip.weekIndex === weekIndex && this.activeTooltip.dayIndex === dayIndex;
  }

  public getActiveDay(): Day | null {
    if (this.activeTooltip.weekIndex !== null) {
      return this.periods[this.activeTooltip.weekIndex][this.activeTooltip.dayIndex!];
    }
    return null;
  }

  public dayAriaLabel(day: number): string {
    return `Day ${day}`;
  }

  public openTooltip(weekIndex: number, dayIndex: number) {
    this.activeTooltip = { weekIndex, dayIndex };
    
    // Calcula posição do tooltip
    setTimeout(() => {
      this.calculateTooltipPosition(weekIndex, dayIndex);
    });
    
    // Focus management
    setTimeout(() => {
      if (this.tooltipContent?.nativeElement) {
        this.tooltipContent.nativeElement.focus();
      }
    }, 100);
    
    // Listener para ESC
    document.addEventListener('keydown', this.handleEscKey);
  }

  public closeTooltip() {
    this.activeTooltip = { weekIndex: null, dayIndex: null };
    
    // Remove listener do ESC
    document.removeEventListener('keydown', this.handleEscKey);
    
    // Retorna focus para o botão
    setTimeout(() => {
      if (this.activeTriggerButton?.nativeElement) {
        this.activeTriggerButton.nativeElement.focus();
      }
    });
  }

  private calculateTooltipPosition(weekIndex: number, dayIndex: number) {
    // Find the correct button within THIS specific tooltip component instance
    const weekDivs = this.container.nativeElement.querySelectorAll('.week-days');
    const targetWeekDiv = weekDivs[weekIndex];
    
    if (!targetWeekDiv) return;
    
    const dayDivs = targetWeekDiv.querySelectorAll('.week-day-div');
    const currentButton = dayDivs[dayIndex] as HTMLElement;
    
    this.activeTriggerButton = new ElementRef(currentButton);
    
    if (!currentButton || !this.tooltipContent?.nativeElement || !this.container?.nativeElement) {
      return;
    }

    const triggerRect = currentButton.getBoundingClientRect();
    const containerRect = this.container.nativeElement.getBoundingClientRect();
    
    // Position tooltip directly below the button
    const top = triggerRect.bottom - containerRect.top + 8;
    const left = triggerRect.left - containerRect.left;
    
    this.tooltipPosition = { top, left };
  }

  private handleEscKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      this.closeTooltip();
    }
  }

  public onTooltipKeydown = (event: KeyboardEvent) => {
    const focusableElements = this.tooltipContent.nativeElement.querySelectorAll(
      'button, [tabindex="0"]'
    );
    const focusableArray = Array.from(focusableElements) as HTMLElement[];
    const currentIndex = focusableArray.indexOf(document.activeElement as HTMLElement);

    switch (event.key) {
      case 'Tab':
        event.preventDefault();
        if (event.shiftKey) {
          // Shift + Tab - navegar para trás
          const prevIndex = currentIndex <= 0 ? focusableArray.length - 1 : currentIndex - 1;
          focusableArray[prevIndex].focus();
        } else {
          // Tab - navegar para frente
          const nextIndex = currentIndex >= focusableArray.length - 1 ? 0 : currentIndex + 1;
          focusableArray[nextIndex].focus();
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        const nextDownIndex = currentIndex >= focusableArray.length - 1 ? 0 : currentIndex + 1;
        focusableArray[nextDownIndex].focus();
        break;
      case 'ArrowUp':
        event.preventDefault();
        const prevUpIndex = currentIndex <= 0 ? focusableArray.length - 1 : currentIndex - 1;
        focusableArray[prevUpIndex].focus();
        break;
      case 'Home':
        event.preventDefault();
        focusableArray[0].focus();
        break;
      case 'End':
        event.preventDefault();
        focusableArray[focusableArray.length - 1].focus();
        break;
    }
  };
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TooltipComponent],
  template: `
    <div class="app">
      <h1>Tooltip do Bankline</h1>
      <p>Clique no botão "1" para ver o tooltip com as informações:</p>
      
      <div class="calendars-container">
        <div class="calendar-section">
          <div class="month-title">Mês 8</div>
          <app-tooltip [periods]="periodsData"></app-tooltip>
        </div>
        
        <div class="calendar-section">
          <div class="month-title">Mês 9</div>
          <app-tooltip [periods]="periodsData2"></app-tooltip>
        </div>
      </div>
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

    .calendars-container {
      display: flex;
      gap: 40px;
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .calendar-section {
      flex: 1;
      min-width: 300px;
    }

    .month-title {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      margin-bottom: 16px;
    }

    @media (max-width: 768px) {
      .calendars-container {
        flex-direction: column;
        gap: 20px;
      }
    }
  `]
})
export class App {
  periodsData: Day[][] = [
    // Semana 1 de Agosto
    [
      { day: 1, ariaHidden: false, currentPeriod: false, isDayUsed: false, isToday: false, usedValue: null, mes: 8, dayOfDebit: false },
      { day: 2, ariaHidden: false, currentPeriod: false, isDayUsed: false, isToday: false, usedValue: null, mes: 8, dayOfDebit: false },
      { day: 3, ariaHidden: false, currentPeriod: false, isDayUsed: true, isToday: false, usedValue: 85420.50, mes: 8, dayOfDebit: false },
      { day: 4, ariaHidden: false, currentPeriod: false, isDayUsed: true, isToday: false, usedValue: 92150.75, mes: 8, dayOfDebit: false },
      { day: 5, ariaHidden: false, currentPeriod: false, isDayUsed: true, isToday: false, usedValue: 78900.25, mes: 8, dayOfDebit: false },
      { day: 6, ariaHidden: false, currentPeriod: false, isDayUsed: false, isToday: false, usedValue: null, mes: 8, dayOfDebit: false },
      { day: 7, ariaHidden: false, currentPeriod: false, isDayUsed: false, isToday: false, usedValue: null, mes: 8, dayOfDebit: false }
    ],
    // Semana 2 de Agosto
    [
      { day: 8, ariaHidden: false, currentPeriod: false, isDayUsed: false, isToday: false, usedValue: null, mes: 8, dayOfDebit: false },
      { day: 9, ariaHidden: false, currentPeriod: false, isDayUsed: false, isToday: false, usedValue: null, mes: 8, dayOfDebit: false },
      { day: 10, ariaHidden: false, currentPeriod: false, isDayUsed: true, isToday: false, usedValue: 67890.40, mes: 8, dayOfDebit: false },
      { day: 11, ariaHidden: false, currentPeriod: false, isDayUsed: false, isToday: false, usedValue: null, mes: 8, dayOfDebit: false },
      { day: 12, ariaHidden: false, currentPeriod: false, isDayUsed: false, isToday: false, usedValue: null, mes: 8, dayOfDebit: false },
      { day: 13, ariaHidden: false, currentPeriod: false, isDayUsed: false, isToday: false, usedValue: null, mes: 8, dayOfDebit: false },
      { day: 14, ariaHidden: false, currentPeriod: false, isDayUsed: true, isToday: false, usedValue: 105200.80, mes: 8, dayOfDebit: true }
    ]
  ];

  periodsData2: Day[][] = [
    // Semana 1 de Setembro
    [
      { day: 1, ariaHidden: false, currentPeriod: true, isDayUsed: false, isToday: false, usedValue: null, mes: 9, dayOfDebit: false },
      { day: 2, ariaHidden: false, currentPeriod: true, isDayUsed: false, isToday: false, usedValue: null, mes: 9, dayOfDebit: false },
      { day: 3, ariaHidden: false, currentPeriod: true, isDayUsed: true, isToday: true, usedValue: 67890.40, mes: 9, dayOfDebit: false },
      { day: 4, ariaHidden: false, currentPeriod: true, isDayUsed: false, isToday: false, usedValue: null, mes: 9, dayOfDebit: false },
      { day: 5, ariaHidden: false, currentPeriod: true, isDayUsed: false, isToday: false, usedValue: null, mes: 9, dayOfDebit: false },
      { day: 6, ariaHidden: false, currentPeriod: true, isDayUsed: false, isToday: false, usedValue: null, mes: 9, dayOfDebit: false },
      { day: 7, ariaHidden: false, currentPeriod: true, isDayUsed: false, isToday: false, usedValue: null, mes: 9, dayOfDebit: false }
    ],
    // Semana 2 de Setembro
    [
      { day: 8, ariaHidden: false, currentPeriod: true, isDayUsed: true, isToday: false, usedValue: 45200.30, mes: 9, dayOfDebit: false },
      { day: 9, ariaHidden: false, currentPeriod: true, isDayUsed: true, isToday: false, usedValue: 52800.75, mes: 9, dayOfDebit: false },
      { day: 10, ariaHidden: false, currentPeriod: true, isDayUsed: false, isToday: false, usedValue: null, mes: 9, dayOfDebit: false },
      { day: 11, ariaHidden: false, currentPeriod: true, isDayUsed: true, isToday: false, usedValue: 38900.60, mes: 9, dayOfDebit: false },
      { day: 12, ariaHidden: false, currentPeriod: true, isDayUsed: true, isToday: false, usedValue: 71500.90, mes: 9, dayOfDebit: false },
      { day: 13, ariaHidden: false, currentPeriod: true, isDayUsed: false, isToday: false, usedValue: null, mes: 9, dayOfDebit: false },
      { day: 14, ariaHidden: false, currentPeriod: true, isDayUsed: false, isToday: false, usedValue: null, mes: 9, dayOfDebit: false }
    ]
  ];
}

bootstrapApplication(App);