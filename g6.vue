<template>
  <!-- 拖拽生成拓扑 -->
  <div class="page">
    <!-- 节点面板 -->
    <div class="left">
      <div class="node_panel">
        <div v-for="item in nodeList" :key="item.id" class="node_li">
          <div
            :class="['item_shape', item.id]"
            draggable="true"
            @dragend="addNode(item, $event)"
          />
          <div>{{ item.name }}</div>
        </div>
      </div>
    </div>

    <!-- 画板 -->
    <div class="mid">
      <div id="graph" ref="graphRef" />
    </div>

    <div class="right">
      <el-card class="box-card">
        <div class="propAree">
          <div class="header">
            <el-button key="primary" type="primary" text @click="openEdgeDialog"
              >添加连线</el-button
            >
            <p>左键点击节点可生成连线</p>
            <p>右键点击节点可编辑节点信息</p>
            <p>左键点击边可以编辑连线</p>
          </div>
        </div>
      </el-card>
    </div>
    <el-dialog v-model="addNodeVisible" title="连线" width="30%" center>
      <el-form :model="activeNode" @submit.prevent class="demo-form-inline">
        <el-form-item label="节点ID">
          <el-input
            v-model="activeNode.id"
            placeholder="Approved by"
            clearable
          />
        </el-form-item>
        <el-form-item label="设备名称">
          <el-input
            v-model="activeNode.label"
            placeholder="Approved by"
            clearable
          />
        </el-form-item>

        <el-form-item label="设备IP">
          <el-input
            v-model="formInline.user"
            placeholder="Approved by"
            clearable
          />
        </el-form-item>
        <el-form-item class="submit">
          <el-button type="primary" @click="onSubmit">更新</el-button>
          <el-button type="primary" @click="onDelete">移除</el-button>
          <el-button type="primary" @click="addNodeVisible = false"
            >关闭</el-button
          >
        </el-form-item>
      </el-form>
    </el-dialog>
    <!-- //添加连线弹窗 -->
    <el-dialog v-model="addEdgeVisible" title="节点" width="30%" center>
      <el-form-item label="开始节点" v-model="addEdgeForm">
        <el-select
          v-model="addEdgeForm.startNode"
          placeholder="请选择开始节点"
          clearable
        >
          <el-option
            v-for="item in allNodes"
            :key="item._cfg.model.id"
            :label="item._cfg.model.label"
            :value="item._cfg.model.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="结束节点">
        <el-select
          v-model="addEdgeForm.endNode"
          placeholder="请选择结束节点"
          clearable
        >
          <el-option
            v-for="item in allNodes"
            :key="item._cfg.model.id"
            :label="item._cfg.model.label"
            :value="item._cfg.model.id"
          />
        </el-select>
      </el-form-item>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="addEdges">创建</el-button>
          <el-button type="primary" @click="addEdges">新增</el-button>
          <el-button type="primary" @click="deleteEdges">移除</el-button>
          <el-button @click="closeEdgeDialog">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import G6 from "@antv/g6";

defineOptions({
  name: "topo"
});

const graphRef = ref(null); // 画布元素

const graph = ref(null); // 画布实例

const allNodes = ref([]); //所有节点

const addEdgeVisible = ref(false);
const activeEdge = ref(null);
const addEdgeForm = reactive({
  startNode: "",
  endNode: ""
});

const addNodeVisible = ref(false); //节点弹窗
const activeNode = ref({}); //当前被选中的节点

// 数据
const graphData = {
  // 点集
  nodes: [],
  // 边集
  edges: []
};

