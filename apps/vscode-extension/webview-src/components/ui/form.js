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
exports.FormField = exports.FormMessage = exports.FormDescription = exports.FormControl = exports.FormLabel = exports.FormItem = exports.Form = exports.useFormField = void 0;
const React = __importStar(require("react"));
const react_slot_1 = require("@radix-ui/react-slot");
const react_hook_form_1 = require("react-hook-form");
const utils_1 = require("./utils");
const label_1 = require("./label");
const Form = react_hook_form_1.FormProvider;
exports.Form = Form;
const FormFieldContext = React.createContext({});
const FormField = ({ ...props }) => {
    return (<FormFieldContext.Provider value={{ name: props.name }}>
      <react_hook_form_1.Controller {...props}/>
    </FormFieldContext.Provider>);
};
exports.FormField = FormField;
const useFormField = () => {
    const fieldContext = React.useContext(FormFieldContext);
    const itemContext = React.useContext(FormItemContext);
    const { getFieldState } = (0, react_hook_form_1.useFormContext)();
    const formState = (0, react_hook_form_1.useFormState)({ name: fieldContext.name });
    const fieldState = getFieldState(fieldContext.name, formState);
    if (!fieldContext) {
        throw new Error("useFormField should be used within <FormField>");
    }
    const { id } = itemContext;
    return {
        id,
        name: fieldContext.name,
        formItemId: `${id}-form-item`,
        formDescriptionId: `${id}-form-item-description`,
        formMessageId: `${id}-form-item-message`,
        ...fieldState,
    };
};
exports.useFormField = useFormField;
const FormItemContext = React.createContext({});
function FormItem({ className, ...props }) {
    const id = React.useId();
    return (<FormItemContext.Provider value={{ id }}>
      <div data-slot="form-item" className={(0, utils_1.cn)("grid gap-2", className)} {...props}/>
    </FormItemContext.Provider>);
}
exports.FormItem = FormItem;
function FormLabel({ className, ...props }) {
    const { error, formItemId } = useFormField();
    return (<label_1.Label data-slot="form-label" data-error={!!error} className={(0, utils_1.cn)("data-[error=true]:text-destructive", className)} htmlFor={formItemId} {...props}/>);
}
exports.FormLabel = FormLabel;
function FormControl({ ...props }) {
    const { error, formItemId, formDescriptionId, formMessageId } = useFormField();
    return (<react_slot_1.Slot data-slot="form-control" id={formItemId} aria-describedby={!error
            ? `${formDescriptionId}`
            : `${formDescriptionId} ${formMessageId}`} aria-invalid={!!error} {...props}/>);
}
exports.FormControl = FormControl;
function FormDescription({ className, ...props }) {
    const { formDescriptionId } = useFormField();
    return (<p data-slot="form-description" id={formDescriptionId} className={(0, utils_1.cn)("text-muted-foreground text-sm", className)} {...props}/>);
}
exports.FormDescription = FormDescription;
function FormMessage({ className, ...props }) {
    const { error, formMessageId } = useFormField();
    const body = error ? String(error?.message ?? "") : props.children;
    if (!body) {
        return null;
    }
    return (<p data-slot="form-message" id={formMessageId} className={(0, utils_1.cn)("text-destructive text-sm", className)} {...props}>
      {body}
    </p>);
}
exports.FormMessage = FormMessage;
//# sourceMappingURL=form.js.map