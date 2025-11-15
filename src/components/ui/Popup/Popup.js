import Component from '../../../utils/Component';

export default class Popup extends Component {
  constructor({ className = 'popup', canClosed = true }) {
    super({
      className: ['popup--overlay'],
    });

    this.canClosed = canClosed;
    this.popupClose = new Component(
      {
        className: ['popup__close', className + '__close'],
      },
      new Component({ tag: 'span' }),
      new Component({ tag: 'span' })
    );
    this.popup = new Component(
      {
        className: ['popup', className],
      },
      this.popupClose
    );

    this.append(this.popup);

    if (canClosed) {
      this.addListener('click', (e) => {
        if (e.target === this.node) this.close();
      });
      this.popupClose.addListener('click', (e) => {
        e.stopPropagation();
        this.close();
      });
    } else {
      this.popupClose.destroy();
    }

    document.body.append(this.node);
  }

  open() {
    this.addClass('popup--open');
    this.popup.addClass('popup--open');
  }

  close() {
    if (!this.canClosed) return;
    this.removeClass('popup--open');
    this.popup.removeClass('popup--open');
  }

  toggle() {
    if (!this.canClosed) return;
    this.toggleClass('popup--open');
    this.popup.toggleClass('popup--open');
  }
}
