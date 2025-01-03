import { Directive, HostListener, ElementRef, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';
import { globalmonedaService } from 'src/app/demo/services/globalmoneda.service';

@Directive({
  selector: '[formatCurrency]'
})
export class FormatCurrencyDirective implements OnInit {

  private currencySymbol: string = '';

  constructor(private el: ElementRef, private control: NgControl, private globalmoneda: globalmonedaService) { }

  ngOnInit(): void {
    this.currencySymbol = this.globalmoneda.getState().mone_Abreviatura; // Obtener el nombre de la moneda desde el servicio
  
    // Si el input ya tiene un valor y no tiene el símbolo de moneda, agrégalo
    const input = this.el.nativeElement as HTMLInputElement;
    if (input.value && !input.value.startsWith(this.currencySymbol)) {
      this.control.control?.setValue(`${this.currencySymbol} ${input.value}`);
    }
  }
  

  @HostListener('input', ['$event'])
  onInputChange(event: Event): void {
    const input = this.el.nativeElement as HTMLInputElement;
    let value = input.value.replace(/[^0-9.]/g, ''); // Remover todo excepto números y punto decimal

    if (value) {
      value = parseFloat(value).toFixed(2); // Formatear a dos decimales
      this.control.control?.setValue(`${this.currencySymbol} ${value}`);
    } else {
      this.control.control?.setValue('');
    }
  }

  @HostListener('blur')
  onBlur(): void {
    const input = this.el.nativeElement as HTMLInputElement;
    if (!input.value.startsWith(this.currencySymbol)) {
      this.control.control?.setValue(`${this.currencySymbol} ${input.value}`);
    }
  }
}
