import Component from '../../../utils/Component';
import { emitter } from '../../../utils/emmiter';

export default class Cell extends Component {
  constructor({ value, index }) {
    super({
      className: 'grid--cell',
      text: value,
    });

    this.value = value;
    this.isDeleted = false;

    index = index + 1;
    const x = index % 9 === 0 ? 9 : index % 9;
    const y = Math.ceil(index / 9);
    this.xPos = x;
    this.yPos = y;

    this.node.setAttribute('data-pos', `x:${this.xPos} y:${this.yPos}`);

    this.deleteCell = this.deleteCell.bind(this);
    this.handleClick = this.handleClick.bind(this);

    emitter.on('deleteCell', this.deleteCell);
    this.node.addEventListener('click', this.handleClick);
  }

  deleteCell() {
    this.node.textContent = '';
    this.value = null;
    this.isDeleted = true;
    this.addClass('cell--deleted');
  }

  handleClick() {
    emitter.emit('cellClick', this);
  }

  destroyCell() {
    emitter.off('deleteCell', this.deleteCell);
    this.node.removeEventListener('click', this.handleClick);
    super.destroy();
  }
}
