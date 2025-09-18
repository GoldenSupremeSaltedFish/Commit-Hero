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
exports.InputOTPSeparator = exports.InputOTPSlot = exports.InputOTPGroup = exports.InputOTP = void 0;
const React = __importStar(require("react"));
const input_otp_1 = require("input-otp");
const lucide_react_1 = require("lucide-react");
const utils_1 = require("./utils");
function InputOTP({ className, containerClassName, ...props }) {
    return (<input_otp_1.OTPInput data-slot="input-otp" containerClassName={(0, utils_1.cn)("flex items-center gap-2 has-disabled:opacity-50", containerClassName)} className={(0, utils_1.cn)("disabled:cursor-not-allowed", className)} {...props}/>);
}
exports.InputOTP = InputOTP;
function InputOTPGroup({ className, ...props }) {
    return (<div data-slot="input-otp-group" className={(0, utils_1.cn)("flex items-center gap-1", className)} {...props}/>);
}
exports.InputOTPGroup = InputOTPGroup;
function InputOTPSlot({ index, className, ...props }) {
    const inputOTPContext = React.useContext(input_otp_1.OTPInputContext);
    const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};
    return (<div data-slot="input-otp-slot" data-active={isActive} className={(0, utils_1.cn)("data-[active=true]:border-ring data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:ring-destructive/20 dark:data-[active=true]:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive dark:bg-input/30 border-input relative flex h-9 w-9 items-center justify-center border-y border-r text-sm bg-input-background transition-all outline-none first:rounded-l-md first:border-l last:rounded-r-md data-[active=true]:z-10 data-[active=true]:ring-[3px]", className)} {...props}>
      {char}
      {hasFakeCaret && (<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink bg-foreground h-4 w-px duration-1000"/>
        </div>)}
    </div>);
}
exports.InputOTPSlot = InputOTPSlot;
function InputOTPSeparator({ ...props }) {
    return (<div data-slot="input-otp-separator" role="separator" {...props}>
      <lucide_react_1.MinusIcon />
    </div>);
}
exports.InputOTPSeparator = InputOTPSeparator;
//# sourceMappingURL=input-otp.js.map