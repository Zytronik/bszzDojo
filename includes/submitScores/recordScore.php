
    <style>
        canvas { 
            touch-action: none; 
            background-color: transparent; 
            display: block;
            width: 500px;
            height: 500px;
            object-fit: contain;
        }
    </style>
   
    <canvas id="myCanvas"></canvas>

    <script>
        const canvas = document.getElementById("myCanvas");
        const ctx = canvas.getContext("2d");

        let scale = 1, lastDist = 0;
        let targetRadius, ringWidth;
        const colors = ["white", "#1f1f1f", "blue", "red", "gold"]; // Rings from outermost to bullseye
        const clicks = []; // Store click positions

        function resizeCanvas() {
            const minSide = Math.min(window.innerWidth, window.innerHeight);
            canvas.width = minSide;
            canvas.height = minSide;
            
            targetRadius = minSide * 0.4; // 80% of the canvas size
            ringWidth = targetRadius / 10;
            
            drawTarget();
        }

        function drawTarget() {
            ctx.resetTransform();
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.scale(scale, scale);

            // Draw rings (outer to inner)
            for (let i = 10; i > 0; i--) {
                ctx.beginPath();
                ctx.arc(0, 0, i * ringWidth, 0, Math.PI * 2);
                ctx.fillStyle = colors[Math.floor((10 - i) / 2)];
                ctx.fill();
                ctx.strokeStyle = "black";
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            // Draw center cross
            ctx.strokeStyle = "black";
            ctx.lineWidth = 2 / scale; // Scale line thickness
            ctx.beginPath();
            ctx.moveTo(-5 / scale, 0); ctx.lineTo(5 / scale, 0); // Horizontal line
            ctx.moveTo(0, -5 / scale); ctx.lineTo(0, 5 / scale); // Vertical line
            ctx.stroke();

            // Draw click markers
            clicks.forEach(({ x, y }) => {
                ctx.beginPath();
                ctx.arc(x, y, 5 / scale, 0, Math.PI * 2); // Small red dot
                ctx.fillStyle = "#ffae00";
                ctx.fill();
            });
        }

        canvas.addEventListener("click", (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleFactor = canvas.width / rect.width; // Adjust for CSS scaling

            let x = (e.clientX - rect.left) * scaleFactor;
            let y = (e.clientY - rect.top) * scaleFactor;

            x = (x - canvas.width / 2) / scale;
            y = (y - canvas.height / 2) / scale;

            clicks.push({ x, y }); // Store click position

            const distance = Math.sqrt(x * x + y * y);

            let score = 0;
            if (distance < ringWidth) score = 10;
            else if (distance < ringWidth * 2) score = 9;
            else if (distance < ringWidth * 3) score = 8;
            else if (distance < ringWidth * 4) score = 7;
            else if (distance < ringWidth * 5) score = 6;
            else if (distance < ringWidth * 6) score = 5;
            else if (distance < ringWidth * 7) score = 4;
            else if (distance < ringWidth * 8) score = 3;
            else if (distance < ringWidth * 9) score = 2;
            else if (distance < ringWidth * 10) score = 1;

            drawTarget();
            setTimeout(() => {
                alert("You scored: " + score);
            }, 1000);
        });

        canvas.addEventListener("touchmove", (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                let dx = e.touches[0].pageX - e.touches[1].pageX;
                let dy = e.touches[0].pageY - e.touches[1].pageY;
                let dist = Math.sqrt(dx * dx + dy * dy);
                
                if (lastDist) {
                    scale *= dist / lastDist;
                    scale = Math.max(0.5, Math.min(3, scale));
                    drawTarget();
                }
                lastDist = dist;
            }
        });

        canvas.addEventListener("touchend", () => {
            lastDist = 0;
        });

        window.addEventListener("resize", resizeCanvas);
        resizeCanvas();
    </script>