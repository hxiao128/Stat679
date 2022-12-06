function make_tree(edges) {
  edges.push({to: 1, from: null});
  stratifier = d3.stratify(edges)
    .id(d => d.to)
    .parentId(d => d.from)
  tree_gen = d3.tree()
    .size([1100, 800]);
  return tree_gen(stratifier(edges));
}

function visualize(data) {
  [nodes, edges] = data
  // look up country and date for each node ID.
  nodes_lookup = {}
  for (let i = 0; i < nodes.length; i++) {
    nodes_lookup[i + 1] = nodes[i]
  }

  tree = make_tree(edges);
  console.log(nodes_lookup)
  console.log(tree)
  country_main = ["China", "Janpan", "UnitedStates", "Germany", "Switzerland", "Thailand", "NA"]
  color = d3.scaleOrdinal()
    .domain(["China", "Janpan", "UnitedStates", "Germany", "Switzerland", "Thailand", "NA"])
    .range(["#C1B6B7", "#eca1a6", "#FDE74C", "#ffef96", "#618685", "#87bdd8", "#C3423F"]);
  console.log(color)
  let link_gen = d3.linkVertical()
    .x(d => d.x)
    .y(d => d.y);

  d3.select("#tree")
    .selectAll("path")
    .data(tree.links()).enter()
    .append("path")
    .attrs({
      d: link_gen,
      transform: "translate(0, 10)", // so doesn't go off page
      "stroke-width": 0.5
    })

  d3.select("#tree")
    .selectAll("circle")
    .data(tree.descendants()).enter()
    .append("circle")
    .attrs({
      cx: d => d.x,
      cy: d => d.y,
      r: 3,
      fill: d => country_main.includes(nodes_lookup[d.id].country) ? color(nodes_lookup[d.id].country) : "#a496ff",
      transform: "translate(0, 10)"
    })

  neighborhoods = d3.Delaunay.from(tree.descendants().map(d => [d.x, d.y]))
  d3.select("svg").on("mousemove", (ev) => update_labels(ev, neighborhoods, tree))
  
}

function focus_ids(cur_node) {
  descendants = cur_node.descendants().map(d => d.id)
  ancestors = cur_node.ancestors().map(d => d.id)
  return ancestors.concat(descendants)
}

function highlight(d, i, ix, focus) {
  if (i == ix) {
    return 1
  } else if (focus.indexOf(d.id) != -1) {
    return 0
  }
  return -1
}

function update_labels(ev, neighborhoods, tree) {
  let pos = d3.pointer(ev),
    ix = neighborhoods.find(pos[0], pos[1]),
    cur_node = tree.descendants()[ix],
    focus = focus_ids(cur_node)

  d3.select("#tree")
    .selectAll("circle")
    .transition().duration(100)
    .attrs({
      r: (d, i) => {
        let relevance = highlight(d, i, ix, focus)
        return relevance == 1 ? 2 * radius(d.depth) : relevance == 0 ? 5 : 1
      }
    })

  d3.select("#tree")
    .selectAll("path")
    .transition().duration(100)
    .attr("stroke-width", d => focus.indexOf(d.target.id) == -1 ? 0.02 : 1)

  d3.select("#labels")
    .selectAll("text")
    .text(cur_node.id)
    .attr("transform", `translate(${cur_node.x}, ${cur_node.y})`)
}

function radius(depth) {
  return 10 * Math.exp(-.5 * depth)
}

Promise.all([
  d3.csv("https://raw.githubusercontent.com/krisrs1128/stat679_code/main/exercises/ps4/covid-nodes.csv", d3.autoType),
  d3.csv("https://raw.githubusercontent.com/krisrs1128/stat679_code/main/exercises/ps4/covid-edges.csv", d3.autoType)
]).then(visualize)