

export class Respuesta {
    code: number;
    data: {
      codeStatus: number;
      messageStatus: string;
      message?: string; // El mensaje puede ser opcional
    };
    message?: string;
    success: boolean;
    errors?: { [key: string]: string[] }; 
  }