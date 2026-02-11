import { describe, it, expect, beforeEach } from 'vitest';
import { ToolExecutionComponent } from './tool-execution.js';

// Mock the pi-tui components to isolate our component for testing
vi.mock('@mariozechner/pi-tui', () => ({
  Container: class Container {
    _children = [];
    addChild(child) { this._children.push(child); }
    _bgFn = (line) => line;
    setBgFn(fn) { this._bgFn = fn; }
  },
  Box: class Box extends Container {},
  Text: class Text {
    _text = '';
    constructor(text) { this._text = text; }
    setText(text) { this._text = text; }
    getText() { return this._text; }
  },
  Markdown: class Markdown extends Text {},
  Spacer: class Spacer {},
}));

// Mock the theme
vi.mock('../theme/theme.js', () => ({
  theme: {
    toolPendingBg: (line) => line,
    toolErrorBg: (line) => line,
    toolSuccessBg: (line) => line,
    toolTitle: (line) => line,
    bold: (line) => line,
    dim: (line) => line,
    toolOutput: (line) => line,
  },
  markdownTheme: {},
}));

describe('ToolExecutionComponent', () => {
  let component: ToolExecutionComponent;

  beforeEach(() => {
    // Suppress console logs from mocked display resolvers
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  const getOutputText = (comp: ToolExecutionComponent): string => {
    // @ts-ignore - accessing private property for test purposes
    return comp.output.getText();
  };

  it('should display an ellipsis when partial and no result text is available', () => {
    component = new ToolExecutionComponent('test-tool', {});
    component.setPartialResult(undefined);
    expect(getOutputText(component)).toBe('…');
  });

  it('should display nothing when finalized successfully with no result text', () => {
    component = new ToolExecutionComponent('test-tool', {});
    component.setResult(undefined, { isError: false });
    expect(getOutputText(component)).toBe('');
  });

  it('should display a fallback message on error with no output', () => {
    component = new ToolExecutionComponent('test-tool', {});
    
    // This simulates the exact bug condition: a final state that is an error and has no text content.
    component.setResult(undefined, { isError: true });

    const outputText = getOutputText(component);
    
    // With the original code, `outputText` would be '', causing this test to fail.
    // With the fix, `outputText` will be the fallback message.
    expect(outputText).toBe('Tool execution failed with no output.');
  });
});
