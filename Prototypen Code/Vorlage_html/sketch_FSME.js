function sketch_FSME(p) {



//async + await ersetzt die preload function
p.setup = async function() {
p.createCanvas(500, 500);

let data = await d3.csv("data/FSME_oblig/data.csv");
console.log(data);

}


p.draw = function() {
    p.background(230);
}


}
new p5(sketch_FSME, 'canvas_FSME');