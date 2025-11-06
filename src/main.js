import './styles/style.scss';

import { emitter } from './utils/emmiter';
import App from './App';

new App();
emitter.emit('showScreen', 'menu');
