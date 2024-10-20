import styles from "./Notification.module.css";

type NotificationTypes = "error" | "alert" | "info" | "success";

export default class Notification {
  message: string;
  duration: number;
  element: HTMLElement;
  static container: HTMLElement | null = null;
  type: NotificationTypes;

  constructor(
    message: string,
    duration: number = 30000,
    type: NotificationTypes
  ) {
    this.message = message;
    this.duration = duration;
    this.type = type;
    this.element = this.createElement();
  }

  private static getOrCreateContainer(): HTMLElement {
    if (!Notification.container) {
      const container = document.createElement("div");
      container.classList.add(styles.notificationContainer);
      document.body.appendChild(container);
      Notification.container = container;
    }
    return Notification.container;
  }

  private createElement(): HTMLElement {
    const element = document.createElement("div");
    element.classList.add(
      styles.notification,
      styles[`${this.type}Notification`]
    );
    element.innerText = this.message;
    return element;
  }

  initialize(): void {
    const container = Notification.getOrCreateContainer();
    container.appendChild(this.element);
  }

  show(): void {
    this.initialize();
    setTimeout(() => {
      this.hide();
    }, this.duration);
  }

  hide(): void {
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
