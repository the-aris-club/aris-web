'use client'

// Inspired by react-hot-toast library
import * as React from 'react'

import type { ToastActionElement, ToastProps } from '@/components/ui/toast'

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1_000_000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: 'ADD_TOAST',
  DISMISS_TOAST: 'DISMISS_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
  UPDATE_TOAST: 'UPDATE_TOAST',
} as const

let count = 0

const genId = () => {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType['ADD_TOAST']
      toast: ToasterToast
    }
  | {
      type: ActionType['UPDATE_TOAST']
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType['DISMISS_TOAST']
      toastId?: ToasterToast['id']
    }
  | {
      type: ActionType['REMOVE_TOAST']
      toastId?: ToasterToast['id']
    }

interface State {
  toasts: ToasterToast[]
}

const listeners: ((state: State) => void)[] = []

let memoryState: State = { toasts: [] }

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'ADD_TOAST': {
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }
    }

    case 'UPDATE_TOAST': {
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }
    }

    case 'DISMISS_TOAST': {
      const { toastId } = action

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case 'REMOVE_TOAST': {
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
    }

    default: {
      return state
    }
  }
}

// Dispatches into the store, then notifies the subscribers. Also owns the
// side effect of queueing a dismissed toast for removal once its exit
// animation has had time to run, so the reducer itself stays pure.
const dispatch = (action: Action) => {
  if (action.type === 'DISMISS_TOAST') {
    const ids = action.toastId
      ? [action.toastId]
      : memoryState.toasts.map((t) => t.id)

    for (const toastId of ids) {
      if (toastTimeouts.has(toastId)) {
        continue
      }

      const timeout = setTimeout(() => {
        toastTimeouts.delete(toastId)
        dispatch({
          toastId,
          type: 'REMOVE_TOAST',
        })
      }, TOAST_REMOVE_DELAY)

      toastTimeouts.set(toastId, timeout)
    }
  }

  memoryState = reducer(memoryState, action)

  for (const listener of listeners) {
    listener(memoryState)
  }
}

type Toast = Omit<ToasterToast, 'id'>

const toast = ({ ...props }: Toast) => {
  const id = genId()

  const update = (nextProps: ToasterToast) =>
    dispatch({
      toast: { ...nextProps, id },
      type: 'UPDATE_TOAST',
    })
  const dismiss = () => dispatch({ toastId: id, type: 'DISMISS_TOAST' })

  dispatch({
    toast: {
      ...props,
      id,
      onOpenChange: (open) => {
        if (!open) {
          dismiss()
        }
      },
      open: true,
    },
    type: 'ADD_TOAST',
  })

  return {
    dismiss,
    id,
    update,
  }
}

const useToast = () => {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index !== -1) {
        listeners.splice(index, 1)
      }
    }
  }, [])

  return {
    ...state,
    dismiss: (toastId?: string) => dispatch({ toastId, type: 'DISMISS_TOAST' }),
    toast,
  }
}

export { useToast, toast }
