import Component from '../../../utils/Component';
import { appEmitter, emitter } from '../../../utils/emmiter';
import gameStorage from '../../../utils/gameStorage';

import Cell from './Cell';
import { getRandomInt, shuffleArr } from '../../../utils/random';
import { timerData } from './ScoreManager';
import GameOverPopup from '../GameOverPopup/GameOverPopup';

export default class Grid extends Component {
  constructor(options = null) {
    super({
      className: 'game__grid',
    });

    this.firstCard = null;
    this.secondCard = null;
    this.isUndoUsed = false;

    emitter.on('cellClick', (cell) => {
      this.selectCard(cell);
    });
    emitter.on('tools:undo', () => {
      this.toolsUndo();
    });
    emitter.on('tools:add', () => {
      this.toolsAdd();
    });
    emitter.on('tools:hinits', () => {
      this.toolsHinits();
    });
    emitter.on('tools:shuffle', () => {
      this.toolsShuffle();
    });
    emitter.on('tools:eraser', () => {
      this.toolsEraser();
    });

    if (options) {
      this.mode = options.mode;
      this.tools = structuredClone(options.tools);
      this.history = structuredClone(options.history);
      this.score = options.score;

      timerData.minutes = options.minutes;
      timerData.seconds = options.seconds;
      emitter.emit('score:change', this.score);

      this.cells = [];

      emitter.emit('mode:update', this.mode);

      setTimeout(() => {
        this.calculateAvailableMoves();
        this.updateButtons();
      }, 100);

      return;
    }

    this.mode = gameStorage.getSetting('mode');
    this.cells = [];
    this.score = 0;
    this.tools = {
      add: 10,
      hinits: 5,
      shuffle: 5,
      eraser: 5,
    };

    this.history = {
      grid: [],
      tools: [],
      score: [0],
    };

    setTimeout(() => {
      this.calculateAvailableMoves();
    }, 100);

    emitter.emit('mode:update', this.mode);
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
      appEmitter.emit('ui:cellSelect', '');
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

      this.score += valueResult;
      emitter.emit('score:change', this.score);

      appEmitter.emit('ui:cellsMatch', '');
      first.deleteCell();
      second.deleteCell();

      this.resetActiveCards();
      this.calculateAvailableMoves();
      this.checkGameEnd();

      return true;
    }

