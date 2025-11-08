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

    emitter.on('initGrid', (cells) => {
      this.initCell(cells);
    });
    emitter.on('deleteCell', () => {
      this.deleteCell();
    });
    this.addListener('click', () => {
      emitter.emit('cellClick', this);
    });
  }

  initCell(arr) {
    const index = arr.indexOf(this.node);
    const x = index % 9;
    this.xPos = x === 0 ? 9 : x;
    this.yPos = Math.ceil(index / 9);
  }

  deleteCell() {
    this.node.textContent = '';
    this.value = null;
    this.isDeleted = true;
    this.node.classList.add('cell--deleted');
  }
}
