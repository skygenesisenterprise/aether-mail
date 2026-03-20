package middleware

import (
	"net/http"
	"runtime"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type Metrics struct {
	TotalRequests  int64
	TotalErrors    int64
	ActiveRequests int64
	TotalLatency   int64
	StatusCodes    map[int]int64
	PathCounts     map[string]int64
	mu             sync.RWMutex
}

var globalMetrics = &Metrics{
	StatusCodes: make(map[int]int64),
	PathCounts:  make(map[string]int64),
}

func GetMetrics() Metrics {
	globalMetrics.mu.RLock()
	defer globalMetrics.mu.RUnlock()

	return Metrics{
		TotalRequests:  globalMetrics.TotalRequests,
		TotalErrors:    globalMetrics.TotalErrors,
		ActiveRequests: globalMetrics.ActiveRequests,
		TotalLatency:   globalMetrics.TotalLatency,
		StatusCodes:    globalMetrics.StatusCodes,
		PathCounts:     globalMetrics.PathCounts,
	}
}

func MetricsMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		start := time.Now()

		globalMetrics.mu.Lock()
		globalMetrics.ActiveRequests++
		globalMetrics.TotalRequests++
		path := ctx.Request.URL.Path
		globalMetrics.PathCounts[path]++
		globalMetrics.mu.Unlock()

		ctx.Next()

		latency := time.Since(start).Milliseconds()

		globalMetrics.mu.Lock()
		globalMetrics.ActiveRequests--
		globalMetrics.TotalLatency += latency
		globalMetrics.StatusCodes[ctx.Writer.Status()]++

		if ctx.Writer.Status() >= 400 {
			globalMetrics.TotalErrors++
		}
		globalMetrics.mu.Unlock()
	}
}

type metricsResponse struct {
	Uptime         string           `json:"uptime"`
	TotalRequests  int64            `json:"total_requests"`
	TotalErrors    int64            `json:"total_errors"`
	ActiveRequests int64            `json:"active_requests"`
	AverageLatency int64            `json:"average_latency_ms"`
	StatusCodes    map[string]int64 `json:"status_codes"`
	TopPaths       map[string]int64 `json:"top_paths"`
	MemoryUsage    memoryStats      `json:"memory_usage"`
}

type memoryStats struct {
	Alloc      uint64 `json:"alloc_bytes"`
	TotalAlloc uint64 `json:"total_alloc_bytes"`
	Sys        uint64 `json:"sys_bytes"`
	NumGC      uint32 `json:"num_gc"`
}

var startTime = time.Now()

func GetMetricsHandler() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		m := GetMetrics()

		var avgLatency int64
		if m.TotalRequests > 0 {
			avgLatency = m.TotalLatency / m.TotalRequests
		}

		var mStat runtime.MemStats
		runtime.ReadMemStats(&mStat)

		statusCodes := make(map[string]int64)
		for k, v := range m.StatusCodes {
			statusCodes[http.StatusText(k)] = v
		}

		topPaths := make(map[string]int64)
		for k, v := range m.PathCounts {
			topPaths[k] = v
		}

		metrics := metricsResponse{
			Uptime:         time.Since(startTime).String(),
			TotalRequests:  m.TotalRequests,
			TotalErrors:    m.TotalErrors,
			ActiveRequests: m.ActiveRequests,
			AverageLatency: avgLatency,
			StatusCodes:    statusCodes,
			TopPaths:       topPaths,
			MemoryUsage: memoryStats{
				Alloc:      mStat.Alloc,
				TotalAlloc: mStat.TotalAlloc,
				Sys:        mStat.Sys,
				NumGC:      mStat.NumGC,
			},
		}

		ctx.JSON(http.StatusOK, metrics)
	}
}

func HealthCheckMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		ctx.JSON(http.StatusOK, gin.H{
			"status": "healthy",
			"time":   time.Now().Format(time.RFC3339),
		})
	}
}

func ReadinessCheckMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		m := GetMetrics()

		isReady := true
		if m.ActiveRequests > 1000 {
			isReady = false
		}

		if isReady {
			ctx.JSON(http.StatusOK, gin.H{
				"status": "ready",
				"time":   time.Now().Format(time.RFC3339),
			})
		} else {
			ctx.JSON(http.StatusServiceUnavailable, gin.H{
				"status": "not ready",
				"time":   time.Now().Format(time.RFC3339),
			})
		}
	}
}

type RequestCounter struct {
	mu       sync.RWMutex
	counters map[string]*Counter
}

type Counter struct {
	Count int64
}

func NewRequestCounter() *RequestCounter {
	return &RequestCounter{
		counters: make(map[string]*Counter),
	}
}

func (rc *RequestCounter) Increment(key string) {
	rc.mu.Lock()
	defer rc.mu.Unlock()

	if _, exists := rc.counters[key]; !exists {
		rc.counters[key] = &Counter{}
	}
	rc.counters[key].Count++
}

func (rc *RequestCounter) Get(key string) int64 {
	rc.mu.RLock()
	defer rc.mu.RUnlock()

	if counter, exists := rc.counters[key]; exists {
		return counter.Count
	}
	return 0
}

func (rc *RequestCounter) Reset() {
	rc.mu.Lock()
	defer rc.mu.Unlock()
	rc.counters = make(map[string]*Counter)
}

var requestCounter = NewRequestCounter()

func RequestCounterMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		key := ctx.Request.Method + ":" + ctx.Request.URL.Path
		requestCounter.Increment(key)
		ctx.Next()
	}
}

func GetRequestCounter() *RequestCounter {
	return requestCounter
}
