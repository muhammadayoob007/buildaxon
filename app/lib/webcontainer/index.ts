import { WebContainer } from '@webcontainer/api';
import { WORK_DIR_NAME } from '~/utils/constants';
import { cleanStackTrace } from '~/utils/stacktrace';

interface WebContainerContext {
  loaded: boolean;
}

export const webcontainerContext: WebContainerContext = import.meta.hot?.data.webcontainerContext ?? {
  loaded: false,
};

if (import.meta.hot) {
  import.meta.hot.data.webcontainerContext = webcontainerContext;
}

export let webcontainer: Promise<WebContainer> = new Promise(() => {
  // noop for ssr
});

if (!import.meta.env.SSR) {
  webcontainer =
    import.meta.hot?.data.webcontainer ??
    Promise.resolve()
      .then(() => {
        return WebContainer.boot({
          coep: 'credentialless',
          workdirName: WORK_DIR_NAME,
          forwardPreviewErrors: true, // Enable error forwarding from iframes
        });
      })
      .then(async (webcontainer) => {
        webcontainerContext.loaded = true;

        const { workbenchStore } = await import('~/lib/stores/workbench');

        // Listen for preview errors
        webcontainer.on('preview-message', (message) => {
          console.log('WebContainer preview message:', message);

          // Handle both uncaught exceptions and unhandled promise rejections
          if (message.type === 'PREVIEW_UNCAUGHT_EXCEPTION' || message.type === 'PREVIEW_UNHANDLED_REJECTION') {
            const isPromise = message.type === 'PREVIEW_UNHANDLED_REJECTION';
            const title = isPromise ? 'Unhandled Promise Rejection' : 'Uncaught Exception';
            workbenchStore.actionAlert.set({
              type: 'preview',
              title,
              description: 'message' in message ? message.message : 'Unknown error',
              content: `Error occurred at ${message.pathname}${message.search}${message.hash}\nPort: ${message.port}\n\nStack trace:\n${cleanStackTrace(message.stack || '')}`,
              source: 'preview',
            });
          }
        });

        // --- SILENT BACKGROUND INSTALLER & AUTO-BOOT ---
        try {
          // Watch the root directory to catch when package.json is created or updated
          webcontainer.fs.watch('/', (event, filename) => {
            if (filename === 'package.json') {
              console.log('Fast-installing dependencies...');
              // Skip audits and heavy scripts for maximum speed
              webcontainer.spawn('npm', ['install', '--no-audit', '--no-fund', '--ignore-scripts']).then(async (installProcess) => {
                // Pipe the output to the browser console instead of the UI terminal
                installProcess.output.pipeTo(
                  new WritableStream({
                    write(data) {
                      console.log('[Fast Install]:', data);
                    },
                  })
                );

                const exitCode = await installProcess.exit;

                // Immediately boot the dev server the exact millisecond install finishes
                if (exitCode === 0) {
                  console.log('Install complete. Auto-booting dev server...');
                  const devProcess = await webcontainer.spawn('npm', ['run', 'dev']);
                  devProcess.output.pipeTo(
                    new WritableStream({
                      write(data) {
                        console.log('[Auto-Dev]:', data);
                      },
                    })
                  );
                }
              }).catch((err) => {
                console.error('Fast install failed:', err);
              });
            }
          });
        } catch (e) {
          console.error('Failed to initialize file watcher:', e);
        }
        // -----------------------------------------------

        return webcontainer;
      });

  if (import.meta.hot) {
    import.meta.hot.data.webcontainer = webcontainer;
  }
}