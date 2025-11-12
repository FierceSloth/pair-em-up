import Component from '../../../utils/Component';
import { emitter } from '../../../utils/emmiter';
import Cell from './Cell';
import { shuffleArr } from '../../../utils/random';

export default class Grid extends Component {
  constructor() {
    super({
      className: 'game__grid',
    });

    this.mode = 'classic';
    this.cells = [];
    this.score = 0;
    this.tools = {
      add: 10,
      shuffle: 5,
      eraser: 5,
    };

    this.firstCard = null;
    this.secondCard = null;
    this.isUndoUsed = false;

    this.history = {
      grid: [],
      tools: [],
    };

    emitter.on('modeSwitch', (mode) => {
      this.mode = mode;
    });
    emitter.on('cellClick', (cell) => {
      this.selectCard(cell);
    });
    emitter.on('tools:undo', () => {
      this.toolsUndo();
    });
    emitter.on('tools:add', () => {
      this.toolsAdd();
    });
    emitter.on('tools:shuffle', () => {
      this.toolsShuffle();
    });
    emitter.on('tools:eraser', () => {
      this.toolsEraser();
    });
  }

  //* ============ Basic cards methods =============

  selectCard(cell) {
    if (this.secondCard === cell || cell.isDeleted) {
      return;
    }

    if (this.firstCard === cell) {
      this.firstCard.removeClass('cell--active');
      this.firstCard = null;
      emitter.emit('card:removed', '');
      return;
    }

    if (!this.firstCard) {
      this.firstCard = cell;
      cell.addClass('cell--active');
      emitter.emit('card:selected', '');
      return;
    }

    if (!this.secondCard) {
      this.secondCard = cell;
      cell.addClass('cell--active');

      this.checkMatch(this.firstCard, this.secondCard);
      return;
    }
  }

  checkMatch(first, second) {
    const coordResult = this.checkCoordMatch(first, second);
    const valueResult = this.checkValueMatch(first, second);

    if (coordResult && valueResult) {
      this.saveGrid();

      first.deleteCell();
      second.deleteCell();

      this.resetActiveCards();

      return true;
    }

    this.triggerAnimation(this.firstCard, 'cell--error');
    this.triggerAnimation(this.secondCard, 'cell--error');

    this.resetActiveCards();
    return false;
  }

  checkCoordMatch(first, second) {
    const [x1, y1] = [first.xPos, first.yPos];
    const [x2, y2] = [second.xPos, second.yPos];
    let result = true;

    if (Math.abs(x1 - x2) + Math.abs(y1 - y2) === 1) {
      console.log('simple exit');
      return true;
    }

    if (x1 === x2) {
      const minY = Math.min(y1, y2);
      const maxY = Math.max(y1, y2);

      for (let y = minY + 1; y < maxY; y += 1) {
        let cell = this.getCellByPos(x1, y);
        if (cell.value) {
          console.log('position incorrect');
          result = false;
          break;
        }
        console.log('position correct');
      }
    } else {
      const firstIndex = this.cells.indexOf(first);
      const secondIndex = this.cells.indexOf(second);
      const smaller = Math.min(firstIndex, secondIndex);
      const larger = Math.max(firstIndex, secondIndex);

      for (let i = smaller + 1; i < larger; i += 1) {
        let cell = this.cells[i];
        if (cell.value) {
          console.log('position incorrect');
          result = false;
          break;
        }
        console.log('position correct');
      }
    }

    return result;
  }

  checkValueMatch(first, second) {
    if (first.value === 5 && second.value === 5) {
      this.score += 3;
      console.log('value correct +3');
      return true;
    }

    if (first.value === second.value) {
      this.score += 1;
      console.log('value correct +1');
      return true;
    }

    if (first.value + second.value === 10) {
      this.score += 2;
      console.log('value correct +2');
      return true;
    }

    console.log('value incorrect');
    return false;
  }

  //* ========= Grid management methods ============

  removeGrid() {
    this.cells.forEach((cell) => {
      cell.destroyCell();
    });
    this.cells = [];
  }

  createGrid(gridArr, startIndex = 0) {
    const result = gridArr.map((value, index) => {
      const trueIndex = index + startIndex;
      const cell = new Cell({ value: value, index: trueIndex });

      if (value === null) {
        cell.addClass('cell--deleted');
        cell.isDeleted = true;
      }

      this.append(cell);
      return cell;
    });
    this.cells.push(...result);
  }

  //* ============ Tools methods ===============

  toolsUndo() {
    if (this.history.grid.length < 1 || this.isUndoUsed) return;
    this.tools = this.history.tools.pop();
    this.updateButtons();

    this.removeGrid();
    this.resetActiveCards();
    this.createGrid(this.history.grid.pop());
    this.isUndoUsed = true;
  }

  toolsAdd() {
    if (this.tools.add < 0) {
      return;
    }

    this.saveGrid();
    this.saveTools();
    const toAdd = this.cells.filter((cell) => cell.value).map((cell) => cell.value);
    const startIndex = this.cells.length;
    this.createGrid(toAdd, startIndex);

    this.tools.add -= 1;
    this.updateButtons();
  }

  toolsShuffle() {
    if (this.tools.shuffle < 0) {
      return;
    }

    this.saveGrid();
    this.saveTools();
    const nonNullCells = this.cells.filter((cell) => cell.value !== null);
    const nonNullValues = nonNullCells.map((cell) => cell.value);
    shuffleArr(nonNullValues);

    let shuffleIndex = 0;
    const result = this.cells.map((cell) => {
      if (cell.value === null) {
        return null;
      } else {
        const shuffledValue = nonNullValues[shuffleIndex];
        shuffleIndex += 1;
        return shuffledValue;
      }
    });

    this.tools.shuffle -= 1;
    this.updateButtons();

    this.removeGrid();
    this.resetActiveCards();
    this.createGrid(result);
  }

  toolsEraser() {
    if (this.tools.eraser < 0) {
      return;
    }

    if (this.firstCard) {
      this.saveGrid();
      this.saveTools();

      this.firstCard.deleteCell();
      this.resetActiveCards();

      this.tools.eraser -= 1;
      this.updateButtons();
    }
  }

  //* ============ Supporting methods ===========

  triggerAnimation(el, cls) {
    el.addClass(cls);
    el.addListener(
      'animationend',
      () => {
        el.removeClass(cls);
      },
      { once: true }
    );
  }

  resetActiveCards() {
    if (this.firstCard) this.firstCard.removeClass('cell--active');
    if (this.secondCard) this.secondCard.removeClass('cell--active');

    emitter.emit('card:removed', '');
    this.secondCard = null;
    this.firstCard = null;
  }

  saveGrid() {
    const copy = this.cells.map((cell) => cell.value);
    this.history.grid.push(copy);
    this.isUndoUsed = false;
  }

  saveTools() {
    const copy = { ...this.tools };
    this.history.tools.push(copy);
  }

  updateButtons() {
    emitter.emit('button:update', this.tools);
  }

  getCellByPos(x, y) {
    const index = (y - 1) * 9 + x;
    return this.cells[index - 1];
  }
}
