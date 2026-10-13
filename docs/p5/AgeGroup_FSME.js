// To convert everything to work with D3 language, I asked AI help translate my original var
// I went step by step to make sure the code works as intended. I also added comments to explain what each part does.

function AgeGroup_FSME(p) {


  let data;
  // labels
  let ages = ["0 - 16", "17 - 44", "45 - 64", "65 - 84", "85+"];

  let years = ["2022", "2023", "2024", "2025"];


  //Pink Now 
  let brightestBlue = [249, 168, 212];
  let darkestBlue = [131, 24, 67];

  // values
  let vals = [[], [], [], []];
  let maxValue = 1;

  // random dot positions for each age group
  let dotPositions = [[], [], [], [], []];

  // slider
  let yearSlider;
  let currentYear = 3;

  // async + await ersetzt die preload function
  p.setup = async function () {

    

    // wait until csv completely loaded
    data = await d3.csv("assets/FSME_oblig/data.csv");


    let canvas = p.createCanvas(350, 420);
    canvas.parent("c_AgeGroup_FSME");
    p.noLoop();
    p.angleMode(p.DEGREES);
   

    // create year slider – Asked Co-Pilot to create it
    yearSlider = p.createSlider(0, 3, currentYear, 1);
    yearSlider.parent("c_AgeGroup_FSME");

    yearSlider.input(function () {
      currentYear = yearSlider.value();
      p.redraw();
    });

    // loop through each row
    for (let row of data) {

      // filter cases 10y mean 
      if (
        row.valueCategory === "cases_10y_mean" &&
        row.temporal_type === "year" &&
        row.georegion === "CHFL"
      ) {

        let y = years.indexOf(row.temporal);
        let a = ages.indexOf(row.agegroup);
        let incValue = Number(row.incValue);

        // save value in correct position in values array
        if (
          y !== -1 &&
          a !== -1 &&
          row.incValue != null &&
          String(row.incValue).trim() !== "" &&
          Number.isFinite(incValue)
        ) {
          vals[y][a] = incValue * 10;
        }
      }
    }

    // find highest valid value for the color scale
    let validValues = vals.flat().filter(val => Number.isFinite(val));
    maxValue = d3.max(validValues) || 1;

    // create random dot positions inside each circle
    for (let a = 0; a < ages.length; a++) {

      while (dotPositions[a].length < 60) {

        let angle = p.random(360);
        let distance = p.sqrt(p.random()) * 34;

        let x = p.cos(angle) * distance;
        let y = p.sin(angle) * distance;

        // check that dots don't overlap!!! 
        let overlaps = false;

        for (let dot of dotPositions[a]) {
          if (p.dist(x, y, dot.x, dot.y) < 6) {
            overlaps = true;
            break;
          }
        }

        if (!overlaps) {
          dotPositions[a].push({ x: x, y: y });
        }

      }

    }


    p.redraw();

  };




  p.draw = function () {

    p.background(250);

    // current period
    p.noStroke();
    p.textAlign(p.LEFT, p.CENTER);
    p.textStyle(p.BOLD);
    p.textSize(13);
    p.fill(25, 45, 60);
    p.text((2012 + currentYear) + " – " + (2022 + currentYear), 35, 105);

    p.line(35, 38, p.width - 35, 38);

    // draw all age groups horizontally
    for (let a = 0; a < ages.length; a++) {
      drawCircle(a);
    }


    // small markers under the slider, one for every year
    p.stroke(170, 178, 185);
    p.strokeWeight(1);

    for (let i = 0; i < years.length; i++) {
      let x = 44 + i * (262 / 3);
      p.line(x, 380, x, 386);
    }

    // slider years labels 
    p.noStroke();
    p.textStyle(p.NORMAL);
    p.textSize(10);
    p.textAlign(p.CENTER, p.CENTER);

    for (let i = 0; i < years.length; i++) {
      let x = 44 + i * (262 / 3);

      p.fill(100, 110, 118);
      p.textStyle(p.NORMAL);
      p.text((2012 + i) + " – " + (2022 + i), x, 398);

    }

    // legend
    p.fill(35, 50, 60);
    p.textSize(10);
    p.text(
      "1 Punkt ≈ 1 Fall pro 1 Million Einwohner:innen",
      p.width / 2,
      20
    );

  };


  function drawCircle(a) {

    // value for this age group
    let val = vals[currentYear][a];

    // position: 3 circles in the first row, 2 in the second row
    let row = a < 3 ? 0 : 1;
    let col = a < 3 ? a : a - 3;
    let circlesInRow = row === 0 ? 3 : 2;
    let centerX = p.width / 2 + (col - (circlesInRow - 1) / 2) * 99;
    let centerY = 95 + row * 140;

    // draw background circle
    p.fill(250);
    p.stroke(215, 223, 228);
    p.strokeWeight(1);
    p.circle(centerX, centerY, 82);

    // unavailable values
    if (!Number.isFinite(val)) {

      p.noStroke();
      p.fill(150, 160, 165);
      p.textAlign(p.CENTER, p.CENTER);
      p.textStyle(p.BOLD);
      p.textSize(10);
      p.text("k.A.", centerX, centerY + 72);

      drawAgeGroupLabel(a, centerX, centerY);

      return;
    }

    // calculate number of dots
    let dotAmount = Math.round(val);

    // calculate color based on the ranking of age groups
    let yearValues = vals[currentYear].filter(val => Number.isFinite(val));
    let rankedValues = [...new Set(yearValues)].sort((a, b) => a - b);

    let colorAmount = rankedValues.length > 1 ? rankedValues.indexOf(val) / (rankedValues.length - 1) : 0;

    let r = p.lerp(brightestBlue[0], darkestBlue[0], colorAmount);
    let g = p.lerp(brightestBlue[1], darkestBlue[1], colorAmount);
    let b = p.lerp(brightestBlue[2], darkestBlue[2], colorAmount);

    // draw dots
    p.noStroke();
    p.fill(r, g, b);

    for (let i = 0; i < dotAmount; i++) {
      let dot = dotPositions[a][i];
      p.circle(centerX + dot.x, centerY + dot.y, 5);
    }

    // value
    p.fill(35, 50, 60);
    p.textAlign(p.CENTER, p.CENTER);
    p.textStyle(p.NORMAL);
    p.textSize(10);
    p.text("≈ " + dotAmount + " Fälle", centerX, centerY + 72);

    // age group label
    drawAgeGroupLabel(a, centerX, centerY);
  }

  function drawAgeGroupLabel(a, centerX, centerY) {
    p.fill(35, 50, 60);
    p.textAlign(p.CENTER, p.CENTER);
    p.textStyle(p.BOLD);
    p.textSize(10);
    p.text(ages[a].replace(" - ", " – ") + " J.", centerX, centerY + 55);
  }

  // Close the AgeGroup_FSME function here
}

// Start the sketch outside the function
new p5(AgeGroup_FSME, "c_AgeGroup_FSME");