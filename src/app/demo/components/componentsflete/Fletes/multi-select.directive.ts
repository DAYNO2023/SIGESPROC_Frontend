import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appMultiSelect]'
})
export class MultiSelectDirective {
  @Input() items: any[];
  @Input() selectedItems: any[];

  private lastSelectedIndex: number = -1;

  constructor(private el: ElementRef) { }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const items = this.items;
    const selectedItems = this.selectedItems;

    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      const currentIndex = items.findIndex(item => selectedItems.includes(item));
      if (currentIndex !== -1) {
        let newIndex = currentIndex + (event.key === 'ArrowUp' ? -1 : 1);
        newIndex = Math.max(0, Math.min(items.length - 1, newIndex));

        if (event.shiftKey) {
          // Selección múltiple con Shift
          const start = Math.min(this.lastSelectedIndex, newIndex);
          const end = Math.max(this.lastSelectedIndex, newIndex);
          selectedItems.length = 0; // Limpiar la selección actual
          for (let i = start; i <= end; i++) {
            if (!selectedItems.includes(items[i])) {
              selectedItems.push(items[i]);
            }
          }
        } else {
          // Selección simple
          selectedItems.length = 0;
          selectedItems.push(items[newIndex]);
          this.lastSelectedIndex = newIndex;
        }
      } else if (selectedItems.length === 0 && items.length > 0) {
        // Si no hay selección previa, selecciona el primer o último elemento dependiendo de la tecla
        let newIndex = event.key === 'ArrowUp' ? 0 : items.length - 1;
        selectedItems.push(items[newIndex]);
        this.lastSelectedIndex = newIndex;
      }
      event.preventDefault();
    }
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent) {
    const items = this.items;
    const selectedItems = this.selectedItems;
    const index = Array.from(this.el.nativeElement.children).indexOf(event.target as HTMLElement);

    if (index !== -1) {
      if (event.shiftKey && this.lastSelectedIndex !== -1) {
        const start = Math.min(this.lastSelectedIndex, index);
        const end = Math.max(this.lastSelectedIndex, index);
        selectedItems.length = 0; // Limpiar la selección actual
        for (let i = start; i <= end; i++) {
          selectedItems.push(items[i]);
        }
      } else {
        selectedItems.length = 0;
        selectedItems.push(items[index]);
        this.lastSelectedIndex = index;
      }
    }
  }
}
