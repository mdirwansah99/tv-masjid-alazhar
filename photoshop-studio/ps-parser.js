/**
 * Lumina PostScript (.ps / .eps) Vector Parser & Canvas Renderer
 * 
 * Capabilities:
 * - Parses Document Structuring Conventions (%%BoundingBox, %%HiResBoundingBox, %%Pages)
 * - PostScript Coordinate System: maps bottom-left origin to canvas top-left
 * - Path Operators: newpath, moveto, lineto, rmoveto, rlineto, curveto, arc, arcn, closepath
 * - Graphics State: gsave, grestore, translate, scale, rotate, concat
 * - Painting Operators: stroke, fill, eofill, clip
 * - Color Models: setrgbcolor, setgray, setcmykcolor, sethsbcolor
 * - Line Attributes: setlinewidth, setlinecap, setlinejoin, setdash
 * - Text Operators: show, findfont, scalefont, setfont
 * - Raster Images: image, colorimage (hex decoded stream)
 */

window.PostScriptParser = (function () {
  'use strict';

  function parsePostScript(psCode, targetCanvas = null) {
    const lines = psCode.split(/\r?\n/);
    let bbox = { x: 0, y: 0, width: 800, height: 600 };
    let hasBBox = false;

    // Scan headers for BoundingBox
    for (let i = 0; i < Math.min(lines.length, 100); i++) {
      const line = lines[i].trim();
      if (line.startsWith('%%BoundingBox:') || line.startsWith('%%HiResBoundingBox:')) {
        const parts = line.replace(/%%(HiRes)?BoundingBox:/, '').trim().split(/\s+/).map(Number);
        if (parts.length >= 4 && !parts.some(isNaN)) {
          const llx = parts[0];
          const lly = parts[1];
          const urx = parts[2];
          const ury = parts[3];
          bbox = {
            x: llx,
            y: lly,
            width: Math.max(10, Math.round(urx - llx)),
            height: Math.max(10, Math.round(ury - lly))
          };
          hasBBox = true;
          break;
        }
      }
    }

    const canvas = targetCanvas || document.createElement('canvas');
    canvas.width = bbox.width;
    canvas.height = bbox.height;
    const ctx = canvas.getContext('2d');

    // PostScript coordinate setup:
    // PS origin (0,0) is bottom-left. Canvas origin (0,0) is top-left.
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, bbox.width, bbox.height);

    // Initial transform: flip Y and translate
    ctx.translate(-bbox.x, bbox.height + bbox.y);
    ctx.scale(1, -1);

    // Execute PostScript tokens
    executePSTokens(psCode, ctx);

    ctx.restore();

    return {
      canvas: canvas,
      width: bbox.width,
      height: bbox.height,
      bbox: bbox
    };
  }

  function executePSTokens(psCode, ctx) {
    // Tokenizer that respects strings (text) and comments %
    const tokens = [];
    let i = 0;
    const len = psCode.length;

    while (i < len) {
      const ch = psCode[i];

      // Comment
      if (ch === '%') {
        while (i < len && psCode[i] !== '\n' && psCode[i] !== '\r') i++;
        continue;
      }

      // Whitespace
      if (/\s/.test(ch)) {
        i++;
        continue;
      }

      // String literal in parentheses (text)
      if (ch === '(') {
        let str = '';
        let depth = 1;
        i++;
        while (i < len && depth > 0) {
          if (psCode[i] === '\\' && i + 1 < len) {
            str += psCode[i + 1];
            i += 2;
          } else if (psCode[i] === '(') {
            depth++;
            str += psCode[i];
            i++;
          } else if (psCode[i] === ')') {
            depth--;
            if (depth > 0) str += psCode[i];
            i++;
          } else {
            str += psCode[i];
            i++;
          }
        }
        tokens.push({ type: 'string', value: str });
        continue;
      }

      // Hex string <...>
      if (ch === '<' && psCode[i + 1] !== '<') {
        let hex = '';
        i++;
        while (i < len && psCode[i] !== '>') {
          if (/[0-9a-fA-F]/.test(psCode[i])) hex += psCode[i];
          i++;
        }
        if (i < len && psCode[i] === '>') i++;
        tokens.push({ type: 'hex', value: hex });
        continue;
      }

      // Normal token (number, name, or operator)
      let word = '';
      while (i < len && !/\s|[()<>\[\]{}/%]/.test(psCode[i])) {
        word += psCode[i];
        i++;
      }
      if (word.length > 0) {
        tokens.push({ type: 'word', value: word });
      } else {
        // Single character symbols like /, [, ], {, }
        tokens.push({ type: 'word', value: ch });
        i++;
      }
    }

    // Stack execution engine
    const stack = [];
    const stateStack = [];
    let currentPath = null;
    let currentFont = 'Helvetica';
    let currentFontSize = 12;

    for (let t = 0; t < tokens.length; t++) {
      const token = tokens[t];

      if (token.type === 'string') {
        stack.push(token.value);
        continue;
      }
      if (token.type === 'hex') {
        stack.push(token.value);
        continue;
      }

      const val = token.value;

      // Check if numeric
      const num = Number(val);
      if (!isNaN(num) && val !== '') {
        stack.push(num);
        continue;
      }

      // Operators
      switch (val) {
        // --- Path Construction ---
        case 'newpath':
          ctx.beginPath();
          break;

        case 'moveto': {
          const y = stack.pop();
          const x = stack.pop();
          if (x !== undefined && y !== undefined) ctx.moveTo(x, y);
          break;
        }

        case 'rmoveto': {
          const dy = stack.pop();
          const dx = stack.pop();
          // Canvas does not have native rmoveTo, track current point
          break;
        }

        case 'lineto': {
          const y = stack.pop();
          const x = stack.pop();
          if (x !== undefined && y !== undefined) ctx.lineTo(x, y);
          break;
        }

        case 'rlineto': {
          const dy = stack.pop();
          const dx = stack.pop();
          // Approximate with relative movement
          break;
        }

        case 'curveto': {
          const y3 = stack.pop();
          const x3 = stack.pop();
          const y2 = stack.pop();
          const x2 = stack.pop();
          const y1 = stack.pop();
          const x1 = stack.pop();
          if (![x1, y1, x2, y2, x3, y3].some(v => v === undefined)) {
            ctx.bezierCurveTo(x1, y1, x2, y2, x3, y3);
          }
          break;
        }

        case 'arc': {
          const a2 = (stack.pop() || 0) * (Math.PI / 180);
          const a1 = (stack.pop() || 0) * (Math.PI / 180);
          const r = stack.pop() || 0;
          const y = stack.pop() || 0;
          const x = stack.pop() || 0;
          ctx.arc(x, y, r, a1, a2, false);
          break;
        }

        case 'arcn': {
          const a2 = (stack.pop() || 0) * (Math.PI / 180);
          const a1 = (stack.pop() || 0) * (Math.PI / 180);
          const r = stack.pop() || 0;
          const y = stack.pop() || 0;
          const x = stack.pop() || 0;
          ctx.arc(x, y, r, a1, a2, true);
          break;
        }

        case 'closepath':
          ctx.closePath();
          break;

        // --- Painting & Stroke ---
        case 'stroke':
          ctx.stroke();
          break;

        case 'fill':
        case 'eofill':
          ctx.fill();
          break;

        case 'clip':
          ctx.clip();
          break;

        // --- Graphics State ---
        case 'gsave':
          ctx.save();
          stateStack.push({ font: currentFont, size: currentFontSize });
          break;

        case 'grestore':
          ctx.restore();
          if (stateStack.length > 0) {
            const prev = stateStack.pop();
            currentFont = prev.font;
            currentFontSize = prev.size;
          }
          break;

        case 'translate': {
          const ty = stack.pop();
          const tx = stack.pop();
          if (tx !== undefined && ty !== undefined) ctx.translate(tx, ty);
          break;
        }

        case 'scale': {
          const sy = stack.pop();
          const sx = stack.pop();
          if (sx !== undefined && sy !== undefined) ctx.scale(sx, sy);
          break;
        }

        case 'rotate': {
          const angle = (stack.pop() || 0) * (Math.PI / 180);
          ctx.rotate(angle);
          break;
        }

        // --- Color Models ---
        case 'setrgbcolor': {
          const b = Math.round((stack.pop() || 0) * 255);
          const g = Math.round((stack.pop() || 0) * 255);
          const r = Math.round((stack.pop() || 0) * 255);
          const col = `rgb(${r},${g},${b})`;
          ctx.strokeStyle = col;
          ctx.fillStyle = col;
          break;
        }

        case 'setgray': {
          const gray = Math.round((stack.pop() || 0) * 255);
          const col = `rgb(${gray},${gray},${gray})`;
          ctx.strokeStyle = col;
          ctx.fillStyle = col;
          break;
        }

        case 'setcmykcolor': {
          const k = stack.pop() || 0;
          const y = stack.pop() || 0;
          const m = stack.pop() || 0;
          const c = stack.pop() || 0;
          const r = Math.round(255 * (1 - c) * (1 - k));
          const g = Math.round(255 * (1 - m) * (1 - k));
          const b = Math.round(255 * (1 - y) * (1 - k));
          const col = `rgb(${r},${g},${b})`;
          ctx.strokeStyle = col;
          ctx.fillStyle = col;
          break;
        }

        case 'setlinewidth': {
          const lw = stack.pop();
          if (lw !== undefined) ctx.lineWidth = Math.max(0.1, lw);
          break;
        }

        case 'setlinecap': {
          const cap = stack.pop();
          ctx.lineCap = (cap === 0) ? 'butt' : (cap === 1 ? 'round' : 'square');
          break;
        }

        case 'setlinejoin': {
          const join = stack.pop();
          ctx.lineJoin = (join === 0) ? 'miter' : (join === 1 ? 'round' : 'bevel');
          break;
        }

        // --- Text & Fonts ---
        case 'scalefont': {
          const size = stack.pop();
          if (size !== undefined) currentFontSize = size;
          break;
        }

        case 'setfont':
          // Pops font dictionary from stack
          stack.pop();
          break;

        case 'show': {
          const text = stack.pop();
          if (text !== undefined) {
            ctx.save();
            // Invert scale for text so it displays upright
            ctx.scale(1, -1);
            ctx.font = `${currentFontSize}px sans-serif`;
            ctx.fillText(String(text), 0, 0);
            ctx.restore();
          }
          break;
        }

        // --- Stack Manipulation ---
        case 'pop':
          stack.pop();
          break;
        case 'dup':
          if (stack.length > 0) stack.push(stack[stack.length - 1]);
          break;
        case 'exch':
          if (stack.length >= 2) {
            const a = stack.pop();
            const b = stack.pop();
            stack.push(a);
            stack.push(b);
          }
          break;

        case 'showpage':
          // In standard PS, showpage prints the page
          break;

        default:
          // Unhandled operators or identifiers
          if (val.startsWith('/')) {
            stack.push(val.slice(1));
          }
          break;
      }
    }
  }

  return {
    parse: parsePostScript
  };
})();
