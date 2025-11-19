class GameStorage {
  constructor(key = 'gameData') {
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
        mode: 'classic',
        audioEnabled: true,
        theme: 'light',
        uiVolume: 50,
        musicVolume: 30,
      },
      currentSave: null,
      lastResult: [],
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
      ...update,
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

export default new GameStorage();
