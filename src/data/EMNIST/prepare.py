import random as r
import json

# Adapted from https://visualstudiomagazine.com/articles/2022/02/01/preparing-mnist-image-data-text-files.aspx


def convert(img_file, label_file, mapping_file, txt_file, n_images):
    print("\nOpening binary pixels and labels files ")
    lbl_f = open(label_file, "rb")   # labels (digits / letters)
    img_f = open(img_file, "rb")     # pixel values
    print("Opening destination text file ")
    txt_f = open(txt_file, "w")      # output to write to

    print("Discarding binary pixel and label headers ")
    img_f.read(16)   # discard header info
    lbl_f.read(8)    # discard header info

    md = mapping_dict(mapping_file)  # mapping of labels to ascii

    print("\nReading binary files, writing to text file ")
    print("Format: 784 pixels then labels, tab delimited ")
    images = []
    for i in range(n_images):   # number requested
        try:
            image_dict = {}
            image_dict['label'] = ord(lbl_f.read(1))  # Unicode, one byte
            image_dict['ascii'] = md[image_dict['label']]
            image_dict['data'] = []
            for _ in range(784):  # get 784 pixel vals
                val = ord(img_f.read(1))
                image_dict['data'].append(val)
            images.append(image_dict)
        except TypeError:
            print("Ran out of bytes at image %d" % i)
            break
    txt_f.write(json.dumps(images))
    img_f.close()
    txt_f.close()
    lbl_f.close()
    print("\nDone ")


def mapping_dict(mapping_file):
    m_f = open(mapping_file, "r")
    dict = {}
    for line in m_f:
        sp = line.split()
        dict[int(sp[0])] = chr(int(sp[1]))
    return dict


def main():
    n_images = 112800
    # n_images = 1000\
    print("\nCreating %d MNIST train images from binary files "
          % n_images)
    convert("./emnist-balanced-train-images-idx3-ubyte",
            "./emnist-balanced-train-labels-idx1-ubyte",
            './emnist-balanced-mapping.txt',
            "mnist_train_n.json", n_images)


if __name__ == "__main__":
    main()
