"use client";
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResizableHandle = exports.ResizablePanel = exports.ResizablePanelGroup = void 0;
const React = __importStar(require("react"));
const lucide_react_1 = require("lucide-react");
const ResizablePrimitive = __importStar(require("react-resizable-panels"));
const utils_1 = require("./utils");
function ResizablePanelGroup({ className, ...props }) {
    return (<ResizablePrimitive.PanelGroup data-slot="resizable-panel-group" className={(0, utils_1.cn)("flex h-full w-full data-[panel-group-direction=vertical]:flex-col", className)} {...props}/>);
}
exports.ResizablePanelGroup = ResizablePanelGroup;
function ResizablePanel({ ...props }) {
    return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props}/>;
}
exports.ResizablePanel = ResizablePanel;
function ResizableHandle({ withHandle, className, ...props }) {
    return (<ResizablePrimitive.PanelResizeHandle data-slot="resizable-handle" className={(0, utils_1.cn)("bg-border focus-visible:ring-ring relative flex w-px items-center justify-center after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-hidden data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90", className)} {...props}>
      {withHandle && (<div className="bg-border z-10 flex h-4 w-3 items-center justify-center rounded-xs border">
          <lucide_react_1.GripVerticalIcon className="size-2.5"/>
        </div>)}
    </ResizablePrimitive.PanelResizeHandle>);
}
exports.ResizableHandle = ResizableHandle;
//# sourceMappingURL=resizable.js.map