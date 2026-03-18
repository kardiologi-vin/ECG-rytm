function initProcessor() {
    const fileInput = document.getElementById('ecgUpload');
    const status = document.getElementById('status');

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length === 0) return;
        
        // Rensa statusmeddelandet direkt för ett rent UI
        status.innerText = ""; 
        
        const imgElement = new Image();
        imgElement.src = URL.createObjectURL(e.target.files[0]);
        
        imgElement.onload = function() {
            let src = cv.imread(imgElement);
            
            // Visa originalet
            cv.imshow('canvasInput', src);

            // Analysprocess
            let hsv = new cv.Mat();
            let mask = new cv.Mat();

            // Konvertera till HSV för färgfiltrering
            cv.cvtColor(src, hsv, cv.COLOR_RGBA2RGB);
            cv.cvtColor(hsv, hsv, cv.COLOR_RGB2HSV);

            // Filterinställningar:
            // Vi letar efter svarta/mörka linjer (Value 0-100).
            // Detta döljer effektivt det ljusare röda rutnätet.
            let low = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [0, 0, 0, 0]);
            let high = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [180, 255, 100, 255]);
            
            cv.inRange(hsv, low, high, mask);

            // Visa den extraherade digitala kurvan
            cv.imshow('canvasOutput', mask);

            // Minneshantering för att hålla Pixel 10 snabb
            src.delete(); 
            hsv.delete(); 
            mask.delete(); 
            low.delete(); 
            high.delete();
        };
    });
}
