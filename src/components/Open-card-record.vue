<template>
  <div class="record-container" id="record">
    <!-- <h3>开卡记录</h3> -->
    <p>已开卡成功总人数</p>
    <p style="font-size: 18px;">{{peopleTotal}}</p>
    <div class="record-top">
      <el-form :inline="true" class="demo-form-inline">
        <el-form-item label="手机号：">
          <el-input v-model="phoneNumber" placeholder="请输入手机号" clearable></el-input>
        </el-form-item>
        <el-form-item label="开始时间：">
          <el-date-picker v-model="startTime" type="date" placeholder="请选择开始时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="结束时间：">
          <el-date-picker v-model="endTime" type="date" placeholder="请选择结束时间"></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button style="margin-left: 50px;" type="primary" @click="getAgentCardList">查询</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div style="text-align: left;">
      <p>总共 {{total}} 条记录</p>
    </div>
    <div class="dialog-main" v-if="agentCardList.length == 0">
      <p>{{agentCardListMsg}}</p>
    </div>
    <div v-else>
      <table v-for="(item,index) in list" :key="index" style="margin-top: 10px;">
        <tr>
          <td>
            <span>手机号：{{item.phoneNumber}}</span>
            <button class="tag-read" :data-clipboard-text="item.phoneNumber" @click="copyBankAccount"></button>
          </td>
          <td style="text-align: left;">
            <p>姓名：{{item.name}}</p>
            <p>身份证号: {{item.idCard}}</p>
            <p>开卡日期：{{shellDate(item.createTime)}}</p>
          </td>
          <td>
            <el-tooltip class="item" effect="light" content="查看记录详情" placement="top-end">
              <img src="../assets/imgs/details.png" style="cursor:pointer;" @click="recordDetailsClick(item)" />
            </el-tooltip>
            <el-dialog title="记录详情" :visible.sync="dialogRecordDetailsVisible" center :modal-append-to-body="false">
              <div style="width: 70%;margin: 0 auto;">
                <p>
                  <span>姓名：</span>
                  <span>{{recordDetails.name}}</span>
                </p>
                <div>
                  <p>
                    <span>身份证号：</span>
                    <span>{{recordDetails.idCard}}</span>
                  </p>
                  <p>
                    <span>手机号：</span>
                    <span>{{recordDetails.phoneNumber}}</span>
                  </p>
                  <p>
                    <span>开卡日期：</span>
                    <span>{{recordDetails.createTime}}</span>
                  </p>
                </div>
                <div>
                  <p>
                    <span>上级代理手机号：</span>
                    <span>{{recordDetails.superPhoneNumber == '' ? '无' : recordDetails.superPhoneNumber}}</span>
                  </p>
                  <p>
                    <span>一级代理人数：</span>
                    <span>{{recordDetails.firstAgentTotal + '人'}}</span>
                  </p>
                  <p>
                    <span>二级代理人数：</span>
                    <span>{{recordDetails.secondAgentTotal + '人'}}</span>
                  </p>
                  <p>
                    <span>三级代理人数：</span>
                    <span>{{recordDetails.thirdAgentTotal + '人'}}</span>
                  </p>
                  <p>
                    <span>四级代理人数：</span>
                    <span>{{recordDetails.fourthAgentTotal + '人'}}</span>
                  </p>
                  <p>
                    <span>五级代理人数：</span>
                    <span>{{recordDetails.fifthAgentTotal + '人'}}</span>
                  </p>
                </div>
              </div>
              <div slot="footer">
                <el-button @click="dialogRecordDetailsVisible = false">取 消</el-button>
                <el-button type="primary" @click="dialogRecordDetailsVisible = false">确 定</el-button>
              </div>
            </el-dialog>
          </td>
        </tr>
      </table>
      <div style="width: 100%;height: 50px;">
        <div style="margin:15px 0;position:absolute;right:6%;">
          <el-pagination @current-change="handleCurrentChange" :current-page="page"
            layout="total, prev, pager, next, jumper" :total="total">
          </el-pagination>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import Clipboard from 'clipboard';
  export default {
    data() {
      return {
        agentCardListMsg: '数据加载中...',
        agentCardList: [],
        peopleTotal: 0,
        list: [],
        total: 0,
        page: 1,
        pageNum: 10,
        phoneNumber: '',
        startTime: '',
        endTime: '',
        recordDetails: {},
        dialogRecordDetailsVisible: false,

      }
    },
    created() {
      this.getAgentCardList();
    },
    methods: {
      // 获取未审核记录
      getAgentCardList() {
        this.agentCardListMsg = '数据加载中...';
        this.$axios.post(this.$store.state.baseUrl + '/agentCardList?java', {
          phoneNumber: this.phoneNumber,
          startTime: this.shellDate(this.startTime),
          endTime: this.shellDate(this.endTime)
        }).then(res => {
          console.log('获取未审核开卡记录');
          console.log(res);
          this.peopleTotal = res.data.total;
          this.agentCardList = res.data.list;
          if (this.agentCardList.length == 0) {
            this.agentCardListMsg = '啊哦~暂无数据';
          };
          this.getList();
        }).catch(err => {
          console.log(err);
        })
      },
      // 复制手机号
      copyBankAccount() {
        let clipboard = new Clipboard('.tag-read')
        clipboard.on('success', e => {
          this.$message.success({
            message: '复制成功',
            showClose: true,
            duration: 2000
          });
          console.log('复制成功', e)
          // 释放内存
          clipboard.destroy()
        })
        clipboard.on('error', e => {
          // 不支持复制
          this.$message.error({
            message: '复制失败，该浏览器不支持自动复制',
            showClose: true,
            duration: 2000
          });
          console.log('该浏览器不支持自动复制', e)
          // 释放内存
          clipboard.destroy()
        })
      },
      // 查看记录详情
      recordDetailsClick(item) {
        this.recordDetails = item;
        console.log(this.recordDetails);
        this.dialogRecordDetailsVisible = true;
      },
      // 分页处理数据
      getList() {
        console.log('分页数据');
        this.total = this.agentCardList.length;
        // es6过滤得到满足搜索条件的展示数据list
        this.list = this.agentCardList.filter((item, index) =>
          index < this.page * this.pageNum && index >= this.pageNum * (this.page - 1)
        );
        console.log(this.list);
      },
      // 分页
      handleCurrentChange(val) {
        console.log(`当前页: ${val}`);
        this.page = val;
        this.getList();
        (function smoothscroll() {
          let currentScroll =
            document.documentElement.scrollTop || document.body.scrollTop;
          if (currentScroll > 0) {
            window.requestAnimationFrame(smoothscroll);
            window.scrollTo(0, currentScroll - currentScroll / 5);
          }
        })();
      },
    },
  }
</script>

<style lang="scss" scoped>
  .record-container {
    width: 92%;
    margin: 0 auto;
    padding: 30px;
    background-color: #fff;
    border-radius: 30px;

    .record-top {
      display: flex;
      justify-content: space-between;
    }

    .tag-read {
      width: 20px;
      height: 20px;
      margin-left: 5px;
      border: 0;
      background: url('../assets/imgs/copy.png') no-repeat;
      background-size: cover;
      cursor: pointer;
    }

    .dialog-main {
      text-align: center;
    }

    td {
      height: 60px;
      margin: 10px 0;
      padding: 10px 0;
      background-color: #f3fbf9;
      font-size: 15px;
      text-align: center;
    }

    table {
      width: 100%;
      table-layout: fixed;
      border-collapse: separate;
      border-spacing: 0;

      tr {

        th,
        td {
          width: 50%;
          text-align: center;
          border: 0;
        }
      }
    }
  }
</style>
<style lang="scss">
  #record {
    .el-button {
      width: 100px;
      height: 36px;
      border-radius: 6px;
      font-size: 13px;
    }

    .el-input__inner {
      height: 35px;
      border-radius: 5px;
    }
  }
</style>