/**
 * Performance monitoring utilities
 */

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            updateTimes: [],
            renderTimes: [],
            stateOperations: []
        };
        this.maxSamples = 100;
    }

    /**
     * Start timing an operation
     * @returns {number} - Start timestamp
     */
    startTimer() {
        return performance.now();
    }

    /**
     * End timing an operation and record the duration
     * @param {number} startTime - Start timestamp
     * @param {string} operationType - Type of operation
     */
    endTimer(startTime, operationType) {
        const duration = performance.now() - startTime;
        
        switch (operationType) {
            case 'update':
                this.addMetric('updateTimes', duration);
                break;
            case 'render':
                this.addMetric('renderTimes', duration);
                break;
            case 'state':
                this.addMetric('stateOperations', duration);
                break;
        }

        // Log if operation takes too long
        if (duration > 100) { // 100ms threshold
            console.warn(`Slow ${operationType} operation: ${duration.toFixed(2)}ms`);
        }
    }

    /**
     * Add a metric to the specified array
     * @param {string} metricType - Type of metric
     * @param {number} value - Value to add
     */
    addMetric(metricType, value) {
        this.metrics[metricType].push(value);
        if (this.metrics[metricType].length > this.maxSamples) {
            this.metrics[metricType].shift();
        }
    }

    /**
     * Get average duration for a metric type
     * @param {string} metricType - Type of metric
     * @returns {number} - Average duration
     */
    getAverage(metricType) {
        const values = this.metrics[metricType];
        if (values.length === 0) return 0;
        return values.reduce((a, b) => a + b, 0) / values.length;
    }

    /**
     * Get performance report
     * @returns {Object} - Performance metrics
     */
    getReport() {
        return {
            averageUpdateTime: this.getAverage('updateTimes'),
            averageRenderTime: this.getAverage('renderTimes'),
            averageStateOperationTime: this.getAverage('stateOperations'),
            totalOperations: {
                updates: this.metrics.updateTimes.length,
                renders: this.metrics.renderTimes.length,
                stateOperations: this.metrics.stateOperations.length
            }
        };
    }

    /**
     * Clear all metrics
     */
    clearMetrics() {
        this.metrics = {
            updateTimes: [],
            renderTimes: [],
            stateOperations: []
        };
    }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor(); 