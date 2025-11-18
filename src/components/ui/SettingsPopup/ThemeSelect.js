import Component from '../../../utils/Component';

import { appEmitter } from '../../../utils/emmiter';
import gameStorage from '../../../utils/gameStorage';

export default class ThemeSelect extends Component {
  constructor() {
    super({
      tag: 'label',
      className: 'theme__label',
      text: 'Select Theme:',
    });

    this.select = new Component({
      tag: 'select',
      className: 'theme__select',
    });
    this.append(this.select);

    const themeTitles = [
      { value: 'light', text: 'Light 🌞' },
      { value: 'dark', text: 'Dark 🌙' },
      { value: 'abstract-light', text: 'Pastel Light 🌸' },
      { value: 'abstract-dark', text: 'Abstract Dark 🌌' },
      { value: 'abstract-neon', text: 'Abstract Neon 💠' },
    ];

    const savedTheme = gameStorage.getSetting('theme') ?? 'light';

    themeTitles.forEach((theme) => {
      const option = new Component({
        tag: 'option',
        className: 'theme__option',
        text: theme.text,
      });
      option.setAttribute('value', theme.value);

      if (theme.value === savedTheme) {
        option.node.selected = true;
      }

      this.select.append(option);
    });

    this.select.addListener('change', (e) => {
      const theme = e.target.value;
      gameStorage.setSetting('theme', theme);
      const themeValues = themeTitles.map((theme) => theme.value);
      appEmitter.emit('settings:theme-change', { theme, themeValues });
    });
  }
}
