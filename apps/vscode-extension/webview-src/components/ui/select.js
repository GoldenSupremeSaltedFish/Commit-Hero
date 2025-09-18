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
exports.SelectValue = exports.SelectTrigger = exports.SelectSeparator = exports.SelectScrollUpButton = exports.SelectScrollDownButton = exports.SelectLabel = exports.SelectItem = exports.SelectGroup = exports.SelectContent = exports.Select = void 0;
const React = __importStar(require("react"));
const SelectPrimitive = __importStar(require("@radix-ui/react-select"));
const lucide_react_1 = require("lucide-react");
const utils_1 = require("./utils");
function Select({ ...props }) {
    return <SelectPrimitive.Root data-slot="select" {...props}/>;
}
exports.Select = Select;
function SelectGroup({ ...props }) {
    return <SelectPrimitive.Group data-slot="select-group" {...props}/>;
}
exports.SelectGroup = SelectGroup;
function SelectValue({ ...props }) {
    return <SelectPrimitive.Value data-slot="select-value" {...props}/>;
}
exports.SelectValue = SelectValue;
function SelectTrigger({ className, size = "default", children, ...props }) {
    return (<SelectPrimitive.Trigger data-slot="select-trigger" data-size={size} className={(0, utils_1.cn)("border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-full items-center justify-between gap-2 rounded-md border bg-input-background px-3 py-2 text-sm whitespace-nowrap transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className)} {...props}>
      {children}
      <SelectPrimitive.Icon asChild>
        <lucide_react_1.ChevronDownIcon className="size-4 opacity-50"/>
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>);
}
exports.SelectTrigger = SelectTrigger;
function SelectContent({ className, children, position = "popper", ...props }) {
    return (<SelectPrimitive.Portal>
      <SelectPrimitive.Content data-slot="select-content" className={(0, utils_1.cn)("bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md", position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", className)} position={position} {...props}>
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport className={(0, utils_1.cn)("p-1", position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1")}>
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>);
}
exports.SelectContent = SelectContent;
function SelectLabel({ className, ...props }) {
    return (<SelectPrimitive.Label data-slot="select-label" className={(0, utils_1.cn)("text-muted-foreground px-2 py-1.5 text-xs", className)} {...props}/>);
}
exports.SelectLabel = SelectLabel;
function SelectItem({ className, children, ...props }) {
    return (<SelectPrimitive.Item data-slot="select-item" className={(0, utils_1.cn)("focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2", className)} {...props}>
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <lucide_react_1.CheckIcon className="size-4"/>
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>);
}
exports.SelectItem = SelectItem;
function SelectSeparator({ className, ...props }) {
    return (<SelectPrimitive.Separator data-slot="select-separator" className={(0, utils_1.cn)("bg-border pointer-events-none -mx-1 my-1 h-px", className)} {...props}/>);
}
exports.SelectSeparator = SelectSeparator;
function SelectScrollUpButton({ className, ...props }) {
    return (<SelectPrimitive.ScrollUpButton data-slot="select-scroll-up-button" className={(0, utils_1.cn)("flex cursor-default items-center justify-center py-1", className)} {...props}>
      <lucide_react_1.ChevronUpIcon className="size-4"/>
    </SelectPrimitive.ScrollUpButton>);
}
exports.SelectScrollUpButton = SelectScrollUpButton;
function SelectScrollDownButton({ className, ...props }) {
    return (<SelectPrimitive.ScrollDownButton data-slot="select-scroll-down-button" className={(0, utils_1.cn)("flex cursor-default items-center justify-center py-1", className)} {...props}>
      <lucide_react_1.ChevronDownIcon className="size-4"/>
    </SelectPrimitive.ScrollDownButton>);
}
exports.SelectScrollDownButton = SelectScrollDownButton;
//# sourceMappingURL=select.js.map