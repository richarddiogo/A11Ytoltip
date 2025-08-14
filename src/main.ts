import { Component, ViewChild, ElementRef, AfterViewInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { bootstrapApplication } from '@angular/platform-browser';

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

      <div *ngFor="let period of periods; let periodIndex = index" class="period-container">
        <div *ngFor="let week of period; let weekIndex = index" class="week-days">
          <span
            *ngFor="let day of week; let dayIndex = index"
            class="day-cell"
            [class.day-used]="day.isDayUsed"
            [class.day-today]="day.isToday"
            [class.day-debit]="day.dayOfDebit"
            (click)="day.isDayUsed ? toggleTooltip(periodIndex, weekIndex, dayIndex) : null"
            [attr.aria-expanded]="isActiveTooltip(periodIndex, weekIndex, dayIndex)"
            [attr.aria-describedby]="isActiveTooltip(periodIndex, weekIndex, dayIndex) ? 'tooltip-content-mes-' + day.mes + '-dia-' + day.day : null"
            [attr.aria-hidden]="day.ariaHidden"
            [attr.aria-label]="dayAriaLabel(day.day)"
            [attr.role]="day.isDayUsed ? 'button' : 'text'"
            [attr.tabindex]="day.isDayUsed ? '0' : '-1'"
            (keydown.enter)="day.isDayUsed ? toggleTooltip(periodIndex, weekIndex, dayIndex) : null"
            (keydown.space)="day.isDayUsed ? toggleTooltip(periodIndex, weekIndex, dayIndex) : null"
          >
            {{ day.day }}
            <div *ngIf="day.isToday" class="today-border"></div>
          </span>
        </div>
      </div>

      <div 
        *ngIf="activeTooltip.periodIndex !== null"
        #tooltipContent
        [id]="'tooltip-content-mes-' + getActiveDay()?.mes + '-dia-' + getActiveDay()?.day"
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
            <span class="value">R$ {{ getActiveDay()?.usedValue?.toLocaleString('pt-BR', {minimumFractionDigits: 2}) || '0,00' }}</span>
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
        *ngIf="activeTooltip.periodIndex !== null" 
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

    .period-container {
      margin-bottom: 20px;
    }

    .week-days {
      display: flex;
      gap: 8px;
      margin-bottom: 8px;
    }

    .day-cell {
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

    .day-cell.day-used {
      background: #28a745;
      color: white;
      cursor: pointer;
    }

    .day-cell.day-used:hover {
      background: #218838;
    }

    .day-cell.day-today {
      background: #007bff;
      color: white;
      font-weight: bold;
      cursor: pointer;
    }

    .day-cell.day-today:hover {
      background: #0056b3;
    }

    .day-cell.day-debit {
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

    .day-cell[aria-expanded="true"] {
      box-shadow: 0 0 0 2px #80bdff;
    }

    .day-cell[role="button"]:focus {
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

  @Input() periods: any[][] = [];

  weekNames: Array<{ name: string; abbreviation: string }> = [
    { name: 'Domingo', abbreviation: 'dom' },
    { name: 'Segunda-feira', abbreviation: 'seg' },
    { name: 'Terça-feira', abbreviation: 'ter' },
    { name: 'Quarta-feira', abbreviation: 'qua' },
    { name: 'Quinta-feira', abbreviation: 'qui' },
    { name: 'Sexta-feira', abbreviation: 'sex' },
    { name: 'Sábado', abbreviation: 'sáb' }
  ];

  
  activeTooltip = { periodIndex: null as number | null, weekIndex: null as number | null, dayIndex: null as number | null };
  tooltipPosition = { top: 0, left: 0 };
  activeTriggerButton!: ElementRef<HTMLElement>;

  ngAfterViewInit() {
    // Componente inicializado, ViewChild disponível
  }

  public toggleTooltip(periodIndex: number, weekIndex: number, dayIndex: number) {
    if (this.isActiveTooltip(periodIndex, weekIndex, dayIndex)) {
      this.closeTooltip();
    } else {
      this.openTooltip(periodIndex, weekIndex, dayIndex);
    }
  }

  public isActiveTooltip(periodIndex: number, weekIndex: number, dayIndex: number): boolean {
    return this.activeTooltip.periodIndex === periodIndex && 
           this.activeTooltip.weekIndex === weekIndex && 
           this.activeTooltip.dayIndex === dayIndex;
  }

  public getActiveDay() {
    if (this.activeTooltip.periodIndex !== null && 
        this.activeTooltip.weekIndex !== null && 
        this.activeTooltip.dayIndex !== null) {
      return this.periods[this.activeTooltip.periodIndex][this.activeTooltip.weekIndex][this.activeTooltip.dayIndex];
    }
    return null;
  }

  public dayAriaLabel(day: number): string {
    return `Day ${day}`;
  }

  public openTooltip(periodIndex: number, weekIndex: number, dayIndex: number) {
    this.activeTooltip = { periodIndex, weekIndex, dayIndex };
    
    // Calcula posição do tooltip
    setTimeout(() => {
      this.calculateTooltipPosition(periodIndex, weekIndex, dayIndex);
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

  public closeTooltip() {
    this.activeTooltip = { periodIndex: null, weekIndex: null, dayIndex: null };
    
    // Remove listener do ESC
    document.removeEventListener('keydown', this.handleEscKey);
    
    // Retorna focus para o botão
    setTimeout(() => {
      if (this.activeTriggerButton?.nativeElement) {
        this.activeTriggerButton.nativeElement.focus();
      }
    });
  }

  private calculateTooltipPosition(periodIndex: number, weekIndex: number, dayIndex: number) {
    // Find the correct button within THIS specific tooltip component instance
    const dayCellsInComponent = this.container.nativeElement.querySelectorAll('.day-cell');
    
    // Calculate the correct index for the clicked day
    let dayIndex_calculated = 0;
    for (let p = 0; p < periodIndex; p++) {
      for (let w = 0; w < this.periods[p].length; w++) {
        dayIndex_calculated += this.periods[p][w].length;
      }
    }
    for (let w = 0; w < weekIndex; w++) {
      dayIndex_calculated += this.periods[periodIndex][w].length;
    }
    dayIndex_calculated += dayIndex;
    
    const currentButton = dayCellsInComponent[dayIndex_calculated] as HTMLElement;
    
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
  periodsData: any[][] = [
    // Período 1 (Agosto)
    [
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
    ],
    // Período 2 (Setembro)
    [
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
      // Semana 4 de Setembro (final do mês)
      [
        { day: 24, ariaHidden: false, currentPeriod: true, isDayUsed: true, isToday: false, usedValue: 112450.90, mes: 9, dayOfDebit: false },
        { day: 25, ariaHidden: false, currentPeriod: true, isDayUsed: true, isToday: false, usedValue: 98750.60, mes: 9, dayOfDebit: false },
        { day: 26, ariaHidden: false, currentPeriod: true, isDayUsed: true, isToday: false, usedValue: 87320.30, mes: 9, dayOfDebit: false },
        { day: 27, ariaHidden: false, currentPeriod: true, isDayUsed: true, isToday: false, usedValue: 95680.75, mes: 9, dayOfDebit: false },
        { day: 28, ariaHidden: false, currentPeriod: true, isDayUsed: true, isToday: false, usedValue: 103290.45, mes: 9, dayOfDebit: false },
        { day: 29, ariaHidden: false, currentPeriod: true, isDayUsed: true, isToday: false, usedValue: 89150.20, mes: 9, dayOfDebit: false },
        { day: 30, ariaHidden: false, currentPeriod: true, isDayUsed: true, isToday: false, usedValue: 76840.85, mes: 9, dayOfDebit: false }
      ]
    ]
  ];

  periodsData2: any[][] = [
    // Período 1 (Setembro)
    [
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
    ]
  ];
}

bootstrapApplication(App);