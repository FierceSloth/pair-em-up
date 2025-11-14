import Component from '../../../utils/Component';
import { emitter } from '../../../utils/emmiter';

import Button from '../Button/Button';

export default class ToolsManager extends Component {
  constructor() {
    super({
      className: 'panel__tools-wrapper',
    });

    const movesBtn = new Button({
      btnText: 'Moves',
    });
    const undoBtn = new Button({
      btnText: 'Revert',
      onClick: () => emitter.emit('tools:undo', ''),
    });
    const addBtn = new Button({
      btnText: 'Add (10)',
      onClick: () => emitter.emit('tools:add', ''),
    });
    const hinitsBtn = new Button({
      btnText: 'Hinits(5)',
      onClick: () => emitter.emit('tools:hinits', ''),
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
      if (!eraserBtn.isEnded) {
        eraserBtn.node.disabled = false;
      }
    });
    emitter.on('card:removed', () => {
      if (!eraserBtn.isEnded) {
        eraserBtn.node.disabled = true;
      }
    });
    emitter.on('hinit:moves', (moves) => {
      let strMoves = String(moves);
      if (moves > 5) {
        strMoves = '5+';
      }
      movesBtn.setAttribute('data-message', strMoves);
    });

    emitter.on('button:update', (tools) => {
      this.updateToolButton(addBtn, 'Add', tools.add);
      this.updateToolButton(hinitsBtn, 'Hinits', tools.hinits);
      this.updateToolButton(shuffleBtn, 'Shuffle', tools.shuffle);
      this.updateToolButton(eraserBtn, 'Eraser', tools.eraser);
    });

    this.appendChildren([movesBtn, undoBtn, addBtn, hinitsBtn, shuffleBtn, eraserBtn]);
  }

  updateToolButton(button, tool, count) {
    button.node.textContent = `${tool} (${count})`;

    if (tool === 'Eraser') {
      button.isEnded = count === 0;
      return;
    }

    button.node.disabled = count === 0;
  }
}
