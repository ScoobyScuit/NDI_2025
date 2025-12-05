import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';

@Controller()
export class SpaController {
  @Get('*')
  serveSpa(@Res() res: Response): void {
    // Servir index.html pour toutes les routes non-API (pour le routing Angular)
    res.sendFile(
      join(__dirname, '..', '..', 'frontend_ndi_2025', 'dist', 'frontend_ndi_2025', 'browser', 'index.html')
    );
  }
}