    appEmitter.emit('ui:cellsError', '');
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
      return true;
    }

    if (x1 === x2) {
      const minY = Math.min(y1, y2);
      const maxY = Math.max(y1, y2);

      for (let y = minY + 1; y < maxY; y += 1) {
        let cell = this.getCellByPos(x1, y);
        if (cell.value) {
          result = false;
          break;
        }
      }
    } else {
      const firstIndex = this.cells.indexOf(first);
      const secondIndex = this.cells.indexOf(second);
      const smaller = Math.min(firstIndex, secondIndex);
      const larger = Math.max(firstIndex, secondIndex);

      for (let i = smaller + 1; i < larger; i += 1) {
        let cell = this.cells[i];
        if (cell.value) {
          result = false;
          break;
        }
      }
    }

    return result;
  }

  checkValueMatch(first, second) {
    if (first.value === 5 && second.value === 5) {
      return 3;
    }

    if (first.value === second.value) {
      return 1;
    }

    if (first.value + second.value === 10) {
      return 2;
    }

    return false;
  }

  checkGameEnd() {
    const { add, shuffle, eraser } = this.tools;
    const activeCell = this.cells.filter((cell) => !cell.isDeleted);

    if (activeCell.length === 0 || this.score >= 100) {
      const gameState = this.getGameState();
      const winPopup = new GameOverPopup('win', gameState);
      appEmitter.emit('ui:gameWin', '');
      appEmitter.emit('game:end', gameState);
      winPopup.open();
      return true;
    }

    const movesResult = this.calculateAvailableMoves() === 0 && add + shuffle + eraser === 0;
    const limitResult = this.cells.length > 50 * 9;

    if (movesResult || limitResult) {
      const gameState = this.getGameState();
      const losePopup = new GameOverPopup('lose', gameState);
      appEmitter.emit('ui:gameLose', '');
      appEmitter.emit('game:end', gameState);
      losePopup.open();
      return false;
    }
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

    if (this.history.tools.length > 0) {
      this.tools = this.history.tools.pop();
      this.updateButtons();
    }

    this.score = this.history.score.pop();
    emitter.emit('score:change', this.score);

    appEmitter.emit('ui:toolsClick', '');
    this.removeGrid();
    this.resetActiveCards();
    this.createGrid(this.history.grid.pop());
    this.calculateAvailableMoves();
    this.isUndoUsed = true;
  }

  toolsAdd() {
    if (this.tools.add < 0) {
      return;
    }

    this.saveGrid();
    this.saveTools();

    let toAdd = this.cells.filter((cell) => cell.value).map((cell) => cell.value);
    switch (this.mode) {
      case 'random':
        shuffleArr(toAdd);
        break;
      case 'chaotic':
        toAdd = Array.from({ length: toAdd.length }, () => getRandomInt(1, 9));
        break;
      default:
        break;
    }

    const startIndex = this.cells.length;
    this.createGrid(toAdd, startIndex);

    appEmitter.emit('ui:toolsClick', '');
    this.tools.add -= 1;
    this.updateButtons();
    this.calculateAvailableMoves();
    this.checkGameEnd();
  }

  toolsHinits() {
    if (this.tools.hinits < 0) {
      return;
    }

    const hint = this.calculateAvailableMoves(true);

    if (hint) {
      appEmitter.emit('ui:toolHinits', '');
      hint.first.addClass('cell--hinits');
      hint.second.addClass('cell--hinits');

      this.tools.hinits -= 1;
      this.updateButtons();

      setTimeout(() => {
        hint.first.removeClass('cell--hinits');
        hint.second.removeClass('cell--hinits');
      }, 1000);
    }
  }

  toolsShuffle() {
    if (this.tools.shuffle < 0) {
      return;
    }

    this.saveGrid();
    this.saveTools();
    appEmitter.emit('ui:toolsClick', '');
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
    this.calculateAvailableMoves();
    this.checkGameEnd();
  }

  toolsEraser() {
    if (this.tools.eraser < 0) {
      return;
    }

    if (this.firstCard) {
      appEmitter.emit('ui:toolsClick', '');
      this.saveGrid();
      this.saveTools();

      this.firstCard.deleteCell();
      this.resetActiveCards();

      this.tools.eraser -= 1;
      this.updateButtons();
      this.calculateAvailableMoves();
      this.checkGameEnd();
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
    this.history.score.push(this.score);
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

  getGameState() {
    const copyCells = this.cells.map((cell) => cell.value);
    const { mode, history, tools, score } = this;
    const { minutes, seconds } = timerData;

    return {
      mode,
      copyCells,
      history,
      tools,
      score,
      minutes,
      seconds,
    };
  }

  calculateAvailableMoves(returnFirstHint = false) {
    let availableMoves = 0;
    let len = this.cells.length;

    for (let i = 0; i < len; i += 1) {
      const first = this.cells[i];

      if (first.isDeleted) {
        continue;
      }

      for (let j = i + 1; j < len; j += 1) {
        const second = this.cells[j];

        if (second.isDeleted) {
          continue;
        }

        if (availableMoves > 6) {
          break;
        }

        const coordResult = this.checkCoordMatch(first, second);
        const valueResult = this.checkValueMatch(first, second);

        if (coordResult && valueResult) {
          if (returnFirstHint) {
            return { first, second };
          }

          availableMoves += 1;
        }
      }

      if (availableMoves > 6) {
        break;
      }
    }

    emitter.emit('hinit:moves', availableMoves);
    return availableMoves;
  }
}
