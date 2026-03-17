const fileInput = document.getElementById('fileInput');
const status = document.getElementById('status');

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length === 0) return;
    
    status.innerText = "Bearbetar bild...";
    let imgElement = new Image();
    imgElement.src = URL.createObjectURL(e.target.files[0]);
    
    imgElement.onload = function() {
        let src = cv.imread(imgElement);
        cv.imshow('canvasInput', src); // Visa originalet

        let hsv = new cv.Mat();
        let mask = new cv.Mat();

        // 1. Konvertera till HSV för att isolera färger
        cv.cvtColor(src, hsv, cv.COLOR_RGBA2RGB);
        cv.cvtColor(hsv, hsv, cv.COLOR_RGB2HSV);

        // 2. Grid Removal: Vi filtrerar bort röda toner (rutnätet)
        // Vi behåller endast mörka/svarta pixlar (Value < 110)
        let low = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [0, 0, 0, 0]);
        let high = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [180, 255, 110, 255]);
        cv.inRange(hsv, low, high, mask);

        // 3. Visa den "rena" signalen
        cv.imshow('canvasOutput', mask);

        // 4. Skicka masken vidare till analyser.js
        const signalArray = extractSignal(mask);
        processSignal(signalArray);

        // Städa minne
        src.delete(); hsv.delete(); mask.delete(); low.delete(); high.delete();
    };
});
