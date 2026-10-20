function Karte_FSME(p) {
  let data;
  let mapData;


  // fonts
  let font;


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
  let brightest = [251, 207, 232];
  let darkest = [157, 23, 77];

  // shared neutral gray for map borders and ranking backgrounds
  let lightGray = [215, 223, 228];

  // color of the lines between cantons
  let cantonBorderCol = lightGray;

  // highest incidence across all years and cantons
  // used as the maximum for the map colors and ranking bars
  let globalMaxIncidence = 1;

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

  // vertical position of the map (between the legend and the slider)
  let mapTop = 110;
  let mapBottom = 346;





  // async + await ersetzt die preload function
  p.setup = async function () {
    let canvas = p.createCanvas(370, 680);


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


    // Font laden
    font = await p.loadFont("assets/fonts/NotoSans-Regular.ttf");
    p.textFont(font);
    p.textSize(16);



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

    // calculate the highest incidence across all years and cantons
    globalMaxIncidence =
      d3.max(
        incidences.flatMap((yearData) =>
          cantons.map((canton) => yearData[canton] || 0)
        )
      ) || 1;

    // draw after the data is loaded
    p.redraw();
  };







  p.draw = function () {
    p.background(255);

    // set the default font for the sketch
    p.textFont(font);


    drawYearLabels();
    drawSelectedCanton();
    drawMap();
    drawLegend();
    drawRanking();
  };










  function drawMap() {
    // map size 
    let mapLeft = 0;
    let mapRight = p.width;


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
        cantonColor = p.color(lightGray);
      } else {
        // sqrt makes lower values easier to see instead of letting the highest value dominate the scale
        // AI help how I could fix my color problem the colors were too similar before
        let colorAmount = Math.sqrt(incidenceValue / globalMaxIncidence);

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
      let x = 9 + i * (352 / (years.length - 1));
      let markerLength = i % 2 === 0 ? 6 : 4;
      p.line(x, 408, x, 408 + markerLength);
    }

    p.noStroke();
    p.fill(170, 175, 190);
    p.textStyle(p.NORMAL);
    p.textSize(10);
    p.textAlign(p.CENTER, p.CENTER);

    for (let i = 0; i < years.length; i += 2) {
      let x = 9 + i * (352 / (years.length - 1));
      p.text(years[i], p.constrain(x, 12, p.width - 12), 421);
    }
  }














  function drawSelectedCanton() {
    // show a hint card so it's clear that cantons can be clicked
    if (selectedCanton === null) {
      let hintX = 0;
      let hintY = 1;

      p.fill(255);
      p.stroke(lightGray);
      p.strokeWeight(1);
      p.rect(hintX, hintY, p.width, 76, 3);

      p.fill(lightGray);
      p.noStroke();
      p.rect(hintX, hintY, 4, 76, 3, 0, 0, 3);

      p.fill(31, 41, 55);
      p.textAlign(p.LEFT, p.BASELINE);
      p.textStyle(p.BOLD);
      p.textSize(16);
      p.text("Kanton auswählen", hintX + 16, hintY + 30);

      p.fill(170, 175, 190);
      p.textStyle(p.NORMAL);
      p.textSize(10);
      p.text("Klicke auf einen Kanton.", hintX + 16, hintY + 54);

      p.textAlign(p.LEFT, p.CENTER);
      return;
    }

    // get information for selected canton popup
    let incidenceValue = incidences[currentYear][selectedCanton] || 0;
    let cantonCases = cases[currentYear][selectedCanton] || 0;
    let population = populations[currentYear][selectedCanton] || 0;

    // popup position and size
    let margin = 0;
    let bubbleWidth = p.width;
    let bubbleHeight = 76;

    // popup position
    let x = p.width - margin - bubbleWidth;
    let y = 1;

    // popup style (how it looks)
    p.fill(255);
    p.stroke(lightGray);
    p.strokeWeight(1);
    p.rect(x, y, bubbleWidth, bubbleHeight, 3);

    //colored bar on the left 
    let barColor;
    if (incidenceValue === 0) {
      barColor = p.color(lightGray);
    } else {
      barColor = p.lerpColor(
        p.color(brightest),
        p.color(darkest),
        Math.sqrt(incidenceValue / globalMaxIncidence),
      );
    }

    p.fill(barColor);
    p.noStroke();
    p.rect(x, y, 4, bubbleHeight, 3, 0, 0, 3);

    // canton name in pop up
    p.fill(31, 41, 55);
    p.textAlign(p.LEFT, p.BASELINE);
    p.textStyle(p.BOLD);
    p.textSize(16);

    p.text(
      getCantonName(selectedCanton) + " · " + selectedCanton,
      x + 16,
      y + 20,
    );

    // incidence value in popup
    let incidenceText = incidenceValue.toFixed(1);

    p.fill(157, 23, 77);
    p.textStyle(p.BOLD);
    p.textSize(24);
    p.text(incidenceText, x + 16, y + 46);

    p.textSize(24);
    let numberWidth = p.textWidth(incidenceText);

    p.fill(157, 23, 77);
    p.textStyle(p.BOLD);
    p.textSize(16);
    p.text("Fälle pro 100 000", x + 16 + numberWidth + 6, y + 46);

    // cases and population in pop up rounded so it's easier for laien
    let casesText = Math.round(cantonCases) + " Fälle";

    p.fill(170, 175, 190);
    p.textStyle(p.NORMAL);
    p.textSize(10);
    p.text(casesText, x + 16, y + 65);

    p.textSize(10);
    let casesWidth = p.textWidth(casesText);

    p.fill(170, 175, 190);
    p.textStyle(p.NORMAL);
    p.text(
      " bei " +
      Math.round(population).toLocaleString("de-CH") +
      " Einwohner:innen",
      x + 16 + casesWidth,
      y + 65,
    );

    //back to default 
    p.textAlign(p.LEFT, p.CENTER);
  }











  function drawLegend() {
    // legend position
    let margin = 0;
    let x = margin;
    let y = 90;
    let legendWidth = 125;

    p.textSize(10);
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
    p.textSize(10);
    p.fill(170, 175, 190);
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
    let x = 0;
    let y = 440;

    // subtitle
    p.noStroke();
    p.textAlign(p.LEFT);
    p.textStyle(p.BOLD);
    p.textSize(10);
    p.fill(31, 41, 55);
    p.text("Top 5 Kantone", x, y + 20);
    p.textAlign(p.RIGHT);
    p.text("Fälle pro 100'000 Einwohner:innen", p.width, y + 20);
    p.textAlign(p.LEFT);

    // ranking bars
    for (let i = 0; i < ranking.length; i++) {
      let rankingItem = ranking[i];

      let barY = y + 40 + i * 38;

      // canton name
      p.fill(31, 41, 55);
      p.textStyle(p.BOLD);
      p.textSize(10);

      p.text(rankingItem.canton, x, barY + 12);

      // background bar for reference
      p.fill(lightGray);
      p.rect(x + 35, barY, 300, 20, 3);

      // incidence bar - value
      let cantonColor;

      if (rankingItem.incidence === 0) {
        cantonColor = p.color(lightGray);
      } else {
        let colorAmount = Math.sqrt(rankingItem.incidence / globalMaxIncidence);

        cantonColor = p.lerpColor(
          p.color(brightest),
          p.color(darkest),
          colorAmount,
        );
      }

      p.fill(cantonColor);

      let barWidth = p.map(
        rankingItem.incidence,
        0,
        globalMaxIncidence,
        0,
        300
      );

      p.rect(x + 35, barY, barWidth, 20, 3);

      // value at the end
      p.fill(31, 41, 55);
      p.textAlign(p.RIGHT);
      p.textStyle(p.BOLD);
      p.text(rankingItem.incidence.toFixed(1), p.width, barY + 10);
      p.textAlign(p.LEFT);
    }
  }











  // testing click function AI help in defining the function correctly so that it can detect clicks on the year buttons and the cantons

  // detect clicks on the cantons
  p.mousePressed = function () {

    // ignore clicks in the year slider area
    if (p.mouseY < mapTop || p.mouseY > mapBottom) {
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
          let pointX = p.map(points[i][0], 5.8, 10.6, 0, p.width);

          let pointY = p.map(points[i][1], 45.8, 47.9, mapBottom, mapTop);

          let previousX = p.map(points[j][0], 5.8, 10.6, 0, p.width);

          let previousY = p.map(points[j][1], 45.8, 47.9, mapBottom, mapTop);

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