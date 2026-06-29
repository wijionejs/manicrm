import { Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { WorkspaceInvitesService } from './workspace-invites.service';

@Controller('invites')
export class InviteAcceptController {
  constructor(private readonly workspaceInvitesService: WorkspaceInvitesService) {}

  @Get(':token')
  findByToken(@Param('token') token: string) {
    return this.workspaceInvitesService.findByToken(token);
  }

  @Post(':token/accept')
  @HttpCode(204)
  accept(@Param('token') token: string, @CurrentUser() user: { id: string; email: string }) {
    return this.workspaceInvitesService.accept(token, user.id, user.email);
  }
}
