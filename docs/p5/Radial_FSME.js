function Radial_FSME(p) {
  // ----- ab hier P5 -------

  //gui
  let gui;
  let settings = {
    year: 1,
    allYears: function () {
      allYears();
    },
  };

  //slider
  let slider;

  //daten
  let data;
  let filteredData = [];
  let maxValue;

  //monate & jahre
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

  //wichtig für das Diagramm
  let numLines = 12; // Total number of lines
  let step = 360 / numLines; // Angle between each line
  let lineLength = 200;

  let x = p.width / 2;
  let y = p.height / 2;

  let shape;

  let abstand;
  let radius;

  // .......... Visuelle Einstellungen ..........
  //farbe im shape (rgb)
  let r = 0;
  let g = 200;
  let b = 255;
  //alpha (durchsichtigkeit)
  let a = 255;

  //Beschriftungsgrössen
  labelMonth = 15;
  labelScale = 12;
  labelTitle = 20;
  labelYear = 15;
  //.............................................

  //------ Setup -------
  //async + await ersetzt die preload function
  p.setup = async function () {
    p.createCanvas(500, 500);
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
      r,
      g,
      b,
      a
    );

    // gui einbauen
    gui = new lil.GUI();

    //gui anzeigen
    gui.add(settings, "year", 1, 13, 1).onChange(updateYear);
    gui.add(settings, "allYears");

    //slider
    slider = p.createSlider(1, 13, 1, 1);
    slider.size(p.width - 300);
    slider.center("horizontal");
  };

  // -------- Draw ---------
  p.draw = function () {
    p.background(255);

    //irgendwo überschreibt es die textSize, deshalb hier nochmal setzen
    //p.textSize(12);

    //Shape zeichnen
    p.push();
    p.translate(p.height / 2, p.width / 2);
    shape.display(this);
    p.pop();

    //Zeichnet die Basis des Diagramms (Kreise und Striche)
    drawBase();

    //Beschriftung
    title(year);

    //Draw wird NICHT wiederholt
    p.noLoop();
  };

  // ----- Gui update on Change ----
  function updateYear(t) {
    year = t;
    r = 0;
    g = 200;
    b = 255;
    a = 255;

    shape = new Shape(
      x,
      y,
      filteredData,
      numLines,
      lineLength,
      maxValue,
      p,
      year,
      r,
      g,
      b,
      a
    );

    p.redraw();
  }

  //----- alle Jahre anzeigen (Gui Button) -------
  function allYears() {
    p.background(255);

    for (let i = 13; i >= 1; i--) {
      //Farbe mappen nach Jahr
      //--- mappen
      r = p.map(i, 1, 13, 20, 200);
      g = p.map(i, 1, 13, 50, 200);
      b = p.map(i, 1, 13, 255, 255);

      //--- random
      // r = p.random(0,255);
      //  g = p.random(100,255);
      //  b = p.random(100,255);
      
      a = 120;

      //für jedes Jahr neuen Shape zeichnen (13 Shapes)
      shape = new Shape(
        x,
        y,
        filteredData,
        numLines,
        lineLength,
        maxValue,
        p,
        i,
        r,
        g,
        b,
        a
      );

      // Shapes zeichnen
      p.push();
      p.translate(p.height / 2, p.width / 2);
      shape.display(this);
      p.pop();
    }

    //Basis nochmal drüber legen
    drawBase();
  }

  // ------ Basis des Diagramms (Kreise und Striche) -------
  function drawBase() {
    p.push();
    p.translate(p.width / 2, p.height / 2);

    // Kreise attribute
    p.noFill();
    p.stroke(180, 180, 180, 50);
    p.strokeWeight(1);

    // rotate damit text nicht auf dem Strich liegt
    p.rotate(-step / 2);

    // Kreise für alle 50 Fälle
    for (abstand = 20; abstand <= maxValue; abstand += 20) {
      // Fälle auf Radius mappen
      radius = p.map(abstand, 0, maxValue, 0, lineLength);

      // Durchmesser = Radius * 2
      p.ellipse(0, 0, radius * 2);

      // Beschriftung der Kreise
      p.noStroke();
      p.fill(100, 100, 100, 80);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(labelScale);
      p.text(abstand, 0, -radius);

      p.noStroke();
      p.fill(0, 0, 0, 30);
      p.text(maxValue, 0, -lineLength);

      p.noFill();
      p.stroke(180, 180, 180, 50);
    }

    p.rotate(step / 2);

    //Striche & Monat Beschriftung

    for (let i = 0; i < numLines; i++) {
      p.fill(0);
      p.noStroke();

      p.textSize(labelMonth);
      p.text(month[i], 0, -210);

      p.stroke(0);
      p.line(0, -lineLength, 0, 0); // Draw line from the center outward

      p.rotate(step); // Rotate to next line
    }

    p.pop();

    p.noFill();
    p.ellipse(250, 250, 390);
  }

  function title(year) {
    p.fill(0);
    p.textSize(labelTitle);
    p.text("FSME Fälle pro Monat und Jahr in der Schweiz", 50, 20);

    p.textSize(labelYear);
    p.fill(100);
    p.text("Jahr: " + (year + 2012), 48, 40);
  }

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
      r,
      g,
      b,
      a
    ) {
      this.p = p;
      this.pos = p.createVector(x, y);

      this.data = filteredData;
      this.points = [];
      this.values = [];
      this.r = r;
      this.g = g;
      this.b = b;
      this.a = a;

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
      p.fill(this.r, this.g, this.b, this.a);
      p.noStroke();
      //p.stroke(0);
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
