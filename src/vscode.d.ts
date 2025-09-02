// VS Code API 类型声明
declare global {
  interface Window {
    vscodeAPI?: {
      postMessage: (message: any) => void;
      getState: () => any;
      setState: (state: any) => void;
    };
    handleVSCodeMessage?: (message: any) => void;
  }
}

export {};
