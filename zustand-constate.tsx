import {
	createStore as createZustandStore,
	useStore as useZustandStore,
} from "zustand";
import { createContext, useContext, useRef } from "react";
import React, { type ReactNode, useLayoutEffect } from "react";
import type { StateCreator, StoreApi } from "zustand/vanilla";

export type LocalUseStore<TState, Props> = TState & {
	$sync: (props: Props) => void;
};

type CreateContextUseStore<StateSlice, TState extends unknown> = (
	selector?: (s: TState) => StateSlice | undefined,
	equalityFn?: (a: TState, b: TState) => boolean,
) => StateSlice;

// type CreateContextUSeStoreApi<TState, Props> = () => {
// 	getState: import("zustand").StoreApi<TState>["getState"];
// 	setState: import("zustand").StoreApi<TState>["setState"];
// 	subscribe: (listener: (state: TState) => void) => void;
// 	destroy: import("zustand").StoreApi<TState>["destroy"];
// };

const syncSelector = <TState, Props>(store: LocalUseStore<TState, Props>) =>
	store.$sync;

export function createZustandConstate<
	TState extends Record<string, any>,
	Props extends Record<string, any>,
>(
	createState?: StateCreator<TState>,
	useValue?: (
		props: Props & {
			useStore: CreateContextUseStore<any, TState>;
			useStoreApi: StoreApi<TState>;
		},
	) => any,
) {
	const StoreContext = createContext<LocalUseStore<TState, Props>>(null as any);

	const useStoreInContext = (selector) => {
		const store = useContext<LocalUseStore<TState, Props>>(StoreContext);
		if (!store) {
			throw new Error("Missing StoreProvider");
		}

		return useZustandStore(store, selector);
	};

	const Hook = (props: Props) => {
		const sync = useStoreInContext(syncSelector);

		// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
		useLayoutEffect(() => {
			sync(props);
		}, Object.values(props));

		if (useValue) {
			const returned = useValue({ ...props, useStoreInContext, useStoreApi });

			// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
			useLayoutEffect(() => {
				if (returned && typeof returned === "object") sync(returned);
			}, [returned]);
		}

		return null;
	};

	createState = createState || (() => ({}) as TState);

	// const createStore = () => {
	// 	return createZustandStore<TState>((set, get, api) => ({
	// 		...(createState?.(set, get, api) as TState),
	// 		$sync: (props: Partial<Props>) =>
	// 			set((state) => ({ ...state, ...props })),
	// 	}));
	// };

	const StoreProvider = (props: Props & { children: ReactNode }) => {
		const { children, ...propsWithoutChildren } = props;
		const storeRef = useRef<TState>();

		if (!storeRef.current) {
			storeRef.current = createZustandStore<TState>((set, get, api) => ({
				...(createState?.(set, get, api) as TState),
				$sync: (props: Partial<Props>) =>
					set((state) => ({ ...state, ...props })),
			}));
		}

		return (
			<StoreContext.Provider value={storeRef.current}>
				<Hook {...propsWithoutChildren} />
				{children}
			</StoreContext.Provider>
		);
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
		StoreProvider,
		useStoreInContext,
		useStoreApi,
	};
}

export default createZustandConstate;
