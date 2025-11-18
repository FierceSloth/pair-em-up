import Popup from '../Popup/Popup';
import { appEmitter } from '../../../utils/emmiter';

import ThemeSelect from './ThemeSelect';
import InputRange from './InputRange';
import Button from '../Button/Button';

export default class SettingsPopup extends Popup {
  constructor(withBackBtn = false) {
    super({
      className: 'settings__popup',
    });

    const themeSelect = new ThemeSelect();
    const uiVolume = new InputRange({ labelText: 'UI Sounds Volume' });
    uiVolume.input.addListener('input', (e) => {
      appEmitter.emit('settings:ui-volume-change', e.target.value);
    });
    const musicVolume = new InputRange({ labelText: 'Music Sound Volume' });
    musicVolume.input.addListener('input', (e) => {
      appEmitter.emit('settings:music-volume-change', e.target.value);
    });

    this.popup.appendChildren([themeSelect, uiVolume, musicVolume]);

    if (withBackBtn) {
      const backBtn = new Button({
        btnText: 'Exit to Menu',
        ourClass: ['settings__button'],
        onClick: () => appEmitter.emit('showScreen', 'menu'),
      });
      this.popup.append(backBtn);
    }
  }
}
