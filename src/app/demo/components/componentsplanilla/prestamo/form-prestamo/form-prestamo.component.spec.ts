import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormPrestamoComponent } from './form-prestamo.component';

describe('InfoComponent', () => {
    let component: FormPrestamoComponent;
    let fixture: ComponentFixture<FormPrestamoComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FormPrestamoComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(FormPrestamoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
