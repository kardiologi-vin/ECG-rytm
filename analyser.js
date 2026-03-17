function extractSignal(mask) {
    let signal = [];
    for (let x = 0; x < mask.cols; x++) {
        let yPoints = [];
        for (let y = 0; y < mask.rows; y++) {
            if (mask.ucharAt(y, x) === 255) yPoints.push(y);
        }
        if (yPoints.length > 0) {
            let avgY = yPoints.reduce((a, b) => a + b) / yPoints.length;
            signal.push(mask.rows - avgY);
        } else {
            signal.push(null);
        }
    }
    return signal;
}

function processSignal(signal) {
    // Enkel Peak Detection för R-toppar (bristfällig men funktionell start)
    let peaks = [];
    const threshold = Math.max(...signal.filter(v => v !== null)) * 0.8;

    for (let i = 1; i < signal.length - 1; i++) {
        if (signal[i] > threshold && signal[i] > signal[i-1] && signal[i] > signal[i+1]) {
            peaks.push(i);
        }
    }

    if (peaks.length > 1) {
        status.innerText = "Signal extraherad. R-toppar identifierade.";
        document.getElementById('metrics').innerText = `Hittade ${peaks.length} potentiella R-komplex.`;
    } else {
        status.innerText = "Kunde inte identifiera tydliga R-toppar. Justera belysning.";
    }
}
