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
exports.ScrollBar = exports.ScrollArea = void 0;
const React = __importStar(require("react"));
const ScrollAreaPrimitive = __importStar(require("@radix-ui/react-scroll-area"));
const utils_1 = require("./utils");
function ScrollArea({ className, children, ...props }) {
    return (<ScrollAreaPrimitive.Root data-slot="scroll-area" className={(0, utils_1.cn)("relative", className)} {...props}>
      <ScrollAreaPrimitive.Viewport data-slot="scroll-area-viewport" className="focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1">
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>);
}
exports.ScrollArea = ScrollArea;
function ScrollBar({ className, orientation = "vertical", ...props }) {
    return (<ScrollAreaPrimitive.ScrollAreaScrollbar data-slot="scroll-area-scrollbar" orientation={orientation} className={(0, utils_1.cn)("flex touch-none p-px transition-colors select-none", orientation === "vertical" &&
            "h-full w-2.5 border-l border-l-transparent", orientation === "horizontal" &&
            "h-2.5 flex-col border-t border-t-transparent", className)} {...props}>
      <ScrollAreaPrimitive.ScrollAreaThumb data-slot="scroll-area-thumb" className="bg-border relative flex-1 rounded-full"/>
    </ScrollAreaPrimitive.ScrollAreaScrollbar>);
}
exports.ScrollBar = ScrollBar;
//# sourceMappingURL=scroll-area.js.map