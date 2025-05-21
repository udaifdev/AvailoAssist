import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { AdminGuard } from 'src/utilit/admin.guard';

@Controller('/api/admin')

@UseGuards(AdminGuard)

export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('/payments/transactions')
  async getAllTransactions() {
    return this.paymentService.findAllTransactions();
  } 
  
  @Get('/payments/wallet-balance')
  async getWalletBalance() {
    console.log('admin transcations hitted...............!!')
    return {
      balance: await this.paymentService.getAdminWalletBalance()
    };
  }

  @Post('/payments/withdraw')
  async withdrawFunds(@Body('amount') amount: number) {
    return this.paymentService.withdrawAdminFunds(amount);
  }


  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.paymentService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
  //   return this.paymentService.update(+id, updatePaymentDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.paymentService.remove(+id);
  // }
}
