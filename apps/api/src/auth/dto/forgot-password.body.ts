import { EMAIL_MAX_LENGTH, type ForgotPasswordRequest } from '@bszz-dojo/shared';
import { IsString, MaxLength } from 'class-validator';

export class ForgotPasswordBody implements ForgotPasswordRequest {
  @IsString()
  @MaxLength(EMAIL_MAX_LENGTH)
  email: string;
}
