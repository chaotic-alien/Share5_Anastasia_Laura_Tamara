function sketch_Tularämie(p) {

    let data;
    
    //async + await ersetzt die preload function
    p.setup = async function() {
    p.createCanvas(500,500);
    
    
    data = await d3.csv("data/Tularämie_oblig/data.csv");
    console.log(data);
    
    }
    
    
    p.draw = function() {
        p.background(230);
    }
    
    
    }
    new p5(sketch_Tularämie, 'canvas_Tularämie');