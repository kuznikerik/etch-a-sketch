import styles from "./styles.module.css";
import { compress, decompress } from "./zlib";

const app = document.getElementById("app")!;
const DEFAULT_GRID_SIZE = 64;
const MIN_GRID_SIZE = 1;
const MAX_GRID_SIZE = 100;
let isMouseDown = false;
let isActiveColorRandom = false;
const DEFAULT_COLOR = "darkslategrey";
const COLORS: string[] = [
  "#232136",
  "#393552",
  "#3E8FB0",
  "#6E6A86",
  "#3E8FB0",
  "#EA9A97",
  "#9CCFD8",
  "#C4A7E7",
  "#EB6F92",
  "#E0DEF4",
  "#F6C177",
  "#E0DEF4",
  "#EA9A97",
  "#E0DEF4",
  "#9CCFD8",
  "#C4A7E7",
  "#EB6F92",
  "#232136",
  "#E0DEF4",
  "#F6C177",
];

if (!checkValidURLParams()) {
  initializeUI(app, DEFAULT_GRID_SIZE);
} else {
  initializeUI(app, DEFAULT_GRID_SIZE);
  const gridSize = getGridSizeURLParam();
  const activeGridItems = getGridURLParam();
  const arrayActiveGridItems = URLParamStringToArray(activeGridItems);
  initializeUI(app, gridSize, arrayActiveGridItems);
}

/**
 * Initialize the user interface elements
 * @param app - The main application container
 */
function initializeUI(
  app: HTMLElement,
  gridSize: number,
  activeGridItems?: string[]
): void {
  clearUI(app);

  const gridContainer = createGridContainer();
  app.appendChild(gridContainer);
  createGrid(gridSize, gridContainer);
  gridContainer.style.setProperty("--grid-size", gridSize.toString());

  const controls = createControls();
  app.appendChild(controls);

  if (activeGridItems) {
    paintGrid(activeGridItems);
  }
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
      handleActiveState(gridItem);
    });

    gridItem.addEventListener("mouseleave", () => {
      handleActiveState(gridItem);
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

  const saveButton = createSaveButton();
  controlsContainer.appendChild(saveButton);

  const colorButton = createColorButton();
  controlsContainer.appendChild(colorButton);

  return controlsContainer;
}

/**
 * Create a button for clearing the grid
 * @returns a button for clearing the grid
 */
function createClearButton(): HTMLElement {
  const button = document.createElement("button");
  button.classList.add(styles.button);
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
  button.classList.add(styles.button);
  button.textContent = "Change grid size";
  addGridSizeButtonEventListeners(button);
  return button;
}

/**
 * Create a save button
 * @returns a save button
 */
function createSaveButton(): HTMLElement {
  const button = document.createElement("button");
  button.classList.add(styles.button);
  button.textContent = "Share";
  addSaveButtonEventListeners(button);
  return button;
}

/**
 * Create a color button
 * @returns a color button
 */
function createColorButton(): HTMLElement {
  const button = document.createElement("button");
  button.classList.add(styles.button);
  button.textContent = "Color";
  addColorButtonEventListeners(button);
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
 * Add an Event Listener to the save button
 * @param button - The save button
 */
function addSaveButtonEventListeners(button: HTMLElement): void {
  button.addEventListener("click", () => {
    const gridSize = getGridSize();
    const activeGridItems = getActiveGridItems();
    if (!gridSize || !activeGridItems) return;
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set("s", String(gridSize));
    currentUrl.searchParams.set("grid", activeGridItems);
    navigator.clipboard.writeText(currentUrl.toString());
    window.history.replaceState({}, "", currentUrl.toString());
  });
}

/**
 * Add an Event Listener to the color button
 * @param button - The save button
 */
function addColorButtonEventListeners(button: HTMLElement): void {
  button.addEventListener("click", () => {
    isActiveColorRandom = !isActiveColorRandom;
    button.classList.toggle(styles.buttonActive);
  });
}

/**
 * Gets the grid size
 * @param number - Returns the grid size
 */
function getGridSize(): number {
  const grid = document.getElementById("grid");
  if (!grid) return 0;
  const numOfGridItems = grid.childElementCount;
  return Math.sqrt(numOfGridItems);
}

/**
 * Gets the active grid items
 * @returns {string} - Returns a URL-encoded string of active grid item IDs, or an empty string if no grid items
 */
function getActiveGridItems(): string {
  const grid = document.getElementById("grid");
  if (!grid) return "";

  const activeGridItems: number[] = [];

  for (const child of grid.children) {
    if (child.classList.length > 1) {
      const dataNid = child.getAttribute("data-nid");
      if (dataNid) {
        activeGridItems.push(Number(dataNid));
      }
    }
  }

  if (activeGridItems.length === 0) return ""; // Return an empty string if no active items

  // Convert array to comma-separated string and encode it for use as a URL parameter
  const paramString = activeGridItems.join(",");
  const compressed = compress(paramString);
  return encodeURIComponent(compressed);
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

  removeAllURLParams();
}

/**
 * Clear the grid and any existing UI elements
 * @param app - The main application container
 */
function clearUI(app: HTMLElement): void {
  const existingGrid = document.getElementById("grid");
  if (existingGrid) app.innerHTML = "";
}

/**
 * Loop through the grid and add active classes
 * @param app - The main application container
 */
function paintGrid(activeGridItems: string[]): void {
  if (activeGridItems.length === 0) return;

  const grid = document.getElementById("grid");
  if (!grid) return;

  const gridItems = grid.querySelectorAll("div[data-nid]");
  for (const gridItem of gridItems) {
    const dataNid = gridItem.getAttribute("data-nid");

    if (dataNid && activeGridItems.includes(dataNid)) {
      gridItem.classList.add(styles.gridItemActive);
    }
  }
}

/**
 * Check if the URL has valid URL Search Params
 * @returns boolean - if the URL has valid URL Search Params
 */
function checkValidURLParams(): boolean {
  const params = new URL(window.location.href).searchParams;
  const size = params.get("s");
  const grid = params.get("grid");
  return Boolean(size && grid);
}

/**
 * Get the 's' (size) URL parameter
 * @returns {number} - The grid size as a number, or 0 if not found
 */
function getGridSizeURLParam(): number {
  const params = new URL(window.location.href).searchParams;
  return Number(params.get("s")) || 0;
}

/**
 * Get the 'grid' URL parameter
 * @returns {string} - The grid size as a string, or an empty string if not found
 */
function getGridURLParam(): string {
  const params = new URL(window.location.href).searchParams;
  const decompressed = decompress(params.get("grid") || "");
  return decompressed;
}

/**
 * Transform string from URL Param to Array
 * @returns array of numbers
 */
function URLParamStringToArray(string: string): string[] {
  const decodedString = decodeURIComponent(string);
  const gridArray = decodedString.split(",").filter((item) => item !== "");
  return gridArray;
}

/**
 * Remove all URL parameters from the current URL
 */
function removeAllURLParams(): void {
  const currentUrl = new URL(window.location.href);
  currentUrl.search = "";
  window.history.replaceState({}, "", currentUrl.toString());
}

function handleActiveState(gridItem: Element): void {
  if (!isMouseDown) return;
  gridItem.classList.add(styles.gridItemActive);

  const item = gridItem as HTMLElement;
  if (isActiveColorRandom) {
    item.style.setProperty("--active-color", getRandomColor(COLORS));
  } else {
    item.style.setProperty("--active-color", DEFAULT_COLOR);
  }
}

function getRandomColor(colors: string[]): string {
  return colors[Math.floor(Math.random() * colors.length)];
}
