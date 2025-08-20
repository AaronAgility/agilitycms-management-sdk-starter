import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'components/index': 'src/components/index.ts',
    'auth/index': 'src/auth/index.ts',
    'models/index': 'src/models/index.ts',
    'adapters/index': 'src/adapters/index.ts',
    'client/index': 'src/client/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [
    'react',
    'react-dom',
    '@agility/management-sdk'
  ],
});
