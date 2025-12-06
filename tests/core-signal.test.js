// Comprehensive tests for RxHtmx Framework core features
// Tests the enhanced signal system with computed values and effects

import './setup.js'; // Load global test environment

import { JSDOM } from 'jsdom';

// Set up DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;
global.HTMLElement = dom.window.HTMLElement;
global.CustomEvent = dom.window.CustomEvent;
global.Event = dom.window.Event;

import {
  signal,
  computed,
  effect,
  watch,
  reactive,
  batch,
} from '../src/core/signal.js';

describe('Enhanced Signal System', () => {
  describe('signal()', () => {
    test('should create a reactive signal', () => {
      const count = signal(0);
      expect(count.value).toBe(0);

      count.value = 5;
      expect(count.value).toBe(5);
    });

    test('should notify subscribers when value changes', () => {
      const count = signal(0);
      const callback = jest.fn();

      count.subscribe(callback);
      count.value = 1;

      expect(callback).toHaveBeenCalledWith(1);
    });

    test('should not notify when value does not change', () => {
      const count = signal(0);
      const callback = jest.fn();

      count.subscribe(callback);
      callback.mockClear(); // Clear initial call

      count.value = 0; // Same value
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('computed()', () => {
    test('should create computed signal', () => {
      const count = signal(5);
      const doubled = computed(() => count.value * 2);

      expect(doubled.value).toBe(10);
    });

    test('should update when dependencies change', () => {
      const count = signal(5);
      const doubled = computed(() => count.value * 2);

      count.value = 10;
      expect(doubled.value).toBe(20);
    });

    test('should support multiple dependencies', () => {
      const a = signal(2);
      const b = signal(3);
      const sum = computed(() => a.value + b.value);

      expect(sum.value).toBe(5);

      a.value = 5;
      expect(sum.value).toBe(8);

      b.value = 7;
      expect(sum.value).toBe(12);
    });

    test('should support nested computed values', () => {
      const count = signal(2);
      const doubled = computed(() => count.value * 2);
      const quadrupled = computed(() => doubled.value * 2);

      expect(quadrupled.value).toBe(8);

      count.value = 3;
      expect(quadrupled.value).toBe(12);
    });
  });

  describe('effect()', () => {
    test('should run immediately by default', () => {
      const count = signal(0);
      const callback = jest.fn();

      effect(() => {
        callback(count.value);
      });

      expect(callback).toHaveBeenCalledWith(0);
    });

    test('should re-run when dependencies change', () => {
      const count = signal(0);
      const callback = jest.fn();

      effect(() => {
        callback(count.value);
      });

      count.value = 1;
      expect(callback).toHaveBeenCalledWith(1);
      expect(callback).toHaveBeenCalledTimes(2); // Initial + update
    });

    test('should support multiple dependencies', () => {
      const a = signal(1);
      const b = signal(2);
      const callback = jest.fn();

      effect(() => {
        callback(a.value + b.value);
      });

      expect(callback).toHaveBeenCalledWith(3);

      a.value = 5;
      expect(callback).toHaveBeenCalledWith(7);

      b.value = 10;
      expect(callback).toHaveBeenCalledWith(15);
    });

    test('should support stopping effects', () => {
      const count = signal(0);
      const callback = jest.fn();

      const effectInstance = effect(() => {
        callback(count.value);
      });

      effectInstance.stop();
      callback.mockClear();

      count.value = 1;
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('watch()', () => {
    test('should watch signal changes', () => {
      const count = signal(0);
      const callback = jest.fn();

      watch(count, callback);

      count.value = 1;
      expect(callback).toHaveBeenCalledWith(1, 0);
    });

    test('should support immediate option', () => {
      const count = signal(5);
      const callback = jest.fn();

      watch(count, callback, { immediate: true });

      expect(callback).toHaveBeenCalledWith(5, undefined);
    });
  });

  describe('reactive()', () => {
    test('should make object properties reactive', () => {
      const obj = reactive({ count: 0, name: 'test' });

      expect(obj.count).toBe(0);
      expect(obj.name).toBe('test');

      obj.count = 5;
      expect(obj.count).toBe(5);
    });

    test('should work with effects', () => {
      const obj = reactive({ count: 0 });
      const callback = jest.fn();

      effect(() => {
        callback(obj.count);
      });

      obj.count = 10;
      expect(callback).toHaveBeenCalledWith(10);
    });
  });

  describe('batch()', () => {
    test('should batch multiple updates', () => {
      const a = signal(1);
      const b = signal(2);
      const callback = jest.fn();

      effect(() => {
        callback(a.value + b.value);
      });

      callback.mockClear();

      batch(() => {
        a.value = 10;
        b.value = 20;
      });

      // Should only be called once with final values
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(30);
    });
  });
});
