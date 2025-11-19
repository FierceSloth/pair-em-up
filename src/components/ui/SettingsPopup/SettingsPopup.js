import Popup from '../Popup/Popup';
import { appEmitter } from '../../../utils/emmiter';

import ThemeSelect from './ThemeSelect';
import InputRange from './InputRange';
import Button from '../Button/Button';
import gameStorage from '../../../utils/gameStorage';

export default class SettingsPopup extends Popup {
  constructor(withBackBtn = false) {
    super({
      className: 'settings__popup',
    });

    const themeSelect = new ThemeSelect();
    const uiVolume = new InputRange({ labelText: 'UI Sounds Volume', value: gameStorage.getSetting('uiVolume') });
    uiVolume.input.addListener('input', (e) => {
      appEmitter.emit('settings:ui-volume-change', e.target.value);
    });
    const musicVolume = new InputRange({
      labelText: 'Music Sound Volume',
      value: gameStorage.getSetting('musicVolume'),
    });
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
