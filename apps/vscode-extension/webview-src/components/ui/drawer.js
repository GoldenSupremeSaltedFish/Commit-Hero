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
exports.DrawerDescription = exports.DrawerTitle = exports.DrawerFooter = exports.DrawerHeader = exports.DrawerContent = exports.DrawerClose = exports.DrawerTrigger = exports.DrawerOverlay = exports.DrawerPortal = exports.Drawer = void 0;
const React = __importStar(require("react"));
const vaul_1 = require("vaul");
const utils_1 = require("./utils");
function Drawer({ ...props }) {
    return <vaul_1.Drawer.Root data-slot="drawer" {...props}/>;
}
exports.Drawer = Drawer;
function DrawerTrigger({ ...props }) {
    return <vaul_1.Drawer.Trigger data-slot="drawer-trigger" {...props}/>;
}
exports.DrawerTrigger = DrawerTrigger;
function DrawerPortal({ ...props }) {
    return <vaul_1.Drawer.Portal data-slot="drawer-portal" {...props}/>;
}
exports.DrawerPortal = DrawerPortal;
function DrawerClose({ ...props }) {
    return <vaul_1.Drawer.Close data-slot="drawer-close" {...props}/>;
}
exports.DrawerClose = DrawerClose;
function DrawerOverlay({ className, ...props }) {
    return (<vaul_1.Drawer.Overlay data-slot="drawer-overlay" className={(0, utils_1.cn)("data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50", className)} {...props}/>);
}
exports.DrawerOverlay = DrawerOverlay;
function DrawerContent({ className, children, ...props }) {
    return (<DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay />
      <vaul_1.Drawer.Content data-slot="drawer-content" className={(0, utils_1.cn)("group/drawer-content bg-background fixed z-50 flex h-auto flex-col", "data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-lg data-[vaul-drawer-direction=top]:border-b", "data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-lg data-[vaul-drawer-direction=bottom]:border-t", "data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:sm:max-w-sm", "data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=left]:sm:max-w-sm", className)} {...props}>
        <div className="bg-muted mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block"/>
        {children}
      </vaul_1.Drawer.Content>
    </DrawerPortal>);
}
exports.DrawerContent = DrawerContent;
function DrawerHeader({ className, ...props }) {
    return (<div data-slot="drawer-header" className={(0, utils_1.cn)("flex flex-col gap-1.5 p-4", className)} {...props}/>);
}
exports.DrawerHeader = DrawerHeader;
function DrawerFooter({ className, ...props }) {
    return (<div data-slot="drawer-footer" className={(0, utils_1.cn)("mt-auto flex flex-col gap-2 p-4", className)} {...props}/>);
}
exports.DrawerFooter = DrawerFooter;
function DrawerTitle({ className, ...props }) {
    return (<vaul_1.Drawer.Title data-slot="drawer-title" className={(0, utils_1.cn)("text-foreground font-semibold", className)} {...props}/>);
}
exports.DrawerTitle = DrawerTitle;
function DrawerDescription({ className, ...props }) {
    return (<vaul_1.Drawer.Description data-slot="drawer-description" className={(0, utils_1.cn)("text-muted-foreground text-sm", className)} {...props}/>);
}
exports.DrawerDescription = DrawerDescription;
//# sourceMappingURL=drawer.js.map