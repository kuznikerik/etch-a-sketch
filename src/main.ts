import styles from "./styles.module.css";

const app = document.getElementById("app")!;
const DEFAULT_GRID_SIZE = 64;
const MIN_GRID_SIZE = 1;
const MAX_GRID_SIZE = 100;
let isMouseDown = false;

initializeUI(app, DEFAULT_GRID_SIZE);

/**
 * Initialize the user interface elements
 * @param app - The main application container
 */
function initializeUI(app: HTMLElement, gridSize: number): void {
  clearUI(app);

  const gridContainer = createGridContainer();
  app.appendChild(gridContainer);
  createGrid(gridSize, gridContainer);
  gridContainer.style.setProperty("--grid-size", gridSize.toString());

  const controls = createControls();
  app.appendChild(controls);
}

/**
 * Create the grid container element
 * @returns The grid container element
 */
function createGridContainer(): HTMLElement {
  const grid = document.createElement("div");
  grid.setAttribute("id", "grid");
  grid.classList.add(styles.gridContainer);
  return grid;
}

/**
 * Create a grid of div elements based on the specified size
 * @param size - The size of the grid (number of items)
 * @param grid - The grid container element
 */
function createGrid(size: number, grid: HTMLElement): void {
  for (let i = 0; i < size * size; i++) {
    const div = document.createElement("div");
    div.setAttribute("data-nid", String(i));
    div.classList.add(styles.gridItem);
    grid.appendChild(div);
  }

  const gridItems = grid.querySelectorAll("div[data-nid]");
  addGridItemEventListeners(gridItems);
}

/**
 * Add Event Listeners to grid items
 * @param gridItems - A NodeList of grid item elements
 */
function addGridItemEventListeners(gridItems: NodeListOf<Element>): void {
  gridItems.forEach((gridItem: Element) => {
    gridItem.addEventListener("mousedown", (e) => {
      const mouseEvent = e as MouseEvent;
      mouseEvent.preventDefault();
      isMouseDown = true;
      gridItem.classList.toggle(styles.gridItemActive);
    });

    document.addEventListener("mouseup", () => {
      isMouseDown = false;
    });

    gridItem.addEventListener("mouseenter", () => {
      if (isMouseDown) {
        gridItem.classList.add(styles.gridItemActive);
      }
    });

    gridItem.addEventListener("mouseleave", () => {
      if (isMouseDown) {
        gridItem.classList.add(styles.gridItemActive);
      }
    });

    gridItem.addEventListener("touchstart", (e) => {
      const touchEvent = e as TouchEvent;
      touchEvent.preventDefault();
      isMouseDown = true;
      gridItem.classList.toggle(styles.gridItemActive);
    });

    gridItem.addEventListener("touchend", () => {
      isMouseDown = false;
    });

    gridItem.addEventListener("touchmove", (e) => {
      const touchEvent = e as TouchEvent;
      touchEvent.preventDefault();
      const touch = touchEvent.touches[0];
      const target = document.elementFromPoint(
        touch.clientX,
        touch.clientY
      ) as HTMLElement;
      if (target && target.hasAttribute("data-nid")) {
        target.classList.add(styles.gridItemActive);
      }
    });
  });
}

/**
 * Create the controls container element
 * @returns The controls container element
 */
function createControls(): HTMLElement {
  const controlsContainer = document.createElement("div");
  controlsContainer.classList.add(styles.controlsContainer);

  const clearButton = createClearButton();
  controlsContainer.appendChild(clearButton);

  const gridSizeChangeButton = createGridSizeChangeButton();
  controlsContainer.appendChild(gridSizeChangeButton);

  return controlsContainer;
}

/**
 * Create a button for clearing the grid
 * @returns a button for clearing the grid
 */
function createClearButton(): HTMLElement {
  const button = document.createElement("button");
  button.classList.add(styles.clearButton);
  button.textContent = "Clear";
  addClearButtonEventListeners(button);
  return button;
}

/**
 * Create a button that prompts a user for a new grid size
 * @returns a button for changing the grid size
 */
function createGridSizeChangeButton(): HTMLElement {
  const button = document.createElement("button");
  button.classList.add(styles.gridSizeButton);
  button.textContent = "Change grid size";
  addGridSizeButtonEventListeners(button);
  return button;
}

/**
 * Add an Event Listener to the clear button
 * @param button - The clear button
 */
function addClearButtonEventListeners(button: HTMLElement): void {
  button.addEventListener("click", clearGrid);
}

/**
 * Add an event listener to the grid size change button
 * @param button - grid size change button
 */
function addGridSizeButtonEventListeners(button: HTMLElement): void {
  button.addEventListener("click", () => {
    const userInput = prompt(
      `How big should the grid be? (${MIN_GRID_SIZE} - ${MAX_GRID_SIZE})`
    );
    const gridSize = Number(userInput);

    if (
      !userInput ||
      !Number.isInteger(gridSize) ||
      gridSize < MIN_GRID_SIZE ||
      gridSize > MAX_GRID_SIZE
    ) {
      alert(
        "Enter a valid grid size! Grid will be reset to it's default size."
      );
      initializeUI(app, DEFAULT_GRID_SIZE);
      return;
    }

    initializeUI(app, gridSize);
  });
}

/**
 * Remove active classes from all grid items in the grid
 */
function clearGrid(): void {
  const grid = document.getElementById("grid");

  if (!grid) return;
  const gridItems = grid.querySelectorAll("div[data-nid]");

  gridItems.forEach((gridItem: Element) => {
    gridItem.classList.remove(styles.gridItemActive);
  });
}

/**
 * Clear the grid and any existing UI elements
 * @param app - The main application container
 */
function clearUI(app: HTMLElement): void {
  const existingGrid = document.getElementById("grid");
  if (existingGrid) app.innerHTML = "";
}
