' ============================================
' PromptHub Windows 无窗口启动器
' 双击运行，不显示命令行窗口
' ============================================

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' 获取脚本所在目录的上级（项目根目录）
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
projectDir = fso.GetParentFolderName(scriptDir)

' 切换到项目目录
WshShell.CurrentDirectory = projectDir

' 检查端口是否已被占用
Set exec = WshShell.Exec("cmd /c netstat -ano | findstr "":3005 "" | findstr ""LISTENING""")
Do While Not exec.StdOut.AtEndOfStream
    output = exec.StdOut.ReadAll
    If Len(output) > 0 Then
        ' 已在运行，直接打开浏览器
        WshShell.Run "http://localhost:3005", 1, False
        WScript.Quit
    End If
Loop

' 检查 bun
On Error Resume Next
WshShell.Exec("bun --version")
If Err.Number = 0 Then
    runCmd = "bun"
Else
    Err.Clear
    ' 检查 npm
    WshShell.Exec("npm --version")
    If Err.Number = 0 Then
        runCmd = "npm"
    Else
        ' 都没找到，提示用户
        MsgBox "未找到 bun 或 npm，请先安装运行环境。" & vbCrLf & vbCrLf & _
               "安装 Bun（推荐）:" & vbCrLf & _
               "  powershell -c ""irm bun.sh/install.ps1 | iex""" & vbCrLf & vbCrLf & _
               "安装 Node.js:" & vbCrLf & _
               "  https://nodejs.org", _
               vbExclamation, "PromptHub"
        WScript.Quit
    End If
End If
On Error GoTo 0

' 检查依赖
If Not fso.FolderExists(projectDir & "\node_modules") Then
    ' 显示安装提示
    WshShell.Popup "首次运行，正在安装依赖，请稍候...", 3, "PromptHub"
    WshShell.Run "cmd /c " & runCmd & " install", 1, True
End If

' 检查数据库
If Not fso.FileExists(projectDir & "\db\custom.db") Then
    If Not fso.FolderExists(projectDir & "\db") Then
        fso.CreateFolder(projectDir & "\db")
    End If
    WshShell.Run "cmd /c " & runCmd & " run db:push", 1, True
    WshShell.Run "cmd /c " & runCmd & " run db:generate", 1, True
End If

' 后台启动服务器（无窗口）
WshShell.Run "cmd /c " & runCmd & " run dev", 0, False

' 等待服务启动
WScript.Sleep 2000

' 轮询检查端口
maxRetries = 30
For i = 1 To maxRetries
    Set exec = WshShell.Exec("cmd /c netstat -ano | findstr "":3005 "" | findstr ""LISTENING""")
    output = exec.StdOut.ReadAll
    If Len(output) > 0 Then
        ' 启动成功，打开浏览器
        WshShell.Run "http://localhost:3005", 1, False
        WScript.Quit
    End If
    WScript.Sleep 1000
Next

' 超时提示
MsgBox "启动超时，请手动运行：" & vbCrLf & _
       runCmd & " run dev" & vbCrLf & vbCrLf & _
       "然后访问 http://localhost:3005", _
       vbExclamation, "PromptHub"
