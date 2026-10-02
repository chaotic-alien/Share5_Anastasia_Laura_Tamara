let data;
 
// labels 
let ages= ["0 - 16", "17 - 44", "45 - 64", "65 - 84", "85+"];
let years = ["2022", "2023", "2024", "2025"];
 
 
//empty list for each age group
let vals = [[], [], [], [], []]
 
// layout settings 
let xStart = 160; // x position of the first year (2022)
let xStep = 170;// distance between years 
let scaleY = 50; // how tall value of 1.0 is (in pixels) 
let startY= 150; // y position of the first baseline
let gap = 110; // distance between baseline groups
 
 
// index of the age group with the highest value (used for the highlight)
let best = 0;
 
// one color for each age group (same order as the ages list)
let colors = [
  [52, 152, 219],   // blue 0 - 16
  [46, 204, 113],   // green 17 - 44
  [241, 196, 15],   // yellow 45 - 64
  [231, 76, 60],    // red 65 - 84
  [214, 51, 132]    // magenta 85+
];
 
 
async function setup() {
  createCanvas(800, 600);
  noLoop();
 
 
  // wait until csv completely loaded
  data = await loadTable('assets/data.csv',',','header');
 
  let rows = data.getRowCount();
 
  //loop through each row
  for (let i = 0; i < rows; i++) {
    let category = data.getString(i, 0); // col 0 : valueCategory
 
 
    // filter cases 10y mean
    if (category === "cases_10y_mean"){
      let year= data.getString (i,1); // col 1 : time
      let age = data.getString (i,5); // col 5 : agegroup
      let val = data.getNum (i,10); // col 10: incValue
 
 
      // find the index of the age group and year in the labels
      let a = ages.indexOf(age);// 0 to 4
      let y = years.indexOf(year); // 0 to 3 
 
 
      // save value in correct position in values array
      vals[a][y] = val;
    }
  }
 
  // find the age group with the highest value (the values are already 10y means, so no new average)
  for (let a = 0; a < ages.length; a++) {
 
    // is the biggest of the 4 yearly values higher than the best so far?
    if (max(vals[a]) > max(vals[best])) {
      best = a;
    }
  }
}
 
 
function draw() {
  background(245);
 
   // title
  noStroke();
  fill(30);
  textAlign(LEFT, CENTER);
  textSize(18);
  text("Incidence rate by age group, 2022-2025", 80, 30);
 
  // short explanation under the title
  textSize(12);
  fill(100);
  text( "Each year's value is the average of the 10 years before / up to that year. Highest:"  + ages[best], 80, 52);
 
  // light vertical line for each year
  stroke(220);
  strokeWeight(1);
  for (let y = 0; y < years.length; y++) {
    let x = xStart + y * xStep;
    line(x, startY - 70, x, startY + (ages.length - 1) * gap);
  }
 
  // one wave for each group
  for (let a = 0; a < ages.length; a++) {
    drawWave(a);
  }
 
  drawYears();   // year labels
}
 
 
// value of wave a at any x position (between the year points) (Claude help for ease function!!)
function getValue(a, x) {
 
  // between two years: find which two, then blend between them using S-curve
  let t = (x - xStart) / xStep; // 0 to 3
  let i = floor(t); // the year before x
  if (i > 2) {
    i = 2; // stay inside the list
  }
  let f = t - i; // 0 to 1 between the two years
  return lerp(vals[a][i], vals[a][i + 1], ease(f));
}
 
 
// turns a straight 0 to 1 into a smooth S-shaped 0 to 1 (Asked Claude)
function ease(f) {
  return (1 - cos(f * PI)) / 2;
}
 
 
function drawWave(a){
 
  let base = startY + a *gap;   // y position of the waves each lower that the last 
  let xLeft = xStart ; // where the wave starts
  let xRight = xStart + 3 * xStep; // where the wave ends
 
 
  // baseline
  stroke(200);
  strokeWeight(1);
  line(xLeft, base, xRight, base);
 
  // filled area with a flat bottom
  let c = colors[a]; // get color from top
  noStroke();
  fill(c[0], c[1], c[2]); // set fill color, solid
  beginShape();
  vertex(xLeft, base); // start on the baseline
  for (let x = xLeft; x <= xRight; x += 5) {
    vertex(x, base - getValue(a, x) * scaleY); // bigger value = higher up
  }
  vertex(xRight, base); // end on the baseline
  endShape(CLOSE);
 
  // outline along the top only (same for every group, in the group's own color)
  noFill();
  stroke(c[0], c[1], c[2]);
  strokeWeight(1.5);
  beginShape();
  for (let x = xLeft; x <= xRight; x += 5) {
    vertex(x, base - getValue(a, x) * scaleY);
  }
  endShape(); // no CLOSE, so no line along the bottom
 
  // a dot on each of the 4 data points
  fill(255);
  stroke(80); // dark gray, same for every group
  strokeWeight(1.5);
  for (let y = 0; y < years.length; y++) {
    let x = xStart + y * xStep;           // move right for each year
    let py = base - vals[a][y] * scaleY;  // bigger value = higher up
    circle(x, py, 7);
  }
 
  // age group label on the left 
  noStroke();
  fill(3);
  textAlign(RIGHT, BOTTOM);
  textSize(13);
  text(ages[a], xLeft - 10, base);
 
  // value labels above the dots, only for the highest group
  if (a === best) {
    textAlign(CENTER, BOTTOM);
    textSize(11);
    for (let y = 0; y < years.length; y++) {
      let x = xStart + y * xStep;
      text(vals[a][y].toFixed(2), x, base - vals[a][y] * scaleY - 8); // 2 decimals
    }
  }
}
 
// year labels at the bottom
function drawYears() {
  noStroke();
  fill(30);
  textAlign(CENTER, TOP);
  textSize(13);
 
  for (let y = 0; y < years.length; y++) {
    let x = xStart + y * xStep;
    text(years[y], x, startY + (ages.length - 1) * gap + 30);
  }
}
 
