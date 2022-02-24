<template>
  <div class="audit-container" id="audit">
    <!-- <h3>开卡审核</h3> -->
    <!-- <p>已开卡成功总人数</p>
    <p style="font-size: 18px;">{{peopleTotal}}</p> -->
    <div class="dialog-main" v-if="unAuditCardList.length == 0">
      <p>{{auditListMsg}}</p>
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
            <el-button type="success" @click="passClick(item.id)">通过</el-button>
            <el-dialog title="开卡审核" :visible.sync="dialogPassVisible" :modal-append-to-body="false" center>
              <el-form label-width="100px">
                <el-form-item label="佣金金额：">
                  <el-input v-model="money" style="width: 60%;" clearable></el-input>
                </el-form-item>
              </el-form>
              <div slot="footer">
                <el-button @click="dialogPassVisible = false">取 消</el-button>
                <el-button type="primary" @click="passClickSure">确 定</el-button>
              </div>
            </el-dialog>
            <el-button style="margin-left: 10%;" type="danger" @click="refuseClick(item.id)">拒绝</el-button>
            <el-dialog title="开卡审核" :visible.sync="dialogRefuseVisible" :modal-append-to-body="false" center>
              <div class="dialog-main">
                <p>确定拒绝？确定后不可更改</p>
              </div>
              <div slot="footer">
                <el-button @click="dialogRefuseVisible = false">取 消</el-button>
                <el-button type="primary" @click="refuseClickSure">确 定</el-button>
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
        auditListMsg: '数据加载中...',
        unAuditCardList: [],
        peopleTotal: 0,
        list: [],
        total: 0,
        page: 1,
        pageNum: 10,
        dialogPassVisible: false,
        recordId: '',
        money: '',
        dialogRefuseVisible: false,
        deleteId: '',

      }
    },
    created() {
      this.getUnAuditCardList();
    },
    methods: {
      // 获取未审核记录
      getUnAuditCardList() {
        this.auditListMsg = '数据加载中...';
        this.$axios.post(this.$store.state.baseUrl + '/unAuditCardList?java').then(res => {
          console.log('获取未审核开卡记录');
          console.log(res);
          this.peopleTotal = res.data.total;
          this.unAuditCardList = res.data.list;
          if (this.unAuditCardList.length == 0) {
            this.auditListMsg = '啊哦~暂无数据';
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
      // 审核通过
      passClick(id) {
        this.recordId = id;
        this.money = '';
        this.dialogPassVisible = true;
      },
      // 确定通过
      passClickSure() {
        if (this.money == '') {
          this.$message.error({
            message: '佣金金额不能为空，请输入',
            showClose: true,
            duration: 2000
          })
        } else {
          this.$axios.post(this.$store.state.baseUrl + '/auditCard?java', {
            id: this.recordId,
            flag: 1,
            money: this.money
          }).then(res => {
            console.log('审核通过');
            console.log(res);
            this.dialogPassVisible = false;
            this.$message.success({
              message: '审核结果提交成功',
              showClose: true,
              duration: 2000
            });
            this.getUnAuditCardList();
          }).catch(err => {
            console.log(err);
            this.dialogPassVisible = false;
            this.$message.error({
              message: '审核结果提交失败',
              showClose: true,
              duration: 2000
            });
          })
        }

      },
      // 拒绝
      refuseClick(id) {
        this.deleteId = id;
        this.dialogRefuseVisible = true;
      },
      // 确定拒绝
      refuseClickSure() {
        this.$axios.post(this.$store.state.baseUrl + '/auditCard?java', {
          id: this.deleteId,
          flag: 0,
        }).then(res => {
          console.log('审核拒绝');
          console.log(res);
          this.dialogRefuseVisible = false;
          this.$message.success({
            message: '审核结果提交成功',
            showClose: true,
            duration: 2000
          });
          this.getUnAuditCardList();
        }).catch(err => {
          console.log(err);
          this.dialogRefuseVisible = false;
          this.$message.error({
            message: '审核结果提交失败',
            showClose: true,
            duration: 2000
          });
        })
      },
      // 分页处理数据
      getList() {
        console.log('分页数据');
        this.total = this.unAuditCardList.length;
        // es6过滤得到满足搜索条件的展示数据list
        this.list = this.unAuditCardList.filter((item, index) =>
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
  .audit-container {
    width: 92%;
    margin: 0 auto;
    padding: 30px;
    background-color: #fff;
    border-radius: 30px;

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
          width: 33%;
          text-align: center;
          border: 0;
        }
      }
    }
  }
</style>
<style lang="scss">
  #audit {
    .el-button {
      width: 80px;
      height: 36px;
      border-radius: 6px;
      font-size: 13px;
    }
  }
</style>