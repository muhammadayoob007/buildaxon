import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useStore } from '@nanostores/react';
import { IconButton } from '~/components/ui/IconButton';
import { workbenchStore } from '~/lib/stores/workbench';
import { PortDropdown } from './PortDropdown';
import { ScreenshotSelector } from './ScreenshotSelector';
import { expoUrlAtom } from '~/lib/stores/qrCodeStore';
import { ExpoQrModal } from '~/components/workbench/ExpoQrModal';

type ResizeSide = 'left' | 'right' | null;

interface WindowSize {
  name: string;
  width: number;
  height: number;
  icon: string;
  hasFrame?: boolean;
  frameType?: 'mobile' | 'tablet' | 'laptop' | 'desktop';
}

const WINDOW_SIZES: WindowSize[] = [
  { name: 'iPhone SE', width: 375, height: 667, icon: 'i-ph:device-mobile', hasFrame: true, frameType: 'mobile' },
  { name: 'iPhone 12/13', width: 390, height: 844, icon: 'i-ph:device-mobile', hasFrame: true, frameType: 'mobile' },
  {
    name: 'iPhone 12/13 Pro Max',
    width: 428,
    height: 926,
    icon: 'i-ph:device-mobile',
    hasFrame: true,
    frameType: 'mobile',
  },
  { name: 'iPad Mini', width: 768, height: 1024, icon: 'i-ph:device-tablet', hasFrame: true, frameType: 'tablet' },
  { name: 'iPad Air', width: 820, height: 1180, icon: 'i-ph:device-tablet', hasFrame: true, frameType: 'tablet' },
  { name: 'iPad Pro 11"', width: 834, height: 1194, icon: 'i-ph:device-tablet', hasFrame: true, frameType: 'tablet' },
  {
    name: 'iPad Pro 12.9"',
    width: 1024,
    height: 1366,
    icon: 'i-ph:device-tablet',
    hasFrame: true,
    frameType: 'tablet',
  },
  { name: 'Small Laptop', width: 1280, height: 800, icon: 'i-ph:laptop', hasFrame: true, frameType: 'laptop' },
  { name: 'Laptop', width: 1366, height: 768, icon: 'i-ph:laptop', hasFrame: true, frameType: 'laptop' },
  { name: 'Large Laptop', width: 1440, height: 900, icon: 'i-ph:laptop', hasFrame: true, frameType: 'laptop' },
  { name: 'Desktop', width: 1920, height: 1080, icon: 'i-ph:monitor', hasFrame: true, frameType: 'desktop' },
  { name: '4K Display', width: 3840, height: 2160, icon: 'i-ph:monitor', hasFrame: true, frameType: 'desktop' },
];

