let data;

// labels 

let ages = ["0 - 16", "17 - 44", "45 - 64", "65 - 84", "85+"];
let years = ["2022", "2023", "2024", "2025"];

// empty list for each age group
let vals = [[], [], [], [], []];

// layout settings 
let xStart = 160; // x position of the first year (2022)
let xStep = 170; // distance between years

let scaleY = 130; // how tall value of 1.0 is (in pixels)
let startY = 400; // shared y position for value 0

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

  data = await loadTable('assets/data.csv', ',', 'header');

  let rows = data.getRowCount();

// loop through each row

  for (let i = 0; i < rows; i++) {

    let category = data.getString(i, 0); // col 0 : valueCategory

// filter cases 10y mean

    if (category === "cases_10y_mean") {

      let year = data.getString(i, 1); // col 1 : time
      let age = data.getString(i, 5); // col 5 : agegroup
      let val = data.getNum(i, 10); // col 10: incValue

      // find the index of the age group and year in the labels
      let a = ages.indexOf(age); // 0 to 4
      let y = years.indexOf(year); // 0 to 3

// save value in correct position in values array

      vals[a][y] = val;

    }

  }

    // find the age group with the highest value
    // the values are already 10y means, so no new average
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

  text(

    "Each year's value is the average of the 10 years before / up to that year. Highest: " + ages[best],

    80,

    52

  );

// horizontal lines for the shared Y scale

  stroke(225);

  strokeWeight(1);

  for (let value = 0; value <= 2; value += 0.5) {

    let y = startY - value * scaleY;

    line(

      xStart,

      y,

      xStart + (years.length - 1) * xStep,

      y

    );

  }

// Y-axis labels

  noStroke();

  fill(100);

  textAlign(RIGHT, CENTER);

  textSize(11);

  for (let value = 0; value <= 2; value += 0.5) {

    let y = startY - value * scaleY;

    text(value.toFixed(1), xStart - 10, y);

  }

// light vertical line for each year

  stroke(220);

  strokeWeight(1);

  for (let y = 0; y < years.length; y++) {
    let x = xStart + y * xStep;
    line(x, startY - 2 * scaleY,x, startY);
  }

// one line for each group

  for (let a = 0; a < ages.length; a++) {
    drawLine(a);
  }

  drawYears(); // year labels

}



// draws the line for age group a

function drawLine(a) {

  let c = colors[a]; // get color from top

// line connecting the 4 data points

  noFill();
  stroke(c[0], c[1], c[2]);
  strokeWeight(a === best ? 2.5 : 1.5);
  beginShape();

  for (let y = 0; y < years.length; y++) {
    let x = xStart + y * xStep;
    let py = startY - vals[a][y] * scaleY;
    vertex(x, py);
  }

  endShape(); // no CLOSE, so the line stays open



// a dot on each of the 4 data points

  fill(255);
  stroke(80); // dark gray, same for every group
  strokeWeight(1.5);
  for (let y = 0; y < years.length; y++) {
    let x = xStart + y * xStep;
    let py = startY - vals[a][y] * scaleY;
    circle(x, py, 7);
  }



// age group label at the end of the line

  noStroke();
  fill(c[0], c[1], c[2]);
  textAlign(LEFT, CENTER);
  textSize(12);
  let lastX = xStart + (years.length - 1) * xStep;
  let lastY = startY - vals[a][years.length - 1] * scaleY;
  text(ages[a], lastX + 10, lastY);



// value labels above the dots, only for the highest group

  if (a === best) {
    textAlign(CENTER, BOTTOM);
    textSize(11);
    fill(30);

    for (let y = 0; y < years.length; y++) {
      let x = xStart + y * xStep;
      let py = startY - vals[a][y] * scaleY;
      text(vals[a][y].toFixed(2), x, py - 8);

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
    text(years[y], x,startY + 30 );
  }

}