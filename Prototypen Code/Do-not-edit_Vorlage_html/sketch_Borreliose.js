function sketch_Borreliose(p) {



    //async + await ersetzt die preload function
    p.setup = async function() {
    p.createCanvas(500, 500);
    
    let data = await d3.csv("data/Borreliose_senti/data.csv");
    console.log(data);
    
    }
    
    
    p.draw = function() {
        p.background(230);
    }
    
    
    }
    new p5(sketch_Borreliose, 'canvas_Borreliose');