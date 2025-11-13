import Component from '../../../utils/Component';
import { emitter } from '../../../utils/emmiter';

export const timerData = {
  minutes: 0,
  seconds: 0,
  intervalId: '',
};

export default class ScoreManager extends Component {
  constructor() {
    super({
      className: 'panel__score-wrapper',
    });

    const currentMode = new Component({
      className: ['score-text', 'score__current-mode'],
      text: 'Classic',
    });
    const currentScore = new Component({
      className: ['score-text', 'score__current-score'],
      text: '0',
    });
    const currentTime = new Component({
      className: ['score-text', 'score__current-time'],
      text: '00:00',
    });

    timerData.intervalId = setInterval(() => {
      timerData.seconds += 1;
      if (timerData.seconds >= 60) {
        timerData.seconds = 0;
        timerData.minutes += 1;
      }
      const { minutes, seconds } = timerData;
      this.updateTimeText(minutes, seconds, currentTime.node);
    }, 1000);

    this.appendChildren([currentMode, currentScore, currentTime]);

    emitter.on('score:change', (score) => {
      this.updateScore(score, currentScore.node);
    });
  }

  updateTimeText(minutes, seconds, text) {
    text.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  updateScore(score, text) {
    text.textContent = score;
  }
}
