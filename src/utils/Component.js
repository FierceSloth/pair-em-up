export default class Component {
  #node = null;

  constructor({ tag = 'div', className = '', text = '' }, ...children) {
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
        node.append(child);
      });
    }
  }

  setText(text) {
    this.#node.textContent = text;
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
