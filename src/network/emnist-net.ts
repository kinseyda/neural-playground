import EmnistImage from "@/data/emnist-image";
import { feed, Network, train, TrainingExample } from "./network";
import { formatTimeString } from "@/format";
import { longForLoop } from "@/long-loop";

function oneHotOutput(outputClass: number): number[] {
  const out = [];
  for (let i = 0; i < 47; i++) {
    out.push(i == outputClass ? 1 : 0);
  }
  return out;
}

export function getHottest(arr: number[]) {
  return arr.indexOf(Math.max(...arr));
}

export class EmnistNet extends Network {
  emnist: EmnistImage[] | undefined;
  testEmnist: EmnistImage[] | undefined;

  constructor() {
    super([784, 16, 16, 10], 1);
    this.emnist = undefined;
  }

  loadEmnist() {
    import("@/data/digits_train_data.json").then(({ default: module }) => {
      this.emnist = module as EmnistImage[];
    });
    import("@/data/digits_test_data.json").then(({ default: module }) => {
      this.testEmnist = module as EmnistImage[];
    });
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
    return train(this.generateMiniBatch(n), this);
  }
  async getPredictedAccuracy(size: number): Promise<number> {
    const batch = this.generateMiniBatch(size, true);
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
  generateMiniBatch(size: number, test?: boolean): TrainingExample[] {
    const result: TrainingExample[] = [];
    const indexes: number[] = [];
    let superSet = this.emnist;
    if (test) {
      superSet = this.testEmnist;
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
          expectedOutputs: oneHotOutput(superSet[x].label),
        });
      }
    }
    return result;
  }
}
