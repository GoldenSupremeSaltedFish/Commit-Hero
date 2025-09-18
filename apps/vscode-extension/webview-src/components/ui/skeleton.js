"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Skeleton = void 0;
const utils_1 = require("./utils");
function Skeleton({ className, ...props }) {
    return (<div data-slot="skeleton" className={(0, utils_1.cn)("bg-accent animate-pulse rounded-md", className)} {...props}/>);
}
exports.Skeleton = Skeleton;
//# sourceMappingURL=skeleton.js.map