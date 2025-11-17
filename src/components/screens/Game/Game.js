import Component from '../../../utils/Component';
import { appEmitter } from '../../../utils/emmiter';

import Button from '../../ui/Button/Button';
import GameTemplate from '../../ui/GameTemplate/GameTemplate';

export default class Game extends Component {
  constructor(options = null) {
    super({
      className: ['container', 'container__game'],
    });
    this.options = options;
  }

  render() {
    const gameTitle = new Component({
      tag: 'h1',
      className: 'title',
      text: 'Pair ’Em Up',
    });
    const backBtn = new Button({
      btnText: 'Go Back',
      onClick: () => appEmitter.emit('showScreen', 'menu'),
    });

    let gameTemplate = new GameTemplate(this.options);

    this.appendChildren([gameTitle, backBtn, gameTemplate]);
  }
}