// 初始化画布
function initGraph() {
  G6.registerEdge(
    "circle-running",
    {
      afterDraw(cfg, group) {
        // 获得当前边的第一个图形，这里是边本身的 path
        const shape = group.get("children")[0];
        // 边 path 的起点位置
        const startPoint = shape.getPoint(0);

        // 添加红色 circle 图形
        const circle = group.addShape("circle", {
          attrs: {
            x: startPoint.x,
            y: startPoint.y,
            fill: "red",
            r: 3
          },
          // must be assigned in G6 3.3 and later versions. it can be any value you want
          name: "circle-shape"
        });

        // 对红色圆点添加动画
        circle.animate(
          ratio => {
            // 每一帧的操作，入参 ratio：这一帧的比例值（Number）。返回值：这一帧需要变化的参数集（Object）。
            // 根据比例值，获得在边 path 上对应比例的位置。
            const tmpPoint = shape.getPoint(ratio);
            // 返回需要变化的参数集，这里返回了位置 x 和 y
            return {
              x: tmpPoint.x,
              y: tmpPoint.y
            };
          },
          {
            repeat: true, // 动画重复
            duration: 3000
          }
        ); // 一次动画的时间长度
      }
    },
    "cubic"
  ); // 该自定义边继承内置三阶贝塞尔曲线 cubic

  console.log(graphRef.value);
  graph.value = new G6.Graph({
    container: graphRef.value,
    width: graphRef.value.clientWidth,
    height: graphRef.value.clientHeight,
    modes: {
      default: ["drag-node", "create-edge"] //, "create-edge"  创建连线 drag-node 节点拖动
    },
    defaultEdge: {
      type: "circle-running", // 使用自定义边的类型
      style: {
        endArrow: true,
        stroke: "#14e71e",
        // 使用数组指定虚线样式
        // lineDash: [5, 10],
        lineWidth: 1
      }
    }
  });

  //当连线创建之后
  graph.value.on("aftercreateedge", e => {
    console.log(e.edge);
    // 获取边的图形
    // const shape = e.edge.get("keyShape");

    // 获取边的总长度
    // const length = shape.getTotalLength();

    // // 调用动画方法
    // shape.animate(
    //   ratio => {
    //     // ratio 是当前动画进度，范围 [0, 1]
    //     // 返回每一帧需要变化的参数集
    //     const startLen = ratio * length;
    //     return {
    //       lineDash: [startLen, length - startLen]
    //     };
    //   },
    //   {
    //     repeat: true, // 是否重复播放
    //     duration: 2000, // 动画时长
    //     easing: "easeQuadInOut" // 动画函数
    //   }
    // );
  });

  //鼠标点击左键
  // graph.value.on("node:click", function (evt) {});

  //鼠标点击右键
  graph.value.on("node:contextmenu", function (evt) {
    //当前节点定位
    //当前节点数据信息
    //获取当前节点数据信息
    activeNode.value = evt.item._cfg.model;
    addNodeVisible.value = true;
    console.log("鼠标点击右键", evt);
  });

  // 监听连线的单击事件
  graph.value.on("edge:click", e => {
    // 获取当前点击的连线
    const edge = e.item;
    // // 获取当前点击的图形
    // const shape = e.target;
    // // 执行一些操作，例如弹出对话框显示连线信息
    // console.log(`你点击了连线 ${edge} ${shape}`);
    activeEdge.value = edge;
    addEdgeForm.startNode = edge._cfg.model.sourceNode._cfg.id;
    addEdgeForm.endNode = edge._cfg.model.targetNode._cfg.id;
    openEdgeDialog();
  });

  graph.value.data(graphData);
  graph.value.render();
}

import jiaohuanji from "@/assets/images/topo/交换机3.png";
import luyouqi from "@/assets/images/topo/路由器.png";
import fuwuqi from "@/assets/images/topo/服务器.png";
import zhuji from "@/assets/images/topo/主机.png";
import fanghuoqiang from "@/assets/images/topo/Firewalld2.png";

// 节点列表
const nodeList = [
  {
    id: "jiaohuanji",
    name: "交换机",
    imgPath: jiaohuanji,
    type: "image"
  },
  {
    id: "luyouqi",
    name: "路由器",
    imgPath: luyouqi,
    type: "image"
  },
  {
    id: "fuwuqi",
    name: "服务器",
    imgPath: fuwuqi,
    type: "image"
  },
  {
    id: "zhuji",
    name: "主机",
    imgPath: zhuji,
    type: "image"
  },
  {
    id: "fanghuoqiang",
    name: "防火墙",
    imgPath: fanghuoqiang,
    type: "image"
  }
];

