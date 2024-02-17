import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateMessageDto {
  @IsNotEmpty()
  @IsString()
  thread_id: string;

  @MinLength(10)
  @IsString()
  message: string;
}