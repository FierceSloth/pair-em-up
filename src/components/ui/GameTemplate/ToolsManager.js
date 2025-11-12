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
      btnText: 'Add Numbers',
      onClick: () => emitter.emit('tools:add', ''),
    });
    const shuffleBtn = new Button({
      btnText: 'Shuffle',
      onClick: () => emitter.emit('tools:shuffle', ''),
    });
    const eraserBtn = new Button({
      btnText: 'Eraser',
      onClick: () => emitter.emit('tools:eraser', ''),
    });
    eraserBtn.node.disabled = true;
    emitter.on('card:selected', () => {
      eraserBtn.node.disabled = false;
    });
    emitter.on('card:removed', () => {
      eraserBtn.node.disabled = true;
    });

    this.appendChildren([undoBtn, addBtn, shuffleBtn, eraserBtn]);
  }
}
