// @ts-check
import { removeArrayItem } from '.';

/**
 * @callback OnEvent
 * @param {string} eventName
 * @param {Function} listener
 */

/**
 * @callback OffEvent
 * @param {string} eventName
 * @param {Function} listener
 */

/**
 * @callback FireEvent
 * @param {string} eventName
 * @param {any} [data]
 */

/**
 * @typedef {object} EventSystem
 * @property {object} events
 * @property {OnEvent} [on]
 * @property {OffEvent} [off]
 * @property {FireEvent} [fire]
 */

const checkEvent = (eventSystem, event) => {
  if (!eventSystem[event]) {
    eventSystem[event] = [];
  }
};

/**
 * @returns {EventSystem}
 */
export const createEventSystem = () => ({
  events: {},
});

/**
 *
 * @param {EventSystem} eventSystem
 * @returns {OnEvent}
 */
export const onFactory = (eventSystem) => (eventName, listener) => {
  const { events } = eventSystem;
  checkEvent(events, eventName);
  const listeners = events[eventName];
  if (!listeners.includes(listener)) {
    listeners.push(listener);
  }
};

/**
 *
 * @param {EventSystem} eventSystem
 * @returns {OffEvent}
 */
export const offFactory = (eventSystem) => (eventName, listener) => {
  const { events } = eventSystem;
  checkEvent(events, eventName);

  events[eventName] = removeArrayItem(events[eventName], listener);
};

/**
 *
 * @param {EventSystem} eventSystem
 * @returns {FireEvent}
 */
export const fireFactory = (eventSystem) => (eventName, data) => {
  const { events } = eventSystem;
  checkEvent(events, eventName);
  events[eventName].forEach((listener) => listener(data));
};
