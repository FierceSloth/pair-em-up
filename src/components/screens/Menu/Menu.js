import Component from '../../../utils/Component';
import { emitter } from '../../../utils/emmiter';

import Button from '../../ui/Button/Button';

export default class Menu extends Component {
  constructor() {
    super({
      className: ['container', 'container__menu'],
    });
  }

  render() {
    const menuTitle = new Component({
      tag: 'h1',
      className: 'title',
      text: 'Pair ’Em Up',
    });

    const btnContainer = new Component({
      className: 'menu__buttons-container',
    });
    const btnsOptions = [
      { btnText: 'Play', ourClass: ['menu__button'], onClick: () => emitter.emit('showScreen', 'game') },
      { btnText: 'Settings', ourClass: ['menu__button'] },
      { btnText: 'Results', ourClass: ['menu__button'] },
    ];
    btnsOptions.forEach((option) => {
      btnContainer.append(new Button(option));
    });

    this.appendChildren([menuTitle, btnContainer]);
  }
}
