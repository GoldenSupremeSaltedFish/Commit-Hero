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
exports.MenubarSubContent = exports.MenubarSubTrigger = exports.MenubarSub = exports.MenubarRadioItem = exports.MenubarRadioGroup = exports.MenubarCheckboxItem = exports.MenubarShortcut = exports.MenubarItem = exports.MenubarLabel = exports.MenubarSeparator = exports.MenubarGroup = exports.MenubarContent = exports.MenubarTrigger = exports.MenubarMenu = exports.MenubarPortal = exports.Menubar = void 0;
const React = __importStar(require("react"));
const MenubarPrimitive = __importStar(require("@radix-ui/react-menubar"));
const lucide_react_1 = require("lucide-react");
const utils_1 = require("./utils");
function Menubar({ className, ...props }) {
    return (<MenubarPrimitive.Root data-slot="menubar" className={(0, utils_1.cn)("bg-background flex h-9 items-center gap-1 rounded-md border p-1 shadow-xs", className)} {...props}/>);
}
exports.Menubar = Menubar;
function MenubarMenu({ ...props }) {
    return <MenubarPrimitive.Menu data-slot="menubar-menu" {...props}/>;
}
exports.MenubarMenu = MenubarMenu;
function MenubarGroup({ ...props }) {
    return <MenubarPrimitive.Group data-slot="menubar-group" {...props}/>;
}
exports.MenubarGroup = MenubarGroup;
function MenubarPortal({ ...props }) {
    return <MenubarPrimitive.Portal data-slot="menubar-portal" {...props}/>;
}
exports.MenubarPortal = MenubarPortal;
function MenubarRadioGroup({ ...props }) {
    return (<MenubarPrimitive.RadioGroup data-slot="menubar-radio-group" {...props}/>);
}
exports.MenubarRadioGroup = MenubarRadioGroup;
function MenubarTrigger({ className, ...props }) {
    return (<MenubarPrimitive.Trigger data-slot="menubar-trigger" className={(0, utils_1.cn)("focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex items-center rounded-sm px-2 py-1 text-sm font-medium outline-hidden select-none", className)} {...props}/>);
}
exports.MenubarTrigger = MenubarTrigger;
function MenubarContent({ className, align = "start", alignOffset = -4, sideOffset = 8, ...props }) {
    return (<MenubarPortal>
      <MenubarPrimitive.Content data-slot="menubar-content" align={align} alignOffset={alignOffset} sideOffset={sideOffset} className={(0, utils_1.cn)("bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[12rem] origin-(--radix-menubar-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-md", className)} {...props}/>
    </MenubarPortal>);
}
exports.MenubarContent = MenubarContent;
function MenubarItem({ className, inset, variant = "default", ...props }) {
    return (<MenubarPrimitive.Item data-slot="menubar-item" data-inset={inset} data-variant={variant} className={(0, utils_1.cn)("focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className)} {...props}/>);
}
exports.MenubarItem = MenubarItem;
function MenubarCheckboxItem({ className, children, checked, ...props }) {
    return (<MenubarPrimitive.CheckboxItem data-slot="menubar-checkbox-item" className={(0, utils_1.cn)("focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-xs py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className)} checked={checked} {...props}>
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          <lucide_react_1.CheckIcon className="size-4"/>
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.CheckboxItem>);
}
exports.MenubarCheckboxItem = MenubarCheckboxItem;
function MenubarRadioItem({ className, children, ...props }) {
    return (<MenubarPrimitive.RadioItem data-slot="menubar-radio-item" className={(0, utils_1.cn)("focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-xs py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className)} {...props}>
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          <lucide_react_1.CircleIcon className="size-2 fill-current"/>
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.RadioItem>);
}
exports.MenubarRadioItem = MenubarRadioItem;
function MenubarLabel({ className, inset, ...props }) {
    return (<MenubarPrimitive.Label data-slot="menubar-label" data-inset={inset} className={(0, utils_1.cn)("px-2 py-1.5 text-sm font-medium data-[inset]:pl-8", className)} {...props}/>);
}
exports.MenubarLabel = MenubarLabel;
function MenubarSeparator({ className, ...props }) {
    return (<MenubarPrimitive.Separator data-slot="menubar-separator" className={(0, utils_1.cn)("bg-border -mx-1 my-1 h-px", className)} {...props}/>);
}
exports.MenubarSeparator = MenubarSeparator;
function MenubarShortcut({ className, ...props }) {
    return (<span data-slot="menubar-shortcut" className={(0, utils_1.cn)("text-muted-foreground ml-auto text-xs tracking-widest", className)} {...props}/>);
}
exports.MenubarShortcut = MenubarShortcut;
function MenubarSub({ ...props }) {
    return <MenubarPrimitive.Sub data-slot="menubar-sub" {...props}/>;
}
exports.MenubarSub = MenubarSub;
function MenubarSubTrigger({ className, inset, children, ...props }) {
    return (<MenubarPrimitive.SubTrigger data-slot="menubar-sub-trigger" data-inset={inset} className={(0, utils_1.cn)("focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none data-[inset]:pl-8", className)} {...props}>
      {children}
      <lucide_react_1.ChevronRightIcon className="ml-auto h-4 w-4"/>
    </MenubarPrimitive.SubTrigger>);
}
exports.MenubarSubTrigger = MenubarSubTrigger;
function MenubarSubContent({ className, ...props }) {
    return (<MenubarPrimitive.SubContent data-slot="menubar-sub-content" className={(0, utils_1.cn)("bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-menubar-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg", className)} {...props}/>);
}
exports.MenubarSubContent = MenubarSubContent;
//# sourceMappingURL=menubar.js.map