import { Injectable } from '@angular/core';
import { Task } from '../../models/modelsgantt/task';

@Injectable({
    providedIn: 'root',
})
export class TaskService {
    get(): Promise<Task[]> {
        return Promise.resolve([
            { id: 1, text: 'Tarea #1', start_date: '02-02-2024 00:00', duration: 1, progress: 0.6, parent: 0, holder: 'Mindy' },
            { id: 5, text: 'Tarea #5', start_date: '09-02-2024 00:00', duration: 3, progress: 0.4, parent: 3, holder: 'Victor', incidente: true },
            { id: 2, text: 'Tarea #2', start_date: '04-02-2024 00:00', duration: 2, progress: 0.3, parent: 1, holder: 'Enderson' },
            { id: 3, text: 'Tarea #3', start_date: '04-02-2024 00:00', duration: 3, progress: 0.8, parent: 0, holder: 'Jason' },
            { id: 4, text: 'Tarea #4', start_date: '06-02-2024 00:00', duration: 6, progress: 0.3, parent: 3, holder: 'Madian' },
        ]);
    }
    constructor() {}
}
