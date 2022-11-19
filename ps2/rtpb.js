let generator = d3.randomUniform();
let x = generator(10);
let center = [];
for (let i = 0; i < 10; i++) {
    center.push(generator(10))
  }
let center2 = [];
for (let i = 0; i < 10; i++) {
    center2.push(generator(10))
    }

d3.select("svg")
  .selectAll("circle")
  .data(center).enter()
  .append("circle")
  .attrs({
    r: 6,
    cx: d => d * 300,
    cy: 150,
    fill: "green"
  })

d3.select("svg")
  .selectAll("circle")
  .data(center2)
  .join("circle")
  .transition()
  .duration(1000)
  .attrs({
    cx: d => d * 300,
    cy: 150,
    r: 6,
    fill: "green"})
