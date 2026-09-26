const { app, BrowserWindow, ipcMain, screen } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

let win;
let nativeMac;

function applyCaptureExclusion() {
  if (process.platform !== 'darwin' || !win || win.isDestroyed()) return false;
  try {
    nativeMac ??= require('./build/Release/mac_window.node');
    const ok = nativeMac.setSharingNone(win.getNativeWindowHandle());
    console.log('macOS capture exclusion:', ok ? 'enabled' : 'failed');
    return ok;
  } catch (err) {
    console.warn('Native macOS exclusion unavailable:', err.message);
    return false;
  }
}

function createWindow() {
  const display = screen.getPrimaryDisplay();
  const { width, height } = display.workAreaSize;
  win = new BrowserWindow({
    width: 620, height: 460,
    x: Math.round((width - 620) / 2), y: Math.round((height - 460) / 2),
    frame: false, transparent: true, alwaysOnTop: true,
    skipTaskbar: true, resizable: true, show: false,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false }
  });
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  win.once('ready-to-show', () => { win.show(); setTimeout(applyCaptureExclusion, 100); });
}

function runPython(mode, prompt) {
  return new Promise((resolve, reject) => {
    const script = path.join(__dirname, 'python', 'llm.py');
    const child = spawn(process.env.PYTHON || 'python3', [script, mode, prompt], { cwd: __dirname, env: process.env });
    let out = '', err = '';
    child.stdout.on('data', d => out += d);
    child.stderr.on('data', d => err += d);
    child.on('error', reject);
    child.on('close', code => code === 0 ? resolve(out.trim()) : reject(new Error(err || `Python exited ${code}`)));
  });
}

app.whenReady().then(createWindow);
ipcMain.handle('ask-text', (_event, prompt) => runPython('text', prompt));
ipcMain.handle('ask-screen', (_event, prompt) => runPython('screen', prompt || 'Describe and analyze this screenshot.'));
ipcMain.handle('hide-window', () => win?.hide());
ipcMain.handle('show-window', () => { win?.show(); setTimeout(applyCaptureExclusion, 50); });
app.on('window-all-closed', () => app.quit());
