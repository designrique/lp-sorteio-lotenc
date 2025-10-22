import React, { act } from 'react'
import { test, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import App from '../src/App'

beforeEach(() => {
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    value: (contextId, options) => {
      if (contextId === 'webgl2') {
        return {
          clearColor: vi.fn(),
          clear: vi.fn(),
          viewport: vi.fn(),
          createShader: vi.fn(() => ({ type: contextId })),
          shaderSource: vi.fn(),
          compileShader: vi.fn(),
          getShaderParameter: vi.fn(() => true),
          createProgram: vi.fn(() => ({})),
          attachShader: vi.fn(),
          linkProgram: vi.fn(),
          getProgramParameter: vi.fn(() => true),
          useProgram: vi.fn(),
        };
      }

      return document.createElement('canvas').getContext(contextId, options);
    },
    writable: true,
  });
})

test('The applications renders correctly', async () => {
  const { container } = await act(async () => render(<App />))

  expect(container.childNodes).not.toHaveLength(0)
})
