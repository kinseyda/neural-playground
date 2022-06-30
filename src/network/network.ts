export interface Neuron {
  weights: number[]; // Weights on inputs, eg input layer has none
  bias: number;
  z: number | undefined;
  activation: number | undefined;
  error: number | undefined; // dC/dz_{this neuron}
  weightDeltas: number[];
  biasDelta: number;
}

function sigmoid(n: number) {
  return 1 / (1 + Math.E ** (-1 * n));
}

function sigmoidDerivative(n: number) {
  return sigmoid(n) * (1 - sigmoid(n));
}

export interface TrainingExample {
  inputs: number[];
  expectedOutputs: number[];
}

export class Network {
  neurons: Neuron[][];
  learningRate: number;
  /**
   *
   * @param sizes - List of sizes of layers: input, hidden layer[s], output
   */
  constructor(sizes: number[], learningRate: number) {
    this.neurons = [];
    for (let i = 0; i < sizes.length; i++) {
      const weightsSize = i == 0 ? 0 : sizes[i - 1];
      const layer: Neuron[] = [];
      for (let j = 0; j < sizes[i]; j++) {
        const weights = [];
        const weightDeltas = [];
        for (let j = 0; j < weightsSize; j++) {
          weights.push(Math.random() * 2 - 1);
          weightDeltas.push(0);
        }
        const bias = i == 0 ? 0 : Math.random() * 2 - 1;
        const neuron: Neuron = {
          weights: weights,
          bias: bias,
          z: undefined,
          activation: undefined,
          error: undefined,
          weightDeltas: weightDeltas,
          biasDelta: 0,
        };
        layer.push(neuron);
      }
      this.neurons.push(layer);
    }
    this.learningRate = learningRate;
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
    let z = 0;
    for (let i = 0; i < this.neurons[layer][nIndex].weights.length; i++) {
      this.recSetActivation(layer - 1, i);
      const prevActiv = this.neurons[layer - 1][i].activation;
      if (prevActiv === undefined) {
        throw new TypeError("Recursive activation function failed!");
      }
      z += prevActiv * this.neurons[layer][nIndex].weights[i];
    }
    z += this.neurons[layer][nIndex].bias;
    this.neurons[layer][nIndex].z = z;
    this.neurons[layer][nIndex].activation = sigmoid(z);
    return;
  }

  /**
   * http://neuralnetworksanddeeplearning.com/chap2.html good reading
   * @param inputs
   * @param expectedOutputs
   */
  backProp(inputs: number[], expectedOutputs: number[]) {
    this.feed(inputs);

    for (let i = this.neurons.length - 1; i > 0; i--) {
      const layer = this.neurons[i];
      if (i == this.neurons.length - 1) {
        // Output layer errors
        for (let j = 0; j < layer.length; j++) {
          const n = layer[j];
          if (n.activation === undefined || n.z === undefined) {
            throw new EvalError("BP issue");
          }
          const dCda = n.activation - expectedOutputs[j];
          n.error = dCda * sigmoidDerivative(n.z);
        }
      } else {
        // Hidden layer errors
        for (let j = 0; j < layer.length; j++) {
          let err = 0;
          for (let k = 0; k < this.neurons[i + 1].length; k++) {
            const n = this.neurons[i + 1][k];
            if (n.error === undefined) {
              throw new EvalError("BP issue");
            }
            err += n.weights[j] * n.error;
          }
          const n = layer[j];
          if (n.z === undefined) {
            throw new EvalError("BP issue");
          }
          n.error = err * sigmoidDerivative(n.z);
        }
      }
      for (let j = 1; j < layer.length; j++) {
        const n = layer[j];
        if (n.error === undefined) {
          throw new EvalError("BP issue");
        }
        layer[j].biasDelta -= n.error * this.learningRate;
        for (let k = 0; k < n.weights.length; k++) {
          const inputActiv = this.neurons[j - 1][k].activation;
          if (inputActiv === undefined) {
            throw new EvalError("BP issue");
          }
          layer[j].weightDeltas[k] -= n.error * inputActiv * this.learningRate;
        }
      }
    }
  }
  updateNeurons(mult: number) {
    for (let i = 0; i < this.neurons.length; i++) {
      const layer = this.neurons[i];
      for (let j = 0; j < layer.length; j++) {
        const neuron = layer[j];
        neuron.bias += neuron.biasDelta * mult;
        for (let k = 0; k < neuron.weightDeltas.length; k++) {
          neuron.weights[k] += neuron.weightDeltas[k] * mult;
        }
      }
    }
  }
  train(batch: TrainingExample[]) {
    for (const ex of batch) {
      this.backProp(ex.inputs, ex.expectedOutputs);
    }
    this.updateNeurons(1 / batch.length);
  }
}
