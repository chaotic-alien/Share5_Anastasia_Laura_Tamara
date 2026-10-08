function AgeGroup_FSME(p) {
  let data;

  // labels
  let ages = ["0 - 16", "17 - 44", "45 - 64", "65 - 84", "85+"];

  let years = ["2022", "2023", "2024", "2025"];

  // colors
  let brightestBlue = [150, 210, 235];

  let darkestBlue = [10, 60, 110];

  // values
  let vals = [[], [], [], []];

  // slider
  let yearSlider;

  let currentYear = 3;

  // async + await ersetzt die preload function
  p.setup = async function () {
    let canvas = p.createCanvas(600, 500);

    console.log("test");
    canvas.parent("c_AgeGroup_FSME");

    p.noLoop();

    // create year slider – Asked Co-Pilot to create it
    yearSlider = p.createSlider(0, 3, currentYear, 1);

    yearSlider.parent("c_AgeGroup_FSME");

    yearSlider.input(function () {
      currentYear = yearSlider.value();

      p.redraw();
    });

    // wait until csv completely loaded
    data = await p.loadTable("assets/FSME_oblig/data.csv", ",", "header");

    let rows = data.getRowCount();

    // loop through each row
    for (let i = 0; i < rows; i++) {
      let category = data.getString(i, 0); // col 0 : valueCategory

      // filter cases 10y mean
      if (category === "cases_10y_mean") {
        let year = data.getString(i, 1); // col 1 : time

        let age = data.getString(i, 5); // col 5 : agegroup

        let y = years.indexOf(year);

        let a = ages.indexOf(age);

        // save value in correct position in values array
        if (y !== -1 && a !== -1) {
          let val = Number(data.getString(i, 10)); // col 10: incValue

          if (Number.isFinite(val)) {
            vals[y][a] = val;
          }
        }
      }
    }

    p.redraw();
  };

  p.draw = function () {
    p.background(250);

    // title
    p.noStroke();

    p.fill(25, 45, 60);

    p.textAlign(p.LEFT, p.CENTER);

    p.textSize(19);

    p.textStyle(p.BOLD);

    p.text("Verteilung nach Altersklassen", 35, 35);

    // explanation under the title
    p.textStyle(p.NORMAL);

    p.textSize(11);

    p.fill(100, 110, 118);

    p.text(
      "Durchschnittliche Fälle pro 1 Million Einwohner:innen der letzten 10 Jahre",
      35,
      59,
    );

    // current period
    p.textStyle(p.BOLD);

    p.textSize(13);

    p.fill(25, 45, 60);

    p.text(2012 + currentYear + " – " + (2022 + currentYear), 35, 105);

    // small divider
    p.stroke(220, 225, 228);

    p.strokeWeight(1);

    p.line(35, 125, p.width - 35, 125);

    // draw all age groups horizontally
    for (let a = 0; a < ages.length; a++) {
      drawCircle(a);
    }

    // slider years / Labels
    p.noStroke();

    p.fill(100, 110, 118);

    p.textStyle(p.NORMAL);

    p.textSize(10);

    p.textAlign(p.LEFT, p.CENTER);

    p.text("2022", 155, 438);

    p.textAlign(p.RIGHT, p.CENTER);

    p.text("2025", 445, 438);

    // slider explanation
    p.textAlign(p.CENTER, p.CENTER);

    p.textSize(10);

    p.fill(100, 110, 118);

    p.text("Jahr auswählen", p.width / 2, 460);

    // legend
    p.fill(35, 50, 60);

    p.textSize(10);

    p.text("1 Punkt ≈ 1 Fall pro 1 Million Einwohner:innen", p.width / 2, 480);
  };

  function drawCircle(a) {
    // value for this age group
    let val = vals[currentYear][a];

    // position
    let leftMargin = 75;

    let rightMargin = 75;

    let usableWidth = p.width - leftMargin - rightMargin;

    let spacing = usableWidth / (ages.length - 1);

    let centerX = leftMargin + a * spacing;

    let centerY = 205;

    // big circle – background circle
    p.stroke(205, 220, 226);

    p.strokeWeight(2);

    p.fill(248, 250, 251);

    p.circle(centerX, centerY, 82);

    // calculate number of dots
    let dotAmount = p.round(val * 10);

    // calculate color
    let colorAmount = p.map(dotAmount, 3, 20, 0, 1);

    let r = p.lerp(brightestBlue[0], darkestBlue[0], colorAmount);

    let g = p.lerp(brightestBlue[1], darkestBlue[1], colorAmount);

    let b = p.lerp(brightestBlue[2], darkestBlue[2], colorAmount);

    // draw population dots
    drawDots(centerX, centerY, dotAmount, r, g, b);

    // value
    p.noStroke();

    p.fill(35, 50, 60);

    p.textAlign(p.CENTER, p.CENTER);

    p.textStyle(p.BOLD);

    p.textSize(10);

    p.text("≈ " + dotAmount + " Fälle / 1 Mio.", centerX, centerY + 57);

    // age group label
    p.fill(35, 50, 60);

    p.textAlign(p.CENTER, p.CENTER);

    p.textStyle(p.BOLD);

    p.textSize(11);

    p.text(ages[a], centerX, centerY + 78);
  }

  function drawDots(centerX, centerY, dotAmount, r, g, b) {
    // positions for dots inside the big circle AI HELP to define correct positions for the dots in a circle pattern

    // using random made dots overlap each other and counting was difficult
    let positions = [
      [-12, -24],

      [0, -24],

      [12, -24],

      [-24, -12],

      [-12, -12],

      [0, -12],

      [12, -12],

      [24, -12],

      [-24, 0],

      [-12, 0],

      [0, 0],

      [12, 0],

      [24, 0],

      [-12, 12],

      [0, 12],

      [12, 12],

      [-12, 24],

      [0, 24],

      [12, 24],

      [-6, 34],
    ];

    // draw dots
    p.noStroke();

    p.fill(r, g, b);

    for (let i = 0; i < dotAmount; i++) {
      p.circle(centerX + positions[i][0], centerY + positions[i][1], 6);
    }
  }
}

// start the p5 sketch inside the website element
new p5(AgeGroup_FSME, "c_AgeGroup_FSME");
