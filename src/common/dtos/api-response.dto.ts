export class APIResponse<T> {
  success: boolean;
  message: string;
  data?: T;

  constructor(success: boolean, message: string, data?: T) {
    this.success = success;
    this.message = message;
    if (data !== undefined) {
      this.data = data;
    }
  }
  static success<T>(message: string, data?: T): APIResponse<T> {
    return new APIResponse<T>(true, message, data);
  }

  static error<T>(message: string, data?: T): APIResponse<T> {
    return new APIResponse<T>(false, message, data);
  }
}
