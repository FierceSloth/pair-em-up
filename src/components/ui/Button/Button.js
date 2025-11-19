import Component from '../../../utils/Component';
import { appEmitter } from '../../../utils/emmiter';

export default class Button extends Component {
  constructor({ btnText = '', ourClass = [], onClick, removeSound = false }) {
    super({
      tag: 'button',
      className: ['button', ...ourClass],
      text: btnText,
    });

    this.addListener('click', onClick);
    if (!removeSound) {
      this.addListener('click', () => {
        appEmitter.emit('ui:btnClick', '');
      });
    }
  }
}
