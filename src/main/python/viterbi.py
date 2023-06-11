import numpy as np

def softmax(x):
  x = np.exp(x - np.max(x, axis=-1, keepdims=True))
  x /= np.sum(x, axis=-1, keepdims=True)
  return x

# 维特比算法，用于在条件随机场中进行序列标注的解码过程。
# 输入：unary（一元特征）和 pairs（二元特征）
# unary（一元特征）：n x 2 的数组， 表示每个位置的一元特征得分；
# pairs（二元特征）： (n-1) x 4 的数组，表示相邻位置的二元特征得分。
# 通过动态规划dp的方式，从序列的最后一个位置开始，逐步向前计算最优路径。
# 算法的核心是维护两个数组 P 和 C。
# 其中，P 是一个大小为 n x 2 的数组，用于保存每个位置上的最大概率值；
# C 是一个大小为 n x 2 的数组，用于保存每个位置上的最优选择。

# step:
# 1. 对一元特征和二元特征进行 softmax 归一化，将得分转换为概率。
# 2. 初始化数组 P 和 C，其中 P[n-1,:] 存储最后一个位置的概率，初始化为 unary[n-1,:] 的对数概率。
# 3. 从倒数第二个位置开始，逐个位置向前计算。对于每个位置 i：
#    - 获取 pairs[i,:] 的四个对数概率值 t00, t01, t10, t11，以及 unary[i,:] 的对数概率值 p0, p1。
#    - 计算两个选择的概率 pc0 和 pc1：
#      - pc0[0] = lam * t00 + P[i+1,0]，pc0[1] = lam * t01 + P[i+1,1]
#      - pc1[0] = lam * t10 + P[i+1,0]，pc1[1] = lam * t11 + P[i+1,1]
#    - 选择 pc0 和 pc1 中概率较大的索引作为下一个位置的选择：C[i,:] = (argmax(pc0), argmax(pc1))
#    - 计算当前位置的最大概率值：P[i,:] = (p0 + max(pc0), p1 + max(pc1))
# 4. 初始化结果数组 res，将第一个位置的最大概率值的索引作为初始标签：res[0] = argmax(P[0,:])。
# 5. 从第二个位置开始，根据 C 数组中保存的选择，依次获取下一个位置的标签：res[i] = C[i, res[i-1]]。
# 6. 返回结果数组 res，即为序列的最优标注结果。

def viterbi(unary, pairs, lam=1.0):
  # input: logits (n x 2 for unary and n-1 x 4 for pairs)

  unary = softmax(unary)
  pairs = softmax(pairs)

  n = unary.shape[0]
  P = np.zeros((n,2))
  C = np.zeros((n,2), dtype=np.int32)

  P[n-1,:] = np.log(unary[n-1,:]) # p(0), p(1)
  for i in range(n-2,-1,-1):
    t00, t01, t10, t11 = np.log(pairs[i,:])
    p0, p1             = np.log(unary[i,:])

    pc0 = [lam*t00 + P[i+1,0], lam*t01 + P[i+1,1]]
    pc1 = [lam*t10 + P[i+1,0], lam*t11 + P[i+1,1]]

    C[i,:] = (np.argmax(pc0), np.argmax(pc1)) # choices for the next one
    P[i,:] = (p0+np.max(pc0), p1+np.max(pc1)) # log probability

  res = np.zeros(n, dtype=np.int32)
  res[0] = np.argmax(P[0,:])
  next = C[0,res[0]]
  for i in range(1,n):
    res[i] = next
    next = C[i,next]
  return res

if __name__ == "__main__":
  # test
  unary = np.array([[1,1],[1,1]])
  pairwise = np.array([[2,1,0.6,0.1]])
  print(viterbi(unary, pairwise, lam=1))
