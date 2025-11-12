import Component from '../../../utils/Component';
import { emitter } from '../../../utils/emmiter';

import Button from '../Button/Button';

export default class ToolsManager extends Component {
  constructor() {
    super({
      className: 'panel__tools-wrapper',
    });

    const undoBtn = new Button({
      btnText: 'Revert',
      onClick: () => emitter.emit('tools:undo', ''),
    });
    const addBtn = new Button({
      btnText: 'Add Numbers (10)',
      onClick: () => emitter.emit('tools:add', ''),
    });
    const shuffleBtn = new Button({
      btnText: 'Shuffle (5)',
      onClick: () => emitter.emit('tools:shuffle', ''),
    });
    const eraserBtn = new Button({
      btnText: 'Eraser (5)',
      onClick: () => emitter.emit('tools:eraser', ''),
    });

    eraserBtn.node.disabled = true;
    emitter.on('card:selected', () => {
      eraserBtn.node.disabled = false;
    });
    emitter.on('card:removed', () => {
      eraserBtn.node.disabled = true;
    });

    emitter.on('button:update', (tools) => {
      if (tools.add === 0) addBtn.node.disabled = true;
      if (tools.shuffle === 0) shuffleBtn.node.disabled = true;
      if (tools.eraser === 0) eraserBtn.node.disabled = true;

      addBtn.node.textContent = `Add Numbers (${tools.add})`;
      10;
      shuffleBtn.node.textContent = `Shuffle (${tools.shuffle})`;
      eraserBtn.node.textContent = `Eraser (${tools.eraser})`;
    });

    this.appendChildren([undoBtn, addBtn, shuffleBtn, eraserBtn]);
  }
}
