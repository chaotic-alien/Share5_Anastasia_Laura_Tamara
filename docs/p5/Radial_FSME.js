function Radial_FSME(p) {
  // ----- ab hier P5 -------

  //... Canvas anpassung ...
  //hier alle grössenänderungen machen! -> alles hängt mit diesen grössen zusammen :)
  let cWidth = 370;
  let cHeigth = 400;

  //... daten ...
  let data;
  let filteredData = [];
  let maxValue;

  //... monate & jahre ...
  let month = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  let year = 1; //max 13 für 2026 brauch ich noch lösung

  //... Diagramm variablen ...
  let numLines = 12; // Total number of lines
  let step = 360 / numLines; // Angle between each line
  let lineLength = cWidth / 2 - 25;

  let x = p.width / 2;
  let y = p.height / 2;

  let shape;

  let abstand;
  let radius;

  let colorValue;

  // ... filter: ausgewählte Jahre (leer = alle Jahre) ...
  let selectedYears = [];
  let chipWidth = 30;
  let chipGap = (430 - 13 * 30) / 12;

  //... dropdown: Position und Zustand ...
  let dropdownOpen = false;
  let dropdownX = 20;
  let dropdownY = 20;
  let dropdownW = 170;
  let dropdownH = 24;
  let rowH = 20;

  //------ Setup -------
  //async + await ersetzt die preload function
  p.setup = async function () {
    p.createCanvas(cWidth, cHeigth);
    p.angleMode(p.DEGREES);

    data = await d3.csv("assets/FSME_oblig/data.csv");
    console.log(data);

    //nur die Daten pro Monat
    filteredData = data.filter(
      (d) => d.valueCategory === "cases" && d.temporal_type === "month"
    );
    console.log(filteredData);

    //höchstes Value im Datensatz finden
    maxValue = d3.max(filteredData, (d) => +d.value);
    console.log(maxValue);

    shape = new Shape(
      x,
      y,
      filteredData,
      numLines,
      lineLength,
      maxValue,
      p,
      year,
    );
  };




  // -------- Draw ---------
  p.draw = function () {
    p.background(250);

    //... Diagramm ...
    // diagram moves down to make room for the header
    p.push();
    p.translate(0, 20);

    //Shape zeichnen
    p.push();
    p.translate(cWidth/2, cHeigth/2);
    p.rotate(+step / 2);
    //shape.display(this);
    drawSelectedYears();
    p.pop();

    //Zeichnet die Basis des Diagramms (Kreise und Striche)
    drawBase();

    p.pop();

    // ... Filter ...
    // filter is drawn last so the open list sits on top of the diagram
    drawYearFilter();

    //Draw wird NICHT wiederholt
    p.noLoop();
  };





  // ------ Basis des Diagramms (Kreise und Striche) -------
  function drawBase() {

    p.push();
    p.translate(cWidth/2, cHeigth/2);
    p.rotate(+step / 2);

    // Kreise attribute
    p.noFill();
    p.stroke(211,221,235, 100);
    p.strokeWeight(1);
    p.textStyle(p.NORMAL);
    p.textSize(10);

    // rotate damit text nicht auf dem Strich liegt
    p.rotate(-step / 2);

    // ... Kreise für alle 50 Fälle ...
    for (abstand = 20; abstand <= maxValue; abstand += 20) {
      // Fälle auf Radius mappen
      radius = p.map(abstand, 0, maxValue, 0, lineLength);

      // Durchmesser = Radius * 2
      p.ellipse(0, 0, radius * 2);

      // Beschriftung der Kreise
      p.noStroke();
      p.fill(31,41,55);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(abstand, 0, -radius - 5);

      p.noFill();
      p.stroke(170,175,190,100);
    }

    //Beschriftung des maximalen Wertes
    p.noStroke();
    p.fill(31,41,55);
    p.text(maxValue, 0, -lineLength -5);

    p.rotate(step / 2);

    //Striche & Monate Beschriftung
    p.fill(31,41,55);
    p.textSize(11);

    for (let i = 0; i < numLines; i++) {
      p.noStroke();
      p.text(month[i], 0, -lineLength -10); // Draw month label above the line

      p.stroke(0);
      p.line(0, -lineLength, 0, 0); // Draw line from the center outward

      p.rotate(step); // Rotate to next line
    }

    //äusserster Kreis
    p.noFill();
    p.stroke(31,41,55);
    p.strokeWeight(1);
    p.ellipse(0, 0, lineLength * 2);

    p.pop();
  }

  // Jahr-Filter ->Shapes der ausgewählten Jahre zeichnen
  function drawSelectedYears() {
    let list = [...selectedYears];

    // nichts ausgewählt = alle Jahre
    if (list.length === 0) {
      for (let i = 1; i <= 13; i++) {
        list.push(i);
      }
    }

    // gleiche Reihenfolge und Farben wie bei allYears
    list.sort((a, b) => b - a);

    for (let i = 0; i < list.length; i++) {
      colorValue =
        list.length === 1 ? 255 : p.map(i, 0, list.length - 1, 0, 255);

      let yearShape = new Shape(
        x,
        y,
        filteredData,
        numLines,
        lineLength,
        maxValue,
        p,
        list[i],
        colorValue
      );

      yearShape.display();
    }
  }

  //Draw Filter (dropdown)
  function drawYearFilter() {
    p.textStyle(p.NORMAL);
    p.textSize(11);
    p.textAlign(p.LEFT, p.CENTER);

    // text in the closed dropdown
    let label = "Alle Jahre";
    if (selectedYears.length === 1) {
      label = String(2012 + selectedYears[0]);
    } else if (selectedYears.length > 1) {
      label = selectedYears.length + " Jahre ausgewählt";
    }

    // dropdown header
    p.fill(250);
    p.stroke(220, 225, 228);
    p.strokeWeight(1);
    p.rect(dropdownX, dropdownY, dropdownW, dropdownH, 3);

    p.noStroke();
    p.fill(25, 45, 60);
    p.text(label, dropdownX + 10, dropdownY + dropdownH / 2);

    // small arrow on the right
    p.fill(10, 60, 110);
    let arrowX = dropdownX + dropdownW - 16;
    let arrowY = dropdownY + dropdownH / 2;
    if (dropdownOpen) {
      p.triangle(
        arrowX,
        arrowY + 2,
        arrowX + 8,
        arrowY + 2,
        arrowX + 4,
        arrowY - 3
      );
    } else {
      p.triangle(
        arrowX,
        arrowY - 2,
        arrowX + 8,
        arrowY - 2,
        arrowX + 4,
        arrowY + 3
      );
    }

    // list of years, only when open
    if (dropdownOpen) {
      let listY = dropdownY + dropdownH + 2;

      p.fill(255);
      p.stroke(220, 225, 228);
      p.strokeWeight(1);
      p.rect(dropdownX, listY, dropdownW, 13 * rowH + 10, 3);

      for (let i = 0; i < 13; i++) {
        let rowY = listY + 5 + i * rowH;
        let isSelected = selectedYears.includes(i + 1);

        // checkbox
        if (isSelected) {
          p.noStroke();
          p.fill(10, 60, 110);
        } else {
          p.stroke(220, 225, 228);
          p.fill(255);
        }
        p.rect(dropdownX + 10, rowY + 4, 12, 12, 3);

        // year
        p.noStroke();
        p.fill(25, 45, 60);
        p.text(2013 + i, dropdownX + 32, rowY + rowH / 2);
      }
    }

    // Clear all Button
    p.rectMode(p.RADIUS);
    p.fill(250);
    p.stroke(220, 225, 228);
    p.strokeWeight(1);
    p.rect(cWidth -70, 32, 50, 13, 3);
    
  

    p.noStroke();
    if (selectedYears.length > 0) {
      p.fill(25, 45, 60);
    } else {
      p.fill(100, 110, 118);
    }
    p.text("Filter löschen", cWidth -100, 32);
    p.rectMode(p.CORNER);
  }

  //Jahr-Filter: Klicks
  p.mousePressed = function () {
    // Filter löschen
    if (p.mouseX > cWidth -120 && p.mouseX < cWidth - 20 && p.mouseY > 20 && p.mouseY < 40) {
      selectedYears = [];
      p.redraw();
      return;
    }

    // Dropdown öffnen oder schliessen
    if (
      p.mouseX > dropdownX &&
      p.mouseX < dropdownX + dropdownW &&
      p.mouseY > dropdownY &&
      p.mouseY < dropdownY + dropdownH
    ) {
      dropdownOpen = !dropdownOpen;
      p.redraw();
      return;
    }

    if (dropdownOpen) {
      let listY = dropdownY + dropdownH + 2;

      // Jahr ein oder ausschalten (Liste bleibt offen)
      if (
        p.mouseX > dropdownX &&
        p.mouseX < dropdownX + dropdownW &&
        p.mouseY > listY + 5 &&
        p.mouseY < listY + 5 + 13 * rowH
      ) {
        let i = Math.floor((p.mouseY - (listY + 5)) / rowH);

        if (selectedYears.includes(i + 1)) {
          selectedYears = selectedYears.filter((year) => year !== i + 1);
        } else {
          selectedYears.push(i + 1);
        }
      } else {
        // Klick ausserhalb schliesst die Liste
        dropdownOpen = false;
      }

      p.redraw();
    }
  };






  //------- Klasse für Form --------
  class Shape {
    constructor(
      x,
      y,
      filteredData,
      numLines,
      lineLength,
      maxValue,
      p,
      year,
      color
    ) {
      this.p = p;
      this.pos = p.createVector(x, y);

      this.data = filteredData;
      this.points = [];
      this.values = [];
      this.c = color;

      let angle = 360 / numLines;

      for (let i = numLines * (year - 1); i < numLines * year; i++) {
        // Wert des jeweiligen Monats
        let value = this.data[i].value;
        this.values.push(value);

        // Wert auf die radiale Länge mappen
        let d = p.map(value, 0, maxValue, 0, lineLength);

        // Winkel des aktuellen Monats
        let currentAngle = -90 + i * angle;

        // Position des Punktes berechnen
        let xPos = this.pos.x + p.cos(currentAngle) * d;
        let yPos = this.pos.y + p.sin(currentAngle) * d;

        this.points.push(p.createVector(xPos, yPos));
      }
    }

    display() {
      const p = this.p;

      // Punkte verbinden
      //oldest year is lightest.
      //170 = transparency, so that the shapes and labels stay readable through the shape.
      //Hauptfarbe FSME: 219, 39, 119
      p.fill(
        //beim lerp immer von oben nach unten die Farben
        //(lerp(hellsteFarbe, dunkelsteFarbe, this.c / 255))
        p.lerp(249,131, this.c / 255),
        p.lerp(168,24, this.c / 255),
        p.lerp(212,67, this.c / 255),
        170
      );


      //p.noStroke();
      p.stroke(131, 24, 67);
      //p.strokeWeight(0.5);

      p.beginShape();

      for (let i = 0; i < this.points.length; i++) {
        p.vertex(this.points[i].x, this.points[i].y);
      }

      p.endShape(p.CLOSE);

      // Punkte zeichnen
      //p.fill(0);
      p.noFill();
      p.noStroke();

      for (let i = 0; i < this.points.length; i++) {
        p.ellipse(this.points[i].x, this.points[i].y, 3);
      }
    }
  }





  //----- ab hier nicht anfassen! ---------
  //Grrr
}
new p5(Radial_FSME, "c_Radial_FSME");