export const Preview = memo(() => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [isPortDropdownOpen, setIsPortDropdownOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const hasSelectedPreview = useRef(false);
  const previews = useStore(workbenchStore.previews);
  const activePreview = previews[activePreviewIndex];
  const [displayPath, setDisplayPath] = useState('/');
  const [iframeUrl, setIframeUrl] = useState<string | undefined>();
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const [isDeviceModeOn, setIsDeviceModeOn] = useState(false);
  const [viewportSize, setViewportSize] = useState<'desktop' | 'mobile' | 'game'>('desktop');

  const handleViewportChange = (size: 'desktop' | 'mobile' | 'game') => {
    setViewportSize(size);
    if (isDeviceModeOn) {
      setIsDeviceModeOn(false);
    }
  };

  const getIframeStyles = () => {
    switch (viewportSize) {
      case 'mobile':
        return { width: '375px', height: '812px', margin: '0 auto', border: '8px solid #222', borderRadius: '24px' };
      case 'game':
        return { width: '800px', height: '450px', margin: '0 auto', border: '2px solid #444', aspectRatio: '16/9' };
      case 'desktop':
      default:
        return { width: '100%', height: '100%', border: 'none' };
    }
  };

  const [widthPercent, setWidthPercent] = useState<number>(37.5);
  const [currentWidth, setCurrentWidth] = useState<number>(0);

  const resizingState = useRef({
    isResizing: false,
    side: null as ResizeSide,
    startX: 0,
    startWidthPercent: 37.5,
    windowWidth: window.innerWidth,
    pointerId: null as number | null,
  });

  const SCALING_FACTOR = 1;

  const [isWindowSizeDropdownOpen, setIsWindowSizeDropdownOpen] = useState(false);
  const [selectedWindowSize, setSelectedWindowSize] = useState<WindowSize>(WINDOW_SIZES[0]);
  const [isLandscape, setIsLandscape] = useState(false);
  const [showDeviceFrame, setShowDeviceFrame] = useState(true);
  const [showDeviceFrameInPreview, setShowDeviceFrameInPreview] = useState(false);
  const expoUrl = useStore(expoUrlAtom);
  const [isExpoQrModalOpen, setIsExpoQrModalOpen] = useState(false);

  useEffect(() => {
    if (!activePreview) {
      setIframeUrl(undefined);
      setDisplayPath('/');
      return;
    }
    const { baseUrl } = activePreview;
    setIframeUrl(baseUrl);
    setDisplayPath('/');
  }, [activePreview]);

  const findMinPortIndex = useCallback(
    (minIndex: number, preview: { port: number }, index: number, array: { port: number }[]) => {
      return preview.port < array[minIndex].port ? index : minIndex;
    },
    [],
  );

  useEffect(() => {
    if (previews.length > 1 && !hasSelectedPreview.current) {
      const minPortIndex = previews.reduce(findMinPortIndex, 0);
      setActivePreviewIndex(minPortIndex);
    }
  }, [previews, findMinPortIndex]);

  const reloadPreview = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const toggleFullscreen = async () => {
    if (!isFullscreen && containerRef.current) {
      await containerRef.current.requestFullscreen();
    } else if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleDeviceMode = () => {
    setIsDeviceModeOn((prev) => !prev);
    if (!isDeviceModeOn) {
      setViewportSize('desktop');
    }
  };

  const startResizing = (e: React.PointerEvent, side: ResizeSide) => {
    if (!isDeviceModeOn) return;
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'ew-resize';
    resizingState.current = {
      isResizing: true,
      side,
      startX: e.clientX,
      startWidthPercent: widthPercent,
      windowWidth: window.innerWidth,
      pointerId: e.pointerId,
    };
  };

  const ResizeHandle = ({ side }: { side: ResizeSide }) => {
    if (!side) return null;
    return (
      <div
        className={`resize-handle-${side}`}
        onPointerDown={(e) => startResizing(e, side)}
        style={{
          position: 'absolute',
          top: 0,
          ...(side === 'left' ? { left: 0, marginLeft: '-7px' } : { right: 0, marginRight: '-7px' }),
          width: '15px',
          height: '100%',
          cursor: 'ew-resize',
          background: 'var(--bolt-elements-background-depth-4, rgba(0,0,0,.3))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.2s',
          userSelect: 'none',
          touchAction: 'none',
          zIndex: 10,
        }}
        onMouseOver={(e) =>
          (e.currentTarget.style.background = 'var(--bolt-elements-background-depth-4, rgba(0,0,0,.3))')
        }
        onMouseOut={(e) =>
          (e.currentTarget.style.background = 'var(--bolt-elements-background-depth-3, rgba(0,0,0,.15))')
        }
        title="Drag to resize width"
      >
        <GripIcon />
      </div>
    );
  };

  useEffect(() => {
    if (!isDeviceModeOn) return;

    const handlePointerMove = (e: PointerEvent) => {
      const state = resizingState.current;
      if (!state.isResizing || e.pointerId !== state.pointerId) return;

      const dx = e.clientX - state.startX;
      const dxPercent = (dx / state.windowWidth) * 100 * SCALING_FACTOR;
      let newWidthPercent = state.startWidthPercent;

      if (state.side === 'right') {
        newWidthPercent = state.startWidthPercent + dxPercent;
      } else if (state.side === 'left') {
        newWidthPercent = state.startWidthPercent - dxPercent;
      }

      newWidthPercent = Math.max(10, Math.min(newWidthPercent, 90));
      setWidthPercent(newWidthPercent);

      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const newWidth = Math.round((containerWidth * newWidthPercent) / 100);
        setCurrentWidth(newWidth);

        const previewContainer = containerRef.current.querySelector('div[style*="width"]');
        if (previewContainer) {
          (previewContainer as HTMLElement).style.width = `${newWidthPercent}%`;
        }
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      const state = resizingState.current;
      if (!state.isResizing || e.pointerId !== state.pointerId) return;

      const handles = document.querySelectorAll('.resize-handle-left, .resize-handle-right');
      handles.forEach((handle) => {
        if ((handle as HTMLElement).hasPointerCapture?.(e.pointerId)) {
          (handle as HTMLElement).releasePointerCapture(e.pointerId);
        }
      });

      resizingState.current = { ...resizingState.current, isResizing: false, side: null, pointerId: null };
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };

    document.addEventListener('pointermove', handlePointerMove, { passive: false });
    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('pointercancel', handlePointerUp);

    function cleanupResizeListeners() {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointercancel', handlePointerUp);

      if (resizingState.current.pointerId !== null) {
        const handles = document.querySelectorAll('.resize-handle-left, .resize-handle-right');
        handles.forEach((handle) => {
          if ((handle as HTMLElement).hasPointerCapture?.(resizingState.current.pointerId!)) {
            (handle as HTMLElement).releasePointerCapture(resizingState.current.pointerId!);
          }
        });
        resizingState.current = { ...resizingState.current, isResizing: false, side: null, pointerId: null };
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      }
    }
    return cleanupResizeListeners;
  }, [isDeviceModeOn, SCALING_FACTOR]);

  useEffect(() => {
    const handleWindowResize = () => {
      resizingState.current.windowWidth = window.innerWidth;
      if (containerRef.current && isDeviceModeOn) {
        const containerWidth = containerRef.current.clientWidth;
        setCurrentWidth(Math.round((containerWidth * widthPercent) / 100));
      }
    };
    window.addEventListener('resize', handleWindowResize);
    if (containerRef.current && isDeviceModeOn) {
      const containerWidth = containerRef.current.clientWidth;
      setCurrentWidth(Math.round((containerWidth * widthPercent) / 100));
    }
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [isDeviceModeOn, widthPercent]);

  useEffect(() => {
    if (containerRef.current && isDeviceModeOn) {
      const containerWidth = containerRef.current.clientWidth;
      setCurrentWidth(Math.round((containerWidth * widthPercent) / 100));
    }
  }, [isDeviceModeOn]);

  const GripIcon = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', pointerEvents: 'none' }}>
      <div style={{ color: 'var(--bolt-elements-textSecondary, rgba(0,0,0,0.5))', fontSize: '10px', lineHeight: '5px', userSelect: 'none', marginLeft: '1px' }}>
        ••• •••
      </div>
    </div>
  );

  const openInNewWindow = (size: WindowSize) => {
    if (activePreview?.baseUrl) {
      const match = activePreview.baseUrl.match(/^https?:\/\/([^.]+)\.local-credentialless\.webcontainer-api\.io/);
      if (match) {
        const previewId = match[1];
        const previewUrl = `/webcontainer/preview/${previewId}`;
        let width = size.width;
        let height = size.height;

        if (isLandscape && (size.frameType === 'mobile' || size.frameType === 'tablet')) {
          width = size.height;
          height = size.width;
        }

        if (showDeviceFrame && size.hasFrame) {
          const frameWidth = size.frameType === 'mobile' ? (isLandscape ? 120 : 40) : 60;
          const frameHeight = size.frameType === 'mobile' ? (isLandscape ? 80 : 80) : isLandscape ? 60 : 100;
          const newWindow = window.open('', '_blank', `width=${width + frameWidth},height=${height + frameHeight + 40},menubar=no,toolbar=no,location=no,status=no`);

          if (!newWindow) return;

          const frameColor = getFrameColor();
          const frameRadius = size.frameType === 'mobile' ? '36px' : '20px';
          const framePadding = size.frameType === 'mobile' ? (isLandscape ? '40px 60px' : '40px 20px') : (isLandscape ? '30px 50px' : '50px 30px');
          const notchTop = isLandscape ? '50%' : '20px';
          const notchLeft = isLandscape ? '30px' : '50%';
          const notchTransform = isLandscape ? 'translateY(-50%)' : 'translateX(-50%)';
          const notchWidth = isLandscape ? '8px' : size.frameType === 'mobile' ? '60px' : '80px';
          const notchHeight = isLandscape ? (size.frameType === 'mobile' ? '60px' : '80px') : '8px';
          const homeBottom = isLandscape ? '50%' : '15px';
          const homeRight = isLandscape ? '30px' : '50%';
          const homeTransform = isLandscape ? 'translateY(50%)' : 'translateX(50%)';
          const homeWidth = isLandscape ? '4px' : '40px';
          const homeHeight = isLandscape ? '40px' : '4px';

          const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <title>${size.name} Preview</title>
              <style>
                body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background: #f0f0f0; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
                .device-container { position: relative; }
                .device-name { position: absolute; top: -30px; left: 0; right: 0; text-align: center; font-size: 14px; color: #333; }
                .device-frame { position: relative; border-radius: ${frameRadius}; background: ${frameColor}; padding: ${framePadding}; box-shadow: 0 10px 30px rgba(0,0,0,0.2); overflow: hidden; }
                .device-frame:before { content: ''; position: absolute; top: ${notchTop}; left: ${notchLeft}; transform: ${notchTransform}; width: ${notchWidth}; height: ${notchHeight}; background: #333; border-radius: 4px; z-index: 2; }
                .device-frame:after { content: ''; position: absolute; bottom: ${homeBottom}; right: ${homeRight}; transform: ${homeTransform}; width: ${homeWidth}; height: ${homeHeight}; background: #333; border-radius: 50%; z-index: 2; }
                iframe { border: none; width: ${width}px; height: ${height}px; background: white; display: block; }
              </style>
            </head>
            <body>
              <div class="device-container">
                <div class="device-name">${size.name} ${isLandscape ? '(Landscape)' : '(Portrait)'}</div>
                <div class="device-frame">
                  <iframe src="${previewUrl}" sandbox="allow-scripts allow-forms allow-popups allow-modals allow-storage-access-by-user-activation allow-same-origin" allow="cross-origin-isolated"></iframe>
                </div>
              </div>
            </body>
            </html>
          `;
          newWindow.document.open();
          newWindow.document.write(htmlContent);
          newWindow.document.close();
        } else {
          const newWindow = window.open(previewUrl, '_blank', `width=${width},height=${height},menubar=no,toolbar=no,location=no,status=no`);
          if (newWindow) newWindow.focus();
        }
      } else {
        console.warn('[Preview] Invalid WebContainer URL:', activePreview.baseUrl);
      }
    }
  };

  const openInNewTab = () => {
    if (activePreview?.baseUrl) {
      window.open(activePreview?.baseUrl, '_blank');
    }
  };

  const getFramePadding = useCallback(() => {
    if (!selectedWindowSize) return '40px 20px';
    const isMobile = selectedWindowSize.frameType === 'mobile';
    if (isLandscape) return isMobile ? '40px 60px' : '30px 50px';
    return isMobile ? '40px 20px' : '50px 30px';
  }, [isLandscape, selectedWindowSize]);

  const getDeviceScale = useCallback(() => 1, [isLandscape, selectedWindowSize, widthPercent]);

  useEffect(() => {
    return () => {};
  }, [isDeviceModeOn, showDeviceFrameInPreview, getDeviceScale, isLandscape, selectedWindowSize]);

  const getFrameColor = useCallback(() => {
    const isDarkMode = document.documentElement.classList.contains('dark') || document.documentElement.getAttribute('data-theme') === 'dark' || window.matchMedia('(prefers-color-scheme: dark)').matches;
    return isDarkMode ? '#555' : '#111';
  }, []);

  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleColorSchemeChange = () => {
      if (showDeviceFrameInPreview) setShowDeviceFrameInPreview(true);
    };
    darkModeMediaQuery.addEventListener('change', handleColorSchemeChange);
    return () => darkModeMediaQuery.removeEventListener('change', handleColorSchemeChange);
  }, [showDeviceFrameInPreview]);

  return (
    <div ref={containerRef} className={`w-full h-full flex flex-col relative`}>
      {isPortDropdownOpen && <div className="z-iframe-overlay w-full h-full absolute" onClick={() => setIsPortDropdownOpen(false)} />}
      <div className="bg-bolt-elements-background-depth-2 p-2 flex items-center gap-2">
        <div className="flex items-center gap-2">
          <IconButton icon="i-ph:arrow-clockwise" onClick={reloadPreview} />
          <IconButton icon="i-ph:selection" onClick={() => setIsSelectionMode(!isSelectionMode)} className={isSelectionMode ? 'bg-bolt-elements-background-depth-3' : ''} />
        </div>

        <div className="flex-grow flex items-center gap-1 bg-bolt-elements-preview-addressBar-background border border-bolt-elements-borderColor text-bolt-elements-preview-addressBar-text rounded-full px-1 py-1 text-sm hover:bg-bolt-elements-preview-addressBar-backgroundHover hover:focus-within:bg-bolt-elements-preview-addressBar-backgroundActive focus-within:bg-bolt-elements-preview-addressBar-backgroundActive focus-within-border-bolt-elements-borderColorActive focus-within:text-bolt-elements-preview-addressBar-textActive">
          <PortDropdown activePreviewIndex={activePreviewIndex} setActivePreviewIndex={setActivePreviewIndex} isDropdownOpen={isPortDropdownOpen} setHasSelectedPreview={(value) => (hasSelectedPreview.current = value)} setIsDropdownOpen={setIsPortDropdownOpen} previews={previews} />
          <input title="URL Path" ref={inputRef} className="w-full bg-transparent outline-none" type="text" value={displayPath} onChange={(event) => setDisplayPath(event.target.value)} onKeyDown={(event) => {
            if (event.key === 'Enter' && activePreview) {
              let targetPath = displayPath.trim();
              if (!targetPath.startsWith('/')) targetPath = '/' + targetPath;
              setIframeUrl(activePreview.baseUrl + targetPath);
              setDisplayPath(targetPath);
              if (inputRef.current) inputRef.current.blur();
            }
          }} disabled={!activePreview} />
        </div>

        <div className="flex items-center gap-2">
          <IconButton icon="i-ph:devices" onClick={toggleDeviceMode} title={isDeviceModeOn ? 'Switch to Responsive Mode' : 'Switch to Device Mode'} />
          {expoUrl && <IconButton icon="i-ph:qr-code" onClick={() => setIsExpoQrModalOpen(true)} title="Show QR" />}
          <ExpoQrModal open={isExpoQrModalOpen} onClose={() => setIsExpoQrModalOpen(false)} />

          {isDeviceModeOn && (
            <>
              <IconButton icon="i-ph:device-rotate" onClick={() => setIsLandscape(!isLandscape)} title={isLandscape ? 'Switch to Portrait' : 'Switch to Landscape'} />
              <IconButton icon={showDeviceFrameInPreview ? 'i-ph:device-mobile' : 'i-ph:device-mobile-slash'} onClick={() => setShowDeviceFrameInPreview(!showDeviceFrameInPreview)} title={showDeviceFrameInPreview ? 'Hide Device Frame' : 'Show Device Frame'} />
            </>
          )}

          <IconButton icon={isFullscreen ? 'i-ph:arrows-in' : 'i-ph:arrows-out'} onClick={toggleFullscreen} title={isFullscreen ? 'Exit Full Screen' : 'Full Screen'} />

          <div className="flex items-center relative">
            <IconButton icon="i-ph:list" onClick={() => setIsWindowSizeDropdownOpen(!isWindowSizeDropdownOpen)} title="New Window Options" />
            {isWindowSizeDropdownOpen && (
              <>
                <div className="fixed inset-0 z-50" onClick={() => setIsWindowSizeDropdownOpen(false)} />
                <div className="absolute right-0 top-full mt-2 z-50 min-w-[240px] max-h-[400px] overflow-y-auto bg-white dark:bg-black rounded-xl shadow-2xl border border-[#E5E7EB] dark:border-[rgba(255,255,255,0.1)] overflow-hidden">
                  <div className="p-3 border-b border-[#E5E7EB] dark:border-[rgba(255,255,255,0.1)]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[#111827] dark:text-gray-300">Window Options</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button className={`flex w-full justify-between items-center text-start bg-transparent text-xs text-bolt-elements-textTertiary hover:text-bolt-elements-textPrimary`} onClick={() => openInNewTab()}>
                        <span>Open in new tab</span>
                        <div className="i-ph:arrow-square-out h-5 w-4" />
                      </button>
                      <button className={`flex w-full justify-between items-center text-start bg-transparent text-xs text-bolt-elements-textTertiary hover:text-bolt-elements-textPrimary`} onClick={() => {
                        if (!activePreview?.baseUrl) return;
                        const match = activePreview.baseUrl.match(/^https?:\/\/([^.]+)\.local-credentialless\.webcontainer-api\.io/);
                        if (!match) return;
                        window.open(`/webcontainer/preview/${match[1]}`, `preview-${match[1]}`, 'width=1280,height=720,menubar=no,toolbar=no,location=no,status=no,resizable=yes');
                      }}>
                        <span>Open in new window</span>
                        <div className="i-ph:browser h-5 w-4" />
                      </button>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-bolt-elements-textTertiary">Show Device Frame</span>
                        <button className={`w-10 h-5 rounded-full transition-colors duration-200 ${showDeviceFrame ? 'bg-[#6D28D9]' : 'bg-gray-300 dark:bg-gray-700'} relative`} onClick={(e) => { e.stopPropagation(); setShowDeviceFrame(!showDeviceFrame); }}>
                          <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${showDeviceFrame ? 'transform translate-x-5' : ''}`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-bolt-elements-textTertiary">Landscape Mode</span>
                        <button className={`w-10 h-5 rounded-full transition-colors duration-200 ${isLandscape ? 'bg-[#6D28D9]' : 'bg-gray-300 dark:bg-gray-700'} relative`} onClick={(e) => { e.stopPropagation(); setIsLandscape(!isLandscape); }}>
                          <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${isLandscape ? 'transform translate-x-5' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                  {WINDOW_SIZES.map((size) => (
                    <button key={size.name} className="w-full px-4 py-3.5 text-left text-[#111827] dark:text-gray-300 text-sm whitespace-nowrap flex items-center gap-3 group hover:bg-[#F5EEFF] dark:hover:bg-gray-900 bg-white dark:bg-black" onClick={() => { setSelectedWindowSize(size); setIsWindowSizeDropdownOpen(false); openInNewWindow(size); }}>
                      <div className={`${size.icon} w-5 h-5 text-[#6B7280] dark:text-gray-400 group-hover:text-[#6D28D9] dark:group-hover:text-[#6D28D9] transition-colors duration-200`} />
                      <div className="flex-grow flex flex-col">
                        <span className="font-medium group-hover:text-[#6D28D9] dark:group-hover:text-[#6D28D9] transition-colors duration-200">{size.name}</span>
                        <span className="text-xs text-[#6B7280] dark:text-gray-400 group-hover:text-[#6D28D9] dark:group-hover:text-[#6D28D9] transition-colors duration-200">
                          {isLandscape && (size.frameType === 'mobile' || size.frameType === 'tablet') ? `${size.height} × ${size.width}` : `${size.width} × ${size.height}`}
                          {size.hasFrame && showDeviceFrame ? ' (with frame)' : ''}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* REPLIT-STYLE ROW LAYOUT: Sidebar UI on the Right, Preview on the Left */}
      <div className="flex-1 border-t border-bolt-elements-borderColor flex flex-row overflow-hidden">
        
        {/* Iframe Container */}
        <div className="flex-1 w-full flex justify-center items-center overflow-auto bg-bolt-elements-background-depth-1 relative">
          <div style={{ width: isDeviceModeOn ? (showDeviceFrameInPreview ? '100%' : `${widthPercent}%`) : '100%', height: '100%', overflow: 'auto', background: 'var(--bolt-elements-background-depth-1)', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {activePreview ? (
              <>
                {isDeviceModeOn && showDeviceFrameInPreview ? (
                  <div className="device-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', padding: '0', overflow: 'auto', transition: 'all 0.3s ease', position: 'relative' }}>
                    <div className="device-frame-container" style={{ position: 'relative', borderRadius: selectedWindowSize.frameType === 'mobile' ? '36px' : '20px', background: getFrameColor(), padding: getFramePadding(), boxShadow: '0 10px 30px rgba(0,0,0,0.2)', overflow: 'hidden', transform: 'scale(1)', transformOrigin: 'center center', transition: 'all 0.3s ease', margin: '40px', width: isLandscape ? `${selectedWindowSize.height + (selectedWindowSize.frameType === 'mobile' ? 120 : 60)}px` : `${selectedWindowSize.width + (selectedWindowSize.frameType === 'mobile' ? 40 : 60)}px`, height: isLandscape ? `${selectedWindowSize.width + (selectedWindowSize.frameType === 'mobile' ? 80 : 60)}px` : `${selectedWindowSize.height + (selectedWindowSize.frameType === 'mobile' ? 80 : 100)}px` }}>
                      <div style={{ position: 'absolute', top: isLandscape ? '50%' : '20px', left: isLandscape ? '30px' : '50%', transform: isLandscape ? 'translateY(-50%)' : 'translateX(-50%)', width: isLandscape ? '8px' : selectedWindowSize.frameType === 'mobile' ? '60px' : '80px', height: isLandscape ? (selectedWindowSize.frameType === 'mobile' ? '60px' : '80px') : '8px', background: '#333', borderRadius: '4px', zIndex: 2 }} />
                      <div style={{ position: 'absolute', bottom: isLandscape ? '50%' : '15px', right: isLandscape ? '30px' : '50%', transform: isLandscape ? 'translateY(50%)' : 'translateX(50%)', width: isLandscape ? '4px' : '40px', height: isLandscape ? '40px' : '4px', background: '#333', borderRadius: '50%', zIndex: 2 }} />
                      <iframe ref={iframeRef} title="preview" style={{ border: 'none', width: isLandscape ? `${selectedWindowSize.height}px` : `${selectedWindowSize.width}px`, height: isLandscape ? `${selectedWindowSize.width}px` : `${selectedWindowSize.height}px`, background: 'white', display: 'block' }} src={iframeUrl} sandbox="allow-scripts allow-forms allow-popups allow-modals allow-storage-access-by-user-activation allow-same-origin" allow="cross-origin-isolated" />
                    </div>
                  </div>
                ) : (
                  <iframe ref={iframeRef} title="preview" style={getIframeStyles()} className={`transition-all duration-300 bg-white ${viewportSize === 'desktop' ? 'w-full h-full border-none' : ''}`} src={iframeUrl} sandbox="allow-scripts allow-forms allow-popups allow-modals allow-storage-access-by-user-activation allow-same-origin" allow="geolocation; ch-ua-full-version-list; cross-origin-isolated; screen-wake-lock; publickey-credentials-get; shared-storage-select-url; ch-ua-arch; bluetooth; compute-pressure; ch-prefers-reduced-transparency; deferred-fetch; usb; ch-save-data; publickey-credentials-create; shared-storage; deferred-fetch-minimal; run-ad-auction; ch-ua-form-factors; ch-downlink; otp-credentials; payment; ch-ua; ch-ua-model; ch-ect; autoplay; camera; private-state-token-issuance; accelerometer; ch-ua-platform-version; idle-detection; private-aggregation; interest-cohort; ch-viewport-height; local-fonts; ch-ua-platform; midi; ch-ua-full-version; xr-spatial-tracking; clipboard-read; gamepad; display-capture; keyboard-map; join-ad-interest-group; ch-width; ch-prefers-reduced-motion; browsing-topics; encrypted-media; gyroscope; serial; ch-rtt; ch-ua-mobile; window-management; unload; ch-dpr; ch-prefers-color-scheme; ch-ua-wow64; attribution-reporting; fullscreen; identity-credentials-get; private-state-token-redemption; hid; ch-ua-bitness; storage-access; sync-xhr; ch-device-memory; ch-viewport-width; picture-in-picture; magnetometer; clipboard-write; microphone" />
                )}
                <ScreenshotSelector isSelectionMode={isSelectionMode} setIsSelectionMode={setIsSelectionMode} containerRef={iframeRef} />
              </>
            ) : (
              <div className="flex w-full h-full justify-center items-center bg-bolt-elements-background-depth-1 text-bolt-elements-textPrimary">
                No preview available
              </div>
            )}

            {isDeviceModeOn && !showDeviceFrameInPreview && (
              <>
                <div style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', background: 'var(--bolt-elements-background-depth-3, rgba(0,0,0,0.7))', color: 'var(--bolt-elements-textPrimary, white)', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', pointerEvents: 'none', opacity: resizingState.current.isResizing ? 1 : 0, transition: 'opacity 0.3s' }}>
                  {currentWidth}px
                </div>
                <ResizeHandle side="left" />
                <ResizeHandle side="right" />
              </>
            )}
          </div>
        </div>

        {/* New Replit-Style Vertical Sidebar (Only shown when not in complex device mode) */}
        {!isDeviceModeOn && (
          <div className="w-40 flex flex-col items-stretch gap-2 p-3 bg-[#1E1E2E] border-l border-[#313244] text-xs font-semibold shrink-0 shadow-xl z-20">
            <span className="text-[#A6ADC8] mb-2 px-2 uppercase tracking-widest text-[10px]">View Modes</span>
            
            <button 
              onClick={() => handleViewportChange('desktop')} 
              className={`flex items-center gap-3 px-3 py-3 rounded-md transition-all duration-200 ${viewportSize === 'desktop' ? 'bg-[#89B4FA] text-[#11111B] shadow-md' : 'text-[#BAC2DE] hover:bg-[#313244] hover:text-white'}`}
            >
              <div className="i-ph:desktop text-lg" /> Website
            </button>
            
            <button 
              onClick={() => handleViewportChange('mobile')} 
              className={`flex items-center gap-3 px-3 py-3 rounded-md transition-all duration-200 ${viewportSize === 'mobile' ? 'bg-[#89B4FA] text-[#11111B] shadow-md' : 'text-[#BAC2DE] hover:bg-[#313244] hover:text-white'}`}
            >
              <div className="i-ph:device-mobile text-lg" /> Mobile App
            </button>
            
            <button 
              onClick={() => handleViewportChange('game')} 
              className={`flex items-center gap-3 px-3 py-3 rounded-md transition-all duration-200 ${viewportSize === 'game' ? 'bg-[#89B4FA] text-[#11111B] shadow-md' : 'text-[#BAC2DE] hover:bg-[#313244] hover:text-white'}`}
            >
              <div className="i-ph:game-controller text-lg" /> Animation
            </button>
          </div>
        )}

      </div>
    </div>
  );
});