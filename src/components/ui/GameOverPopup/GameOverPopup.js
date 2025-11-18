import Component from '../../../utils/Component';
import Popup from '../Popup/Popup';
import { appEmitter } from '../../../utils/emmiter';

import Button from '../Button/Button';

export default class GameOverPopup extends Popup {
  constructor(gameResult, { score, seconds, minutes }) {
    super({
      className: 'gameover__popup',
      canClosed: false,
    });
    if (score > 100) score = 100;

    const popupTitle = new Component({
      tag: 'h2',
      className: 'gameover-title',
    });
    switch (gameResult) {
      case 'win':
        popupTitle.node.textContent = 'You Win!';
        break;
      default:
        popupTitle.node.textContent = 'You Lose!';
        break;
    }

    const gameResultTime = new Component({
      className: 'popup__result-text',
      text: `Time: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
    });
    const gameResultScore = new Component({
      className: 'popup__result-text',
      text: `Score: ${score}`,
    });
    const gameResultContainer = new Component(
      {
        className: 'popup__result-container',
      },
      gameResultScore,
      gameResultTime
    );

    const menuBtn = new Button({
      btnText: 'Return to Menu',
      ourClass: ['popup-button'],
      onClick: () => {
        document.body.classList.remove('hide');
        appEmitter.emit('showScreen', 'menu');
      },
    });
    const gameBtn = new Button({
      btnText: 'Play Again',
      ourClass: ['popup-button'],
      onClick: () => {
        document.body.classList.remove('hide');
        appEmitter.emit('showScreen', 'game');
      },
    });
    const btnContainer = new Component(
      {
        className: 'popup__btn-container',
      },
      menuBtn,
      gameBtn
    );

    this.popup.appendChildren([popupTitle, gameResultContainer, btnContainer]);
  }
}
