/**
 * Performance Monitoring Tests
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import {
  perf,
  measureRender,
  measureEffect,
  FPSMonitor,
} from '../src/utils/performance.js';

describe('Performance Monitor', () => {
  beforeEach(() => {
    perf.clear();
    perf.enable();
  });

  test('should start and end measurements', () => {
    perf.start('test-operation');

    expect(perf.metrics.has('test-operation')).toBe(true);

    const result = perf.end('test-operation');

    expect(result).toBeTruthy();
    expect(result.label).toBe('test-operation');
    expect(parseFloat(result.duration)).toBeGreaterThanOrEqual(0);
    expect(perf.metrics.has('test-operation')).toBe(false);
  });

  test('should add marks to measurements', () => {
    perf.start('marked-operation');

    perf.mark('marked-operation', 'checkpoint1');
    perf.mark('marked-operation', 'checkpoint2');

    const result = perf.end('marked-operation');

    expect(result.marks.length).toBe(2);
    expect(result.marks[0].label).toBe('checkpoint1');
    expect(result.marks[1].label).toBe('checkpoint2');
  });

  test('should measure synchronous functions', () => {
    let executed = false;

    const result = perf.measure('sync-test', () => {
      executed = true;
      return 42;
    });

    expect(executed).toBe(true);
    expect(result).toBe(42);
  });

  test('should measure async functions', async () => {
    let executed = false;

    const result = await perf.measureAsync('async-test', async () => {
      executed = true;
      return Promise.resolve(42);
    });

    expect(executed).toBe(true);
    expect(result).toBe(42);
  });

  test('should handle errors in measured functions', () => {
    expect(() => {
      perf.measure('error-test', () => {
        throw new Error('Test error');
      });
    }).toThrow('Test error');
  });

  test('should handle errors in async measured functions', async () => {
    let error;

    try {
      await perf.measureAsync('async-error-test', async () => {
        throw new Error('Async test error');
      });
    } catch (e) {
      error = e;
    }

    expect(error).toBeTruthy();
    expect(error.message).toBe('Async test error');
  });

  test('should return null for non-existent measurements', () => {
    const result = perf.end('non-existent');
    expect(result).toBeNull();
  });

  test('should get all active metrics', () => {
    perf.start('metric1');
    perf.start('metric2');

    const metrics = perf.getMetrics();

    expect(metrics.length).toBe(2);
    expect(metrics.some(m => m.label === 'metric1')).toBe(true);
    expect(metrics.some(m => m.label === 'metric2')).toBe(true);
  });

  test('should clear all measurements', () => {
    perf.start('test1');
    perf.start('test2');

    expect(perf.metrics.size).toBe(2);

    perf.clear();

    expect(perf.metrics.size).toBe(0);
  });

  test('should enable and disable monitoring', () => {
    perf.disable();
    expect(perf.enabled).toBe(false);

    perf.start('disabled-test');
    expect(perf.metrics.has('disabled-test')).toBe(false);

    perf.enable();
    expect(perf.enabled).toBe(true);

    perf.start('enabled-test');
    expect(perf.metrics.has('enabled-test')).toBe(true);
  });

  test('should not measure when disabled', () => {
    perf.disable();

    const result = perf.measure('disabled-measure', () => {
      return 42;
    });

    // Should still execute and return, just not measure
    expect(result).toBe(42);
  });
});

describe('measureRender decorator', () => {
  test('should wrap render function', () => {
    const renderFn = function () {
      return 'rendered';
    };

    const wrapped = measureRender(renderFn);
    const result = wrapped();

    expect(result).toBe('rendered');
  });

  test('should preserve context', () => {
    const obj = {
      name: 'TestComponent',
      render: function () {
        return this.name;
      },
    };

    obj.render = measureRender(obj.render);
    const result = obj.render();

    expect(result).toBe('TestComponent');
  });
});

describe('measureEffect decorator', () => {
  test('should wrap effect function', () => {
    const effectFn = function () {
      return 'effect-run';
    };

    const wrapped = measureEffect(effectFn, 'testEffect');
    const result = wrapped();

    expect(result).toBe('effect-run');
  });
});

describe('FPSMonitor', () => {
  test('should start and stop monitoring', () => {
    const monitor = new FPSMonitor();

    expect(monitor.enabled).toBe(false);

    monitor.start();
    expect(monitor.enabled).toBe(true);

    monitor.stop();
    expect(monitor.enabled).toBe(false);
  });

  test('should return 0 FPS initially', () => {
    const monitor = new FPSMonitor();

    expect(monitor.getFPS()).toBe(0);
  });

  test('should track frames', done => {
    const monitor = new FPSMonitor();
    monitor.start();

    setTimeout(() => {
      const fps = monitor.getFPS();
      expect(fps).toBeGreaterThan(0);
      monitor.stop();
      done();
    }, 100);
  });

  test('should limit frame history to 60 frames', () => {
    const monitor = new FPSMonitor();

    for (let i = 0; i < 100; i++) {
      monitor.frames.push(60);
    }

    expect(monitor.frames.length).toBeLessThanOrEqual(60);
  });
});
