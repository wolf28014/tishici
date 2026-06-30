const { app, BrowserWindow, Menu, shell } = require('electron')
const path = require('path')
const { spawn } = require('child_process')

let mainWindow = null
let nextProcess = null
const PORT = 3005

// ============================================
// 启动 Next.js 服务器
// ============================================
function startNextServer() {
  // 获取项目根目录（electron 的上级）
  const projectRoot = path.join(__dirname, '..')

  // 检查使用 bun 还是 npm
  let cmd, args
  try {
    require('child_process').execSync('bun --version', { stdio: 'ignore' })
    cmd = 'bun'
    args = ['run', 'dev']
  } catch {
    cmd = 'npm'
    args = ['run', 'dev']
  }

  console.log(`启动 Next.js: ${cmd} ${args.join(' ')}`)
  console.log(`项目目录: ${projectRoot}`)

  nextProcess = spawn(cmd, args, {
    cwd: projectRoot,
    stdio: 'pipe',
    shell: true,
    env: {
      ...process.env,
      PORT: String(PORT),
      NODE_ENV: 'development',
    },
  })

  nextProcess.stdout.on('data', (data) => {
    console.log(`[Next.js] ${data.toString().trim()}`)
  })

  nextProcess.stderr.on('data', (data) => {
    console.error(`[Next.js Error] ${data.toString().trim()}`)
  })

  nextProcess.on('exit', (code) => {
    console.log(`Next.js 进程退出，代码: ${code}`)
  })
}

// ============================================
// 等待服务器就绪
// ============================================
function waitForServer(maxRetries = 60) {
  return new Promise((resolve, reject) => {
    let retries = 0

    const check = () => {
      const http = require('http')
      const req = http.get(`http://localhost:${PORT}`, (res) => {
        if (res.statusCode === 200 || res.statusCode === 302) {
          resolve()
        } else {
          retry()
        }
      })

      req.on('error', () => retry())
      req.setTimeout(2000, () => {
        req.destroy()
        retry()
      })
    }

    const retry = () => {
      retries++
      if (retries >= maxRetries) {
        reject(new Error('服务器启动超时'))
        return
      }
      setTimeout(check, 1000)
    }

    check()
  })
}

// ============================================
// 创建窗口
// ============================================
async function createWindow() {
  // 显示加载窗口
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'PromptHub - AI 提示词库',
    icon: path.join(__dirname, 'icon.ico'),
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  // 等待服务器就绪后加载页面
  try {
    await waitForServer()
    mainWindow.loadURL(`http://localhost:${PORT}`)
    mainWindow.show()

    // 开发模式打开 DevTools
    // mainWindow.webContents.openDevTools()
  } catch (err) {
    mainWindow.loadURL(`data:text/html,<html><body style="font-family:sans-serif;padding:40px"><h2>启动失败</h2><p>${err.message}</p><p>请检查 Next.js 是否正确安装。</p></body></html>`)
    mainWindow.show()
  }

  // 外部链接在浏览器中打开
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // 设置菜单
  const template = [
    {
      label: '文件',
      submenu: [
        { label: '刷新', accelerator: 'CmdOrCtrl+R', click: () => mainWindow?.reload() },
        { type: 'separator' },
        { label: '退出', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() },
      ],
    },
    {
      label: '视图',
      submenu: [
        { role: 'reload', label: '重新加载' },
        { role: 'togglefullscreen', label: '全屏' },
        { role: 'zoomIn', label: '放大' },
        { role: 'zoomOut', label: '缩小' },
        { role: 'resetZoom', label: '重置缩放' },
      ],
    },
    {
      label: '帮助',
      submenu: [
        { label: 'GitHub 仓库', click: () => shell.openExternal('https://github.com/wolf28014/tishici') },
        { type: 'separator' },
        { label: '关于', click: () => {
          const { dialog } = require('electron')
          dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: '关于 PromptHub',
            message: 'PromptHub - AI 提示词库',
            detail: '版本: 1.0.0\n管理、分类、复用你的 AI 提示词\nhttps://github.com/wolf28014/tishici',
          })
        }},
      ],
    },
  ]

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

// ============================================
// 应用生命周期
// ============================================
app.whenReady().then(async () => {
  // 先启动 Next.js 服务器
  startNextServer()

  // 创建窗口
  await createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  // 关闭窗口时停止服务器
  if (nextProcess) {
    nextProcess.kill()
    nextProcess = null
  }
  app.quit()
})

app.on('before-quit', () => {
  if (nextProcess) {
    nextProcess.kill()
    nextProcess = null
  }
})

// 处理进程退出
process.on('exit', () => {
  if (nextProcess) {
    nextProcess.kill()
  }
})

process.on('SIGINT', () => {
  if (nextProcess) {
    nextProcess.kill()
  }
  process.exit()
})

process.on('SIGTERM', () => {
  if (nextProcess) {
    nextProcess.kill()
  }
  process.exit()
})
