export interface TaskViewModel {
  id: number;
  text: string;
  start_date: Date | string;  
  end_date: Date | string;   
  duration: number;        
  progress: number;         
  parent: number;    
  holder: string;             
  dbid: number;               
}