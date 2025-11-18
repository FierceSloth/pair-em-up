import Component from '../../../utils/Component';

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
    let gameTemplate = new GameTemplate(this.options);

    this.appendChildren([gameTitle, gameTemplate]);
  }
}
