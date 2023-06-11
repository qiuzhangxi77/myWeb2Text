import tensorflow as tf
from tensorflow import variable_scope, convert_to_tensor

from config import Config

# 全局变量
EDGE_VARIABLES  = 'edge_variables'
UNARY_VARIABLES = 'unary_variables'

# 激活函数
relu = tf.nn.relu

# unary 构建block卷积层
# x 输入
# is_training 训练模式
# conv_weight_decay 权重衰减
# feature_counts 特征通道数
# ksizes 卷积核大小
# conv_weight_stddev 权重标准差
# dropout_keep_prob 激活函数列表 activations 和 dropout 的保留比例
def unary(x, is_training,
          conv_weight_decay  = 0.0004,
          feature_counts     = [50, 50, 50, 10],
          ksizes             = [1, 1, 3, 3],
          conv_weight_stddev = 0.1,
          activations        = [relu] * 4,
          dropout_keep_prob  = 0.5):

  c = Config()
  c['is_training']         = convert_to_tensor(is_training,
                                               dtype = 'bool',
                                               name  = 'is_training')
  c['stride']              = 1
  c['variable_collection'] = UNARY_VARIABLES
  c['conv_weight_decay']   = conv_weight_decay
  c['conv_padding']        = "SAME"
  c['conv_weight_stddev']  = conv_weight_stddev
  c['dropout_keep_prob']   = dropout_keep_prob if is_training else 1.0

  n_layers = len(ksizes)
  assert n_layers == len(feature_counts)
  assert n_layers == len(activations)

  with variable_scope("unary"):
    for i in range(n_layers):
      with variable_scope("layer_%d" % (i+1)):
        c['ksize']            = ksizes[i]
        c['conv_filters_out'] = feature_counts[i]
        x = conv(x, c)
        x = activations[i](x)

    # 全连接层（logits）进行输出
    with variable_scope("logits"):
      c['ksize']            = ksizes[i]
      c['conv_filters_out'] = 2
      x = conv(x, c)

  return x

# edge 构建edge卷积层
def edge(x, is_training,
         conv_weight_decay  = 0.0004,
         feature_counts     = [50, 50, 50, 10],
         ksizes             = [1, 1, 3, 3],
         conv_weight_stddev = 0.1,
         activations        = [relu] * 4,
         dropout_keep_prob  = 0.5):

  c = Config()
  c['is_training']         = convert_to_tensor(is_training,
                                               dtype = 'bool',
                                               name  = 'is_training')
  c['stride']              = 1
  c['variable_collection'] = EDGE_VARIABLES
  c['conv_weight_decay']   = conv_weight_decay
  c['conv_padding']        = "SAME"
  c['conv_weight_stddev']  = conv_weight_stddev
  c['dropout_keep_prob']   = dropout_keep_prob if is_training else 1.0

  n_layers = len(ksizes)
  assert n_layers == len(feature_counts)
  assert n_layers == len(activations)

  with variable_scope("edge"):
    for i in range(n_layers):
      with variable_scope("layer_%d" % (i+1)):
        c['ksize']            = ksizes[i]
        c['conv_filters_out'] = feature_counts[i]
        x = conv(x, c)
        x = activations[i](x)

    with variable_scope("logits"):
      c['ksize']            = ksizes[i]
      c['conv_filters_out'] = 4
      x = conv(x, c)

  return x

# 损失率
# logits 模型预测结果
# labels 真是表查
def loss(logits, labels):
  # softmax 交叉熵损失函数
  cross_entropy = tf.nn.sparse_softmax_cross_entropy_with_logits(logits=logits, labels=labels)
  cross_entropy_mean = tf.reduce_mean(cross_entropy)

  regularization_losses = tf.get_collection(tf.GraphKeys.REGULARIZATION_LOSSES)

  # 交叉熵损失 + 正则化损失
  loss_ = tf.add_n([cross_entropy_mean] + regularization_losses)
  tf.summary.scalar('loss', loss_)

  return loss_

# 创建变量并添加到变量集合中
def _get_variable(name,
                  shape,
                  initializer,
                  collection   = None,
                  weight_decay = 0.0,
                  dtype        = 'float',
                  trainable    = True):
  "Source: https://github.com/ry/tensorflow-resnet/blob/master/resnet.py"

  if weight_decay > 0.0:
      regularizer = tf.contrib.layers.l2_regularizer(weight_decay)
  else:
      regularizer = None

  if collection:
    collections = [tf.GraphKeys.GLOBAL_VARIABLES, collection]
  else:
    collections = [tf.GraphKeys.GLOBAL_VARIABLES]

  return tf.get_variable(name,
                         shape       = shape,
                         initializer = initializer,
                         dtype       = dtype,
                         regularizer = regularizer,
                         collections = collections,
                         trainable   = trainable)

# 卷积操作
def conv(x, c):
  ksize               = c['ksize']
  stride              = c['stride']
  filters_out         = c['conv_filters_out']
  variable_collection = c['variable_collection']
  weight_decay        = c['conv_weight_decay']
  padding             = c['conv_padding']
  weight_stddev       = c['conv_weight_stddev']

  filters_in  = x.get_shape()[-1]
  shape       = [ksize, 1, filters_in, filters_out]
  initializer = tf.truncated_normal_initializer(stddev = weight_stddev)

  weights = _get_variable('weights',
                          shape        = shape,
                          collection   = variable_collection,
                          dtype        = 'float',
                          initializer  = initializer,
                          weight_decay = weight_decay)
  weights = tf.nn.dropout(weights, c['dropout_keep_prob'])

  bias    = _get_variable('bias', [filters_out],
                          initializer  = tf.zeros_initializer)

  return tf.nn.conv2d(x, weights, [1, stride, 1, 1], padding = padding) + bias

