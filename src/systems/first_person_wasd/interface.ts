export interface IFirstPersonWasd {}

export interface IFirstPersonWasdSystem {
  create(id: string): IFirstPersonWasd;
  get(id: string): IFirstPersonWasd;
  update(delta: number): void;
}
