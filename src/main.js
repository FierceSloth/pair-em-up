import './styles/style.scss';

import { appEmitter } from './utils/emmiter';
import App from './App';

new App();
appEmitter.emit('showScreen', 'menu');
