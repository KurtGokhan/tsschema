import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  return {
    resolve: {
      dedupe: ['typescript'],
    },
    build: {
      sourcemap: true,
      lib: {
        entry: 'src/extension.ts',
        formats: ['cjs'],
        fileName: 'extension'
      },
      rollupOptions: {

        external: [
          // Project dependencies
          'vscode', 'typescript',

          // Node.js built-in modules
          'path', 'crypto', 'fs', 'url', 'os', 'http', 'https', 'zlib', 'stream', 'tty', 'util', 'assert', 'events', 'buffer', 'string_decoder', 'punycode', 'querystring', 'assert', 'timers', 'dns', 'net', 'tls', 'dgram', 'child_process', 'cluster', 'readline', 'repl', 'console', 'inspector', 'module', 'perf_hooks', 'worker_threads', 'v8', 'vm', 'async_hooks', 'trace_events',
          /^node:/,
        ],
      }
    }
  };
});
