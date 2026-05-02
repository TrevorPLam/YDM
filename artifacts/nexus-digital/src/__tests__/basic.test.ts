/**
 * Basic test to verify Vitest setup is working
 */

describe('Basic test setup', () => {
  it('should pass a simple test', () => {
    expect(true).toBe(true);
  });

  it('should have access to jsdom environment', () => {
    expect(document.createElement).toBeDefined();
    expect(window).toBeDefined();
  });

  it('should have jest-dom matchers available', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    expect(div).toBeInTheDocument();
    document.body.removeChild(div);
  });
});
