/**
 * Lumina PhotoStudio Pro - Core Application Engine
 * Architecture:
 * - Multi-Layer Canvas Compositor
 * - PostScript (.ps / .eps) Vector Parser & Renderer Engine
 * - Integrated PDF Engine (PDF.js rendering & page extraction)
 * - Multi-Format Document Converter (PS, PDF, PNG, JPG, WEBP, SVG)
 * - Mobile Touch & Pinch-to-Zoom Engine
 * - PWA (Progressive Web App) Service Worker & Offline Manager
 * - History & State Snapshot Manager
 */

(function () {
  'use strict';

  // Configure PDF.js worker
  if (window.pdfjsLib) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

  // Register PWA Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch((err) => {
        console.warn('SW registration skipped:', err);
      });
    });
  }

  /* --------------------------------------------------------------------------
     Global State
     -------------------------------------------------------------------------- */
  const state = {
    width: 1280,
    height: 720,
    zoom: 1.0,
    activeTool: 'brush', // 'move', 'select', 'brush', 'pencil', 'eraser', 'bucket', 'text', 'shape', 'eyedropper', 'hand', 'zoom'
    fgColor: '#000000',
    bgColor: '#ffffff',
    brushSize: 15,
    brushHardness: 80,
    brushOpacity: 1.0,
    shapeType: 'rect',
    shapeStrokeWidth: 3,
    shapeFill: true,
    textFont: 'Arial, sans-serif',
    textSize: 36,
    textBold: false,
    textItalic: false,
    layers: [],
    activeLayerIndex: -1,
    history: [],
    historyIndex: -1,
    maxHistory: 20,
    selection: null,
    isDrawing: false,
    lastMouse: { x: 0, y: 0 },
    pdfDoc: null,
    pdfCurrentPage: 1,
    pdfTotalPages: 0,
    psRenderResult: null,
    deferredPrompt: null
  };

  /* --------------------------------------------------------------------------
     DOM References
     -------------------------------------------------------------------------- */
  const dom = {
    mainCanvas: document.getElementById('main-canvas'),
    checkerCanvas: document.getElementById('checkerboard-canvas'),
    overlayCanvas: document.getElementById('overlay-canvas'),
    workspace: document.getElementById('canvas-workspace'),
    scrollWrapper: document.getElementById('canvas-scroll-wrapper'),
    layersList: document.getElementById('layers-list-container'),
    historyList: document.getElementById('history-steps-list'),
    
    // Status bar
    statZoom: document.getElementById('stat-zoom'),
    statDims: document.getElementById('stat-dims'),
    statCoords: document.getElementById('stat-coords'),
    statInfo: document.getElementById('stat-info'),
    
    // Inputs & Options
    currentToolBadge: document.getElementById('current-tool-badge'),
    brushSize: document.getElementById('brush-size'),
    brushSizeVal: document.getElementById('brush-size-val'),
    brushHardness: document.getElementById('brush-hardness'),
    brushHardnessVal: document.getElementById('brush-hardness-val'),
    brushOpacity: document.getElementById('brush-opacity'),
    brushOpacityVal: document.getElementById('brush-opacity-val'),
    shapeType: document.getElementById('shape-type'),
    shapeStrokeWidth: document.getElementById('shape-stroke-width'),
    shapeFillCheck: document.getElementById('shape-fill-check'),
    textFont: document.getElementById('text-font'),
    textSize: document.getElementById('text-size'),
    fgColor: document.getElementById('fg-color'),
    bgColor: document.getElementById('bg-color'),
    layerOpacity: document.getElementById('layer-opacity'),
    layerOpacityVal: document.getElementById('layer-opacity-val'),
    layerBlendMode: document.getElementById('layer-blend-mode'),

    // Modals
    modalNewDoc: document.getElementById('modal-new-doc'),
    modalResize: document.getElementById('modal-resize'),
    modalPwaGuide: document.getElementById('modal-pwa-guide'),
    generalFileInput: document.getElementById('general-file-input'),

    // PostScript Elements
    psFileInput: document.getElementById('ps-file-input'),
    psLoadedFilename: document.getElementById('ps-loaded-filename'),
    psActionControls: document.getElementById('ps-action-controls'),
    psDetailsBadge: document.getElementById('ps-details-badge'),

    // PDF Elements
    pdfFileInput: document.getElementById('pdf-file-input'),
    pdfLoadedFilename: document.getElementById('pdf-loaded-filename'),
    pdfNavWrapper: document.getElementById('pdf-navigator-wrapper'),
    pdfPageIndicator: document.getElementById('pdf-page-indicator'),
    pdfThumbnailCanvas: document.getElementById('pdf-thumbnail-canvas'),
    pdfRenderScale: document.getElementById('pdf-render-scale'),

    // Converter Elements
    convFileInput: document.getElementById('converter-file-input'),
    convTargetFormat: document.getElementById('conv-target-format'),
    convQuality: document.getElementById('conv-quality'),
    convQualityVal: document.getElementById('conv-quality-val'),
    convFileDetails: document.getElementById('conv-file-details'),
    convStatusMsg: document.getElementById('conv-status-message'),
    btnStartConvert: document.getElementById('btn-start-convert'),
    btnConvertCurrentCanvas: document.getElementById('btn-convert-current-canvas'),

    // Mobile / PWA
    rightDock: document.getElementById('right-dock'),
    btnToggleDock: document.getElementById('btn-toggle-dock'),
    btnInstallPwa: document.getElementById('btn-install-pwa'),
    toastContainer: document.getElementById('toast-container')
  };

  const mainCtx = dom.mainCanvas.getContext('2d');
  const checkerCtx = dom.checkerCanvas.getContext('2d');
  const overlayCtx = dom.overlayCanvas.getContext('2d');

  /* --------------------------------------------------------------------------
     Toast Notification Helper
     -------------------------------------------------------------------------- */
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    dom.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s, transform 0.3s';
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(60px)';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  /* --------------------------------------------------------------------------
     Layer Structure
     -------------------------------------------------------------------------- */
  class Layer {
    constructor(name, width, height, fillStyle = null) {
      this.id = 'layer_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
      this.name = name;
      this.width = width;
      this.height = height;
      this.x = 0;
      this.y = 0;
      this.visible = true;
      this.opacity = 1.0;
      this.blendMode = 'source-over';

      this.canvas = document.createElement('canvas');
      this.canvas.width = width;
      this.canvas.height = height;
      this.ctx = this.canvas.getContext('2d');

      if (fillStyle) {
        this.ctx.fillStyle = fillStyle;
        this.ctx.fillRect(0, 0, width, height);
      }
    }

    clone() {
      const copy = new Layer(this.name + ' (Copy)', this.width, this.height);
      copy.x = this.x;
      copy.y = this.y;
      copy.visible = this.visible;
      copy.opacity = this.opacity;
      copy.blendMode = this.blendMode;
      copy.ctx.drawImage(this.canvas, 0, 0);
      return copy;
    }
  }

  function getActiveLayer() {
    if (state.activeLayerIndex >= 0 && state.activeLayerIndex < state.layers.length) {
      return state.layers[state.activeLayerIndex];
    }
    return null;
  }

  /* --------------------------------------------------------------------------
     Canvas Setup & Rendering
     -------------------------------------------------------------------------- */
  function resizeDocument(newWidth, newHeight, scaleLayers = false) {
    state.width = newWidth;
    state.height = newHeight;

    [dom.mainCanvas, dom.checkerCanvas, dom.overlayCanvas].forEach(c => {
      c.width = newWidth;
      c.height = newHeight;
    });

    dom.workspace.style.width = newWidth + 'px';
    dom.workspace.style.height = newHeight + 'px';

    if (scaleLayers) {
      state.layers.forEach(layer => {
        const temp = document.createElement('canvas');
        temp.width = layer.canvas.width;
        temp.height = layer.canvas.height;
        temp.getContext('2d').drawImage(layer.canvas, 0, 0);

        layer.canvas.width = newWidth;
        layer.canvas.height = newHeight;
        layer.width = newWidth;
        layer.height = newHeight;
        layer.ctx.drawImage(temp, 0, 0, newWidth, newHeight);
      });
    }

    drawCheckerboard();
    updateZoom(state.zoom);
    renderAll();
    updateStatusDimensions();
    saveHistory(`Tukar Saiz Kanvas (${newWidth}×${newHeight})`);
  }

  function drawCheckerboard() {
    const w = state.width;
    const h = state.height;
    const size = 16;
    checkerCtx.clearRect(0, 0, w, h);
    for (let y = 0; y < h; y += size) {
      for (let x = 0; x < w; x += size) {
        checkerCtx.fillStyle = ((x / size + y / size) % 2 === 0) ? '#2a2a2a' : '#1e1e1e';
        checkerCtx.fillRect(x, y, size, size);
      }
    }
  }

  function renderAll() {
    mainCtx.clearRect(0, 0, state.width, state.height);

    for (let i = 0; i < state.layers.length; i++) {
      const layer = state.layers[i];
      if (!layer.visible) continue;

      mainCtx.save();
      mainCtx.globalAlpha = layer.opacity;
      mainCtx.globalCompositeOperation = layer.blendMode || 'source-over';
      mainCtx.drawImage(layer.canvas, layer.x, layer.y);
      mainCtx.restore();
    }

    renderLayersUI();
  }

  function updateZoom(newZoom) {
    state.zoom = Math.max(0.1, Math.min(newZoom, 5.0));
    dom.workspace.style.transform = `scale(${state.zoom})`;
    dom.statZoom.textContent = `${Math.round(state.zoom * 100)}%`;
  }

  function updateStatusDimensions() {
    dom.statDims.textContent = `${state.width} × ${state.height} px`;
  }

  /* --------------------------------------------------------------------------
     Layers Panel UI
     -------------------------------------------------------------------------- */
  function renderLayersUI() {
    dom.layersList.innerHTML = '';

    for (let i = state.layers.length - 1; i >= 0; i--) {
      const layer = state.layers[i];
      const isSelected = (i === state.activeLayerIndex);

      const row = document.createElement('div');
      row.className = `layer-row ${isSelected ? 'active' : ''}`;
      row.dataset.index = i;

      const visBtn = document.createElement('button');
      visBtn.className = `layer-visibility-btn ${layer.visible ? 'visible' : ''}`;
      visBtn.innerHTML = layer.visible ? '👁' : '⎯';
      visBtn.title = layer.visible ? 'Sembunyikan Lapisan' : 'Pamerkan Lapisan';
      visBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        layer.visible = !layer.visible;
        renderAll();
      });

      const thumb = document.createElement('canvas');
      thumb.className = 'layer-thumb';
      thumb.width = 48;
      thumb.height = 32;
      const tCtx = thumb.getContext('2d');
      tCtx.drawImage(layer.canvas, 0, 0, 48, 32);

      const title = document.createElement('span');
      title.className = 'layer-title';
      title.textContent = layer.name;
      title.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        const newName = prompt('Tukar nama lapisan:', layer.name);
        if (newName && newName.trim()) {
          layer.name = newName.trim();
          renderLayersUI();
        }
      });

      row.appendChild(visBtn);
      row.appendChild(thumb);
      row.appendChild(title);

      row.addEventListener('click', () => {
        setActiveLayerIndex(i);
      });

      dom.layersList.appendChild(row);
    }

    const cur = getActiveLayer();
    if (cur) {
      dom.layerOpacity.value = Math.round(cur.opacity * 100);
      dom.layerOpacityVal.textContent = Math.round(cur.opacity * 100) + '%';
      dom.layerBlendMode.value = cur.blendMode || 'source-over';
    }
  }

  function setActiveLayerIndex(index) {
    if (index >= 0 && index < state.layers.length) {
      state.activeLayerIndex = index;
      renderAll();
    }
  }

  function createNewLayer(name = 'Lapisan Baharu', fill = null) {
    const layer = new Layer(name, state.width, state.height, fill);
    state.layers.push(layer);
    state.activeLayerIndex = state.layers.length - 1;
    renderAll();
    saveHistory(`Tambah ${name}`);
    return layer;
  }

  function duplicateActiveLayer() {
    const cur = getActiveLayer();
    if (!cur) return;
    const clone = cur.clone();
    state.layers.splice(state.activeLayerIndex + 1, 0, clone);
    state.activeLayerIndex++;
    renderAll();
    saveHistory(`Salin ${cur.name}`);
    showToast(`Lapisan disalin: ${clone.name}`, 'info');
  }

  function deleteActiveLayer() {
    if (state.layers.length <= 1) {
      showToast('Sekurang-kurangnya 1 lapisan diperlukan!', 'error');
      return;
    }
    const cur = getActiveLayer();
    const name = cur ? cur.name : 'Lapisan';
    state.layers.splice(state.activeLayerIndex, 1);
    state.activeLayerIndex = Math.max(0, state.activeLayerIndex - 1);
    renderAll();
    saveHistory(`Padam ${name}`);
    showToast(`Lapisan ${name} telah dipadam`, 'info');
  }

  function moveLayerUp() {
    const idx = state.activeLayerIndex;
    if (idx < state.layers.length - 1) {
      const temp = state.layers[idx];
      state.layers[idx] = state.layers[idx + 1];
      state.layers[idx + 1] = temp;
      state.activeLayerIndex = idx + 1;
      renderAll();
      saveHistory('Naikkan Lapisan');
    }
  }

  function moveLayerDown() {
    const idx = state.activeLayerIndex;
    if (idx > 0) {
      const temp = state.layers[idx];
      state.layers[idx] = state.layers[idx - 1];
      state.layers[idx - 1] = temp;
      state.activeLayerIndex = idx - 1;
      renderAll();
      saveHistory('Turunkan Lapisan');
    }
  }

  function mergeLayerDown() {
    const idx = state.activeLayerIndex;
    if (idx <= 0) {
      showToast('Tiada lapisan di bawah untuk dicantum!', 'error');
      return;
    }
    const top = state.layers[idx];
    const bottom = state.layers[idx - 1];

    bottom.ctx.save();
    bottom.ctx.globalAlpha = top.opacity;
    bottom.ctx.globalCompositeOperation = top.blendMode || 'source-over';
    bottom.ctx.drawImage(top.canvas, top.x, top.y);
    bottom.ctx.restore();

    state.layers.splice(idx, 1);
    state.activeLayerIndex = idx - 1;
    renderAll();
    saveHistory('Cantum Lapisan ke Bawah');
    showToast('Lapisan berjaya dicantum ke bawah', 'success');
  }

  function flattenImage() {
    if (state.layers.length <= 1) return;
    const flat = new Layer('Latar Rata (Flattened)', state.width, state.height, '#ffffff');
    flat.ctx.drawImage(dom.mainCanvas, 0, 0);
    state.layers = [flat];
    state.activeLayerIndex = 0;
    renderAll();
    saveHistory('Ratakan Imej');
    showToast('Semua lapisan telah diratakan', 'info');
  }

  /* --------------------------------------------------------------------------
     History (Undo / Redo) Manager
     -------------------------------------------------------------------------- */
  function saveHistory(actionName) {
    if (state.historyIndex < state.history.length - 1) {
      state.history = state.history.slice(0, state.historyIndex + 1);
    }

    const snapshotLayers = state.layers.map(layer => {
      const copy = new Layer(layer.name, layer.width, layer.height);
      copy.x = layer.x;
      copy.y = layer.y;
      copy.visible = layer.visible;
      copy.opacity = layer.opacity;
      copy.blendMode = layer.blendMode;
      copy.ctx.drawImage(layer.canvas, 0, 0);
      return copy;
    });

    state.history.push({
      action: actionName,
      layers: snapshotLayers,
      activeLayerIndex: state.activeLayerIndex,
      width: state.width,
      height: state.height
    });

    if (state.history.length > state.maxHistory) {
      state.history.shift();
    }

    state.historyIndex = state.history.length - 1;
    renderHistoryUI();
  }

  function undo() {
    if (state.historyIndex > 0) {
      state.historyIndex--;
      restoreHistoryState(state.history[state.historyIndex]);
      renderHistoryUI();
      showToast('Undo: ' + state.history[state.historyIndex].action, 'info');
    } else {
      showToast('Tiada lagi langkah untuk Undo', 'info');
    }
  }

  function redo() {
    if (state.historyIndex < state.history.length - 1) {
      state.historyIndex++;
      restoreHistoryState(state.history[state.historyIndex]);
      renderHistoryUI();
      showToast('Redo: ' + state.history[state.historyIndex].action, 'info');
    } else {
      showToast('Tiada lagi langkah untuk Redo', 'info');
    }
  }

  function restoreHistoryState(snapshot) {
    state.width = snapshot.width;
    state.height = snapshot.height;
    [dom.mainCanvas, dom.checkerCanvas, dom.overlayCanvas].forEach(c => {
      c.width = state.width;
      c.height = state.height;
    });
    dom.workspace.style.width = state.width + 'px';
    dom.workspace.style.height = state.height + 'px';

    state.layers = snapshot.layers.map(l => l.clone());
    state.activeLayerIndex = Math.min(snapshot.activeLayerIndex, state.layers.length - 1);
    drawCheckerboard();
    renderAll();
    updateStatusDimensions();
  }

  function renderHistoryUI() {
    dom.historyList.innerHTML = '';
    state.history.forEach((item, idx) => {
      const li = document.createElement('li');
      li.textContent = item.action;
      if (idx === state.historyIndex) li.classList.add('active');
      li.addEventListener('click', () => {
        state.historyIndex = idx;
        restoreHistoryState(state.history[idx]);
        renderHistoryUI();
      });
      dom.historyList.appendChild(li);
    });
  }

  /* --------------------------------------------------------------------------
     Drawing & Interactive Tools Engine (Mouse & Touch)
     -------------------------------------------------------------------------- */
  function getCanvasCoords(clientX, clientY) {
    const rect = dom.workspace.getBoundingClientRect();
    const x = Math.round((clientX - rect.left) / state.zoom);
    const y = Math.round((clientY - rect.top) / state.zoom);
    return { x, y };
  }

  function setupToolInteractions() {
    let startX = 0;
    let startY = 0;
    let layerStartX = 0;
    let layerStartY = 0;

    function handleStart(clientX, clientY, isSecondary = false) {
      if (isSecondary || state.activeTool === 'hand') {
        dom.workspace.style.cursor = 'grabbing';
        state.isDrawing = true;
        startX = clientX;
        startY = clientY;
        return;
      }

      const coords = getCanvasCoords(clientX, clientY);
      startX = coords.x;
      startY = coords.y;
      state.lastMouse = { ...coords };
      state.isDrawing = true;

      const curLayer = getActiveLayer();

      if (state.activeTool === 'move' && curLayer) {
        layerStartX = curLayer.x;
        layerStartY = curLayer.y;
      } else if (state.activeTool === 'brush' || state.activeTool === 'pencil') {
        if (!curLayer) return;
        drawStroke(curLayer.ctx, coords.x, coords.y, coords.x, coords.y, state.activeTool === 'pencil');
        renderAll();
      } else if (state.activeTool === 'eraser') {
        if (!curLayer) return;
        eraseStroke(curLayer.ctx, coords.x, coords.y, coords.x, coords.y);
        renderAll();
      } else if (state.activeTool === 'eyedropper') {
        pickColor(coords.x, coords.y);
      } else if (state.activeTool === 'bucket') {
        if (!curLayer) return;
        floodFill(curLayer, coords.x - curLayer.x, coords.y - curLayer.y, state.fgColor);
        renderAll();
        saveHistory('Paint Bucket');
      } else if (state.activeTool === 'text') {
        handleTextPlacement(coords.x, coords.y);
      } else if (state.activeTool === 'zoom') {
        updateZoom(state.zoom * 1.25);
      }
    }

    function handleMove(clientX, clientY) {
      const coords = getCanvasCoords(clientX, clientY);
      dom.statCoords.textContent = `X: ${coords.x}, Y: ${coords.y}`;

      if (!state.isDrawing) return;

      if (state.activeTool === 'hand') {
        const dx = clientX - startX;
        const dy = clientY - startY;
        dom.scrollWrapper.scrollLeft -= dx;
        dom.scrollWrapper.scrollTop -= dy;
        startX = clientX;
        startY = clientY;
        return;
      }

      const curLayer = getActiveLayer();

      if (state.activeTool === 'move' && curLayer) {
        const dx = coords.x - startX;
        const dy = coords.y - startY;
        curLayer.x = layerStartX + dx;
        curLayer.y = layerStartY + dy;
        renderAll();
      } else if (state.activeTool === 'brush' || state.activeTool === 'pencil') {
        if (!curLayer) return;
        drawStroke(curLayer.ctx, state.lastMouse.x, state.lastMouse.y, coords.x, coords.y, state.activeTool === 'pencil');
        state.lastMouse = { ...coords };
        renderAll();
      } else if (state.activeTool === 'eraser') {
        if (!curLayer) return;
        eraseStroke(curLayer.ctx, state.lastMouse.x, state.lastMouse.y, coords.x, coords.y);
        state.lastMouse = { ...coords };
        renderAll();
      } else if (state.activeTool === 'select') {
        drawSelectionOverlay(startX, startY, coords.x, coords.y);
      } else if (state.activeTool === 'shape') {
        drawShapeOverlay(startX, startY, coords.x, coords.y);
      }
    }

    function handleEnd(clientX, clientY) {
      if (!state.isDrawing) return;
      state.isDrawing = false;
      dom.workspace.style.cursor = getToolCursor(state.activeTool);

      const coords = getCanvasCoords(clientX, clientY);
      const curLayer = getActiveLayer();

      if (state.activeTool === 'brush' || state.activeTool === 'pencil') {
        saveHistory(state.activeTool === 'pencil' ? 'Pensel' : 'Berus');
      } else if (state.activeTool === 'eraser') {
        saveHistory('Pemadam');
      } else if (state.activeTool === 'move') {
        saveHistory('Alih Lapisan');
      } else if (state.activeTool === 'select') {
        finalizeSelection(startX, startY, coords.x, coords.y);
      } else if (state.activeTool === 'shape' && curLayer) {
        overlayCtx.clearRect(0, 0, state.width, state.height);
        commitShapeToLayer(curLayer, startX, startY, coords.x, coords.y);
        renderAll();
        saveHistory(`Bentuk (${state.shapeType})`);
      }
    }

    // Mouse Listeners
    dom.workspace.addEventListener('mousedown', (e) => {
      handleStart(e.clientX, e.clientY, e.button === 1);
    });
    window.addEventListener('mousemove', (e) => {
      handleMove(e.clientX, e.clientY);
    });
    window.addEventListener('mouseup', (e) => {
      handleEnd(e.clientX, e.clientY);
    });

    // Touch Listeners for Mobile Phones
    let touchDistStart = 0;
    let initialZoom = 1.0;

    dom.workspace.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        const t = e.touches[0];
        handleStart(t.clientX, t.clientY, false);
      } else if (e.touches.length === 2) {
        // Two-finger pinch to zoom
        state.isDrawing = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchDistStart = Math.hypot(dx, dy);
        initialZoom = state.zoom;
      }
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1 && state.isDrawing) {
        e.preventDefault();
        const t = e.touches[0];
        handleMove(t.clientX, t.clientY);
      } else if (e.touches.length === 2 && touchDistStart > 0) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const factor = dist / touchDistStart;
        updateZoom(initialZoom * factor);
      }
    }, { passive: false });

    window.addEventListener('touchend', (e) => {
      if (state.isDrawing) {
        const ct = e.changedTouches[0];
        handleEnd(ct ? ct.clientX : 0, ct ? ct.clientY : 0);
      }
      touchDistStart = 0;
    });

    // Mouse Wheel Zoom
    dom.scrollWrapper.addEventListener('wheel', (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        updateZoom(state.zoom * delta);
      }
    }, { passive: false });
  }

  function getToolCursor(tool) {
    switch (tool) {
      case 'move': return 'move';
      case 'select':
      case 'brush':
      case 'pencil':
      case 'eraser':
      case 'eyedropper': return 'crosshair';
      case 'bucket': return 'cell';
      case 'text': return 'text';
      case 'hand': return 'grab';
      case 'zoom': return 'zoom-in';
      default: return 'default';
    }
  }

  function drawStroke(ctx, x1, y1, x2, y2, isPencil) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = isPencil ? Math.max(1, Math.round(state.brushSize / 3)) : state.brushSize;
    ctx.strokeStyle = state.fgColor;
    ctx.globalAlpha = state.brushOpacity;

    if (!isPencil && state.brushHardness < 90) {
      ctx.shadowBlur = (100 - state.brushHardness) * 0.25;
      ctx.shadowColor = state.fgColor;
    }

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }

  function eraseStroke(ctx, x1, y1, x2, y2) {
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = state.brushSize;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }

  function pickColor(x, y) {
    const p = mainCtx.getImageData(x, y, 1, 1).data;
    const hex = '#' + ((1 << 24) + (p[0] << 16) + (p[1] << 8) + p[2]).toString(16).slice(1);
    state.fgColor = hex;
    dom.fgColor.value = hex;
    document.getElementById('fg-color-box').style.backgroundColor = hex;
    showToast(`Warna disedut: ${hex}`, 'info');
  }

  function floodFill(layer, startX, startY, fillColor) {
    const ctx = layer.ctx;
    const w = layer.canvas.width;
    const h = layer.canvas.height;
    if (startX < 0 || startX >= w || startY < 0 || startY >= h) return;

    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    const startPos = (startY * w + startX) * 4;
    const targetR = data[startPos];
    const targetG = data[startPos + 1];
    const targetB = data[startPos + 2];
    const targetA = data[startPos + 3];

    const tempDiv = document.createElement('div');
    tempDiv.style.color = fillColor;
    document.body.appendChild(tempDiv);
    const cs = window.getComputedStyle(tempDiv).color;
    document.body.removeChild(tempDiv);
    const match = cs.match(/\d+/g);
    const fillR = parseInt(match[0]);
    const fillG = parseInt(match[1]);
    const fillB = parseInt(match[2]);
    const fillA = 255;

    if (targetR === fillR && targetG === fillG && targetB === fillB && targetA === fillA) return;

    const queue = [[startX, startY]];
    const seen = new Uint8Array(w * h);

    function matchPixel(pos) {
      return (
        Math.abs(data[pos] - targetR) < 32 &&
        Math.abs(data[pos + 1] - targetG) < 32 &&
        Math.abs(data[pos + 2] - targetB) < 32 &&
        Math.abs(data[pos + 3] - targetA) < 32
      );
    }

    while (queue.length > 0) {
      const [x, y] = queue.pop();
      const pos = (y * w + x) * 4;
      const pixelIdx = y * w + x;

      if (seen[pixelIdx]) continue;
      seen[pixelIdx] = 1;

      if (matchPixel(pos)) {
        data[pos] = fillR;
        data[pos + 1] = fillG;
        data[pos + 2] = fillB;
        data[pos + 3] = fillA;

        if (x > 0) queue.push([x - 1, y]);
        if (x < w - 1) queue.push([x + 1, y]);
        if (y > 0) queue.push([x, y - 1]);
        if (y < h - 1) queue.push([x, y + 1]);
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }

  function handleTextPlacement(x, y) {
    const text = prompt('Masukkan teks anda:', 'Lumina PhotoStudio');
    if (!text || !text.trim()) return;

    const cur = getActiveLayer();
    const targetLayer = cur || createNewLayer('Lapisan Teks');

    targetLayer.ctx.save();
    let fontStyle = '';
    if (state.textItalic) fontStyle += 'italic ';
    if (state.textBold) fontStyle += 'bold ';
    targetLayer.ctx.font = `${fontStyle}${state.textSize}px ${state.textFont}`;
    targetLayer.ctx.fillStyle = state.fgColor;
    targetLayer.ctx.textBaseline = 'top';
    targetLayer.ctx.fillText(text, x - targetLayer.x, y - targetLayer.y);
    targetLayer.ctx.restore();

    renderAll();
    saveHistory(`Tambah Teks "${text.slice(0, 15)}"`);
    showToast('Teks berjaya dimasukkan ke lapisan', 'success');
  }

  function drawShapeOverlay(x1, y1, x2, y2) {
    overlayCtx.clearRect(0, 0, state.width, state.height);
    overlayCtx.save();
    overlayCtx.strokeStyle = state.fgColor;
    overlayCtx.lineWidth = state.shapeStrokeWidth;
    overlayCtx.fillStyle = state.shapeFill ? state.fgColor : 'transparent';

    drawShapePath(overlayCtx, x1, y1, x2, y2, state.shapeType);
    if (state.shapeFill) overlayCtx.fill();
    if (state.shapeStrokeWidth > 0) overlayCtx.stroke();
    overlayCtx.restore();
  }

  function commitShapeToLayer(layer, x1, y1, x2, y2) {
    layer.ctx.save();
    layer.ctx.strokeStyle = state.fgColor;
    layer.ctx.lineWidth = state.shapeStrokeWidth;
    layer.ctx.fillStyle = state.shapeFill ? state.fgColor : 'transparent';

    drawShapePath(layer.ctx, x1 - layer.x, y1 - layer.y, x2 - layer.x, y2 - layer.y, state.shapeType);
    if (state.shapeFill) layer.ctx.fill();
    if (state.shapeStrokeWidth > 0) layer.ctx.stroke();
    layer.ctx.restore();
  }

  function drawShapePath(ctx, x1, y1, x2, y2, type) {
    ctx.beginPath();
    const rx = Math.min(x1, x2);
    const ry = Math.min(y1, y2);
    const rw = Math.abs(x2 - x1);
    const rh = Math.abs(y2 - y1);

    if (type === 'rect') {
      ctx.rect(rx, ry, rw, rh);
    } else if (type === 'circle') {
      ctx.ellipse(rx + rw / 2, ry + rh / 2, rw / 2, rh / 2, 0, 0, Math.PI * 2);
    } else if (type === 'line') {
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
    } else if (type === 'arrow') {
      const headlen = 16;
      const angle = Math.atan2(y2 - y1, x2 - x1);
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x2 - headlen * Math.cos(angle - Math.PI / 6), y2 - headlen * Math.sin(angle - Math.PI / 6));
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - headlen * Math.cos(angle + Math.PI / 6), y2 - headlen * Math.sin(angle + Math.PI / 6));
    } else if (type === 'star') {
      const cx = rx + rw / 2;
      const cy = ry + rh / 2;
      const spikes = 5;
      const outerRadius = Math.max(rw, rh) / 2;
      const innerRadius = outerRadius / 2.5;
      let rot = Math.PI / 2 * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      ctx.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
    }
  }

  function drawSelectionOverlay(x1, y1, x2, y2) {
    overlayCtx.clearRect(0, 0, state.width, state.height);
    const sx = Math.min(x1, x2);
    const sy = Math.min(y1, y2);
    const sw = Math.abs(x2 - x1);
    const sh = Math.abs(y2 - y1);

    overlayCtx.save();
    overlayCtx.setLineDash([6, 6]);
    overlayCtx.strokeStyle = '#ffffff';
    overlayCtx.lineWidth = 1.5;
    overlayCtx.strokeRect(sx, sy, sw, sh);
    overlayCtx.strokeStyle = '#000000';
    overlayCtx.lineDashOffset = 6;
    overlayCtx.strokeRect(sx, sy, sw, sh);
    overlayCtx.restore();
  }

  function finalizeSelection(x1, y1, x2, y2) {
    const sx = Math.min(x1, x2);
    const sy = Math.min(y1, y2);
    const sw = Math.abs(x2 - x1);
    const sh = Math.abs(y2 - y1);

    if (sw > 4 && sh > 4) {
      state.selection = { x: sx, y: sy, w: sw, h: sh };
      drawSelectionOverlay(sx, sy, sx + sw, sy + sh);
    } else {
      state.selection = null;
      overlayCtx.clearRect(0, 0, state.width, state.height);
    }
  }

  function clearSelection() {
    state.selection = null;
    overlayCtx.clearRect(0, 0, state.width, state.height);
    showToast('Pilihan dinyahkan', 'info');
  }

  function cropToSelection() {
    if (!state.selection) {
      showToast('Tiada pilihan aktif untuk dipotong (Crop)!', 'error');
      return;
    }
    const { x, y, w, h } = state.selection;
    state.layers.forEach(layer => {
      const croppedCanvas = document.createElement('canvas');
      croppedCanvas.width = w;
      croppedCanvas.height = h;
      croppedCanvas.getContext('2d').drawImage(layer.canvas, -(x - layer.x), -(y - layer.y));
      layer.canvas.width = w;
      layer.canvas.height = h;
      layer.width = w;
      layer.height = h;
      layer.x = 0;
      layer.y = 0;
      layer.ctx.drawImage(croppedCanvas, 0, 0);
    });

    state.selection = null;
    overlayCtx.clearRect(0, 0, state.width, state.height);
    state.width = w;
    state.height = h;

    [dom.mainCanvas, dom.checkerCanvas, dom.overlayCanvas].forEach(c => {
      c.width = w;
      c.height = h;
    });
    dom.workspace.style.width = w + 'px';
    dom.workspace.style.height = h + 'px';

    drawCheckerboard();
    renderAll();
    updateStatusDimensions();
    saveHistory(`Crop Kanvas (${w}×${h})`);
    showToast(`Kanvas berjaya dipotong: ${w}×${h} px`, 'success');
  }

  /* --------------------------------------------------------------------------
     Image Filters & Color Adjustments
     -------------------------------------------------------------------------- */
  function applyColorAdjustments(brightness, contrast, saturation, blur) {
    const cur = getActiveLayer();
    if (!cur) return;

    const temp = document.createElement('canvas');
    temp.width = cur.canvas.width;
    temp.height = cur.canvas.height;
    const tCtx = temp.getContext('2d');

    tCtx.filter = `brightness(${100 + brightness}%) contrast(${100 + contrast}%) saturate(${saturation}%) blur(${blur}px)`;
    tCtx.drawImage(cur.canvas, 0, 0);

    cur.ctx.clearRect(0, 0, cur.canvas.width, cur.canvas.height);
    cur.ctx.drawImage(temp, 0, 0);

    renderAll();
    saveHistory('Pelarasan Warna');
    showToast('Pelarasan warna diterapkan', 'success');
  }

  function applyQuickFilter(type) {
    const cur = getActiveLayer();
    if (!cur) return;
    const w = cur.canvas.width;
    const h = cur.canvas.height;
    const imgData = cur.ctx.getImageData(0, 0, w, h);
    const d = imgData.data;

    if (type === 'grayscale') {
      for (let i = 0; i < d.length; i += 4) {
        const v = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        d[i] = d[i + 1] = d[i + 2] = v;
      }
    } else if (type === 'invert') {
      for (let i = 0; i < d.length; i += 4) {
        d[i] = 255 - d[i];
        d[i + 1] = 255 - d[i + 1];
        d[i + 2] = 255 - d[i + 2];
      }
    } else if (type === 'sepia') {
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i + 1], b = d[i + 2];
        d[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
        d[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
        d[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
      }
    } else if (type === 'sharpen') {
      applyConvolution(cur, [0, -1, 0, -1, 5, -1, 0, -1, 0]);
      return;
    } else if (type === 'edges') {
      applyConvolution(cur, [-1, -1, -1, -1, 8, -1, -1, -1, -1]);
      return;
    } else if (type === 'emboss') {
      applyConvolution(cur, [-2, -1, 0, -1, 1, 1, 0, 1, 2]);
      return;
    }

    cur.ctx.putImageData(imgData, 0, 0);
    renderAll();
    saveHistory(`Penapis ${type}`);
    showToast(`Penapis ${type} diterapkan`, 'success');
  }

  function applyConvolution(layer, weights) {
    const w = layer.canvas.width;
    const h = layer.canvas.height;
    const srcData = layer.ctx.getImageData(0, 0, w, h);
    const dstData = layer.ctx.createImageData(w, h);
    const src = srcData.data;
    const dst = dstData.data;

    const side = Math.round(Math.sqrt(weights.length));
    const halfSide = Math.floor(side / 2);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dstOff = (y * w + x) * 4;
        let r = 0, g = 0, b = 0;

        for (let cy = 0; cy < side; cy++) {
          for (let cx = 0; cx < side; cx++) {
            const scy = Math.min(h - 1, Math.max(0, y + cy - halfSide));
            const scx = Math.min(w - 1, Math.max(0, x + cx - halfSide));
            const srcOff = (scy * w + scx) * 4;
            const wt = weights[cy * side + cx];
            r += src[srcOff] * wt;
            g += src[srcOff + 1] * wt;
            b += src[srcOff + 2] * wt;
          }
        }
        dst[dstOff] = Math.min(255, Math.max(0, r));
        dst[dstOff + 1] = Math.min(255, Math.max(0, g));
        dst[dstOff + 2] = Math.min(255, Math.max(0, b));
        dst[dstOff + 3] = src[dstOff + 3];
      }
    }
    layer.ctx.putImageData(dstData, 0, 0);
    renderAll();
    saveHistory('Convolution Filter');
  }

  function flipLayer(horizontal = true) {
    const cur = getActiveLayer();
    if (!cur) return;
    const temp = document.createElement('canvas');
    temp.width = cur.canvas.width;
    temp.height = cur.canvas.height;
    const tCtx = temp.getContext('2d');

    tCtx.translate(horizontal ? cur.canvas.width : 0, horizontal ? 0 : cur.canvas.height);
    tCtx.scale(horizontal ? -1 : 1, horizontal ? 1 : -1);
    tCtx.drawImage(cur.canvas, 0, 0);

    cur.ctx.clearRect(0, 0, cur.canvas.width, cur.canvas.height);
    cur.ctx.drawImage(temp, 0, 0);

    renderAll();
    saveHistory(horizontal ? 'Balik Mendatar' : 'Balik Menegak');
  }

  function rotate90() {
    const cur = getActiveLayer();
    if (!cur) return;
    const oldW = cur.canvas.width;
    const oldH = cur.canvas.height;

    const temp = document.createElement('canvas');
    temp.width = oldH;
    temp.height = oldW;
    const tCtx = temp.getContext('2d');

    tCtx.translate(oldH / 2, oldW / 2);
    tCtx.rotate(Math.PI / 2);
    tCtx.drawImage(cur.canvas, -oldW / 2, -oldH / 2);

    cur.canvas.width = oldH;
    cur.canvas.height = oldW;
    cur.width = oldH;
    cur.height = oldW;
    cur.ctx.drawImage(temp, 0, 0);

    renderAll();
    saveHistory('Putar 90° Ikut Jam');
  }

  /* --------------------------------------------------------------------------
     PostScript (.PS) Studio Engine
     -------------------------------------------------------------------------- */
  async function loadPostScriptFile(file) {
    try {
      showToast('Sedang menghurai kod fail .PS (PostScript)...', 'info');
      dom.psLoadedFilename.textContent = file.name;

      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target.result;
        if (!window.PostScriptParser) {
          showToast('Modul PostScriptParser tidak ditemui!', 'error');
          return;
        }

        const result = window.PostScriptParser.parse(text);
        state.psRenderResult = {
          file: file,
          name: file.name,
          canvas: result.canvas,
          width: result.width,
          height: result.height,
          bbox: result.bbox
        };

        dom.psActionControls.style.display = 'block';
        dom.psDetailsBadge.textContent = `Vektor: ${result.width} × ${result.height} px (BBox: ${result.bbox.x}, ${result.bbox.y})`;
        
        // Switch tab to PS tab
        document.querySelector('.dock-tab[data-tab="tab-ps"]').click();
        showToast(`Fail .PS "${file.name}" berjaya dihuraikan!`, 'success');
      };
      reader.readAsText(file);
    } catch (err) {
      console.error(err);
      showToast('Gagal membaca fail .PS: ' + err.message, 'error');
    }
  }

  function insertPostScriptToCanvas(asNewDoc = false) {
    if (!state.psRenderResult) {
      showToast('Sila buka fail .PS terlebih dahulu!', 'error');
      return;
    }

    const { canvas, name, width, height } = state.psRenderResult;

    if (asNewDoc) {
      resizeDocument(width, height, false);
      state.layers = [];
    }

    const layer = new Layer(name, state.width, state.height);
    const x = Math.max(0, (state.width - width) / 2);
    const y = Math.max(0, (state.height - height) / 2);
    layer.ctx.drawImage(canvas, x, y);

    state.layers.push(layer);
    state.activeLayerIndex = state.layers.length - 1;
    renderAll();
    saveHistory(`Masukkan .PS (${name})`);
    showToast(`Kandungan fail .PS telah dimasukkan ke kanvas!`, 'success');
  }

  /* --------------------------------------------------------------------------
     PDF Studio Engine (PDF.js Integration)
     -------------------------------------------------------------------------- */
  async function loadPDFFile(file) {
    try {
      showToast('Sedang membaca dokumen PDF...', 'info');
      dom.pdfLoadedFilename.textContent = file.name;
      const arrayBuffer = await file.arrayBuffer();
      
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      state.pdfDoc = await loadingTask.promise;
      state.pdfTotalPages = state.pdfDoc.numPages;
      state.pdfCurrentPage = 1;

      dom.pdfNavWrapper.style.display = 'block';
      updatePDFPageDisplay();
      showToast(`PDF berjaya dimuat (${state.pdfTotalPages} halaman)`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Gagal membuka PDF: ' + err.message, 'error');
    }
  }

  async function updatePDFPageDisplay() {
    if (!state.pdfDoc) return;
    dom.pdfPageIndicator.textContent = `Halaman ${state.pdfCurrentPage} / ${state.pdfTotalPages}`;

    const page = await state.pdfDoc.getPage(state.pdfCurrentPage);
    const viewport = page.getViewport({ scale: 0.5 });
    
    dom.pdfThumbnailCanvas.width = viewport.width;
    dom.pdfThumbnailCanvas.height = viewport.height;
    const ctx = dom.pdfThumbnailCanvas.getContext('2d');

    await page.render({
      canvasContext: ctx,
      viewport: viewport
    }).promise;
  }

  async function insertPDFPageAsLayer(asNewDocument = false) {
    if (!state.pdfDoc) {
      showToast('Sila buka fail PDF terlebih dahulu!', 'error');
      return;
    }

    try {
      showToast('Merender halaman PDF ke kanvas...', 'info');
      const scale = parseFloat(dom.pdfRenderScale.value) || 2.0;
      const page = await state.pdfDoc.getPage(state.pdfCurrentPage);
      const viewport = page.getViewport({ scale: scale });

      const pdfCanvas = document.createElement('canvas');
      pdfCanvas.width = Math.round(viewport.width);
      pdfCanvas.height = Math.round(viewport.height);
      const pCtx = pdfCanvas.getContext('2d');

      await page.render({
        canvasContext: pCtx,
        viewport: viewport
      }).promise;

      if (asNewDocument) {
        resizeDocument(pdfCanvas.width, pdfCanvas.height, false);
        state.layers = [];
      }

      const layerName = `PDF Hal. ${state.pdfCurrentPage}`;
      const layer = new Layer(layerName, state.width, state.height);
      
      const x = (state.width - pdfCanvas.width) / 2;
      const y = (state.height - pdfCanvas.height) / 2;
      layer.ctx.drawImage(pdfCanvas, Math.max(0, x), Math.max(0, y));

      state.layers.push(layer);
      state.activeLayerIndex = state.layers.length - 1;
      renderAll();
      saveHistory(`Masukkan ${layerName}`);
      showToast(`Halaman ${state.pdfCurrentPage} dimasukkan sebagai lapisan!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Ralat merender halaman PDF: ' + err.message, 'error');
    }
  }

  /* --------------------------------------------------------------------------
     Document & Image Converter Hub
     -------------------------------------------------------------------------- */
  let converterLoadedFile = null;

  function setupConverterHub() {
    dom.convFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      converterLoadedFile = file;
      dom.convFileDetails.textContent = `Fail: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
      showConvStatus(`Fail "${file.name}" sedia untuk ditukar.`, 'info');
    });

    dom.convQuality.addEventListener('input', () => {
      dom.convQualityVal.textContent = dom.convQuality.value + '%';
    });

    dom.convTargetFormat.addEventListener('change', () => {
      const fmt = dom.convTargetFormat.value;
      const qualGroup = document.getElementById('conv-quality-control');
      if (fmt === 'jpeg' || fmt === 'webp') {
        qualGroup.style.display = 'block';
      } else {
        qualGroup.style.display = 'none';
      }
    });

    dom.btnStartConvert.addEventListener('click', async () => {
      if (!converterLoadedFile) {
        showToast('Sila pilih fail untuk ditukar dahulu!', 'error');
        return;
      }
      await convertFile(converterLoadedFile, dom.convTargetFormat.value);
    });

    dom.btnConvertCurrentCanvas.addEventListener('click', async () => {
      await convertCurrentCanvas(dom.convTargetFormat.value);
    });
  }

  function showConvStatus(msg, type) {
    dom.convStatusMsg.className = `status-feedback ${type}`;
    dom.convStatusMsg.textContent = msg;
    dom.convStatusMsg.style.display = 'block';
  }

  async function convertFile(file, targetFormat) {
    showConvStatus('Memproses penukaran format...', 'info');

    try {
      const isInputPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const isInputPS = file.name.toLowerCase().endsWith('.ps') || file.name.toLowerCase().endsWith('.eps');
      const quality = parseFloat(dom.convQuality.value) / 100;

      if (isInputPS) {
        // PostScript to Image or PDF
        const text = await file.text();
        const parsed = window.PostScriptParser.parse(text);
        if (targetFormat === 'pdf') {
          await convertCanvasToPDF(parsed.canvas, file.name.replace(/\.[^/.]+$/, ''));
        } else {
          await downloadCanvasAs(parsed.canvas, targetFormat, quality, file.name.replace(/\.[^/.]+$/, ''));
        }
        showConvStatus(`Fail .PS berjaya ditukar ke ${targetFormat.toUpperCase()}!`, 'success');
      } else if (isInputPDF) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        if (targetFormat === 'pdf') {
          downloadBlob(new Blob([arrayBuffer], { type: 'application/pdf' }), `converted_${file.name}`);
          showConvStatus('Dokumen PDF dieksport!', 'success');
          return;
        }

        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;

        await downloadCanvasAs(canvas, targetFormat, quality, file.name.replace(/\.[^/.]+$/, ''));
        showConvStatus(`Berjaya ditukar ke ${targetFormat.toUpperCase()}!`, 'success');
      } else {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });

        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        if (targetFormat === 'pdf') {
          await convertCanvasToPDF(canvas, file.name.replace(/\.[^/.]+$/, ''));
        } else {
          await downloadCanvasAs(canvas, targetFormat, quality, file.name.replace(/\.[^/.]+$/, ''));
        }
        showConvStatus(`Berjaya ditukar ke format ${targetFormat.toUpperCase()}!`, 'success');
      }
      showToast('Penukaran dokumen selesai!', 'success');
    } catch (err) {
      console.error(err);
      showConvStatus('Ralat penukaran: ' + err.message, 'error');
      showToast('Penukaran gagal: ' + err.message, 'error');
    }
  }

  async function convertCurrentCanvas(targetFormat) {
    try {
      showConvStatus('Menjana eksport kanvas aktif...', 'info');
      const quality = parseFloat(dom.convQuality.value) / 100;
      if (targetFormat === 'pdf') {
        await convertCanvasToPDF(dom.mainCanvas, 'lumina_project');
      } else {
        await downloadCanvasAs(dom.mainCanvas, targetFormat, quality, 'lumina_project');
      }
      showConvStatus(`Kanvas aktif berjaya dieksport ke ${targetFormat.toUpperCase()}!`, 'success');
      showToast('Eksport kanvas selesai!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Gagal mengeksport kanvas: ' + err.message, 'error');
    }
  }

  async function convertCanvasToPDF(canvas, filename) {
    if (window.PDFLib) {
      const pdfDoc = await PDFLib.PDFDocument.create();
      const pngDataUrl = canvas.toDataURL('image/png');
      const pngImageBytes = await fetch(pngDataUrl).then(res => res.arrayBuffer());
      const pngImage = await pdfDoc.embedPng(pngImageBytes);

      const page = pdfDoc.addPage([canvas.width, canvas.height]);
      page.drawImage(pngImage, {
        x: 0,
        y: 0,
        width: canvas.width,
        height: canvas.height,
      });

      const pdfBytes = await pdfDoc.save();
      downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), `${filename}.pdf`);
    } else {
      showToast('Pustaka PDFLib tidak dimuatkan', 'error');
    }
  }

  function downloadCanvasAs(canvas, format, quality, baseName) {
    return new Promise((resolve) => {
      let mime = 'image/png';
      let ext = 'png';

      if (format === 'jpeg') { mime = 'image/jpeg'; ext = 'jpg'; }
      else if (format === 'webp') { mime = 'image/webp'; ext = 'webp'; }
      else if (format === 'svg') {
        const svgData = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}"><image href="${canvas.toDataURL('image/png')}" width="${canvas.width}" height="${canvas.height}"/></svg>`;
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        downloadBlob(blob, `${baseName}.svg`);
        resolve();
        return;
      }

      canvas.toBlob((blob) => {
        downloadBlob(blob, `${baseName}.${ext}`);
        resolve();
      }, mime, quality);
    });
  }

  function downloadBlob(blob, filename) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  }

  /* --------------------------------------------------------------------------
     Open / Import Image Files
     -------------------------------------------------------------------------- */
  function openGeneralFile(file) {
    const name = file.name.toLowerCase();
    if (name.endsWith('.ps') || name.endsWith('.eps')) {
      loadPostScriptFile(file);
      return;
    }
    if (file.type === 'application/pdf' || name.endsWith('.pdf')) {
      loadPDFFile(file);
      document.querySelector('.dock-tab[data-tab="tab-pdf"]').click();
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        if (state.layers.length === 1 && state.layers[0].name === 'Latar Belakang') {
          resizeDocument(img.naturalWidth || img.width, img.naturalHeight || img.height, false);
          state.layers[0].name = file.name;
          state.layers[0].ctx.clearRect(0, 0, state.width, state.height);
          state.layers[0].ctx.drawImage(img, 0, 0);
        } else {
          const newLayer = createNewLayer(file.name);
          newLayer.ctx.drawImage(img, 0, 0);
        }
        renderAll();
        saveHistory(`Buka Imej ${file.name}`);
        showToast(`Imej "${file.name}" berjaya dibuka!`, 'success');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  /* --------------------------------------------------------------------------
     Event Listeners & UI Wire-up
     -------------------------------------------------------------------------- */
  function setupEventListeners() {
    // Toolbar Tool Selection
    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.activeTool = btn.dataset.tool;
        dom.workspace.style.cursor = getToolCursor(state.activeTool);
        updateOptionsBar(state.activeTool);
      });
    });

    function updateOptionsBar(tool) {
      dom.currentToolBadge.textContent = tool.toUpperCase() + ' TOOL';
      document.getElementById('opt-brush-group').style.display = (tool === 'brush' || tool === 'pencil' || tool === 'eraser') ? 'flex' : 'none';
      document.getElementById('opt-shape-group').style.display = (tool === 'shape') ? 'flex' : 'none';
      document.getElementById('opt-text-group').style.display = (tool === 'text') ? 'flex' : 'none';
      document.getElementById('opt-select-group').style.display = (tool === 'select') ? 'flex' : 'none';
    }

    // Brush sliders
    dom.brushSize.addEventListener('input', (e) => {
      state.brushSize = parseInt(e.target.value);
      dom.brushSizeVal.textContent = state.brushSize + 'px';
    });
    dom.brushHardness.addEventListener('input', (e) => {
      state.brushHardness = parseInt(e.target.value);
      dom.brushHardnessVal.textContent = state.brushHardness + '%';
    });
    dom.brushOpacity.addEventListener('input', (e) => {
      state.brushOpacity = parseInt(e.target.value) / 100;
      dom.brushOpacityVal.textContent = e.target.value + '%';
    });

    // Shape options
    dom.shapeType.addEventListener('change', (e) => state.shapeType = e.target.value);
    dom.shapeStrokeWidth.addEventListener('input', (e) => state.shapeStrokeWidth = parseInt(e.target.value) || 0);
    dom.shapeFillCheck.addEventListener('change', (e) => state.shapeFill = e.target.checked);

    // Text options
    dom.textFont.addEventListener('change', (e) => state.textFont = e.target.value);
    dom.textSize.addEventListener('input', (e) => state.textSize = parseInt(e.target.value) || 24);
    document.getElementById('btn-text-bold').addEventListener('click', (e) => {
      state.textBold = !state.textBold;
      e.currentTarget.classList.toggle('active', state.textBold);
    });
    document.getElementById('btn-text-italic').addEventListener('click', (e) => {
      state.textItalic = !state.textItalic;
      e.currentTarget.classList.toggle('active', state.textItalic);
    });

    // Selection crop & clear
    document.getElementById('btn-crop-selection').addEventListener('click', cropToSelection);
    document.getElementById('btn-clear-selection').addEventListener('click', clearSelection);

    // Colors
    dom.fgColor.addEventListener('input', (e) => {
      state.fgColor = e.target.value;
      document.getElementById('fg-color-box').style.backgroundColor = state.fgColor;
    });
    dom.bgColor.addEventListener('input', (e) => {
      state.bgColor = e.target.value;
      document.getElementById('bg-color-box').style.backgroundColor = state.bgColor;
    });
    document.getElementById('btn-swap-colors').addEventListener('click', () => {
      const temp = state.fgColor;
      state.fgColor = state.bgColor;
      state.bgColor = temp;
      dom.fgColor.value = state.fgColor;
      dom.bgColor.value = state.bgColor;
      document.getElementById('fg-color-box').style.backgroundColor = state.fgColor;
      document.getElementById('bg-color-box').style.backgroundColor = state.bgColor;
    });

    // Layer blend mode & opacity
    dom.layerBlendMode.addEventListener('change', (e) => {
      const cur = getActiveLayer();
      if (cur) {
        cur.blendMode = e.target.value;
        renderAll();
        saveHistory('Ubah Mod Campuran');
      }
    });
    dom.layerOpacity.addEventListener('input', (e) => {
      const cur = getActiveLayer();
      if (cur) {
        cur.opacity = parseInt(e.target.value) / 100;
        dom.layerOpacityVal.textContent = e.target.value + '%';
        renderAll();
      }
    });

    // Layer Footer Buttons
    document.getElementById('btn-add-layer').addEventListener('click', () => createNewLayer());
    document.getElementById('btn-duplicate-layer').addEventListener('click', duplicateActiveLayer);
    document.getElementById('btn-delete-layer').addEventListener('click', deleteActiveLayer);
    document.getElementById('btn-move-layer-up').addEventListener('click', moveLayerUp);
    document.getElementById('btn-move-layer-down').addEventListener('click', moveLayerDown);
    document.getElementById('btn-merge-layer').addEventListener('click', mergeLayerDown);

    // Dock Tabs Switcher
    document.querySelectorAll('.dock-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.dock-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.dock-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
      });
    });

    // Mobile Dock Toggle
    if (dom.btnToggleDock) {
      dom.btnToggleDock.addEventListener('click', () => {
        dom.rightDock.classList.toggle('mobile-open');
      });
    }

    // PWA Install Button & Prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      state.deferredPrompt = e;
      dom.btnInstallPwa.style.display = 'inline-flex';
    });

    dom.btnInstallPwa.addEventListener('click', async () => {
      if (state.deferredPrompt) {
        state.deferredPrompt.prompt();
        const { outcome } = await state.deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          showToast('Terima kasih! Aplikasi berjaya dipasang.', 'success');
        }
        state.deferredPrompt = null;
      } else {
        // Show guidance modal for iOS or manual install
        dom.modalPwaGuide.style.display = 'flex';
      }
    });
    document.getElementById('btn-close-pwa-guide').addEventListener('click', () => dom.modalPwaGuide.style.display = 'none');
    document.getElementById('btn-got-it-pwa').addEventListener('click', () => dom.modalPwaGuide.style.display = 'none');

    // PostScript .PS Studio Controls
    document.getElementById('btn-trigger-ps-file').addEventListener('click', () => dom.psFileInput.click());
    dom.psFileInput.addEventListener('change', (e) => {
      if (e.target.files[0]) loadPostScriptFile(e.target.files[0]);
    });
    document.getElementById('btn-ps-insert-layer').addEventListener('click', () => insertPostScriptToCanvas(false));
    document.getElementById('btn-ps-set-canvas').addEventListener('click', () => insertPostScriptToCanvas(true));
    document.getElementById('btn-ps-convert-to-pdf').addEventListener('click', async () => {
      if (state.psRenderResult) {
        await convertCanvasToPDF(state.psRenderResult.canvas, state.psRenderResult.name.replace(/\.[^/.]+$/, ''));
        showToast('Fail .PS dieksport sebagai PDF!', 'success');
      }
    });
    document.getElementById('btn-ps-convert-to-png').addEventListener('click', async () => {
      if (state.psRenderResult) {
        await downloadCanvasAs(state.psRenderResult.canvas, 'png', 1.0, state.psRenderResult.name.replace(/\.[^/.]+$/, ''));
        showToast('Fail .PS dieksport sebagai PNG!', 'success');
      }
    });

    // PDF Studio Controls
    document.getElementById('btn-trigger-pdf-file').addEventListener('click', () => dom.pdfFileInput.click());
    dom.pdfFileInput.addEventListener('change', (e) => {
      if (e.target.files[0]) loadPDFFile(e.target.files[0]);
    });
    document.getElementById('btn-pdf-prev').addEventListener('click', () => {
      if (state.pdfCurrentPage > 1) {
        state.pdfCurrentPage--;
        updatePDFPageDisplay();
      }
    });
    document.getElementById('btn-pdf-next').addEventListener('click', () => {
      if (state.pdfCurrentPage < state.pdfTotalPages) {
        state.pdfCurrentPage++;
        updatePDFPageDisplay();
      }
    });
    document.getElementById('btn-pdf-insert-layer').addEventListener('click', () => insertPDFPageAsLayer(false));
    document.getElementById('btn-pdf-set-as-canvas').addEventListener('click', () => insertPDFPageAsLayer(true));
    document.getElementById('btn-pdf-export-all-png').addEventListener('click', async () => {
      if (!state.pdfDoc) return;
      showToast('Mengekstrak semua halaman ke PNG...', 'info');
      for (let i = 1; i <= state.pdfDoc.numPages; i++) {
        const page = await state.pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });
        const c = document.createElement('canvas');
        c.width = viewport.width;
        c.height = viewport.height;
        await page.render({ canvasContext: c.getContext('2d'), viewport }).promise;
        await downloadCanvasAs(c, 'png', 1.0, `halaman_${i}`);
      }
      showToast('Semua halaman berjaya dieksport!', 'success');
    });

    // Adjustments & Quick Filters
    document.getElementById('btn-apply-adjustments').addEventListener('click', () => {
      const b = parseInt(document.getElementById('adj-brightness').value);
      const c = parseInt(document.getElementById('adj-contrast').value);
      const s = parseInt(document.getElementById('adj-saturation').value);
      const blur = parseInt(document.getElementById('adj-blur').value);
      applyColorAdjustments(b, c, s, blur);
    });
    document.getElementById('btn-reset-adjustments').addEventListener('click', () => {
      document.getElementById('adj-brightness').value = 0;
      document.getElementById('adj-contrast').value = 0;
      document.getElementById('adj-saturation').value = 100;
      document.getElementById('adj-blur').value = 0;
      document.getElementById('adj-bright-val').textContent = '0';
      document.getElementById('adj-contrast-val').textContent = '0';
      document.getElementById('adj-saturate-val').textContent = '100%';
      document.getElementById('adj-blur-val').textContent = '0px';
    });
    ['brightness', 'contrast', 'saturation', 'blur'].forEach(id => {
      const el = document.getElementById(`adj-${id}`);
      if (el) {
        el.addEventListener('input', () => {
          const suffix = (id === 'saturation') ? '%' : (id === 'blur' ? 'px' : '');
          const label = document.getElementById(`adj-${id.slice(0, 6)}-val` || `adj-${id}-val`);
          if (label) label.textContent = el.value + suffix;
        });
      }
    });

    document.getElementById('btn-quick-grayscale').addEventListener('click', () => applyQuickFilter('grayscale'));
    document.getElementById('btn-quick-sepia').addEventListener('click', () => applyQuickFilter('sepia'));
    document.getElementById('btn-quick-invert').addEventListener('click', () => applyQuickFilter('invert'));
    document.getElementById('btn-quick-sharpen').addEventListener('click', () => applyQuickFilter('sharpen'));

    // Top Menu Bar Commands
    document.getElementById('btn-quick-open').addEventListener('click', () => dom.generalFileInput.click());
    document.getElementById('btn-menu-open').addEventListener('click', () => dom.generalFileInput.click());
    document.getElementById('btn-menu-open-ps').addEventListener('click', () => dom.psFileInput.click());
    dom.generalFileInput.addEventListener('change', (e) => {
      if (e.target.files[0]) openGeneralFile(e.target.files[0]);
    });

    document.getElementById('btn-quick-export').addEventListener('click', () => downloadCanvasAs(dom.mainCanvas, 'png', 1.0, 'lumina_export'));
    document.getElementById('btn-menu-save-png').addEventListener('click', () => downloadCanvasAs(dom.mainCanvas, 'png', 1.0, 'lumina_export'));
    document.getElementById('btn-menu-save-jpg').addEventListener('click', () => downloadCanvasAs(dom.mainCanvas, 'jpeg', 0.92, 'lumina_export'));
    document.getElementById('btn-menu-save-webp').addEventListener('click', () => downloadCanvasAs(dom.mainCanvas, 'webp', 0.92, 'lumina_export'));
    document.getElementById('btn-menu-save-pdf').addEventListener('click', () => convertCanvasToPDF(dom.mainCanvas, 'lumina_document'));
    document.getElementById('btn-menu-open-pdf').addEventListener('click', () => dom.pdfFileInput.click());
    document.getElementById('btn-menu-converter').addEventListener('click', () => {
      document.querySelector('.dock-tab[data-tab="tab-convert"]').click();
    });

    document.getElementById('btn-menu-undo').addEventListener('click', undo);
    document.getElementById('btn-menu-redo').addEventListener('click', redo);
    document.getElementById('btn-menu-clear').addEventListener('click', () => {
      const cur = getActiveLayer();
      if (cur) {
        cur.ctx.clearRect(0, 0, cur.canvas.width, cur.canvas.height);
        renderAll();
        saveHistory('Kosongkan Lapisan');
      }
    });
    document.getElementById('btn-menu-fill').addEventListener('click', () => {
      const cur = getActiveLayer();
      if (cur) {
        cur.ctx.fillStyle = state.fgColor;
        cur.ctx.fillRect(0, 0, cur.canvas.width, cur.canvas.height);
        renderAll();
        saveHistory('Isi Warna');
      }
    });

    document.getElementById('btn-menu-new-layer').addEventListener('click', () => createNewLayer());
    document.getElementById('btn-menu-dup-layer').addEventListener('click', duplicateActiveLayer);
    document.getElementById('btn-menu-del-layer').addEventListener('click', deleteActiveLayer);
    document.getElementById('btn-menu-merge-down').addEventListener('click', mergeLayerDown);
    document.getElementById('btn-menu-flatten').addEventListener('click', flattenImage);

    document.getElementById('btn-menu-grayscale').addEventListener('click', () => applyQuickFilter('grayscale'));
    document.getElementById('btn-menu-invert').addEventListener('click', () => applyQuickFilter('invert'));
    document.getElementById('btn-menu-sepia').addEventListener('click', () => applyQuickFilter('sepia'));
    document.getElementById('btn-menu-flip-h').addEventListener('click', () => flipLayer(true));
    document.getElementById('btn-menu-flip-v').addEventListener('click', () => flipLayer(false));
    document.getElementById('btn-menu-rotate-cw').addEventListener('click', rotate90);

    document.getElementById('btn-filter-blur').addEventListener('click', () => applyColorAdjustments(0, 0, 100, 6));
    document.getElementById('btn-filter-sharpen').addEventListener('click', () => applyQuickFilter('sharpen'));
    document.getElementById('btn-filter-edge').addEventListener('click', () => applyQuickFilter('edges'));
    document.getElementById('btn-filter-emboss').addEventListener('click', () => applyQuickFilter('emboss'));

    document.getElementById('btn-view-zoomin').addEventListener('click', () => updateZoom(state.zoom * 1.25));
    document.getElementById('btn-view-zoomout').addEventListener('click', () => updateZoom(state.zoom * 0.8));
    document.getElementById('btn-view-fit').addEventListener('click', () => {
      const rw = (dom.scrollWrapper.clientWidth - 80) / state.width;
      const rh = (dom.scrollWrapper.clientHeight - 80) / state.height;
      updateZoom(Math.min(rw, rh));
    });
    document.getElementById('btn-view-100').addEventListener('click', () => updateZoom(1.0));

    // Modals
    document.getElementById('btn-menu-new').addEventListener('click', () => dom.modalNewDoc.style.display = 'flex');
    document.getElementById('btn-close-new-doc').addEventListener('click', () => dom.modalNewDoc.style.display = 'none');
    document.getElementById('btn-cancel-new-doc').addEventListener('click', () => dom.modalNewDoc.style.display = 'none');
    document.getElementById('preset-size-select').addEventListener('change', (e) => {
      if (e.target.value !== 'custom') {
        const [w, h] = e.target.value.split('x').map(Number);
        document.getElementById('new-doc-width').value = w;
        document.getElementById('new-doc-height').value = h;
      }
    });
    document.getElementById('btn-confirm-new-doc').addEventListener('click', () => {
      const w = parseInt(document.getElementById('new-doc-width').value) || 1280;
      const h = parseInt(document.getElementById('new-doc-height').value) || 720;
      const bg = document.getElementById('new-doc-bg').value;
      const fillColor = (bg === 'white') ? '#ffffff' : (bg === 'black' ? '#000000' : null);

      state.layers = [];
      resizeDocument(w, h, false);
      createNewLayer('Latar Belakang', fillColor);
      dom.modalNewDoc.style.display = 'none';
      showToast(`Dokumen baharu dicipta (${w}×${h} px)`, 'success');
    });

    document.getElementById('btn-menu-resize').addEventListener('click', () => {
      document.getElementById('resize-width').value = state.width;
      document.getElementById('resize-height').value = state.height;
      dom.modalResize.style.display = 'flex';
    });
    document.getElementById('btn-close-resize').addEventListener('click', () => dom.modalResize.style.display = 'none');
    document.getElementById('btn-cancel-resize').addEventListener('click', () => dom.modalResize.style.display = 'none');
    document.getElementById('btn-confirm-resize').addEventListener('click', () => {
      const w = parseInt(document.getElementById('resize-width').value) || state.width;
      const h = parseInt(document.getElementById('resize-height').value) || state.height;
      const scaleContent = document.getElementById('resize-scale-content').checked;
      resizeDocument(w, h, scaleContent);
      dom.modalResize.style.display = 'none';
    });

    // Drag and Drop
    window.addEventListener('dragover', (e) => e.preventDefault());
    window.addEventListener('drop', (e) => {
      e.preventDefault();
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        openGeneralFile(e.dataTransfer.files[0]);
      }
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;

      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
      } else if (ctrl && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      } else if (ctrl && e.key.toLowerCase() === 's') {
        e.preventDefault();
        downloadCanvasAs(dom.mainCanvas, 'png', 1.0, 'lumina_project');
      } else if (ctrl && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        duplicateActiveLayer();
      } else if (ctrl && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        mergeLayerDown();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (state.selection) {
          const cur = getActiveLayer();
          if (cur) {
            cur.ctx.clearRect(state.selection.x - cur.x, state.selection.y - cur.y, state.selection.w, state.selection.h);
            renderAll();
            saveHistory('Potong Pilihan');
          }
        }
      } else if (!ctrl && !e.altKey) {
        const key = e.key.toLowerCase();
        const toolMap = {
          'v': 'move', 'm': 'select', 'b': 'brush', 'n': 'pencil',
          'e': 'eraser', 'g': 'bucket', 't': 'text', 'u': 'shape',
          'i': 'eyedropper', 'h': 'hand', 'z': 'zoom'
        };
        if (toolMap[key]) {
          const btn = document.querySelector(`.tool-btn[data-tool="${toolMap[key]}"]`);
          if (btn) btn.click();
        } else if (key === 'x') {
          document.getElementById('btn-swap-colors').click();
        }
      }
    });
  }

  /* --------------------------------------------------------------------------
     Initialization
     -------------------------------------------------------------------------- */
  function init() {
    setupToolInteractions();
    setupEventListeners();
    setupConverterHub();

    resizeDocument(1280, 720, false);
    createNewLayer('Latar Belakang', '#ffffff');
    saveHistory('Buka Dokumen Baharu');

    showToast('Selamat datang ke Lumina PhotoStudio Pro!', 'success');
  }

  window.addEventListener('DOMContentLoaded', init);
})();
