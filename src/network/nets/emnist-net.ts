import EmnistImage from "@/data/EMNIST/emnist-image";
import { feed, Network, train, TrainingExample } from "../network";
import { formatTimeString } from "@/format";
import { longForLoop } from "@/long-loop";
import { getHottest, oneHotOutput } from "../helpers";

export let emnistData: EmnistImage[] | undefined = undefined,
  testEmnistData: EmnistImage[] | undefined = undefined;

export function loadEmnist() {
  import("@/data/EMNIST/digits_train_data.json").then(({ default: module }) => {
    emnistData = module as EmnistImage[];
  });
  import("@/data/EMNIST/digits_test_data.json").then(({ default: module }) => {
    testEmnistData = module as EmnistImage[];
  });
}

/**
 *
 * @param size
 * @param test - Whether the batch should be pulled from the test data set (opposed to the training set)
 * @returns
 */
export function generateEmnistBatch(
  size: number,
  test?: boolean
): TrainingExample[] {
  const result: TrainingExample[] = [];
  const indexes: number[] = [];
  let superSet = emnistData;
  if (test) {
    superSet = testEmnistData;
  }
  while (result.length < size) {
    if (!superSet) {
      throw new Error("Data set not loaded");
    }
    const x = Math.floor(Math.random() * superSet.length);
    if (!(x in indexes)) {
      indexes.push(x);
      result.push({
        inputs: superSet[x].data,
        expectedOutputs: oneHotOutput(superSet[x].label, 48),
      });
    }
  }
  return result;
}

export class EmnistNet extends Network {
  constructor() {
    super([784, 16, 16, 10], 1);
    // Two hidden layers of 16 neurons by default, no real justification behind that other than that it's what 3Blue1Brown uses in his series on neural networks that tackles this same problem.
  }

  async runNBatches(n: number, batchSize: number) {
    for (let i = 0; i < n; i++) {
      console.log(`Batch number: ${i}/${n}`);
      const timeIn = Date.now();
      await this.runMiniBatch(batchSize);
      const timeLastBatch = Date.now() - timeIn;
      const msRemaining = (n - (i + 1)) * timeLastBatch;
      console.log(`Batch ${i} took ${formatTimeString(timeLastBatch)}`);
      console.log(`Remaining: ${formatTimeString(msRemaining)}`);
    }
  }
  async runMiniBatch(n: number): Promise<void> {
    return train(generateEmnistBatch(n), this);
  }
  async getPredictedAccuracy(size: number): Promise<number> {
    const batch = generateEmnistBatch(size, true);
    let corrects = 0;
    const funcParams = {
      net: this,
    };

    return longForLoop(
      size,
      50,
      funcParams,
      (index, params) => {
        const net = params["net"] as EmnistNet;

        const activs = feed(batch[index].inputs, net)["activations"];
        if (
          batch[index].expectedOutputs[getHottest(activs[activs.length - 1])] ==
          1
        ) {
          corrects += 1;
          console.log(
            `Correct! ${index}, label=${batch[index].expectedOutputs.indexOf(
              1
            )}`
          );
        }
      },
      (params) => {
        params["returnValue"] = corrects / batch.length;
      }
    ) as Promise<number>;
  }
}
