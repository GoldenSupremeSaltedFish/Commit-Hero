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
exports.DialogTrigger = exports.DialogTitle = exports.DialogPortal = exports.DialogOverlay = exports.DialogHeader = exports.DialogFooter = exports.DialogDescription = exports.DialogContent = exports.DialogClose = exports.Dialog = void 0;
const React = __importStar(require("react"));
const DialogPrimitive = __importStar(require("@radix-ui/react-dialog"));
const lucide_react_1 = require("lucide-react");
const utils_1 = require("./utils");
function Dialog({ ...props }) {
    return <DialogPrimitive.Root data-slot="dialog" {...props}/>;
}
exports.Dialog = Dialog;
function DialogTrigger({ ...props }) {
    return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props}/>;
}
exports.DialogTrigger = DialogTrigger;
function DialogPortal({ ...props }) {
    return <DialogPrimitive.Portal data-slot="dialog-portal" {...props}/>;
}
exports.DialogPortal = DialogPortal;
function DialogClose({ ...props }) {
    return <DialogPrimitive.Close data-slot="dialog-close" {...props}/>;
}
exports.DialogClose = DialogClose;
function DialogOverlay({ className, ...props }) {
    return (<DialogPrimitive.Overlay data-slot="dialog-overlay" className={(0, utils_1.cn)("data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50", className)} {...props}/>);
}
exports.DialogOverlay = DialogOverlay;
function DialogContent({ className, children, ...props }) {
    return (<DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content data-slot="dialog-content" className={(0, utils_1.cn)("bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg", className)} {...props}>
        {children}
        <DialogPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
          <lucide_react_1.XIcon />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>);
}
exports.DialogContent = DialogContent;
function DialogHeader({ className, ...props }) {
    return (<div data-slot="dialog-header" className={(0, utils_1.cn)("flex flex-col gap-2 text-center sm:text-left", className)} {...props}/>);
}
exports.DialogHeader = DialogHeader;
function DialogFooter({ className, ...props }) {
    return (<div data-slot="dialog-footer" className={(0, utils_1.cn)("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props}/>);
}
exports.DialogFooter = DialogFooter;
function DialogTitle({ className, ...props }) {
    return (<DialogPrimitive.Title data-slot="dialog-title" className={(0, utils_1.cn)("text-lg leading-none font-semibold", className)} {...props}/>);
}
exports.DialogTitle = DialogTitle;
function DialogDescription({ className, ...props }) {
    return (<DialogPrimitive.Description data-slot="dialog-description" className={(0, utils_1.cn)("text-muted-foreground text-sm", className)} {...props}/>);
}
exports.DialogDescription = DialogDescription;
//# sourceMappingURL=dialog.js.map