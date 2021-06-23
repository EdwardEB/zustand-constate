import create from 'zustand';
import createContext from 'zustand/context';
import * as React from 'react';
import {ReactNode, useLayoutEffect, useState} from 'react';
import {
  EqualityChecker,
  State,
  StateCreator,
  StateSelector,
} from 'zustand/vanilla';

export type LocalUseStore<TState, Props> = TState & {
  $sync: (props: Props) => void;
};

type CreateContextUseStore<StateSlice, TState extends State> = (
  selector?: StateSelector<TState, StateSlice> | undefined,
  equalityFn?: EqualityChecker<StateSlice>,
) => StateSlice;

const syncSelector = <TState, Props>(store: LocalUseStore<TState, Props>) =>
  store.$sync;

export function createZustandConstate<
  TState extends State,
  Props extends Record<string, any>
>(
  createState: StateCreator<TState>,
  useValue?: (
    props: Props & {useStore: CreateContextUseStore<any, TState>},
  ) => any,
) {
  const {Provider: ZustandProvider, useStore} = createContext<
    LocalUseStore<TState, Props>
  >();

  const Hook = (props: Props) => {
    const sync = useStore(syncSelector);

    useLayoutEffect(() => {
      sync(props);
    }, Object.values(props));

    if (useValue) {
      const returned = useValue({...props, useStore});

      useLayoutEffect(() => {
        if (returned && typeof returned === 'object') sync(returned);
      }, [returned]);
    }

    return null;
  };

  const Provider = (props: Props & {children: ReactNode}) => {
    const {children, ...propsWithoutChildren} = props;

    const [createStore] = useState(() => () => {
      return create<TState>((set, get, api) => ({
        ...createState(set, get, api),
        $sync: (props: Partial<Props>) =>
          set((state) => ({...state, ...props})),
      }));
    });

    return (
      // @ts-ignore
      <ZustandProvider createStore={createStore}>
        {/* @ts-ignore*/}
        <Hook {...propsWithoutChildren} />
        {children}
      </ZustandProvider>
    );
  };

  return {
    Provider,
    useStore,
  };
}

export default createZustandConstate;