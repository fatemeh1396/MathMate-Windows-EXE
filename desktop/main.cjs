'use strict';

const { app, BrowserWindow, shell } = require('electron');
const path = require('node:path');

const APP_ID = 'com.mathmate.desktop';
app.setAppUserModelId(APP_ID);

function openExternalSafely(url) {
  if (typeof url === 'string' && /^https?:\/\//i.test(url)) {
    shell.openExternal(url).catch((error) => {
      console.error('Could not open external link:', error);
    });
  }
}

function createWindow() {
  const iconPath = path.join(__dirname, 'mathmate.ico');
  const indexPath = path.join(__dirname, 'site', 'index.html');

  const window = new BrowserWindow({
    width: 1180,
    height: 800,
    minWidth: 760,
    minHeight: 560,
    title: 'MathMate',
    autoHideMenuBar: true,
    backgroundColor: '#F8FAFC',
    icon: iconPath,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false
    }
  });

  // Links to websites open in the user's default browser, not inside the app.
  window.webContents.setWindowOpenHandler(({ url }) => {
    openExternalSafely(url);
    return { action: 'deny' };
  });

  window.webContents.on('will-navigate', (event, url) => {
    if (/^https?:\/\//i.test(url)) {
      event.preventDefault();
      openExternalSafely(url);
    }
  });

  window.loadFile(indexPath);
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
