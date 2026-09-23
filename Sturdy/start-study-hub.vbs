Option Explicit

Dim shell, fso, folder, envPath, nodePath, serverPath, cmd
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

folder = fso.GetParentFolderName(WScript.ScriptFullName)
envPath = fso.BuildPath(folder, ".env")
serverPath = fso.BuildPath(folder, "server.js")

If Not fso.FileExists(serverPath) Then
  MsgBox "Study Hub server.js was not found in this folder." & vbCrLf & vbCrLf & folder, vbCritical, "Study Hub"
  WScript.Quit 1
End If

If Not fso.FileExists(envPath) Then
  MsgBox "No .env file was found." & vbCrLf & vbCrLf & _
         "For AI features, create .env from .env.example and add your API key." & vbCrLf & _
         "You can still open index.html without the server.", vbExclamation, "Study Hub"
  WScript.Quit 1
End If

nodePath = "node.exe"
cmd = "cmd.exe /c cd /d """ & folder & """ && " & nodePath & " server.js"
shell.Run cmd, 1, False

WScript.Sleep 1500
shell.Run "http://127.0.0.1:3000", 1, False
