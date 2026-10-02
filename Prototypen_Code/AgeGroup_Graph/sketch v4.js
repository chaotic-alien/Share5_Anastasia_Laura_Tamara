let data;

// labels 
let ages = ["0 - 16", "17 - 44", "45 - 64", "65 - 84", "85+"];
let years = ["2022", "2023", "2024", "2025"];

// empty list for each age group
let vals = [[], [], [], [], []];

// current year shown in the chart
let currentYear = 3;

// layout settings 
let xStart = 160; // x position where the lines start
let scaleY = 130; // how wide the value is shown (in pixels)

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

}

function draw() {

  background(245);

// title
  noStroke();
  fill(30);
  textAlign(LEFT, CENTER);
  textSize(18);
  text("Incidence rate by age group", 80, 30);

// short explanation under the title

  textSize(12);
  fill(100);
  text("10-year mean incidence", 80, 52);

// current year

  textSize(16);
  fill(30);
  textAlign(CENTER, CENTER);
  text(years[currentYear], 400, 90);

// scale labels

  noStroke();
  fill(100);
  textAlign(CENTER, TOP);
  textSize(11);

  for (let value = 0; value <= 2; value += 0.5) {
    let x = xStart + value * scaleY;
    text(value.toFixed(1), x, 120);

  }

// scale line
  stroke(220);
  strokeWeight(1);
  line(xStart, 140, xStart + 2 * scaleY, 140);

// navigation buttons
  noStroke();
  fill(30);
  textSize(24);
  textAlign(CENTER, CENTER);
  text("<", 80, 90);
  text(">", 720, 90);

// one line for each age group

  for (let a = 0; a < ages.length; a++) {
    drawLine(a);
  }

}



// draws the line for age group a

function drawLine(a) {

  let c = colors[a]; // get color from top
  let val = vals[a][currentYear]; // use the selected year
  let y = 180 + a * 65; // y position of each age group
  let xEnd = xStart + val * scaleY;

// line from 0 to the value

  stroke(c[0], c[1], c[2]);
  strokeWeight(3);
  line(xStart, y, xEnd, y);

// dot at the value

  fill(c[0], c[1], c[2]);
  noStroke();
  circle(xEnd, y, 12);

// age group label

  fill(30);
  textAlign(RIGHT, CENTER);
  textSize(13);
  text(ages[a], xStart - 15, y);

// value at the end

  textAlign(LEFT, CENTER);
  textSize(11);
  text(val.toFixed(2), xEnd + 10, y);

}



// mouse click for the navigation buttons

function mousePressed() {

  if (mouseY > 65 && mouseY < 115) {
    if (mouseX > 50 && mouseX < 110) {
      if (currentYear > 0) {
        currentYear--;
        redraw();
      }

    }

    if (mouseX > 690 && mouseX < 750) {
      if (currentYear < years.length - 1) {
        currentYear++;
        redraw();
      }

    }

  }

}