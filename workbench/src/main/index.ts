import { app, BrowserWindow, shell, ipcMain, dialog } from "electron";
import path from "node:path";
import { AgentSessionManager } from "./agent-session-manager";
import { ImageLibrary } from "./image-library";
import { registerIpc } from "./ipc";
import { ClaudeAgentProvider } from "./providers/claude-agent-provider";
import { CodexAgentProvider } from "./providers/codex-agent-provider";
import { GitSourceControlProvider } from "./providers/git-source-control-provider";
import { PtyManager } from "./pty-manager";
import { adoptLoginShellPath } from "./shell-environment";
import { SourceControlService } from "./source-control/source-control-provider";
import { WorkspaceFiles, WorkspaceRoots } from "./workspace-files";

import { StudioServer } from './studio-server';
import { STUDIO_ORIGIN } from '../shared/labs';
import { GameServer, validateGameCheckout } from './game-server';
import { LabAi } from './lab-ai';
const labAi = new LabAi();
const repoRoot = app.isPackaged ? null : process.env.STUDIO_REPO_ROOT || path.resolve(__dirname, '../../..');
let servingRoot: string | undefined;
let serverQueue = Promise.resolve();
// Same artwork as iOS Add to Home Screen, using its larger existing web export for the Dock.
const appIcon = app.isPackaged ? path.join(process.resourcesPath, 'icon.png') : path.resolve(__dirname, '../../../public/icons/icon-512.png');
const gameServer = new GameServer();
const studioServer = new StudioServer();
app.setName('Kaylee Gamepack Studio');
app.setPath('userData', path.join(app.getPath('appData'), 'Kaylee Gamepack Studio'));
if (process.env.WORKBENCH_USER_DATA_DIR) app.setPath("userData", process.env.WORKBENCH_USER_DATA_DIR);
const hasLock = app.requestSingleInstanceLock();
if (!hasLock) app.quit();
app.on('second-instance', () => { const window = BrowserWindow.getAllWindows()[0]; window?.restore(); window?.focus(); });
if (app.isPackaged) adoptLoginShellPath();

const ptyManager = new PtyManager();
const images = new ImageLibrary(path.join(app.getPath("userData"), "image-generator"));
const agentSessionManager = new AgentSessionManager([
  new CodexAgentProvider(),
  new ClaudeAgentProvider(),
], undefined, [
  // Image generator views ask their agent to run the image CLI once per variant and write a manifest.
  { id: "image-generator", root: images.root, allowCommands: ["codex exec"], allowWritesInCwd: true },
]);
const roots = new WorkspaceRoots();
const workspaceServices = {
  roots,
  files: new WorkspaceFiles(roots),
  sourceControl: new SourceControlService([new GitSourceControlProvider()]),
  images,
};

function createWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: "#f8f7f7",
    title: "Kaylee Gamepack Studio",
    icon: appIcon,
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 22, y: 22 },
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  window.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) void shell.openExternal(url);
    return { action: "deny" };
  });
  window.webContents.on("will-navigate", (event, url) => {
    const allowed = app.isPackaged ? STUDIO_ORIGIN : process.env.VITE_DEV_SERVER_URL;
    if (!allowed || new URL(url).origin !== new URL(allowed).origin) event.preventDefault();
  });
  window.webContents.on("destroyed", () => {
    labAi.cancelOwner(window.webContents.id);
    ptyManager.terminateForOwner(window.webContents);
    agentSessionManager.terminateForOwner(window.webContents);
  });

  if (app.isPackaged) {
    void window.loadURL(STUDIO_ORIGIN);
  } else if (process.env.VITE_DEV_SERVER_URL) {
    void window.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    void window.loadFile(path.join(__dirname, "../../dist/index.html"));
  }
  return window;
}

app.whenReady().then(async () => {
  if (!hasLock) return;
  if (app.isPackaged) {
    await studioServer.start(path.join(__dirname, "../../dist"));
  }
  app.dock?.setIcon(appIcon);
  registerIpc(ptyManager, agentSessionManager, workspaceServices);
  const trusted = (event: Electron.IpcMainInvokeEvent | Electron.IpcMainEvent) => {
    if (event.senderFrame !== event.sender.mainFrame) throw new Error('Only the studio can use native APIs');
  };
  ipcMain.handle('studio:repo-root', event => { trusted(event); if (repoRoot) roots.add(repoRoot); return repoRoot; });
  ipcMain.handle('studio:use-checkout', (event, root: unknown) => {
    trusted(event);
    const next = serverQueue.catch(() => {}).then(async () => {
      if (typeof root !== 'string') throw new Error('Choose a checkout.');
      await roots.resolve(root);
      if (!app.isPackaged) {
        if (path.resolve(root) !== repoRoot) throw new Error('Use the packaged Studio app to preview another checkout.');
        return;
      }
      if (servingRoot === root) return;
      await validateGameCheckout(root);
      await gameServer.stop();
      servingRoot = undefined;
      await gameServer.start(root, message => { servingRoot = undefined; dialog.showErrorBox('Game server stopped', message); });
      servingRoot = root;
    });
    serverQueue = next;
    return next;
  });
  ipcMain.handle('studio:tune', (event, input: unknown) => { trusted(event); return labAi.run(input, event.sender.id); });
  ipcMain.on('studio:cancel', (event, id: unknown) => { trusted(event); if (typeof id === 'string') labAi.cancel(id, event.sender.id); });
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
}).catch(error => {
  dialog.showErrorBox('Studio could not start', `${String(error)}\n\nKeep the game checkout and its npm dependencies installed. Close any other Studio using ports 5174 or 5175 and try again.`);
  app.quit();
});

app.on("window-all-closed", () => {
  app.quit();
});

app.on("before-quit", () => {
  gameServer.stop();
  studioServer.stop();
  agentSessionManager.terminateAll();
  ptyManager.terminateAll();
});
