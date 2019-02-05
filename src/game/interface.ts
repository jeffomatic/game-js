import { Keyboard } from '../keyboard';
import { ComponentManager } from '../components';

export interface IGame {
  keyboard: Keyboard;
  components: ComponentManager;
}
