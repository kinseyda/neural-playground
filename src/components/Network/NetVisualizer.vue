<template>
  <div id="viz-outer">
    <div id="net-container"><div id="net"></div></div>
    <div id="viz-buttons">
      <button @click="fitNet" id="zoom-fit">Zoom to fit network</button>
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
import { longForLoop } from "@/long-loop";
import "vis-network/styles/vis-network.css";

interface NeuronData {
  id: number;
  color: {
    background: string;
    hover: { background: string };
    highlight: { background: string };
  };
  title: string;
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
      const nodeColor =
        i == 0
          ? "#FFFFFF"
          : getColorScale("green red", sigmoid(-1 * net.biases[i][j]));
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
        title: `Node ${getNodeId(net.sizes, i, j)}\nBias: ${net.biases[i][j]}`,
      });

      if (i > 0) {
        for (let k = 0; k < net.sizes[i - 1]; k++) {
          edges.add({
            id: getConId(net.sizes, i, j, k),
            from: getNodeId(net.sizes, i, j),
            to: getNodeId(net.sizes, i - 1, k),
            color: getColorScale(
              "green red",
              sigmoid(-1 * net.weights[i][j][k])
            ),
            title: `Connection ${getConId(net.sizes, i, j, k)}\nWeight: ${
              net.weights[i][j][k]
            }`,
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
  props: [],
  components: {},
  data() {
    return {};
  },
  methods: {
    updateNet(net: Net) {
      if (!container || !visNet) {
        return;
      }
      netData = makeNetData(net);
      visNet.setData(netData);
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

        longForLoop(dimmedNodes.length, 50, {}, (index: number) => {
          if (!netData) {
            return;
          }
          netData.nodes.updateOnly({ id: dimmedNodes[index], opacity: 0.5 });
        }).then(() => {
          longForLoop(hiddenEdges.length, 50, {}, (index: number) => {
            if (!netData) {
              return;
            }
            netData.edges.updateOnly({ id: hiddenEdges[index], hidden: true });
          });
        });
      }
    );
    visNet.on("deselectNode", function () {
      if (!netData) {
        return;
      }
      const nodeIds = netData.nodes.getIds() as number[];
      const edgeIds = netData.edges.getIds() as number[];
      longForLoop(nodeIds.length, 50, {}, (index: number) => {
        if (!netData) {
          return;
        }
        netData.nodes.updateOnly({ id: nodeIds[index], opacity: 1 });
      }).then(() => {
        longForLoop(edgeIds.length, 50, {}, (index: number) => {
          if (!netData) {
            return;
          }
          netData.edges.updateOnly({ id: edgeIds[index], hidden: false });
        });
      });
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
</style>
