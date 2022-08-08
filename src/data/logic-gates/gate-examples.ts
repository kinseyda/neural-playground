import { numToBinList } from "@/network/helpers";
import { TrainingExample } from "@/network/network";

export interface GateExample {
  name?: string;
  inputSize: number;
  outputSize: number;
  data: TrainingExample[];
}

/**
 * Note that data must be in appropriate input order to compare correctly (since order matters when comparing objects)
 */
export const examples: GateExample[] = [
  {
    name: "Wire",
    inputSize: 1,
    outputSize: 1,
    data: [
      { inputs: [0], expectedOutputs: [0] },
      { inputs: [1], expectedOutputs: [1] },
    ],
  },
  {
    name: "NOT (inverter)",
    inputSize: 1,
    outputSize: 1,
    data: [
      { inputs: [0], expectedOutputs: [1] },
      { inputs: [1], expectedOutputs: [0] },
    ],
  },
  {
    name: "AND",
    inputSize: 2,
    outputSize: 1,
    data: [
      { inputs: [0, 0], expectedOutputs: [0] },
      { inputs: [0, 1], expectedOutputs: [0] },
      { inputs: [1, 0], expectedOutputs: [0] },
      { inputs: [1, 1], expectedOutputs: [1] },
    ],
  },
  {
    name: "NAND",
    inputSize: 2,
    outputSize: 1,
    data: [
      { inputs: [0, 0], expectedOutputs: [1] },
      { inputs: [0, 1], expectedOutputs: [1] },
      { inputs: [1, 0], expectedOutputs: [1] },
      { inputs: [1, 1], expectedOutputs: [0] },
    ],
  },
  {
    name: "OR",
    inputSize: 2,
    outputSize: 1,
    data: [
      { inputs: [0, 0], expectedOutputs: [0] },
      { inputs: [0, 1], expectedOutputs: [1] },
      { inputs: [1, 0], expectedOutputs: [1] },
      { inputs: [1, 1], expectedOutputs: [0] },
    ],
  },
  {
    name: "NOR",
    inputSize: 2,
    outputSize: 1,
    data: [
      { inputs: [0, 0], expectedOutputs: [1] },
      { inputs: [0, 1], expectedOutputs: [0] },
      { inputs: [1, 0], expectedOutputs: [0] },
      { inputs: [1, 1], expectedOutputs: [0] },
    ],
  },
  {
    name: "XOR",
    inputSize: 2,
    outputSize: 1,
    data: [
      { inputs: [0, 0], expectedOutputs: [0] },
      { inputs: [0, 1], expectedOutputs: [1] },
      { inputs: [1, 0], expectedOutputs: [1] },
      { inputs: [1, 1], expectedOutputs: [0] },
    ],
  },
  {
    name: "XNOR",
    inputSize: 2,
    outputSize: 1,
    data: [
      { inputs: [0, 0], expectedOutputs: [1] },
      { inputs: [0, 1], expectedOutputs: [0] },
      { inputs: [1, 0], expectedOutputs: [0] },
      { inputs: [1, 1], expectedOutputs: [1] },
    ],
  },
  {
    name: "Half Adder (Carry, Sum)",
    inputSize: 2,
    outputSize: 2,
    data: [
      { inputs: [0, 0], expectedOutputs: [0, 0] },
      { inputs: [0, 1], expectedOutputs: [0, 1] },
      { inputs: [1, 0], expectedOutputs: [0, 1] },
      { inputs: [1, 1], expectedOutputs: [1, 0] },
    ],
  },
  {
    name: "Full Adder (Carry, Sum)",
    inputSize: 3,
    outputSize: 2,
    data: [
      { inputs: numToBinList(0, 3), expectedOutputs: [0, 0] },
      { inputs: numToBinList(1, 3), expectedOutputs: [0, 1] },
      { inputs: numToBinList(2, 3), expectedOutputs: [0, 1] },
      { inputs: numToBinList(3, 3), expectedOutputs: [1, 0] },
      { inputs: numToBinList(4, 3), expectedOutputs: [0, 1] },
      { inputs: numToBinList(5, 3), expectedOutputs: [1, 0] },
      { inputs: numToBinList(6, 3), expectedOutputs: [1, 0] },
      { inputs: numToBinList(7, 3), expectedOutputs: [1, 1] },
    ],
  },
];
