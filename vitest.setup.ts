import React from 'react';
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

globalThis.React = React;

afterEach(() => {
  cleanup();
});
