export class CreateLoginTokenCommand {
    constructor(
      public readonly email?: string,
      public readonly fullName?: string,
    ) {}
  }