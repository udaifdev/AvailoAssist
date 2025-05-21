export class CreateServiceDto {
  readonly categoryName: string;
  readonly categoryDescription: string;
  readonly amount: number;
  picture?: string;
  status?: string;  // Optional
}