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
exports.CardContent = exports.CardDescription = exports.CardAction = exports.CardTitle = exports.CardFooter = exports.CardHeader = exports.Card = void 0;
const React = __importStar(require("react"));
const utils_1 = require("./utils");
function Card({ className, ...props }) {
    return (<div data-slot="card" className={(0, utils_1.cn)("bg-card text-card-foreground flex flex-col gap-6 rounded-xl border", className)} {...props}/>);
}
exports.Card = Card;
function CardHeader({ className, ...props }) {
    return (<div data-slot="card-header" className={(0, utils_1.cn)("@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6", className)} {...props}/>);
}
exports.CardHeader = CardHeader;
function CardTitle({ className, ...props }) {
    return (<h4 data-slot="card-title" className={(0, utils_1.cn)("leading-none", className)} {...props}/>);
}
exports.CardTitle = CardTitle;
function CardDescription({ className, ...props }) {
    return (<p data-slot="card-description" className={(0, utils_1.cn)("text-muted-foreground", className)} {...props}/>);
}
exports.CardDescription = CardDescription;
function CardAction({ className, ...props }) {
    return (<div data-slot="card-action" className={(0, utils_1.cn)("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)} {...props}/>);
}
exports.CardAction = CardAction;
function CardContent({ className, ...props }) {
    return (<div data-slot="card-content" className={(0, utils_1.cn)("px-6 [&:last-child]:pb-6", className)} {...props}/>);
}
exports.CardContent = CardContent;
function CardFooter({ className, ...props }) {
    return (<div data-slot="card-footer" className={(0, utils_1.cn)("flex items-center px-6 pb-6 [.border-t]:pt-6", className)} {...props}/>);
}
exports.CardFooter = CardFooter;
//# sourceMappingURL=card.js.map