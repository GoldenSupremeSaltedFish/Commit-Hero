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
exports.ContextMenuRadioGroup = exports.ContextMenuSubTrigger = exports.ContextMenuSubContent = exports.ContextMenuSub = exports.ContextMenuPortal = exports.ContextMenuGroup = exports.ContextMenuShortcut = exports.ContextMenuSeparator = exports.ContextMenuLabel = exports.ContextMenuRadioItem = exports.ContextMenuCheckboxItem = exports.ContextMenuItem = exports.ContextMenuContent = exports.ContextMenuTrigger = exports.ContextMenu = void 0;
const React = __importStar(require("react"));
const ContextMenuPrimitive = __importStar(require("@radix-ui/react-context-menu"));
const lucide_react_1 = require("lucide-react");
const utils_1 = require("./utils");
function ContextMenu({ ...props }) {
    return <ContextMenuPrimitive.Root data-slot="context-menu" {...props}/>;
}
exports.ContextMenu = ContextMenu;
function ContextMenuTrigger({ ...props }) {
    return (<ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" {...props}/>);
}
exports.ContextMenuTrigger = ContextMenuTrigger;
function ContextMenuGroup({ ...props }) {
    return (<ContextMenuPrimitive.Group data-slot="context-menu-group" {...props}/>);
}
exports.ContextMenuGroup = ContextMenuGroup;
function ContextMenuPortal({ ...props }) {
    return (<ContextMenuPrimitive.Portal data-slot="context-menu-portal" {...props}/>);
}
exports.ContextMenuPortal = ContextMenuPortal;
function ContextMenuSub({ ...props }) {
    return <ContextMenuPrimitive.Sub data-slot="context-menu-sub" {...props}/>;
}
exports.ContextMenuSub = ContextMenuSub;
function ContextMenuRadioGroup({ ...props }) {
    return (<ContextMenuPrimitive.RadioGroup data-slot="context-menu-radio-group" {...props}/>);
}
exports.ContextMenuRadioGroup = ContextMenuRadioGroup;
function ContextMenuSubTrigger({ className, inset, children, ...props }) {
    return (<ContextMenuPrimitive.SubTrigger data-slot="context-menu-sub-trigger" data-inset={inset} className={(0, utils_1.cn)("focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className)} {...props}>
      {children}
      <lucide_react_1.ChevronRightIcon className="ml-auto"/>
    </ContextMenuPrimitive.SubTrigger>);
}
exports.ContextMenuSubTrigger = ContextMenuSubTrigger;
function ContextMenuSubContent({ className, ...props }) {
    return (<ContextMenuPrimitive.SubContent data-slot="context-menu-sub-content" className={(0, utils_1.cn)("bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-context-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg", className)} {...props}/>);
}
exports.ContextMenuSubContent = ContextMenuSubContent;
function ContextMenuContent({ className, ...props }) {
    return (<ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content data-slot="context-menu-content" className={(0, utils_1.cn)("bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-context-menu-content-available-height) min-w-[8rem] origin-(--radix-context-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md", className)} {...props}/>
    </ContextMenuPrimitive.Portal>);
}
exports.ContextMenuContent = ContextMenuContent;
function ContextMenuItem({ className, inset, variant = "default", ...props }) {
    return (<ContextMenuPrimitive.Item data-slot="context-menu-item" data-inset={inset} data-variant={variant} className={(0, utils_1.cn)("focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className)} {...props}/>);
}
exports.ContextMenuItem = ContextMenuItem;
function ContextMenuCheckboxItem({ className, children, checked, ...props }) {
    return (<ContextMenuPrimitive.CheckboxItem data-slot="context-menu-checkbox-item" className={(0, utils_1.cn)("focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className)} checked={checked} {...props}>
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <lucide_react_1.CheckIcon className="size-4"/>
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>);
}
exports.ContextMenuCheckboxItem = ContextMenuCheckboxItem;
function ContextMenuRadioItem({ className, children, ...props }) {
    return (<ContextMenuPrimitive.RadioItem data-slot="context-menu-radio-item" className={(0, utils_1.cn)("focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className)} {...props}>
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <lucide_react_1.CircleIcon className="size-2 fill-current"/>
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>);
}
exports.ContextMenuRadioItem = ContextMenuRadioItem;
function ContextMenuLabel({ className, inset, ...props }) {
    return (<ContextMenuPrimitive.Label data-slot="context-menu-label" data-inset={inset} className={(0, utils_1.cn)("text-foreground px-2 py-1.5 text-sm font-medium data-[inset]:pl-8", className)} {...props}/>);
}
exports.ContextMenuLabel = ContextMenuLabel;
function ContextMenuSeparator({ className, ...props }) {
    return (<ContextMenuPrimitive.Separator data-slot="context-menu-separator" className={(0, utils_1.cn)("bg-border -mx-1 my-1 h-px", className)} {...props}/>);
}
exports.ContextMenuSeparator = ContextMenuSeparator;
function ContextMenuShortcut({ className, ...props }) {
    return (<span data-slot="context-menu-shortcut" className={(0, utils_1.cn)("text-muted-foreground ml-auto text-xs tracking-widest", className)} {...props}/>);
}
exports.ContextMenuShortcut = ContextMenuShortcut;
//# sourceMappingURL=context-menu.js.map