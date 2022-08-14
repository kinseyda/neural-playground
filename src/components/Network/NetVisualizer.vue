<template>
  <div id="viz-outer">
    <div id="net-container">
      <span v-if="!visActive" id="paused-indicator">Visualization Paused!</span>
      <div id="net"></div>
    </div>
    <div id="viz-buttons">
      <button @click="fitNet" id="zoom-fit">Zoom to fit network</button>
      <button @click="toggleVisualization" id="toggle-vis">
        {{ visActive ? "Disable" : "Enable" }} visualization updates
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Network as Net } from "@/network/network";
import { getColorScale } from "../color";
import { sigmoid } from "@/network/math-functions";
import { Network } from "vis-network/peer";
import { DataSet } from "vis-data";
import "vis-network/styles/vis-network.css";

interface NeuronData {
  id: number;
  color: {
    background: string;
    hover: { background: string };
    highlight: { background: string };
  };
  title: HTMLDivElement;
  opacity: number;
  x: number;
  y: number;
}
interface ConnectionData {
  id: number;
  from: number;
  to: number;
  hidden: boolean;
  color: string;
  title: string;
}

function getNodeId(sizes: number[], layer: number, row: number): number {
  let passedNodes = 0;
  for (let i = 0; i < layer; i++) {
    passedNodes += sizes[i];
  }
  return passedNodes + row;
}
function getConId(
  sizes: number[],
  layer: number,
  row: number,
  weight: number
): number {
  let passedWeights = 0;
  for (let i = 1; i < layer; i++) {
    passedWeights += sizes[i] * sizes[i - 1];
  }
  return passedWeights + row * sizes[layer - 1] + weight;
}

function getNodeEquation(net: Net, layer: number, row: number): string {
  let str = "";
  for (let i = 0; i < net.sizes[layer - 1]; i++) {
    str = `${str}a<sub>${i}</sub> × ${net.weights[layer][row][i].toFixed(
      4
    )} + </br>`;
  }
  str = `${str}${net.biases[layer][row] < 0 ? "-" : "+"} ${Math.abs(
    net.biases[layer][row]
  ).toFixed(4)}</br>`;
  return str;
}
function htmlTitle(html: string): HTMLDivElement {
  const container = document.createElement("div");
  container.innerHTML = html;
  return container;
}

function getConColor(net: Net, layer: number, node: number, weight: number) {
  return getColorScale(
    "green red",
    sigmoid(-1 * net.weights[layer][node][weight])
  );
}
function getConTitle(net: Net, layer: number, node: number, weight: number) {
  return `L${layer}, N${node}, W${weight} (CID ${getConId(
    net.sizes,
    layer,
    node,
    weight
  )})\nWeight: ${net.weights[layer][node][weight].toFixed(4)}`;
}
function getNodeColor(net: Net, layer: number, node: number) {
  return layer == 0
    ? "#FFFFFF"
    : getColorScale("green red", sigmoid(-1 * net.biases[layer][node]));
}
function getNodeTitle(net: Net, layer: number, node: number) {
  return htmlTitle(
    `L${layer}, N${node} (NID ${getNodeId(net.sizes, layer, node)})</br>${
      layer == 0
        ? "Input Layer"
        : layer == net.sizes.length - 1
        ? "Output Layer"
        : "Hidden layer"
    }</br>${
      layer != 0
        ? `Bias: ${net.biases[layer][node].toFixed(
            4
          )}</br>Activation equation:</br>${getNodeEquation(net, layer, node)}`
        : ""
    }`
  );
}

function makeNetData(net: Net): {
  nodes: DataSet<NeuronData>;
  edges: DataSet<ConnectionData>;
} {
  const nodes = new DataSet<NeuronData>();
  const edges = new DataSet<ConnectionData>();
  const maxSize = Math.max(...net.sizes);
  const xStretch = (maxSize / net.sizes.length) * (3 / 2); // Makes networks have a good aspect ratio
  for (let i = 0; i < net.sizes.length; i++) {
    const curSize = net.sizes[i];
    for (let j = 0; j < curSize; j++) {
      const nodeColor = getNodeColor(net, i, j);
      const yOffset = curSize == maxSize ? 0 : (maxSize - curSize) / 2; // Makes sure that layers are vertically centered
      nodes.add({
        id: getNodeId(net.sizes, i, j),
        // label: getNodeId(net.sizes, i, j).toString(),
        color: {
          background: nodeColor,
          hover: { background: nodeColor },
          highlight: { background: nodeColor },
        },
        opacity: 1,
        x: i * 100 * xStretch,
        y: (j + yOffset) * 100,
        title: getNodeTitle(net, i, j),
      });

      if (i > 0) {
        for (let k = 0; k < net.sizes[i - 1]; k++) {
          edges.add({
            id: getConId(net.sizes, i, j, k),
            from: getNodeId(net.sizes, i, j),
            to: getNodeId(net.sizes, i - 1, k),
            color: getConColor(net, i, j, k),
            title: getConTitle(net, i, j, k),
            hidden: false,
          });
        }
      }
    }
  }

  return { nodes: nodes, edges: edges };
}

