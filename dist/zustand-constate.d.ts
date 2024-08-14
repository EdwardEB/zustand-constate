import { type ReactNode } from "react";
import type { StateCreator } from "zustand/vanilla";
export type LocalUseStore<TState, Props> = TState & {
    $sync: (props: Props) => void;
};
type CreateContextUseStore<StateSlice, TState extends unknown> = (selector?: (s: TState) => StateSlice | undefined, equalityFn?: (a: TState, b: TState) => boolean) => StateSlice;
export declare function createZustandConstate<TState extends Record<string, any>, Props extends Record<string, any>>(createState?: StateCreator<TState>, useValue?: (props: Props & {
    useStore: CreateContextUseStore<any, TState>;
}) => any): {
    StoreProvider: (props: Props & {
        children: ReactNode;
    }) => JSX.Element;
    useStoreInContext: (selector: any) => unknown;
};
export default createZustandConstate;
