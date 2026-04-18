import math
from typing import List
from schemas import ShiftLog, AnomalyResult

def detect_anomalies(logs: List[ShiftLog]) -> AnomalyResult:
    if len(logs) < 5:
        return AnomalyResult(hasAnomaly=False, explanation="Insufficient data for statistical analysis. Need at least 5 logs.")

    # Sort logs chronologically
    sorted_logs = sorted(logs, key=lambda x: x.date)
    
    # 1. Check for Unusual Deductions (Commission Rate Anomaly)
    commission_rates = []
    for log in sorted_logs:
        if log.grossEarned > 0:
            rate = (log.grossEarned - log.netReceived) / log.grossEarned
            commission_rates.append(rate)
            
    if commission_rates:
        mean_rate = sum(commission_rates) / len(commission_rates)
        variance = sum((x - mean_rate) ** 2 for x in commission_rates) / len(commission_rates)
        std_dev = math.sqrt(variance)
        
        # Look at the most recent log
        latest_log = sorted_logs[-1]
        if latest_log.grossEarned > 0:
            latest_rate = (latest_log.grossEarned - latest_log.netReceived) / latest_log.grossEarned
            
            # If the latest deduction rate is more than 2 standard deviations above the mean
            if std_dev > 0 and latest_rate > (mean_rate + (2 * std_dev)):
                return AnomalyResult(
                    hasAnomaly=True,
                    type="UNUSUAL_DEDUCTION",
                    explanation=f"Platform deduction of {latest_rate*100:.1f}% is statistically unusual compared to the historical average of {mean_rate*100:.1f}%."
                )

    # 2. Check for Sudden Income Drop
    # Compare the most recent earnings against the moving average
    recent_earnings = sorted_logs[-1].netReceived
    historical_earnings = [log.netReceived for log in sorted_logs[:-1]]
    
    if historical_earnings:
        mean_earnings = sum(historical_earnings) / len(historical_earnings)
        # If the most recent net received drops by more than 40% from historical average
        if recent_earnings < (mean_earnings * 0.6):
            return AnomalyResult(
                hasAnomaly=True,
                type="SUDDEN_INCOME_DROP",
                explanation=f"Net earnings dropped significantly to {recent_earnings:.2f}, well below the historical average of {mean_earnings:.2f}."
            )

    return AnomalyResult(hasAnomaly=False, explanation="Earnings appear normal.")