// To convert everything to work with D3 language, I asked AI help translate my original var
// I went step by step to make sure the code works as intended.
// I also added comments to explain what each part does.

function AgeGroup_FSME(p) {

  let data;

  // Font
  let font;

  // Labels
  let ages = ["0 - 16", "17 - 44", "45 - 64", "65 - 84", "85+"];

  let years = ["2022", "2023", "2024", "2025"];

  // Pink color scale
  let brightestBlue = [251, 207, 232];
  let darkestBlue = [157, 23, 77];

  // Circle size
  let circleSize = 100;

  // Values
  let vals = [[], [], [], []];
  let maxValue = 1;

  // Slider
  let yearSlider;
  let currentYear = 3;


  // async + await replaces the preload function
  p.setup = async function () {

    // Wait until CSV is completely loaded
    data = await d3.csv("assets/FSME_oblig/data.csv");

    font = await p.loadFont("assets/fonts/NotoSans-Regular.ttf");
    p.textFont(font);
    p.textSize(16);

    let canvas = p.createCanvas(370, 420);
    canvas.parent("c_AgeGroup_FSME");

    p.noLoop();
    p.angleMode(p.DEGREES);

    // Create year slider
    yearSlider = p.createSlider(0, 3, currentYear, 1);
    yearSlider.parent("c_AgeGroup_FSME");

    yearSlider.input(function () {
      currentYear = Number(yearSlider.value());
      p.redraw();
    });

    // Loop through each row
    for (let row of data) {

      // Filter 10-year average cases
      if (
        row.valueCategory === "cases_10y_mean" &&
        row.temporal_type === "year" &&
        row.georegion === "CHFL"
      ) {

        let y = years.indexOf(row.temporal);
        let a = ages.indexOf(row.agegroup);
        let incValue = Number(row.incValue);

        // Save value in the correct position in the values array
        if (y !== -1
          && a !== -1
          && row.incValue != null
          && String(row.incValue).trim() !== ""
          && Number.isFinite(incValue)) {
          vals[y][a] = incValue * 10;
        }
      }
    }

    // Find the highest valid value in the data
    maxValue = d3.max(
      vals.flat().filter(val => Number.isFinite(val))
    ) || 1;

    p.redraw();
  };


  p.draw = function () {

    p.background(255);
    p.textFont(font);

    // Draw all five age groups
    for (let a = 0; a < ages.length; a++) {
      drawCircle(a);
    }

    // Color legend
    drawLegend();

    // Explanation of the values
    //drawUnitNote();


    // Small markers under the slider, one for every year
    // (same as in the Karte: years with a label get a slightly longer marker)
    p.stroke(31, 41, 55);
    p.strokeWeight(1);

    for (let i = 0; i < years.length; i++) {
      let x = 9 + i * (352 / (years.length - 1));
      let markerLength = i % 2 === 0 ? 6 : 4;
      p.line(x, 380, x, 380 + markerLength);
    }

    // Slider labels
    p.noStroke();
    p.fill(31, 41, 55);
    p.textStyle(p.NORMAL);
    p.textSize(10);
    p.textAlign(p.CENTER, p.CENTER);

    for (let i = 0; i < years.length; i++) {
      let x = 9 + i * (352 / (years.length - 1));

      p.text(
        (2012 + i) + " – " + (2022 + i),
        p.constrain(x, 30, p.width - 30),
        393
      );
    }
  }



  function drawCircle(a) {

    // Value for this age group
    let val = vals[currentYear][a];

    // Position: three circles in the first row, two in the second row
    let row = a < 3 ? 0 : 1;
    let col = a < 3 ? a : a - 3;
    let circlesInRow = row === 0 ? 3 : 2;

    // Keep a consistent margin on the left and right
    let centerX =
      p.width / 2 +
      (col - (circlesInRow - 1) / 2) *
      ((p.width - circleSize) / 2);

    let centerY = 130 + row * 127;


    // Unavailable values
    if (!Number.isFinite(val)) {

      // Draw an empty background circle
      p.fill(250);
      p.stroke(215, 223, 228);
      p.strokeWeight(1);
      p.circle(centerX, centerY, circleSize);

      p.noStroke();
      p.fill(31, 41, 55);
      p.textAlign(p.CENTER, p.CENTER);
      p.textStyle(p.BOLD);
      p.textSize(11);
      p.text("k.A.", centerX, centerY);

      drawAgeGroupLabel(a, centerX, centerY);

      return;
    }


    // Display the rounded value without changing the underlying data
    let displayValue = Math.round(val);


    // Calculate color based on the ranking of age groups for the selected year
    let yearValues = vals[currentYear].filter(
      val => Number.isFinite(val)
    );

    let rankedValues = [...new Set(yearValues)].sort(
      (a, b) => a - b
    );

    let colorAmount =
      rankedValues.length > 1
        ? rankedValues.indexOf(val) / (rankedValues.length - 1)
        : 0;


    // Interpolate between the lightest and darkest pink
    let r = p.lerp(
      brightestBlue[0],
      darkestBlue[0],
      colorAmount
    );

    let g = p.lerp(
      brightestBlue[1],
      darkestBlue[1],
      colorAmount
    );

    let b = p.lerp(
      brightestBlue[2],
      darkestBlue[2],
      colorAmount
    );


    // Draw the circle using the color for this age group's value
    p.fill(r, g, b);
    p.noStroke();
    p.circle(centerX, centerY, circleSize);


    // Choose text color for sufficient contrast
    if (colorAmount >= 0.65) {
      p.fill(255);
    } else {
      p.fill(79, 18, 53);
    }

    p.textAlign(p.CENTER, p.CENTER);
    p.textStyle(p.BOLD);
    p.textSize(23);

    // Main number inside the circle
    p.text(displayValue, centerX, centerY - 6);


    // label inside the circle
    p.textSize(10);
    p.textStyle(p.NORMAL);
    p.text("Fälle", centerX, centerY + 15);


    // Age group label below the circle
    drawAgeGroupLabel(a, centerX, centerY);
  }


  function drawAgeGroupLabel(a, centerX, centerY) {

    p.noStroke();
    p.fill(31, 41, 55);
    p.textAlign(p.CENTER, p.CENTER);
    p.textStyle(p.BOLD);
    p.textSize(10);

    // Position the label a little below the circle
    p.text(
      ages[a].replace(" - ", " – ") + " J.",
      centerX,
      centerY + circleSize / 2 + 14
    );
  }


  function drawLegend() {

    // Legend position
    let margin = 0;
    let x = margin;
    let y = 1;
    let legendWidth = 125;

    p.textSize(10);
    p.textStyle(p.NORMAL);
    p.noStroke();

    // Draw five color steps between the lightest and darkest pink
    let steps = 5;
    let gap = 1;
    let blockWidth =
      (legendWidth - gap * (steps - 1)) / steps;

    for (let i = 0; i < steps; i++) {

      let colorAmount = i / (steps - 1);

      let legendColor = p.lerpColor(
        p.color(brightestBlue),
        p.color(darkestBlue),
        colorAmount
      );

      p.fill(legendColor);

      p.rect(
        x + i * (blockWidth + gap),
        y,
        blockWidth,
        6
      );
    }

    // Legend labels
    p.fill(31, 41, 55);
    p.textAlign(p.LEFT, p.CENTER);
    p.text("Niedrigste", x, y + 15);

    p.textAlign(p.RIGHT, p.CENTER);
    p.text("Höchste", x + legendWidth, y + 15);

    p.textAlign(p.LEFT, p.CENTER);
  }


  /*function drawUnitNote() {

    // Explains what the numbers mean
    p.noStroke();
    p.fill(31, 41, 55);
    p.textAlign(p.CENTER, p.CENTER);
    p.textStyle(p.NORMAL);
    p.textSize(10);

    p.text(
      "Fälle pro 1 Million Einwohner:innen · 10-Jahres-Durchschnitt",
      p.width / 2,
      345
    );
  }*/

}


// Start the sketch outside the function
new p5(AgeGroup_FSME, "c_AgeGroup_FSME");