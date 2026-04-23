"use client";

import * as React from "react";
import {
  ActivityState,
  ActivityAction,
  ActivityEvent,
  ActivityFilters,
  ActivityEventType,
} from "@/types/activity";
import { generateMockEvents } from "@/lib/mock-activity";

const initialState: ActivityState = {
  events: [],
  loading: false,
  error: null,
  search: "",
  filters: {},
  selectedEvent: null,
  drawerOpen: false,
  page: 1,
  pageSize: 50,
  hasMore: true,
  autoRefresh: false,
};

function activityReducer(state: ActivityState, action: ActivityAction): ActivityState {
  switch (action.type) {
    case "SET_EVENTS":
      return { ...state, events: action.payload };
    case "APPEND_EVENTS":
      return {
        ...state,
        events: [...state.events, ...action.payload],
        hasMore: action.payload.length >= state.pageSize,
      };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_SEARCH":
      return { ...state, search: action.payload, page: 1 };
    case "SET_FILTERS":
      return { ...state, filters: action.payload, page: 1 };
    case "RESET_FILTERS":
      return { ...state, filters: {}, page: 1 };
    case "SELECT_EVENT":
      return {
        ...state,
        selectedEvent: action.payload,
        drawerOpen: action.payload !== null,
      };
    case "SET_DRAWER_OPEN":
      return { ...state, drawerOpen: action.payload };
    case "SET_PAGE":
      return { ...state, page: action.payload };
    case "SET_PAGE_SIZE":
      return { ...state, pageSize: action.payload };
    case "SET_HAS_MORE":
      return { ...state, hasMore: action.payload };
    case "SET_AUTO_REFRESH":
      return { ...state, autoRefresh: action.payload };
    default:
      return state;
  }
}

interface ActivityContextValue {
  state: ActivityState;
  setSearch: (search: string) => void;
  setFilters: (filters: ActivityFilters) => void;
  resetFilters: () => void;
  selectEvent: (event: ActivityEvent | null) => void;
  setDrawerOpen: (open: boolean) => void;
  fetchEvents: (reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  setAutoRefresh: (enabled: boolean) => void;
  filteredEvents: ActivityEvent[];
}

const ActivityContext = React.createContext<ActivityContextValue | undefined>(undefined);

export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(activityReducer, initialState);
  const autoRefreshRef = React.useRef<NodeJS.Timeout | null>(null);

  const filteredEvents = React.useMemo(() => {
    let events = [...state.events];

    if (state.search) {
      const searchLower = state.search.toLowerCase();
      events = events.filter(
        (event) =>
          event.description.toLowerCase().includes(searchLower) ||
          event.type.toLowerCase().includes(searchLower) ||
          event.user?.email.toLowerCase().includes(searchLower) ||
          event.user?.name.toLowerCase().includes(searchLower)
      );
    }

    if (state.filters.type) {
      events = events.filter((event) => event.type === state.filters.type);
    }

    if (state.filters.status) {
      events = events.filter((event) => event.status === state.filters.status);
    }

    if (state.filters.user) {
      const userLower = state.filters.user.toLowerCase();
      events = events.filter(
        (event) =>
          event.user?.email.toLowerCase().includes(userLower) ||
          event.user?.name.toLowerCase().includes(userLower)
      );
    }

    if (state.filters.application) {
      const appLower = state.filters.application.toLowerCase();
      events = events.filter((event) => event.application?.name.toLowerCase().includes(appLower));
    }

    if (state.filters.dateRange?.from && state.filters.dateRange?.to) {
      events = events.filter(
        (event) =>
          event.timestamp >= state.filters.dateRange!.from &&
          event.timestamp <= state.filters.dateRange!.to
      );
    }

    return events;
  }, [state.events, state.search, state.filters]);

  const fetchEvents = React.useCallback(
    async (reset = false) => {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      try {
        await new Promise((resolve) => setTimeout(resolve, 500));

        const page = reset ? 1 : state.page;
        const newEvents = generateMockEvents(state.pageSize, page);

        if (reset || page === 1) {
          dispatch({ type: "SET_EVENTS", payload: newEvents });
        } else {
          dispatch({ type: "APPEND_EVENTS", payload: newEvents });
        }

        dispatch({ type: "SET_HAS_MORE", payload: newEvents.length >= state.pageSize });
      } catch {
        dispatch({
          type: "SET_ERROR",
          payload: "Failed to fetch events. Please try again.",
        });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [state.page, state.pageSize]
  );

  const loadMore = React.useCallback(async () => {
    if (!state.hasMore || state.loading) return;
    dispatch({ type: "SET_PAGE", payload: state.page + 1 });
  }, [state.hasMore, state.loading, state.page]);

  const refresh = React.useCallback(async () => {
    dispatch({ type: "SET_PAGE", payload: 1 });
    await fetchEvents(true);
  }, [fetchEvents]);

  React.useEffect(() => {
    fetchEvents(true);
  }, []);

  React.useEffect(() => {
    if (autoRefreshRef.current) {
      clearInterval(autoRefreshRef.current);
      autoRefreshRef.current = null;
    }

    if (state.autoRefresh) {
      autoRefreshRef.current = setInterval(() => {
        fetchEvents(true);
      }, 30000);
    }

    return () => {
      if (autoRefreshRef.current) {
        clearInterval(autoRefreshRef.current);
      }
    };
  }, [state.autoRefresh, fetchEvents]);

  const setSearch = React.useCallback((search: string) => {
    dispatch({ type: "SET_SEARCH", payload: search });
  }, []);

  const setFilters = React.useCallback((filters: ActivityFilters) => {
    dispatch({ type: "SET_FILTERS", payload: filters });
  }, []);

  const resetFilters = React.useCallback(() => {
    dispatch({ type: "RESET_FILTERS" });
  }, []);

  const selectEvent = React.useCallback((event: ActivityEvent | null) => {
    dispatch({ type: "SELECT_EVENT", payload: event });
  }, []);

  const setDrawerOpen = React.useCallback((open: boolean) => {
    dispatch({ type: "SET_DRAWER_OPEN", payload: open });
  }, []);

  const setAutoRefresh = React.useCallback((enabled: boolean) => {
    dispatch({ type: "SET_AUTO_REFRESH", payload: enabled });
  }, []);

  const value = React.useMemo(
    () => ({
      state,
      setSearch,
      setFilters,
      resetFilters,
      selectEvent,
      setDrawerOpen,
      fetchEvents,
      loadMore,
      refresh,
      setAutoRefresh,
      filteredEvents,
    }),
    [
      state,
      setSearch,
      setFilters,
      resetFilters,
      selectEvent,
      setDrawerOpen,
      fetchEvents,
      loadMore,
      refresh,
      setAutoRefresh,
      filteredEvents,
    ]
  );

  return <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>;
}

export function useActivity() {
  const context = React.useContext(ActivityContext);
  if (!context) {
    throw new Error("useActivity must be used within an ActivityProvider");
  }
  return context;
}
