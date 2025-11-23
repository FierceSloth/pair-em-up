(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) return;
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) processPreload(link);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
    }
  }).observe(document, {
    childList: true,
    subtree: true
  });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep) return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
class EventEmitter {
  constructor() {
    this.events = {};
  }
  on(event, listener) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(listener);
  }
  off(event, listener) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter((l) => l !== listener);
  }
  emit(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach((listener) => listener(data));
  }
  clear() {
    this.events = {};
  }
}
const emitter = new EventEmitter();
const appEmitter = new EventEmitter();
class GameStorage {
  constructor(key = "gameData") {
    this.key = key;
    this.data = this.loadData();
  }
  loadData() {
    const saved = localStorage.getItem(this.key);
    if (saved) {
      return JSON.parse(saved);
    }
    const init = {
      settings: {
        mode: "classic",
        audioEnabled: true,
        theme: "light",
        uiVolume: 50,
        musicVolume: 30
      },
      currentSave: null,
      lastResult: []
    };
    this.saveData(init);
    return init;
  }
  saveData(newData = this.data) {
    this.data = newData;
    localStorage.setItem(this.key, JSON.stringify(this.data));
  }
  getSetting(key) {
    return this.data.settings[key];
  }
  setSetting(key, value) {
    this.data.settings[key] = value;
    this.saveData();
  }
  getCurrentSave() {
    return this.data.currentSave;
  }
  updateCurrentSave(update) {
    this.data.currentSave = {
      ...this.data.currentSave,
      ...update
    };
    this.saveData();
  }
  getLastResult() {
    return this.data.lastResult;
  }
  pushLastResult(update) {
    let lastResult = this.data.lastResult;
    if (lastResult.length >= 5) this.data.lastResult.shift();
    this.data.lastResult.push(update);
    this.saveData();
  }
  resetAll() {
    localStorage.removeItem(this.key);
    this.data = this.loadData();
  }
}
const gameStorage = new GameStorage();
class Component {
  #node = null;
  constructor({ tag = "div", className = "", text = "" }, ...children) {
    const node = document.createElement(tag);
    node.textContent = text;
    this.#node = node;
    if (Array.isArray(className)) {
      className.forEach((cls) => node.classList.add(cls));
    } else {
      node.className = className;
    }
    if (children) {
      children.forEach((child) => {
        node.append(child.node);
      });
    }
  }
  setText(text) {
    this.#node.textContent = text;
  }
  addClass(className) {
    this.#node.classList.add(className);
  }
  removeClass(className) {
    this.#node.classList.remove(className);
  }
  toggleClass(className) {
    this.#node.classList.toggle(className);
  }
  setAttribute(attribute, value) {
    this.#node.setAttribute(attribute, value);
  }
  removeAttribute(attribute) {
    this.#node.removeAttribute(attribute);
  }
  append(child) {
    this.#node.append(child.node);
  }
  appendChildren(children) {
    children.forEach((child) => {
      this.append(child);
    });
  }
  addListener(event, listener, options = false) {
    this.#node.addEventListener(event, listener, options);
  }
  destroy() {
    this.#node.remove();
  }
  get node() {
    return this.#node;
  }
}
class Button extends Component {
  constructor({ btnText = "", ourClass = [], onClick, removeSound = false }) {
    super({
      tag: "button",
      className: ["button", ...ourClass],
      text: btnText
    });
    this.addListener("click", onClick);
    if (!removeSound) {
      this.addListener("click", () => {
        appEmitter.emit("ui:btnClick", "");
      });
    }
  }
}
class Popup extends Component {
  constructor({ className = "popup", canClosed = true }) {
    super({
      className: ["popup--overlay"]
    });
    this.canClosed = canClosed;
    this.popupClose = new Component(
      {
        className: ["popup__close", className + "__close"]
      },
      new Component({ tag: "span" }),
      new Component({ tag: "span" })
    );
    this.popup = new Component(
      {
        className: ["popup", className]
      },
      this.popupClose
    );
    this.append(this.popup);
    if (canClosed) {
      this.addListener("click", (e) => {
        if (e.target === this.node) this.close();
      });
      this.popupClose.addListener("click", (e) => {
        e.stopPropagation();
        this.close();
      });
    } else {
      this.popupClose.destroy();
    }
    document.body.append(this.node);
  }
  open() {
    document.body.classList.add("hide");
    this.addClass("popup--open");
    this.popup.addClass("popup--open");
  }
  close() {
    if (!this.canClosed) return;
    document.body.classList.remove("hide");
    this.removeClass("popup--open");
    this.popup.removeClass("popup--open");
  }
  toggle() {
    if (!this.canClosed) return;
    this.toggleClass("popup--open");
    this.popup.toggleClass("popup--open");
  }
}
class ThemeSelect extends Component {
  constructor() {
    super({
      tag: "label",
      className: "theme__label",
      text: "Select Theme:"
    });
    this.select = new Component({
      tag: "select",
      className: "theme__select"
    });
    this.append(this.select);
    const themeTitles = [
      { value: "light", text: "Light 🌞" },
      { value: "dark", text: "Dark 🌙" },
      { value: "abstract-light", text: "Pastel Light 🌸" },
      { value: "abstract-dark", text: "Abstract Dark 🌌" },
      { value: "abstract-neon", text: "Abstract Neon 💠" }
    ];
    const savedTheme = gameStorage.getSetting("theme") ?? "light";
    themeTitles.forEach((theme) => {
      const option = new Component({
        tag: "option",
        className: "theme__option",
        text: theme.text
      });
      option.setAttribute("value", theme.value);
      if (theme.value === savedTheme) {
        option.node.selected = true;
      }
      this.select.append(option);
    });
    this.select.addListener("change", (e) => {
      const theme = e.target.value;
      gameStorage.setSetting("theme", theme);
      const themeValues = themeTitles.map((theme2) => theme2.value);
      appEmitter.emit("settings:theme-change", { theme, themeValues });
    });
  }
}
class InputRange extends Component {
  constructor({ labelText = "Value", value = 50 }) {
    super({
      tag: "label",
      className: "input__label",
      text: labelText + ": "
    });
    this.input = new Component({
      tag: "input",
      className: "input__range"
    });
    this.input.setAttribute("type", "range");
    this.input.setAttribute("max", "100");
    this.input.setAttribute("min", "0");
    this.input.setAttribute("step", "1");
    this.input.setAttribute("value", value);
    this.append(this.input);
  }
}
class SettingsPopup extends Popup {
  constructor(withBackBtn = false) {
    super({
      className: "settings__popup"
    });
    const themeSelect = new ThemeSelect();
    const uiVolume = new InputRange({ labelText: "UI Sounds Volume", value: gameStorage.getSetting("uiVolume") });
    uiVolume.input.addListener("input", (e) => {
      appEmitter.emit("settings:ui-volume-change", e.target.value);
    });
    const musicVolume = new InputRange({
      labelText: "Music Sound Volume",
      value: gameStorage.getSetting("musicVolume")
    });
    musicVolume.input.addListener("input", (e) => {
      appEmitter.emit("settings:music-volume-change", e.target.value);
    });
    this.popup.appendChildren([themeSelect, uiVolume, musicVolume]);
    if (withBackBtn) {
      const backBtn = new Button({
        btnText: "Exit to Menu",
        ourClass: ["settings__button"],
        onClick: () => appEmitter.emit("showScreen", "menu")
      });
      this.popup.append(backBtn);
    }
  }
}
class Menu extends Component {
  constructor() {
    super({
      className: ["container", "container__menu"]
    });
  }
  render() {
    const menuTitle = new Component({
      tag: "h1",
      className: "title",
      text: "Pair ’Em Up"
    });
    const settingsPopup = new SettingsPopup();
    const modeBtnContainer = new Component({
      className: "menu__mode-container"
    });
    const modeButtons = [
      new Button({
        btnText: "Classic",
        ourClass: ["mode__button"],
        onClick: () => appEmitter.emit("modeSwitch", "classic")
      }),
      new Button({
        btnText: "Random",
        ourClass: ["mode__button"],
        onClick: () => appEmitter.emit("modeSwitch", "random")
      }),
      new Button({
        btnText: "Chaotic",
        ourClass: ["mode__button"],
        onClick: () => appEmitter.emit("modeSwitch", "chaotic")
      })
    ];
    const mode = gameStorage.getSetting("mode");
    let selectedButton = modeButtons[0];
    switch (mode) {
      case "classic":
        selectedButton = modeButtons[0];
        break;
      case "random":
        selectedButton = modeButtons[1];
        break;
      case "chaotic":
        selectedButton = modeButtons[2];
        break;
    }
    selectedButton.addClass("selected");
    modeButtons.forEach((btn) => {
      modeBtnContainer.append(btn);
      btn.addListener("click", () => {
        modeButtons.forEach((el) => el.removeClass("selected"));
        btn.addClass("selected");
      });
    });
    const btnContainer = new Component({
      className: "menu__buttons-container"
    });
    const currentSave = gameStorage.getCurrentSave();
    if (currentSave) {
      btnContainer.append(
        new Button({
          btnText: "Continue",
          ourClass: ["menu__button"],
          onClick: () => appEmitter.emit("game:continue", currentSave)
        })
      );
    }
    btnContainer.appendChildren([
      new Button({
        btnText: "New Game",
        ourClass: ["menu__button"],
        onClick: () => appEmitter.emit("showScreen", "game")
      }),
      modeBtnContainer,
      new Button({
        btnText: "Settings",
        ourClass: ["menu__button"],
        onClick: () => settingsPopup.open()
      }),
      new Button({
        btnText: "Developer",
        ourClass: ["menu__button"],
        onClick: () => window.open("https://github.com/FierceSloth", "_blank")
      })
    ]);
    const githubLink = new Component({
      tag: "a",
      className: "github__link",
      text: "Created by @FierceSloth"
    });
    githubLink.setAttribute("href", "https://github.com/FierceSloth");
    githubLink.setAttribute("target", "_blank");
    document.body.append(githubLink.node);
    this.appendChildren([menuTitle, btnContainer]);
  }
}
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function shuffleArr(arr) {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
class Cell extends Component {
  constructor({ value, index }) {
    super({
      className: "grid--cell",
      text: value
    });
    this.value = value;
    this.isDeleted = false;
    index = index + 1;
    const x = index % 9 === 0 ? 9 : index % 9;
    const y = Math.ceil(index / 9);
    this.xPos = x;
    this.yPos = y;
    this.node.setAttribute("data-pos", `x:${this.xPos} y:${this.yPos}`);
    this.deleteCell = this.deleteCell.bind(this);
    this.handleClick = this.handleClick.bind(this);
    emitter.on("deleteCell", this.deleteCell);
    this.node.addEventListener("click", this.handleClick);
  }
  deleteCell() {
    this.node.textContent = "";
    this.value = null;
    this.isDeleted = true;
    this.addClass("cell--deleted");
  }
  handleClick() {
    emitter.emit("cellClick", this);
  }
  destroyCell() {
    emitter.off("deleteCell", this.deleteCell);
    this.node.removeEventListener("click", this.handleClick);
    super.destroy();
  }
}
const timerData = {
  minutes: 0,
  seconds: 0,
  intervalId: ""
};
class ScoreManager extends Component {
  constructor() {
    super({
      className: "panel__score-wrapper"
    });
    const currentMode = new Component({
      className: ["score-text", "score__current-mode"],
      text: "Classic Mode"
    });
    const currentScore = new Component({
      className: ["score-text", "score__current-score"],
      text: "Score: 0 / 100"
    });
    const currentTime = new Component({
      className: ["score-text", "score__current-time"],
      text: "Time: 00:00"
    });
    if (timerData.intervalId) {
      clearInterval(timerData.intervalId);
      timerData.intervalId = null;
      timerData.minutes = 0;
      timerData.seconds = 0;
    }
    timerData.intervalId = setInterval(() => {
      timerData.seconds += 1;
      if (timerData.seconds >= 60) {
        timerData.seconds = 0;
        timerData.minutes += 1;
      }
      const { minutes, seconds } = timerData;
      this.updateTimeText(minutes, seconds, currentTime.node);
    }, 1e3);
    this.appendChildren([currentMode, currentScore, currentTime]);
    emitter.on("mode:update", (mode) => {
      this.updateModeText(mode, currentMode.node);
    });
    emitter.on("score:change", (score) => {
      this.updateScore(score, currentScore.node);
    });
  }
  updateTimeText(minutes, seconds, text) {
    text.textContent = `Time: ${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  updateScore(score, text) {
    text.textContent = `Score: ${score} / 100`;
  }
  updateModeText(mode, text) {
    const capitalized = mode.charAt(0).toUpperCase() + mode.slice(1);
    text.textContent = `${capitalized} Mode`;
  }
}
class GameOverPopup extends Popup {
  constructor(gameResult, { score, seconds, minutes }) {
    super({
      className: "gameover__popup",
      canClosed: false
    });
    if (score > 100) score = 100;
    const popupTitle = new Component({
      tag: "h2",
      className: "gameover-title"
    });
    switch (gameResult) {
      case "win":
        popupTitle.node.textContent = "You Win!";
        break;
      default:
        popupTitle.node.textContent = "You Lose!";
        break;
    }
    const gameResultTime = new Component({
      className: "popup__result-text",
      text: `Time: ${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    });
    const gameResultScore = new Component({
      className: "popup__result-text",
      text: `Score: ${score}`
    });
    const gameResultContainer = new Component(
      {
        className: "popup__result-container"
      },
      gameResultScore,
      gameResultTime
    );
    const menuBtn = new Button({
      btnText: "Return to Menu",
      ourClass: ["popup-button"],
      onClick: () => {
        document.body.classList.remove("hide");
        appEmitter.emit("showScreen", "menu");
      }
    });
    const gameBtn = new Button({
      btnText: "Play Again",
      ourClass: ["popup-button"],
      onClick: () => {
        document.body.classList.remove("hide");
        appEmitter.emit("showScreen", "game");
      }
    });
    const btnContainer = new Component(
      {
        className: "popup__btn-container"
      },
      menuBtn,
      gameBtn
    );
    this.popup.appendChildren([popupTitle, gameResultContainer, btnContainer]);
  }
}
class Grid extends Component {
  constructor(options = null) {
    super({
      className: "game__grid"
    });
    this.firstCard = null;
    this.secondCard = null;
    this.isUndoUsed = false;
    emitter.on("cellClick", (cell) => {
      this.selectCard(cell);
    });
    emitter.on("tools:undo", () => {
      this.toolsUndo();
    });
    emitter.on("tools:add", () => {
      this.toolsAdd();
    });
    emitter.on("tools:hinits", () => {
      this.toolsHinits();
    });
    emitter.on("tools:shuffle", () => {
      this.toolsShuffle();
    });
    emitter.on("tools:eraser", () => {
      this.toolsEraser();
    });
    if (options) {
      this.mode = options.mode;
      this.tools = structuredClone(options.tools);
      this.history = structuredClone(options.history);
      this.score = options.score;
      timerData.minutes = options.minutes;
      timerData.seconds = options.seconds;
      emitter.emit("score:change", this.score);
      this.cells = [];
      emitter.emit("mode:update", this.mode);
      setTimeout(() => {
        this.calculateAvailableMoves();
        this.updateButtons();
      }, 100);
      return;
    }
    this.mode = gameStorage.getSetting("mode");
    this.cells = [];
    this.score = 0;
    this.tools = {
      add: 10,
      hinits: 5,
      shuffle: 5,
      eraser: 5
    };
    this.history = {
      grid: [],
      tools: [],
      score: [0]
    };
    setTimeout(() => {
      this.calculateAvailableMoves();
    }, 100);
    emitter.emit("mode:update", this.mode);
  }
  //* ============ Basic cards methods =============
  selectCard(cell) {
    if (this.secondCard === cell || cell.isDeleted) {
      return;
    }
    if (this.firstCard === cell) {
      this.firstCard.removeClass("cell--active");
      this.firstCard = null;
      emitter.emit("card:removed", "");
      return;
    }
    if (!this.firstCard) {
      appEmitter.emit("ui:cellSelect", "");
      this.firstCard = cell;
      cell.addClass("cell--active");
      emitter.emit("card:selected", "");
      return;
    }
    if (!this.secondCard) {
      this.secondCard = cell;
      cell.addClass("cell--active");
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
      emitter.emit("score:change", this.score);
      appEmitter.emit("ui:cellsMatch", "");
      first.deleteCell();
      second.deleteCell();
      this.resetActiveCards();
      this.calculateAvailableMoves();
      this.checkGameEnd();
      return true;
    }
    appEmitter.emit("ui:cellsError", "");
    this.triggerAnimation(this.firstCard, "cell--error");
    this.triggerAnimation(this.secondCard, "cell--error");
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
      const winPopup = new GameOverPopup("win", gameState);
      appEmitter.emit("ui:gameWin", "");
      appEmitter.emit("game:end", gameState);
      winPopup.open();
      return true;
    }
    const movesResult = this.calculateAvailableMoves() === 0 && add + shuffle + eraser === 0;
    const limitResult = this.cells.length > 50 * 9;
    if (movesResult || limitResult) {
      const gameState = this.getGameState();
      const losePopup = new GameOverPopup("lose", gameState);
      appEmitter.emit("ui:gameLose", "");
      appEmitter.emit("game:end", gameState);
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
      const cell = new Cell({ value, index: trueIndex });
      if (value === null) {
        cell.addClass("cell--deleted");
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
    emitter.emit("score:change", this.score);
    appEmitter.emit("ui:toolsClick", "");
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
      case "random":
        shuffleArr(toAdd);
        break;
      case "chaotic":
        toAdd = Array.from({ length: toAdd.length }, () => getRandomInt(1, 9));
        break;
    }
    const startIndex = this.cells.length;
    this.createGrid(toAdd, startIndex);
    appEmitter.emit("ui:toolsClick", "");
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
      appEmitter.emit("ui:toolHinits", "");
      hint.first.addClass("cell--hinits");
      hint.second.addClass("cell--hinits");
      this.tools.hinits -= 1;
      this.updateButtons();
      setTimeout(() => {
        hint.first.removeClass("cell--hinits");
        hint.second.removeClass("cell--hinits");
      }, 1e3);
    }
  }
  toolsShuffle() {
    if (this.tools.shuffle < 0) {
      return;
    }
    this.saveGrid();
    this.saveTools();
    appEmitter.emit("ui:toolsClick", "");
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
      appEmitter.emit("ui:toolsClick", "");
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
      "animationend",
      () => {
        el.removeClass(cls);
      },
      { once: true }
    );
  }
  resetActiveCards() {
    if (this.firstCard) this.firstCard.removeClass("cell--active");
    if (this.secondCard) this.secondCard.removeClass("cell--active");
    emitter.emit("card:removed", "");
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
    emitter.emit("button:update", this.tools);
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
      seconds
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
    emitter.emit("hinit:moves", availableMoves);
    return availableMoves;
  }
}
class ToolsManager extends Component {
  constructor() {
    super({
      className: "panel__tools-wrapper"
    });
    const movesBtn = new Button({
      btnText: "Moves",
      removeSound: true
    });
    const undoBtn = new Button({
      btnText: "Revert",
      onClick: () => emitter.emit("tools:undo", ""),
      removeSound: true
    });
    const addBtn = new Button({
      btnText: "Add (10)",
      onClick: () => emitter.emit("tools:add", ""),
      removeSound: true
    });
    const hinitsBtn = new Button({
      btnText: "Hinits (5)",
      onClick: () => emitter.emit("tools:hinits", ""),
      removeSound: true
    });
    const shuffleBtn = new Button({
      btnText: "Shuffle (5)",
      onClick: () => emitter.emit("tools:shuffle", ""),
      removeSound: true
    });
    const eraserBtn = new Button({
      btnText: "Eraser (5)",
      onClick: () => emitter.emit("tools:eraser", ""),
      removeSound: true
    });
    eraserBtn.node.disabled = true;
    emitter.on("card:selected", () => {
      if (!eraserBtn.isEnded) {
        eraserBtn.node.disabled = false;
      }
    });
    emitter.on("card:removed", () => {
      if (!eraserBtn.isEnded) {
        eraserBtn.node.disabled = true;
      }
    });
    emitter.on("hinit:moves", (moves) => {
      let strMoves = String(moves);
      if (moves > 5) {
        strMoves = "5+";
      }
      movesBtn.setAttribute("data-message", strMoves);
    });
    emitter.on("button:update", (tools) => {
      this.updateToolButton(addBtn, "Add", tools.add);
      this.updateToolButton(hinitsBtn, "Hinits", tools.hinits);
      this.updateToolButton(shuffleBtn, "Shuffle", tools.shuffle);
      this.updateToolButton(eraserBtn, "Eraser", tools.eraser);
    });
    this.appendChildren([movesBtn, undoBtn, addBtn, hinitsBtn, shuffleBtn, eraserBtn]);
  }
  updateToolButton(button, tool, count) {
    button.node.textContent = `${tool} (${count})`;
    if (tool === "Eraser") {
      button.isEnded = count === 0;
      return;
    }
    button.node.disabled = count === 0;
  }
}
const CLASSIC_GRID = [1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 1, 1, 2, 1, 3, 1, 4, 1, 5, 1, 6, 1, 7, 1, 8, 1, 9];
const RANDOM_GRID = [1, 2, 3, 4, 5, 6, 7, 8, 9, [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7], [1, 8], [1, 9]];
class GameTemplate extends Component {
  constructor(options = null) {
    super({
      className: "game__template"
    });
    const scoreContainer = new ScoreManager();
    this.append(scoreContainer);
    this.mode = gameStorage.getSetting("mode");
    if (options) {
      this.mode = "saved";
    }
    const grid = new Grid(options);
    this.append(grid);
    switch (this.mode) {
      case "classic": {
        grid.createGrid(CLASSIC_GRID);
        break;
      }
      case "random": {
        const randomGrid = [...RANDOM_GRID];
        shuffleArr(randomGrid);
        grid.createGrid(randomGrid.flat(Infinity));
        break;
      }
      case "chaotic": {
        const chaoticGrid = Array.from({ length: 27 }, () => getRandomInt(1, 9));
        grid.createGrid(chaoticGrid);
        break;
      }
      case "saved": {
        grid.createGrid(options.copyCells);
        break;
      }
      default: {
        grid.createGrid(CLASSIC_GRID);
      }
    }
    const settingsPopup = new SettingsPopup(true);
    const savedGame = gameStorage.getCurrentSave();
    const settingsBtn = new Button({
      btnText: "⚙️",
      ourClass: ["game__control-btn", "settings-btn"],
      onClick: () => settingsPopup.open()
    });
    const resetBtn = new Button({
      btnText: "Reset",
      ourClass: ["game__control-btn"],
      onClick: () => appEmitter.emit("showScreen", "game")
    });
    const saveBtn = new Button({
      btnText: "Save",
      ourClass: ["game__control-btn"],
      onClick: (event) => {
        const node = event.currentTarget;
        node.textContent = "✅";
        setTimeout(() => {
          node.textContent = "Save";
        }, 800);
        appEmitter.emit("game:save", grid.getGameState());
      }
    });
    const gameControls = new Component(
      {
        className: "game__controls"
      },
      settingsBtn,
      resetBtn,
      saveBtn
    );
    if (savedGame) {
      const continueBtn = new Button({
        btnText: "Continue",
        ourClass: ["game__control-btn"],
        onClick: () => appEmitter.emit("game:continue", savedGame)
      });
      gameControls.append(continueBtn);
    }
    const tools = new ToolsManager();
    const optionsPanel = new Component(
      {
        className: "game__options"
      },
      gameControls,
      tools
    );
    this.append(optionsPanel);
  }
}
class Game extends Component {
  constructor(options = null) {
    super({
      className: ["container", "container__game"]
    });
    this.options = options;
  }
  render() {
    const gameTitle = new Component({
      tag: "h1",
      className: "title",
      text: "Pair ’Em Up"
    });
    let gameTemplate = new GameTemplate(this.options);
    this.appendChildren([gameTitle, gameTemplate]);
  }
}
class AudioCls {
  constructor({ src, type = "ui" }) {
    this.src = src;
    this.type = type;
    this.audio = new Audio(src);
    const volume = gameStorage.getSetting(type + "Volume") ?? 50;
    this.audio.volume = volume * 0.01;
    appEmitter.on("settings:" + type + "-volume-change", (v) => {
      this.audio.volume = v * 0.01;
    });
    if (type === "music") {
      this.audio.loop = true;
    }
  }
  play() {
    if (this.type === "ui") {
      this.audio.currentTime = 0;
    }
    this.audio.volume = gameStorage.getSetting(this.type + "Volume") * 0.01;
    this.audio.play().catch((e) => console.error(e));
  }
  stop() {
    this.audio.pause();
    this.audio.currentTime = 0;
  }
  setVolume(v) {
    this.audio.volume = v;
  }
}
class AudioManager {
  constructor() {
    const btnClick = new AudioCls({ src: "./sounds/btn-click.wav", type: "ui" });
    const cellSelect = new AudioCls({ src: "./sounds/cell-click.wav", type: "ui" });
    const cellsError = new AudioCls({ src: "./sounds/cells-error.wav", type: "ui" });
    const cellsMatch = new AudioCls({ src: "./sounds/cells-match.wav", type: "ui" });
    const toolsClick = new AudioCls({ src: "./sounds/tools-click.wav", type: "ui" });
    const toolHinits = new AudioCls({ src: "./sounds/tool-hinits.wav", type: "ui" });
    const gameWin = new AudioCls({ src: "./sounds/game-win.wav", type: "ui" });
    const gameLose = new AudioCls({ src: "./sounds/game-lose.mp3", type: "ui" });
    const music = new AudioCls({ src: "./sounds/music.wav", type: "music" });
    appEmitter.on("music:play", () => {
      music.play();
    });
    appEmitter.on("music:stop", () => {
      music.stop();
    });
    appEmitter.on("ui:btnClick", () => {
      btnClick.play();
    });
    appEmitter.on("ui:cellSelect", () => {
      cellSelect.play();
    });
    appEmitter.on("ui:cellsError", () => {
      cellsError.play();
    });
    appEmitter.on("ui:cellsMatch", () => {
      cellsMatch.play();
    });
    appEmitter.on("ui:toolsClick", () => {
      toolsClick.play();
    });
    appEmitter.on("ui:toolHinits", () => {
      toolHinits.play();
    });
    appEmitter.on("ui:gameWin", () => {
      gameWin.play();
    });
    appEmitter.on("ui:gameLose", () => {
      gameLose.play();
    });
  }
}
class App {
  constructor() {
    this.currentScreen = null;
    const body = document.body;
    new AudioManager();
    const theme = gameStorage.getSetting("theme") ?? "light";
    body.classList.add(theme);
    appEmitter.on("showScreen", (screen) => {
      this.showScreen(screen);
    });
    appEmitter.on("modeSwitch", (mode) => {
      gameStorage.setSetting("mode", mode);
    });
    appEmitter.on("game:save", (data) => {
      gameStorage.updateCurrentSave(data);
    });
    appEmitter.on("game:continue", (options) => {
      this.showScreen("game", options);
    });
    appEmitter.on("settings:ui-volume-change", (value) => {
      gameStorage.setSetting("uiVolume", value);
    });
    appEmitter.on("settings:music-volume-change", (value) => {
      gameStorage.setSetting("musicVolume", value);
    });
    appEmitter.on("settings:theme-change", ({ theme: theme2, themeValues }) => {
      themeValues.forEach((value) => {
        body.classList.remove(value);
      });
      body.classList.add(theme2);
    });
  }
  showScreen(screen, options = null) {
    if (this.currentScreen) {
      document.querySelector(".container").remove();
      document.querySelectorAll(".popup--overlay").forEach((el) => el.remove());
      const github = document.querySelector(".github__link");
      if (github) github.remove();
    }
    if (screen === "menu") {
      emitter.clear();
      appEmitter.emit("music:stop", "");
      const menu = new Menu();
      menu.render();
      document.body.append(menu.node);
    }
    if (screen === "game") {
      emitter.clear();
      appEmitter.emit("music:play", "");
      const game = new Game(options);
      game.render();
      document.body.append(game.node);
    }
    this.currentScreen = screen;
  }
}
new App();
appEmitter.emit("showScreen", "menu");
//# sourceMappingURL=index-sA2ioW83.js.map
