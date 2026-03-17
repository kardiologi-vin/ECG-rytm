// processor.js - Logik för EKG-analys med OpenCV.js

function initProcessor() {
    const fileInput = document.getElementById('ecgUpload');
    const status = document.getElementById('status');

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length === 0) return;
        
        status.innerText = "Bearbetar EKG-bild...";
        let imgElement = new Image();
        imgElement.src = URL.createObjectURL(e.target.files[0]);
        
        imgElement.onload = function() {
            // Läs in bilden till OpenCV
            let src = cv.imread(imgElement);
            
            // Visa originalbilden
            cv.imshow('canvasInput', src);

            // Förbered variabler för analys
            let hsv = new cv.Mat();
            let mask = new cv.Mat();

            // 1. Konvertera till HSV-färgrymd (Hue, Saturation, Value)
            // Detta krävs för att färgfiltret ska fungera optimalt.
            cv.cvtColor(src, hsv, cv.COLOR_RGBA2RGB);
            cv.cvtColor(hsv, hsv, cv.COLOR_RGB2HSV);

            // 2. Definiera HSV-filter för att isolera den mörka kurvan.
            // Vi letar efter pixlar som är nästan svarta (lågt Value).
            // Detta exkluderar automatiskt det röda rutnätet.
            
            // Nedre gräns: [Hue, Saturation, Value]
            let low = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [0, 0, 0, 0]);
            
            // Övre gräns: Vi sätter Value till 100 för att filtrera bort allt ljusare än grått.
            let high = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [180, 255, 100, 255]);
            
            // Applicera filtret (Skapar en binär mask)
            cv.inRange(hsv, low, high, mask);

            // 3. Visa den extraherade digitala signalen
            // (Svart kurva på vit bakgrund)
            cv.imshow('canvasOutput', mask);

            status.innerText = "EKG-signal extraherad framgångsrikt.";

            // 4. Skicka till analyser.js (Valfritt steg)
            // Om du har en funktion som heter extractSignal, anropas den här:
            if (typeof extractSignal === "function") {
                const signalArray = extractSignal(mask);
                processSignal(signalArray);
            }

            // Städa minnet för att undvika hängningar
            src.delete(); hsv.delete(); mask.delete(); low.delete(); high.delete();
        };
    });
}
