export class ValidateLoginTokenCommand {
    constructor(
      public readonly email: string,
      public readonly token: string,
    ) {}
  }