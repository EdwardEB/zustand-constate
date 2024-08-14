"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createZustandConstate = createZustandConstate;
var zustand_1 = require("zustand");
var react_1 = require("react");
var react_2 = require("react");
// type CreateContextUSeStoreApi<TState, Props> = () => {
// 	getState: import("zustand").StoreApi<TState>["getState"];
// 	setState: import("zustand").StoreApi<TState>["setState"];
// 	subscribe: (listener: (state: TState) => void) => void;
// 	destroy: import("zustand").StoreApi<TState>["destroy"];
// };
var syncSelector = function (store) {
    return store.$sync;
};
function createZustandConstate(createState, useValue) {
    var StoreContext = (0, react_1.createContext)(null);
    var useStoreInContext = function (selector) {
        var store = (0, react_1.useContext)(StoreContext);
        if (!store) {
            throw new Error("Missing StoreProvider");
        }
        return (0, zustand_1.useStore)(store, selector);
    };
    var Hook = function (props) {
        var sync = useStoreInContext(syncSelector);
        // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
        (0, react_2.useLayoutEffect)(function () {
            sync(props);
        }, Object.values(props));
        if (useValue) {
            var returned_1 = useValue(__assign(__assign({}, props), { useStoreInContext: useStoreInContext, useStoreApi: useStoreApi }));
            // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
            (0, react_2.useLayoutEffect)(function () {
                if (returned_1 && typeof returned_1 === "object")
                    sync(returned_1);
            }, [returned_1]);
        }
        return null;
    };
    createState = createState || (function () { return ({}); });
    // const createStore = () => {
    // 	return createZustandStore<TState>((set, get, api) => ({
    // 		...(createState?.(set, get, api) as TState),
    // 		$sync: (props: Partial<Props>) =>
    // 			set((state) => ({ ...state, ...props })),
    // 	}));
    // };
    var StoreProvider = function (props) {
        var children = props.children, propsWithoutChildren = __rest(props, ["children"]);
        var storeRef = (0, react_1.useRef)();
        if (!storeRef.current) {
            storeRef.current = (0, zustand_1.createStore)(function (set, get, api) { return (__assign(__assign({}, createState === null || createState === void 0 ? void 0 : createState(set, get, api)), { $sync: function (props) {
                    return set(function (state) { return (__assign(__assign({}, state), props)); });
                } })); });
        }
        return (react_2.default.createElement(StoreContext.Provider, { value: storeRef.current },
            react_2.default.createElement(Hook, __assign({}, propsWithoutChildren)),
            children));
    };
    // const Provider = (props: Props & { children: ReactNode }) => {
    // 	const { children, ...propsWithoutChildren } = props;
    // 	return (
    // 		// @ts-ignore
    // 		<ZustandProvider createStore={createStore}>
    // 			{/* @ts-ignore*/}
    // 			<Hook {...propsWithoutChildren} />
    // 			{children}
    // 		</ZustandProvider>
    // 	);
    // };
    return {
        StoreProvider: StoreProvider,
        useStoreInContext: useStoreInContext,
    };
}
exports.default = createZustandConstate;
