import Component from '../../../utils/Component';
import { emitter } from '../../../utils/emmiter';

import Button from '../../ui/Button/Button';
import GameTemplate from '../../ui/GameTemplate/GameTemplate';

export default class Game extends Component {
  constructor() {
    super({
      className: ['container', 'container__game'],
    });
  }

  render() {
    const gameTitle = new Component({
      tag: 'h1',
      className: 'title',
      text: 'Pair ’Em Up',
    });
    const backBtn = new Button({
      btnText: 'Go Back',
      onClick: () => emitter.emit('showScreen', 'menu'),
    });
    const gameTemplate = new GameTemplate();

    this.appendChildren([gameTitle, backBtn, gameTemplate]);
  }
}
