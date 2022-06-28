import { assert } from "@vue/compiler-core";

export interface Neuron {
  weights: number[]; // Weights on inputs, eg input layer has none
  bias: number;
  activation: number | undefined;
}

function sigmoid(n: number) {
  return 1 / (1 + Math.E ** (-1 * n));
}

export class Network {
  neurons: Neuron[][];
  /**
   *
   * @param sizes - List of sizes of layers: input, hidden layer[s], output
   */
  constructor(sizes: number[]) {
    this.neurons = [];
    for (let i = 0; i < sizes.length; i++) {
      const weightsSize = i == 0 ? 0 : sizes[i - 1];
      const layer: Neuron[] = [];
      for (let j = 0; j < sizes[i]; j++) {
        const weights = [];
        for (let j = 0; j < weightsSize; j++) {
          weights.push(Math.random());
        }
        const bias = i == 0 ? 0 : Math.random();
        const neuron: Neuron = {
          weights: weights,
          bias: bias,
          activation: undefined,
        };
        layer.push(neuron);
      }
      this.neurons.push(layer);
    }
  }

  resetNeuronActivations() {
    for (const layer of this.neurons) {
      for (const n of layer) {
        n.activation = undefined;
      }
    }
  }

  feed(inputs: number[]): number[] {
    this.resetNeuronActivations();
    for (let i = 0; i < this.neurons[0].length; i++) {
      this.neurons[0][i].activation = inputs[i];
    }
    const outputs: number[] = [];
    for (let i = 0; i < this.neurons[this.neurons.length - 1].length; i++) {
      this.recSetActivation(this.neurons.length - 1, i);
      outputs.push(this.neurons[this.neurons.length - 1][i].activation || 0);
    }
    return outputs;
  }

  recSetActivation(layer: number, nIndex: number) {
    if (this.neurons[layer][nIndex].activation !== undefined) {
      return;
    }
    let activ = 0;
    for (let i = 0; i < this.neurons[layer][nIndex].weights.length; i++) {
      this.recSetActivation(layer - 1, i);
      const prevActiv = this.neurons[layer - 1][i].activation;
      if (prevActiv === undefined) {
        throw new TypeError("Recursive activation function failed!");
      }
      activ += prevActiv * this.neurons[layer][nIndex].weights[i];
    }
    activ += this.neurons[layer][nIndex].bias;
    this.neurons[layer][nIndex].activation = sigmoid(activ);
    return;
  }
}
