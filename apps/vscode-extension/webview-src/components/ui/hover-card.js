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
exports.HoverCardContent = exports.HoverCardTrigger = exports.HoverCard = void 0;
const React = __importStar(require("react"));
const HoverCardPrimitive = __importStar(require("@radix-ui/react-hover-card"));
const utils_1 = require("./utils");
function HoverCard({ ...props }) {
    return <HoverCardPrimitive.Root data-slot="hover-card" {...props}/>;
}
exports.HoverCard = HoverCard;
function HoverCardTrigger({ ...props }) {
    return (<HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props}/>);
}
exports.HoverCardTrigger = HoverCardTrigger;
function HoverCardContent({ className, align = "center", sideOffset = 4, ...props }) {
    return (<HoverCardPrimitive.Portal data-slot="hover-card-portal">
      <HoverCardPrimitive.Content data-slot="hover-card-content" align={align} sideOffset={sideOffset} className={(0, utils_1.cn)("bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-64 origin-(--radix-hover-card-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden", className)} {...props}/>
    </HoverCardPrimitive.Portal>);
}
exports.HoverCardContent = HoverCardContent;
//# sourceMappingURL=hover-card.js.map