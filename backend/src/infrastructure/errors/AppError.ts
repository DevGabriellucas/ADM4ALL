export class AppError extends Error {
  public readonly status: number;

  constructor(message: string, status: number = 400) {
    super(message);
    this.status = status;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
