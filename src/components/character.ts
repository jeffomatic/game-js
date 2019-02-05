export class Character {
  private meshId: string;

  constructor(meshId: string) {
    this.meshId = meshId;
  }

  getMeshId(): string {
    return this.meshId;
  }
}
