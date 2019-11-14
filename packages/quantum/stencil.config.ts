import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'stencil-quantum',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader'
    }
  ]
};
