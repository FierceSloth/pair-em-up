import Component from '../../../utils/Component';

export default class Button extends Component {
  constructor({ btnText = '', ourClass = [], onClick }) {
    super({
      tag: 'button',
      className: ['button', ...ourClass],
      text: btnText,
    });

    this.addListener('click', onClick);
  }
}
