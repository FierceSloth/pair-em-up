import Component from '../../../utils/Component';

export default class InputRange extends Component {
  constructor({ labelText = 'Value' }) {
    super({
      tag: 'label',
      className: 'input__label',
      text: labelText + ': ',
    });
    this.input = new Component({
      tag: 'input',
      className: 'input__range',
    });
    this.input.setAttribute('type', 'range');
    this.input.setAttribute('max', '100');
    this.input.setAttribute('min', '0');
    this.input.setAttribute('step', '1');
    this.input.setAttribute('value', '50');

    this.append(this.input);
  }
}
