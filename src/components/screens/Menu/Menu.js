import Component from '../../../utils/Component';
import { appEmitter } from '../../../utils/emmiter';
import gameStorage from '../../../utils/gameStorage';

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

    // =============== PopUp ===================

    const settingsPopup = new Popup({
      className: 'settings__popup',
    });

    // =============== Mode Buttons ===================

    const modeBtnContainer = new Component({
      className: 'menu__mode-container',
    });
    const modeButtons = [
      new Button({
        btnText: 'Classic',
        ourClass: ['mode__button'],
        onClick: () => appEmitter.emit('modeSwitch', 'classic'),
      }),
      new Button({
        btnText: 'Random',
        ourClass: ['mode__button'],
        onClick: () => appEmitter.emit('modeSwitch', 'random'),
      }),
      new Button({
        btnText: 'Chaotic',
        ourClass: ['mode__button'],
        onClick: () => appEmitter.emit('modeSwitch', 'chaotic'),
      }),
    ];

    const mode = gameStorage.getSetting('mode');
    let selectedButton = modeButtons[0];

    switch (mode) {
      case 'classic':
        selectedButton = modeButtons[0];
        break;
      case 'random':
        selectedButton = modeButtons[1];
        break;
      case 'chaotic':
        selectedButton = modeButtons[2];
        break;
    }
    selectedButton.addClass('selected');

    modeButtons.forEach((btn) => {
      modeBtnContainer.append(btn);
      btn.addListener('click', () => {
        modeButtons.forEach((el) => el.removeClass('selected'));
        btn.addClass('selected');
      });
    });

    // =============== Buttons ===================

    const btnContainer = new Component({
      className: 'menu__buttons-container',
    });
    const currentSave = gameStorage.getCurrentSave();
    if (currentSave) {
      btnContainer.append(
        new Button({
          btnText: 'Continue',
          ourClass: ['menu__button'],
          onClick: () => appEmitter.emit('game:continue', currentSave),
        })
      );
    }
    btnContainer.appendChildren([
      new Button({
        btnText: 'New Game',
        ourClass: ['menu__button'],
        onClick: () => appEmitter.emit('showScreen', 'game'),
      }),
      modeBtnContainer,
      new Button({
        btnText: 'Settings',
        ourClass: ['menu__button'],
        onClick: () => settingsPopup.open(),
      }),
      new Button({ btnText: 'Results', ourClass: ['menu__button'] }),
    ]);

    // =============== Github ===================

    const githubLink = new Component({
      tag: 'a',
      className: 'github__link',
      text: 'Created by @FierceSloth',
    });
    githubLink.setAttribute('href', 'https://github.com/FierceSloth');
    githubLink.setAttribute('target', '_blank');
    document.body.append(githubLink.node);

    // =============== Other ===================

    this.appendChildren([menuTitle, btnContainer]);
  }
}
