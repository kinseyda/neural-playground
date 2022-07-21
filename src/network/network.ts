import { longForLoop } from "@/long-loop";

function sigmoid(n: number) {
  return 1 / (1 + Math.E ** (-1 * n));
}

function sigmoidDerivative(n: number) {
  return sigmoid(n) * (1 - sigmoid(n));
}

// function reLu(n: number): number {
//   return Math.max(0, n);
// }

// function reLuDerivative(n: number) {
//   return n > 0 ? 1 : 0;
// }

function squish(n: number): number {
  return sigmoid(n);
}
function squishDerivative(n: number): number {
  return sigmoidDerivative(n);
}

/**
 * Unraveling in this way is a little faster than a regular for-loop.
 */
function dotProduct(a: number[], b: number[]): number {
  let sum = 0;
  let i = a.length;
  for (; i > 7; i -= 8) {
    sum +=
      a[i - 1] * b[i - 1] +
      a[i - 2] * b[i - 2] +
      a[i - 3] * b[i - 3] +
      a[i - 4] * b[i - 4] +
      a[i - 5] * b[i - 5] +
      a[i - 6] * b[i - 6] +
      a[i - 7] * b[i - 7] +
      a[i - 8] * b[i - 8];
  }
  while (i--) {
    sum += a[i] * b[i];
  }
  return sum;
}

/**
 * Find the neuron activations of a network for a given set of inputs.
 * Also returns the calculated values for "z", which is the value of each activation before it is run through the sigmoid / reLu function (before "squishing", in the words of 3Blue1Brown). This value can be used in back propagation, or ignored.
 * @param inputs
 * @param net
 * @returns - An object containing the activations and z values, indexed by "activations" and "zs" respectively
 */
export function feed(
  inputs: number[],
  net: Network
): { activations: number[][]; zs: number[][] } {
  const weights = net.weights,
    biases = net.biases,
    sizes = net.sizes;
  const activations: number[][] = [];
  const zs: number[][] = [];
  for (let curLayer = 0; curLayer < sizes.length; curLayer++) {
    activations[curLayer] = [];
    zs[curLayer] = [];
    for (let curNeuron = 0; curNeuron < sizes[curLayer]; curNeuron++) {
      if (curLayer == 0) {
        activations[curLayer][curNeuron] = inputs[curNeuron];
      } else {
        zs[curLayer][curNeuron] =
          dotProduct(weights[curLayer][curNeuron], activations[curLayer - 1]) +
          biases[curLayer][curNeuron];
        activations[curLayer][curNeuron] = squish(zs[curLayer][curNeuron]);
      }
    }
  }
  return { activations: activations, zs: zs };
}

/**
 * Determines how a network should change each of its weights and biases in order to more closely match the given inputs and expected outputs.
 * See http://neuralnetworksanddeeplearning.com/chap2.html for a great walk-through the algorithm.
 * @param inputs
 * @param expectedOutputs
 * @param net
 * @param weightDeltas - The current matrix of deltas to change the weights by. If provided, this is mutated with the new deltas. The end result (after running backProp several times as in {@link train}) is a matrix of sums of deltas, which can then be divided by batch size. Alternatively this can be done for a single case and the deltas will be as expected.
 * @param biasDeltas - Similar to weightDeltas
 * @returns - An object containing the weight and bias deltas, indexed by "weightDeltas" and "biasDeltas" respectively
 */
export function backProp(
  inputs: number[],
  expectedOutputs: number[],
  net: Network,
  weightDeltas?: number[][][],
  biasDeltas?: number[][]
): { weightDeltas: number[][][]; biasDeltas: number[][] } {
  const weights = net.weights,
    sizes = net.sizes; // We don't actually need to know the biases to compute their derivative, interestingly

  // Initialize the deltas all to zero
  if (
    weightDeltas === undefined ||
    biasDeltas === undefined ||
    weightDeltas.length == 0 ||
    biasDeltas.length == 0
  ) {
    weightDeltas = [];
    biasDeltas = [];
    for (let curLayer = 0; curLayer < sizes.length; curLayer++) {
      weightDeltas[curLayer] = [];
      biasDeltas[curLayer] = [];
      for (let curNeuron = 0; curNeuron < sizes[curLayer]; curNeuron++) {
        weightDeltas[curLayer][curNeuron] = [];
        for (
          let curWeight = 0;
          curWeight < sizes[curLayer - 1] || 0;
          curWeight++
        ) {
          weightDeltas[curLayer][curNeuron][curWeight] = 0;
        }
        biasDeltas[curLayer][curNeuron] = 0;
      }
    }
  }
  const dict = feed(inputs, net);
  const activations = dict["activations"],
    zs = dict["zs"];
  const errors: number[][] = [];

  /**
   * A small loop that would normally happen when calculating hidden layer errors
   * Unraveled similarly to {@link dotProduct}
   */
  const unraveledHiddenLayerLoop = function (
    weights: number[][],
    errors: number[],
    curNeuron: number
  ) {
    let sum = 0;
    let i = errors.length;
    for (; i > 7; i -= 8) {
      sum +=
        weights[i - 1][curNeuron] * errors[i - 1] +
        weights[i - 2][curNeuron] * errors[i - 2] +
        weights[i - 3][curNeuron] * errors[i - 3] +
        weights[i - 4][curNeuron] * errors[i - 4] +
        weights[i - 5][curNeuron] * errors[i - 5] +
        weights[i - 6][curNeuron] * errors[i - 6] +
        weights[i - 7][curNeuron] * errors[i - 7] +
        weights[i - 8][curNeuron] * errors[i - 8];
    }
    while (i--) {
      sum += weights[i][curNeuron] * errors[i];
    }
    return sum;
  };

  // Calculate errors and then deltas for each layer
  for (let curLayer = sizes.length - 1; curLayer > 0; curLayer--) {
    errors[curLayer] = [];
    if (curLayer == sizes.length - 1) {
      // Output layer errors
      for (let curNeuron = 0; curNeuron < sizes[curLayer]; curNeuron++) {
        const dCda =
          activations[curLayer][curNeuron] - expectedOutputs[curNeuron];
        errors[curLayer][curNeuron] =
          dCda * squishDerivative(zs[curLayer][curNeuron]);
      }
    } else {
      // Hidden layer errors
      // aka _prop_agate the output layer errors _back_wards
      for (let curNeuron = 0; curNeuron < sizes[curLayer]; curNeuron++) {
        const foreErr = unraveledHiddenLayerLoop(
          weights[curLayer + 1],
          errors[curLayer + 1],
          curNeuron
        );
        errors[curLayer][curNeuron] =
          foreErr * squishDerivative(zs[curLayer][curNeuron]);
      }
    }

    // Calculate deltas for this layer based on errors
    for (let curNeuron = 0; curNeuron < sizes[curLayer]; curNeuron++) {
      biasDeltas[curLayer][curNeuron] -= errors[curLayer][curNeuron];
      for (
        let curWeight = 0;
        curWeight < weights[curLayer][curNeuron].length;
        curWeight++
      ) {
        const inputActiv = activations[curLayer - 1][curWeight];
        weightDeltas[curLayer][curNeuron][curWeight] -=
          errors[curLayer][curNeuron] * inputActiv;
      }
    }
  }
  return { weightDeltas: weightDeltas, biasDeltas: biasDeltas };
}

