import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeduccionComponent } from './deduccion.component';

describe('DeduccionComponent', () => {
    let component: DeduccionComponent;
    let fixture: ComponentFixture<DeduccionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DeduccionComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(DeduccionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
