import Component from '../../../utils/Component';
import { appEmitter } from '../../../utils/emmiter';

import Button from '../../ui/Button/Button';
import Popup from '../../ui/Popup/Popup';

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

    const settingsPopup = new Popup({
      className: 'settings__popup',
    });

    const btnContainer = new Component({
      className: 'menu__buttons-container',
    });
    const btnsOptions = [
      { btnText: 'Play', ourClass: ['menu__button'], onClick: () => appEmitter.emit('showScreen', 'game') },
      { btnText: 'Settings', ourClass: ['menu__button'], onClick: () => appEmitter.emit('showSettings', '') },
      { btnText: 'Results', ourClass: ['menu__button'] },
    ];
    btnsOptions.forEach((option) => {
      btnContainer.append(new Button(option));
    });

    appEmitter.on('showSettings', () => settingsPopup.open());

    this.appendChildren([menuTitle, btnContainer]);
  }
}
