# Debugging Troubleshooting Guide

## 🚨 "Unable to attach to browser" Error Solutions

### Quick Fixes

#### 1. Try the Simple Configurations First
Use these simplified debug configurations:
- **🎯 Debug Form (Simple)**
- **🔍 Debug Search (Simple)** 
- **💬 Debug Chat (Simple)**

These have minimal settings and should work in most cases.

#### 2. Check Chrome Installation
Ensure Chrome is installed and accessible. VS Code needs to find Chrome to launch it.

```bash
# Check if Chrome is in PATH (Windows)
where chrome
# or
where google-chrome

# Check Chrome version
chrome --version
```

#### 3. Close All Chrome Instances
Before debugging, close all Chrome windows and processes:

**Windows:**
```bash
taskkill /f /im chrome.exe
```

**Alternative:** Use Task Manager to end all Chrome processes.

### Detailed Solutions

#### Solution 1: Reset Chrome Debug Profile

1. Delete the debug profile directory:
   ```bash
   rmdir /s ".vscode\chrome-debug-profile"
   ```

2. Try debugging again - VS Code will create a fresh profile.

#### Solution 2: Use Different Port

If port 9222 is busy, VS Code will auto-increment, but you can manually specify:

```json
{
    "port": 9224,
    // ... other settings
}
```

#### Solution 3: Check Windows Firewall

Windows Firewall might block the debugging connection:

1. Open Windows Defender Firewall
2. Click "Allow an app through firewall"
3. Add Chrome and VS Code if not present
4. Ensure both Private and Public are checked

#### Solution 4: Run VS Code as Administrator

Sometimes permissions issues prevent browser attachment:

1. Close VS Code
2. Right-click VS Code icon
3. Select "Run as administrator"
4. Try debugging again

#### Solution 5: Use Live Server Method

Instead of file:// protocol, use Live Server:

1. Install Live Server extension
2. Run task: **🚀 Start Live Server**
3. Use configuration: **🚀 Launch with Live Server**

#### Solution 6: Manual Chrome Launch

If VS Code can't launch Chrome, launch manually:

1. Start Chrome with debugging enabled:
   ```bash
   chrome --remote-debugging-port=9222 --user-data-dir=".vscode/chrome-debug-profile"
   ```

2. Open your HTML file in that Chrome instance
3. Use "Attach" configuration instead of "Launch"

### Alternative Debugging Methods

#### Method 1: Browser DevTools Only

1. Open your HTML file in Chrome
2. Press F12 to open DevTools
3. Use Console tab for debugging
4. Add `debugger;` statements in your code

#### Method 2: Simple Console Logging

Add debugging logs to your code:

```javascript
// Add to your reactive streams
const stream = createStream('#input').pipe(
    tap(value => console.log('🔍 Input value:', value)),
    debounceTime(300),
    tap(value => console.log('⏱️ After debounce:', value)),
    map(value => value.toUpperCase()),
    tap(value => console.log('🔄 After transform:', value))
);
```

#### Method 3: Use Live Server

1. Install Live Server extension
2. Right-click on HTML file
3. Select "Open with Live Server"
4. Use browser DevTools for debugging

### Common Error Messages

#### "Cannot connect to runtime process"
- **Cause:** Chrome not launching properly
- **Solution:** Try Simple configurations or manual Chrome launch

#### "Timeout waiting for debugger connection"
- **Cause:** Firewall or antivirus blocking connection
- **Solution:** Check firewall settings, disable antivirus temporarily

#### "Port 9222 is already in use"
- **Cause:** Another Chrome debug session running
- **Solution:** Close all Chrome instances, try different port

#### "Unable to open devtools socket"
- **Cause:** Chrome security restrictions
- **Solution:** Use --disable-web-security flag (already included)

### Debug Configuration Testing

Test configurations in this order:

1. **🎯 Debug Form (Simple)** - Minimal configuration
2. **🎯 Debug Form Validation Example** - Full configuration
3. **🚀 Launch with Live Server** - Server-based debugging

### VS Code Extension Requirements

Ensure these extensions are installed:
- **Debugger for Chrome** (or built-in JS debugger)
- **Live Server** (for server-based debugging)

Check in Extensions panel (Ctrl+Shift+X):
```
ms-vscode.vscode-js-debug
ritwickdey.liveserver
```

### Environment Verification

Run this checklist:

```bash
# 1. Check Node.js version
node --version

# 2. Check Chrome installation
chrome --version

# 3. Check VS Code version
code --version

# 4. Verify workspace
echo %cd%
# Should show: C:\Users\mayan\Desktop\RxHtmx
```

### Last Resort: Reset Everything

If nothing works:

1. **Close VS Code and Chrome**
2. **Delete debug profile:**
   ```bash
   rmdir /s ".vscode\chrome-debug-profile"
   ```
3. **Restart VS Code**
4. **Try Simple configuration first**

### Working Alternative

If VS Code debugging continues to fail, use this workflow:

1. **Open HTML file in Chrome**
2. **Open DevTools (F12)**
3. **Add breakpoints in Sources tab**
4. **Use Console for logging**
5. **Refresh page to hit breakpoints**

This gives you full debugging capability without VS Code integration.

### Get Help

If you're still having issues:

1. Check VS Code Output panel (View → Output → Debugger)
2. Look for specific error messages
3. Try the Simple configurations first
4. Use browser DevTools as fallback

The Simple configurations should work in 99% of cases!