let visNet = null as Network | null;
let container = null as HTMLElement | null;
let netData = null as {
  nodes: DataSet<NeuronData>;
  edges: DataSet<ConnectionData>;
} | null;

export default defineComponent({
  name: "NetVisualizer",
  props: ["net"],
  components: {},
  data() {
    return { visActive: true };
  },
  methods: {
    toggleVisualization() {
      this.visActive = !this.visActive;
      if (this.visActive) {
        this.updateNetVals(); // Assumes that the prop has had time to update since a net size change
      }
    },
    newNet(net: Net) {
      if (!container || !visNet) {
        return;
      }
      netData = makeNetData(net);
      visNet.setData(netData);
    },
    updateNetVals(netIn?: Net) {
      if (!netData || !this.visActive) {
        return;
      }
      const net = netIn || this.net;
      const nodes: {
        id: number;
        color: {
          background: string;
          hover: { background: string };
          highlight: { background: string };
        };
        title: HTMLDivElement;
      }[] = [];
      const edges: {
        id: number;
        color: string;
        title: string;
      }[] = [];

      for (let i = 0; i < net.sizes.length; i++) {
        const curSize = net.sizes[i];
        for (let j = 0; j < curSize; j++) {
          const nodeColor = getNodeColor(net, i, j);
          nodes.push({
            id: getNodeId(net.sizes, i, j),
            color: {
              background: nodeColor,
              hover: { background: nodeColor },
              highlight: { background: nodeColor },
            },
            title: getNodeTitle(net, i, j),
          });

          if (i > 0) {
            for (let k = 0; k < net.sizes[i - 1]; k++) {
              edges.push({
                id: getConId(net.sizes, i, j, k),
                color: getConColor(net, i, j, k),
                title: getConTitle(net, i, j, k),
              });
            }
          }
        }
      }
      netData.nodes.update(nodes);
      netData.edges.update(edges);
    },
    fitNet() {
      if (!visNet) {
        return;
      }
      visNet.fit();
    },
  },
  mounted() {
    container = document.getElementById("net");
    if (!container) {
      return;
    }
    var options = {
      interaction: {
        dragNodes: false,
        hover: true,
        selectable: true,
        tooltipDelay: 0,
      },
      nodes: {
        shape: "circle",
        color: {
          border: "black",
          hover: { border: "black" },
          highlight: { border: "black" },
        },
      },
      edges: {
        width: 3,
        hoverWidth: 5,
        selectionWidth: 5,
      },
      physics: {
        enabled: false,
      },
    };
    visNet = new Network(container, {}, options);
    visNet.on(
      "selectNode",
      function (params: {
        nodes: number[];
        edges: number[];
        event: MouseEvent;
        pointer: {
          DOM: { x: number; y: number };
          canvas: { x: number; y: number };
        };
      }) {
        if (!visNet || !netData) {
          return;
        }
        const conNodes = visNet.getConnectedNodes(params.nodes[0]) as number[];
        conNodes.push(params.nodes[0]); // Should be only one selected
        const conEdges = visNet.getConnectedEdges(params.nodes[0]);
        const dimmedNodes = netData.nodes.getIds({
          filter: (node: NeuronData) => {
            return !conNodes.includes(node.id);
          },
        }) as number[];
        const hiddenEdges = netData.edges.getIds({
          filter: (edge: ConnectionData) => {
            return !conEdges.includes(edge.id);
          },
        }) as number[];

        netData.nodes.update(
          dimmedNodes.map((x) => {
            return { id: x, opacity: 0.5 };
          })
        );
        netData.edges.update(
          hiddenEdges.map((x) => {
            return { id: x, hidden: true };
          })
        );
      }
    );
    visNet.on("deselectNode", function () {
      if (!netData) {
        return;
      }
      const nodeIds = netData.nodes.getIds() as number[];
      const edgeIds = netData.edges.getIds() as number[];
      netData.nodes.update(
        nodeIds.map((x) => {
          return { id: x, opacity: 1 };
        })
      );
      netData.edges.update(
        edgeIds.map((x) => {
          return { id: x, hidden: false };
        })
      );
    });
  },
});
</script>

<style scoped>
#net-container {
  flex: 1 0 0;
  border: 1px solid black;
  position: relative;
}
#net {
  position: absolute;
  top: 0px;
  left: 0px;
  right: 0px;
  bottom: 0px;
}
#viz-outer {
  flex: 1 0 100%;
  display: flex;
  flex-direction: column;
}
#viz-buttons {
  display: flex;
  flex-direction: row;
}
#zoom-fit {
  flex: 1 0 0;
  height: 5ch;
}
#toggle-vis {
  flex: 1 0 0;
}
#paused-indicator {
  position: absolute;
  color: red;
  font-weight: bold;
  top: 0px;
  left: 0px;
}
</style>
