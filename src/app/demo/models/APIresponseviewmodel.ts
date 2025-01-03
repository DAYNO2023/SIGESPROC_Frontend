export class APIResponse<T> {
    code: number;
    success: boolean;
    message: string;
    data: T;
}
