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
  let brightest = [249, 168, 212];
  let darkest = [131, 24, 67];

  // color of the lines between cantons
  let cantonBorderCol = [220, 220, 220];

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
    let canvas = p.createCanvas(350, 680);

    let yearSlider = p.createSlider(0, 12, currentYear, 1);
    yearSlider.parent("c_Karte_FSME");

    yearSlider.input(function () {
      currentYear = yearSlider.value();
      p.redraw();
    });

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
    maxIncidence = d3.max(cantons, (canton) => incidences[currentYear][canton] || 0) || 1;



    drawYearLabels();
    drawSelectedCanton();
    drawMap();
    drawLegend();
    drawRanking();
  };










  function drawMap() {
    // map size and position
    let mapLeft = 35;
    let mapRight = p.width - 35;
    let mapTop = 160;
    let mapBottom = 355;

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
      p.strokeWeight(1);

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









    function drawYearLabels() {
    // small markers under the slider, one for every year
    // years with a label get a slightly longer marker
    p.stroke(170, 178, 185);
    p.strokeWeight(1);

    for (let i = 0; i < years.length; i++) {
      let x = 44 + i * (262 / (years.length - 1));
      let markerLength = i % 2 === 0 ? 6 : 4;
      p.line(x, 408, x, 408 + markerLength);
    }

    p.noStroke();
    p.fill(100, 110, 118);
    p.textStyle(p.NORMAL);
    p.textSize(10);
    p.textAlign(p.CENTER, p.CENTER);

    for (let i = 0; i < years.length; i += 2) {
      let x = 44 + i * (262 / (years.length - 1));
      p.text(years[i], x, 421);
    }
  }
  













  function drawSelectedCanton() {
    // show a hint card so it's clear that cantons can be clicked
    if (selectedCanton === null) {
      let hintX = p.width - 35 - 280;
      let hintY = 20;

      p.fill(255);
      p.stroke(220, 225, 228);
      p.strokeWeight(1);
      p.rect(hintX, hintY, 280, 82, 3);

      p.fill(220);
      p.noStroke();
      p.rect(hintX, hintY, 4, 82, 3, 0, 0, 3);

      p.fill(25, 45, 60);
      p.textAlign(p.LEFT, p.BASELINE);
      p.textStyle(p.BOLD);
      p.textSize(13);
      p.text("Kanton auswählen", hintX + 16, hintY + 24);

      p.fill(100, 110, 118);
      p.textStyle(p.NORMAL);
      p.textSize(11);
      p.text("Klicke auf einen Kanton in der Karte,", hintX + 16, hintY + 48);
      p.text("um die Werte anzuzeigen.", hintX + 16, hintY + 64);

      p.textAlign(p.LEFT, p.CENTER);
      return;
    }

    // get information for selected canton popup
    let incidenceValue = incidences[currentYear][selectedCanton] || 0;
    let cantonCases = cases[currentYear][selectedCanton] || 0;
    let population = populations[currentYear][selectedCanton] || 0;

    // popup position and size
    let margin = 35;
    let bubbleWidth = 280;
    let bubbleHeight = 82;

    // popup position
    let x = p.width - margin - bubbleWidth;
    let y = 20;

    // popup style (how it looks)
    p.fill(255);
    p.stroke(220, 225, 228);
    p.strokeWeight(1);
    p.rect(x, y, bubbleWidth, bubbleHeight, 3);

    //colored bar on the left 
    let barColor;
    if (incidenceValue === 0) {
      barColor = p.color(220);
    } else {
      barColor = p.lerpColor(
        p.color(brightest),
        p.color(darkest),
        Math.sqrt(incidenceValue / maxIncidence),
      );
    }

    p.fill(barColor);
    p.noStroke();
    p.rect(x, y, 4, bubbleHeight, 3, 0, 0, 3);

    // canton name in pop up
    p.fill(25, 45, 60);
    p.textAlign(p.LEFT, p.BASELINE);
    p.textStyle(p.BOLD);
    p.textSize(13);

    p.text(
      getCantonName(selectedCanton) + " · " + selectedCanton,
      x + 16,
      y + 24,
    );

    // incidence value in popup
    let incidenceText = incidenceValue.toFixed(1);

    p.fill(157, 23, 77);
    p.textSize(22);
    p.text(incidenceText, x + 16, y + 54);

    let numberWidth = p.textWidth(incidenceText);

    p.fill(157, 23, 77);
    p.textStyle(p.BOLD);
    p.textSize(11);
    p.text("Fälle pro 100 000", x + 16 + numberWidth + 6, y + 54);

    // cases and population in pop up rounded so it's easier for laien
    let casesText = Math.round(cantonCases) + " Fälle";

    p.fill(100, 110, 118);
    p.textStyle(p.NORMAL);
    p.textSize(10);
    p.text(casesText, x + 16, y + 72);

    let casesWidth = p.textWidth(casesText);

    p.fill(100, 110, 118);
    p.textStyle(p.NORMAL);
    p.text(
      " bei " +
      Math.round(population).toLocaleString("de-CH") +
      " Einwohner:innen",
      x + 16 + casesWidth,
      y + 72,
    );

    //back to default 
    p.textAlign(p.LEFT, p.CENTER);
  }
  










  function drawLegend() {
    // legend position
    let margin = 35;
    let x = margin;
    let y = 118;
    let legendWidth = 100;

    p.textSize(9);
    p.textStyle(p.NORMAL);
    p.fill(80);
    p.noStroke();

        // color steps
    // draw 5 separate blocks, each with one color between the brightest and darkest color
    let steps = 5;
    let gap = 1;
    let blockWidth = (legendWidth - gap * (steps - 1)) / steps;

    for (let i = 0; i < steps; i++) {
      let colorAmount = i / (steps - 1);

      let legendColor = p.lerpColor(
        p.color(brightest),
        p.color(darkest),
        colorAmount,
      );

      p.fill(legendColor);
      p.rect(x + i * (blockWidth + gap), y, blockWidth, 6);
    }

    // legend labels
    p.fill(100, 110, 118);
    p.textAlign(p.LEFT);
    p.text("Niedrigste", x, y + 15);

    p.textAlign(p.RIGHT);
    p.text("Höchste", x + legendWidth, y + 15);
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
    let y = 440;

    // subtitle
    p.noStroke();
    p.textAlign(p.LEFT);
    p.textStyle(p.NORMAL);
    p.textSize(10);
    p.fill(100, 110, 118);
    p.text("Top 5 Kantone", x, y + 20);

    // ranking bars
    for (let i = 0; i < ranking.length; i++) {
      let rankingItem = ranking[i];

      let barY = y + 40 + i * 40;

      // canton name
      p.fill(25, 45, 60);
      p.textSize(11);

      p.text(rankingItem.canton, x, barY + 12);

      // background bar for reference
      p.fill(220, 229, 233);
      p.rect(x + 35, barY, 190, 18, 3);

      // incidence bar - value
      p.fill(190, 24, 93);

      let barWidth = p.map(rankingItem.incidence, 0, maxIncidence, 0, 190);

      p.rect(x + 35, barY, barWidth, 18, 3);

      // value at the end
      p.fill(25, 45, 60);
      p.textAlign(p.RIGHT);
      p.text(rankingItem.incidence.toFixed(1), x + 270, barY + 8);
      p.textAlign(p.LEFT);
    }
  }











  // testing click function AI help in defining the function correctly so that it can detect clicks on the year buttons and the cantons

  // detect clicks on the cantons
  p.mousePressed = function () {

    // ignore clicks in the year slider area
    if (p.mouseY < 160 || p.mouseY > 355) {
      return;
    }

    // check if a canton was clicked
    let clickedCanton = findCanton(p.mouseX, p.mouseY);

    // select or deselect the canton
    if (clickedCanton !== null) {
      selectedCanton = clickedCanton;
    } else {
      selectedCanton = null;
    }

    // redraw the visualization
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

          let pointY = p.map(points[i][1], 45.8, 47.9, 355, 160);

          let previousX = p.map(points[j][0], 5.8, 10.6, 35, p.width - 35);

          let previousY = p.map(points[j][1], 45.8, 47.9, 355, 160);

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







// convert string to number and return 0 if not a number
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
