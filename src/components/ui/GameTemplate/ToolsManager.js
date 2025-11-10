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

    this.appendChildren([undoBtn, addBtn]);
  }
}
