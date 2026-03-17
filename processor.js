const fileInput = document.getElementById('fileInput');
const status = document.getElementById('status');

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length === 0) return;
    
    status.innerText = "Optimerar bild för Pixel 10...";
    let imgElement = new Image();
    imgElement.src = URL.createObjectURL(e.target.files[0]);
    
    imgElement.onload = function() {
        let src = cv.imread(imgElement);
        
        // --- OPTIMERING FÖR HÖGUPPLÖSTA BILDER ---
        // Vi skalar ner bilden till en maxbredd på 2000px för att snabba upp analysen
        // utan att tappa kliniskt relevanta detaljer (P-vågor etc.)
        let dst = new cv.Mat();
        let maxDim = 2000;
        if (src.cols > maxDim) {
            let scale = maxDim / src.cols;
            let dsize = new cv.Size(src.cols * scale, src.rows * scale);
            cv.resize(src, src, dsize, 0, 0, cv.INTER_AREA);
        }

        cv.imshow('canvasInput', src); 

        let hsv = new cv.Mat();
        let mask = new cv.Mat();

        // 1. Konvertera till HSV
        cv.cvtColor(src, hsv, cv.COLOR_RGBA2RGB);
        cv.cvtColor(hsv, hsv, cv.COLOR_RGB2HSV);

        // 2. Grid Removal: Vi exkluderar det röda rutnätet.
        // Vi letar efter mörka pixlar (bläck/digital linje)
        // [Hue, Saturation, Value] - Vi sänker Value-taket till 100 för att vara strikta
        let low = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [0, 0, 0, 0]);
        let high = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [180, 255, 100, 255]);
        cv.inRange(hsv, low, high, mask);

        // 3. Visa den digitaliserade kurvan
        cv.imshow('canvasOutput', mask);

        // 4. Skicka till analyser.js
        if (typeof extractSignal === "function") {
            const signalArray = extractSignal(mask);
            processSignal(signalArray);
        }

        // Städa minne
        src.delete(); hsv.delete(); mask.delete(); low.delete(); high.delete();
    };
});