// // 添加节点
function addNode(type, e) {
  // 将屏幕/页面坐标转换为渲染坐标
  const point = graph.value.getPointByClient(e.x, e.y);

  // 新创建的节点信息
  const model = {
    id: "node" + Math.random(), // id使用了随机数，尽可能避免重复
    label: type.name, // 文本标签
    type: type.type, // 图片类型的节点
    x: point.x,
    y: point.y,
    size: 48,
    img: type.imgPath
  };

  graph.value.addItem("node", model, false);
}

onMounted(() => {
  initGraph();
});

const formInline = reactive({
  user: "",
  region: "",
  date: ""
});

//拓扑图资源类型
const typeOptions = ref([]);

//更新节点信息
const onSubmit = () => {
  // 获取要更新的节点
  const node = graph.value.findById(activeNode.value.id);
  // 更新节点的样式和文本
  graph.value.updateItem(node, {
    label: activeNode.value.label
  });

  addNodeVisible.value = false;
};

//删除节点
const onDelete = () => {
  const msg = confirm("确定吗？亲~~");
  if (msg == true) {
    // 获取要删除的节点
    const item = graph.value.findById(activeNode.value.id);
    // 删除节点
    graph.value.removeItem(item);
    addNodeVisible.value = false;
  }
};

//打开添加 连线弹窗
const openEdgeDialog = () => {
  //获取所有节点
  allNodes.value = [];
  allNodes.value = graph.value.getNodes();
  addEdgeVisible.value = true;
};

//关闭添加连线弹窗
const closeEdgeDialog = () => {
  addEdgeVisible.value = false;
};

//添加连线
const addEdges = () => {
  console.log("addEdgeForm", addEdgeForm);
  // 获取要连接的两个节点
  const source = graph.value.findById(addEdgeForm.startNode);
  const target = graph.value.findById(addEdgeForm.endNode);
  // 创建连线
  graph.value.addItem("edge", {
    source: source,
    target: target,
    // 其他配置
    style: {
      endArrow: true,
      stroke: "#14e71e;",
      lineWidth: 1
    }
  });

  //创建成功后清除数据
  addEdgeForm.startNode = "";
  addEdgeForm.endNode = "";
  closeEdgeDialog();
};

//删除连线
const deleteEdges = () => {
  const msg = confirm("确定吗？亲~~");
  if (msg == true) {
    // 获取要删除的连线
    const edge = graph.value.findById(activeEdge.value._cfg.id);
    // 删除连线
    graph.value.removeItem(edge);
    setTimeout(() => {
      addEdgeVisible.value = false;
    }, 500);
  }
};

onMounted(() => {
  initData();

  document.oncontextmenu = function () {
    console.log("右键单击，自定义右键菜单");
    return false;
  };
});
</script>

<style lang="scss" scoped>
.page {
  height: 89vh;
  overflow: hidden;
  position: relative;
  display: flex;
  .left {
    width: 30%;
  }
  .mid {
    width: 40%;
    background-color: #ccc;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .right {
    width: 29%;
    margin-left: 0.5%;
    display: flex;
    justify-content: center;
    .box-card {
      width: 100%;

      .propAree {
        width: 80%;
      }
    }
  }
}

#graph {
  border: 1px solid black;
  width: 800px;
  height: 300px;
}

.node_panel {
  position: absolute;
  left: 10px;
  top: 10px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
  box-sizing: border-box;
  padding: 10px 4px;
  border-radius: 4px;
}

.node_li {
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
  user-select: none;

  &:last-child {
    margin-bottom: 0;
  }
}

.item_shape {
  width: 48px;
  height: 48px;
}

.jiaohuanji {
  background-image: url("@/assets/images/topo/交换机3.png");
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

.fuwuqi {
  background-image: url("@/assets/images/topo/服务器.png");
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

.luyouqi {
  background-image: url("@/assets/images/topo/路由器.png");
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

.fanghuoqiang {
  background-image: url("@/assets/images/topo/Firewalld2.png");
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

.zhuji {
  background-image: url("@/assets/images/topo/主机.png");
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

::v-deep(.el-form-item__label) {
  font-weight: normal;
  width: 120px;
}

::v-deep(.submit .el-form-item__content) {
  justify-content: center;
}

@keyframes ant-line {
  to {
    stroke-dashoffset: -1000;
  }
}
</style>