/**
 * Runs the {@link backProp} algorithm on a network for every example in the batch, then modifies the net's weights / biases with the average deltas obtained from the backProps
 * @param batch
 * @param net
 * @returns
 */
export function train(batch: TrainingExample[], net: Network): Promise<void> {
  return new Promise((resolve) => {
    let weightDeltas: number[][][] = [] as number[][][],
      biasDeltas: number[][] = [] as number[][];
    longForLoop(
      batch.length,
      50,
      {
        weightDeltas: weightDeltas,
        biasDeltas: biasDeltas,
        batch: batch,
        net: net,
      },
      (index) => {
        const ex = batch[index];
        const dict = backProp(
          ex.inputs,
          ex.expectedOutputs,
          net,
          weightDeltas,
          biasDeltas
        );
        weightDeltas = dict["weightDeltas"];
        biasDeltas = dict["biasDeltas"];
      },
      () => {
        net.updateNeurons(weightDeltas, biasDeltas, 1 / batch.length);
        resolve();
      }
    );
  });
}

export interface TrainingExample {
  inputs: number[];
  expectedOutputs: number[];
}

export class Network {
  weights: number[][][]; // [layer][index][weight number (index in previous layer)]
  biases: number[][]; // [layer][index]
  sizes: number[];
  learningRate: number;

  /**
   * Randomly sets weights and biases of a network with the given layer sizes.
   * @param sizes  - List of sizes of layers: input, hidden layer[s], output, ie len >=2
   * @param learningRate - A number to multiply with all changes to neuron weights/biases
   */
  constructor(sizes: number[], learningRate: number) {
    this.sizes = sizes;
    this.weights = [[[]]];
    this.biases = [[]];
    for (let curLayer = 0; curLayer < sizes.length; curLayer++) {
      const weightsSize = curLayer == 0 ? 0 : sizes[curLayer - 1];
      const layerWeights: number[][] = [];
      const layerBiases: number[] = [];
      for (let curNeuron = 0; curNeuron < sizes[curLayer]; curNeuron++) {
        const curNeuronWeights = [];
        for (let j = 0; j < weightsSize; j++) {
          curNeuronWeights[j] = Math.random() * 2 - 1;
        }
        const bias = curLayer == 0 ? 0 : Math.random() * 2 - 1;

        layerWeights[curNeuron] = curNeuronWeights;
        layerBiases[curNeuron] = bias;
      }
      this.weights[curLayer] = layerWeights;
      this.biases[curLayer] = layerBiases;
    }

    this.learningRate = learningRate;
  }

  updateNeurons(
    weightDeltas: number[][][],
    biasDeltas: number[][],
    mult: number
  ) {
    for (let curLayer = 0; curLayer < this.sizes.length; curLayer++) {
      for (let curNeuron = 0; curNeuron < this.sizes[curLayer]; curNeuron++) {
        this.biases[curLayer][curNeuron] +=
          biasDeltas[curLayer][curNeuron] * mult * this.learningRate;
        for (
          let curWeight = 0;
          curWeight < this.weights[curLayer][curNeuron].length;
          curWeight++
        ) {
          this.weights[curLayer][curNeuron][curWeight] +=
            weightDeltas[curLayer][curNeuron][curWeight] *
            mult *
            this.learningRate;
        }
      }
    }
  }

  /**
   * This function is simply provided for convenience, "this." references are bizarrely slow.
   * Use this version only when speed isnt super important, eg when running the function just once and outside of a loop.
   * Otherwise use {@link feed}
   */
  feed(inputs: number[]): { activations: number[][]; zs: number[][] } {
    return feed(inputs, this);
  }

  /**
   * This function is simply provided for convenience, "this." references are bizarrely slow.
   * Use this version only when speed isnt super important, eg when running the function just once and outside of a loop.
   * Otherwise use {@link backProp}
   */
  backProp(
    inputs: number[],
    expectedOutputs: number[],
    weightDeltas?: number[][][],
    biasDeltas?: number[][]
  ): { weightDeltas: number[][][]; biasDeltas: number[][] } {
    return backProp(inputs, expectedOutputs, this, weightDeltas, biasDeltas);
  }
}
