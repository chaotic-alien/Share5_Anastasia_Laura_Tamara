function Karte_FSME(p) {
  let data;
  let mapData;

  // labels
  let years = Array.from({ length: 13 }, (_, i) => String(2013 + i));

  let cantons = [
    "AG",
    "AI",
    "AR",
    "BE",
    "BL",
    "BS",
    "FR",
    "GE",
    "GL",
    "GR",
    "JU",
    "LU",
    "NE",
    "NW",
    "OW",
    "SG",
    "SH",
    "SO",
    "SZ",
    "TG",
    "TI",
    "UR",
    "VD",
    "VS",
    "ZG",
    "ZH",
  ];

  // colors - change these values to change the map colors
  let brightest = [185, 220, 240];
  let darkest = [0, 75, 145];

  // color of the lines between cantons
  let cantonBorderCol = [80, 80, 80];

  // highest incidence in the selected year
  // used as the maximum for the color scale
  let maxIncidence = 0;

  // empty arrays for the values
  // each array contains the values for each year
  let cases = Array.from({ length: years.length }, () => []);
  let populations = Array.from({ length: years.length }, () => []);
  let incidences = Array.from({ length: years.length }, () => []);

  // current year -> year that is shown from the beginning
  // 0 = 2013, 1 = 2014, etc.
  let currentYear = years.length - 1;

  // selected canton -> starts with no canton selected
  let selectedCanton = null;

  // async + await ersetzt die preload function
  p.setup = async function () {
    let canvas = p.createCanvas(500, 1000);

    data = await d3.csv("assets/FSME_oblig/data.csv");

    console.log(data);

    // load the geojson
    mapData = await p.loadJSON("assets/data_Karte/canton.geojson");

    // loop through each row of the csv
    for (let row of data) {
      // The CSV uses the columns value, pop, and incValue.
      if (
        row.valueCategory === "cases" &&
        row.georegion_type === "canton" &&
        row.temporal_type === "year"
      ) {
        let yearIndex = years.indexOf(row.temporal);
        let canton = row.georegion;

        if (yearIndex !== -1 && cantons.includes(canton)) {
          cases[yearIndex][canton] = toNumber(row.value);
          populations[yearIndex][canton] = toNumber(row.pop);
          incidences[yearIndex][canton] = toNumber(row.incValue);
        }
      }
    }

    // draw after the data is loaded
    p.redraw();
  };

  p.draw = function () {
    p.background(250);

    //calculate the highest incidence for the selected year
    // used as the maximum for the map colors and ranking bars
    maxIncidence =
      d3.max(cantons, (canton) => incidences[currentYear][canton] || 0) || 1;

    // main margin
    let margin = 35;

    // title
    p.fill(20);
    p.noStroke();
    p.textAlign(p.LEFT);
    p.textSize(24);
    p.text("Verteilung nach Kantonen", margin, 40);

    p.textSize(14);
    p.fill(90);
    p.text("Fälle pro 100 000 Einwohner:innen", margin, 65);

    // draw visualization sections
    drawYearButtons();
    drawSelectedCanton();
    drawMap();
    drawLegend();
    drawRanking();
  };

  function drawMap() {
    // map size and position
    let mapLeft = 35;
    let mapRight = p.width - 35;
    let mapTop = 240;
    let mapBottom = 540;

    // loop through every canton in the geojson
    for (let feature of mapData.features) {
      let canton = feature.properties.canton;
      let coordinates = feature.geometry.coordinates;

      // get the incidence for the selected year
      let incidenceValue = incidences[currentYear][canton] || 0;

      // calculate color from incidence
      // 0 incidence = grey
      // higher incidence = darker color
      let cantonColor;

      if (incidenceValue === 0) {
        cantonColor = p.color(220);
      } else {
        // sqrt makes lower values easier to see instead of letting the highest value dominate the scale
        // AI help how I could fix my color problem the colors were too similar before
        let colorAmount = Math.sqrt(incidenceValue / maxIncidence);

        cantonColor = p.lerpColor(
          p.color(brightest),
          p.color(darkest),
          colorAmount,
        );
      }

      // selected canton becomes slightly darker grey
      if (canton === selectedCanton) {
        cantonColor = p.lerpColor(cantonColor, p.color(0), 0.18);
      }

      // draw canton
      p.fill(cantonColor);
      p.stroke(cantonBorderCol);
      p.strokeWeight(0.7);

      // some cantons have more than one polygon
      // loop through all polygons and draw them separately
      for (let polygon of coordinates) {
        p.beginShape();

        for (let point of polygon[0]) {
          // convert geo coordinates into canvas coordinates
          // AI help on how to do this
          let x = p.map(point[0], 5.8, 10.6, mapLeft, mapRight);

          let y = p.map(point[1], 45.8, 47.9, mapBottom, mapTop);

          p.vertex(x, y);
        }

        p.endShape(p.CLOSE);
      }
    }
  }

  function drawYearButtons() {
    // left and right margin ( map = 35)
    let margin = 35;

    // divide the available width between the years same spacing for each button X axis
    let buttonWidth = (p.width - margin * 2) / years.length;

    // position of the year buttons Y axis
    let y = 100;

    // year label
    p.textSize(12);
    p.fill(80);
    p.noStroke();
    p.textAlign(p.LEFT);
    p.text("Jahr", margin, y);

    // loop through years and draw one button for each
    for (let i = 0; i < years.length; i++) {
      let x = margin + i * buttonWidth;

      // Button colors
      // selected year button = blue
      // other buttons = light grey
      if (i === currentYear) {
        p.fill(0, 75, 145);
      } else {
        p.fill(235);
      }

      // button shape - round corners (4)
      p.rect(x, y + 12, buttonWidth - 4, 28, 4);

      // Button text color
      // selected year = white text
      // other years = dark text
      if (i === currentYear) {
        p.fill(255);
      } else {
        p.fill(50);
      }

      // text position in button
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(12);

      p.text(years[i], x + (buttonWidth - 4) / 2, y + 26);
    }

    p.textAlign(p.LEFT);
  }

  function drawSelectedCanton() {
    // don't draw if no canton is selected
    if (selectedCanton === null) {
      return;
    }

    // get information for selected canton popup
    let incidenceValue = incidences[currentYear][selectedCanton] || 0;
    let cantonCases = cases[currentYear][selectedCanton] || 0;
    let population = populations[currentYear][selectedCanton] || 0;

    // popup position and size
    let margin = 35;
    let bubbleWidth = 250;
    let bubbleHeight = 82;

    // popup position
    let x = p.width - margin - bubbleWidth;
    let y = 150;

    // popup style (how it looks)
    p.fill(255);
    p.stroke(220);
    p.strokeWeight(1);
    p.rect(x, y, bubbleWidth, bubbleHeight, 6);

    // canton name in pop up
    p.fill(20);
    p.noStroke();
    p.textAlign(p.LEFT);
    p.textSize(15);

    p.text(
      getCantonName(selectedCanton) + " · " + selectedCanton,
      x + 12,
      y + 21,
    );

    // incidence value in popup
    p.textSize(13);

    p.text(
      incidenceValue.toFixed(1) + " cases per 100,000 people",
      x + 12,
      y + 43,
    );

    // cases and population in pop up rounded so it's easier for laien
    p.textSize(10);
    p.fill(100);

    p.text(
      Math.round(cantonCases) +
        " reported cases among " +
        Math.round(population).toLocaleString("de-CH") +
        " inhabitants",
      x + 12,
      y + 64,
    );
  }

  function drawLegend() {
    // legend position
    let margin = 35;
    let x = margin;
    let y = 580;

    // legend uses the same width as the map but multiplication makes it smaller
    let legendWidth = p.width - margin * 9.7;

    p.textSize(12);
    p.fill(80);
    p.noStroke();

    // color gradient
    // loop through the width of the legend and draw a rectangle for each pixel
    // with a color between the brightest and darkest color
    for (let i = 0; i < legendWidth; i++) {
      let colorAmount = i / (legendWidth - 1);

      let legendColor = p.lerpColor(
        p.color(brightest),
        p.color(darkest),
        colorAmount,
      );

      p.fill(legendColor);
      p.rect(x + i, y, 1, 12);
    }

    // legend labels
    p.fill(80);
    p.textAlign(p.LEFT);
    p.text("Lowest", x, y + 25);

    p.textAlign(p.RIGHT);
    p.text("Highest", x + legendWidth, y + 25);

    p.textAlign(p.LEFT);
  }

  function drawRanking() {
    let ranking = [];

    // create ranking from all cantons
    for (let canton of cantons) {
      let incidenceValue = incidences[currentYear][canton] || 0;

      ranking.push({
        canton: canton,
        incidence: incidenceValue,
      });
    }

    // sort highest to lowest
    ranking.sort(function (a, b) {
      return b.incidence - a.incidence;
    });

    // only show top 5
    ranking = ranking.slice(0, 5);

    // ranking position
    let x = 35;
    let y = 660;

    // title
    p.noStroke();
    p.fill(20);
    p.textSize(16);
    p.textAlign(p.LEFT);
    p.text("Höchste Inzidenz", x, y);

    // subtitle
    p.textSize(11);
    p.fill(100);
    p.text("Top 5 Kantone - Cases per 100'000 inhabitants", x, y + 20);

    // ranking bars
    for (let i = 0; i < ranking.length; i++) {
      let rankingItem = ranking[i];

      let barY = y + 40 + i * 40;

      // canton name
      p.fill(30);
      p.textSize(12);

      p.text(rankingItem.canton, x, barY + 12);

      // background bar for reference
      p.fill(235);

      p.rect(x + 35, barY, 190, 18, 3);

      // incidence bar - value
      p.fill(20, 80, 120);

      let barWidth = p.map(rankingItem.incidence, 0, maxIncidence, 0, 190);

      p.rect(x + 35, barY, barWidth, 18, 3);

      // value at the end
      p.fill(30);
      p.textAlign(p.RIGHT);

      p.text(rankingItem.incidence.toFixed(1) + " Cases", x + 300, barY + 8);

      p.textAlign(p.LEFT);
    }
  }

  // testing click function AI help in defining the function correctly so that it can detect clicks on the year buttons and the cantons
  p.mousePressed = function () {
    // first check if the click was on one of the year buttons
    let margin = 35;
    let buttonWidth = (p.width - margin * 2) / years.length;

    // check each year button one by one
    for (let i = 0; i < years.length; i++) {
      // calculate where the current button starts
      let x = margin + i * buttonWidth;

      // check if the mouse position is inside the current button
      if (
        p.mouseX > x &&
        p.mouseX < x + buttonWidth - 4 &&
        p.mouseY > 112 &&
        p.mouseY < 140
      ) {
        // use the button number to change the current year
        currentYear = i;

        // changing year removes the selected canton
        selectedCanton = null;

        // redraw the map with the new year
        p.redraw();

        // stop here because the click was already used for the year button
        return;
      }
    }

    // if no year button was clicked, check if a canton was clicked
    let clickedCanton = findCanton(p.mouseX, p.mouseY);

    // if findCanton found a canton -> select it
    if (clickedCanton !== null) {
      selectedCanton = clickedCanton;
    } else {
      // if no canton was found, remove the current selection
      selectedCanton = null;
    }

    // redraw the visualization after changing the selection
    p.redraw();
  };

  // This function was made by claude I needed help and didn't manage on my own
  // This function: finds which canton was clicked
  // checks if mouse position is inside each canton
  // returns canton or null
  function findCanton(x, y) {
    // go through all cantons
    for (let feature of mapData.features) {
      let canton = feature.properties.canton;
      let coordinates = feature.geometry.coordinates;

      // check each polygon belonging to the canton some have more than one shape
      for (let polygon of coordinates) {
        let inside = false;
        let points = polygon[0];

        // check if the mouse position is inside the polygon check all border points of polygon
        for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
          // convert geo coordinates into canvas coordinates
          let pointX = p.map(points[i][0], 5.8, 10.6, 35, p.width - 35);

          let pointY = p.map(points[i][1], 45.8, 47.9, 540, 240);

          let previousX = p.map(points[j][0], 5.8, 10.6, 35, p.width - 35);

          let previousY = p.map(points[j][1], 45.8, 47.9, 540, 240);

          // check whether the mouse crossed the polygon boundary
          if (
            pointY > y !== previousY > y &&
            x <
              ((previousX - pointX) * (y - pointY)) / (previousY - pointY) +
                pointX
          ) {
            inside = !inside;
          }
        }

        // return the canton if the mouse is inside
        if (inside) {
          return canton;
        }
      }
    }

    return null;
  }

  function toNumber(value) {
    let number = Number(value);
    return Number.isFinite(number) ? number : 0;
  }

  function getCantonName(canton) {
    // convert canton abbreviation into full name for the popup
    let names = {
      AG: "Aargau",
      AI: "Appenzell Innerrhoden",
      AR: "Appenzell Ausserrhoden",
      BE: "Bern",
      BL: "Basel-Landschaft",
      BS: "Basel-Stadt",
      FR: "Fribourg",
      GE: "Genève",
      GL: "Glarus",
      GR: "Graubünden",
      JU: "Jura",
      LU: "Luzern",
      NE: "Neuchâtel",
      NW: "Nidwalden",
      OW: "Obwalden",
      SG: "St. Gallen",
      SH: "Schaffhausen",
      SO: "Solothurn",
      SZ: "Schwyz",
      TG: "Thurgau",
      TI: "Ticino",
      UR: "Uri",
      VD: "Vaud",
      VS: "Valais",
      ZG: "Zug",
      ZH: "Zürich",
    };

    return names[canton];
  }
}

// start the p5 sketch inside the website element
new p5(Karte_FSME, "c_Karte_FSME");
