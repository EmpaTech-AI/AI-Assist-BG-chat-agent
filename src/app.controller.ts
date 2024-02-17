import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { CreateMessageDto } from './dto/create-message.dto'
import { CreateThreadDto } from './dto/create-thread.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('start')
  async start(): Promise<CreateThreadDto> {
    return this.appService.start();
  }

  @Post('chat')
  async chat(@Body() messageDto: CreateMessageDto): Promise<any> {
    return this.appService.chat(messageDto);
  }
}
