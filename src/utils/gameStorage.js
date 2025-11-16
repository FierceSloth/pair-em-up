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
        theme: 'dark',
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

  getSettings() {
    return this.data.settings;
  }

  setSettings(key, value) {
    this.data.settings[key] = value;
    this.saveData();
  }

  resetAll() {
    localStorage.removeItem(this.key);
    this.data = this.loadData();
  }
}

export default new GameStorage();
